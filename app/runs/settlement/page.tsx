import Chrome from "@/components/Chrome";
import { vocab } from "@/lib/vocab";
import settlement from "@/data/settlement.json";
import compact from "@/data/compact-flight-delay.json";
import { pageMeta } from "@/lib/page-meta";
import { pt } from "@/lib/ui";

export const metadata = pageMeta("Settlement on Solana", "/runs/settlement");

export default function Page() {
  return (
    <Chrome>
      <section className="section"><div className="wrap stack">
        <div><p className="eyebrow">Solana settlement <span className="pill purple">real, local validator</span></p><h1>One transaction: verify the quorum, write the record, pay</h1>
          <p className="lead">The flight-delay record was settled on a local Solana validator ({settlement.cluster}) on {pt(settlement.ranAt)}. Signatures below are from that local ledger; they will not appear on any public explorer.</p></div>
        <div className="scroll-x"><table className="tbl"><thead><tr><th>Step</th><th>Result</th><th>Detail</th></tr></thead><tbody>
          {settlement.steps.map((s) => {
            const x = s as Record<string, unknown>;
            return <tr key={s.name}><td style={{ whiteSpace: "normal" }}>{vocab(s.name)}</td><td><span className={`pill ${s.ok ? "ok" : "bad"}`}>{s.ok ? ("rejected" in x ? "rejected, as intended" : "ok") : "failed"}</span></td>
              <td className="mono" style={{ whiteSpace: "normal", wordBreak: "break-all" }}>{x.sig ? `sig ${String(x.sig)} · ${x.bytes} B` : x.error ? `${String(x.error).split("\n")[1] ?? ""} payee balance unchanged: ${x.payeeLamportsAfter} lamports` : String(x.metadata ?? "")}</td></tr>;
          })}
        </tbody></table></div>
        <div className="grid2">
          <div className="card"><p className="eyebrow">Transaction layout</p><ol>
            <li>Ed25519 precompile: {settlement.quorum} signatures over the 32-byte record hash <span className="mono">{settlement.recordHash.slice(0, 16)}…</span>, 14-byte offsets per signature.</li>
            <li>Memo with the record hash.</li>
            <li>SystemProgram transfer: 500 PLAY stand-in as 5,000,000 lamports to the payee.</li>
          </ol><p>All three are atomic: if any signature fails, nothing is paid.</p></div>
          <div className="card"><p className="eyebrow">Not verified / design only</p><ul>
            <li><span className="pill bad">design</span> An escrow program that reads the instructions sysvar, checks the quorum keys against a registry, and enforces the caps itself. Today the escrow is a plain keypair that could move funds outside this tx.</li>
            <li><span className="pill bad">not run</span> Devnet: the public faucet returned 410 and faucet.solana.com needs a sign-in. Funding the throwaway payer <span className="mono">ARuaEdk94q7GFK94iLEuxN2mwWGngCTTqFaEbrYUttnU</span> with ~1 devnet SOL would let the same script run there.</li>
            <li><span className="pill purple">unverified</span> Per IQ Labs docs, a single inscription tx carries about 700 B inline and ~3,400 B with their chunking; we did not test the limits.</li>
            <li><span className="pill purple">unverified</span> SIMD-0296 (larger transactions) is in Review, so this design assumes today&apos;s 1,232-byte limit. Our settle tx is 1,142 B with 6 signatures, which caps the quorum near 6 or 7 signers per tx.</li>
          </ul></div>
        </div>
        <div><p className="eyebrow">Compact record inscribed via IQ Labs <span className="pill ok">real</span></p><pre className="mono" style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: 360, overflow: "auto" }}>{JSON.stringify(Object.fromEntries(Object.entries(compact).filter(([k]) => k !== "p")), null, 1)}</pre></div>
        <div className="card"><p className="eyebrow">svmLLM: side check before settlement</p><p>Separately, a model-based SVM simulator (svmLLM) predicts what the settle transaction will do. It is a pre-flight sanity check only; the validator is the source of truth. See the svmLLM line in each demo&apos;s escrow panel.</p></div>
      </div></section>
    </Chrome>
  );
}
