"use client";
import { useState } from "react";
import { vocab } from "@/lib/vocab";
import type { DemoRecord } from "@/lib/oracle/demo-types";
import RunView from "./RunView";
import CapsWhatIf from "./CapsWhatIf";

const VERDICT_CLASS = { upheld: "ok", overturned: "bad", escalated: "purple" } as const;

export default function DemoView({ demo }: { demo: DemoRecord }) {
  const [si, setSi] = useState(0);
  const [round, setRound] = useState<"initial" | "dispute">("initial");
  const sc = demo.scenarios[si];
  const spec = demo.compile.spec;
  const run = round === "initial" ? sc.initial : sc.dispute;
  const hasVariable = spec.outcomes.some((o) => o.payouts.some((p) => p.variable));
  return (
    <div className="stack">
      {demo.scenarios.length > 1 && (
        <div className="seg" role="group" aria-label="Scenario">{demo.scenarios.map((s, i) => <button key={s.id} aria-pressed={si === i} onClick={() => { setSi(i); setRound("initial"); }}>{s.label}</button>)}</div>
      )}
      <div className="callout"><b>{sc.label}.</b> {sc.note} {sc.guard === false && <span className="pill bad">untrusted-data warning removed from the prompt</span>}</div>
      <div className="controls">
        <div className="seg" role="group" aria-label="Round">
          <button aria-pressed={round === "initial"} onClick={() => setRound("initial")}>Jury A ruling</button>
          <button aria-pressed={round === "dispute"} onClick={() => setRound("dispute")}>Dispute: re-judge with jury B</button>
        </div>
        <span className={`pill ${VERDICT_CLASS[sc.verdict.verdict]}`}>dispute verdict: {sc.verdict.verdict}</span>
        <span className="muted">{vocab(sc.verdict.detail)}</span>
      </div>
      {round === "dispute" && <p className="muted">A dispute re-runs the same clause on the same evidence with a jury that shares no model family with jury A ({sc.dispute.signed.record.committee.map((c) => c.family).join(", ")}). The new record links the old one: prior {sc.dispute.signed.record.priorRecordHash?.slice(0, 12)}…. If the two juries disagree, the dispute escalates to the contract&apos;s fallback instead of picking a side.</p>}
      <RunView key={sc.id + round} spec={spec} run={run} evidence={sc.evidence} svm={round === "initial" ? sc.svm?.initial : sc.svm?.dispute} title={round === "initial" ? "Jury A: six model families" : "Jury B: four different families"} />
      {hasVariable && <CapsWhatIf key={sc.id + round} spec={spec} initialOutcome={run.signed.record.tally.winner} />}
    </div>
  );
}
