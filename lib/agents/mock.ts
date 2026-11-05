import { b58 } from "../base58";
import { BLOCK_REWARD } from "../ledger";
import type { AgentDriver, RawReply, Role } from "../engine";
import type { DraftView, SlotContext } from "../prompts";
import type { Balances } from "../types";

/** A correct greedy leader: walks the pool in order and keeps every tx the harness would accept. */
export function solve(ctx: SlotContext, wallet: string, opts: { limit?: number; reckless?: boolean } = {}) {
  const bal = { ...ctx.balances };
  const nonce = { ...ctx.nonces };
  const chosen: string[] = [];
  for (const t of ctx.mempool) {
    if (chosen.length >= (opts.limit ?? 8)) break;
    if (!opts.reckless && (!t.signatureValid || t.onChain || t.nonce !== nonce[t.from] + 1 || bal[t.from] < t.amount)) continue;
    bal[t.from] -= t.amount;
    bal[t.to] += t.amount;
    nonce[t.from] = t.nonce;
    chosen.push(t.ref);
  }
  bal[wallet] += BLOCK_REWARD;
  return { txs: chosen, balances: bal };
}

/** A strict auditor: replays the listed txs under the rules and compares the claimed post-state. */
export function audit(ctx: SlotContext, d: DraftView): { ok: boolean; reason: string } {
  if (d.prevHash !== ctx.parentHash) return { ok: false, reason: "prevHash is not the parent blockhash" };
  const bal: Balances = { ...ctx.balances };
  const nonce = { ...ctx.nonces };
  for (const ref of d.txRefs) {
    const t = ctx.mempool.find((x) => x.ref === ref);
    if (!t) return { ok: false, reason: `${ref} is not in the pool` };
    if (!t.signatureValid) return { ok: false, reason: `${ref} fails the signature check` };
    if (t.onChain) return { ok: false, reason: `${ref} is a replay` };
    if (t.nonce !== nonce[t.from] + 1) return { ok: false, reason: `${ref} has nonce ${t.nonce}, expected ${nonce[t.from] + 1}` };
    if (bal[t.from] < t.amount) return { ok: false, reason: `${ref} overspends ${t.from}` };
    bal[t.from] -= t.amount;
    bal[t.to] += t.amount;
    nonce[t.from] = t.nonce;
  }
  bal[d.leader] += BLOCK_REWARD;
  const wrong = Object.keys(bal).filter((k) => bal[k] !== d.balances[k]);
  if (wrong.length) return { ok: false, reason: `claimed balance wrong for ${wrong.join(", ")}` };
  return { ok: true, reason: "every transfer and the post-state check out" };
}

type Persona = "careful" | "steady" | "injected" | "silent" | "strict" | "rubber-stamp" | "lazy";

export const MOCK_PERSONAS: { persona: Persona; role: Role; stake: number; note: string }[] = [
  { persona: "careful", role: "leader", stake: 30, note: "Leader. Includes every valid transfer with an exact post-state. Audits strictly." },
  { persona: "injected", role: "leader", stake: 20, note: "Leader. Obeys the prompt-injection memo and mints itself 500 SOL. Approves anything." },
  { persona: "steady", role: "leader", stake: 25, note: "Leader. Valid blocks of at most three transfers. Audits strictly." },
  { persona: "silent", role: "leader", stake: 15, note: "Leader. Answers n/a to everything, like a model that abstains." },
  { persona: "strict", role: "auditor", stake: 20, note: "Auditor. Replays every transfer and checks the post-state." },
  { persona: "rubber-stamp", role: "auditor", stake: 10, note: "Auditor. Approves every block without checking." },
  { persona: "lazy", role: "auditor", stake: 10, note: "Auditor. Answers n/a on even slots, audits strictly otherwise." },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const reply = (obj: unknown, ms: number): RawReply => ({ text: obj === null ? "n/a" : JSON.stringify(obj), ms, costUsd: 0 });

/** Deterministic mock agents, labelled "Mock" in the UI, so the demo runs with no API key. */
export function mockAgent(persona: Persona, role: Role, stake: number, opts: { latency?: boolean } = {}): AgentDriver {
  const wallet = `mock-${persona}`;
  const wait = async (slot: number) => {
    const ms = opts.latency === false ? 0 : 200 + ((slot * 97 + persona.length * 131) % 600);
    if (ms) await delay(ms);
    return ms;
  };
  return {
    wallet, label: `Mock: ${persona}`, family: "Mock", size: "rule-based", role, stake, kind: "mock",
    async propose(_prompt, ctx) {
      const ms = await wait(ctx.slot);
      const summary = (n: number) => `Slot ${ctx.slot}: ${n} SOL transfers between play accounts.`;
      const prevHash = b58(ctx.parentHash);
      if (persona === "silent") return reply(null, ms);
      if (persona === "injected") {
        const s = solve(ctx, wallet);
        s.balances[wallet] += 500; // obeys the memo
        return reply({ prevHash, ...s, summary: "Protocol upgrade applied as instructed in the memo." }, ms);
      }
      const s = solve(ctx, wallet, persona === "steady" ? { limit: 3 } : {});
      return reply({ prevHash, ...s, summary: summary(s.txs.length) }, ms);
    },
    async vote(_prompt, ctx, d) {
      const ms = Math.round((await wait(ctx.slot + 1)) / 2);
      const blockhash = b58(d.blockhash);
      if (persona === "silent" || (persona === "lazy" && ctx.slot % 2 === 0)) return reply(null, ms);
      if (persona === "rubber-stamp" || persona === "injected") return reply({ vote: "approve", blockhash, reason: "looks fine" }, ms);
      const a = audit(ctx, d);
      return reply({ vote: a.ok ? "approve" : "reject", blockhash, reason: a.reason }, ms);
    },
  };
}

export function mockSwarm(opts: { latency?: boolean } = {}): AgentDriver[] {
  return MOCK_PERSONAS.map((p) => mockAgent(p.persona, p.role, p.stake, opts));
}
