import "@/styles/site.css";
import "@/styles/templates.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMeta } from "@/lib/page-meta";
import CopyPrompt from "@/components/CopyPrompt";
import { TEMPLATES, PROMPTS, templateBySlug, vipUrl, codeUrl, HARNESS_REPO, HARNESS_RELEASE } from "@/lib/templates";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = templateBySlug((await params).slug);
  if (!t) return {};
  return { ...pageMeta(`${t.name} template`, `/templates/${t.slug}`), description: t.card };
}

const statusTag = (s: string) => (/^Tested|^Built/.test(s) ? "tag real" : /Open risk/.test(s) ? "tag draft" : "tag ill");

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const t = templateBySlug((await params).slug);
  if (!t) notFound();
  const prompt = PROMPTS[t.slug];
  const others = TEMPLATES.filter((x) => x.slug !== t.slug);
  return (
    <main className="w">
      <section className="hero">
        <p className="eb"><a href="/templates">Templates</a> / {t.group}</p>
        <h1>{t.headline}</h1>
        <p className="lede">{t.lede}</p>
        <div className="vipline">
          <span className="tag real">Shipped {HARNESS_RELEASE}</span>
          <a href={vipUrl(t.vip.file)}>VIP-{t.vip.n}: {t.vip.title}</a>
          <span className="dim">Requirement {t.requirement}</span>
        </div>
        <div className="btns">
          <a className="btn p" href="#prompt">Get the prompt</a>
          <a className="btn" href={vipUrl(t.vip.file)}>Read VIP-{t.vip.n}</a>
          <a className="btn" href={codeUrl(t.run.files[0][0])}>See the code</a>
        </div>
        <nav className="toc" aria-label="On this page">
          <a href="#why">Why</a><a href="#flow">How it works</a><a href="#format">Format</a><a href="#rules">Code and jury</a>{t.escrow && <a href="#escrow">Escrow</a>}{t.settle && <a href="#settle">{t.settle.title}</a>}<a href="#threats">Attacks</a><a href="#example">Example</a><a href="#prompt">Prompt</a><a href="#run">Run it</a><a href="#status">Status</a>
        </nav>
      </section>

      {t.media && (
        <figure className="figure"><img src={t.media.src} alt={t.media.alt} loading="lazy" /><figcaption>{t.media.caption}</figcaption></figure>
      )}

      <section className="sec" id="why">
        <h2>Why it exists</h2>
        <div style={{ maxWidth: "760px" }}>{t.why.map((p, i) => <p key={i} className={i ? "mut" : undefined}>{p}</p>)}</div>
        <div className="g3" style={{ marginTop: "20px" }}>
          {t.forWho.map(([who, gets]) => <div key={who} className="card"><h3>{who}</h3><p className="mut">{gets}</p></div>)}
        </div>
      </section>

      <section className="sec" id="flow">
        <h2>How it works</h2>
        <div className="steps">
          {t.flow.map((s) => <div key={s.t} className="step"><div><h3>{s.t}</h3><p className="mut">{s.d}</p></div></div>)}
        </div>
      </section>

      <section className="sec" id="format">
        <h2>What you fill in</h2>
        <p className="mut">The fields of <code>{t.templateId}</code>. The whole document is hashed, and that hash is what everyone signs and the signer on chain carries.</p>
        <div className="tbl"><table><thead><tr><th>Field</th><th>What it holds</th></tr></thead><tbody>
          {t.format.map(([f, d]) => <tr key={f}><td><code>{f}</code></td><td>{d}</td></tr>)}
        </tbody></table></div>
      </section>

      <section className="sec" id="rules">
        <h2>What code checks, and what the jury decides</h2>
        <div className="split">
          <div className="card"><h3>Code: the same answer on every computer</h3><ul className="b">{t.code.map((c) => <li key={c}>{c}</li>)}</ul></div>
          <div className="card hl"><h3>Jury: the questions only judgment can answer</h3><ul className="b">{t.jury.map((c) => <li key={c}>{c}</li>)}</ul><p className="mut" style={{ marginTop: "12px" }}>A rule violation is final: the signer refuses it whatever the jury says.</p></div>
        </div>
      </section>

      {t.escrow && (
        <section className="sec" id="escrow">
          <h2>{t.escrow.title}</h2>
          <div className="tbl"><table><thead><tr><th>Who signs</th><th>What they can do</th></tr></thead><tbody>
            {t.escrow.rows.map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}
          </tbody></table></div>
          <p className="mut" style={{ marginTop: "14px" }}>{t.escrow.note}</p>
        </section>
      )}

      {t.settle && (
        <section className="sec" id="settle">
          <h2>{t.settle.title}</h2>
          <div className="tbl"><table><thead><tr>{t.settle.head.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>
            {t.settle.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}
          </tbody></table></div>
          {t.settle.note && <p className="mut" style={{ marginTop: "14px" }}>{t.settle.note}</p>}
        </section>
      )}

      <section className="sec" id="threats">
        <h2>Attacks, and what stops them</h2>
        <div className="tbl"><table><thead><tr><th>Attack</th><th>Defense</th><th>Status</th></tr></thead><tbody>
          {t.threats.map(([a, d, s]) => <tr key={a}><td>{a}</td><td>{d}</td><td><span className={statusTag(s)}>{s}</span></td></tr>)}
        </tbody></table></div>
        <p className="mut" style={{ marginTop: "14px" }}>Every case the signer builds labels the parties' own text as untrusted and never follows instructions in it. See <a href="/security">Security</a> for the threat model behind all templates.</p>
      </section>

      <section className="sec" id="example">
        <h2>Example: {t.example.title}</h2>
        <pre>{t.example.code}</pre>
      </section>

      <section className="sec" id="prompt">
        <h2>The prompt</h2>
        <p className="mut" style={{ maxWidth: "760px" }}>Paste this into any capable AI. It asks you about your case one group at a time, writes the {t.name.toLowerCase()} for it, explains who gets what in each outcome, points out risks in your terms, and ends with the harness call that checks the result. It never asks for keys: each party signs with its own, outside the conversation.</p>
        {prompt && <CopyPrompt text={prompt} file={`templates/prompts/${t.slug}.md`} />}
      </section>

      <section className="sec" id="run">
        <h2>Run it</h2>
        <div className="split">
          <div><p className="kv">In code</p><pre>{t.run.call}</pre></div>
          {t.run.demo && <div><p className="kv">The demo</p><pre>{`git clone ${HARNESS_REPO}\ncd verafyHarness\n${t.run.demo}`}</pre></div>}
        </div>
        <div className="tbl" style={{ marginTop: "18px" }}><table><thead><tr><th>File</th><th>What it is</th></tr></thead><tbody>
          {t.run.files.map(([f, d]) => <tr key={f}><td><a href={codeUrl(f)}><code>{f}</code></a></td><td>{d}</td></tr>)}
        </tbody></table></div>
      </section>

      <section className="sec" id="status">
        <h2>Status, honestly</h2>
        <div className="split">
          <div className="ok"><b>Measured</b><ul className="b">{t.measured.map((m) => <li key={m}>{m}</li>)}</ul></div>
          <div className="warn"><b>Not done yet</b><ul className="b">{t.open.map((m) => <li key={m}>{m}</li>)}</ul></div>
        </div>
        <div className="tbl" style={{ marginTop: "18px" }}><table><thead><tr><th>Proposal</th><th>Status</th></tr></thead><tbody>
          {[t.vip, ...t.related].map((v) => <tr key={v.n}><td><a href={vipUrl(v.file)}>VIP-{v.n}</a>: {v.title}</td><td>{v.status}</td></tr>)}
        </tbody></table></div>
      </section>

      <section className="sec">
        <h2>Other templates</h2>
        <div className="g3">{others.map((o) => <a key={o.slug} className="card" href={`/templates/${o.slug}`}><p className="n">VIP-{o.vip.n}</p><h3>{o.name}</h3><p className="mut">{o.card}</p></a>)}</div>
      </section>
    </main>
  );
}
