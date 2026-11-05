import Chrome from "@/components/Chrome";
import { pageMeta } from "@/lib/page-meta";
import { performanceModel } from "@/lib/performance";

export const metadata = pageMeta("Security", "/security");

const fp = performanceModel.inputs.flashprove;
const src = fp.sources;

const THREATS: [string, string, string, string][] = [
  ["A juror secretly runs a different model", "Proof of inference: each vote carries a proof that the committed model produced it", "ill", "design only, FlashProve prototype"],
  ["Jurors share a blind spot or collude", "Jurors from different labs, quorum, and a second jury of other model families on dispute", "real", "built"],
  ["Instructions hidden in the evidence", "Evidence fenced as data; jurors flag suspected injection; tested in recorded runs", "real", "built"],
  ["Forged or poisoned evidence", "Signed sources and a dispute window", "ill", "design only; today it fooled every model"],
  ["A juror key is stolen", "Quorum plus hard caps in code; a stolen key can't pay out alone", "real", "built"],
  ["The compiler gets the rules wrong", "A second model hunts loopholes; a person signs the steps before funds move", "real", "built"],
  ["The inscribed rules are swapped", "Read the inscription back and match the stored hash before judging", "real", "built (local validator)"],
  ["A vote is replayed on another action", "Each attestation signs a hash over the inscribed steps, the call and the input; the chain id is added in the proposal", "ill", "built, chain id design only"],
  ["A private ASC leaks", "Encrypted to jurors only; any juror could still leak it", "ill", "design only"],
  ["The jury doesn't answer", "Timeout means hold, then refund; never allow by default", "ill", "design only"],
];

export default function Page() {
  return (
    <Chrome current="/security">
      <div className="d-wrap" style={{ paddingTop: 56, paddingBottom: 32 }}>
        <div className="d-eb">Security</div>
        <h1 className="d-h1 d-md">Proving the jury is who it says it is</h1>
        <p className="d-lede">An AI jury is only as trustworthy as the claim that each juror is the model it says it is. The cornerstone of Actually Smart Contracts is being able to prove that a given model, with a given set of weights, produced each vote.</p>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">The gap signatures can&apos;t close</h2>
        <p className="d-mut" style={{ maxWidth: 780 }}>Today every juror signs its vote with its own wallet. That proves which wallet voted. It doesn&apos;t prove which model ran. A juror could quietly swap in a cheaper model, a fine-tuned one, or a person, and the signatures would look the same.</p>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">Provable inference</h2>
        <p className="d-mut" style={{ maxWidth: 820 }}>Anthropic&apos;s research post <a href={src.anthropic_research}>Progress on provable inference for large language models</a> (Nov 2, 2026) describes FlashProve: a model provider publishes a short fingerprint that pins down one exact set of weights, then produces a proof for each response that the committed model generated it. The proof is zero-knowledge: it reveals nothing about the weights, the intermediate values or which experts ran. A verifier needs no GPU.</p>
        <div className="d-grid4" style={{ marginTop: 18 }}>
          <div className="d-card" style={{ padding: 16 }}><div style={{ fontSize: 24, fontWeight: 700 }}>~70 to 95x</div><div className="d-dim" style={{ fontSize: 13.5 }}>GPU time vs serving the model on vLLM</div></div>
          <div className="d-card" style={{ padding: 16 }}><div style={{ fontSize: 24, fontWeight: 700 }}>{fp.proving_tokens_per_sec_per_h100} tok/s</div><div className="d-dim" style={{ fontSize: 13.5 }}>proving on one H100 ({fp.batch_example.requests} requests in ~{fp.batch_example.seconds} s)</div></div>
          <div className="d-card" style={{ padding: 16 }}><div style={{ fontSize: 24, fontWeight: 700 }}>{fp.proof_mb} MB</div><div className="d-dim" style={{ fontSize: 13.5 }}>per proof, {fp.max_context_tokens.toLocaleString("en-US")}-token context</div></div>
          <div className="d-card" style={{ padding: 16 }}><div style={{ fontSize: 24, fontWeight: 700 }}>{fp.verify_seconds_24_threads} s</div><div className="d-dim" style={{ fontSize: 13.5 }}>to verify on 24 CPU threads</div></div>
        </div>
        <p className="d-dim" style={{ fontSize: 14, marginTop: 10 }}>Demonstrated on Llama 4 Maverick (400B Mixture-of-Experts, 4-bit). {fp.hardware}. Offline setup about {fp.offline_phase_minutes_once_per_model} minutes per model. Figures from Anthropic&apos;s post. <span className="d-tag">design only</span> Not used on this site.</p>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">Why it matters for ASCs</h2>
        <div className="d-grid3">
          {[
            ["Model substitution becomes detectable", "Each juror's model commitment sits in the juror registry. A vote counts only with a proof that checks against that commitment, the prompt and the answer."],
            ["Jurors can run anywhere", "If the proof checks, it doesn't matter who hosts the juror. Anyone with the hardware can run one and be paid per ruling, without being trusted."],
            ["Closed models could join", "The proof hides the weights, so a lab could publish a commitment without publishing its model. None has yet."],
            ["Greedy decoding fits juries", "Proofs cover greedy (deterministic) outputs, which is how jurors should answer anyway: the same question gets the same vote."],
            ["Disputes get cheaper", "A challenger downloads a 19 MB proof and checks it in under a minute, instead of re-running the model."],
            ["Audits outlive the run", "The proof hash is inscribed with the attestation, so a ruling can be re-checked years later."],
          ].map(([t, d]) => (
            <div className="d-card" key={t} style={{ padding: 18 }}><b>{t}</b><div className="d-mut" style={{ fontSize: 15, marginTop: 4 }}>{d}</div></div>
          ))}
        </div>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">How it would plug in</h2>
        <ol className="d-b d-mut" style={{ paddingLeft: 22 }}>
          <li>Each juror registers its model commitment (fingerprint) in the IQ Labs juror table.</li>
          <li>Jurors answer with greedy decoding, inside the {fp.max_context_tokens.toLocaleString("en-US")}-token context.</li>
          <li>After the vote, each juror produces a proof and stores it off chain; its hash goes in the attestation&apos;s proof field.</li>
          <li>Payout waits for a challenge window. Anyone can verify; a proof that fails voids the vote and the juror&apos;s bond.</li>
        </ol>
        <p className="d-dim" style={{ fontSize: 14 }}>Design only. No proof has been generated on this site. A Solana transaction can&apos;t hold a {fp.proof_mb} MB proof, so proofs are checked off chain and challenged, not verified in the transaction.</p>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">What it costs, and what it doesn&apos;t cover</h2>
        <ul className="d-b d-mut">
          <li>Time and effort: proofs are made after the answer, in batches, so a proven ruling waits minutes. See <a href="/performance">Performance</a> for the cost model.</li>
          <li>Context: {fp.max_context_tokens.toLocaleString("en-US")} tokens today, so evidence must be short or split.</li>
          <li>One model so far: Llama 4 Maverick. A proven jury today is copies of one open model, which weakens lab diversity.</li>
          <li>Not covered: side channels, the model&apos;s architecture (not hidden), whether the hardware does other work, and sampled outputs.</li>
          <li>Trust gaps Anthropic names: the fast prover and C++ verifier aren&apos;t formally verified; the Lean statements need manual audit.</li>
          <li>Status: {fp.status}.</li>
        </ul>
        <p style={{ marginTop: 10 }}>
          <a href={src.anthropic_research}>Anthropic research post</a> · <a href={src.technical_report}>Technical report</a> · <a href={src.protocol_spec}>Protocol spec (PDF)</a> · <a href={src.code}>FlashProve code</a> · <a href={src.lean_proofs}>Lean proofs</a>
        </p>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">Threat model</h2>
        <table className="d-table">
          <thead><tr><th>Threat</th><th>Defense</th><th>Status</th></tr></thead>
          <tbody>
            {THREATS.map(([threat, defense, kind, status]) => (
              <tr key={threat}>
                <td><b>{threat}</b></td>
                <td className="d-mut" style={{ fontSize: 15 }}>{defense}</td>
                <td><span className={`d-tag ${kind}`}>{status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Chrome>
  );
}
