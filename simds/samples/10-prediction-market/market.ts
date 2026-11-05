// A prediction market that records an AI forecast before it closes and
// resolves with a separate resolver program after the event. Illustrative.
import { ip, type RequestRuling } from '../00-shared/inference-programs';
declare const FORECAST_IP: any, RESOLVER_IP: any, MARKET_PROGRAM: any, MARKET_TREASURY: any;

const market = { id: 'FOMC-2026-12-10-cut', question: 'Will the FOMC announce a cut to the federal funds target range on December 10, 2026?' };

// 1. Before close: a forecast ruling, stored as a public record.
export async function requestForecast(evidence: { label: string; url: string }[]) {
  const call: Omit<RequestRuling, 'budget'> = {
    program: FORECAST_IP,
    requestPrompt: market.question,
    input: { type: 'forecast', market: market.id },
    externalContext: { entries: evidence.map(e => ({ kind: 'web_page' as const, label: e.label, storage: { link: e.url } })) },
    jury: { evaluators: 5, quorum: 3, assurance: 'L1', distinctFamilies: true },
    maxInputTokens: 6000, maxOutputTokens: 500,
    refundTo: MARKET_TREASURY,
  };
  return ip.requestRuling({ ...call, budget: (await ip.quoteRuling(call)).total });
  // The Ruling records each model's choice and probability (confidence),
  // finalized at a known slot: what independent models expected, before the event.
}

// 2. After the event: a resolution ruling from a different program, whose
//    jury is never shown the forecast.
export async function requestResolution(statementUrl: string) {
  const call: Omit<RequestRuling, 'budget'> = {
    program: RESOLVER_IP,
    requestPrompt: `How does market ${market.id} resolve?`,
    input: { type: 'resolution', market: market.id },
    externalContext: { entries: [{ kind: 'web_page', label: 'FOMC statement', storage: { link: statementUrl } }] },
    jury: { evaluators: 7, quorum: 5, assurance: 'L1', distinctFamilies: true },
    maxInputTokens: 4000, maxOutputTokens: 500,
    refundTo: MARKET_TREASURY,
    callback: { program: MARKET_PROGRAM, events: ['final', 'disputed', 'expired'] },
  };
  return ip.requestRuling({ ...call, budget: (await ip.quoteRuling(call)).total });
  // The market program pays out with read_ruling() after the dispute window,
  // and stops paying if a later challenge overturns the resolution.
}

// 3. Score: any program can read both rulings. A Brier score per model, for example.
export function brier(forecast: { outcome: 'yes' | 'no'; confidence: number }, resolved: 'yes' | 'no') {
  const pYes = forecast.outcome === 'yes' ? forecast.confidence / 100 : 1 - forecast.confidence / 100;
  return (pYes - (resolved === 'yes' ? 1 : 0)) ** 2;
}
