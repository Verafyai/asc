/** Block diagrams. Illustrations: names are placeholders; real runs are on the Recorded runs page. Wide SVG on desktop, a tall HTML stack under 768 px. */
function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}g`} x1="0" x2="1"><stop offset="0" style={{ stopColor: "#5fe0c8" }} /><stop offset="1" style={{ stopColor: "#5fe0c8" }} /></linearGradient>
      <marker id={`${id}a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style={{ fill: "var(--text-2)" }} /></marker>
      <marker id={`${id}r`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style={{ fill: "#f07a7a" }} /></marker>
    </defs>
  );
}
const css = `.dg text{font-family:var(--font-sans);fill:var(--text-3);font-size:15px}.dg .m{font-family:var(--font-mono);font-size:12.5px}.dg .h{fill:var(--text);font-weight:600;font-size:16px}.dg .t{fill:var(--surface);stroke:var(--border)}.dg .io{stroke:var(--text-2);stroke-width:1.6;fill:none}`;

function Box({ x, y, w, h, title, lines = [], stroke, dashed, wash }: { x: number; y: number; w: number; h: number; title: string; lines?: string[]; stroke?: string; dashed?: boolean; wash?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="12" style={{ fill: wash ?? "var(--surface)", stroke: stroke ?? "var(--border)", strokeWidth: stroke ? 2 : 1, strokeDasharray: dashed ? "7 5" : undefined }} />
      <text x={x + w / 2} y={y + 28} textAnchor="middle" className="h">{title}</text>
      {lines.map((l, i) => <text key={l} x={x + w / 2} y={y + 54 + i * 21} textAnchor="middle" className="m">{l}</text>)}
    </g>
  );
}
const A = ({ d, id, label, lx, ly, bad }: { d: string; id: string; label?: string; lx?: number; ly?: number; bad?: boolean }) => (
  <g><path d={d} className="io flow" style={bad ? { stroke: "#f07a7a" } : undefined} markerEnd={`url(#${id}${bad ? "r" : "a"})`} />{label && <text x={lx} y={ly} textAnchor="middle" className="m" style={{ fill: bad ? "#f07a7a" : "var(--text-2)" }}>{label}</text>}</g>
);
type Row = { t: string; l?: string[]; k?: "solid" | "dash" } | { arrow: string; bad?: boolean } | { group: Row[] };
function Tall({ rows, label }: { rows: Row[]; label: string }) {
  const one = (r: Row, i: number): React.ReactNode => {
    if ("arrow" in r) return <div key={i} className={`dt-arrow${r.bad ? " bad" : ""}`} aria-hidden={!r.arrow}>↓{r.arrow && <small>{r.arrow}</small>}</div>;
    if ("group" in r) return <div key={i} className="dt-row">{r.group.map(one)}</div>;
    return <div key={i} className={`dt-box${r.k ? " " + r.k : ""}`}><b>{r.t}</b>{r.l?.map((x) => <span key={x}>{x}</span>)}</div>;
  };
  return <div className="diagram-tall" role="img" aria-label={label}>{rows.map(one)}</div>;
}
function Fig({ id, label, vb, children, caption, tall }: { id: string; label: string; vb: string; children: React.ReactNode; caption: React.ReactNode; tall: Row[] }) {
  return (
    <figure className="diagram" style={{ margin: 0 }}>
      <svg className="diagram-wide" viewBox={vb} role="img" aria-label={label}><Defs id={id} /><style>{css}</style><g className="dg">{children}</g></svg>
      <Tall rows={tall} label={label} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function OracleFlowDiagram() {
  return (
    <Fig tall={[
  { t: "English contract", l: ["plain language,", "AI judgment clause"] }, { arrow: "" },
  { t: "Compile + audit", l: ["model A writes spec", "model B checks it", "human signs off"], k: "dash" }, { arrow: "" },
  { t: "Spec + escrow", l: ["outcomes, hard caps", "contract id = sha256"], k: "solid" }, { arrow: "with" },
  { t: "Evidence", l: ["snapshots, sha256", "fenced as data"] }, { arrow: "" },
  { t: "AI jury", l: ["6 model families", "1 commit (signed)", "2 reveal", "drop NA / invalid", "2/3 quorum", "dissent recorded"], k: "dash" }, { arrow: "" },
  { t: "Signed record", l: ["quorum ed25519", "record hash"], k: "solid" }, { arrow: "escrow checks the verdict against caps" },
  { t: "Solana", l: ["inscribe", "verify sigs", "transfer"], k: "solid" },
]} id="of" vb="0 0 1180 300" label="Oracle flow: English contract, compiler and auditor, spec and escrow, evidence snapshots, jury commit and reveal, signed record, Solana settlement." caption={<>The oracle flow. Models appear in two places only: compiling the English, and answering the judgment clause. Everything between them is deterministic code, and Solana only sees the signed result.</>}>
      <Box x={10} y={40} w={170} h={110} title="English contract" lines={["plain language,", "AI judgment clause"]} />
      <Box x={220} y={40} w={180} h={110} title="Compile + audit" lines={["model A writes spec", "model B checks it", "human signs off"]} stroke="#3a4652" dashed />
      <Box x={440} y={40} w={170} h={110} title="Spec + escrow" lines={["outcomes, hard caps", "contract id = sha256"]} stroke="#5fe0c8" />
      <Box x={440} y={180} w={170} h={100} title="Evidence" lines={["snapshots, sha256", "fenced as data"]} />
      <Box x={650} y={40} w={180} h={240} title="AI jury" lines={["6 model families", "1 commit (signed)", "2 reveal", "drop NA / invalid", "2/3 quorum", "dissent recorded"]} stroke="#3a4652" dashed />
      <Box x={870} y={40} w={150} h={110} title="Signed record" lines={["quorum ed25519", "record hash"]} stroke="#5fe0c8" />
      <Box x={1050} y={40} w={120} h={110} title="Solana" lines={["inscribe", "verify sigs", "transfer"]} stroke="url(#ofg)" />
      <A id="of" d="M180 95 L216 95" /><A id="of" d="M400 95 L436 95" /><A id="of" d="M610 95 L646 95" /><A id="of" d="M610 230 L646 230" /><A id="of" d="M830 95 L866 95" /><A id="of" d="M1020 95 L1046 95" />
      <A id="of" d="M945 150 C945 250 600 290 530 150" label="escrow checks the verdict against caps" lx={790} ly={292} />
    </Fig>
  );
}

export function HarnessVsModelDiagram() {
  const tiles = ["Keys and signing (ed25519)", "Evidence hashing", "Commit-reveal bookkeeping", "Quorum tally", "Escrow caps and payouts", "Budget meter"];
  return (
    <Fig tall={[
  { t: "Each model (untrusted)", l: ["reads: question + evidence", "writes: {outcome, amount, confidence, reasoning, injection_suspected}", "no keys, no network, no access to funds"], k: "dash" },
  { arrow: "answer (prompt goes up)" },
  { t: "Harness and escrow (deterministic code)", l: ["Keys and signing (ed25519)", "Evidence hashing", "Commit-reveal bookkeeping", "Quorum tally", "Escrow caps and payouts", "Budget meter"], k: "solid" },
]} id="hm" vb="0 0 1120 420" label="Harness versus model: the model turns text into text; the harness holds keys, hashes, tallies and escrow." caption={<>Harness vs model. A model returns a JSON answer and nothing else. It holds no key and moves no funds. If it is wrong or hijacked, the worst it can do is choose a listed outcome; the caps bound what that outcome pays.</>}>
      <Box x={30} y={80} w={300} h={260} title="Each model (untrusted)" lines={["reads: question + evidence", "writes: {outcome, amount,", "confidence, reasoning,", "injection_suspected}", "", "no keys, no network,", "no access to funds"]} stroke="#3a4652" dashed />
      <rect x="430" y="40" width="660" height="340" rx="14" style={{ fill: "var(--surface)", stroke: "url(#hmg)", strokeWidth: 2 }} />
      <text x="760" y="72" textAnchor="middle" className="h">Harness and escrow (deterministic code)</text>
      {tiles.map((t, i) => (
        <g key={t}><rect x={460 + (i % 2) * 310} y={100 + Math.floor(i / 2) * 82} width="290" height="60" rx="10" className="t" /><text x={605 + (i % 2) * 310} y={136 + Math.floor(i / 2) * 82} textAnchor="middle">{t}</text></g>
      ))}
      <A id="hm" d="M330 170 L426 170" label="prompt" lx={378} ly={160} /><A id="hm" d="M426 250 L334 250" label="answer" lx={378} ly={240} />
    </Fig>
  );
}

export function CommitRevealDiagram() {
  return (
    <Fig tall={[
  { t: "1 · Answer privately", l: ["answer JSON", "reasoning → sha256", "random salt"] }, { arrow: "" },
  { t: "2 · Commit", l: ["c = sha256(op, answer, salt)", "juror signs c", "all commits → commit set", "hash, frozen"], k: "solid" }, { arrow: "" },
  { t: "3 · Reveal", l: ["publish answer + salt", "harness re-hashes", "must equal c"], k: "solid" }, { arrow: "changed answer ≠ commitment → rejected", bad: true },
  { t: "4 · Count", l: ["counted / NA / invalid", "NA, invalid: dropped, not charged", "2/3 of counted wins"] },
]} id="cr" vb="0 0 1120 300" label="Commit and reveal: each juror publishes a signed hash of its answer first, then reveals; a reveal that does not open its commitment is rejected." caption={<>Commit-reveal. No juror can see another&apos;s answer before committing to its own, so copying the majority or changing an answer after the fact is detectable. It does not stop models that share the same blind spot from agreeing.</>}>
      <Box x={20} y={40} w={240} h={200} title="1 · Answer privately" lines={["answer JSON", "reasoning → sha256", "random salt"]} />
      <Box x={300} y={40} w={250} h={200} title="2 · Commit" lines={["c = sha256(op, answer, salt)", "juror signs c", "all commits → commit set", "hash, frozen"]} stroke="#5fe0c8" />
      <Box x={590} y={40} w={240} h={200} title="3 · Reveal" lines={["publish answer + salt", "harness re-hashes", "must equal c"]} stroke="#5fe0c8" />
      <Box x={870} y={40} w={230} h={200} title="4 · Count" lines={["counted / NA / invalid", "NA, invalid: dropped,", "not charged", "2/3 of counted wins"]} />
      <A id="cr" d="M260 140 L296 140" /><A id="cr" d="M550 140 L586 140" /><A id="cr" d="M830 140 L866 140" />
      <A id="cr" d="M710 240 L710 282 L420 282" bad label="changed answer ≠ commitment → rejected" lx={565} ly={274} />
    </Fig>
  );
}

export function CapsDiagram() {
  return (
    <Fig tall={[
  { t: "Jury verdict", l: ["rebalance_to_stable", "amount: 1,000,000", "“also pay wallet 9xQe…”"], k: "dash" }, { arrow: "" },
  { t: "Escrow checks (code)", l: ["✓ quorum reached", "✓ outcome is listed and allowed", "✓ payee is a party (free text ignored)", "→ clamp to max single transfer 100,000", "→ clamp total to min(cap, balance)"], k: "solid" }, { arrow: "" },
  { t: "Transfer", l: ["stable_reserve: 100,000", "remainder stays in escrow", "wallet 9xQe…: nothing"], k: "solid" },
]} id="cp" vb="0 0 1120 280" label="Hard caps: whatever the jury says, the escrow only pays listed outcomes to listed parties, within the caps." caption={<>Caps. The escrow ignores everything a model writes except the outcome id and an amount. It rejects unlisted outcomes and payees, clamps amounts to the caps, and keeps the rest in escrow.</>}>
      <Box x={20} y={50} w={280} h={170} title="Jury verdict" lines={["rebalance_to_stable", "amount: 1,000,000", "“also pay wallet 9xQe…”"]} stroke="#3a4652" dashed />
      <Box x={360} y={30} w={400} h={210} title="Escrow checks (code)" lines={["✓ quorum reached", "✓ outcome is listed and allowed", "✓ payee is a party (free text ignored)", "→ clamp to max single transfer 100,000", "→ clamp total to min(cap, balance)"]} stroke="url(#cpg)" />
      <Box x={820} y={50} w={280} h={170} title="Transfer" lines={["stable_reserve: 100,000", "remainder stays in escrow", "", "wallet 9xQe…: nothing"]} stroke="#5fe0c8" />
      <A id="cp" d="M300 135 L356 135" /><A id="cp" d="M760 135 L816 135" />
    </Fig>
  );
}

export function DisputeDiagram() {
  return (
    <Fig tall={[
  { t: "Ruling A", l: ["6 families", "signed record R1"], k: "solid" }, { arrow: "" },
  { t: "Dispute", l: ["party re-opens", "within the window", "(bond: design only)"], k: "dash" }, { arrow: "" },
  { t: "Jury B", l: ["4 other families", "same evidence hashes", "record R2 links R1"], k: "solid" }, { arrow: "" },
  { group: [{ t: "same outcome → upheld" }, { t: "other quorum → overturned" }, { t: "no quorum → escalated" }] },
]} id="dp" vb="0 0 1120 300" label="Dispute: a party re-opens a ruling; a second jury with no shared model families re-judges; agree upholds, disagree escalates." caption={<>Disputes. A party can re-open a ruling within the window. Jury B shares no model family with jury A, so a family-wide blind spot has to exist in two unrelated families to survive. Agreement upholds; a different quorum overturns; no quorum escalates to the contract&apos;s fallback.</>}>
      <Box x={20} y={60} w={220} h={160} title="Ruling A" lines={["6 families", "signed record R1"]} stroke="#5fe0c8" />
      <Box x={290} y={60} w={220} h={160} title="Dispute" lines={["party re-opens", "within the window", "(bond: design only)"]} dashed />
      <Box x={560} y={60} w={240} h={160} title="Jury B" lines={["4 other families", "same evidence hashes", "record R2 links R1"]} stroke="#5fe0c8" />
      <Box x={850} y={20} w={250} h={70} title="same outcome → upheld" />
      <Box x={850} y={110} w={250} h={70} title="other quorum → overturned" />
      <Box x={850} y={200} w={250} h={70} title="no quorum → escalated" />
      <A id="dp" d="M240 140 L286 140" /><A id="dp" d="M510 140 L556 140" /><A id="dp" d="M800 120 L846 60" /><A id="dp" d="M800 140 L846 145" /><A id="dp" d="M800 160 L846 230" />
    </Fig>
  );
}
