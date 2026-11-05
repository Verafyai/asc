import { b58 } from "./base58";
import { hashOf } from "./canonical";
import { secretFor, pubkeyFor, signHex, verifyHex } from "./keys";
import { BLOCK_REWARD, TRANSFER_CU, appendBlock, blockHash, blockTimestamp, tip, validateProposal } from "./ledger";
import { buildMempool, type MempoolEntry } from "./mempool";
import { extractJson } from "./parse";
import { buildContext, proposePrompt, votePrompt, type DraftView, type SlotContext } from "./prompts";
import { referencePredict, type Predictor, type SvmPrediction } from "./svm/predict";
import type { Balances, Block, ChainState, Proposal } from "./types";

export interface RawReply { text: string | null; ms: number; costUsd?: number; error?: string }

export type Role = "leader" | "auditor";

export interface AgentDriver {
  wallet: string; // the agent's play-money account
  label: string; // model id, e.g. "openai/gpt-5-mini", or "Mock: careful"
  family: string; // provider family, e.g. "OpenAI"
  size: string; // rough size class, e.g. "small", "large MoE"
  role: Role; // leaders take slots in rotation and also vote; auditors only vote
  stake: number; // play stake for vote weighting. Not money.
  kind: "mock" | "live" | "replay";
  propose(prompt: string, ctx: SlotContext): Promise<RawReply>;
  vote(prompt: string, ctx: SlotContext, draft: DraftView): Promise<RawReply>;
}

export interface Check { name: string; ok: boolean; detail?: string }

export type ProposalStatus = "parsed" | "no-answer";
export interface LeaderResult {
  wallet: string; label: string; family: string; kind: AgentDriver["kind"];
  raw: RawReply; status: ProposalStatus; error?: string;
  txRefs: string[]; claimed?: Balances; summary?: string;
}

export interface VoteResult {
  wallet: string; label: string; family: string; role: Role; stake: number;
  raw: RawReply;
  status: "counted" | "dropped";
  vote?: "approve" | "reject";
  reason?: string;
  error?: string; // why it was dropped
  sig?: string; // harness-made ed25519 vote signature, hex
  agreesWithHarness?: boolean;
}

export type SlotOutcome = "confirmed" | "skipped-no-answer" | "skipped-invalid" | "skipped-no-quorum";

export interface SlotResult {
  slot: number;
  parentSlot: number;
  leader: LeaderResult;
  mempool: MempoolEntry[];
  refs: Record<string, string>; // ref -> tx id
  draft?: Block; // the block as the leader drafted it, hashed by the harness
  checks: Check[];
  harnessValid: boolean;
  ledgerBalances?: Balances; // what the deterministic ledger computes for the listed txs
  prediction?: SvmPrediction | null; // svmLLM's predicted post-state
  reference?: SvmPrediction; // svmLLM reference interpreter, run in the harness as a cross-check
  votes: VoteResult[];
  stake: { approve: number; reject: number; counted: number; dropped: number };
  quorum: boolean;
  outcome: SlotOutcome;
  dropped: { wallet: string; why: string }[]; // dropped this slot, never charged or rewarded
  disagreements: string[];
  costUsd: number;
}

export type SlotEvent =
  | { type: "slot"; slot: number; leader: string; mempool: MempoolEntry[] }
  | { type: "proposal"; result: LeaderResult; draft?: Block }
  | { type: "prediction"; prediction: SvmPrediction | null; reference?: SvmPrediction }
  | { type: "vote"; result: VoteResult }
  | { type: "done"; result: SlotResult };

export const QUORUM = 2 / 3;
export const MIN_VOTES = 3;
export const FINALITY_DEPTH = 2; // demo depth: finalized once two confirmed blocks sit on top

export function leaderFor(agents: AgentDriver[], slot: number): AgentDriver {
  const leaders = agents.filter((a) => a.role === "leader");
  return leaders[(slot - 1) % leaders.length];
}

export function commitment(state: ChainState, block: Block): "finalized" | "confirmed" {
  if (block.height === 0) return "finalized";
  return tip(state).height - block.height >= FINALITY_DEPTH ? "finalized" : "confirmed";
}

/** Accepts the parent blockhash in base58 (as shown to models) or hex. */
function normalizeHash(v: unknown, ctx: SlotContext): string {
  const s = String(v ?? "").trim();
  if (s === b58(ctx.parentHash)) return ctx.parentHash;
  return s;
}

function parseLeader(obj: Record<string, unknown>, ctx: SlotContext): { p?: Proposal; refs: string[]; error?: string } {
  const list = obj.txs ?? obj.txIds ?? obj.transactions;
  if (!Array.isArray(list)) return { refs: [], error: "reply has no txs list" };
  const refs = list.map((x) => String(x).trim());
  const bal = obj.balances;
  if (!bal || typeof bal !== "object" || Array.isArray(bal)) return { refs, error: "reply has no balances object" };
  const nums: Balances = {};
  for (const [k, v] of Object.entries(bal as Record<string, unknown>)) nums[k] = typeof v === "number" ? v : Number(v);
  const byRef = Object.fromEntries(ctx.mempool.map((t) => [t.ref, t.id]));
  return {
    refs,
    p: { prevHash: normalizeHash(obj.prevHash, ctx), txIds: refs.map((r) => byRef[r] ?? r), balances: nums, summary: String(obj.summary ?? "") },
  };
}

/** Hashes the leader's draft exactly as claimed, so voters can sign a blockhash even for a bad block. */
function draftBlock(state: ChainState, mempool: MempoolEntry[], slot: number, leader: string, p: Proposal): Block {
  const head = tip(state);
  const txs = p.txIds.map((id) => mempool.find((m) => m.tx.id === id)?.tx).filter((t): t is NonNullable<typeof t> => !!t);
  const body = {
    slot, height: head.height + 1, prevHash: p.prevHash, timestamp: blockTimestamp(slot), proposer: leader,
    txs, reward: BLOCK_REWARD, computeUnits: txs.length * TRANSFER_CU, summary: p.summary.trim(), balances: p.balances,
  };
  return { ...body, hash: blockHash(body) };
}

const CHECKS: [string, RegExp][] = [
  ["Parent blockhash link", /prevHash|slot \d+ is not after/],
  ["ed25519 signatures", /bad signature|id does not match/],
  ["Nonce order (no double spend)", /nonce/],
  ["No overspend", /cannot send/],
  ["No replay", /already on chain|listed twice|not in the mempool/],
  ["Post-state matches", /claimed balances/],
];

function harnessChecks(errors: string[], skippedState: boolean): Check[] {
  const used = new Set<string>();
  const out: Check[] = CHECKS.map(([name, re]) => {
    const hits = errors.filter((e) => re.test(e));
    hits.forEach((h) => used.add(h));
    if (name === "Post-state matches" && skippedState) return { name, ok: false, detail: "not checked: earlier rules failed" };
    return { name, ok: hits.length === 0, detail: hits.join("; ") || undefined };
  });
  const other = errors.filter((e) => !used.has(e));
  out.push({ name: "Block shape", ok: other.length === 0, detail: other.join("; ") || undefined });
  return out;
}

export function voteMessage(slot: number, blockhash: string, vote: string): string {
  return hashOf({ type: "vote", slot, blockhash, vote });
}

function sameBalances(a: Balances, b: Balances): boolean {
  const k = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...k].every((x) => a[x] === b[x]);
}

/**
 * One slot. The leader in rotation drafts a block. The harness hashes it, svmLLM predicts its
 * post-state, every other model votes on the exact blockhash, and the harness runs the deterministic
 * checks. The block lands only if the checks pass and approving stake reaches 2/3.
 */
export async function runSlot(
  state: ChainState,
  agents: AgentDriver[],
  predictor: Predictor | null,
  slot: number,
  onEvent?: (e: SlotEvent) => void,
): Promise<{ state: ChainState; result: SlotResult }> {
  const leaderAgent = leaderFor(agents, slot);
  const mempool = buildMempool(state, slot);
  const ctx = buildContext(state, mempool, slot, leaderAgent.wallet);
  const refs = Object.fromEntries(ctx.mempool.map((t) => [t.ref, t.id]));
  onEvent?.({ type: "slot", slot, leader: leaderAgent.wallet, mempool });
  let cost = 0;
  const dropped: SlotResult["dropped"] = [];
  const disagreements: string[] = [];

  const raw = await leaderAgent.propose(proposePrompt(ctx), ctx);
  cost += raw.costUsd ?? 0;
  const obj = extractJson(raw.text);
  const parsed = obj ? parseLeader(obj, ctx) : null;
  const leader: LeaderResult = {
    wallet: leaderAgent.wallet, label: leaderAgent.label, family: leaderAgent.family, kind: leaderAgent.kind, raw,
    status: parsed?.p ? "parsed" : "no-answer",
    error: parsed?.p ? undefined : raw.error ?? parsed?.error ?? (raw.text ? "no usable JSON block in the reply" : "no reply (n/a)"),
    txRefs: parsed?.refs ?? [], claimed: parsed?.p?.balances, summary: parsed?.p?.summary,
  };
  const base = { slot, parentSlot: ctx.parentSlot, leader, mempool, refs };
  const empty = { approve: 0, reject: 0, counted: 0, dropped: 0 };

  if (!parsed?.p) {
    onEvent?.({ type: "proposal", result: leader });
    dropped.push({ wallet: leader.wallet, why: `leader gave no usable block: ${leader.error}` });
    const result: SlotResult = {
      ...base, checks: [], harnessValid: false, votes: [], stake: empty, quorum: false,
      outcome: "skipped-no-answer", dropped, disagreements, costUsd: cost,
    };
    onEvent?.({ type: "done", result });
    return { state, result };
  }

  const p = parsed.p;
  const draft = draftBlock(state, mempool, slot, leader.wallet, p);
  onEvent?.({ type: "proposal", result: leader, draft });

  // svmLLM predicts the post-state of exactly the transfers the leader listed.
  const req = { pre: ctx.balances, transfers: draft.txs.map((t) => ({ from: t.from, to: t.to, amount: t.amount })), leader: leader.wallet, reward: BLOCK_REWARD };
  const reference = referencePredict(req);
  const prediction = predictor ? await predictor.predict(req, slot) : null;
  onEvent?.({ type: "prediction", prediction, reference });

  // Every other model votes on the exact blockhash, in parallel.
  const voters = agents.filter((a) => a.wallet !== leader.wallet);
  const view: DraftView = { leader: leader.wallet, prevHash: p.prevHash, txRefs: parsed.refs, balances: p.balances, summary: p.summary, blockhash: draft.hash };
  const v = validateProposal(state, mempool.map((m) => m.tx), leader.wallet, p, slot);
  const harnessValid = v.valid && v.block?.hash === draft.hash;

  const votes = await Promise.all(
    voters.map(async (a): Promise<VoteResult> => {
      const r = await a.vote(votePrompt(ctx, a.wallet, view, prediction), ctx, view);
      cost += r.costUsd ?? 0;
      const vo = { wallet: a.wallet, label: a.label, family: a.family, role: a.role, stake: a.stake, raw: r };
      const j = extractJson(r.text);
      const choice = String(j?.vote ?? "").toLowerCase();
      let res: VoteResult;
      if (!j) res = { ...vo, status: "dropped", error: r.error ?? (r.text ? "no usable JSON vote" : "no reply (n/a)") };
      else if (choice !== "approve" && choice !== "reject") res = { ...vo, status: "dropped", error: `vote must be approve or reject, got "${String(j.vote ?? "")}"` };
      else if (String(j.blockhash ?? "").trim() !== b58(draft.hash)) res = { ...vo, status: "dropped", error: "blockhash not copied exactly, so the vote cannot be signed" };
      else {
        const msg = voteMessage(slot, draft.hash, choice);
        const sig = signHex(msg, secretFor(a.wallet));
        if (!verifyHex(sig, msg, pubkeyFor(a.wallet))) throw new Error("vote signature failed to verify");
        res = { ...vo, status: "counted", vote: choice, reason: String(j.reason ?? "").slice(0, 200), sig, agreesWithHarness: (choice === "approve") === harnessValid };
      }
      onEvent?.({ type: "vote", result: res });
      return res;
    }),
  );

  const counted = votes.filter((x) => x.status === "counted");
  const stake = {
    approve: counted.filter((x) => x.vote === "approve").reduce((s, x) => s + x.stake, 0),
    reject: counted.filter((x) => x.vote === "reject").reduce((s, x) => s + x.stake, 0),
    counted: counted.reduce((s, x) => s + x.stake, 0),
    dropped: votes.filter((x) => x.status === "dropped").reduce((s, x) => s + x.stake, 0),
  };
  const quorum = counted.length >= MIN_VOTES && stake.approve >= QUORUM * stake.counted;
  for (const x of votes.filter((x) => x.status === "dropped")) dropped.push({ wallet: x.wallet, why: `vote dropped: ${x.error}` });

  const checks = harnessChecks(v.errors, v.errors.some((e) => !/claimed balances/.test(e)));
  for (const x of counted.filter((x) => !x.agreesWithHarness)) {
    disagreements.push(harnessValid ? `${x.wallet} rejected a block that passes every harness check` : `${x.wallet} approved a block the harness rejects`);
  }
  if (prediction) {
    const wrongClaim = Object.keys(prediction.balances).filter((k) => prediction.balances[k] !== p.balances[k]);
    if (wrongClaim.length) disagreements.push(`svmLLM's post-state differs from the leader's claim for ${wrongClaim.join(", ")}`);
    if (v.computedBalances && !sameBalances(prediction.balances, v.computedBalances)) {
      disagreements.push("svmLLM's post-state differs from the ledger: the transfer program moves lamports, but nonce and signature rules live in the harness");
    }
    if (!sameBalances(prediction.balances, reference.balances)) disagreements.push("svmLLM weights output differs from its reference interpreter");
  }
  if (harnessValid && !quorum) disagreements.push("valid block, but the swarm did not reach a 2/3 stake quorum");

  let next = state;
  let outcome: SlotOutcome;
  if (!harnessValid) {
    outcome = "skipped-invalid";
    dropped.unshift({ wallet: leader.wallet, why: "leader's block failed the harness checks" });
  } else if (!quorum) outcome = "skipped-no-quorum";
  else {
    next = appendBlock(state, mempool.map((m) => m.tx), v.block!);
    outcome = "confirmed";
  }

  const result: SlotResult = {
    ...base, draft, checks, harnessValid, ledgerBalances: v.computedBalances, prediction, reference,
    votes, stake, quorum, outcome, dropped, disagreements, costUsd: cost,
  };
  onEvent?.({ type: "done", result });
  return { state: next, result };
}
