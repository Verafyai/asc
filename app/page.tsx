import "@/styles/site.css";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";
import DeckScript from "@/components/scripts/DeckScript";

export const metadata: Metadata = { ...pageMeta("Bringing Inference Programs To Solana \u00b7 Actually Smart Contracts", "/", true), description: "Three draft SIMDs to bring inference programs to Solana: prompts and context stored on chain, run by AI models off chain, with signed, provable rulings that programs act on." };

const CSS = `.pre p{font-size:19px;line-height:1.6;color:#C9D2DB;max-width:760px;margin:0 0 16px}
.pre p.k{color:var(--text)}
/* deck */
.deck{margin-top:40px}
.track{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;border:1px solid var(--line);border-radius:14px;background:var(--bg);scrollbar-width:none}
.track::-webkit-scrollbar{display:none}
.slide{flex:0 0 100%;scroll-snap-align:start;aspect-ratio:16/9;position:relative;margin:0}
.slide img{width:100%;height:100%;object-fit:contain}
.live{position:absolute;inset:0;container-type:inline-size;background:#0B0E12}
.live .e{position:absolute;left:6.67%;top:8.9%;font-family:var(--mono);font-size:1.25cqw;letter-spacing:.16em;color:#5FE0C8}
.live .t{position:absolute;left:6.67%;top:13%;width:86%;font-size:2.92cqw;font-weight:700;line-height:1.1;letter-spacing:-.02em;color:#E6EDF3;margin:0}
.live img{position:absolute;left:15.4%;top:23.1%;width:69.3%;height:71.9%;object-fit:contain}
.ctl{display:flex;align-items:center;gap:12px;margin-top:14px;flex-wrap:wrap}
.ctl button{height:40px;min-width:44px;border-radius:10px;border:1px solid #2A3440;background:none;color:var(--text);font:inherit;font-size:15px;cursor:pointer;padding:0 14px}
.ctl button:hover{border-color:var(--fill)}
.ctl .count{font-family:var(--mono);font-size:14px;color:var(--muted);min-width:64px}
.ctl .ttl{color:var(--muted);font-size:15px;flex:1;min-width:200px}
.dots{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}
.dots button{width:26px;height:6px;border-radius:3px;border:0;background:#26303B;cursor:pointer;padding:0}
.dots button.on{background:var(--teal)}
.notes{margin-top:14px;font-size:15.5px;color:var(--muted);max-width:860px;display:none}
.deck.shownotes .notes{display:block}
/* simds */
.simds{margin-top:44px}
.simds .card{display:flex;flex-direction:column;gap:8px}
.simds .card h3{font-size:21px}
.simds .card p{color:var(--muted);font-size:15.5px;margin:0}
.simds .card .go{margin-top:auto;padding-top:10px;font-weight:600}
.links{display:flex;gap:18px;flex-wrap:wrap;margin-top:22px;font-size:15px}`;

export default function Page() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
<main className="w">
<section className="hero pre" aria-labelledby="t">
<p className="eb">Proposal · three draft SIMDs</p>
<h1 id="t">Bringing Inference Programs To Solana</h1>
<p className="lede" style={{ "marginBottom": "28px" }}>aka Actually Smart Contracts: programs written in natural language, stored on chain, run by AI models off chain, and answered with a signed, provable ruling that any program can act on: a judgment, a policy check, or a prediction.</p>
<p>Blockchains have made real progress toward trustless, decentralized systems that run without anyone in charge. But they still lean on people for judgment: discussion, opinion, motives and alignment, all happening off chain. That reliance has been a steady source of inefficiency, and of risk.</p>
<p>A DAO can pass a constitution, but it has no full-time lawyers to enforce it. An insurer can write a policy that a smart contract is meant to pay out on, but deciding whether a claim qualifies still happens off chain, by people. An exchange may want to wrap its hot wallets in procedures that protect user funds, and find it can only enforce what code can express. Code is law, and code can’t say everything.</p>
<p>That’s why we think it’s time to talk seriously about how AI and blockchains can converge to add the missing piece: judgment, and policy checks built into the contract itself. A program should be able to get a second opinion, ask an expert panel, or go to a judiciary for a ruling before it moves funds.</p>
<p className="k">So we’ve written three draft Solana Improvement Documents that would make it a shared standard, so every program, wallet and explorer can use it the same way.</p>
<div className="deck" id="deck" aria-roledescription="carousel" aria-label="Slides: Bringing Inference Programs To Solana">
<div className="track" id="track" tabIndex={0}></div>
<div className="ctl">
<button id="prev" aria-label="Previous slide">←</button>
<button id="next" aria-label="Next slide">→</button>
<span className="count" id="count" aria-live="polite">1 / 19</span>
<span className="ttl" id="ttl"></span>
<button id="nb" aria-pressed="false">Show script</button>
</div>
<div className="dots" id="dots" role="tablist" aria-label="Choose a slide"></div>
<p className="notes" id="notes"></p>
</div>
<div className="simds g3" aria-label="The three SIMDs">
<a className="card hl" href="/simds#programs">{" "}<span className="row"><span className="n">SIMD 1</span><span className="tag draft">draft</span></span>{" "}<h3>Inference Programs</h3>{" "}<p>Natural-language programs on chain and their internal context, inline, from a web page or a git repo at a commit. How other programs call them: a request prompt, external context, jury shaping, and an escrowed payment.</p>{" "}<span className="go">Read SIMD 1</span>{" "}</a>
<a className="card hl" href="/simds#attestations">{" "}<span className="row"><span className="n">SIMD 2</span><span className="tag draft">draft</span></span>{" "}<h3>Inference Evaluators and Attestations</h3>{" "}<p>Who runs the models and what they commit to. The signed, commit-then-reveal vote each one casts, assurance levels from signatures to proofs of inference, and fast System 1 evaluators.</p>{" "}<span className="go">Read SIMD 2</span>{" "}</a>
<a className="card hl" href="/simds#rulings">{" "}<span className="row"><span className="n">SIMD 3</span><span className="tag draft">draft</span></span>{" "}<h3>Inference Rulings, Disputes and Challenges</h3>{" "}<p>The signed ruling programs act on: outcome, summary, reasoning, checked sources, certainty, signatures and sign-off. Forecasts and prediction-market resolutions. How rulings are disputed, challenged with new evidence, and overturned without being erased.</p>{" "}<span className="go">Read SIMD 3</span>{" "}</a>
</div>
<div className="links">
<a href="https://blog.verafy.ai/articles/20261105-simd-verifiable-inference">Read the full post on the Verafy blog</a>
<a href="https://github.com/solana-foundation/solana-improvement-documents/discussions/categories/ideas">Discuss in SIMD Ideas</a>
<a href="/sandbox">Try the sandbox</a>
</div>
</section>
</main>
      <DeckScript />
    </>
  );
}
