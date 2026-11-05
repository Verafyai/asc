import "@/styles/site.css";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";
import SandboxScript from "@/components/scripts/SandboxScript";

export const metadata: Metadata = { ...pageMeta("Sandbox", "/sandbox"), description: "Build an inference program, compose a call with external context, jury shaping and payment, watch a simulated jury rule, read the signed ruling, then challenge it." };

const CSS = `.sbx{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px;margin-top:28px}
@media (max-width:980px){.sbx{grid-template-columns:1fr}}
.pane{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:22px;min-width:0}
.pane h2{font-size:22px;margin:0 0 4px}
.pane .sub{color:var(--dim);font-size:14px;margin:0 0 16px}
label.f{display:block;font-size:13px;color:var(--muted);margin:14px 0 6px;font-weight:600;letter-spacing:.02em}
input[type=text],input[type=number],textarea,select{width:100%;background:var(--deep);border:1px solid var(--line);border-radius:9px;color:var(--text);font:inherit;font-size:15px;padding:9px 11px}
textarea{font-family:var(--mono);font-size:13px;line-height:1.55;min-height:110px;resize:vertical}
input:focus,textarea:focus,select:focus{outline:2px solid var(--fill);outline-offset:1px}
.chips{display:flex;gap:8px;flex-wrap:wrap}
.chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:5px 11px;font-size:14px;color:var(--muted);cursor:pointer;user-select:none;background:var(--deep)}
.chip input{accent-color:var(--teal);margin:0}
.chip.on{border-color:rgba(95,224,200,.5);color:var(--text)}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:9px;overflow:hidden}
.seg button{background:var(--deep);border:0;color:var(--muted);font:inherit;font-size:14px;padding:7px 13px;cursor:pointer;border-right:1px solid var(--line)}
.seg button:last-child{border-right:0}
.seg button.on{background:rgba(63,143,128,.35);color:var(--text)}
.entry{border:1px solid var(--line);border-radius:10px;padding:12px;margin-top:10px;background:var(--deep)}
.entry .hd{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.entry .hd select,.entry .hd input{width:auto;flex:1;min-width:110px}
.entry .x{background:none;border:1px solid var(--line);color:var(--muted);border-radius:8px;height:34px;width:34px;cursor:pointer}
.entry textarea{min-height:80px;margin-top:8px}
.entry .meta{font-family:var(--mono);font-size:12px;color:var(--dim);margin-top:6px;word-break:break-all}
.add{margin-top:10px;background:none;border:1px dashed #2A3440;color:var(--muted);border-radius:9px;padding:8px 12px;cursor:pointer;font:inherit;font-size:14px}
.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:14px}
.stat{background:var(--deep);border:1px solid var(--line);border-radius:10px;padding:10px}
.stat b{display:block;font-family:var(--mono);font-size:16px;color:var(--teal);font-weight:600}
.stat span{font-size:12px;color:var(--dim)}
@media (max-width:560px){.stats{grid-template-columns:1fr 1fr}}
.quote td,.quote th{padding:7px 8px;font-size:14px}
.quote td.r,.quote th.r{text-align:right;font-family:var(--mono)}
.err{color:var(--red);font-size:14px;margin-top:8px}
.runbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:20px}
.full{grid-column:1/-1}
.stages{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 16px}
.stg{font-family:var(--mono);font-size:12.5px;padding:5px 10px;border-radius:999px;border:1px solid var(--line);color:var(--dim)}
.stg.on{border-color:var(--teal);color:var(--teal)}
.stg.done{border-color:rgba(95,224,200,.35);color:var(--muted)}
.stg.bad{border-color:rgba(242,139,130,.6);color:var(--red)}
.evals{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.ev{border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--deep);transition:border-color .2s}
.ev .nm{font-weight:600;font-size:15px}.ev .lb{font-size:12px;color:var(--dim)}
.ev .st{font-family:var(--mono);font-size:12.5px;margin-top:8px;color:var(--muted);min-height:36px}
.ev.c{border-color:rgba(226,177,91,.45)}.ev.r{border-color:rgba(95,224,200,.5)}.ev.d{border-color:rgba(242,139,130,.5)}.ev.t{opacity:.5}
.log{font-family:var(--mono);font-size:12.5px;color:var(--muted);background:var(--deep);border:1px solid var(--line);border-radius:10px;padding:12px;max-height:220px;overflow:auto;margin-top:14px;white-space:pre-wrap}
.ruling{margin-top:20px;border:1px solid rgba(95,224,200,.45);border-radius:14px;overflow:hidden}
.ruling .top{padding:18px 20px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;border-bottom:1px solid var(--line)}
.ruling .oc{font-family:var(--mono);font-size:22px;font-weight:600}
.ruling .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:var(--line)}
.ruling .cell{background:var(--panel);padding:14px 16px;min-width:0}
.ruling .cell h4{margin:0 0 6px;font-size:13px;color:var(--teal);font-family:var(--mono);font-weight:600;letter-spacing:.04em}
.ruling .cell p,.ruling .cell li{font-size:14px;color:#C9D2DB;margin:0}
.ruling .cell ul{margin:0;padding-left:18px}
.ruling .hx{font-family:var(--mono);font-size:12px;color:var(--muted);word-break:break-all}
@media (max-width:760px){.ruling .grid{grid-template-columns:1fr}}
.tabs{display:flex;gap:6px;margin:16px 0 8px;flex-wrap:wrap}
.tabs button{background:none;border:1px solid var(--line);border-radius:8px;color:var(--muted);font:inherit;font-size:14px;padding:6px 12px;cursor:pointer}
.tabs button.on{border-color:var(--fill);color:var(--text)}
.hist{display:flex;flex-direction:column;gap:8px;margin-top:10px}
.hist .h{border:1px solid var(--line);border-radius:10px;padding:10px 12px;font-size:14px;background:var(--deep)}`;

export default function Page() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
<main className="w">
<section className="hero" style={{ "paddingBottom": "8px" }}>
<p className="eb">Sandbox · simulated jury · real hashes and signatures</p>
<h1>Build an inference program, call it, read the ruling</h1>
<p className="lede">The structure follows the three draft SIMDs. Hashes are real SHA-256 of what you type, and each vote is a real Ed25519 signature over the SIMD attestation message, from demo keys. The verdicts are scripted by the scenario you pick: no model is called and nothing goes on chain.</p>
</section>
<div className="sbx">

<section className="pane" aria-labelledby="h1p">
<h2 id="h1p">1. The inference program</h2>
<p className="sub">Instructions and internal context. Set once by the creator.{" "}<a href="/simds#programs-accounts">SIMD 1</a></p>
<label className="f" htmlFor="tpl">Start from</label>
<select id="tpl"></select>
<label className="f" htmlFor="instr">Instructions (the prompt)</label>
<textarea id="instr" rows={8}></textarea>
<label className="f">Outcomes, and the safe default</label>
<div className="chips" id="outcomes"></div>
<label className="f">Internal context{" "}<span className="dim">(the rules, applied to every call)</span></label>
<div id="ictx"></div>
<button className="add" id="addI">Add a context document</button>
<label className="f">Encoding</label>
<div className="chips" id="enc">
<label className="chip"><input type="checkbox" data-k="compress" defaultChecked />Compressed</label>
<label className="chip"><input type="checkbox" data-k="encrypt" />Encrypted to the evaluator set</label>
</div>
<label className="f">Mutability</label>
<div className="seg" id="mut"><button data-v="mutable">Mutable</button><button data-v="timelocked" className="on">Timelocked</button><button data-v="frozen">Frozen</button></div>
<div className="stats" id="pstats"></div>
<p className="kv" id="phash" style={{ "marginTop": "10px", "wordBreak": "break-all" }}></p>
</section>

<section className="pane" aria-labelledby="h2c">
<h2 id="h2c">2. The call</h2>
<p className="sub">What a calling program sends to{" "}<code>RequestRuling</code>.{" "}<a href="/simds#programs-rulingrequest">SIMD 1</a></p>
<label className="f" htmlFor="preset">Case</label>
<select id="preset"></select>
<label className="f" htmlFor="rprompt">Request prompt</label>
<input type="text" id="rprompt" maxLength={1024} />
<label className="f" htmlFor="input">Input: the exact action{" "}<span className="dim">(its hash is what the program checks later)</span></label>
<textarea id="input" rows={5}></textarea>
<label className="f">External context{" "}<span className="dim">(the case: links are snapshotted, text is inline)</span></label>
<div id="xctx"></div>
<button className="add" id="addX">Add external context</button>
<label className="f">Jury shaping</label>
<div className="row" style={{ "gap": "16px" }}>
<span>Evaluators{" "}<input type="number" id="n" min="1" max="9" defaultValue="5" style={{ "width": "68px" }} /></span>
<span>Quorum{" "}<input type="number" id="k" min="1" max="9" defaultValue="4" style={{ "width": "68px" }} /></span>
<div className="seg" id="asr"><button data-v="0">L0</button><button data-v="1" className="on">L1</button><button data-v="2">L2</button></div>
</div>
<div className="chips" id="fams" style={{ "marginTop": "10px" }}></div>
<div className="chips" style={{ "marginTop": "10px" }}>
<label className="chip"><input type="checkbox" id="distinct" defaultChecked />Distinct families</label>
<label className="chip"><input type="checkbox" id="screen" />System 1 screen first (Jev)</label>
<label className="chip"><input type="checkbox" id="hypo" />Hypothetical: every lab publishes provable commitments</label>
</div>
<label className="f">Payment</label>
<div id="quote"></div>
<div className="row" style={{ "marginTop": "10px" }}>
<span>Budget, lamports{" "}<input type="number" id="budget" min="0" step="1000" style={{ "width": "150px" }} /></span>
<label className="chip"><input type="checkbox" id="cbfinal" defaultChecked />Callback: final</label>
<label className="chip"><input type="checkbox" id="cbfunds" defaultChecked />Callback: needs funds</label>
</div>
</section>

<section className="pane full" aria-labelledby="h3r">
<h2 id="h3r">3. Run it</h2>
<p className="sub">Pick how the jury behaves, then run.{" "}<a href="/simds#attestations">SIMD 2</a>{" "}and{" "}<a href="/simds#rulings">SIMD 3</a></p>
<label className="f">Scenario</label>
<div className="chips" id="scen"></div>
<div className="runbar">
<button className="btn p" id="run">Run simulation</button>
<button className="btn" id="topup" hidden>Top up and resume</button>
<span className="dim" id="runnote">Free. Simulated jury.</span>
</div>
<div className="stages" id="stages"></div>
<div className="evals" id="evals"></div>
<div className="log" id="log" aria-live="polite">Nothing run yet.</div>
<div id="out"></div>
</section>
</div>
</main>
      <SandboxScript />
    </>
  );
}
