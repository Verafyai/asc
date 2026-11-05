import { describe, expect, it } from "vitest";
import { canonical } from "../lib/canonical";
import { secretFor } from "../lib/keys";
import { BLOCK_REWARD, GENESIS_BALANCE, appendBlock, genesis, signTx, tip, validateProposal, verifyChain } from "../lib/ledger";
import { buildMempool } from "../lib/mempool";
import type { Balances, ChainState, Tx } from "../lib/types";

const W = ["alice-model", "bob-model", "carol-model"];

function expected(state: ChainState, txs: Tx[], proposer: string): Balances {
  const b = { ...state.balances };
  for (const t of txs) { b[t.from] -= t.amount; b[t.to] += t.amount; }
  b[proposer] += BLOCK_REWARD;
  return b;
}

function propose(state: ChainState, txs: Tx[], proposer = W[0], over: Partial<{ prevHash: string; balances: Balances; summary: string; ids: string[] }> = {}) {
  return validateProposal(state, txs, proposer, {
    prevHash: over.prevHash ?? tip(state).hash,
    txIds: over.ids ?? txs.map((t) => t.id),
    balances: over.balances ?? expected(state, txs, proposer),
    summary: over.summary ?? "test block",
  });
}

describe("canonical JSON", () => {
  it("is independent of key order", () => {
    expect(canonical({ b: 1, a: [2, { d: 3, c: 4 }] })).toBe(canonical({ a: [2, { c: 4, d: 3 }], b: 1 }));
  });
});

describe("genesis", () => {
  it("gives every wallet the same balance and a stable hash", () => {
    const g = genesis(W);
    expect(Object.values(g.balances)).toEqual([GENESIS_BALANCE, GENESIS_BALANCE, GENESIS_BALANCE]);
    expect(tip(g).hash).toBe(tip(genesis(W)).hash);
    expect(tip(g).hash).toMatch(/^[0-9a-f]{64}$/);
    expect(verifyChain(g).ok).toBe(true);
  });
});

describe("validateProposal", () => {
  const s0 = genesis(W);
  const t1 = signTx({ from: W[0], to: W[1], amount: 100, nonce: 1, memo: "a" });
  const t2 = signTx({ from: W[1], to: W[2], amount: 50, nonce: 1, memo: "b" });

  it("accepts a correct block and credits the reward", () => {
    const r = propose(s0, [t1, t2]);
    expect(r.errors).toEqual([]);
    expect(r.valid).toBe(true);
    expect(r.block!.balances).toEqual({ [W[0]]: 910, [W[1]]: 1050, [W[2]]: 1050 });
    expect(r.block!.prevHash).toBe(tip(s0).hash);
  });

  it("rejects a wrong prevHash", () => {
    const r = propose(s0, [t1], W[0], { prevHash: "f".repeat(64) });
    expect(r.valid).toBe(false);
    expect(r.errors.join()).toMatch(/prevHash/);
  });

  it("rejects a forged signature", () => {
    const forged = signTx({ from: W[0], to: W[1], amount: 5, nonce: 1, memo: "x" }, secretFor(W[1]));
    const r = propose(s0, [forged]);
    expect(r.valid).toBe(false);
    expect(r.errors.join()).toMatch(/bad signature/);
  });

  it("rejects a tampered transaction whose id no longer matches", () => {
    const tampered = { ...t1, amount: 999 };
    const r = propose(s0, [tampered]);
    expect(r.valid).toBe(false);
    expect(r.errors.join()).toMatch(/id does not match/);
  });

  it("rejects an overspend", () => {
    const big = signTx({ from: W[0], to: W[1], amount: GENESIS_BALANCE + 1, nonce: 1, memo: "x" });
    const r = propose(s0, [big]);
    expect(r.valid).toBe(false);
    expect(r.errors.join()).toMatch(/cannot send/);
  });

  it("rejects a double spend of the same nonce", () => {
    const dup = signTx({ from: W[0], to: W[2], amount: 3, nonce: 1, memo: "again" });
    const r = propose(s0, [t1, dup]);
    expect(r.valid).toBe(false);
    expect(r.errors.join()).toMatch(/nonce 1, expected 2/);
  });

  it("rejects transactions applied out of nonce order", () => {
    const n2 = signTx({ from: W[0], to: W[1], amount: 1, nonce: 2, memo: "second" });
    expect(propose(s0, [n2, t1]).valid).toBe(false);
    expect(propose(s0, [t1, n2]).valid).toBe(true);
  });

  it("rejects wrong claimed balances, including a forgotten reward", () => {
    const b = expected(s0, [t1], W[0]);
    b[W[0]] -= BLOCK_REWARD;
    const r = propose(s0, [t1], W[0], { balances: b });
    expect(r.valid).toBe(false);
    expect(r.errors.join()).toMatch(/claimed balances are wrong/);
  });

  it("rejects an empty block, unknown tx ids and duplicates", () => {
    expect(propose(s0, [], W[0], { ids: [] }).valid).toBe(false);
    expect(propose(s0, [t1], W[0], { ids: ["nope"] }).errors.join()).toMatch(/not in the mempool/);
    expect(propose(s0, [t1], W[0], { ids: [t1.id, t1.id] }).errors.join()).toMatch(/listed twice/);
  });

  it("rejects a proposer without a wallet", () => {
    expect(propose(s0, [t1], "stranger").valid).toBe(false);
  });
});

describe("appendBlock and verifyChain", () => {
  it("links blocks, blocks replays and audits the whole chain", () => {
    const s0 = genesis(W);
    const t1 = signTx({ from: W[0], to: W[1], amount: 100, nonce: 1, memo: "a" });
    const r1 = propose(s0, [t1]);
    const s1 = appendBlock(s0, [t1], r1.block!);
    expect(tip(s1).prevHash).toBe(tip(s0).hash);
    expect(s1.nonces[W[0]]).toBe(1);

    const replay = propose(s1, [t1], W[1]);
    expect(replay.valid).toBe(false);
    expect(replay.errors.join()).toMatch(/already on chain/);

    const t2 = signTx({ from: W[1], to: W[0], amount: 40, nonce: 1, memo: "b" });
    const s2 = appendBlock(s1, [t2], propose(s1, [t2], W[2]).block!);
    expect(verifyChain(s2).ok).toBe(true);
    const total = Object.values(s2.balances).reduce((a, b) => a + b, 0);
    expect(total).toBe(W.length * GENESIS_BALANCE + 2 * BLOCK_REWARD);
  });

  it("refuses a block whose hash was edited", () => {
    const s0 = genesis(W);
    const t1 = signTx({ from: W[0], to: W[1], amount: 1, nonce: 1, memo: "a" });
    const b = propose(s0, [t1]).block!;
    expect(() => appendBlock(s0, [t1], { ...b, hash: "0".repeat(64) })).toThrow(/refusing/);
  });

  it("detects tampering with history", () => {
    const s0 = genesis(W);
    const t1 = signTx({ from: W[0], to: W[1], amount: 1, nonce: 1, memo: "a" });
    const s1 = appendBlock(s0, [t1], propose(s0, [t1]).block!);
    const forgedHistory = { ...s1, blocks: [s1.blocks[0], { ...s1.blocks[1], summary: "rewritten" }] };
    expect(verifyChain(forgedHistory).ok).toBe(false);
  });
});

describe("mempool", () => {
  it("is deterministic for the same tip and contains the traps", () => {
    const s0 = genesis(W);
    const a = buildMempool(s0);
    const b = buildMempool(s0);
    expect(a.map((m) => m.tx.id)).toEqual(b.map((m) => m.tx.id));
    const kinds = new Set(a.map((m) => m.kind));
    for (const k of ["ok", "injection", "forged", "overspend", "double-spend"]) expect(kinds.has(k as never)).toBe(true);
  });

  it("every trap is rejected by the ledger on its own", () => {
    const s0 = genesis(W);
    const mp = buildMempool(s0);
    for (const m of mp.filter((x) => x.kind !== "ok" && x.kind !== "injection" && x.kind !== "double-spend")) {
      const r = validateProposal(s0, mp.map((x) => x.tx), W[0], { prevHash: tip(s0).hash, txIds: [m.tx.id], balances: {}, summary: "t" });
      expect(r.valid, m.kind).toBe(false);
    }
  });
});
