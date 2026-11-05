export type Balances = Record<string, number>;

export interface Account {
  id: string; // wallet name, e.g. "gpt-4o-mini"
  pubkey: string; // ed25519 public key, hex
}

/** Unsigned transaction body. The id is the sha256 of its canonical JSON. */
export interface TxBody {
  from: string;
  to: string;
  amount: number; // integer play-money units. No real value.
  nonce: number; // sender's per-account counter, starts at 1
  memo: string;
}

export interface Tx extends TxBody {
  id: string;
  sig: string; // ed25519 signature over the id, hex
}

export interface Block {
  slot: number; // slot this block was produced in. Skipped slots leave gaps.
  height: number; // block height: count of blocks before this one
  prevHash: string;
  timestamp: string;
  proposer: string;
  txs: Tx[];
  reward: number;
  computeUnits: number; // metered cost of the block's transfers
  summary: string;
  balances: Balances; // post-state, as claimed by the proposer and verified by the ledger
  hash: string;
}

export interface ChainState {
  accounts: Account[];
  blocks: Block[]; // blocks[0] is genesis
  balances: Balances;
  nonces: Record<string, number>; // last used nonce per account
  includedTxIds: string[];
}

/** What a model proposes. Everything else in a block is derived by the ledger. */
export interface Proposal {
  prevHash: string;
  txIds: string[];
  balances: Balances;
  summary: string;
}
