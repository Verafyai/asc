import type { ContractSpec, EvidenceDoc, JudgmentRun } from "./types";
export interface AuditRound { model: string; faithful: boolean; issues: string[] }
export interface SvmSide { weightsMatchEscrow?: boolean; referenceMatchEscrow?: boolean; transfers?: { from: string; to: string; amount: number }[]; expected?: Record<string, number>; weights?: { balances: Record<string, number>; cu: number; ms: number; engine: string; weightsMatchReference: boolean } ; error?: string }
export interface DemoScenario {
  id: string; label: string; note: string; guard?: boolean; evidence: EvidenceDoc[];
  initial: JudgmentRun; dispute: JudgmentRun; verdict: { verdict: "upheld" | "overturned" | "escalated"; detail: string };
  svm?: { initial?: SvmSide | null; dispute?: SvmSide | null };
}
export interface DemoRecord {
  slug: string; category: string; title: string; blurb: string; english: string;
  compile: { english: string; spec: ContractSpec; contractId: string; issues: string[]; attempts: any[]; audit: any; audits: any[]; costUsd: number };
  scenarios: DemoScenario[]; recordedAt: string; costUsd: number; calls: number; ms: number;
}
/** Auditor rounds normalised from the recording. */
export function auditRounds(c: DemoRecord["compile"]): AuditRound[] {
  const list = (c.audits?.length ? c.audits : c.audit ? [c.audit] : []) as any[];
  return list.map((a) => ({ model: a.model ?? "auditor", faithful: !!(a.faithful ?? a.parsed?.faithful), issues: (a.issues ?? a.parsed?.issues ?? []) as string[] }));
}
