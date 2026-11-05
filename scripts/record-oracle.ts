/**
 * Records the demos with real OpenRouter calls: compile each English contract, audit the
 * spec, judge each scenario with committee A, re-judge with committee B (dispute), and run the svmLLM
 * pre-settlement side check. Writes data/demos/<slug>.json. Usage: npx tsx scripts/record-oracle.ts [slug...]
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { DEMOS } from "../lib/oracle/catalog";
import { compileContract, type CompileResult } from "../lib/oracle/compile";
import { disputeVerdict } from "../lib/oracle/dispute";
import { runJudgment, verifyRun } from "../lib/oracle/judge";
import { openrouter } from "../lib/oracle/llm";
import { AUDITOR_MODEL, COMPILER_MODEL, SWARM_A, SWARM_B } from "../lib/oracle/models";
import { addSpend, assertBudget } from "./spend";
import { svmChecker } from "./svm-check";

const key = process.env.OPENROUTER_API_KEY || process.env.NEW_OPENROUTER_API_KEY;
if (!key) throw new Error("OPENROUTER_API_KEY is not set");
const only = process.argv.slice(2);
mkdirSync("data/demos", { recursive: true });
const maxTok = (m: string) => (m.startsWith("openai/gpt-5") ? 2500 : 1200);
let calls = 0;
const call = async (model: string, prompt: string, maxTokens: number) => { calls++; return openrouter(key, model, prompt, { maxTokens: Math.max(maxTokens, maxTok(model)) }); };
const svm = svmChecker();

const compiled: Record<string, CompileResult> = {};
for (const d of DEMOS) {
  if (only.length && !only.includes(d.slug)) continue;
  assertBudget(0.15);
  calls = 0;
  let cost = 0;
  const t0 = Date.now();
  const sameAs = DEMOS.find((x) => x.english === d.english && x.slug !== d.slug && existsSync(`data/demos/${x.slug}.json`));
  let comp: CompileResult;
  if (compiled[d.english]) comp = compiled[d.english];
  else if (sameAs) comp = JSON.parse(readFileSync(`data/demos/${sameAs.slug}.json`, "utf8")).compile;
  else { comp = await compileContract(d.english, call, COMPILER_MODEL, AUDITOR_MODEL); cost += comp.costUsd; }
  compiled[d.english] = comp;
  console.log(`[${d.slug}] compile: ${comp.spec ? "ok" : "FAILED"} issues=${comp.issues.length} audit=${comp.audit?.faithful} $${comp.costUsd.toFixed(4)}`);
  const scenarios = [];
  if (comp.spec) {
    const spec = comp.spec;
    const clauseId = spec.judgmentClauses[0].id;
    for (const sc of d.scenarios) {
      const caller = (op: { model: string }, prompt: string) => call(op.model, prompt, 1200);
      const a = await runJudgment({ spec, clauseId, evidence: sc.evidence, operators: SWARM_A, call: caller, guard: sc.guard });
      cost += a.costUsd;
      const b = d.dispute ? await runJudgment({ spec, clauseId, evidence: sc.evidence, operators: SWARM_B, call: caller, guard: sc.guard, round: "dispute", priorRecordHash: a.signed.recordHash }) : null;
      cost += b?.costUsd ?? 0;
      const fmt = (r: typeof a) => `${r.signed.record.tally.winner ?? "no-quorum"} ${JSON.stringify(r.signed.record.tally.byOutcome)} na=${r.signed.record.tally.na} inv=${r.signed.record.tally.invalid} paid=${r.signed.record.settlement.total}`;
      console.log(`  ${sc.id}: A ${fmt(a)} | B ${b ? fmt(b) : "-"}`);
      for (const [op, r] of Object.entries({ ...a.raw, ...(b?.raw ?? {}) })) if (r.error) console.log(`    ! ${op}: ${r.error}`);
      const checks = verifyRun(spec, a, sc.evidence);
      if (!checks.every((c) => c.ok)) console.log("    VERIFY FAILED", checks.filter((c) => !c.ok));
      scenarios.push({
        id: sc.id, label: sc.label, note: sc.note, guard: sc.guard ?? true, evidence: sc.evidence,
        initial: a, dispute: b, verdict: b ? disputeVerdict(a, b) : null,
        svm: { initial: await svm.check(spec, a.signed.record.settlement), dispute: b ? await svm.check(spec, b.signed.record.settlement) : null },
      });
    }
  }
  const out = { slug: d.slug, category: d.category, title: d.title, blurb: d.blurb, english: d.english, compile: comp, scenarios, recordedAt: new Date().toISOString(), costUsd: cost, calls, ms: Date.now() - t0 };
  writeFileSync(`data/demos/${d.slug}.json`, JSON.stringify(out, null, 1));
  const total = addSpend(`record-oracle:${d.slug}`, cost, calls);
  console.log(`[${d.slug}] $${cost.toFixed(4)} in ${calls} calls; total spend $${total.toFixed(4)}`);
}
svm.close();
