import type { DemoRecord } from "./demo-types";
import flight from "@/data/demos/flight-delay.json";
import fed from "@/data/demos/fed-forecast.json";
import simd from "@/data/demos/simd-review.json";
import treasury from "@/data/demos/treasury-rebalance.json";
import vesting from "@/data/demos/audit-vesting.json";
import inject from "@/data/demos/prompt-injection.json";

export const DEMO_DATA: DemoRecord[] = [flight, fed, simd, treasury, vesting, inject] as unknown as DemoRecord[];
export const demoBySlug = (slug: string) => DEMO_DATA.find((d) => d.slug === slug);
export const CATEGORY_LABEL: Record<string, string> = { flagship: "Parametric insurance", forecast: "Forecast", governance: "Governance (SIMD)", treasury: "Treasury within caps", vesting: "Vesting / milestone", attack: "Prompt-injection attack" };

export function summarize(d: DemoRecord) {
  return d.scenarios.map((s) => {
    const a = s.initial.signed.record, b = s.dispute.signed.record;
    const v = (r: typeof a) => (r.tally.winner ? `${r.tally.byOutcome[r.tally.winner]}/${r.tally.counted}` : `no quorum (${Object.entries(r.tally.byOutcome).map(([k, n]) => `${k} ${n}`).join(", ")})`);
    return {
      slug: d.slug, scenario: s.id, label: s.label, category: d.category, title: d.title,
      winner: a.tally.winner, votesA: v(a), winnerB: b.tally.winner, votesB: v(b), verdict: s.verdict.verdict,
      paid: a.settlement.payouts.map((p) => `${p.paid.toLocaleString()} → ${d.compile.spec.parties.find((x) => x.id === p.to)?.label ?? p.to}`).join(", ") || "nothing",
      flagged: a.reveals.filter((r) => r.injectionSuspected).length, invalid: a.tally.invalid + b.tally.invalid,
    };
  });
}
export const totalDemoCost = () => DEMO_DATA.reduce((a, d) => a + d.costUsd, 0);
