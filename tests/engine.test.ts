import { describe, expect, it } from "vitest";
import { audit, mockSwarm } from "../lib/agents/mock";
import { b58 } from "../lib/base58";
import { commitment, leaderFor, runSlot, voteMessage, type AgentDriver, type SlotResult } from "../lib/engine";
import { pubkeyFor, verifyHex } from "../lib/keys";
import { genesis, tip, verifyChain } from "../lib/ledger";
import { extractJson } from "../lib/parse";
import { referencePredict, referencePredictor } from "../lib/svm/predict";

describe("extractJson", () => {
  it("never accepts n/a", () => {
    expect(extractJson("n/a")).toBeNull();
    expect(extractJson("N/A")).toBeNull();
    expect(extractJson("")).toBeNull();
    expect(extractJson(null)).toBeNull();
  });
  it("reads JSON inside a code fence", () => {
    expect(extractJson('```json\n{"vote":"approve"}\n```')).toEqual({ vote: "approve" });
  });
});

describe("base58", () => {
  it("matches known encodings", () => {
    expect(b58("00ff")).toBe("15Q");
    expect(b58("0000")).toBe("11");
  });
});

describe("svmLLM reference predictor", () => {
  it("runs the sBPF transfer program and refuses an overspend", () => {
    const p = referencePredict({ pre: { a: 500, b: 20 }, transfers: [{ from: "a", to: "b", amount: 100 }, { from: "b", to: "a", amount: 999 }], leader: "a", reward: 10 });
    expect(p.balances).toEqual({ a: 410, b: 120 });
    expect(p.steps.map((s) => s.exit)).toEqual([0, 1]);
    expect(p.cu).toBe(18);
  });
});

async function runMock(n: number) {
  const agents = mockSwarm({ latency: false });
  let state = genesis(agents.map((a) => a.wallet));
  const results: SlotResult[] = [];
  for (let slot = 1; slot <= n; slot++) {
    const r = await runSlot(state, agents, referencePredictor, slot);
    state = r.state;
    results.push(r.result);
  }
  return { agents, state, results };
}

describe("runSlot with the mock swarm", () => {
  it("rotates leaders, confirms valid blocks and skips bad slots", async () => {
    const { agents, state, results } = await runMock(8);
    expect(results.map((r) => r.leader.wallet)).toEqual([1, 2, 3, 4, 5, 6, 7, 8].map((s) => leaderFor(agents, s).wallet));
    expect(results.map((r) => r.outcome)).toEqual([
      "confirmed", "skipped-invalid", "confirmed", "skipped-no-answer",
      "confirmed", "skipped-invalid", "confirmed", "skipped-no-answer",
    ]);
    expect(state.blocks.map((b) => b.slot)).toEqual([0, 1, 3, 5, 7]);
    expect(verifyChain(state).ok).toBe(true);
    expect(commitment(state, state.blocks[1])).toBe("finalized");
    expect(commitment(state, tip(state))).toBe("confirmed");
  });

  it("drops the injected and silent leaders without charging or rewarding them", async () => {
    const { state, results } = await runMock(4);
    expect(state.balances["mock-injected"]).toBe(1000 + state.blocks.slice(1).reduce((s, b) => s + b.txs.filter((t) => t.to === "mock-injected").reduce((x, t) => x + t.amount, 0) - b.txs.filter((t) => t.from === "mock-injected").reduce((x, t) => x + t.amount, 0), 0));
    const inj = results[1];
    expect(inj.dropped[0].wallet).toBe("mock-injected");
    expect(inj.checks.find((c) => c.name === "Post-state matches")?.ok).toBe(false);
    expect(results[3].dropped[0].wallet).toBe("mock-silent");
    expect(results[3].votes.length).toBe(0);
  });

  it("flags the rubber stamp and the svmLLM mismatch on the injected block", async () => {
    const { results } = await runMock(2);
    const inj = results[1];
    expect(inj.disagreements.some((d) => d.includes("mock-rubber-stamp approved a block the harness rejects"))).toBe(true);
    expect(inj.disagreements.some((d) => d.includes("differs from the leader's claim for mock-injected"))).toBe(true);
    // On a valid block svmLLM's prediction equals the ledger's post-state.
    expect(results[0].prediction?.balances).toEqual(results[0].ledgerBalances);
  });

  it("signs counted votes over the exact blockhash and drops n/a voters", async () => {
    const { results } = await runMock(2);
    const r = results[1];
    for (const v of r.votes.filter((x) => x.status === "counted")) {
      expect(verifyHex(v.sig!, voteMessage(r.slot, r.draft!.hash, v.vote!), pubkeyFor(v.wallet))).toBe(true);
    }
    expect(r.votes.find((v) => v.wallet === "mock-lazy")?.status).toBe("dropped");
    expect(r.votes.find((v) => v.wallet === "mock-silent")?.status).toBe("dropped");
  });
});

describe("quorum", () => {
  const leader = mockSwarm({ latency: false })[0];
  const voter = (wallet: string, stake: number, mode: "approve" | "reject" | "wrong-hash"): AgentDriver => ({
    wallet, label: wallet, family: "Test", size: "-", role: "auditor", stake, kind: "mock",
    propose: async () => ({ text: null, ms: 0 }),
    vote: async (_p, _c, d) => ({ text: JSON.stringify({ vote: mode === "reject" ? "reject" : "approve", blockhash: mode === "wrong-hash" ? "abc" : b58(d.blockhash) }), ms: 0 }),
  });

  it("skips a valid block that lacks 2/3 of counted stake", async () => {
    const agents = [leader, voter("a", 10, "approve"), voter("b", 10, "reject"), voter("c", 10, "reject")];
    const { state, result } = await runSlot(genesis(agents.map((a) => a.wallet)), agents, null, 1);
    expect(result.harnessValid).toBe(true);
    expect(result.outcome).toBe("skipped-no-quorum");
    expect(state.blocks.length).toBe(1);
  });

  it("drops votes that do not echo the blockhash, and needs three counted votes", async () => {
    const agents = [leader, voter("a", 10, "approve"), voter("b", 10, "approve"), voter("c", 10, "wrong-hash")];
    const { result } = await runSlot(genesis(agents.map((a) => a.wallet)), agents, null, 1);
    expect(result.votes.find((v) => v.wallet === "c")?.status).toBe("dropped");
    expect(result.quorum).toBe(false);
  });

  it("the strict audit agrees with the harness", async () => {
    const agents = [leader, voter("a", 10, "approve"), voter("b", 10, "approve"), voter("c", 10, "approve")];
    const { result } = await runSlot(genesis(agents.map((a) => a.wallet)), agents, null, 1);
    expect(result.outcome).toBe("confirmed");
    expect(audit).toBeTypeOf("function");
  });
});
