import "@/styles/site.css";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = { ...pageMeta("How it works", "/how-it-works"), description: "How an inference program works under the three draft SIMDs: create it with instructions and internal context, call it with a request, evaluators vote, a signed ruling comes back, and rulings can be challenged." };

const CSS = `.step{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:36px;align-items:start}
.step .txt p{color:#C9D2DB}
.step .n{font-family:var(--mono);color:var(--teal);font-size:14px;margin-bottom:8px}
.step .figure{margin:0}
.spec{font-size:14px;color:var(--dim);margin-top:10px}
@media (max-width:900px){.step{grid-template-columns:1fr;gap:18px}}
.toc{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}
.toc a{border:1px solid var(--line);border-radius:999px;padding:4px 12px;font-size:14px;color:var(--muted)}`;

export default function Page() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
<main className="w">
<section className="hero">
<p className="eb">How it works</p>
<h1>From a rule in English to a signed ruling on chain</h1>
<p className="lede">An inference program is a program written in natural language, stored on Solana, run by AI models off chain, and answered with a ruling that the calling program checks itself. Here is each step, as the three draft SIMDs define it.</p>
<nav className="toc" aria-label="Steps">
<a href="#idea">The idea</a><a href="#create">1. Create</a><a href="#call">2. Call</a><a href="#evaluate">3. Evaluate</a><a href="#rule">4. Rule</a><a href="#act">5. Act</a><a href="#challenge">6. Challenge</a><a href="#predict">Predictions</a><a href="#fast">Fast lane</a><a href="#limits">Limits</a>
</nav>
</section>
<section className="sec" id="idea">
<div className="step">
<div className="txt">
<p className="n">The idea</p>
<h2>A prompt on chain. Models off chain. A signed, provable answer.</h2>
<p>Store a prompt on chain the way you’d store a program, with the context that should shape the decision. Any Solana program can call it. Models run it off chain and each one signs its vote; a proof of inference can show which model did the work. The ruling is recorded on chain, and the calling program checks it before it acts.</p>
<p>Solana keeps the record, the rules and the payments. The thinking happens off chain, on hardware built for it.</p>
</div>
<figure className="figure"><img src="/simd-flow.svg" alt="Animation: a Solana program requests a ruling; AI models off chain read the prompt and context stored on chain, vote and attach proofs; the signed ruling is recorded on chain; the program verifies it and acts." /></figure>
</div>
<figure className="figure" style={{ "marginTop": "28px" }}><img src="/slides/anatomy.jpg" alt="Diagram: anatomy of an Actually Smart Contract. The caller injects a request prompt, external context, jury shaping and payment; the inference program holds its instructions and internal context; evaluators off chain rule and return a signed ruling." loading="lazy" /><figcaption>Internal context is the rules. External context is the case. The case never overrides the rules.</figcaption></figure>
</section>
<section className="sec" id="create">
<div className="step">
<div className="txt">
<p className="n">1. Create</p>
<h2>Write the instructions, attach the rules</h2>
<p><b>Instructions</b>{" "}say what the program is for and list the outcomes it may return, with a safe default for expiry or no quorum.{" "}<b>Internal context</b>{" "}is the program’s own material, applied to every call: a DAO constitution or bill of rights, run rules, an insurance policy, certification standards.</p>
<p>Each document is stored inline, pulled from a web page (snapshotted, so every model reads the same text) or from a trusted GitHub repository pinned at a commit. It can be compacted, compressed, or encrypted so only the program’s evaluators can read it.</p>
<p>The creator picks how changeable it is:{" "}<b>mutable</b>,{" "}<b>timelocked</b>{" "}(changes are public before they apply) or{" "}<b>frozen</b>. Every request pins the exact hashes it used, so a later edit never changes a past ruling.</p>
<p className="spec">Defined in{" "}<a href="/simds#programs">SIMD 1, Inference Programs</a>:{" "}<code>CreateContent</code>,{" "}<code>SnapshotLink</code>,{" "}<code>CreateContextSet</code>,{" "}<code>CreateInferenceProgram</code>,{" "}<code>SetMutability</code>.</p>
</div>
<figure className="figure"><img src="/slides/small.jpg" alt="Slide: small, private and changeable. Encodings, storage sizes and mutability modes." loading="lazy" /></figure>
</div>
</section>
<section className="sec" id="call">
<div className="step">
<div className="txt">
<p className="n">2. Call</p>
<h2>A request brings the question, the case, the jury and the money</h2>
<p>Another program, by cross-program invocation, or a user calls{" "}<code>RequestRuling</code>{" "}with:</p>
<ul className="b">
<li><b>A request prompt</b>: the question for this call, such as “Does proposal 42 comply?”</li>
<li><b>External context</b>: the evidence and case, as links (snapshotted), text or documents. It never overrides the internal context.</li>
<li><b>Jury shaping</b>: how many evaluators, the quorum, the assurance level, and which model families and models are allowed. A request can narrow the program’s jury, never widen it.</li>
<li><b>Payment</b>:{" "}<code>QuoteRuling</code>{" "}first, then an escrowed budget. Evaluators are paid at their published prices, the rest is refunded, and a callback asks for a top-up if the budget runs short.</li>
</ul>
<p className="spec">Defined in{" "}<a href="/simds#programs-payment-budget-and-refunds">SIMD 1</a>:{" "}<code>QuoteRuling</code>,{" "}<code>RequestRuling</code>,{" "}<code>TopUp</code>,{" "}<code>NotifyCaller</code>,{" "}<code>CloseRequest</code>.</p>
</div>
<figure className="figure"><img src="/slides/calling.jpg" alt="Slide: calling an Actually Smart Contract. Inject context and a prompt, shape the jury, pay for it." loading="lazy" /></figure>
</div>
<figure className="figure" style={{ "marginTop": "28px" }}><img src="/slides/request.jpg" alt="Block diagram: what goes into a request. The RulingRequest account holds pinned rules, the question, external context, jury shaping, payment, and callbacks and deadlines." loading="lazy" /><figcaption>The RulingRequest account: 2,816 bytes, rent refunded when the request closes.</figcaption></figure>
</section>
<section className="sec" id="evaluate">
<div className="step">
<div className="txt">
<p className="n">3. Evaluate</p>
<h2>Independent models vote, sign, and can prove which model ran</h2>
<p>Evaluators are model operators that register an Ed25519 signing key, their prices and a{" "}<b>model commitment</b>: hashes of the weights, the tokenizer and the decoding settings. They build the model’s context in a fixed order (instructions, internal context, external context labeled as supplied by the caller, then the input), so the case can’t pose as the rules.</p>
<p>Each evaluator commits to a hash of its answer first, then reveals a signed{" "}<b>attestation</b>{" "}bound to this request, these exact hashes and this input. No one can copy the majority.</p>
<p><b>The proof problem.</b>{" "}One proof of inference today is about 18.78 MB, against 1,232 bytes per Solana transaction, and takes about 17 seconds on 24 CPU threads to verify. So the chain stores a commitment to the output, model, runtime and proof, a reference that keeps them fetchable, and a bond. Anyone can challenge a vote by re-running an open model, demanding the proof, or checking a hardware report, and a proven fault loses the bond.</p>
<p><b>Assurance levels</b>: L0 signatures; L1 distinct families with commit-reveal; L1+ bonded and challengeable; L2 a proof or hardware report confirmed by verifiers; L3 verified on chain, reserved for later.</p>
<p className="spec">Defined in{" "}<a href="/simds#attestations">SIMD 2, Evaluators and Attestations</a>:{" "}<code>RegisterEvaluator</code>,{" "}<code>PublishModelCommitment</code>,{" "}<code>CommitAttestation</code>,{" "}<code>RevealAttestation</code>,{" "}<code>AttestProof</code>.</p>
</div>
<figure className="figure"><img src="/slides/offchain.jpg" alt="Slide: proofs are too big for the chain, make lying expensive instead." loading="lazy" style={{ "marginBottom": "0" }} /></figure>
<figure className="figure" hidden><img src="/slides/whyproof.jpg" alt="Slide: why proof of inference is the key. Solana stores the record; models think off chain; proofs show which model ran." loading="lazy" /></figure>
</div>
</section>
<section className="sec" id="rule">
<div className="step">
<div className="txt">
<p className="n">4. Rule</p>
<h2>A signed ruling, written like a court opinion</h2>
<p>When a quorum agrees, the ruling records the outcome and the assurance reached. One agreeing evaluator, the rapporteur, writes the opinion: a short summary on chain, the full reasoning by hash, and the sources relied on. Each source must hash to something the jury was actually given, so a ruling can’t cite a document that wasn’t in the record.</p>
<p>The other agreeing evaluators co-sign the opinion. Dissents are recorded. Certainty shows how many agreed, how many answered, and their confidence.</p>
<p className="spec">Defined in{" "}<a href="/simds#rulings">SIMD 3, Rulings, Disputes and Challenges</a>:{" "}<code>FinalizeRuling</code>,{" "}<code>PostOpinion</code>,{" "}<code>SignOff</code>,{" "}<code>PostDissent</code>.</p>
</div>
<figure className="figure"><img src="/slides/ruling.jpg" alt="Diagram: a signed ruling with decision, certainty, pinned hashes, summary, reasoning, sources, signatures, sign-off and dissents." loading="lazy" /></figure>
</div>
<figure className="figure" style={{ "marginTop": "28px" }}><img src="/slides/rulingacct.jpg" alt="Block diagram: what a ruling records on chain, field group by field group with bytes." loading="lazy" /><figcaption>The Ruling account, field by field. Long material stays off chain by hash.</figcaption></figure>
</section>
<section className="sec" id="act">
<div className="step">
<div className="txt">
<p className="n">5. Act</p>
<h2>The calling program checks the ruling itself</h2>
<p>Rulings take seconds to minutes, so every guarded action is two-phase. First the program requests a ruling with the exact action as its input. Later, it performs the action only if it can read a final ruling for that exact input, under the rules it trusts.</p>
<p>It checks the owner, the program and the pinned prompt and context hashes, the input hash, the quorum, the assurance level and the review status.{" "}<code>ReadRuling</code>{" "}returns the answer compactly. Hard limits stay in the program’s own code, whatever the ruling says.</p>
<p className="spec">Defined in{" "}<a href="/simds#rulings-reading-a-ruling-from-another-program">SIMD 3, Reading a ruling</a>.</p>
</div>
<pre><code>{`// tx 2: pay out only on a final "allow" for this exact withdrawal
let outcome = read_ruling(&ruling, &Expect {
    inference_program: cfg.inference_program,
    prompt_hash: cfg.trusted_prompt_hash,
    context_hash: cfg.trusted_context_hash,
    ext_context_hash: request.ext_context_hash,
    input: &action.to_bytes(),
    min_quorum: 4,
    min_assurance: Assurance::L1,
    min_confidence: 0,
    dispute_window_passed: true,
})?;
require!(outcome == ALLOW, WalletError::Held);
require!(amount <= cfg.max_single, WalletError::OverCap); // caps stay in code
transfer(ctx, amount)`}</code></pre>
</div>
</section>
<section className="sec" id="challenge">
<div className="step">
<div className="txt">
<p className="n">6. Challenge</p>
<h2>Any ruling can be challenged. None is erased.</h2>
<p>A{" "}<b>dispute</b>{" "}is quick: within a short window, a fresh ruling is re-judged on the same evidence by different model families. A{" "}<b>challenge</b>{" "}can come at any time, even years later, on new evidence, false evidence, misapplied rules or changed rules.</p>
<p>The challenge jury gets the original ruling and its reasoning, the original evidence and the new material, labeled as new, and must compare itself to the original source by source. The original stays on chain, marked affirmed, overturned or superseded, with a link to the ruling that reviewed it. A bond, a requirement to bring something new, and fresh model families each time stop a losing side from relitigating until it wins.</p>
<p className="spec">Defined in{" "}<a href="/simds#rulings-challenges-and-later-review">SIMD 3, Challenges and later review</a>:{" "}<code>OpenChallenge</code>,{" "}<code>ResolveChallenge</code>,{" "}<code>SetReviewPolicy</code>.</p>
</div>
<figure className="figure"><img src="/slides/challenge.jpg" alt="Slide: any ruling can be challenged, none is erased. A timeline from ruling to dispute to new evidence to an overturning challenge." loading="lazy" /></figure>
</div>
</section>
<section className="sec" id="predict">
<div className="step">
<div className="txt">
<p className="n">Predictions</p>
<h2>A forecast on record before the event. A ruling after it.</h2>
<p>A ruling can record a prediction as well as a judgment. Ask about a future event, list the outcomes, and each model’s vote carries its probability. Votes are committed before they are revealed and the ruling is finalized at a known slot, so it is a public, timestamped record of what independent models expected.</p>
<p>A prediction market uses two programs. A{" "}<b>forecast</b>{" "}request, before the market closes, with the evidence as external context. A{" "}<b>resolution</b>{" "}request after the event, from a separate resolver whose internal context names what counts and which sources decide. The market pays out only on a final resolution after its dispute window, and a resolution can still be challenged. Any program can read both and score the forecasts.</p>
<p>In one of our recorded runs, a forecast market resolved on the real FOMC statement, 6 of 6. The resolver never sees the forecast, so it can’t anchor on it, and a forecast is only the models’ estimate.</p>
<p className="spec">Informative section in{" "}<a href="/simds#rulings-predictions-and-prediction-markets-informative">SIMD 3, Predictions and prediction markets</a>.</p>
</div>
<figure className="figure"><img src="/slides/predict.jpg" alt="Slide: a forecast on record before the event, a ruling after it." loading="lazy" /></figure>
</div>
</section>
<section className="sec" id="fast">
<div className="step">
<div className="txt">
<p className="n">Fast lane</p>
<h2>System 1 screens. System 2 rules.</h2>
<p>A jury of language models takes 20 to 60 seconds in our recorded runs. Fast decision models such as TypeSafe’s Jev return a typed answer with a calibrated probability in 70 to 500 milliseconds, by the vendor’s figures. They can screen each rule in parallel, settle clear low-stakes cases or return the safe default, and decide how big the full jury should be.</p>
<p>They can’t write the opinion or cite sources, add no diversity of labs, and can’t carry a proof. So they are the fast lane, not the court.</p>
<p className="spec">Informative section in{" "}<a href="/simds#attestations-fast-evaluators-informative">SIMD 2</a>. Jev figures are vendor-reported and not independently reproduced.</p>
</div>
<figure className="figure"><img src="/slides/systemone.jpg" alt="Slide: System 1 screens, System 2 rules, with pluses and minuses of fast decision models." loading="lazy" /></figure>
</div>
</section>
<section className="sec" id="limits">
<div className="step">
<div className="txt">
<p className="n">Limits</p>
<h2>What the drafts don’t do</h2>
<ul className="b">
<li>They don’t change the validator. Everything can be built as a Solana program today, using the existing Ed25519 precompile.</li>
<li>They don’t verify proofs of inference on chain. Proofs are too large today.</li>
<li>They don’t make models infallible. In our tests a forged correction in the evidence fooled all ten models we tried, so calling programs keep hard limits in code.</li>
</ul>
<div className="btns"><a className="btn p" href="/simds">Read the SIMDs</a><a className="btn" href="/sandbox">Try the sandbox</a></div>
</div>
<figure className="figure"><img src="/slides/doesnt.jpg" alt="Slide: honest limits." loading="lazy" /></figure>
</div>
</section>
</main>
    </>
  );
}
