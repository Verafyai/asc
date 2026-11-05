/**
 * Deterministic pilot selection from Polymarket's public gamma API. Rule: closed binary Yes/No markets
 * that UMA resolved cleanly to 1/0, ended 2024-01-01..2025-03-31; one market per event (the event's
 * highest-volume market); top 30 events by that market's volume. Writes data/pilot-events.json.
 */
import { writeFileSync } from "node:fs";

const base = "https://gamma-api.polymarket.com/markets?closed=true&order=volumeNum&ascending=false&end_date_min=2024-01-01T00:00:00Z&end_date_max=2025-03-31T23:59:59Z&limit=100";
const all: any[] = [];
for (let off = 0; off < 1000; off += 100) {
  const r = await fetch(`${base}&offset=${off}`);
  const page = await r.json();
  if (!Array.isArray(page) || !page.length) break;
  all.push(...page);
}
const parse = (s: unknown) => { try { return JSON.parse(String(s)); } catch { return null; } };
const byEvent = new Map<string, any>();
for (const m of all) {
  const outs = parse(m.outcomes), px = parse(m.outcomePrices);
  if (!Array.isArray(outs) || outs.join() !== "Yes,No" || !Array.isArray(px)) continue;
  if (!((px[0] === "1" && px[1] === "0") || (px[0] === "0" && px[1] === "1"))) continue;
  if (m.umaResolutionStatus !== "resolved") continue;
  const ev = Array.isArray(m.events) && m.events[0] ? String(m.events[0].id) : `m${m.id}`;
  const prev = byEvent.get(ev);
  if (!prev || Number(m.volumeNum) > Number(prev.volumeNum)) byEvent.set(ev, m);
}
const picked = [...byEvent.values()].sort((a, b) => Number(b.volumeNum) - Number(a.volumeNum)).slice(0, Number(process.env.PILOT_N || 30)).map((m) => ({
  id: m.id, slug: m.slug, question: m.question, endDate: m.endDate, closedTime: m.closedTime,
  description: String(m.description ?? "").slice(0, 1800), volumeUsd: Math.round(Number(m.volumeNum)),
  resolved: parse(m.outcomePrices)[0] === "1" ? "YES" : "NO", event: m.events?.[0]?.title ?? null,
}));
writeFileSync("data/pilot-events.json", JSON.stringify({ fetchedAt: new Date().toISOString(), source: base, scanned: all.length, eligibleEvents: byEvent.size, rule: `closed Yes/No, UMA resolved 1/0, ended 2024-01-01..2025-03-31, one market per event (highest volume), top ${process.env.PILOT_N || 30} by volume`, events: picked }, null, 1));
console.log(all.length, byEvent.size, picked.filter((p) => p.resolved === "YES").length, "YES of", picked.length);
for (const p of picked) console.log(p.resolved, p.question.slice(0, 90));
