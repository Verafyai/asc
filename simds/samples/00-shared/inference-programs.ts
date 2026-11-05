// @verafy/asc: the client for inference programs (Actually Smart Contracts).
// Planned SDK. Every type and call here maps one to one onto an account or an
// instruction in the SIMD draft "Inference Programs and Verifiable Inference".
// Illustrative until the SDK ships. Amounts are lamports.

import type { PublicKey } from '@solana/web3.js';

// ---------- Content: one prompt or one context document ----------

export type Storage =
  | { inline: string }                                   // storage_kind 0
  | { external: { ref: string; sha256: string } }        // 1, e.g. an IQ Labs inscription
  | { link: string }                                     // 2, snapshotted before use
  | { git: { repo: string; commit: string; path: string } }; // 3, pinned at a commit

export interface Encoding {
  compact?: boolean;   // bit 0: a terse compiled form the model reads directly
  compress?: boolean;  // bit 1: zstd
  encrypt?: boolean;   // bit 2: readable only by the program's evaluator set
}

export type ContextKind =
  | 'constitution' | 'standard' | 'regulation' | 'contract_terms'
  | 'internal_policy' | 'rules' | 'discussion' | 'web_page' | 'other';

export interface ContextEntry {
  kind: ContextKind;
  label: string;        // up to 32 bytes, e.g. "EDO v1.0"
  storage: Storage;
  encoding?: Encoding;
  tokenEstimate?: number;
}

// ---------- The inference program ----------

export type Mutability = 'mutable' | 'timelocked' | 'frozen';
export type Assurance = 'L0' | 'L1' | 'L2';  // signatures / diverse families / proven

export interface CreateInferenceProgram {
  name: string;
  prompt: { storage: Storage; encoding?: Encoding };    // Appendix A format
  context: ContextEntry[];                              // internal context, in order
  mutability: Mutability;
  updateTimelockSlots?: number;                         // when timelocked
  contextBudget: number;                                // tokens evaluators must accept
  externalContext: {
    mode: 'none' | 'optional' | 'required';
    kinds: ContextKind[];                               // what callers may inject
    budget: number;                                     // tokens
  };
  minimums: { evaluators: number; quorum: number; assurance: Assurance; distinctFamilies: boolean };
  evaluatorSet?: PublicKey[];                           // required if anything is encrypted
}

// ---------- A call ----------

export interface JurySpec {
  evaluators: number;           // n attestations sought
  quorum: number;               // k must agree
  assurance: Assurance;
  distinctFamilies?: boolean;
  allowedFamilies?: string[];   // e.g. ['gpt', 'claude', 'gemini']; empty = any
  allowedModels?: PublicKey[];  // ModelCommitment accounts; empty = any
  maxFeeEach?: number;          // most any one evaluator may be paid
}

export type CallbackEvent = 'final' | 'needs_funds' | 'expired' | 'disputed';

export interface RequestRuling {
  program: PublicKey;
  requestPrompt: string;                 // the question for this call, up to 1,024 bytes
  input: unknown;                        // the exact action; its sha256 is input_hash
  externalContext?: {
    entries: ContextEntry[];             // up to 8: links (snapshotted), text, documents
    note?: string;                       // up to 512 bytes inline
  };
  evidence?: Record<string, unknown>;    // hashed into evidence_hash
  jury: JurySpec;                        // can narrow the program's jury, never widen it
  maxInputTokens: number;
  maxOutputTokens: number;
  budget: number;                        // lamports escrowed; must be >= the quote
  refundTo?: PublicKey;
  callback?: { program: PublicKey; events: CallbackEvent[] };
  topupWindowSlots?: number;
}

export interface Quote {
  total: number;                         // lamports
  evaluators: { family: string; base: number; tokens: number; proof: number }[];
  verifiers: number;
  rent: number;                          // refunded at CloseRequest
}

// ---------- The signed ruling ----------

export interface Source {
  kind: 'context' | 'evidence' | 'prompt' | 'external';
  contentHash: string;                   // must match something the jury was given
  locator: string;                       // e.g. "Art. 1, rule 2"
}

export interface Ruling {
  address: PublicKey;
  status: 'awaiting_opinion' | 'final' | 'disputed' | 'overturned' | 'upheld';
  outcome: string;
  assurance: Assurance;                  // the level actually reached
  certainty: { agreeing: number; answered: number; confidenceMean: number; confidenceMin: number };
  pinned: { promptHash: string; contextHash: string; extContextHash: string; inputHash: string };
  summary: string;                       // up to 512 bytes
  reasoning: { sha256: string; ref: string };
  sources: Source[];                     // up to 16, checked on chain
  signatures: { evaluator: PublicKey; family: string; signature: string }[];
  signoffs: { evaluator: PublicKey; signature: string }[];
  dissents: { evaluator: PublicKey; outcome: string; statementRef: string }[];
  payment: { quoted: number; spent: number; refunded: number };
}

export interface InferencePrograms {
  createContent(c: ContextEntry | { storage: Storage; encoding?: Encoding }): Promise<PublicKey>;
  snapshotLink(content: PublicKey): Promise<{ sha256: string; slot: number }>;
  createInferenceProgram(p: CreateInferenceProgram): Promise<PublicKey>;
  setPrompt(program: PublicKey, prompt: PublicKey): Promise<void>;      // staged if timelocked
  setContext(program: PublicKey, entries: ContextEntry[]): Promise<void>;
  setMutability(program: PublicKey, m: Mutability): Promise<void>;      // only toward frozen
  quoteRuling(r: Omit<RequestRuling, 'budget'>): Promise<Quote>;        // QuoteRuling, simulated
  requestRuling(r: RequestRuling): Promise<{ request: PublicKey }>;
  topUp(request: PublicKey, lamports: number): Promise<void>;
  waitForRuling(request: PublicKey, opts?: { timeoutMs?: number }): Promise<Ruling>;
  openDispute(ruling: PublicKey, jury: JurySpec, budget: number): Promise<{ request: PublicKey }>;
  closeRequest(request: PublicKey): Promise<{ paid: number; refunded: number }>;
}

export declare const ip: InferencePrograms;

// The sha256 of the exact action, as the calling program will recompute it.
export declare function inputHash(input: unknown): string;
