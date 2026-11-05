import "@/styles/site.css";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";
import CertificationsScript from "@/components/scripts/CertificationsScript";

export const metadata: Metadata = { ...pageMeta("Certifications", "/certifications"), description: "A certification is a ruling: a jury reviews one commit of a repository against a published standard, rule by rule, and the signed result is recorded on Solana. It can be challenged and revoked." };

const CSS = `.form label{display:block;font-size:13px;color:var(--muted);margin:14px 0 6px;font-weight:600}
.form input,.form select{width:100%;background:var(--deep);border:1px solid var(--line);border-radius:9px;color:var(--text);font:inherit;padding:9px 11px}
.map td:first-child{white-space:nowrap;color:var(--muted)}
.badge{font-size:12px;line-height:1.35;padding:12px;color:var(--teal)}`;

export default function Page() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
<main className="w">
<section className="hero">
<p className="eb">Certifications · a repository commit against a standard</p>
<h1>A certification is a ruling</h1>
<p className="lede">Pick a standard and a commit. A jury of models from different labs reviews the code rule by rule, cites the files behind each verdict, and signs. The result is an ordinary ruling under the SIMDs: recorded on Solana, readable by any program, and open to challenge.</p>
</section>
<section className="sec">
<div className="g2">
<div className="card form">
<h2>Request a certification</h2>
<label htmlFor="repo">GitHub repository</label><input id="repo" defaultValue="github.com/demo-tv/firmware" />
<label htmlFor="commit">Commit</label><input id="commit" defaultValue="9f3c2a1" />
<label htmlFor="std">Standard</label>
<select id="std"><option>EDO v1.0</option><option>EAO v1.0</option><option>ETC v1.0</option><option>EVC v1.0</option><option>EMO v1.0</option></select>
<div className="btns"><button className="btn p" id="go">Show the request</button></div>
<p className="dim" style={{ "fontSize": "14px", "marginTop": "12px" }}>Public repositories by URL; private ones through a read-only GitHub App. You see the quote before anything runs. Real certifications are not live in this build.{" "}<span className="tag draft">design</span></p>
</div>
<div className="card">
<h2>What the request contains</h2>
<div className="tbl"><table className="map"><tbody id="map"></tbody></table></div>
</div>
</div>
</section>
<section className="sec">
<h2>Example result{" "}<span className="tag ill">example data, demo repo</span></h2>
<p className="mut">demo-tv/firmware @ 9f3c2a1 against EDO v1.0. Outcome{" "}<b style={{ "color": "var(--teal)" }}>pass</b>, score 100, L1, 5 of 5 agreed.</p>
<div className="tbl"><table><thead><tr><th>Rule</th><th>Verdict</th><th>Source cited</th><th>Agreed</th></tr></thead><tbody><tr><td>EDO-01</td><td>pass</td><td className="kv">app/voice/VoiceSearch.kt:40-44</td><td>5/5</td></tr><tr><td>EDO-02</td><td>pass</td><td className="kv">app/acr/AcrSettings.kt:12</td><td>5/5</td></tr><tr><td>EDO-03</td><td>pass</td><td className="kv">app/analytics/Boot.kt:80-95</td><td>4/5</td></tr><tr><td>EDO-04</td><td>pass</td><td className="kv">app/setup/OfflineSetup.kt:1-60</td><td>5/5</td></tr><tr><td>EDO-05</td><td>pass</td><td className="kv">app/config/RemoteFlags.kt:22-31</td><td>5/5</td></tr></tbody></table></div>
<div className="g2" style={{ "marginTop": "24px" }}>
<div>
<h3>What is recorded</h3>
<ul className="b mut">
<li><b>Pinned hashes</b>: the certify program’s prompt, the standard at its commit (internal context), and the repository at the reviewed commit (external context): sha256 of every file at that commit, in sorted path order.</li>
<li><b>The opinion</b>: a summary, the full per-rule report by hash, and up to 16 sources, each checked to hash to something the jury was given.</li>
<li><b>Certainty and signatures</b>: how many agreed, every evaluator’s wallet signature, and the co-signed sign-off.</li>
<li><b>The badge</b>: rendered from the ruling, never stored separately.</li>
</ul>
<p className="kv" style={{ "marginTop": "10px" }}>Check the tree yourself: git ls-tree -r 9f3c2a1 | awk '{"{"}print $4"\t"$3{"}"}' | LC_ALL=C sort | sha256sum</p>
</div>
<div>
<pre className="badge" aria-label="Example badge">{`+------------------------------------------+
|  .----------------------.   ASC  EDO     |
|  |  [ ]  ETHICAL   [o]  |   v1.0         |
|  |   DEVICE OPERATIONS  |                |
|  '----------.-----------'   PASS  5/5    |
|           _|_|_                          |
|  demo-tv/firmware@9f3c2a1                |
|  ruling 4b1e07c2a9d3   2026-11-04        |
+------------------------------------------+`}</pre>
<h3 style={{ "marginTop": "18px" }}>Certificates can be challenged</h3>
<p className="mut">Anyone can challenge a certificate later with new evidence, for example a bug report showing the device records without its indicator. A new jury compares itself to the original rule by rule. If it is overturned, the certificate stays on chain marked overturned and every badge rendered from it shows as revoked.{" "}<a href="/simds#rulings-challenges-and-later-review">SIMD 3</a></p>
</div>
</div>
<p className="dim" style={{ "fontSize": "14px", "marginTop": "18px" }}>A certificate is a code review of one commit against a published standard, not a legal, regulatory or safety certification. The citations above are example data, not files fetched from a real commit.</p>
</section>
</main>
      <CertificationsScript />
    </>
  );
}
