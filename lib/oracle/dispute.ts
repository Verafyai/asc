import type { JudgmentRun } from "./types";

export type DisputeVerdict = "upheld" | "overturned" | "escalated";

/**
 * A dispute re-judges the same clause and the same evidence snapshots with a disjoint committee
 * (different model families). Bonds and slashing are design only: nothing is staked in this demo.
 */
export function disputeVerdict(initial: JudgmentRun, rejudge: JudgmentRun): { verdict: DisputeVerdict; detail: string } {
  const a = initial.signed.record.tally, b = rejudge.signed.record.tally;
  if (!b.quorum) return { verdict: "escalated", detail: "second committee did not reach quorum; escalate to the contract's fallback (human panel or default outcome at deadline)" };
  if (a.quorum && a.winner === b.winner) return { verdict: "upheld", detail: `both committees chose "${a.winner}"` };
  return { verdict: "overturned", detail: `first: ${a.winner ?? "no quorum"}; second: "${b.winner}". The second record supersedes and links the first by hash.` };
}

export function disjointCommittees(a: { model: string; family: string }[], b: { model: string; family: string }[]): boolean {
  const fam = new Set(a.map((x) => x.family));
  return b.every((x) => !fam.has(x.family));
}
