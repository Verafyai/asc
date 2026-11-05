import { existsSync, readFileSync, writeFileSync } from "node:fs";

const FILE = "data/spend.json";
export const HARD_CAP_USD = 2.8; // brief: total OpenRouter spend under $3

interface Ledger { capUsd: number; totalUsd: number; entries: { at: string; script: string; usd: number; calls: number }[] }
export function readSpend(): Ledger {
  return existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : { capUsd: HARD_CAP_USD, totalUsd: 0, entries: [] };
}
export function addSpend(script: string, usd: number, calls: number) {
  const l = readSpend();
  l.entries.push({ at: new Date().toISOString(), script, usd: Number(usd.toFixed(5)), calls });
  l.totalUsd = Number(l.entries.reduce((a, e) => a + e.usd, 0).toFixed(5));
  writeFileSync(FILE, JSON.stringify(l, null, 1));
  return l.totalUsd;
}
export function assertBudget(nextEstimate: number) {
  const t = readSpend().totalUsd;
  if (t + nextEstimate > HARD_CAP_USD) throw new Error(`budget: spent $${t.toFixed(3)}, next step ~$${nextEstimate}, cap $${HARD_CAP_USD}`);
}
