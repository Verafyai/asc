import Chrome from "@/components/Chrome";
import { vocab } from "@/lib/vocab";
import { pageMeta } from "@/lib/page-meta";
import { CATEGORY_LABEL, DEMO_DATA, summarize } from "@/lib/oracle/demos-data";
import { usd, pt } from "@/lib/ui";

export const metadata = pageMeta("Recorded runs", "/runs");

export default function Page() {
  return (
    <Chrome>
      <div className="d-wrap" style={{ paddingTop: 56, paddingBottom: 40 }}>
      <div className="d-eb">Evidence</div>
      <h1 className="d-h1 d-sm">Recorded runs</h1>
      <p className="d-lede">The hot-wallet ASC run, plus six demos. Every demo row is a real recorded run with real model calls. Evidence marked illustrative was written for the demo. The Fed and SIMD texts are real fetched documents.</p>
      <p><a className="d-btn p" href="/inscribed">Hot-wallet ASC run</a> <a className="d-btn g" href="/runs/settlement">Local validator settlement</a></p>
      <p className="d-dim" style={{ fontSize: 14 }}>The hot-wallet verdicts were scripted from the rules. No model calls were made for that run. Signatures, inscription and transfer are real on a local validator.</p>
      <ul className="d-b" style={{ listStyle: "none", paddingLeft: 0 }}>
        {DEMO_DATA.map((d) => {
          const s = summarize(d);
          return (
            <li key={d.slug} className="d-card" style={{ marginTop: 12 }}>
              <div className="d-dim" style={{ fontSize: 13 }}>{CATEGORY_LABEL[d.category]} <span className="d-tag real">real</span></div>
              <b><a href={`/runs/${d.slug}`}>{d.title}</a></b>
              <p className="d-mut">{vocab(d.blurb)}</p>
              {s.map((r) => <p key={r.scenario} className="d-dim" style={{ fontSize: 14, margin: "4px 0" }}>{r.label}: {r.winner ?? "no quorum"} {r.votesA} · dispute {r.verdict} · paid {r.paid}</p>)}
              <p className="d-dim" style={{ fontSize: 13 }}>Recorded {pt(d.recordedAt)} · {d.calls} model calls · {usd(d.costUsd)}</p>
            </li>
          );
        })}
      </ul>
      </div>
    </Chrome>
  );
}
