import type { ContractSpec, EscrowCheck, PayoutLine, Settlement } from "./types";

/**
 * The deterministic escrow. It never reads model text: only the spec and the tallied outcome.
 * Hard caps: even a unanimous swarm cannot pick an unlisted outcome, pay an unlisted party,
 * exceed a leg's cap, exceed maxTotalPayout, or spend more than the escrow holds.
 */
export function settle(spec: ContractSpec, clauseId: string, outcome: string | null, amount: number | null, opts: { quorum: boolean; balance?: number }): Settlement {
  const checks: EscrowCheck[] = [];
  const check = (name: string, ok: boolean, detail?: string) => (checks.push({ name, ok, detail }), ok);
  const clause = spec.judgmentClauses.find((c) => c.id === clauseId);
  if (!check("clause exists in spec", !!clause, clauseId)) return { outcome, status: "rejected", payouts: [], total: 0, checks };
  if (!opts.quorum || outcome === null) {
    check("swarm reached 2/3 quorum", false, `no quorum: nothing moves; default "${spec.defaultOutcome}" applies only at the deadline`);
    return { outcome: null, status: "no-quorum", payouts: [], total: 0, checks };
  }
  check("swarm reached 2/3 quorum", true);
  const def = spec.outcomes.find((o) => o.id === outcome);
  const listed = check("outcome is listed in the spec", !!def, outcome);
  const allowed = check("outcome is allowed for this clause", clause!.allowedOutcomes.includes(outcome), clause!.allowedOutcomes.join(", "));
  if (!listed || !allowed) return { outcome, status: "rejected", payouts: [], total: 0, checks };
  const parties = new Set(spec.parties.map((p) => p.id));
  const payouts: PayoutLine[] = [];
  let partiesOk = true;
  for (const leg of def!.payouts) {
    if (!parties.has(leg.to)) partiesOk = false;
    const requested = leg.variable ? Math.max(0, Math.floor(amount ?? 0)) : (leg.amount ?? 0);
    let paid = requested;
    if (leg.variable) paid = Math.min(paid, leg.max ?? 0);
    if (spec.hardLimits.maxSingleTransfer !== undefined) paid = Math.min(paid, spec.hardLimits.maxSingleTransfer);
    payouts.push({ to: leg.to, requested, paid, capped: paid < requested });
  }
  if (!check("every payee is a listed party", partiesOk)) return { outcome, status: "rejected", payouts: [], total: 0, checks };
  for (const p of payouts) if (p.capped) check(`cap applied to ${p.to}`, true, `requested ${p.requested}, paid ${p.paid}`);
  let total = payouts.reduce((a, p) => a + p.paid, 0);
  const limit = Math.min(spec.hardLimits.maxTotalPayout, opts.balance ?? spec.escrow.amount);
  if (total > limit) {
    // scale down deterministically, never up
    const f = limit / total;
    for (const p of payouts) { p.paid = Math.floor(p.paid * f); p.capped = true; }
    total = payouts.reduce((a, p) => a + p.paid, 0);
    check("total within maxTotalPayout and escrow balance", true, `scaled to ${total} (limit ${limit})`);
  } else check("total within maxTotalPayout and escrow balance", true, `${total} ≤ ${limit}`);
  return { outcome, status: "settled", payouts, total, checks };
}
