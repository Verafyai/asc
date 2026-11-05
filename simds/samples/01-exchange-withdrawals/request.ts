// The exchange backend asks for a ruling before a large withdrawal.
// Phase 1 of 2: quote, escrow and request. Illustrative; the SDK is planned.
import { ip, inputHash, type RequestRuling } from '../00-shared/inference-programs';
import { HOT_WALLET_PROGRAM, TREASURY, WITHDRAWALS_IP } from './addresses';

export async function requestWithdrawalRuling(w: Withdrawal, ticket?: string) {
  const input = { type: 'withdrawal', id: w.id, to: w.to, amount_usd: w.amountUsd, asset: w.asset };

  const call: Omit<RequestRuling, 'budget'> = {
    program: WITHDRAWALS_IP,
    requestPrompt: `Should withdrawal ${w.id} go out under the withdrawal policy?`,
    input,                                   // the program will recompute this hash
    evidence: {
      account: await loadAccount(w.accountId),           // age, kyc, security changes
      destination: await loadDestination(w.to),          // registered?, hours, prior use
      totals: await loadTotals(),                        // sent today, hot wallet balance
    },
    externalContext: ticket
      ? { entries: [{ kind: 'discussion', label: 'Support ticket', storage: { inline: ticket } }] }
      : undefined,
    jury: { evaluators: 5, quorum: 4, assurance: 'L1', distinctFamilies: true },
    maxInputTokens: 6000,
    maxOutputTokens: 600,
    refundTo: TREASURY,
    callback: { program: HOT_WALLET_PROGRAM, events: ['final', 'needs_funds', 'expired'] },
  };

  const quote = await ip.quoteRuling(call);              // simulated QuoteRuling
  const { request } = await ip.requestRuling({ ...call, budget: quote.total }); // escrowed

  // Phase 2 happens on chain: the hot wallet program pays out only when it can
  // read a final ruling for exactly this input. See withdraw.anchor.rs.
  return { request, inputHash: inputHash(input), quoted: quote.total };
}

type Withdrawal = { id: string; accountId: string; to: string; amountUsd: number; asset: string };
declare function loadAccount(id: string): Promise<unknown>;
declare function loadDestination(to: string): Promise<unknown>;
declare function loadTotals(): Promise<unknown>;
