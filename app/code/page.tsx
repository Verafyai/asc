import Chrome from "@/components/Chrome";
import CodeGrid from "@/components/CodeGrid";
import { pageMeta } from "@/lib/page-meta";
import { CHIPS, allSamples } from "@/lib/samples";

export const metadata = pageMeta("Sample code", "/code");

export default function Page() {
  const cards = allSamples().map(({ slug, title, ascName, judgment, runs, languages, label, chip }) => ({ slug, title, ascName, judgment, runs, languages, label, chip }));
  return (
    <Chrome current="/code">
      <div className="d-wrap" style={{ paddingTop: 56, paddingBottom: 8 }}>
        <div className="d-eb">Sample code</div>
        <h1 className="d-h1 d-md">Sample code</h1>
        <p className="d-lede">Real rules for real jobs. Each sample is an ASC written in English, plus the code that asks a jury to rule on it.</p>
        <p className="d-dim" style={{ fontSize: 15 }}>Every sample is <span className="d-tag ill">illustrative</span> until the SDK ships. Certify on every push is <span className="d-tag">planned</span>.</p>
      </div>
      <div className="d-wrap" style={{ paddingBottom: 48 }}>
        <CodeGrid cards={cards} chips={[...CHIPS]} />
      </div>
    </Chrome>
  );
}
