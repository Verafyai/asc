import "@/styles/site.css";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";
import { BLOG_POST_URL, SIMD_DISCUSSION_URL } from "@/lib/brand";
import { loadSimds } from "@/lib/simds";
import SimdsScript from "@/components/scripts/SimdsScript";

export const metadata: Metadata = {
  ...pageMeta("Read the SIMDs", "/simds"),
  description: "Three draft SIMDs to bring inference programs to Solana: Inference Programs; Inference Evaluators and Attestations; Inference Rulings, Disputes and Challenges.",
};

const CSS = `.lay{display:grid;grid-template-columns:290px minmax(0,1fr);gap:48px;max-width:1240px;margin:0 auto;padding:40px 32px 0}
.side{position:sticky;top:88px;align-self:start;max-height:calc(100vh - 110px);overflow:auto;font-size:14.5px;padding-right:6px}
.side .intro{color:var(--muted);font-size:14px;margin:0 0 16px}
.grp{border:1px solid var(--line);border-radius:12px;margin-bottom:10px;background:var(--panel)}
.grp .doc{display:flex;flex-direction:column;gap:2px;padding:12px 14px;color:var(--text);font-weight:600}
.grp .doc .n{font-family:var(--mono);font-size:12px;color:var(--teal);font-weight:600}
.grp .doc:hover{text-decoration:none}
.grp.on{border-color:rgba(95,224,200,.5)}
.toc{list-style:none;margin:0;padding:0 14px 12px;display:none}
.grp.on .toc{display:block}
.toc li{margin:4px 0}.toc .l3{padding-left:12px}
.toc a{color:var(--muted)}.toc a.on{color:var(--teal)}
.simd{display:none;max-width:780px}
.simd.on{display:block}
.simd h1{font-size:40px;margin:10px 0 18px}
.simd h2{font-size:26px;margin:40px 0 12px;padding-top:8px;border-top:1px solid var(--line2)}
.simd h3{font-size:20px;margin:28px 0 8px}
.simd h4{font-size:17px;margin:22px 0 6px;font-family:var(--mono);color:var(--teal);font-weight:600}
.simd p,.simd li{color:#C9D2DB;font-size:16.5px;line-height:1.65}
.simd ul,.simd ol{padding-left:22px}
.simd pre{margin:14px 0}
.simd .fm{font-size:13px;color:var(--muted)}
.simd blockquote{margin:12px 0;padding:4px 16px;border-left:3px solid var(--fill);color:var(--muted)}
.note{border:1px solid rgba(226,177,91,.4);background:rgba(226,177,91,.06);border-radius:12px;padding:14px 16px;margin:0 0 22px;font-size:15.5px;color:var(--text)}
@media (max-width:900px){.lay{grid-template-columns:minmax(0,1fr);gap:20px;padding:24px 16px 0}.side{position:static;max-height:none}.toc{display:none!important}.simd h1{font-size:30px}}`;

export default function Page() {
  const simds = loadSimds();
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="lay">
        <aside className="side" aria-label="The three SIMDs">
          <p className="eb">Read the SIMDs</p>
          <p className="intro">Three companion drafts. Each can be reviewed on its own; together they bring inference programs to Solana natively.</p>
          {simds.map((s) => (
            <div key={s.key} className={s.key === "programs" ? "grp on" : "grp"} data-doc={s.key}>
              <a className="doc" href={`#${s.key}`}><span className="n">SIMD {s.n} · draft</span><span>{s.title}</span></a>
              <ol className="toc">
                {s.toc.map((t) => <li key={t.id} className={`l${t.depth}`}><a href={`#${t.id}`}>{t.text}</a></li>)}
              </ol>
            </div>
          ))}
        </aside>
        <main>
          <p className="note">These SIMDs are part of a broader proposal to bring Inference Programs to Solana natively: <a href={BLOG_POST_URL}>Bringing Inference Programs To Solana</a>. All three are drafts, open for discussion in <a href={SIMD_DISCUSSION_URL}>SIMD discussion #724</a>, and are not yet submitted as pull requests.</p>
          {simds.map((s) => (
            <article key={s.key} className={s.key === "programs" ? "simd on" : "simd"} id={s.key} data-doc={s.key}>
              <p className="row"><span className="eb">SIMD {s.n}</span><span className="tag draft">draft</span><a className="kv" href={`/simds/${s.file}`} download>Download Markdown</a></p>
              <h1>{s.title}</h1>
              <pre className="fm" dangerouslySetInnerHTML={{ __html: s.frontMatter }} />
              <div dangerouslySetInnerHTML={{ __html: s.html }} />
            </article>
          ))}
        </main>
      </div>
      <SimdsScript />
    </>
  );
}
