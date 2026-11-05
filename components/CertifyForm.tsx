"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { certifyCredits } from "@/config/pricing";
import ComingSoon from "@/components/ComingSoon";
import QuoteDialog, { type QuoteView } from "@/components/QuoteDialog";
import example from "@/asc-standards/examples/certificate-EDO-example.json";

const STANDARDS = ["EDO", "EAO", "ETC", "EVC", "EMO"] as const;

export default function CertifyForm() {
  const params = useSearchParams();
  const initial = (params.get("standard") ?? "EDO").toUpperCase();
  const [repo, setRepo] = useState("demo-tv/firmware");
  const [commit, setCommit] = useState("9f3c2a1");
  const [standard, setStandard] = useState(STANDARDS.includes(initial as typeof STANDARDS[number]) ? initial : "EDO");
  const [files, setFiles] = useState(120);
  const [rules, setRules] = useState(standard === "EDO" ? 5 : 12);
  const [quote, setQuote] = useState<QuoteView | null>(null);
  const [showExample, setShowExample] = useState(true);

  const credits = useMemo(() => certifyCredits(rules, files), [rules, files]);
  const isExample = repo.trim() === "demo-tv/firmware" && standard === "EDO";

  async function estimate() {
    const res = await fetch("/api/quote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "certify", rules, files }),
    });
    setQuote(await res.json());
    setShowExample(isExample);
  }

  return (
    <>
      <div className="d-wrap" style={{ paddingBottom: 26 }}>
        <div className="d-card d-cert-form" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
          <label><div className="d-dim" style={{ fontSize: 13 }}>GitHub repo</div><input className="d-field" value={repo} onChange={(e) => setRepo(e.target.value)} /></label>
          <label><div className="d-dim" style={{ fontSize: 13 }}>Push (commit)</div><input className="d-field" value={commit} onChange={(e) => setCommit(e.target.value)} /></label>
          <label><div className="d-dim" style={{ fontSize: 13 }}>Standard</div>
            <select className="d-field" value={standard} onChange={(e) => setStandard(e.target.value)}>
              {STANDARDS.map((s) => <option key={s} value={s}>{s} v1.0</option>)}
            </select>
          </label>
          <button type="button" className="d-btn p" onClick={estimate}>Estimate cost</button>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className="d-dim" style={{ fontSize: 14 }}>Public repos by URL; private ones through a read-only GitHub App. You confirm the credits before the jury runs. Placeholder quote for {rules} rules and about {files} files: {credits} credits.</span>
          <label className="d-dim" style={{ fontSize: 13 }}>Rules <input className="d-slider" type="range" min={1} max={20} value={rules} onChange={(e) => setRules(Number(e.target.value))} /></label>
          <label className="d-dim" style={{ fontSize: 13 }}>Files {files}<input className="d-slider" type="range" min={1} max={400} value={files} onChange={(e) => setFiles(Number(e.target.value))} /></label>
          <span style={{ marginLeft: "auto" }}><ComingSoon /></span>
        </div>
      </div>
      {showExample && isExample && (
        <div className="d-wrap d-sec">
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h2 className="d-h2" style={{ margin: 0 }}>PASS · score {example.score} · EDO v1.0</h2>
            <span className="d-tag ill">example data, demo repo</span>
            <span style={{ marginLeft: "auto" }} className="d-dim">demo-tv/firmware @ {commit || "9f3c2a1"}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 20, marginTop: 16 }} className="d-split">
            <table className="d-table">
              <thead><tr><th>Rule</th><th>Verdict</th><th>Cited</th><th>Jury</th></tr></thead>
              <tbody>
                {example.verdicts.map((v) => (
                  <tr key={v.rule}>
                    <td className="d-dim">{v.rule}</td>
                    <td style={{ color: "#5fe0c8", fontWeight: 600 }}>{v.verdict}</td>
                    <td className="d-mut" style={{ fontSize: 15 }}>{v.citations[0].file}:{v.citations[0].lines}</td>
                    <td className="d-dim">{v.votes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="d-card" style={{ padding: 16 }}>
              <b>What gets inscribed</b>
              <ul className="d-b d-mut" style={{ fontSize: 15 }}>
                <li>Checksum: commit, tree and <code>codeChecksum</code> (SHA-256 of every file&apos;s path and hash)</li>
                <li>The report: each rule&apos;s verdict and citations</li>
                <li>Score and PASS or NOT CERTIFIED</li>
                <li>Juror attestations</li>
                <li>The ASCII badge</li>
              </ul>
              <pre className="d-pre" style={{ margin: "10px 0 0", fontSize: 11.5, lineHeight: 1.35 }}>{example.badge}</pre>
              <div className="d-dim" style={{ fontSize: 13, marginTop: 8 }}>Verify it yourself: <code>git ls-tree -r 9f3c2a1 | awk &apos;{"{print $4\"\\t\"$3}"}&apos; | LC_ALL=C sort | sha256sum</code></div>
              <p style={{ marginTop: 10 }}><a href="/certify/example-edo">Open the certificate page</a></p>
            </div>
          </div>
          <p className="d-dim" style={{ fontSize: 13, marginTop: 12 }}>A certificate is a code review of one commit against a published standard, not a legal, regulatory or safety certification. The citations above are example data. They are not files fetched from a real commit in this build.</p>
        </div>
      )}
      {!isExample && (
        <div className="d-wrap d-sec">
          <p className="d-mut">A live review is not connected. Example certificates exist only for the demo repo made for this page. No other repository is fetched or judged.</p>
        </div>
      )}
      {quote && (
        <QuoteDialog
          quote={quote}
          onClose={() => setQuote(null)}
          onConfirm={async () => {
            const res = await fetch("/api/certify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ quoteId: quote.id, repo }) });
            const body = await res.json() as { message: string };
            return body.message;
          }}
        />
      )}
    </>
  );
}
