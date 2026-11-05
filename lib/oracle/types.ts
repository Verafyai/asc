/** Oracle types. Play money only: "PLAY" units have no value. */

export interface Party { id: string; label: string; role: string }

/** One payout leg. Fixed `amount`, or `variable` with a hard `max` the escrow enforces. */
export interface PayoutLeg { to: string; amount?: number; variable?: boolean; max?: number }

export interface Outcome { id: string; description: string; payouts: PayoutLeg[] }

export interface EvidenceSource { id: string; description: string; kind: "url" | "document" | "data" }

export interface JudgmentClause {
  id: string;
  question: string; // what the swarm must decide, in plain English
  allowedOutcomes: string[]; // subset of outcome ids. Anything else is an invalid vote.
  guidance?: string; // how to read the evidence, from the English contract
}

/** The machine-checkable form of an English contract. The escrow only ever reads this. */
export interface ContractSpec {
  version: 1;
  title: string;
  summary: string;
  parties: Party[];
  escrow: { asset: "PLAY"; amount: number; funder: string };
  deadline: string; // ISO 8601
  evidenceSources: EvidenceSource[];
  outcomes: Outcome[];
  judgmentClauses: JudgmentClause[];
  hardLimits: { maxTotalPayout: number; maxSingleTransfer?: number };
  defaultOutcome: string; // applied at the deadline if the swarm never reaches quorum
}

export interface EvidenceDoc {
  id: string;
  label: string;
  source: string; // URL or description
  provenance: "fetched" | "illustrative"; // fetched = real page snapshot; illustrative = written for the demo
  fetchedAt?: string;
  text: string; // the snapshot the models saw
}

export interface EvidenceRef { id: string; label: string; source: string; provenance: EvidenceDoc["provenance"]; sha256: string; bytes: number; fetchedAt?: string }

export type IdentityProof =
  | "unproven provider attestation" // closed weights, hosted by the provider
  | "open weights, hosted: unproven" // open weights, but we called a hosted endpoint, so no proof
  | "FlashProve-supported family: proof not generated"; // Llama 4 Maverick

export interface Operator {
  id: string; // operator name, e.g. "op-gpt-5-mini"
  model: string; // OpenRouter model id requested
  family: string;
  weights: "open" | "closed";
  identityProof: IdentityProof;
}

export interface ModelAnswer {
  outcome: string; // an allowed outcome id, or "NA"
  amount: number | null; // for variable payouts
  confidence: number;
  reasoning: string;
  injectionSuspected: boolean;
}

export interface RawCall { text: string | null; ms: number; costUsd: number; servedModel?: string; error?: string }

export interface Commit { operator: string; pubkey: string; commitment: string; sig: string }

export type RevealStatus = "counted" | "na" | "invalid";
export interface Reveal {
  operator: string;
  status: RevealStatus;
  why?: string; // for na/invalid: why it was dropped
  outcome?: string;
  amount?: number | null;
  confidence?: number;
  reasoningHash?: string;
  injectionSuspected?: boolean;
  salt: string;
  answerHash: string; // sha256 of the canonical answer (or of the raw text for invalid replies)
}

export interface Tally {
  committee: number;
  counted: number;
  na: number;
  invalid: number;
  byOutcome: Record<string, number>;
  threshold: string; // "2/3"
  minCounted: number;
  quorum: boolean;
  winner: string | null;
  share: number; // winner share of counted votes
  amount: number | null; // median of the winning bloc's amounts, before caps
}

export interface PayoutLine { to: string; requested: number; paid: number; capped: boolean }
export interface EscrowCheck { name: string; ok: boolean; detail?: string }
export interface Settlement {
  outcome: string | null;
  status: "settled" | "rejected" | "no-quorum";
  payouts: PayoutLine[];
  total: number;
  checks: EscrowCheck[];
}

export interface JudgmentRecord {
  v: 1;
  kind: "swarmchain.judgment";
  contractId: string;
  clauseId: string;
  question: string;
  allowedOutcomes: string[];
  evidence: EvidenceRef[];
  promptHash: string;
  committee: (Operator & { pubkey: string; servedModel?: string })[];
  commitSetHash: string;
  commits: Commit[];
  reveals: Reveal[];
  tally: Tally;
  dissent: { operator: string; outcome: string }[];
  settlement: Settlement;
  round: "initial" | "dispute";
  priorRecordHash?: string; // for a dispute round: the record being re-judged
  harness: { version: string };
  createdAt: string;
}

export interface QuorumSig { operator: string; pubkey: string; sig: string }

export interface SignedRecord {
  record: JudgmentRecord;
  recordHash: string;
  quorumSigs: QuorumSig[]; // winning-bloc operators sign the record hash
  harnessSig: { pubkey: string; sig: string };
}

/** Everything the page needs to replay a judgment, including texts that are only hashed in the record. */
export interface JudgmentRun {
  signed: SignedRecord;
  raw: Record<string, RawCall>; // operator -> raw reply
  reasoning: Record<string, string>; // operator -> reasoning text (hash is in the record)
  salts: Record<string, string>;
  prompt: string;
  costUsd: number;
}
