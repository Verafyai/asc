import "@/styles/site.css";
import "@/styles/templates.css";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";
import { TEMPLATES, MORE_TEMPLATES, HARNESS_REPO, HARNESS_RELEASE, vipUrl } from "@/lib/templates";

export const metadata: Metadata = { ...pageMeta("Templates", "/templates"), description: "ASC templates: ready-made inference programs for agent-to-agent contracts, agent bonds, super grants, hackathon grants, treasuries and DAO constitutions, each shipped in Verafy Harness with a VIP, tests, a demo and a tailoring prompt." };

const GROUPS = ["Agreements", "Funding", "Treasury and governance", "Trust"] as const;

export default function Page() {
  return (
    <main className="w">
      <section className="hero">
        <p className="eb">Templates</p>
        <h1>Inference programs you can start from</h1>
        <p className="lede">Each template is a complete Actually Smart Contract program: the terms format, the rules code enforces, the questions a jury answers, and the escrow policy a judiciary signer runs on Solana. Each one shipped in Verafy Harness {HARNESS_RELEASE} with a design proposal (VIP), tests and a demo. Each comes with a prompt: paste it into an AI, answer its questions, and it writes the program for your case.</p>
        <div className="btns"><a className="btn p" href="#agreements">Browse templates</a><a className="btn" href={`${HARNESS_REPO}/tree/main/templates/prompts`}>All prompts on GitHub</a></div>
      </section>
      <section className="sec">
        <h2>How every template works</h2>
        <div className="g3">
          <div className="card"><p className="n">01 Terms</p><h3>Signed before anything happens</h3><p className="mut">The parties, the outcomes and what each one pays are written and signed first. A jury can only pick among them.</p></div>
          <div className="card"><p className="n">02 Code, then jury</p><h3>Limits code can check stay in code</h3><p className="mut">Caps, recipients, deadlines and payout tables are checked deterministically. The jury answers only the questions that need judgment, from pinned evidence.</p></div>
          <div className="card"><p className="n">03 Escrow</p><h3>The money can only go where a ruling says</h3><p className="mut">A Squads wallet with a judiciary signer. The signer replays the signed log, rebuilds each jury contract and verifies each sealed round before it signs.</p></div>
        </div>
      </section>
      {GROUPS.map((g) => (
        <section className="sec" key={g} id={g === "Agreements" ? "agreements" : g === "Funding" ? "funding" : "treasury"}>
          <h2>{g}</h2>
          <div className="g2">
            {TEMPLATES.filter((t) => t.group === g).map((t) => (
              <a key={t.slug} className="card tpl" href={`/templates/${t.slug}`}>
                <p className="n">VIP-{t.vip.n} · {t.requirement}</p>
                <h3>{t.name}</h3>
                <p className="mut">{t.card}</p>
                <div className="meta"><span className="tag real">Shipped in the harness</span><span className="tag">Prompt included</span><span className="tag">template: {t.templateId}</span></div>
              </a>
            ))}
          </div>
        </section>
      ))}
      <section className="sec">
        <h2>Also in the harness</h2>
        <p className="mut">Shipped policy templates that don't have a page here yet.</p>
        <div className="g3">
          {MORE_TEMPLATES.map((t) => (
            <a key={t.name} className="card" href={vipUrl(t.vip.file)}><p className="n">VIP-{t.vip.n}</p><h3>{t.name}</h3><p className="mut">{t.card}</p></a>
          ))}
        </div>
        <p className="mut" style={{ marginTop: "18px" }}>Every template is a function in <a href={`${HARNESS_REPO}/blob/main/packages/core/src/policy.js`}>policy.js</a>: <code>policyFromTemplate(name, params)</code> returns the policy, and its hash is what the signer on chain carries.</p>
      </section>
    </main>
  );
}
