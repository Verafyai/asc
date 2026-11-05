"use client";
import { useEffect, useState } from "react";

const STEPS = [
  { t: "Write the contract in English", d: "“If UA 857 lands more than 3 hours late, pay Ana 500. Otherwise return it to the pool.” The judgment clause is a question a machine cannot answer by itself." },
  { t: "AI compiles it into a spec", d: "One model writes a machine-checkable spec: parties, outcomes, payouts, hard caps, deadline, evidence sources and the judgment clause. A second model family audits it against the English, and a human signs off." },
  { t: "Funds go into a capped escrow", d: "The escrow is code that reads only the spec. It can pay only listed outcomes to listed parties, up to the caps. Its id is the spec's sha256." },
  { t: "Evidence is snapshotted and hashed", d: "Each source is saved and hashed before any model sees it, and fenced in the prompt as untrusted data. Anyone can check the models saw exactly these bytes." },
  { t: "Each model commits first", d: "Six model families answer privately and publish a signed commitment: sha256(juror, answer, salt). Nobody sees anyone else's answer yet." },
  { t: "Reveal, drop, tally", d: "Answers are revealed and must open their commitments. NA and broken replies are dropped and not charged. The winner needs 2/3 of counted votes; dissent is kept in the record." },
  { t: "Signed record settles on Solana", d: "The winning bloc signs the record hash. One Solana transaction verifies those ed25519 signatures, writes the hash and pays out. A forged signature fails the whole transaction." },
  { t: "Disputes go to other families", d: "A party can re-open the ruling. A second jury with no shared model family re-judges the same evidence; disagreement escalates instead of picking a side." },
];
const OPS = ["GPT", "Claude", "Gemini", "Qwen", "DeepSeek", "Llama"];
const BOX = [[30, 40], [250, 40], [470, 40], [690, 40]];

const TEAL = "#5fe0c8", MUTED_BORDER = "#1e2a36", BAD = "#f07a7a", DIM = "#9aa7b4";
const LABELS = [["English", "contract"], ["Spec", "+ audit"], ["Escrow", "hard caps"], ["Evidence", "sha256"]];

type SceneProps = { s: number; all: boolean };
const useLit = ({ s, all }: SceneProps) => (i: number) => ({ opacity: all || s >= i ? 1 : 0.55 });
const juror = (s: number, i: number) => {
  const na = i === 4, dissent = i === 2;
  const color = s < 4 ? MUTED_BORDER : s === 4 ? TEAL : na ? DIM : dissent ? BAD : TEAL;
  const label = s < 4 ? "" : s === 4 ? "c=3f9a…" : na ? "NA · dropped" : dissent ? "no_payout" : "full_payout";
  return { color, label, dash: s >= 5 && na ? "4 4" : undefined };
};
const STYLE = (cls: string, base: number, mono: number) => `.${cls} text{font-family:var(--font-sans);fill:#9aa7b4;font-size:${base}px}.${cls} .m{font-family:var(--font-mono);font-size:${mono}px}.${cls} .h{fill:#e6edf3;font-weight:600}`;

function Wide(p: SceneProps) {
  const { s } = p; const lit = useLit(p);
  const hl = (i: number) => (s === i ? TEAL : MUTED_BORDER);
  return (
    <svg className="walk-wide" viewBox="0 0 900 470" role="img" aria-label={`Step ${s + 1}: ${STEPS[s].t}`}>
      <style>{STYLE("w", 15, 13)}</style>
      <g className="w">
        {BOX.map(([x, y], i) => (
          <g key={i} className="fade" style={lit(i)}>
            <rect x={x} y={y} width="180" height="80" rx="10" style={{ fill: "#0e141b", stroke: hl(i), strokeWidth: s === i ? 2.5 : 1.2 }} />
            <text x={x + 90} y={y + 34} textAnchor="middle" className="h">{LABELS[i][0]}</text>
            <text x={x + 90} y={y + 58} textAnchor="middle" className="m">{LABELS[i][1]}</text>
            {i > 0 && <line x1={x - 40} x2={x} y1={y + 40} y2={y + 40} stroke={TEAL} strokeWidth="2" className="flow" />}
          </g>
        ))}
        <text x="450" y="170" textAnchor="middle" className="fade" style={lit(4)}>{s < 5 ? "commit: signed hashes only" : "reveal: answers must open their commitments"}</text>
        {OPS.map((o, i) => {
          const x = 110 + i * 136, j = juror(s, i);
          return (
            <g key={o} className="fade" style={lit(4)}>
              <circle cx={x} cy="225" r="32" style={{ fill: "#0e141b", stroke: j.color, strokeWidth: 2.5, strokeDasharray: j.dash }} />
              <text x={x} y="230" textAnchor="middle" className="m">{o}</text>
              <text x={x} y="282" textAnchor="middle" className="m" style={{ fill: j.color === MUTED_BORDER ? DIM : j.color }}>{j.label}</text>
            </g>
          );
        })}
        <g className="fade" style={lit(5)}>
          <rect x="200" y="305" width="500" height="12" rx="6" style={{ fill: "#0b0e12", stroke: MUTED_BORDER }} />
          <rect x="200" y="305" width={s >= 5 ? 400 : 0} height="12" rx="6" fill={TEAL} style={{ transition: "width 700ms" }} />
          <line x1="533" x2="533" y1="299" y2="323" style={{ stroke: "#e6edf3" }} strokeWidth="2" />
          <text x="450" y="342" textAnchor="middle" className="m">4 of 5 counted = 80% ≥ 2/3 · 1 NA dropped, not charged</text>
        </g>
        <g className="fade" style={lit(6)}>
          <rect x="30" y="370" width="390" height="80" rx="10" style={{ fill: "#0e141b", stroke: s === 6 ? TEAL : MUTED_BORDER, strokeWidth: 2 }} />
          <text x="225" y="402" textAnchor="middle" className="h">Signed record → Solana</text>
          <text x="225" y="428" textAnchor="middle" className="m">Ed25519 verify · memo · pay Ana 500 PLAY</text>
        </g>
        <g className="fade" style={lit(7)}>
          <rect x="480" y="370" width="390" height="80" rx="10" style={{ fill: "#0e141b", stroke: s === 7 ? TEAL : "#3a4652", strokeWidth: 2, strokeDasharray: "6 4" }} />
          <text x="675" y="402" textAnchor="middle" className="h">Dispute, then jury B</text>
          <text x="675" y="428" textAnchor="middle" className="m">Mistral · Kimi · GLM · Nova: upheld</text>
        </g>
      </g>
    </svg>
  );
}

/** Phone layout: one column, text at 15 to 17 units in a 340-unit-wide viewBox, so labels stay at 12 px or more. */
function Tall(p: SceneProps) {
  const { s } = p; const lit = useLit(p);
  const hl = (i: number) => (s === i ? TEAL : MUTED_BORDER);
  return (
    <svg className="walk-tall" viewBox="0 0 340 900" role="img" aria-label={`Step ${s + 1}: ${STEPS[s].t}`}>
      <style>{STYLE("wt", 16, 15)}</style>
      <g className="wt">
        {LABELS.map(([a, b], i) => {
          const y = 14 + i * 78;
          return (
            <g key={a} className="fade" style={lit(i)}>
              {i > 0 && <line x1="170" x2="170" y1={y - 16} y2={y} stroke={TEAL} strokeWidth="2" className="flow" />}
              <rect x="20" y={y} width="300" height="62" rx="10" style={{ fill: "#0e141b", stroke: hl(i), strokeWidth: s === i ? 2.5 : 1.2 }} />
              <text x="170" y={y + 27} textAnchor="middle" className="h">{a}</text>
              <text x="170" y={y + 49} textAnchor="middle" className="m">{b}</text>
            </g>
          );
        })}
        <text x="170" y="350" textAnchor="middle" className="fade" style={lit(4)}>{s < 5 ? "commit: signed hashes only" : "reveal: answers must open"}</text>
        {s >= 5 && <text x="170" y="370" textAnchor="middle">their commitments</text>}
        {OPS.map((o, i) => {
          const cx = 60 + (i % 3) * 110, cy = 412 + Math.floor(i / 3) * 104, j = juror(s, i);
          return (
            <g key={o} className="fade" style={lit(4)}>
              <circle cx={cx} cy={cy} r="32" style={{ fill: "#0e141b", stroke: j.color, strokeWidth: 2.5, strokeDasharray: j.dash }} />
              <text x={cx} y={cy + 5} textAnchor="middle" className="m" style={{ fontSize: 14 }}>{o}</text>
              <text x={cx} y={cy + 56} textAnchor="middle" className="m" style={{ fontSize: 14, fill: j.color === MUTED_BORDER ? DIM : j.color }}>{j.label}</text>
            </g>
          );
        })}
        <g className="fade" style={lit(5)}>
          <rect x="20" y="628" width="300" height="12" rx="6" style={{ fill: "#0b0e12", stroke: MUTED_BORDER }} />
          <rect x="20" y="628" width={s >= 5 ? 240 : 0} height="12" rx="6" fill={TEAL} style={{ transition: "width 700ms" }} />
          <line x1="220" x2="220" y1="622" y2="646" style={{ stroke: "#e6edf3" }} strokeWidth="2" />
          <text x="170" y="668" textAnchor="middle" className="m">4 of 5 counted = 80% ≥ 2/3</text>
          <text x="170" y="688" textAnchor="middle" className="m">1 NA dropped, not charged</text>
        </g>
        <g className="fade" style={lit(6)}>
          <rect x="20" y="706" width="300" height="86" rx="10" style={{ fill: "#0e141b", stroke: s === 6 ? TEAL : MUTED_BORDER, strokeWidth: 2 }} />
          <text x="170" y="734" textAnchor="middle" className="h">Signed record → Solana</text>
          <text x="170" y="757" textAnchor="middle" className="m">Ed25519 verify · memo</text>
          <text x="170" y="778" textAnchor="middle" className="m">pay Ana 500 PLAY</text>
        </g>
        <g className="fade" style={lit(7)}>
          <rect x="20" y="806" width="300" height="86" rx="10" style={{ fill: "#0e141b", stroke: s === 7 ? TEAL : "#3a4652", strokeWidth: 2, strokeDasharray: "6 4" }} />
          <text x="170" y="834" textAnchor="middle" className="h">Dispute, then jury B</text>
          <text x="170" y="857" textAnchor="middle" className="m">Mistral · Kimi · GLM · Nova</text>
          <text x="170" y="878" textAnchor="middle" className="m">upheld</text>
        </g>
      </g>
    </svg>
  );
}

export default function Walkthrough() {
  const [s, setS] = useState(0);
  const [play, setPlay] = useState(true);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => { setReduced(mq.matches); if (mq.matches) setPlay(false); };
    on(); mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  useEffect(() => { if (!play) return; const id = setTimeout(() => setS((x) => (x + 1) % STEPS.length), 3400); return () => clearTimeout(id); }, [s, play]);
  const all = reduced || !play;
  return (
    <div className="walk">
      <div><Wide s={s} all={all} /><Tall s={s} all={all} /></div>
      <div>
        <ol>{STEPS.map((x, i) => (
          <li key={x.t}><button aria-current={i === s ? "step" : undefined} onClick={() => { setS(i); setPlay(false); }}><span className="n">{i + 1}</span><span><b style={{ color: "var(--text)", fontWeight: 600 }}>{x.t}</b>{i === s && <><br />{x.d}</>}</span></button></li>
        ))}</ol>
        <p className="muted">Illustration. The NA vote and the dissent are only in the animation. The real flight-delay run was 6 of 6: see <a href="/docs/recorded-runs">Recorded runs</a>.</p>
        <button className="btn btn-secondary" style={{ marginTop: "var(--sp-3)" }} onClick={() => setPlay((p) => !p)}>{play ? "Pause animation" : "Play animation"}</button>
      </div>
    </div>
  );
}
