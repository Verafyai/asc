import Chrome from "@/components/Chrome";
import PerformanceCalc from "@/components/PerformanceCalc";
import { pageMeta } from "@/lib/page-meta";
import { headlines, performanceModel, usd, usdRange } from "@/lib/performance";

export const metadata = pageMeta("Performance", "/performance");

export default function Page() {
  const h = headlines();
  const fp = performanceModel.inputs.flashprove;
  return (
    <Chrome current="/performance">
      <div className="d-wrap" style={{ paddingTop: 56, paddingBottom: 32 }}>
        <div className="d-eb">Performance</div>
        <h1 className="d-h1 d-md">What an AI jury costs, and how fast it is</h1>
        <p className="d-lede">The cost of each step, with and without proof of which model answered. Every number is either measured on this site or modeled from published figures, and labeled.</p>
      </div>
      <div className="d-wrap" style={{ paddingBottom: 16 }}>
        <div className="d-grid4">
          <div className="d-card" style={{ padding: 18 }}>
            <div className="d-dim" style={{ fontSize: 13 }}>One ruling</div>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{usd(h.rulingUsd)}</div>
            <div className="d-dim" style={{ fontSize: 13 }}>5 jurors, model calls <span className="d-tag ill">modeled</span> · measured {usdRange(h.rulingMeasured[0], h.rulingMeasured[1])}</div>
          </div>
          <div className="d-card" style={{ padding: 18 }}>
            <div className="d-dim" style={{ fontSize: 13 }}>Time to a ruling</div>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{h.rulingSeconds[0]} to {h.rulingSeconds[1]} s</div>
            <div className="d-dim" style={{ fontSize: 13 }}><span className="d-tag real">measured</span> · plain code is under a second</div>
          </div>
          <div className="d-card" style={{ padding: 18 }}>
            <div className="d-dim" style={{ fontSize: 13 }}>Proving it</div>
            <div style={{ fontSize: 30, fontWeight: 700 }}>+{usd(h.proveExtraUsd)}</div>
            <div className="d-dim" style={{ fontSize: 13 }}>and minutes of delay <span className="d-tag ill">modeled</span> <span className="d-tag">design only</span></div>
          </div>
          <div className="d-card" style={{ padding: 18 }}>
            <div className="d-dim" style={{ fontSize: 13 }}>Certify a repo</div>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{usd(h.certifyUsd)}</div>
            <div className="d-dim" style={{ fontSize: 13 }}>{performanceModel.inputs.certify_rules} rules, without proofs <span className="d-tag ill">modeled</span></div>
          </div>
        </div>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">Running an ASC</h2>
        <table className="d-table">
          <thead><tr><th>Step</th><th>Assumption</th><th>Cost</th><th>Time</th><th>Note</th></tr></thead>
          <tbody>
            <tr><td>Compile an ASC (once)</td><td>{performanceModel.inputs.compile_tokens.calls} calls on {performanceModel.inputs.compile_tokens.model}</td><td>{usd(h.compileUsd)}</td><td>not in the model</td><td>one time per contract <span className="d-tag ill">modeled</span></td></tr>
            <tr><td>Inscribe it with IQ Labs code-in</td><td>{h.inscriptionBytes.toLocaleString("en-US")} bytes, {h.inscriptionTxs} Solana transactions</td><td>{usd(h.inscribeBaseUsd)} + IQ fee</td><td>not in the model</td><td>Solana base fee <span className="d-tag ill">modeled</span>. IQ&apos;s Solana fee is not published.</td></tr>
            <tr><td>One ruling, budget jury of {performanceModel.inputs.jurors}</td><td>{performanceModel.inputs.ruling_tokens.input.toLocaleString("en-US")} tokens in, {performanceModel.inputs.ruling_tokens.output} out per juror</td><td>{usd(h.rulingUsd)}</td><td>{h.rulingSeconds[0]} to {h.rulingSeconds[1]} s</td><td>measured range on the site: {usdRange(h.rulingMeasured[0], h.rulingMeasured[1])}</td></tr>
            <tr><td>Pay out on Solana</td><td>1 transaction</td><td>{usd(h.payoutUsd)}</td><td>not in the model</td><td>base fee at the SOL price in the model <span className="d-tag ill">modeled</span></td></tr>
          </tbody>
        </table>
        <p className="d-mut" style={{ fontSize: 16, marginTop: 12 }}>Trade-off: a ruling is the modeled cost above and takes {h.rulingSeconds[0]} to {h.rulingSeconds[1]} seconds in the measured runs. Plain contract code is cheaper and faster. Wrap only the actions where a wrong answer is expensive.</p>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">Proving which model answered</h2>
        <p className="d-mut" style={{ maxWidth: 780 }}>Signatures prove which wallet voted, not which model ran. Anthropic&apos;s FlashProve prototype produces a cryptographic proof that a specific model produced a specific answer, without revealing the weights. Today it works for one open model, Llama 4 Maverick, on contexts up to {fp.max_context_tokens.toLocaleString("en-US")} tokens. <span className="d-tag">design only</span> Proofs are not live on this site.</p>
        <table className="d-table" style={{ marginTop: 12 }}>
          <thead><tr><th>Step</th><th>Cost</th><th>Time</th><th>Note</th></tr></thead>
          <tbody>
            <tr><td>Ruling by 5 Llama 4 Maverick jurors</td><td>{usd(h.maverickRulingUsd)}</td><td>{h.rulingSeconds[0]} to {h.rulingSeconds[1]} s</td><td>the only model FlashProve has been shown on <span className="d-tag ill">modeled</span></td></tr>
            <tr><td>Prove each answer (5 proofs, {fp.max_context_tokens.toLocaleString("en-US")}-token contexts)</td><td>{usdRange(h.proveLowUsd, h.proveHighUsd)}</td><td>about {h.proofSeconds.toFixed(0)} GPU-seconds each; a batch of {h.batchRequests} takes about {h.batchSeconds} s</td><td>H100 at {usd(performanceModel.inputs.h100_usd_per_hour.low)} to {usd(performanceModel.inputs.h100_usd_per_hour.typical)} an hour</td></tr>
            <tr><td>Verify the 5 proofs</td><td>{usd(h.verifyUsd)}</td><td>about {h.verifySeconds} s each on 24 CPU threads</td><td>anyone can verify; cost shown at {usd(performanceModel.inputs.cpu24_usd_per_hour)} an hour of CPU</td></tr>
            <tr><td>Store the proofs</td><td>off chain</td><td></td><td>about {h.proofMb} MB each, about {Math.round(h.proofsStorageMb)} MB per ruling; only hashes go on chain</td></tr>
          </tbody>
        </table>
        <div className="d-grid3" style={{ marginTop: 16 }}>
          <div className="d-card" style={{ padding: 18 }}><b>Overhead</b><div className="d-mut" style={{ fontSize: 15, marginTop: 4 }}>About {h.overheadTypical} times the GPU work of serving the same model normally, up to {h.overheadHeaviest} times at the heaviest load tested.</div></div>
          <div className="d-card" style={{ padding: 18 }}><b>Hardware per juror</b><div className="d-mut" style={{ fontSize: 15, marginTop: 4 }}>{fp.hardware}. Kept on all month: {usd(h.hardwareLowMonth)} to {usd(h.hardwareHighMonth)}.</div></div>
          <div className="d-card" style={{ padding: 18 }}><b>The catch</b><div className="d-mut" style={{ fontSize: 15, marginTop: 4 }}>A proven jury today is five copies of one open model. Proof costs you the diversity of labs that makes the jury neutral.</div></div>
        </div>
        <p style={{ marginTop: 12 }}>
          <a href={fp.sources.anthropic_research}>Anthropic: Progress on provable inference</a> · <a href={fp.sources.technical_report}>FlashProve technical report</a> · <a href={fp.sources.code}>FlashProve code</a>
        </p>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">Certifying code</h2>
        <table className="d-table">
          <thead><tr><th>Review</th><th>Cost</th><th>Time</th><th>Note</th></tr></thead>
          <tbody>
            <tr><td>Certify a repo, {performanceModel.inputs.certify_rules} rules, budget jury of 5</td><td>{usd(h.certifyUsd)}</td><td>not in the model</td><td>{performanceModel.inputs.certify_tokens_per_rule.input.toLocaleString("en-US")} tokens of evidence per rule <span className="d-tag ill">modeled</span></td></tr>
            <tr><td>Same review, with proofs</td><td>{usdRange(h.certifyProveLow, h.certifyProveHigh)} + {usd(h.certifyVerify)} to verify</td><td>about {Math.round(h.certifyGpuMinutes)} GPU-minutes</td><td>{h.certifyProofs} proofs: evidence split into {fp.max_context_tokens.toLocaleString("en-US")}-token checks, Maverick jurors only <span className="d-tag">design only</span></td></tr>
          </tbody>
        </table>
        <p className="d-mut" style={{ fontSize: 16, marginTop: 12 }}>A proven review is possible but costly today, because each proof covers at most {fp.max_context_tokens.toLocaleString("en-US")} tokens and the evidence for a rule is about {(performanceModel.inputs.certify_tokens_per_rule.input + performanceModel.inputs.certify_tokens_per_rule.output).toLocaleString("en-US")} tokens of input plus output. It gets cheaper as the context limit grows.</p>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">Try your own numbers</h2>
        <PerformanceCalc />
        <p className="d-dim" style={{ fontSize: 14, marginTop: 10 }}>All inputs and formulas are in data/performance-model.json. Model prices: {h.priceSource}. SOL at {usd(performanceModel.inputs.sol_usd)} in the file. FlashProve figures from Anthropic&apos;s research post (Nov 2, 2026). As of {h.asOf}.</p>
      </div>
    </Chrome>
  );
}
