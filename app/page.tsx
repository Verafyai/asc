import Chrome from "@/components/Chrome";
import { HOME } from "@/content/copy";
import { PRODUCT_NAME } from "@/lib/brand";
import { pageMeta } from "@/lib/page-meta";
import examples from "@/examples/examples.json";

export const metadata = pageMeta(PRODUCT_NAME, "/", true);

const RUN_HREF: Record<string, string> = {
  "Flight insurance: delayed 3h17m": "/docs/recorded-runs/flight-delay",
  "Forecast: real FOMC statement": "/docs/recorded-runs/fed-forecast",
  "Governance: real SIMD-0296 text": "/docs/recorded-runs/simd-review",
  "Treasury: SOL at 82%": "/docs/recorded-runs/treasury-rebalance",
  "Vesting: audit with one High finding": "/docs/recorded-runs/audit-vesting",
  "Prompt injection, guarded": "/docs/recorded-runs/prompt-injection",
  "Forged correction (poisoned evidence)": "/docs/recorded-runs/prompt-injection",
};

export default function Page() {
  return (
    <Chrome current="/">
      <div className="d-wrap d-hero">
        <div>
          <div className="d-eb">{HOME.eyebrow}</div>
          <h1 className="d-h1">{HOME.headline}</h1>
          <p className="d-lede">{HOME.subhead}</p>
          <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
            <a className="d-btn p" href="/inscribed">{HOME.primary}</a>
            <a className="d-btn g" href="/proposal">{HOME.secondary}</a>
          </div>
        </div>
        <div className="d-card">
          <div className="d-dim" style={{ fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>{HOME.ruleLabel}</div>
          <div style={{ fontSize: 19, marginTop: 6 }}>{HOME.rule}</div>
          <div className="d-ok" style={{ marginTop: 18 }}>
            <div className="d-mut" style={{ fontSize: 15 }}>{HOME.okTitle}</div>
            <div className="d-okt">{HOME.okResult}</div>
          </div>
          <div className="d-no" style={{ marginTop: 10 }}>
            <div className="d-mut" style={{ fontSize: 15 }}>{HOME.noTitle}</div>
            <div className="d-not">{HOME.noResult}</div>
          </div>
          <div className="d-dim" style={{ fontSize: 13, marginTop: 12 }}>{HOME.exampleNote}</div>
        </div>
      </div>

      <div className="d-wrap d-sec">
        <h2 className="d-h2">{HOME.problemTitle}</h2>
        <p className="d-mut" style={{ maxWidth: 720 }}>{HOME.problem}</p>
      </div>

      <div className="d-wrap d-sec">
        <h2 className="d-h2">{HOME.ideaTitle}</h2>
        <div className="d-grid3" style={{ marginTop: 18 }}>
          {HOME.steps.map(([title, body], i) => (
            <div className="d-card" key={title} style={{ padding: 20 }}>
              <div style={{ color: "#5fe0c8", fontWeight: 700 }}>{i + 1}</div>
              <div style={{ fontWeight: 600, marginTop: 4 }}>{title}</div>
              <div className="d-mut" style={{ fontSize: 16, marginTop: 4 }}>{body}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="d-wrap d-sec">
        <h2 className="d-h2">{HOME.waysTitle}</h2>
        <div className="d-grid2" style={{ marginTop: 14 }}>
          <div className="d-card">
            <div style={{ fontWeight: 600 }}>{HOME.wayATitle} <span className="d-tag real">{HOME.wayATag.replace(/\.$/, "")}</span></div>
            <div className="d-mut" style={{ fontSize: 16, marginTop: 6 }}>{HOME.wayA}</div>
          </div>
          <div className="d-card">
            <div style={{ fontWeight: 600 }}>{HOME.wayBTitle} <span className="d-tag">design only</span></div>
            <div className="d-mut" style={{ fontSize: 16, marginTop: 6 }}>{HOME.wayB}</div>
          </div>
        </div>
      </div>

      <div className="d-wrap d-sec">
        <h2 className="d-h2">{HOME.proofTitle}</h2>
        <p className="d-mut" style={{ fontSize: 16 }}>{HOME.proofLine}</p>
        <table className="d-table" style={{ marginTop: 12 }}>
          <thead><tr><th>Scenario</th><th>Ruling</th><th>Paid</th><th>Label</th></tr></thead>
          <tbody>
            {examples.recorded_runs.map((row) => (
              <tr key={row.scenario}>
                <td><a href={RUN_HREF[row.scenario] ?? "/docs/recorded-runs"}>{row.scenario}</a></td>
                <td>{row.ruling}</td>
                <td>{row.paid}</td>
                <td><span className="d-tag real">{row.label}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-wrap d-sec">
        <h2 className="d-h2">{HOME.trustTitle}</h2>
        <div className="d-grid4" style={{ marginTop: 14 }}>
          {HOME.trust.map(([title, body]) => (
            <div key={title}>
              <div style={{ fontWeight: 600 }}>{title}{title === "Next" && <> <span className="d-tag">design only</span></>}</div>
              <div className="d-mut" style={{ fontSize: 16, marginTop: 4 }}>{body}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="d-wrap d-sec">
        <h2 className="d-h2">{HOME.nextTitle}</h2>
        <div className="d-grid3" style={{ marginTop: 14 }}>
          {HOME.next.map(([title, body]) => (
            <div className="d-card" key={title} style={{ padding: 20 }}>
              <div style={{ fontWeight: 600 }}>{title}</div>
              <div className="d-mut" style={{ fontSize: 16, marginTop: 4 }}>{body}</div>
            </div>
          ))}
        </div>
        <p className="d-dim" style={{ fontSize: 14, marginTop: 10 }}>{HOME.nextNote} <span className="d-tag">design only</span></p>
      </div>

      <div className="d-wrap d-sec">
        <h2 className="d-h2">{HOME.limitsTitle}</h2>
        <ul className="d-b d-mut">
          {examples.limits.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p style={{ marginTop: 10 }}><a href="/docs/trust">{HOME.limitsLink}</a></p>
      </div>
    </Chrome>
  );
}
