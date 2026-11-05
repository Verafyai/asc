import Chrome from "@/components/Chrome";
import { vocab } from "@/lib/vocab";
import { INSCRIBED } from "@/content/copy";
import { pageMeta } from "@/lib/page-meta";
import examples from "@/examples/examples.json";
import run from "@/data/inscribed.json";

export const metadata = pageMeta("ASC run", "/inscribed");

const BROKEN_LABEL: Record<string, string> = {
  unregistered_cap: "the $1M cap",
  daily_cap: "the daily cap",
  declared_list: "the declared list",
  new_address_delay: "the 24-hour delay",
  balance_share: "the 10% share",
};

export default function Page() {
  const calls = run.calls as Array<{
    id: string;
    label: string;
    ruling: string;
    allowCount: number;
    quorum: number;
    broken: string[];
    attestations: Array<{ modelId: string; ruling: string; sig: string; voteTx: string }>;
  }>;
  return (
    <Chrome>
      <div className="d-wrap" style={{ paddingTop: 56, paddingBottom: 40 }}>
        <div className="d-eb">
          {INSCRIBED.eyebrow} <span className="d-tag real" style={{ marginLeft: 6 }}>{INSCRIBED.tag}</span>
        </div>
        <h1 className="d-h1" style={{ fontSize: 52 }}>{INSCRIBED.headline}</h1>
        <p className="d-lede">{INSCRIBED.subhead}</p>
      </div>

      <div className="d-wrap d-sec">
        <h2 className="d-h2">{INSCRIBED.rulesTitle}</h2>
        <ol className="d-b d-mut" style={{ paddingLeft: 22 }}>
          {examples.hot_wallet.rules.map((rule) => <li key={rule}>{rule}</li>)}
        </ol>
        <p className="d-dim" style={{ fontSize: 14, marginTop: 8 }}>{INSCRIBED.rulesNote}</p>
      </div>

      <div className="d-wrap d-sec">
        <h2 className="d-h2">{INSCRIBED.happenedTitle}</h2>
        <div className="d-grid2" style={{ marginTop: 12 }}>
          <div className="d-ok">
            <div className="d-mut">$250,000 to a registered wallet</div>
            <div className="d-okt" style={{ fontSize: 20, marginTop: 2 }}>5 of 5 allow · paid</div>
            <div className="d-dim" style={{ fontSize: 14, marginTop: 4 }}>Quorum 4 · no rule broken</div>
          </div>
          <div className="d-no">
            <div className="d-mut">$6,000,000,000 to an unknown wallet</div>
            <div className="d-not" style={{ fontSize: 20, marginTop: 2 }}>0 of 5 allow · refused, held for review</div>
            <div className="d-dim" style={{ fontSize: 14, marginTop: 4 }}>
              Broke 5 rules: {(examples.hot_wallet.runs[1].rules_broken ?? []).map((id) => BROKEN_LABEL[id] ?? id).join(", ")}
            </div>
          </div>
        </div>
        <p className="d-dim" style={{ fontSize: 14, marginTop: 12 }}>{INSCRIBED.happenedNote}</p>
      </div>

      <div className="d-wrap d-sec">
        <h2 className="d-h2">{INSCRIBED.howTitle}</h2>
        <ol className="d-b d-mut" style={{ paddingLeft: 22 }}>
          {INSCRIBED.how.map((line) => <li key={line}>{line}</li>)}
        </ol>
      </div>

      <div className="d-wrap d-sec">
        <h2 className="d-h2">{INSCRIBED.dataTitle}</h2>
        <details className="d-fold">
          <summary>Inscribed step list</summary>
          <pre className="d-pre">{JSON.stringify(examples.hot_wallet.steps, null, 1)}</pre>
        </details>
        <details className="d-fold" style={{ marginTop: 10 }}>
          <summary>Run steps and signatures</summary>
          <div style={{ overflowX: "auto" }}>
            <table className="d-table">
              <thead><tr><th>Step</th><th>Result</th><th>Signature</th></tr></thead>
              <tbody>
                {run.steps.map((s) => {
                  const x = s as { name: string; ok: boolean; sig?: string; bytes?: number; rejected?: boolean };
                  return (
                    <tr key={x.name}>
                      <td>{vocab(x.name)}</td>
                      <td>{x.ok ? (x.rejected ? "refused, as intended" : "ok") : "failed"}</td>
                      <td className="d-dim" style={{ wordBreak: "break-all" }}>{x.sig ? `${x.sig.slice(0, 20)}…${x.bytes ? ` · ${x.bytes} B` : ""}` : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {calls.map((c) => (
            <div key={c.id} style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 600 }}>{c.label} <span className={`d-tag ${c.ruling === "allow" ? "real" : "bad"}`}>{c.ruling}</span></div>
              <p className="d-dim" style={{ fontSize: 14 }}>{c.allowCount} of 5 · quorum {c.quorum}</p>
              <ul className="d-b d-dim" style={{ fontSize: 14 }}>
                {c.attestations.map((a) => <li key={a.modelId}>{a.modelId}: {a.ruling} · sig {a.sig.slice(0, 16)}… · vote {a.voteTx.slice(0, 16)}…</li>)}
              </ul>
            </div>
          ))}
        </details>
        <details className="d-fold" style={{ marginTop: 10 }}>
          <summary>Run rules (quorum, wallets, caps)</summary>
          <pre className="d-pre">{JSON.stringify({ title: run.stepsDoc.title, english: run.stepsDoc.english, steps: run.stepsDoc.steps, runRules: run.stepsDoc.runRules }, null, 1)}</pre>
        </details>
      </div>
    </Chrome>
  );
}
