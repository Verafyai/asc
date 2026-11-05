import { extractJson } from "../parse";
import { contractId, validateSpec, type SpecIssue } from "./spec";
import type { ContractSpec, RawCall } from "./types";

export const SPEC_SCHEMA = `{
  "version": 1,
  "title": string,
  "summary": string (one or two sentences),
  "parties": [{"id": snake_case string, "label": string, "role": string}],
  "escrow": {"asset": "PLAY", "amount": number, "funder": party id},
  "deadline": ISO 8601 datetime,
  "evidenceSources": [{"id": string, "description": string, "kind": "url" | "document" | "data"}],
  "outcomes": [{"id": snake_case string, "description": string,
     "payouts": [{"to": party id, "amount": number} | {"to": party id, "variable": true, "max": number}]}],
  "judgmentClauses": [{"id": string, "question": string, "allowedOutcomes": [outcome ids], "guidance": string}],
  "hardLimits": {"maxTotalPayout": number, "maxSingleTransfer": number (optional)},
  "defaultOutcome": outcome id
}`;

export function compilePrompt(english: string, issues?: SpecIssue[], auditIssues?: string[], previous?: ContractSpec): string {
  return [
    `Compile this plain-English contract into a machine-checkable JSON spec. A deterministic escrow will enforce the spec; a committee of AI judges will answer the judgment clauses from evidence.`,
    `Rules:
- Play money only: asset is always "PLAY". No tokens, no wallets.
- Every party that can receive money must be listed in "parties". Use only amounts and caps the contract states; if the contract states a percentage, convert it to a number.
- Every subjective or factual condition ("material", "delayed", "passed", "meets the bar") becomes a judgment clause whose allowedOutcomes are the only answers the judges may give.
- Prefer exactly ONE judgment clause whose allowedOutcomes cover every outcome. Fold exclusions and sub-conditions into that clause's question and guidance. Add a second clause only if the contract has a truly separate decision.
- Payout amounts the judges must estimate are "variable" with an explicit numeric "max" from the contract.
- hardLimits.maxTotalPayout must not exceed the escrow. Pick the contract's stated fallback as defaultOutcome, or the outcome that returns funds to the funder.
- Do not invent terms the contract does not state; put any ambiguity in a clause's "guidance".`,
    `Schema:\n${SPEC_SCHEMA}`,
    `Contract:\n"""\n${english}\n"""`,
    previous ? `Your previous spec:\n${JSON.stringify(previous)}` : "",
    auditIssues?.length ? `An independent auditor compared your previous spec with the English and found these problems. Fix the ones that are real; do not add terms the English does not state:\n${auditIssues.map((i) => `- ${i}`).join("\n")}` : "",
    issues?.length ? `Your previous spec failed these deterministic checks. Fix them:\n${issues.map((i) => `- ${i.path}: ${i.problem}`).join("\n")}` : "",
    `Reply with ONLY the JSON object.`,
  ].filter(Boolean).join("\n\n");
}

export function auditPrompt(english: string, spec: ContractSpec): string {
  return [
    `You audit a compiler. Below is a plain-English contract and the JSON spec another AI compiled from it. A deterministic escrow will enforce only the spec.`,
    `Check: are the parties, amounts, caps, deadline, outcomes and judgment clauses faithful to the English? List anything missing, invented, or that could pay someone the English does not entitle.`,
    `English:\n"""\n${english}\n"""`,
    `Spec:\n${JSON.stringify(spec, null, 1)}`,
    `Reply with ONLY JSON: {"faithful": true|false, "issues": ["<short issue>", ...]}`,
  ].join("\n\n");
}

export interface CompileResult {
  english: string;
  spec: ContractSpec | null;
  contractId: string | null;
  issues: SpecIssue[];
  attempts: { model: string; raw: RawCall; issues: SpecIssue[] }[];
  audit: { model: string; raw: RawCall; faithful: boolean | null; issues: string[] } | null;
  audits: { model: string; raw: RawCall; faithful: boolean | null; issues: string[] }[]; // every audit round; the last one is "audit"
  costUsd: number;
}

export async function compileContract(english: string, call: (model: string, prompt: string, maxTokens: number) => Promise<RawCall>, compiler: string, auditor: string, auditRounds = 2): Promise<CompileResult> {
  const attempts: CompileResult["attempts"] = [];
  const audits: CompileResult["audits"] = [];
  let spec: ContractSpec | null = null;
  let issues: SpecIssue[] = [];
  let auditIssues: string[] | undefined;
  for (let round = 0; round < auditRounds; round++) {
    const previous: ContractSpec | null = spec;
    let next: ContractSpec | null = null;
    for (let i = 0; i < 2; i++) {
      const raw = await call(compiler, compilePrompt(english, i ? issues : undefined, auditIssues, previous ?? undefined), 2500);
      const j = extractJson(raw.text);
      issues = j ? validateSpec(j) : [{ path: "", problem: raw.error ?? "no JSON in reply" }];
      attempts.push({ model: compiler, raw, issues });
      if (j && !issues.length) { next = j as unknown as ContractSpec; break; }
    }
    if (!next) break; // keep the last valid spec, if any
    spec = next;
    const raw = await call(auditor, auditPrompt(english, spec), 1500);
    const j = extractJson(raw.text);
    const a = { model: auditor, raw, faithful: typeof j?.faithful === "boolean" ? j.faithful : null, issues: Array.isArray(j?.issues) ? (j!.issues as unknown[]).map(String) : [] };
    audits.push(a);
    if (a.faithful !== false) break;
    auditIssues = a.issues;
  }
  const audit = audits.at(-1) ?? null;
  const costUsd = attempts.reduce((a, x) => a + x.raw.costUsd, 0) + audits.reduce((a, x) => a + x.raw.costUsd, 0);
  return { english, spec, contractId: spec ? contractId(spec) : null, issues: spec ? [] : issues, attempts, audit, audits, costUsd };
}
