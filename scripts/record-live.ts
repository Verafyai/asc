/**
 * Runs the real model swarm through OpenRouter, slot by slot, and records every raw reply plus
 * svmLLM's weights-machine prediction to data/live-run.json. The web demo replays these and
 * re-runs every harness check in the browser.
 * Usage: npx tsx scripts/record-live.ts [slots] [budgetUsd]
 * Needs OPENROUTER_API_KEY and the svmLLM venv (SVLLM_PY, default /workspace/svllm-venv/bin/python).
 */
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { LIVE_MODELS, liveSwarm } from "../lib/agents/openrouter";
import type { Recording } from "../lib/agents/replay";
import { runSlot } from "../lib/engine";
import { genesis, verifyChain } from "../lib/ledger";
import type { Predictor, SvmPrediction } from "../lib/svm/predict";

const key = process.env.OPENROUTER_API_KEY || process.env.NEW_OPENROUTER_API_KEY;
if (!key) throw new Error("OPENROUTER_API_KEY is not set");
const slots = Number(process.argv[2] ?? 10);
const budget = Number(process.argv[3] ?? 1);
const svllmDir = process.env.SVLLM_DIR ?? "/workspace/svllm";
const commit = execSync(`git -C ${svllmDir} rev-parse --short HEAD`).toString().trim();

// svmLLM weights machine, as a long-lived Python child process.
const py = spawn(process.env.SVLLM_PY ?? "/workspace/svllm-venv/bin/python", ["scripts/svmllm_predict.py"], { stdio: ["pipe", "pipe", "inherit"] });
const lines = createInterface({ input: py.stdout! })[Symbol.asyncIterator]();
const weights: Predictor = {
  label: `svmLLM weights machine (Verafyai/svmLLM @ ${commit})`,
  source: "weights",
  async predict(req) {
    py.stdin!.write(JSON.stringify(req) + "\n");
    const { value } = await lines.next();
    return { ...(JSON.parse(value) as Omit<SvmPrediction, "source">), source: "weights" };
  },
};

let spent = 0;
const agents = liveSwarm(key, (c) => (spent += c));
let state = genesis(agents.map((a) => a.wallet));
const rec: Recording = {
  recordedAt: new Date().toISOString(), note: "", agents: LIVE_MODELS,
  svmllm: { engine: weights.label, repo: "https://github.com/Verafyai/svmLLM", commit }, slots: [], totalCostUsd: 0,
};

for (let slot = 1; slot <= slots; slot++) {
  if (spent > budget) { console.log(`budget reached at $${spent.toFixed(4)}`); break; }
  const { state: next, result: r } = await runSlot(state, agents, weights, slot);
  rec.slots.push({
    slot, leader: r.leader.wallet, propose: r.leader.raw,
    votes: Object.fromEntries(r.votes.map((v) => [v.wallet, v.raw])), svm: r.prediction ?? null,
  });
  state = next;
  console.log(
    `slot ${slot} leader=${r.leader.wallet}: ${r.outcome} approve=${r.stake.approve}/${r.stake.counted}` +
      ` | fails: ${r.checks.filter((c) => !c.ok).map((c) => `${c.name}(${(c.detail ?? "").slice(0, 80)})`).join(", ") || "none"}` +
      ` | votes: ${r.votes.map((v) => `${v.wallet}:${v.vote ?? "DROP " + v.error?.slice(0, 30)}`).join(" ")}` +
      ` | disagree: ${r.disagreements.length} | $${r.costUsd.toFixed(4)}`,
  );
  writeFileSync("data/live-run.json", JSON.stringify(rec, null, 1));
}
py.stdin!.end();
rec.totalCostUsd = Number(spent.toFixed(5));
rec.note = `${rec.slots.length} slots, ${state.blocks.length - 1} blocks confirmed, ${LIVE_MODELS.length} models via OpenRouter at temperature 0.2, svmLLM weights on CPU. Chain audit: ${verifyChain(state).ok ? "pass" : "FAIL"}.`;
writeFileSync("data/live-run.json", JSON.stringify(rec, null, 1));
console.log(`total $${spent.toFixed(4)}; ${rec.note}`);
