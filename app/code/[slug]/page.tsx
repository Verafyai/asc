import { notFound } from "next/navigation";
import Chrome from "@/components/Chrome";
import SampleTabs from "@/components/SampleTabs";
import { pageMeta } from "@/lib/page-meta";
import { SAMPLES, getSample } from "@/lib/samples";

export function generateStaticParams() {
  return SAMPLES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SAMPLES.find((x) => x.slug === slug);
  return pageMeta(s?.title ?? "Sample", `/code/${slug}`);
}


export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getSample(slug);
  if (!s) notFound();
  const jurors = (s.ruling as { jury?: { size?: number; quorum?: number } }).jury;
  const sandbox = new URLSearchParams({ t: "custom", rules: s.rules, req: JSON.stringify(s.sandboxRequest, null, 2), b: "honest", n: String(jurors?.size ?? 5), q: String(jurors?.quorum ?? 4) });
  return (
    <Chrome current="/code">
      <div className="d-wrap" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <p className="d-dim" style={{ fontSize: 14 }}><a href="/code">Sample code</a> / {s.chip}</p>
        <h1 className="d-h1 d-sm">{s.title}</h1>
        <p className="d-lede" style={{ fontSize: 19 }}>{s.ascName}. Judgment rule: <q>{s.judgment.replace(/^"|"$/g, "")}</q></p>
        <p className="d-mut" style={{ fontSize: 15 }}>Where it runs: {s.runs} · {s.languages.join(", ")} · <span className={`d-tag ${s.label === "illustrative" ? "ill" : ""}`}>{s.label}</span></p>
        <SampleTabs rulesName={s.rulesFile} rules={s.rules} code={s.code} ruling={JSON.stringify(s.ruling, null, 2)} label={s.label} />
        <p style={{ marginTop: 22 }}><a className="d-btn p sm" href={`/sandbox?${sandbox.toString()}`}>Try these rules in the Sandbox</a></p>
        <p className="d-dim" style={{ fontSize: 14 }}>The Sandbox runs a simulated jury for free. <a href="/docs/request-a-ruling">Request a ruling</a> explains the call in the code.</p>
      </div>
    </Chrome>
  );
}
