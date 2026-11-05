import type { Metadata } from "next";
import Chrome from "@/components/Chrome";
import { pageMeta } from "@/lib/page-meta";
import { CATEGORY_LABEL, DEMO_DATA, demoBySlug } from "@/lib/oracle/demos-data";
import RecordedRun from "@/components/RecordedRun";

/** Recorded runs (moved from /docs/recorded-runs/:slug) are prerendered; any other id is a run record from /api/runs. */
export function generateStaticParams() { return DEMO_DATA.map((d) => ({ id: d.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const d = demoBySlug(id);
  return pageMeta(d ? `${CATEGORY_LABEL[d.category]}: ${d.title}` : "Run", `/runs/${id}`);
}

type RunRec = { id: string; status: string; charged: number; message: string; mode: string; createdAt: string };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = demoBySlug(id);
  if (d) return <RecordedRun demo={d} />;
  const g = globalThis as unknown as { __ascRuns?: Map<string, RunRec> };
  const rec = g.__ascRuns?.get(id);
  return (
    <Chrome>
      <div className="d-wrap" style={{ paddingTop: 56, paddingBottom: 48 }}>
        <div className="d-eb">Run <span className="d-tag ill">real pipeline not connected</span></div>
        <h1 className="d-h1 d-sm">{id}</h1>
        {rec ? (
          <>
            <p className="d-lede">{rec.message}</p>
            <p className="d-mut">Mode label on a completed real run would be real. This record is {rec.mode}, status {rec.status}, charged {rec.charged}.</p>
          </>
        ) : (
          <p className="d-lede">No run with that id is stored in this server process. Real jury calls are not connected, so nothing was inscribed and no model was called.</p>
        )}
      </div>
    </Chrome>
  );
}
