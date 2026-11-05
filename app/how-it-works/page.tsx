import Chrome from "@/components/Chrome";
import { pageMeta } from "@/lib/page-meta";
import Walkthrough from "@/components/Walkthrough";
import { CapsDiagram, CommitRevealDiagram, DisputeDiagram, HarnessVsModelDiagram, OracleFlowDiagram } from "@/components/Diagrams";

export const metadata = pageMeta("How it works", "/how-it-works");

const PARTS = [
  ["Compiler", "English to a loop-free step list; a second model hunts for loopholes; a person signs off."],
  ["Inscription", "IQ Labs code-in stores the steps; the ASC is referenced by its transaction id and the hash of its bytes."],
  ["Jury harness", "Holds juror keys, hashes evidence, runs commit then reveal, drops invalid answers, tallies quorum."],
  ["Escrow", "Pays only listed outcomes to listed payees, clamped to hard caps; verifies every juror signature."],
  ["Disputes", "A second jury from other model families re-judges on the same evidence."],
  ["Proof of model", "Planned: proof of which model answered, following Anthropic's FlashProve prototype. Not used on this site."],
];

export default function Page() {
  return (
    <Chrome current="/how-it-works">
      <div className="d-wrap" style={{ paddingTop: 56, paddingBottom: 32 }}>
        <div className="d-eb">How it works</div>
        <h1 className="d-h1 d-md">From an English rule to a signed result</h1>
        <p className="d-lede">The full mechanism, for engineers. The homepage tells the story; this page shows the parts.</p>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">The parts</h2>
        <div className="d-grid3">
          {PARTS.map(([t, d]) => (
            <div className="d-card" key={t} style={{ padding: 20 }}>
              <b>{t}</b>
              <div className="d-mut" style={{ fontSize: 15.5, marginTop: 4 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">From an English sentence to a Solana transfer</h2>
        <Walkthrough />
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">Each part, drawn out</h2>
        <div className="stack" style={{ marginTop: 16 }}>
          <OracleFlowDiagram />
          <div className="grid2"><HarnessVsModelDiagram /><CommitRevealDiagram /></div>
          <div className="grid2"><CapsDiagram /><DisputeDiagram /></div>
        </div>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">Who runs it</h2>
        <p className="d-mut">Each juror is a named model family behind a deterministic harness. The harness holds the keys, computes the hashes and checks every signature. The models only vote. A bad or empty answer fails the checks and is dropped.</p>
        <div className="d-grid2" style={{ marginTop: 14 }}>
          <div className="d-card"><b>Deterministic core</b><div className="d-mut">Escrow caps, hashes, signatures and quorum are plain code.</div></div>
          <div className="d-card"><b>Judgment layer</b><div className="d-mut">Model families rule on the English clauses by commit, then reveal.</div></div>
          <div className="d-card"><b>Solana settles</b><div className="d-mut">One Solana transaction checks the signatures and pays inside the caps. There is no coin and no token.</div></div>
        </div>
      </div>
    </Chrome>
  );
}
