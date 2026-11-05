import pilot from "@/data/pilot.json";
import live from "@/data/live-run.json";
import hash from "@/data/hash-test.json";
import spend from "@/data/spend.json";
import { pct, pt, usd } from "@/lib/ui";

const short = (m: string) => m.split("/")[1];

export default function Measured() {
  const hashOk = hash.results.filter((r) => r.links.every((l) => (l as { correct: boolean }).correct)).length;
  return (
    <div className="stack" id="measured">
      <h2>What has been measured</h2>
      <p className="lead">Nothing in this section is projected. Where a test has not been run, it is listed as a plan. <span className="pill ok">real</span></p>
      <div className="grid2">
        <div className="card">
          <p className="eyebrow">Earlier test: models as a ledger <span className="pill ok">real</span></p>
          <p>Asked to confirm blocks, the models confirmed <b>3 of {live.slots.length}</b> ({pt(live.recordedAt)}, {usd(live.totalCostUsd)}). Asked to compute a three-link SHA-256 chain without tools, <b>{hashOk} of {hash.results.length}</b> models got it right. Models judge. Code hashes. Solana keeps the log.</p>
        </div>
        <div className="card">
          <p className="eyebrow">Demos <span className="pill ok">real</span></p>
          <p>Eight recorded scenarios across six demos: 6 settled as intended (including two refused prompt injections), 1 escalated on honest disagreement (SIMD review), and 1 attack (a forged correction) fooled all 10 models. <a href="/docs/recorded-runs">Recorded runs</a>.</p>
        </div>
      </div>
      <div>
        <p className="eyebrow">30-event pilot <span className="pill ok">real</span> · {pt(pilot.ranAt)} · {pilot.calls} calls · {usd(pilot.costUsd)}</p>
        <h2>Jury vs single models vs a human-vote oracle</h2>
        <p className="lead">{pilot.n} resolved Polymarket markets ({pilot.rule}). The reference answer is UMA&apos;s resolution. Base rate: {pilot.baseRate.yes} YES / {pilot.baseRate.no} NO, so always answering NO scores {pct(pilot.baselines.alwaysNo)}.</p>
      </div>
      <div className="grid2">
        <div className="card"><p className="eyebrow">Jury A (6 families)</p><p className="mono">reached quorum on {pilot.swarmA.decided}/{pilot.n} · agreed with UMA on {pilot.swarmA.correct} ({pct(pilot.swarmA.accuracyDecided)} of decided, {pct(pilot.swarmA.accuracyAll)} of all) · abstained {pilot.swarmA.noQuorum}</p><p>Disagreed with UMA: {pilot.swarmA.disagreements.join(" · ")}</p></div>
        <div className="card"><p className="eyebrow">All 10 models</p><p className="mono">reached quorum on {pilot.swarm10.decided}/{pilot.n} · agreed with UMA on {pilot.swarm10.correct} ({pct(pilot.swarm10.accuracyDecided)} of decided, {pct(pilot.swarm10.accuracyAll)} of all) · abstained {pilot.swarm10.noQuorum}</p><p>Disagreed with UMA: {pilot.swarm10.disagreements.join(" · ")}</p></div>
      </div>
      <div className="scroll-x"><table className="tbl"><thead><tr><th>Model</th><th>Answered</th><th>Agreed with UMA</th><th>NA</th><th>Invalid (dropped)</th></tr></thead><tbody>
        {pilot.perModel.map((m) => <tr key={m.model}><td className="mono">{short(m.model)}</td><td>{m.answered}</td><td>{m.correct} ({pct(m.accuracyAnswered)})</td><td>{m.na}</td><td>{m.invalid}</td></tr>)}
      </tbody></table></div>
      <div className="callout"><b>Caveats.</b><ul>{pilot.caveats.map((c) => <li key={c}>{c}</li>)}</ul>
        <p>Notable: gpt-5-mini answered that Joe Biden won the 2024 election. Neither jury reached quorum on that market, which is the abstain rule doing its job. glm-4.6 returned 13 empty replies and deepseek 3; they were dropped and not counted.</p>
      </div>
      <details><summary>All {pilot.n} events</summary><div className="scroll-x"><table className="tbl"><thead><tr><th>Market</th><th>UMA</th><th>Jury A</th><th>All 10</th></tr></thead><tbody>
        {pilot.rows.map((r) => {
          const f = (t: { winner: string | null; byOutcome: Record<string, number | undefined>; counted: number }) => t.winner ? `${t.winner} ${t.byOutcome[t.winner]}/${t.counted}` : `no quorum (${Object.entries(t.byOutcome).map(([k, v]) => `${k} ${v}`).join(", ") || "none"})`;
          return <tr key={r.id}><td style={{ whiteSpace: "normal" }}>{r.question}</td><td>{r.resolved}</td><td className={r.swarmA.winner && r.swarmA.winner !== r.resolved ? "cell-bad" : undefined}>{f(r.swarmA)}</td><td className={r.swarm10.winner && r.swarm10.winner !== r.resolved ? "cell-bad" : undefined}>{f(r.swarm10)}</td></tr>;
        })}
      </tbody></table></div></details>
      <div className="card">
        <p className="eyebrow">Plan: the 200-event test <span className="pill bad">not run</span></p>
        <ol>
          <li><b>Select.</b> <span className="mono">PILOT_N=200 npx tsx scripts/pilot-select.ts</span>: the 200 highest-volume resolved events, one market per event, frozen into data/pilot-events.json before any model runs.</li>
          <li><b>Evidence, not recall.</b> Use markets that closed after the models&apos; training cutoffs, and give every arm the same snapshotted, hashed resolution source. Recall-only runs are reported separately.</li>
          <li><b>Three arms.</b> The 10-model jury with commit and reveal and the 2/3 rule; each single model alone; and the human-vote oracle (UMA&apos;s resolution).</li>
          <li><b>Score.</b> Agreement with a hand-checked ground truth, abstain rate, cost and time per ruling, and how often a second jury flips the result. Pre-register the metrics before running.</li>
          <li><b>Attack set.</b> Re-run 20 events with injected instructions and 20 with one forged source, and report both rates.</li>
        </ol>
        <p className="muted">At the pilot&apos;s per-event rate, 200 events times 10 recall calls would be about {usd(pilot.costUsd / pilot.n * 200)}. Evidence-based prompts would cost more. The harness is scripts/pilot-select.ts and scripts/pilot-run.ts. This figure is the recorded rate scaled, not a new measurement.</p>
      </div>
      <div className="card">
        <p className="eyebrow">Model spend on this site <span className="pill ok">real</span></p>
        <p>Recorded OpenRouter spend in data/spend.json: {usd(spend.totalUsd)} against a {usd(spend.capUsd)} cap. Live mode is off on this preview.</p>
      </div>
    </div>
  );
}
