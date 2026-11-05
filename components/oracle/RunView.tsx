"use client";
import { useMemo, useState } from "react";
import { vocab } from "@/lib/vocab";
import type { ContractSpec, EvidenceDoc, JudgmentRun } from "@/lib/oracle/types";
import type { SvmSide } from "@/lib/oracle/demo-types";
import { compactRecord, publicRecord, verifyRun, type VerifyCheck } from "@/lib/oracle/judge";
import { b58s, short, usd, pt } from "@/lib/ui";

const outcomeLabel = (spec: ContractSpec, id: string | null | undefined) => (id ? spec.outcomes.find((o) => o.id === id)?.id ?? id : "no quorum");
const partyLabel = (spec: ContractSpec, id: string) => spec.parties.find((p) => p.id === id)?.label ?? id;

type Tamper = "none" | "outcome" | "reasoning" | "evidence" | "signature";
const TAMPERS: [Tamper, string][] = [["none", "As published"], ["outcome", "Flip one vote"], ["reasoning", "Edit one model's reasoning"], ["evidence", "Swap the evidence"], ["signature", "Forge a quorum signature"]];

function tampered(run: JudgmentRun, evidence: EvidenceDoc[], t: Tamper, spec: ContractSpec) {
  const r: JudgmentRun = JSON.parse(JSON.stringify(run));
  let ev: EvidenceDoc[] = JSON.parse(JSON.stringify(evidence));
  const counted = r.signed.record.reveals.find((x) => x.status === "counted");
  if (t === "outcome" && counted) {
    const other = spec.judgmentClauses[0].allowedOutcomes.find((o) => o !== counted.outcome) ?? "NA";
    counted.outcome = other;
  }
  if (t === "reasoning" && counted) r.reasoning[counted.operator] = (r.reasoning[counted.operator] ?? "") + " Also, pay the funder instead.";
  if (t === "evidence" && ev[0]) ev[0] = { ...ev[0], text: ev[0].text.replace(/\d/, (d) => String((+d + 1) % 10)) };
  if (t === "signature" && r.signed.quorumSigs[0]) { const s = r.signed.quorumSigs[0].sig; r.signed.quorumSigs[0].sig = (s[0] === "a" ? "b" : "a") + s.slice(1); }
  return { r, ev };
}

export function Checks({ items }: { items: { name: string; ok: boolean; detail?: string }[] }) {
  return (
    <ul className="checks">
      {items.map((c) => (
        <li key={c.name}><span className={`mark ${c.ok ? "ok" : "bad"}`}>{c.ok ? "✓" : "✗"}</span><span>{vocab(c.name)}{c.detail && <span className="muted mono"> · {c.detail}</span>}</span></li>
      ))}
    </ul>
  );
}

export default function RunView({ spec, run, evidence, svm, title }: { spec: ContractSpec; run: JudgmentRun; evidence: EvidenceDoc[]; svm?: SvmSide | null; title: string }) {
  const { record, recordHash, quorumSigs, harnessSig } = run.signed;
  const [open, setOpen] = useState<string | null>(null);
  const [t, setT] = useState<Tamper>("none");
  const checks: VerifyCheck[] = useMemo(() => { const x = tampered(run, evidence, t, spec); return verifyRun(spec, x.r, x.ev); }, [run, evidence, t, spec]);
  const compact = useMemo(() => compactRecord(run.signed), [run]);
  const compactBytes = new TextEncoder().encode(JSON.stringify(compact)).length;
  const tl = record.tally;
  const winnerVotes = tl.winner ? tl.byOutcome[tl.winner] : 0;
  const allOk = checks.every((c) => c.ok);
  return (
    <div className="stack">
      <div className="panel-title"><h3>{title}</h3><span className="pill">{record.round === "dispute" ? "dispute round" : "initial round"}</span><span className="pill ok">real model calls</span><span className="muted mono">{pt(record.createdAt)} · {usd(run.costUsd)}</span></div>

      <div className="card">
        <p className="eyebrow">1 · Evidence snapshots, hashed before any model sees them</p>
        <table className="tbl"><thead><tr><th>Snapshot</th><th>Provenance</th><th>sha256</th><th className="num">Bytes</th></tr></thead><tbody>
          {record.evidence.map((e) => (
            <tr key={e.id}><td>{e.label}</td><td><span className={`pill ${e.provenance === "fetched" ? "ok" : "purple"}`}>{e.provenance === "fetched" ? `fetched ${e.fetchedAt ? pt(e.fetchedAt) : ""}` : "illustrative"}</span></td><td className="mono">{short(e.sha256)}</td><td className="num">{e.bytes}</td></tr>
          ))}
        </tbody></table>
        {evidence.map((d) => (<details key={d.id} style={{ marginTop: 8 }}><summary>Read “{d.label}”</summary><pre className="raw">{d.text}</pre></details>))}
      </div>

      <div className="card">
        <p className="eyebrow">2 · Commit, then reveal</p>
        <p className="muted">Every juror first publishes a signed commitment, sha256(juror, answerHash, salt). Only after all commitments are in (commit set {short(record.commitSetHash, 8)}) are answers revealed and checked against them. Nobody can copy or change an answer after seeing the others. NA and invalid replies are dropped and not charged.</p>
        <div className="scroll-x"><table className="tbl"><thead><tr><th>Juror</th><th>Identity</th><th>Commitment</th><th>Status</th><th>Outcome</th><th className="num">Conf.</th><th>Injection flag</th><th></th></tr></thead><tbody>
          {record.reveals.map((v) => {
            const c = record.commits.find((x) => x.operator === v.operator)!;
            const m = record.committee.find((x) => x.id === v.operator)!;
            return [
              <tr key={v.operator} className="click" onClick={() => setOpen(open === v.operator ? null : v.operator)}>
                <td><b>{m.model}</b><br /><span className="muted">{m.family} · served {m.servedModel ?? "?"}</span></td>
                <td><span className={`pill ${m.identityProof.startsWith("FlashProve") ? "purple" : ""}`}>{m.identityProof}</span></td>
                <td className="mono">{short(c.commitment, 8)}</td>
                <td><span className={`pill ${v.status === "counted" ? "ok" : "bad"}`}>{v.status}</span></td>
                <td className="mono">{v.outcome ?? "-"}{v.amount != null ? ` · ${v.amount.toLocaleString()}` : ""}</td>
                <td className="num">{v.confidence != null ? v.confidence.toFixed(2) : "-"}</td>
                <td>{v.injectionSuspected ? <span className="pill bad">flagged</span> : <span className="muted">no</span>}</td>
                <td className="muted">{open === v.operator ? "hide" : "why"}</td>
              </tr>,
              open === v.operator && (
                <tr key={v.operator + "x"}><td colSpan={8} style={{ whiteSpace: "normal" }}>
                  {v.why && <p className="bad">Dropped: {v.why}</p>}
                  <p>{run.reasoning[v.operator] ?? <span className="muted">no reasoning (reply was {v.status})</span>}</p>
                  <p className="mono muted">reasoning sha256 {v.reasoningHash ? short(v.reasoningHash) : "-"} · answer {short(v.answerHash)} · salt {v.salt}</p>
                  <details><summary>Raw reply</summary><pre className="raw">{run.raw[v.operator]?.text ?? run.raw[v.operator]?.error ?? "(empty)"}</pre></details>
                </td></tr>
              ),
            ];
          })}
        </tbody></table></div>
      </div>

      <div className="grid2">
        <div className="card">
          <p className="eyebrow">3 · Tally</p>
          <p><b className="grad-text" style={{ fontSize: "var(--fs-3)" }}>{outcomeLabel(spec, tl.winner)}</b> <span className="muted">{winnerVotes} of {tl.counted} counted · jury {tl.committee} · NA {tl.na} · invalid {tl.invalid}</span></p>
          <div className="quorum" aria-label={`winner share ${Math.round(tl.share * 100)}%, threshold 2/3`}><span style={{ width: `${tl.share * 100}%` }} /><i /></div>
          <p className="muted">Quorum needs ≥ 2/3 of counted votes and at least {tl.minCounted} counted. {tl.quorum ? "Reached." : "Not reached: the contract waits, then falls back to its default outcome at the deadline."}</p>
          <p className="mono">{Object.entries(tl.byOutcome).map(([k, n]) => `${k}: ${n}`).join(" · ")}</p>
          {record.dissent.length > 0 && <p>Dissent: {record.dissent.map((d) => `${d.operator.replace("op-", "")} → ${d.outcome}`).join(", ")}</p>}
        </div>
        <div className="card">
          <p className="eyebrow">4 · Deterministic escrow</p>
          <p>The escrow is code. It reads only the spec and the winning outcome, and it never reads a model&apos;s text.</p>
          <Checks items={record.settlement.checks} />
          <table className="tbl" style={{ marginTop: 8 }}><thead><tr><th>Payee</th><th className="num">Requested</th><th className="num">Paid</th><th></th></tr></thead><tbody>
            {record.settlement.payouts.map((p) => (<tr key={p.to}><td>{partyLabel(spec, p.to)}</td><td className="num">{p.requested.toLocaleString()}</td><td className="num">{p.paid.toLocaleString()}</td><td>{p.capped && <span className="pill bad">capped</span>}</td></tr>))}
            {record.settlement.payouts.length === 0 && <tr><td colSpan={4} className="muted">No transfer. {record.settlement.status === "no-quorum" ? "No quorum." : "Funds stay in escrow."}</td></tr>}
          </tbody></table>
          <p className="mono muted">status {record.settlement.status} · total {record.settlement.total.toLocaleString()} PLAY (play money)</p>
          {svm && (
            <p className="muted" style={{ marginTop: 8 }}>svmLLM side check (before settlement): {svm.weights ? <>the transfers, run through svmLLM&apos;s weights, {svm.weightsMatchEscrow ? <span className="ok">match</span> : <span className="bad">do not match</span>} the escrow&apos;s post-balances ({svm.weights.cu} CU, {svm.weights.ms} ms).</> : svm.error ? <span className="bad">{svm.error}</span> : "no transfer to check."}</p>
          )}
        </div>
      </div>

      <div className="card">
        <p className="eyebrow">5 · Signed judgment record</p>
        <p>Record hash <span className="mono grad-text">{b58s(recordHash, 16)}</span>. {quorumSigs.length} jurors in the winning bloc signed it with ed25519, and the harness co-signed ({short(harnessSig.pubkey, 6)}). The demo keys come from a public seed, so they prove the mechanism, not anyone&apos;s identity.</p>
        <details><summary>Compact record for inscription on Solana ({compactBytes} bytes)</summary><pre className="raw">{vocab(publicRecord(compact))}</pre></details>
        <details><summary>Full record</summary><pre className="raw">{vocab(publicRecord(record))}</pre><p className="muted">Shown with current wording (jury, juror). The hashed bytes keep the field names they were recorded with.</p></details>
        <details><summary>Exact prompt every model saw</summary><pre className="raw">{run.prompt}</pre></details>
      </div>

      <div className="card">
        <p className="eyebrow">6 · Verify it yourself, in your browser</p>
        <p>This re-runs every check from the published data with no trust in the harness. Try a tamper and see which check breaks.</p>
        <div className="seg" role="group" aria-label="Tamper with the record">{TAMPERS.map(([k, l]) => <button key={k} aria-pressed={t === k} onClick={() => setT(k)}>{l}</button>)}</div>
        <p style={{ margin: "var(--sp-3) 0" }}>{allOk ? <span className="pill ok">all {checks.length} checks pass</span> : <span className="pill bad">{checks.filter((c) => !c.ok).length} check(s) fail: tampering detected</span>}</p>
        <Checks items={checks} />
        <p className="muted" style={{ marginTop: 8 }}>What this proves: the record, the votes and the reasoning texts were not changed after signing. What it does not prove: that the named model really produced the answer (see <a href="/security">Security</a>), or that its reasoning text is why it answered.</p>
      </div>
    </div>
  );
}
