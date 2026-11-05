/**
 * Research probe: can a model recompute a hash chain with no tools?
 * Each model gets a 3-link chain: h1 = sha256("block1"), h2 = sha256(h1 + "block2"), h3 = sha256(h2 + "block3"),
 * and is asked to compute it unaided. We compare its answers with the real digests.
 * Writes data/hash-test.json.
 */
import { writeFileSync } from "node:fs";
import { LIVE_MODELS, callOpenRouter } from "../lib/agents/openrouter";
import { sha256Hex } from "../lib/canonical";

const key = process.env.OPENROUTER_API_KEY || process.env.NEW_OPENROUTER_API_KEY;
if (!key) throw new Error("OPENROUTER_API_KEY is not set");

const payloads = ["swarm", "chain", "verafy"];
const truth: string[] = [];
let prev = "";
for (const p of payloads) { prev = sha256Hex(prev + p); truth.push(prev); }

const prompt = [
  `Compute this hash chain yourself, with no tools. SHA-256, lowercase hex, UTF-8 input, "+" means string concatenation.`,
  `h1 = sha256("${payloads[0]}")`,
  `h2 = sha256(h1 + "${payloads[1]}")`,
  `h3 = sha256(h2 + "${payloads[2]}")`,
  `Reply with JSON only: {"h1":"...","h2":"...","h3":"..."}`,
].join("\n");

const prefixMatch = (a: string, b: string) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return i; };
const results = [];
let cost = 0;
for (const m of LIVE_MODELS) {
  const r = await callOpenRouter(key, m.model, prompt, 4000);
  cost += r.costUsd ?? 0;
  const got = (() => { try { return JSON.parse((r.text ?? "").slice((r.text ?? "").indexOf("{"), (r.text ?? "").lastIndexOf("}") + 1)); } catch { return {}; } })();
  const links = ["h1", "h2", "h3"].map((k, i) => {
    const v = typeof got[k] === "string" ? got[k].toLowerCase() : "";
    return { link: k, correct: v === truth[i], matchingPrefixChars: prefixMatch(v, truth[i]) };
  });
  results.push({ model: m.model, links, answers: { h1: String(got.h1 ?? ""), h2: String(got.h2 ?? ""), h3: String(got.h3 ?? "") }, answered: !!r.text, error: r.error });
  console.log(m.model, links.map((l) => `${l.link}:${l.correct ? "OK" : "wrong"}(${l.matchingPrefixChars}/64)`).join(" "), r.error ?? "");
}
writeFileSync("data/hash-test.json", JSON.stringify({ ranAt: new Date().toISOString(), prompt, truth, results, costUsd: Number(cost.toFixed(5)) }, null, 1));
console.log(`cost $${cost.toFixed(4)}`);
