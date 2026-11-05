// An agent tool hook. A System 1 screen answers in well under a second; only
// unclear or larger purchases wait for the full jury (SIMD 2, "Fast
// evaluators"). Illustrative: the screen program and its thresholds are ours.
import { ip, type RequestRuling } from '../00-shared/inference-programs';
declare const SPENDING_SCREEN_IP: any, SPENDING_IP: any, OWNER_WALLET: any;

const FAST_LIMIT_USD = 50;      // the owner's own code-level limit for fast allows
const FAST_CONFIDENCE = 95;     // calibrated probability, as a percentage

export async function beforeToolCall(call: { tool: string; args: any; amountUsd: number }, task: string, vendorUrl?: string) {
  const base: Omit<RequestRuling, 'budget' | 'program' | 'jury'> = {
    requestPrompt: `May the agent make this ${call.tool} call for the owner's task?`,
    input: call,
    externalContext: {
      entries: [
        { kind: 'other', label: 'Owner task', storage: { inline: task } },
        ...(vendorUrl ? [{ kind: 'web_page' as const, label: 'Vendor', storage: { link: vendorUrl } }] : []),
      ],
    },
    maxInputTokens: 3000,
    maxOutputTokens: 400,
    refundTo: OWNER_WALLET,
  };

  // 1. Screen: one yes-or-no question per rule, one fast evaluator.
  const screenCall = { ...base, program: SPENDING_SCREEN_IP, jury: { evaluators: 1, quorum: 1, assurance: 'L0' as const } };
  const screen = await ip.waitForRuling((await ip.requestRuling({ ...screenCall, budget: (await ip.quoteRuling(screenCall)).total })).request);
  if (screen.outcome === 'allow' && screen.certainty.confidenceMin >= FAST_CONFIDENCE && call.amountUsd <= FAST_LIMIT_USD) {
    return 'allow';                       // fast lane, inside a limit enforced here, in code
  }
  if (screen.outcome === 'deny' && screen.certainty.confidenceMin >= FAST_CONFIDENCE) {
    return 'deny';                        // denying is safe to do fast
  }

  // 2. Everything else: the full jury. A less sure screen asks for a bigger one.
  const unsure = screen.certainty.confidenceMin < 70;
  const full = { ...base, program: SPENDING_IP, jury: { evaluators: unsure ? 5 : 3, quorum: unsure ? 4 : 2, assurance: 'L1' as const, distinctFamilies: true } };
  const ruling = await ip.waitForRuling((await ip.requestRuling({ ...full, budget: (await ip.quoteRuling(full)).total })).request, { timeoutMs: 45000 });
  return ruling.status === 'final' ? ruling.outcome : 'ask';   // the program's default
}
