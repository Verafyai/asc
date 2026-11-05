import { vocab } from "@/lib/vocab";
import Chrome from "@/components/Chrome";
import SpecView from "@/components/oracle/SpecView";
import DemoView from "@/components/oracle/DemoView";
import LiveEditor from "@/components/oracle/LiveEditor";
import { CATEGORY_LABEL, demoBySlug } from "@/lib/oracle/demos-data";

type Demo = NonNullable<ReturnType<typeof demoBySlug>>;

const EXTRA: Record<string, string> = {
  "fed-forecast": "Forecast settlement. The statement is the real Federal Reserve text as fetched; the forecasting market between two players is invented. One FOMC member dissented for a larger cut, a detail that could mislead a careless reader.",
  "simd-review": "Governance. A grants review asks whether a real Solana proposal (SIMD-0296, larger transactions) meets a review rubric. The rubric and the DAO are invented; the proposal text is real. The jury split, and the dispute escalated: that is the system refusing to pretend there is consensus.",
  "treasury-rebalance": "Treasury management. Policy math called for a 220,000 move; the cap is 100,000. Every model asked for exactly 100,000 itself because the English states the cap, so the escrow never had to clamp. Try the what-if panel below to see the clamp on a larger request.",
  "audit-vesting": "Vesting on a milestone. The honest answer is a partial release: one High finding was only acknowledged. The compiler's first spec refunded the unreleased 40,000 to the funder at once, though the English keeps it escrowed until after the deadline. The auditor caught it and the spec was recompiled.",
  "prompt-injection": "Attacks, shown honestly. The guarded and unguarded injections were both refused, with the injection flagged. The forged correction, a quiet lie in one source, fooled all ten models across both juries and the escrow paid the wrong party. Caps cannot help when the wrong outcome is a listed one; the defences are signed sources, multiple independent sources and a dispute window, which are design only here.",
};

export default function RecordedRun({ demo: d }: { demo: Demo }) {
  return (
    <Chrome>
      <section className="section"><div className="wrap stack">
        <div><p className="eyebrow">{CATEGORY_LABEL[d.category]} · recorded real run</p><h1>{d.title}</h1><p className="lead">{vocab(d.blurb)}</p>{EXTRA[d.slug] && <div className="callout">{EXTRA[d.slug]}</div>}</div>
        <SpecView demo={d} />
        <DemoView demo={d} />
        {d.slug === "flight-delay" && <LiveEditor example={d.english} exampleEvidence={d.scenarios[0].evidence.map((e) => e.text).join("\n\n")} />}
        <p><a href="/runs">All recorded runs</a> · <a href="/inscribed">Hot-wallet ASC run</a></p>
      </div></section>
    </Chrome>
  );
}
