"use client";
import { useEffect, useState } from "react";
import type { ContractSpec, EvidenceDoc, JudgmentRun } from "@/lib/oracle/types";
import RunView from "./RunView";

export default function LiveEditor({ example, exampleEvidence }: { example: string; exampleEvidence: string }) {
  const [live, setLive] = useState<boolean | null>(null);
  const [on, setOn] = useState(false);
  const [english, setEnglish] = useState(example);
  const [evidence, setEvidence] = useState(exampleEvidence);
  const [spec, setSpec] = useState<ContractSpec | null>(null);
  const [audit, setAudit] = useState<string[]>([]);
  const [run, setRun] = useState<JudgmentRun | null>(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => { fetch("/api/compile").then((r) => r.json()).then((j) => setLive(!!j.live)).catch(() => setLive(false)); }, []);
  async function post(path: string, body: unknown) {
    const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error ?? r.statusText);
    return j;
  }
  const compile = async () => { setErr(""); setBusy("Compiling and auditing (about 20 s)…"); setRun(null); try { const j = await post("/api/compile", { english }); setSpec(j.spec); setAudit((j.audits ?? []).flatMap((a: { issues: string[] }) => a.issues)); if (!j.spec) setErr(`compiler failed: ${JSON.stringify(j.issues)}`); } catch (e) { setErr(String((e as Error).message)); } setBusy(""); };
  const judge = async () => { setErr(""); setBusy("Six models commit, then reveal (about 30 s)…"); try { setRun(await post("/api/judge", { spec, evidence })); } catch (e) { setErr(String((e as Error).message)); } setBusy(""); };
  const ev: EvidenceDoc[] = [{ id: "user-evidence", label: "Evidence you pasted", source: "pasted by the visitor", provenance: "illustrative", text: evidence }];
  return (
    <div className="card stack">
      <div className="controls">
        <label><input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} disabled={!live} /> <b>Live mode</b> (real model calls, server-side)</label>
        {live === false && <span className="pill bad">live disabled on this preview</span>}
        {live && <span className="pill ok">live available</span>}
      </div>
      {live === false && <p className="muted">This deployment has no model key, so nothing here calls a model. Every run shown below the editor and on Recorded runs is a real recording. To try your own contract, run the repo locally with SWARM_LIVE=1.</p>}
      <label>Your contract, in plain English<textarea value={english} onChange={(e) => setEnglish(e.target.value)} rows={9} style={{ width: "100%", font: "var(--fs-0)/1.5 var(--font-mono)" }} disabled={!on} /></label>
      <button className="btn btn-primary" onClick={compile} disabled={!on || !!busy}>Compile to spec</button>
      {spec && (
        <>
          <pre className="raw">{JSON.stringify(spec, null, 1)}</pre>
          {audit.length > 0 && <div className="callout bad"><b>Auditor flags</b><ul>{audit.map((a) => <li key={a}>{a}</li>)}</ul></div>}
          <label>Evidence for the judgment clause<textarea value={evidence} onChange={(e) => setEvidence(e.target.value)} rows={6} style={{ width: "100%", font: "var(--fs-0)/1.5 var(--font-mono)" }} /></label>
          <button className="btn btn-primary" onClick={judge} disabled={!!busy}>Judge with the jury</button>
        </>
      )}
      {busy && <p className="pulse">{busy}</p>}
      {err && <p className="bad">{err}</p>}
      {run && spec && <RunView spec={spec} run={run} evidence={ev} title="Your live run" />}
    </div>
  );
}
