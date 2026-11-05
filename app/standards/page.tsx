import "@/styles/site.css";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = { ...pageMeta("Standards", "/standards"), description: "Plain-language standards that code can be certified against, held as internal context by inference programs and pinned from the asc-standards repository at a commit." };

const CSS = `.badge{font-size:12px;line-height:1.35;padding:12px;color:var(--teal);background:var(--deep)}`;

export default function Page() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
<main className="w">
<section className="hero">
<p className="eb">Standards · first versions, all drafts</p>
<h1>Standards are context an inference program can hold</h1>
<p className="lede">Each standard lists what a kind of software must never do. Under the SIMDs, a standard is a context entry of kind{" "}<code>standard</code>, pulled from the asc-standards repository pinned at a commit. Any inference program can hold one or several, and a certification is a ruling against them.</p>
</section>
<section className="sec">
<div className="g3"><div className="card"><pre className="badge" aria-label="Example ASCII badge for Ethical Device Operations">{`+------------------------------------------+
|  .----------------------.   ASC  EDO     |
|  |  [ ]  ETHICAL   [o]  |   v1.0         |
|  |   DEVICE OPERATIONS  |                |
|  '----------.-----------'   PASS  5/5    |
|           _|_|_                          |
|  your-org/repo@a1b2c3d                   |
|  sha256:4b1e07c2a9d3   2026-11-04        |
+------------------------------------------+`}</pre>
<p className="row" style={{ "marginTop": "14px" }}><span className="n" style={{ "margin": "0" }}>EDO v1.0</span><span className="tag draft">draft</span><span className="dim" style={{ "fontSize": "14px" }}>5 rules</span></p>
<h3>Ethical Device Operations</h3><p className="mut">A consumer device shall never do these 5 things.</p>
<p className="kv">context entry: kind standard · label "EDO v1.0" · git asc-standards@&lt;commit&gt;</p>
<p className="row" style={{ "marginTop": "8px" }}><a href="/certifications?std=EDO">Certify a repo against EDO</a></p></div><div className="card"><pre className="badge" aria-label="Example ASCII badge for Ethical Agent Operations">{`+------------------------------------------+
|     .-----.         ASC  EAO   v1.0      |
|    | o   o |        ETHICAL AGENT        |
|    |  ---  |        OPERATIONS           |
|     '--+--'                              |
|      /|=|\\          PASS  10/10          |
|  your-org/repo@a1b2c3d                   |
|  sha256:4b1e07c2a9d3   2026-11-04        |
+------------------------------------------+`}</pre>
<p className="row" style={{ "marginTop": "14px" }}><span className="n" style={{ "margin": "0" }}>EAO v1.0</span><span className="tag draft">draft</span><span className="dim" style={{ "fontSize": "14px" }}>10 rules</span></p>
<h3>Ethical Agent Operations</h3><p className="mut">An AI agent shall never do these 10 things.</p>
<p className="kv">context entry: kind standard · label "EAO v1.0" · git asc-standards@&lt;commit&gt;</p>
<p className="row" style={{ "marginTop": "8px" }}><a href="/certifications?std=EAO">Certify a repo against EAO</a></p></div><div className="card"><pre className="badge" aria-label="Example ASCII badge for Ethical Treasury Conduct">{`+------------------------------------------+
|   ___________       ASC  ETC   v1.0      |
|  |  _______  |      ETHICAL TREASURY     |
|  | | (@)   | |      CONDUCT              |
|  | |_______| |                           |
|  |___________|      PASS  12/12          |
|  your-org/repo@a1b2c3d                   |
|  sha256:4b1e07c2a9d3   2026-11-04        |
+------------------------------------------+`}</pre>
<p className="row" style={{ "marginTop": "14px" }}><span className="n" style={{ "margin": "0" }}>ETC v1.0</span><span className="tag draft">draft</span><span className="dim" style={{ "fontSize": "14px" }}>12 rules</span></p>
<h3>Ethical Treasury Conduct</h3><p className="mut">A treasury shall never do these 12 things.</p>
<p className="kv">context entry: kind standard · label "ETC v1.0" · git asc-standards@&lt;commit&gt;</p>
<p className="row" style={{ "marginTop": "8px" }}><a href="/certifications?std=ETC">Certify a repo against ETC</a></p></div><div className="card"><pre className="badge" aria-label="Example ASCII badge for Ethical Vesting Contracts">{`+------------------------------------------+
|   [====|====|====|----]   ASC  EVC v1.0  |
|   cliff  25%  50%   ...   ETHICAL        |
|     \\__ on schedule __/   VESTING        |
|                           CONTRACTS      |
|                           PASS  8/8      |
|  your-org/repo@a1b2c3d                   |
|  sha256:4b1e07c2a9d3   2026-11-04        |
+------------------------------------------+`}</pre>
<p className="row" style={{ "marginTop": "14px" }}><span className="n" style={{ "margin": "0" }}>EVC v1.0</span><span className="tag draft">draft</span><span className="dim" style={{ "fontSize": "14px" }}>8 rules</span></p>
<h3>Ethical Vesting Contracts</h3><p className="mut">A vesting contract shall never do these 8 things.</p>
<p className="kv">context entry: kind standard · label "EVC v1.0" · git asc-standards@&lt;commit&gt;</p>
<p className="row" style={{ "marginTop": "8px" }}><a href="/certifications?std=EVC">Certify a repo against EVC</a></p></div><div className="card"><pre className="badge" aria-label="Example ASCII badge for Ethical Model Operations">{`+------------------------------------------+
|    o---o---o        ASC  EMO   v1.0      |
|     \\ / \\ /         ETHICAL MODEL        |
|      o---o          OPERATIONS           |
|     / \\ / \\                              |
|    o---o---o        PASS  10/10          |
|  your-org/repo@a1b2c3d                   |
|  sha256:4b1e07c2a9d3   2026-11-04        |
+------------------------------------------+`}</pre>
<p className="row" style={{ "marginTop": "14px" }}><span className="n" style={{ "margin": "0" }}>EMO v1.0</span><span className="tag draft">draft</span><span className="dim" style={{ "fontSize": "14px" }}>10 rules</span></p>
<h3>Ethical Model Operations</h3><p className="mut">A model deployment shall never do these 10 things.</p>
<p className="kv">context entry: kind standard · label "EMO v1.0" · git asc-standards@&lt;commit&gt;</p>
<p className="row" style={{ "marginTop": "8px" }}><a href="/certifications?std=EMO">Certify a repo against EMO</a></p></div>
<div className="card"><p className="n">ASC-0</p><h3>Standards process</h3><p className="mut">How standards are named (E + subject + Operations, Conduct or Contracts), versioned (MAJOR.MINOR), reviewed and pinned. A new version is a new commit; programs that hold the old one keep it until their creator updates the context, subject to its mutability mode.</p></div>
</div>
<p className="dim" style={{ "fontSize": "14px", "marginTop": "18px" }}>Source of truth: Markdown files in the asc-standards repository. It is not published yet; these pages render the drafts. Badges are examples.</p>
</section>
<section className="sec">
<div className="g2">
<div><h2>How a standard is used</h2>
<ul className="b mut">
<li><b>As internal context.</b>{" "}The certify program’s context set holds, for example, EAO v1.0 and ETC v1.0 as two entries, in order, each pinned by hash.</li>
<li><b>Cited by rule.</b>{" "}A ruling’s sources must hash to a pinned entry, so each verdict cites the standard and the rule behind it.</li>
<li><b>Versioned in public.</b>{" "}Moving to a newer commit changes the context hash, so every certificate names the exact version it applied.</li>
</ul>
<p className="spec dim" style={{ "fontSize": "14px" }}>See{" "}<a href="/simds#programs-contextset">SIMD 1, ContextSet</a>{" "}and{" "}<a href="/simds#programs-content">Content, git repositories</a>.</p>
</div>
<figure className="figure" style={{ "margin": "0" }}><img src="/slides/small.jpg" alt="Slide: five standards, about 3,400 words, compress to about 5 kilobytes." loading="lazy" /></figure>
</div>
</section>
</main>
    </>
  );
}
