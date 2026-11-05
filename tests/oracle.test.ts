import { describe, expect, it } from "vitest";
import { hashOf, sha256Hex } from "../lib/canonical";
import { settle } from "../lib/oracle/escrow";
import { compactRecord, parseAnswer, runJudgment, signRecord, tally, verifyRun, type Caller } from "../lib/oracle/judge";
import { disjointCommittees, disputeVerdict } from "../lib/oracle/dispute";
import { SWARM_A, SWARM_B } from "../lib/oracle/models";
import { contractId, validateSpec } from "../lib/oracle/spec";
import type { ContractSpec, EvidenceDoc, Reveal } from "../lib/oracle/types";

const spec: ContractSpec = {
  version: 1, title: "Treasury rebalance", summary: "Move SOL to stables toward target, capped at 100 per decision.",
  parties: [{ id: "dao", label: "DAO", role: "funder" }, { id: "stable_reserve", label: "Stable reserve", role: "payee" }],
  escrow: { asset: "PLAY", amount: 1000, funder: "dao" }, deadline: "2026-12-01T00:00:00Z",
  evidenceSources: [{ id: "snap", description: "treasury snapshot", kind: "data" }],
  outcomes: [
    { id: "hold", description: "do nothing", payouts: [] },
    { id: "rebalance", description: "move PLAY to reserve", payouts: [{ to: "stable_reserve", variable: true, max: 100 }] },
  ],
  judgmentClauses: [{ id: "c1", question: "Does policy call for a rebalance, and how much?", allowedOutcomes: ["hold", "rebalance"] }],
  hardLimits: { maxTotalPayout: 100 }, defaultOutcome: "hold",
};
const evidence: EvidenceDoc[] = [{ id: "snap", label: "snapshot", source: "illustrative", provenance: "illustrative", text: "SOL 82%, target 60%." }];
const reply = (o: string, amount: number | null = null) => JSON.stringify({ outcome: o, amount, confidence: 0.9, reasoning: `because ${o}`, injection_suspected: false });
const caller = (answers: Record<string, string | null>): Caller => async (op) => ({ text: answers[op.id] ?? null, ms: 1, costUsd: 0.001 });
const all = (text: string) => Object.fromEntries(SWARM_A.map((o) => [o.id, text]));

describe("spec validation", () => {
  it("accepts a good spec and rejects unsafe ones", () => {
    expect(validateSpec(spec)).toEqual([]);
    expect(validateSpec({ ...spec, hardLimits: { maxTotalPayout: 5000 } }).some((i) => i.problem.includes("exceeds the escrow"))).toBe(true);
    const noCap = structuredClone(spec); delete noCap.outcomes[1].payouts[0].max;
    expect(validateSpec(noCap).some((i) => i.problem.includes("explicit numeric cap"))).toBe(true);
    const stranger = structuredClone(spec); stranger.outcomes[1].payouts[0].to = "attacker";
    expect(validateSpec(stranger).some((i) => i.problem.includes("not a listed party"))).toBe(true);
  });
  it("contract id changes with any edit", () => {
    expect(contractId(spec)).not.toBe(contractId({ ...spec, title: "Treasury rebalance." }));
  });
});

describe("answer parsing", () => {
  const needs = (o: string) => o === "rebalance";
  it("drops NA and off-list answers", () => {
    expect(parseAnswer(reply("NA"), ["hold", "rebalance"], needs).status).toBe("na");
    expect(parseAnswer(reply("pay_attacker"), ["hold", "rebalance"], needs).status).toBe("invalid");
    expect(parseAnswer("n/a", ["hold"], needs).status).toBe("invalid");
    expect(parseAnswer(reply("rebalance"), ["hold", "rebalance"], needs).status).toBe("invalid"); // no amount
    expect(parseAnswer(reply("rebalance", 220), ["hold", "rebalance"], needs).answer?.amount).toBe(220);
  });
});

describe("tally", () => {
  const r = (outcome: string, status: Reveal["status"] = "counted", amount: number | null = null): Reveal => ({ operator: Math.random().toString(), status, outcome, amount, salt: "", answerHash: "" });
  it("needs 2/3 of counted votes and a minimum turnout", () => {
    expect(tally([r("a"), r("a"), r("b")], 6).quorum).toBe(true); // exactly 2/3 of 3 counted, turnout 3 = ceil(6/2)
    expect(tally([r("a"), r("a")], 6).quorum).toBe(false); // turnout below minimum
    expect(tally([r("a"), r("a"), r("a"), r("b")], 6).winner).toBe("a");
    expect(tally([r("a"), r("a"), r("b"), r("b")], 6).quorum).toBe(false);
    expect(tally([r("a"), r("a"), r("x", "na"), r("x", "invalid"), r("x", "na"), r("x", "na")], 6).quorum).toBe(false); // turnout
  });
  it("takes the lower median of the winning bloc's amounts", () => {
    expect(tally([r("a", "counted", 300), r("a", "counted", 100), r("a", "counted", 200), r("a", "counted", 900)], 4).amount).toBe(200);
  });
});

describe("escrow hard caps", () => {
  it("a unanimous swarm cannot overpay", () => {
    const s = settle(spec, "c1", "rebalance", 220, { quorum: true });
    expect(s.status).toBe("settled");
    expect(s.total).toBe(100);
    expect(s.payouts[0]).toMatchObject({ requested: 220, paid: 100, capped: true });
  });
  it("rejects unlisted outcomes and moves nothing without quorum", () => {
    expect(settle(spec, "c1", "pay_attacker", 1_000_000, { quorum: true }).status).toBe("rejected");
    expect(settle(spec, "c1", "rebalance", 50, { quorum: false }).total).toBe(0);
  });
  it("never spends more than the escrow balance", () => {
    expect(settle(spec, "c1", "rebalance", 100, { quorum: true, balance: 40 }).total).toBe(40);
  });
});

describe("judgment record", () => {
  it("unanimous swarm: quorum, capped payout, everything verifies", async () => {
    const run = await runJudgment({ spec, clauseId: "c1", evidence, operators: SWARM_A, call: caller(all(reply("rebalance", 220))) });
    expect(run.signed.record.tally.winner).toBe("rebalance");
    expect(run.signed.record.settlement.total).toBe(100);
    expect(run.signed.quorumSigs).toHaveLength(6);
    expect(verifyRun(spec, run, evidence).every((c) => c.ok)).toBe(true);
    expect(run.costUsd).toBeCloseTo(0.006);
  });
  it("NA and garbage replies are dropped, not counted", async () => {
    const answers = all(reply("hold"));
    answers[SWARM_A[0].id] = reply("NA");
    answers[SWARM_A[1].id] = "I cannot help";
    const run = await runJudgment({ spec, clauseId: "c1", evidence, operators: SWARM_A, call: caller(answers) });
    expect(run.signed.record.tally).toMatchObject({ counted: 4, na: 1, invalid: 1, winner: "hold" });
    expect(run.signed.quorumSigs).toHaveLength(4);
  });
  it("detects tampering: reasoning, evidence, outcome and signatures", async () => {
    const run = await runJudgment({ spec, clauseId: "c1", evidence, operators: SWARM_A, call: caller(all(reply("rebalance", 80))) });
    const op = SWARM_A[2].id;
    const bad = (checks: ReturnType<typeof verifyRun>) => checks.filter((c) => !c.ok).map((c) => c.name);
    expect(bad(verifyRun(spec, { ...run, reasoning: { ...run.reasoning, [op]: "edited" } }))).toContain("published reasoning matches committed hashes");
    expect(bad(verifyRun(spec, run, [{ ...evidence[0], text: "SOL 50%" }]))).toContain("evidence snapshots match their hashes");
    const forged = structuredClone(run.signed);
    forged.record.reveals[0].outcome = "hold";
    expect(bad(verifyRun(spec, { ...run, signed: forged }))).toContain("record hash matches record");
    const resigned = { ...run, signed: { ...signRecord(forged.record) } };
    expect(bad(verifyRun(spec, resigned))).toContain("every reveal opens its commitment");
  });
  it("compact record fits a v1 inscription", async () => {
    const run = await runJudgment({ spec, clauseId: "c1", evidence, operators: SWARM_A, call: caller(all(reply("rebalance", 80))) });
    const bytes = new TextEncoder().encode(JSON.stringify(compactRecord(run.signed))).length;
    expect(bytes).toBeLessThan(3400);
  });
});

describe("dispute", () => {
  it("uses a disjoint committee and reports the verdict", async () => {
    expect(disjointCommittees(SWARM_A, SWARM_B)).toBe(true);
    const a = await runJudgment({ spec, clauseId: "c1", evidence, operators: SWARM_A, call: caller(all(reply("hold"))) });
    const bAns = Object.fromEntries(SWARM_B.map((o) => [o.id, reply("rebalance", 50)]));
    const b = await runJudgment({ spec, clauseId: "c1", evidence, operators: SWARM_B, call: caller(bAns), round: "dispute", priorRecordHash: a.signed.recordHash });
    expect(disputeVerdict(a, b).verdict).toBe("overturned");
    expect(b.signed.record.priorRecordHash).toBe(a.signed.recordHash);
    expect(disputeVerdict(a, a).verdict).toBe("upheld");
  });
});

it("hash helpers are stable", () => { expect(hashOf({ b: 1, a: 2 })).toBe(sha256Hex('{"a":2,"b":1}')); });
