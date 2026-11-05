import Chrome from "@/components/Chrome";
import ComingSoon from "@/components/ComingSoon";
import { pageMeta } from "@/lib/page-meta";
import { fillBadge, loadStandards } from "@/lib/standards";

export const metadata = pageMeta("Standards", "/standards");

export default function Page() {
  const standards = loadStandards();
  const cards = standards.filter((s) => s.code !== "ASC-0");
  const asc0 = standards.find((s) => s.code === "ASC-0");
  return (
    <Chrome current="/standards">
      <div className="d-wrap" style={{ paddingTop: 56, paddingBottom: 32 }}>
        <div className="d-eb">Standards · inscribed rules for software <span className="d-tag ill" style={{ marginLeft: 6 }}>first versions, all drafts</span></div>
        <h1 className="d-h1 d-md">ASC Standards</h1>
        <p className="d-lede">Plain-language rules that code can be certified against. Each standard lists what a kind of software must never do, how the jury checks it, and the badge a passing repository earns.</p>
      </div>
      <div className="d-wrap" style={{ paddingBottom: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span className="d-mut" style={{ fontSize: 15 }}>Source of truth: Markdown files in the <b style={{ color: "#e8edf2" }}>asc-standards</b> repository on GitHub. Final versions are inscribed on Solana. The GitHub repository is not published in this build; these pages render the Markdown in the repo.</span>
        <span style={{ marginLeft: "auto" }}><ComingSoon /></span>
      </div>
      <div className="d-wrap d-std" style={{ paddingBottom: 40 }}>
        {cards.map((s) => (
          <div className="d-card" key={s.code}>
            <pre className="d-pre" style={{ margin: 0, padding: 12, fontSize: 11.5, lineHeight: 1.35 }}>{fillBadge(s.badge)}</pre>
            <div className="d-dim" style={{ fontSize: 12 }}>example badge</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <b style={{ fontSize: 18 }}>{s.code} v{s.version}</b>
              <span className="d-tag ill">{s.status}</span>
              <span className="d-dim" style={{ marginLeft: "auto", fontSize: 13 }}>{s.rules.length} rules</span>
            </div>
            <div style={{ fontWeight: 600 }}>{s.title}</div>
            <div className="d-mut" style={{ fontSize: 15 }}>{s.shallNever}</div>
            <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
              <a className="d-btn p sm" href={`/standards/${s.code.toLowerCase()}`}>Read {s.code}</a>
              <a className="d-btn g sm" href={`/certify?standard=${s.code}`}>Certify a repo</a>
            </div>
          </div>
        ))}
        {asc0 && (
          <div className="d-card" style={{ borderStyle: "dashed" }}>
            <b>ASC-0 · Standards process</b>
            <div className="d-mut" style={{ fontSize: 15, marginTop: 6 }}>How standards are named (E + subject + Operations, Conduct or Contracts), versioned (MAJOR.MINOR), reviewed and inscribed.</div>
            <div style={{ marginTop: 12 }}><a className="d-btn g sm" href="/standards/asc-0">Propose a standard</a></div>
          </div>
        )}
      </div>
    </Chrome>
  );
}
