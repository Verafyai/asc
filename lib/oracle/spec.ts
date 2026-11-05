import { hashOf } from "../canonical";
import type { ContractSpec } from "./types";

export interface SpecIssue { path: string; problem: string }

const isNum = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

/**
 * Deterministic checks on a compiled spec. The compiler is a model, so nothing it writes is trusted
 * until this passes. Payout caps must be explicit numbers and can never exceed the escrow.
 */
export function validateSpec(s: unknown): SpecIssue[] {
  const out: SpecIssue[] = [];
  const bad = (path: string, problem: string) => out.push({ path, problem });
  if (!s || typeof s !== "object") return [{ path: "", problem: "spec is not an object" }];
  const spec = s as ContractSpec;
  if (spec.version !== 1) bad("version", "must be 1");
  if (!spec.title) bad("title", "missing");
  if (!Array.isArray(spec.parties) || spec.parties.length < 1) bad("parties", "need at least one party");
  const parties = new Set((spec.parties ?? []).map((p) => p.id));
  if (parties.size !== (spec.parties ?? []).length) bad("parties", "duplicate party ids");
  if (!spec.escrow || !isNum(spec.escrow.amount) || spec.escrow.amount <= 0) bad("escrow.amount", "must be a positive number");
  if (spec.escrow && spec.escrow.asset !== "PLAY") bad("escrow.asset", 'must be "PLAY" (play money only)');
  if (spec.escrow && !parties.has(spec.escrow.funder)) bad("escrow.funder", "not a listed party");
  if (!spec.deadline || Number.isNaN(Date.parse(spec.deadline))) bad("deadline", "not an ISO date");
  if (!spec.hardLimits || !isNum(spec.hardLimits.maxTotalPayout) || spec.hardLimits.maxTotalPayout <= 0) bad("hardLimits.maxTotalPayout", "must be a positive number");
  else if (spec.escrow && spec.hardLimits.maxTotalPayout > spec.escrow.amount) bad("hardLimits.maxTotalPayout", "exceeds the escrow");
  const outcomes = new Set<string>();
  for (const [i, o] of (spec.outcomes ?? []).entries()) {
    if (!o.id || outcomes.has(o.id)) bad(`outcomes[${i}].id`, "missing or duplicate");
    if (o.id === "NA") bad(`outcomes[${i}].id`, '"NA" is reserved for abstain');
    outcomes.add(o.id);
    let fixed = 0;
    for (const [j, p] of (o.payouts ?? []).entries()) {
      const at = `outcomes[${i}].payouts[${j}]`;
      if (!parties.has(p.to)) bad(`${at}.to`, `"${p.to}" is not a listed party`);
      if (p.variable) {
        if (!isNum(p.max) || p.max < 0) bad(`${at}.max`, "a variable payout needs an explicit numeric cap");
        if (p.amount !== undefined) bad(`${at}.amount`, "variable payouts cannot also be fixed");
      } else {
        if (!isNum(p.amount) || p.amount < 0) bad(`${at}.amount`, "a fixed payout needs a non-negative number");
        else fixed += p.amount;
      }
      const leg = p.variable ? p.max : p.amount;
      if (isNum(leg) && isNum(spec.hardLimits?.maxSingleTransfer) && leg > spec.hardLimits.maxSingleTransfer) bad(at, "exceeds maxSingleTransfer");
    }
    if (isNum(spec.hardLimits?.maxTotalPayout) && fixed > spec.hardLimits.maxTotalPayout) bad(`outcomes[${i}]`, "fixed payouts exceed maxTotalPayout");
  }
  if (outcomes.size < 2) bad("outcomes", "need at least two outcomes");
  if (!outcomes.has(spec.defaultOutcome)) bad("defaultOutcome", "not a listed outcome");
  if (!Array.isArray(spec.judgmentClauses) || spec.judgmentClauses.length < 1) bad("judgmentClauses", "need at least one judgment clause");
  for (const [i, c] of (spec.judgmentClauses ?? []).entries()) {
    if (!c.id || !c.question) bad(`judgmentClauses[${i}]`, "needs id and question");
    if (!Array.isArray(c.allowedOutcomes) || c.allowedOutcomes.length < 2) bad(`judgmentClauses[${i}].allowedOutcomes`, "need at least two");
    for (const o of c.allowedOutcomes ?? []) if (!outcomes.has(o)) bad(`judgmentClauses[${i}].allowedOutcomes`, `"${o}" is not a listed outcome`);
  }
  return out;
}

/** Contract id: sha256 of the canonical spec. Change one character and it is a different contract. */
export const contractId = (spec: ContractSpec) => hashOf(spec);
