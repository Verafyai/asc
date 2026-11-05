import type { ContractSpec } from "@/lib/oracle/types";
import type { DemoRecord } from "@/lib/oracle/demo-types";
import { auditRounds } from "@/lib/oracle/demo-types";
import { b58s, pt, usd } from "@/lib/ui";

export default function SpecView({ demo }: { demo: DemoRecord }) {
  const { spec, contractId } = demo.compile;
  const audits = auditRounds(demo.compile);
  const last = audits[audits.length - 1];
  const party = (id: string) => spec.parties.find((p) => p.id === id)?.label ?? id;
  return (
    <div className="grid2">
      <div className="card">
        <p className="eyebrow">The contract, in English</p>
        <pre className="raw" style={{ maxHeight: 420 }}>{demo.english}</pre>
        <p className="muted">Compiled by {demo.compile.attempts?.[0]?.model ?? "claude-haiku-4.5"} in {demo.compile.attempts?.length ?? 1} attempt(s), then audited against the English by a second model family ({last?.model ?? "gpt-5-mini"}). Compile cost {usd(demo.compile.costUsd)}. Recorded {pt(demo.recordedAt)}.</p>
        <p className="eyebrow" style={{ marginTop: 16 }}>Auditor&apos;s verdict</p>
        {audits.map((a, i) => (
          <div key={i} className={`callout ${a.faithful ? "" : "bad"}`} style={{ marginBottom: 8 }}>
            <b>Round {i + 1}: {a.faithful ? "faithful to the English" : "not faithful"}</b>
            {a.issues.length > 0 && <ul>{a.issues.map((x) => <li key={x}>{x}</li>)}</ul>}
          </div>
        ))}
        {last && (last.issues.length > 0 || !last.faithful) && <p className="muted">The auditor still raised points, shown unedited above. In a real deployment a human party signs off on the spec before funds are escrowed. The compiler is not trusted to be right.</p>}
      </div>
      <div className="card">
        <p className="eyebrow">Compiled spec: the only thing the escrow reads</p>
        <p><b>{spec.title}</b></p>
        <p className="mono muted">contract id {b58s(contractId, 14)} = sha256(spec)</p>
        <table className="tbl"><tbody>
          <tr><th>Parties</th><td style={{ whiteSpace: "normal" }}>{spec.parties.map((p) => `${p.label} (${p.role})`).join(", ")}</td></tr>
          <tr><th>Escrow</th><td>{spec.escrow.amount.toLocaleString()} PLAY from {party(spec.escrow.funder)}</td></tr>
          <tr><th>Hard caps</th><td>max total {spec.hardLimits.maxTotalPayout.toLocaleString()}{spec.hardLimits.maxSingleTransfer ? ` · max single transfer ${spec.hardLimits.maxSingleTransfer.toLocaleString()}` : ""}</td></tr>
          <tr><th>Deadline</th><td>{spec.deadline} · default <span className="mono">{spec.defaultOutcome}</span></td></tr>
          <tr><th>Evidence</th><td style={{ whiteSpace: "normal" }}>{spec.evidenceSources.map((e) => e.description).join("; ")}</td></tr>
        </tbody></table>
        <p className="eyebrow" style={{ marginTop: 12 }}>Outcomes and payouts</p>
        <table className="tbl"><tbody>
          {spec.outcomes.map((o) => (
            <tr key={o.id}><td className="mono">{o.id}</td><td style={{ whiteSpace: "normal" }}>{o.payouts.length ? o.payouts.map((p) => `${party(p.to)}: ${p.variable ? `variable, max ${p.max?.toLocaleString()}` : p.amount?.toLocaleString()}`).join(" · ") : "no transfer, funds stay in escrow"}</td></tr>
          ))}
        </tbody></table>
        {spec.judgmentClauses.map((c) => (
          <div key={c.id} className="callout" style={{ marginTop: 12 }}>
            <b>AI judgment clause <span className="mono">{c.id}</span></b>
            <p style={{ margin: "6px 0" }}>{c.question}</p>
            {c.guidance && <p className="muted" style={{ margin: 0 }}>{c.guidance}</p>}
            <p className="mono muted" style={{ margin: "6px 0 0" }}>allowed: {c.allowedOutcomes.join(" | ")}</p>
          </div>
        ))}
        <details style={{ marginTop: 8 }}><summary>Spec JSON</summary><pre className="raw">{JSON.stringify(spec, null, 1)}</pre></details>
      </div>
    </div>
  );
}
