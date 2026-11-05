import DocsFrame from "@/components/DocsFrame";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("Trust and limits", "/docs/trust");

const ROWS: [string, string, string, string][] = [
  ["Evidence snapshots and hashes", "real", "Every source is saved and hashed before any model sees it.", "Proves which bytes were shown. Says nothing about whether the source was honest. See the forged-evidence run."],
  ["Commit and reveal", "real", "Each juror publishes a hash of its answer before any answer is shown.", "Stops copying inside one run. In this demo the harness runs the jurors, so it is a protocol check."],
  ["Signed answers and record", "real", "Jurors sign their answers. Tampering breaks a check.", "Demo keys come from public seeds. They prove the mechanism, not a person's identity."],
  ["Quorum and caps", "real", "Listed outcomes and payees only, with hard caps.", "Caps do nothing when the wrong outcome is a listed one."],
  ["Solana signature check", "real, local validator", "One local transaction verified the signatures, wrote a memo and paid. A forged signature failed the whole transaction.", "Not devnet or mainnet. A program that enforces caps itself is design only."],
  ["IQ Labs inscription", "real, local validator", "Rules were inscribed and read back byte for byte on a local validator.", "Not run on devnet or mainnet."],
  ["Proof of which model answered", "design only", "Plan: FlashProve for one open model, proof hash inscribed, verified off chain.", "No proof was generated on this site. FlashProve is Anthropic research, not live here."],
  ["Closed models", "design only", "The recorded model id is what the API returned.", "A provider can serve a different model than it names. Nothing here detects that."],
  ["Poisoned evidence", "design only", "The fix is signed sources and a dispute window.", "A forged correction fooled all 10 models in the recorded test."],
];

export default function Page() {
  return (
    <DocsFrame current="/docs/trust">
      <div className="d-eb">Docs</div>
      <h1 className="d-h1 d-sm">Trust and limits</h1>
      <p className="d-lede">Given a record, anyone can check which evidence was used, what each juror answered, that answers were committed before reveal, and that the payout follows the rules. No proof of which model answered was generated for any run on this site.</p>
      <table className="d-table">
        <thead><tr><th>Property</th><th>Status</th><th>What it does</th><th>Limits</th></tr></thead>
        <tbody>
          {ROWS.map(([p, s, d, l]) => (
            <tr key={p}>
              <td><b>{p}</b></td>
              <td><span className={`d-tag ${s === "design only" ? "ill" : "real"}`}>{s}</span></td>
              <td>{d}</td>
              <td className="d-mut">{l}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="d-b d-mut">
        <li>Poisoned evidence can fool every juror.</li>
        <li>Models can share blind spots.</li>
        <li>A ruling takes 20 to 60 seconds and about a cent or less in model calls.</li>
        <li>Play money only.</li>
      </ul>
    </DocsFrame>
  );
}
