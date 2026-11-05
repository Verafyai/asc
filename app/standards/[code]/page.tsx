import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Chrome from "@/components/Chrome";
import { pageMeta } from "@/lib/page-meta";
import { fillBadge, loadStandard, loadStandards } from "@/lib/standards";

export function generateStaticParams() {
  return loadStandards().map((s) => ({ code: s.code.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const code = (await params).code;
  const s = loadStandard(code);
  return pageMeta(s ? `${s.code} v${s.version}` : "Standard", `/standards/${code.toLowerCase()}`);
}

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const s = loadStandard((await params).code);
  if (!s) notFound();
  const demo = s.code === "EDO";
  return (
    <Chrome>
      <div className="d-wrap d-split" style={{ paddingTop: 48 }}>
        <div>
          <div className="d-eb">Standard · {s.code} v{s.version} <span className="d-tag ill" style={{ marginLeft: 6 }}>{s.status}</span></div>
          <h1 className="d-h1" style={{ fontSize: 48 }}>{s.title}</h1>
          <p className="d-lede">{s.abstract}</p>
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            {s.code !== "ASC-0" && <a className="d-btn p" href={`/certifications?std=${s.code}`}>Certify a repo against {s.code}</a>}
            <a className="d-btn g" href={`/standards/${s.code.toLowerCase()}/source`}>Read {s.code}.md</a>
          </div>
          <p className="d-dim" style={{ fontSize: 13, marginTop: 8 }}>GitHub publication is waiting on Rex. This link serves the Markdown file in the repo.</p>
        </div>
        {s.badge && (
          <div className="d-card" style={{ padding: 16 }}>
            <div className="d-dim" style={{ fontSize: 13, marginBottom: 8 }}>Badge a passing repository earns <span className="d-tag ill">example badge</span></div>
            <pre className="d-pre" style={{ margin: 0, fontSize: 12, lineHeight: 1.35 }}>{fillBadge(s.badge, demo ? "demo-tv/firmware" : "your-org/repo", demo ? "9f3c2a1" : "a1b2c3d")}</pre>
            <div className="d-dim" style={{ fontSize: 13, marginTop: 8 }}>Inscription: not yet ({s.status}) · policyRef: sha256 of {s.code}.md</div>
          </div>
        )}
      </div>
      {s.rules.length > 0 && (
        <div className="d-wrap d-sec">
          <h2 className="d-h2">{s.shallNever.replace(/these \d+ things./, "").trim() || "Rules"}</h2>
          <table className="d-table">
            <thead><tr><th>Rule</th><th>What it means, and the evidence the jury reads</th><th>Weight</th></tr></thead>
            <tbody>
              {s.rules.map((r) => (
                <tr key={r.id}>
                  <td className="d-dim" style={{ whiteSpace: "nowrap" }}>{r.id}</td>
                  <td>
                    <b>{r.title}</b>
                    <div className="d-mut" style={{ fontSize: 15, marginTop: 2 }}>{r.check}</div>
                    <div className="d-dim" style={{ fontSize: 13.5, marginTop: 2 }}>Evidence: {r.evidence}</div>
                  </td>
                  <td><span className={`d-tag ${r.severity === "critical" ? "ill" : ""}`}>{r.severity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="d-dim" style={{ fontSize: 14, marginTop: 10 }}>Critical rules weigh 3, others 1. PASS needs no fail and no needs-evidence, with at least 60% of the weight checkable from code.</p>
        </div>
      )}
      {s.proposed && (
        <div className="d-wrap d-sec">
          <h2 className="d-h2">Proposed for v1.1</h2>
          <p className="d-mut">{s.proposed}</p>
        </div>
      )}
      {s.changelog && (
        <div className="d-wrap d-sec">
          <h2 className="d-h2">Changelog</h2>
          <p className="d-mut">{s.changelog}</p>
        </div>
      )}
      {s.code === "ASC-0" && (
        <div className="d-wrap d-sec">
          <h2 className="d-h2">Propose a standard</h2>
          <p className="d-mut">Open a pull request on the asc-standards repository. Rex reviews. A change to a Final standard creates a new version. The repository is not published yet, so proposals wait with the Drafts.</p>
        </div>
      )}
    </Chrome>
  );
}
