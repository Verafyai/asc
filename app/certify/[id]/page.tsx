import { notFound } from "next/navigation";
import Chrome from "@/components/Chrome";
import { pageMeta } from "@/lib/page-meta";
import example from "@/asc-standards/examples/certificate-EDO-example.json";

export function generateStaticParams() {
  return [{ id: "example-edo" }];
}

export const metadata = pageMeta("Certificate example-edo", "/certify/example-edo");

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== "example-edo") notFound();
  return (
    <Chrome current="/certify">
      <div className="d-wrap" style={{ paddingTop: 56, paddingBottom: 40 }}>
        <div className="d-eb">Certificate <span className="d-tag ill">example data, demo repo</span></div>
        <h1 className="d-h1 d-md">{example.result} · score {example.score} · {example.standard.code} v{example.standard.version}</h1>
        <p className="d-lede">{example.repo} at commit {example.commit}. This is example data for a demo repository, not a real review.</p>
        <p className="d-dim" style={{ fontSize: 14 }}>A certificate is a code review of one commit against a published standard, not a legal, regulatory or safety certification.</p>
        <table className="d-table" style={{ marginTop: 18 }}>
          <thead><tr><th>Rule</th><th>Verdict</th><th>Cited</th><th>Jury</th></tr></thead>
          <tbody>
            {example.verdicts.map((v) => (
              <tr key={v.rule}>
                <td>{v.rule}</td>
                <td>{v.verdict}</td>
                <td>{v.citations.map((c) => `${c.file}:${c.lines}`).join(", ")}</td>
                <td>{v.votes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <pre className="d-pre">{example.badge}</pre>
        <p><a href="/certify/example-edo/badge.txt">badge.txt</a> · <a href="/certify/example-edo/badge.svg">badge.svg</a></p>
        <p className="d-dim" style={{ fontSize: 14 }}>codeChecksum {example.codeChecksum}. tree {example.tree}. Inscription is not made for a Draft standard.</p>
      </div>
    </Chrome>
  );
}
