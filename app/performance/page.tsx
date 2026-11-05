import "@/styles/site.css";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";
import CalculatorScript from "@/components/scripts/CalculatorScript";

export const metadata: Metadata = { ...pageMeta("Performance and cost", "/performance"), description: "What a ruling costs and how long it takes: a jury of language models, with Jev as a System 1 screen, with proofs of inference, and the Solana rent behind each account." };

const CSS = `.big b{display:block;font-family:var(--mono);font-size:28px;color:var(--teal);font-weight:600;margin-bottom:4px}
.big span{font-size:14px;color:var(--muted)}
td.r,th.r{text-align:right;font-family:var(--mono);white-space:nowrap}
.calc{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px}
@media (max-width:860px){.calc{grid-template-columns:1fr}}
.calc label{display:flex;justify-content:space-between;gap:12px;align-items:center;font-size:15px;padding:8px 0;border-bottom:1px solid var(--line2)}
.calc input[type=number],.calc select{width:140px;background:var(--deep);border:1px solid var(--line);border-radius:8px;color:var(--text);font:inherit;padding:6px 9px}
.calc input[type=checkbox]{accent-color:var(--teal);width:18px;height:18px}
.res div{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line2);font-size:15px}
.res b{font-family:var(--mono);color:var(--teal)}`;

export default function Page() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
<main className="w">
<section className="hero">
<p className="eb">Performance and cost</p>
<h1>What a ruling costs, and how fast it is, with and without Jev</h1>
<p className="lede">Every figure is measured in Verafy’s recorded runs, modeled from published prices, or reported by a vendor, and labeled. Amounts in SOL use $85 per SOL.</p>
</section>
<section className="sec" style={{ "paddingTop": "8px", "borderTop": "0" }}>
<div className="g4">
<div className="card big"><b>$0.0059</b><span>one ruling, jury of 5{" "}<span className="tag ill">modeled</span><br />measured $0.0020 to $0.010</span></div>
<div className="card big"><b>20 to 60 s</b><span>time to a ruling{" "}<span className="tag real">measured</span></span></div>
<div className="card big"><b>$0.0004</b><span>a Jev screen, per decision{" "}<span className="tag ill">vendor-reported</span></span></div>
<div className="card big"><b>70 to 500 ms</b><span>Jev latency{" "}<span className="tag ill">vendor-reported</span></span></div>
</div>
</section>
<section className="sec">
<h2>One ruling, step by step</h2>
<div className="tbl"><table><thead><tr><th>Step</th><th>Assumption</th><th className="r">Cost</th><th className="r">Time</th><th>Label</th></tr></thead><tbody><tr><td>Store the program and its context</td><td>Five standards, 22,712 B of text, zstd to 5,246 B</td><td className="r">0.0377 SOL rent</td><td className="r">once</td><td><span className="tag real">measured size</span>{" "}rent refundable</td></tr><tr><td>QuoteRuling</td><td>Simulated, returns an estimate</td><td className="r">free</td><td className="r">under 1 s</td><td><span className="tag">design</span></td></tr><tr><td>RequestRuling account</td><td>2,816 B</td><td className="r">0.0205 SOL rent</td><td className="r">1 tx</td><td>refunded at CloseRequest</td></tr><tr><td><b>With Jev:</b>{" "}System 1 screen</td><td>One typed answer per rule, one evaluator</td><td className="r">~$0.0004</td><td className="r">70 to 500 ms</td><td><span className="tag ill">vendor-reported</span></td></tr><tr><td>Jury of 5, language models</td><td>1,500 tokens in, 300 out each; budget models</td><td className="r">$0.0059</td><td className="r">20 to 60 s</td><td><span className="tag ill">modeled</span>{" "}<span className="tag real">time measured</span></td></tr><tr><td>Ruling account</td><td>Fixed layout 6,293 B; sized to use 1,952 B</td><td className="r">0.0447 / 0.0145 SOL</td><td className="r">1 tx</td><td>rent, kept while the ruling exists</td></tr><tr><td>Proofs of inference (L2)</td><td>5 proofs, 1,024-token contexts, plus verification</td><td className="r">+$0.050 to $0.104</td><td className="r">minutes</td><td><span className="tag draft">design only</span></td></tr></tbody></table></div>
<p className="mut" style={{ "marginTop": "14px", "maxWidth": "820px" }}>The surprise: at today’s prices the model calls are the cheap part. Account rent dominates, and most of it comes back. The fixed Ruling layout reserves room for 16 votes, 16 sign-offs and 8 dissents; sizing it to what a ruling uses cuts its rent by about two thirds.</p>
</section>
<section className="sec">
<h2>With Jev: the fast lane</h2>
<div className="g2">
<div>
<p className="mut">A System 1 model such as TypeSafe’s Jev returns a typed answer with a calibrated probability, not text. Used as a screen, it checks each rule in parallel and either settles a clear, low-stakes case (or returns the safe default) or escalates to the full jury.</p>
<p className="mut">The saving depends on one number only you know: the share of requests that still need the jury. With Jev, a ruling costs about{" "}<code>$0.0004 + share × $0.0059</code>, and the cases the screen settles take well under a second instead of 20 to 60.</p>
<p className="dim" style={{ "fontSize": "14px" }}>Jev: $0.042 per million input tokens, output free, 70 to 500 ms; 67.8% on TypeSafe’s own four-workflow benchmark against 73.1% for Claude Opus 5 and 74.1% for GPT-5.6 Sol. Early access since September 15, 2026. Not independently reproduced. Sources:{" "}<a href="https://thenewstack.io/typesafe-jev-system-one/">The New Stack</a>,{" "}<a href="https://www.datacamp.com/blog/system-one-models-jev">DataCamp</a>,{" "}<a href="https://www.digitalocean.com/resources/articles/what-is-jev">DigitalOcean</a>.</p>
</div>
<figure className="figure" style={{ "margin": "0" }}><img src="/slides/systemone.jpg" alt="Slide: System 1 screens, System 2 rules, with pluses and minuses of fast decision models." loading="lazy" /></figure>
</div>
<div className="tbl" style={{ "marginTop": "20px" }}><table><thead><tr><th>Setup</th><th className="r">Per ruling</th><th className="r">Time, settled by screen</th><th className="r">Time, escalated</th><th>What you give up</th></tr></thead><tbody><tr><td>Jury of 5 only</td><td className="r">$0.0059</td><td className="r">n/a</td><td className="r">20 to 60 s</td><td>Nothing: opinion, sources, signatures, L1</td></tr><tr><td>Jev screen, then jury</td><td className="r">$0.0004 + share × $0.0059</td><td className="r">70 to 500 ms</td><td className="r">20 to 60 s more</td><td>Screened cases get no opinion or sources; one closed model decides them</td></tr><tr><td>Jev only</td><td className="r">$0.0004</td><td className="r">70 to 500 ms</td><td className="r">n/a</td><td>Not a ruling: no reasoning, no diversity, no proof. Routing only</td></tr></tbody></table></div>
</section>
<section className="sec">
<h2>Proving which model answered</h2>
<p className="mut" style={{ "maxWidth": "820px" }}>Signatures prove which wallet voted, not which model ran. Anthropic’s FlashProve prototype proves that committed weights produced an answer, without revealing them. Today it covers one open model, Llama 4 Maverick, on contexts up to 1,024 tokens: about 72 times the GPU work of serving the model, proofs of about 18.78 MB, and about 17 s to verify on 24 CPU threads. A proven jury today is copies of one model, which costs the diversity of labs that makes a jury neutral, and Jev cannot be proven at all.{" "}<span className="tag draft">design only</span>{" "}<a href="https://www.anthropic.com/research/provable-inference">Anthropic research post</a>.</p>
</section>
<section className="sec">
<h2>Try your own numbers</h2>
<div className="calc">
<div className="card">
<label>Evaluators{" "}<input type="number" id="c_n" defaultValue="5" min="1" max="16" /></label>
<label>Model tier{" "}<select id="c_tier"><option value="budget">Budget (the five budget models)</option><option value="flag">Flagship (claude-opus-5.5 every seat)</option><option value="mav">Maverick (provable model)</option></select></label>
<label>Tokens in per evaluator{" "}<input type="number" id="c_in" defaultValue="1500" min="100" step="100" /></label>
<label>Tokens out per evaluator{" "}<input type="number" id="c_out" defaultValue="300" min="50" step="50" /></label>
<label>Proofs of inference (L2){" "}<input type="checkbox" id="c_prove" /></label>
<label>Jev screen first{" "}<input type="checkbox" id="c_jev" defaultChecked /></label>
<label>Share escalated to the jury, %{" "}<input type="number" id="c_esc" defaultValue="30" min="0" max="100" /></label>
<label>Ruling account{" "}<select id="c_acct"><option value="fixed">Fixed layout, 6,293 B</option><option value="sized">Sized to use, 1,952 B</option></select></label>
<label>Rulings per month{" "}<input type="number" id="c_m" defaultValue="10000" min="1" step="1000" /></label>
</div>
<div className="card res" id="c_res"></div>
</div>
<p className="dim" style={{ "fontSize": "14px", "marginTop": "12px" }}>The escalation share and monthly volume are your inputs, not measurements. Model prices: OpenRouter catalog snapshot, 2026-10-11. Inputs are in{" "}<a href="/performance-model.json">performance-model.json</a>. As of 2026-11-05.</p>
</section>
</main>
      <CalculatorScript />
    </>
  );
}
