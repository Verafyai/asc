// The treasury bot asks for a ruling against two internal context entries,
// the constitution's treasury article and the treasury policy, before trading.
import { ip, type RequestRuling } from '../00-shared/inference-programs';
declare const TREASURY_IP: any, TREASURY_PROGRAM: any, TREASURY: any;

export async function proposeTrade(trade: { sell: string; buy: string; usd: number; venue: string; maxSlippageBps: number }, reason: string, market: unknown, holdings: unknown) {
  const call: Omit<RequestRuling, 'budget'> = {
    program: TREASURY_IP,
    requestPrompt: `May the treasury sell ${trade.sell} for ${trade.buy}, $${trade.usd}, on ${trade.venue}?`,
    input: { type: 'treasury_trade', ...trade },
    evidence: { holdings, market },
    externalContext: { entries: [{ kind: 'other', label: "Operator's reason", storage: { inline: reason } }] },
    jury: { evaluators: 5, quorum: 4, assurance: 'L1', distinctFamilies: true },
    maxInputTokens: 3000,
    maxOutputTokens: 600,
    refundTo: TREASURY,
    callback: { program: TREASURY_PROGRAM, events: ['final', 'expired'] },
  };
  const quote = await ip.quoteRuling(call);
  return ip.requestRuling({ ...call, budget: quote.total });
  // On "shrink", the program trades the largest size the policy allows; caps of
  // $2,000,000 per trade and $5,000,000 per day are enforced in its own code.
}
