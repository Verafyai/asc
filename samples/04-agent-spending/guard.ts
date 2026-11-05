// Put the jury in front of an agent's risky tools. Every other tool runs as normal.
// Works with any agent loop that has a before-tool-call hook.
// @verafy/asc is the planned SDK. Illustrative.
import { asc } from '@verafy/asc';

const ASC_ID = process.env.ASC_AGENT_SPENDING_ID!;
const GUARDED = new Set(['purchase', 'pay_invoice', 'start_subscription']);

export function spendingGuard(task: string) {
  return async function beforeToolCall(call: { name: string; input: Record<string, unknown> }) {
    if (!GUARDED.has(call.name)) return { run: true };

    const ruling = await asc.requestRuling({
      asc: ASC_ID,
      jury: { size: 3, quorum: 2, tier: 'fast' },
      action: { type: 'agent_tool_call', tool: call.name, input: call.input },
      evidence: {
        task,                                        // the owner's words, not the agent's summary
        budget: await budget.today(),
        vendor: await vendors.lookup(call.input.vendor as string),
      },
    });

    switch (ruling.outcome) {
      case 'allow': return { run: true, receipt: ruling.id };
      case 'ask':   return { run: false, askOwner: asc.summary(ruling) };
      default:      return { run: false, toolResult: `Blocked by spending rules: ${asc.reasons(ruling)}` };
    }
  };
}
