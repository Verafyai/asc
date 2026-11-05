import { describe, expect, it } from "vitest";
import { DEMO_DATA } from "@/lib/oracle/demos-data";
import { verifyRun } from "@/lib/oracle/judge";
import pilot from "@/data/pilot.json";
import settlement from "@/data/settlement.json";

describe("recorded demos verify end to end", () => {
  for (const d of DEMO_DATA) for (const s of d.scenarios) for (const [name, run] of [["A", s.initial], ["B", s.dispute]] as const) {
    it(`${d.slug}/${s.id}/${name}`, () => {
      const checks = verifyRun(d.compile.spec, run, s.evidence);
      expect(checks.filter((c) => !c.ok)).toEqual([]);
    });
  }
  it("tampering with a recorded outcome fails verification", () => {
    const d = DEMO_DATA[0], s = d.scenarios[0];
    const run = structuredClone(s.initial);
    const r = run.signed.record;
    r.tally.winner = d.compile.spec.outcomes.find((o) => o.id !== r.tally.winner)!.id;
    expect(verifyRun(d.compile.spec, run, s.evidence).some((c) => !c.ok)).toBe(true);
  });
});

describe("published numbers match the data", () => {
  it("pilot totals are internally consistent", () => {
    expect(pilot.rows.length).toBe(pilot.n);
    const agree = pilot.rows.filter((r) => r.swarm10.winner === r.resolved).length;
    expect(agree).toBe(pilot.swarm10.correct);
    expect(pilot.rows.filter((r) => r.swarm10.winner).length).toBe(pilot.swarm10.decided);
  });
  it("settlement: forged signature was rejected and the payee was not paid twice", () => {
    const t = settlement.steps[1] as { ok: boolean; rejected?: boolean; payeeLamportsAfter?: number };
    expect(t.rejected).toBe(true);
    expect(t.payeeLamportsAfter).toBe((settlement.steps[0] as { payeeLamports: number }).payeeLamports);
  });
});
