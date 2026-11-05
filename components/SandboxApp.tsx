"use client";
import { useEffect, useMemo, useState } from "react";
import { PRICING, juryRunCredits } from "@/config/pricing";
import { rateLimitOk, simulate, TEMPLATES, type Behavior, type SimResult } from "@/lib/sandbox/simulate";
import QuoteDialog, { type QuoteView } from "@/components/QuoteDialog";

const BEHAVIORS: { id: Behavior; label: string }[] = [
  { id: "honest", label: "All jurors honest" },
  { id: "hijacked", label: "One juror hijacked" },
  { id: "injection", label: "Prompt injection in the evidence" },
  { id: "poisoned", label: "Poisoned evidence (forged correction)" },
  { id: "timeout", label: "One juror times out" },
  { id: "split", label: "Jurors split 3 to 2" },
];

function readQuery(): { template: string; rules: string; request: string; behaviors: Behavior[]; jurors: number; quorum: number } | null {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search);
  if (!q.get("rules") && !q.get("t")) return null;
  const behaviors = (q.get("b") ?? "honest").split(",").filter(Boolean) as Behavior[];
  return {
    template: q.get("t") ?? "custom",
    rules: q.get("rules") ?? TEMPLATES[0].rules,
    request: q.get("req") ?? TEMPLATES[0].request,
    behaviors: behaviors.length ? behaviors : ["honest"],
    jurors: Number(q.get("n") ?? 5),
    quorum: Number(q.get("q") ?? 4),
  };
}

export default function SandboxApp() {
  const first = TEMPLATES[0];
  const [templateId, setTemplateId] = useState(first.id);
  const [rules, setRules] = useState(first.rules);
  const [request, setRequest] = useState(first.request);
  const [behaviors, setBehaviors] = useState<Behavior[]>(["hijacked"]);
  const [jurors, setJurors] = useState(5);
  const [quorum, setQuorum] = useState(4);
  const [result, setResult] = useState<SimResult | null>(null);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState<QuoteView | null>(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const q = readQuery();
    if (!q) return;
    setTemplateId(q.template);
    setRules(q.rules);
    setRequest(q.request);
    setBehaviors(q.behaviors);
    setJurors(q.jurors);
    setQuorum(q.quorum);
  }, []);

  const price = juryRunCredits(jurors);

  function toggle(id: Behavior) {
    setBehaviors((cur) => {
      const has = cur.includes(id);
      if (id === "honest") return has ? cur.filter((x) => x !== "honest") : ["honest"];
      const next = has ? cur.filter((x) => x !== id) : [...cur.filter((x) => x !== "honest"), id];
      return next.length ? next : ["honest"];
    });
  }

  function applyTemplate(id: string) {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setTemplateId(id);
    setRules(t.rules);
    setRequest(t.request);
    setResult(null);
  }

  function runSim() {
    setError("");
    const gate = rateLimitOk();
    if (!gate.ok) {
      setError("Rate limit: 60 simulations per minute in this browser.");
      return;
    }
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(request) as Record<string, unknown>; }
    catch { setError("Request is not valid JSON."); return; }
    const sim = simulate({ rules, request: parsed, behaviors, jurors, quorum });
    setResult(sim);
  }

  async function openQuote(action: "jury_run" | "compile") {
    const res = await fetch("/api/quote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, jurors }),
    });
    const q = await res.json() as QuoteView;
    setQuote(q);
  }

  const shareUrl = useMemo(() => {
    const q = new URLSearchParams({
      t: templateId,
      rules,
      req: request,
      b: behaviors.join(","),
      n: String(jurors),
      q: String(quorum),
    });
    return `/sandbox?${q.toString()}`;
  }, [templateId, rules, request, behaviors, jurors, quorum]);

  return (
    <div className="d-wrap d-sandbox" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, paddingBottom: 48 }}>
      <div className="d-card">
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <b>1. Rules</b>
          <span className="d-dim" style={{ marginLeft: "auto" }}>Template:</span>
          {TEMPLATES.map((t) => (
            <button key={t.id} type="button" className={`d-tag ${templateId === t.id ? "real" : ""}`} onClick={() => applyTemplate(t.id)}>{t.label}</button>
          ))}
        </div>
        <textarea className="d-pre" style={{ marginTop: 12 }} value={rules} onChange={(e) => { setRules(e.target.value); setTemplateId("custom"); }} />
        <b style={{ display: "block", marginTop: 16 }}>2. Request</b>
        <textarea className="d-pre" style={{ marginTop: 8, minHeight: 90 }} value={request} onChange={(e) => setRequest(e.target.value)} />
        <b style={{ display: "block", marginTop: 16 }}>3. Jury behavior</b>
        {BEHAVIORS.map((b) => (
          <label key={b.id} className="d-check">
            <span className={`d-box ${behaviors.includes(b.id) ? "on" : ""}`} />
            <input type="checkbox" checked={behaviors.includes(b.id)} onChange={() => toggle(b.id)} style={{ position: "absolute", opacity: 0 }} />
            {b.label}
          </label>
        ))}
        <div className="d-grid2" style={{ marginTop: 12 }}>
          <label className="d-dim" style={{ fontSize: 14 }}>Jury size {jurors}
            <input className="d-slider" type="range" min={3} max={9} value={jurors} onChange={(e) => { const n = Number(e.target.value); setJurors(n); if (quorum > n) setQuorum(n); }} />
          </label>
          <label className="d-dim" style={{ fontSize: 14 }}>Quorum {quorum}
            <input className="d-slider" type="range" min={1} max={jurors} value={quorum} onChange={(e) => setQuorum(Number(e.target.value))} />
          </label>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <button type="button" className="d-btn p" onClick={runSim}>Run simulation · free</button>
          <button type="button" className="d-btn g" onClick={() => openQuote("jury_run")}>Run with the real jury · {price} credits</button>
        </div>
        <div className="d-dim" style={{ fontSize: 13, marginTop: 8 }}>Real runs need sign-in and credits. The price is shown before you confirm. Compile of free-text rules is quoted at {PRICING.compileCredits} credits and is not run here.</div>
        {error && <p className="d-no" style={{ marginTop: 12 }}>{error}</p>}
      </div>
      <Result result={result} onShare={async () => { const url = `${window.location.origin}${shareUrl}`; await navigator.clipboard.writeText(url); setCopied("Link copied"); }} onCode={async () => { await navigator.clipboard.writeText(codeSnippet(request, jurors, quorum)); setCopied("Code copied"); }} copied={copied} onCompile={() => openQuote("compile")} />
      {quote && (
        <QuoteDialog
          quote={quote}
          onClose={() => setQuote(null)}
          onConfirm={async () => {
            const res = await fetch("/api/runs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ quoteId: quote.id, jurors, quorum }) });
            const body = await res.json() as { message: string; charged: number };
            return `${body.message} Charged: ${body.charged} credits.`;
          }}
        />
      )}
    </div>
  );
}

function Result({ result, onShare, onCode, copied, onCompile }: { result: SimResult | null; onShare: () => void; onCode: () => void; copied: string; onCompile: () => void }) {
  if (!result) {
    return (
      <div className="d-card">
        <b>Result</b>
        <p className="d-mut">Run a simulation. Nothing is inscribed and no model is called.</p>
      </div>
    );
  }
  const tone = result.ruling === "allow" ? "d-ok" : "d-no";
  const label = result.ruling === "allow" ? "Allowed" : result.ruling === "no_quorum" ? "No quorum" : "Refused";
  return (
    <div className="d-card">
      <div style={{ display: "flex", alignItems: "center" }}><b>Result</b><span className={`d-tag ${result.mode === "stub" ? "ill" : ""}`} style={{ marginLeft: 8 }}>{result.mode === "stub" ? "keyword check" : result.mode}</span></div>
      <div className={tone} style={{ marginTop: 12 }}>
        <div className={result.ruling === "allow" ? "d-okt" : "d-not"} style={{ fontSize: 20 }}>{label} · {result.allow} of {result.counted} · quorum {result.quorum}</div>
        <div className="d-dim" style={{ fontSize: 14, marginTop: 2 }}>{result.note}</div>
      </div>
      {result.votes.map((v) => (
        <div className="d-vote" key={v.name}>
          <b style={{ width: 90 }}>{v.name}</b>
          <span className={`d-tag ${v.vote === "allow" ? "real" : "bad"}`}>{v.vote}</span>
          <span className="d-mut" style={{ fontSize: 15, flex: 1 }}>{v.reason}</span>
          <span className="d-dim" style={{ fontSize: 13 }}>{v.label}</span>
        </div>
      ))}
      {result.mode === "stub" && <button type="button" className="d-btn g sm" style={{ marginTop: 12 }} onClick={onCompile}>Compile (real, {PRICING.compileCredits} credits)</button>}
      <details className="d-fold" style={{ marginTop: 14 }}><summary>Compiled steps</summary><pre className="d-pre">{result.steps.length ? JSON.stringify(result.steps, null, 1) : "No precompiled steps. Keyword check only."}</pre></details>
      <details className="d-fold" style={{ marginTop: 8 }}><summary>What the real run would inscribe and sign</summary><pre className="d-pre">{JSON.stringify(result.attestations, null, 1)}</pre></details>
      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <button type="button" className="d-btn g sm" onClick={onShare}>Share this simulation</button>
        <button type="button" className="d-btn g sm" onClick={onCode}>Copy as code</button>
        {copied && <span className="d-dim" style={{ fontSize: 13 }}>{copied}</span>}
      </div>
    </div>
  );
}

function codeSnippet(request: string, jurors: number, quorum: number): string {
  let action: string = request.trim() || "{}";
  try { action = JSON.stringify(JSON.parse(action), null, 2).replace(/\n/g, "\n  "); } catch { /* keep as typed */ }
  const tier = jurors <= 3 ? "fast" : jurors >= 7 ? "frontier" : "standard";
  return `// Planned SDK (@verafy/asc). Publish these rules first to get an ASC id.
import { Asc } from '@verafy/asc';
const asc = new Asc({ apiKey });

const ruling = await asc.requestRuling({
  asc: 'asc_your_rules_v1',
  action: ${action},
  evidence: {},
  jury: { size: ${jurors}, quorum: ${quorum}, tier: '${tier}' },
});
// ruling.outcome is one of the outcomes your ASC lists
`;
}
