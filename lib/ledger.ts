import { canonical, hashOf } from "./canonical";
import { pubkeyFor, secretFor, signHex, verifyHex } from "./keys";
import type { Account, Balances, Block, ChainState, Proposal, Tx, TxBody } from "./types";

export const GENESIS_BALANCE = 1000;
export const BLOCK_REWARD = 10;
export const MAX_TXS = 8;
export const MAX_SUMMARY = 200;
/** Metered cost of one transfer: the sBPF "Balance transfer" program from svmLLM exits after 12 instructions, 1 CU each. */
export const TRANSFER_CU = 12;
const GENESIS_TIME = Date.UTC(2026, 10, 2, 0, 0, 0);
export const SLOT_MS = 400;
export const ZERO_HASH = "0".repeat(64);

export function txId(body: TxBody): string {
  return hashOf(body);
}

export function signTx(body: TxBody, secret: Uint8Array = secretFor(body.from)): Tx {
  const id = txId(body);
  return { ...body, id, sig: signHex(id, secret) };
}

export function blockTimestamp(slot: number): string {
  return new Date(GENESIS_TIME + slot * SLOT_MS).toISOString();
}

/** The hash covers every field of the block except the hash itself. */
export function blockHash(b: Omit<Block, "hash">): string {
  return hashOf({
    slot: b.slot,
    height: b.height,
    prevHash: b.prevHash,
    timestamp: b.timestamp,
    proposer: b.proposer,
    txs: b.txs,
    reward: b.reward,
    computeUnits: b.computeUnits,
    summary: b.summary,
    balances: b.balances,
  });
}

export function genesis(accountIds: string[]): ChainState {
  const ids = [...new Set(accountIds)];
  const accounts: Account[] = ids.map((id) => ({ id, pubkey: pubkeyFor(id) }));
  const balances: Balances = Object.fromEntries(ids.map((id) => [id, GENESIS_BALANCE]));
  const body = {
    slot: 0,
    height: 0,
    prevHash: ZERO_HASH,
    timestamp: blockTimestamp(0),
    proposer: "genesis",
    txs: [],
    reward: 0,
    computeUnits: 0,
    summary: `Genesis: ${ids.length} play-money accounts with ${GENESIS_BALANCE} SOL each.`,
    balances,
  };
  const block: Block = { ...body, hash: blockHash(body) };
  return {
    accounts,
    blocks: [block],
    balances: { ...balances },
    nonces: Object.fromEntries(ids.map((id) => [id, 0])),
    includedTxIds: [],
  };
}

export function tip(state: ChainState): Block {
  return state.blocks[state.blocks.length - 1];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  block?: Block; // present when valid
  computedBalances?: Balances;
}

function sameBalances(a: Balances, b: Balances): boolean {
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  return canonical(ka) === canonical(kb) && ka.every((k) => a[k] === b[k]);
}

/** Checks one signed transaction in isolation: shape, id and signature. */
export function checkTx(state: ChainState, tx: Tx): string | null {
  const acct = (id: string) => state.accounts.find((a) => a.id === id);
  const from = acct(tx.from);
  if (!from) return `unknown sender ${tx.from}`;
  if (!acct(tx.to)) return `unknown recipient ${tx.to}`;
  if (tx.from === tx.to) return "sender and recipient are the same";
  if (!Number.isInteger(tx.amount) || tx.amount <= 0) return "amount must be a positive integer";
  if (!Number.isInteger(tx.nonce) || tx.nonce < 1) return "nonce must be a positive integer";
  const { id, sig, ...body } = tx;
  if (txId(body) !== id) return "tx id does not match its contents";
  if (!verifyHex(sig, id, from.pubkey)) return "bad signature";
  return null;
}

/**
 * The deterministic ledger. A model's proposal is valid only if every check passes:
 * it builds on the current tip, picks known, correctly signed, unspent transactions,
 * applies them in order without overspending or reusing a nonce, and states the exact
 * resulting balances (including the proposer's block reward).
 */
export function validateProposal(
  state: ChainState,
  mempool: Tx[],
  proposer: string,
  p: Proposal,
  slot?: number,
): ValidationResult {
  const errors: string[] = [];
  const head = tip(state);
  const atSlot = slot ?? head.slot + 1;
  if (!Number.isInteger(atSlot) || atSlot <= head.slot) errors.push(`slot ${atSlot} is not after the parent slot ${head.slot}`);
  if (!state.accounts.some((a) => a.id === proposer)) errors.push(`proposer ${proposer} has no wallet`);
  if (typeof p.prevHash !== "string" || p.prevHash !== head.hash) {
    errors.push(`prevHash does not match the tip (expected ${head.hash.slice(0, 12)}…)`);
  }
  if (!Array.isArray(p.txIds) || p.txIds.length === 0) errors.push("no transactions selected");
  else if (p.txIds.length > MAX_TXS) errors.push(`more than ${MAX_TXS} transactions`);
  if (typeof p.summary !== "string" || p.summary.trim().length === 0) errors.push("missing summary");
  else if (p.summary.length > MAX_SUMMARY) errors.push(`summary longer than ${MAX_SUMMARY} characters`);

  const balances: Balances = { ...state.balances };
  const nonces = { ...state.nonces };
  const txs: Tx[] = [];
  const seen = new Set<string>();
  const included = new Set(state.includedTxIds);

  for (const id of Array.isArray(p.txIds) ? p.txIds : []) {
    const short = String(id).slice(0, 10);
    if (seen.has(id)) { errors.push(`tx ${short} listed twice`); continue; }
    seen.add(id);
    if (included.has(id)) { errors.push(`tx ${short} is already on chain (replay)`); continue; }
    const tx = mempool.find((t) => t.id === id);
    if (!tx) { errors.push(`tx ${short} is not in the mempool`); continue; }
    const bad = checkTx(state, tx);
    if (bad) { errors.push(`tx ${short}: ${bad}`); continue; }
    if (tx.nonce !== nonces[tx.from] + 1) {
      errors.push(`tx ${short}: nonce ${tx.nonce}, expected ${nonces[tx.from] + 1} for ${tx.from}`);
      continue;
    }
    if (balances[tx.from] < tx.amount) {
      errors.push(`tx ${short}: ${tx.from} has ${balances[tx.from]}, cannot send ${tx.amount}`);
      continue;
    }
    balances[tx.from] -= tx.amount;
    balances[tx.to] += tx.amount;
    nonces[tx.from] = tx.nonce;
    txs.push(tx);
  }
  if (balances[proposer] !== undefined) balances[proposer] += BLOCK_REWARD;

  const claimed = p.balances && typeof p.balances === "object" ? p.balances : {};
  if (errors.length === 0 && !sameBalances(claimed, balances)) {
    const wrong = Object.keys(balances).filter((k) => claimed[k] !== balances[k]);
    errors.push(
      `claimed balances are wrong for ${wrong.join(", ") || "extra accounts"} (` +
        wrong.map((k) => `${k}: said ${claimed[k] ?? "nothing"}, actual ${balances[k]}`).join("; ") + ")",
    );
  }
  if (errors.length) return { valid: false, errors, computedBalances: balances };

  const body = {
    slot: atSlot,
    height: head.height + 1,
    prevHash: head.hash,
    timestamp: blockTimestamp(atSlot),
    proposer,
    txs,
    reward: BLOCK_REWARD,
    computeUnits: txs.length * TRANSFER_CU,
    summary: p.summary.trim(),
    balances,
  };
  return { valid: true, errors: [], block: { ...body, hash: blockHash(body) }, computedBalances: balances };
}

/** Appends a block after re-running every check from scratch. Never trusts the caller. */
export function appendBlock(state: ChainState, mempool: Tx[], block: Block): ChainState {
  const r = validateProposal(state, mempool, block.proposer, {
    prevHash: block.prevHash,
    txIds: block.txs.map((t) => t.id),
    balances: block.balances,
    summary: block.summary,
  }, block.slot);
  if (!r.valid || !r.block || r.block.hash !== block.hash) {
    throw new Error(`refusing to append block: ${r.errors.join("; ") || "hash mismatch"}`);
  }
  const nonces = { ...state.nonces };
  for (const t of block.txs) nonces[t.from] = t.nonce;
  return {
    accounts: state.accounts,
    blocks: [...state.blocks, block],
    balances: { ...block.balances },
    nonces,
    includedTxIds: [...state.includedTxIds, ...block.txs.map((t) => t.id)],
  };
}

/** Full audit: recomputes every hash link and every balance from genesis. */
export function verifyChain(state: ChainState): { ok: boolean; error?: string } {
  const g = state.blocks[0];
  if (!g || g.height !== 0 || g.prevHash !== ZERO_HASH) return { ok: false, error: "bad genesis" };
  const { hash: gh, ...gbody } = g;
  if (blockHash(gbody) !== gh) return { ok: false, error: "genesis hash mismatch" };
  let replay: ChainState = {
    accounts: state.accounts,
    blocks: [g],
    balances: { ...g.balances },
    nonces: Object.fromEntries(state.accounts.map((a) => [a.id, 0])),
    includedTxIds: [],
  };
  for (const b of state.blocks.slice(1)) {
    try {
      replay = appendBlock(replay, b.txs, b);
    } catch (e) {
      return { ok: false, error: `block ${b.height}: ${(e as Error).message}` };
    }
  }
  if (!sameBalances(replay.balances, state.balances)) return { ok: false, error: "balances diverge from replay" };
  return { ok: true };
}
