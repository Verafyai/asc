import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import config from "../next.config";
import { INSCRIBED, proseWords } from "@/content/copy";
import examples from "@/examples/examples.json";
import { createCreditsClient } from "@/lib/credits";
import { headlines, usd } from "@/lib/performance";
import { evalTest } from "@/lib/sandbox/expr";
import { simulate, TEMPLATES } from "@/lib/sandbox/simulate";
import { loadStandards } from "@/lib/standards";
import { PRODUCT_NAME, SITE_URL } from "@/lib/brand";
import { redirectLegacyHost } from "../middleware";
import { NAV, isCurrent } from "@/lib/nav";
import { TEMPLATES as ASC_TEMPLATES, PROMPTS } from "@/lib/templates";
import { TEMPLATE_LINKS } from "@/lib/template-links";
import { loadSimds } from "@/lib/simds";

function walk(dir: string, out: string[] = [], pattern = /\.(tsx|ts|md|css)$/): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === "data" || name === "uploads") continue;
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out, pattern);
    else if (pattern.test(name) && !p.includes(`${path.sep}tests${path.sep}`)) out.push(p);
  }
  return out;
}

describe("copy rules", () => {
  it("names the product in one place and uses the canonical host", () => {
    expect(PRODUCT_NAME).toBe("Actually Smart Contracts");
    expect(SITE_URL).toBe("https://asc.verafy.ai");
  });

  it("redirects the previous host and keeps that name out of site copy", () => {
    expect(redirectLegacyHost("swarmchain.verafy.ai", "/docs/trust", "?x=1")?.toString()).toBe("https://asc.verafy.ai/docs/trust?x=1");
    expect(redirectLegacyHost("asc.verafy.ai", "/", "")).toBeNull();
    const roots = ["app", "components", "content", "README.md", "docs"].map((p) => path.join(process.cwd(), p));
    const files = roots.flatMap((p) => (statSync(p).isDirectory() ? walk(p) : [p]));
    const hits = files.filter((file) => /swarmchain/i.test(readFileSync(file, "utf8")));
    expect(hits).toEqual([]);
  });

  it("has no Swarm Chain, hype words, or em or en dashes in site copy", () => {
    const roots = ["app", "components", "content", "config", "README.md"].map((p) => path.join(process.cwd(), p));
    const files = roots.flatMap((p) => (statSync(p).isDirectory() ? walk(p) : [p]));
    const bad: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      if (/Swarm Chain/i.test(text)) bad.push(`${file}: Swarm Chain`);
      if (/[—–]/.test(text)) bad.push(`${file}: dash`);
      if (/\b(revolutionary|seamless|unlock)\b/i.test(text)) bad.push(`${file}: hype`);
    }
    expect(bad).toEqual([]);
  });

  it("keeps the ASC run under its word cap", () => {
    const inscribed = proseWords([
      INSCRIBED.eyebrow, INSCRIBED.tag, INSCRIBED.headline, INSCRIBED.subhead,
      INSCRIBED.rulesTitle, ...examples.hot_wallet.rules, INSCRIBED.rulesNote,
      INSCRIBED.happenedTitle,
      "$250,000 to a registered wallet", "5 of 5 allow · paid", "Quorum 4 · no rule broken",
      "$6,000,000,000 to an unknown wallet", "0 of 5 allow · refused, held for review",
      "Broke 5 rules: the $1M cap, the daily cap, the declared list, the 24-hour delay, the 10% share",
      INSCRIBED.happenedNote, INSCRIBED.howTitle, ...INSCRIBED.how, INSCRIBED.dataTitle,
      "Inscribed step list", "Run steps and signatures", "Run rules (quorum, wallets, caps)",
    ]);
    expect(inscribed).toBeLessThan(400);
  });
});

describe("credits stub", () => {
  it("quotes, then charges 0 when the run fails or misses quorum", () => {
    const c = createCreditsClient();
    const q = c.quote("acct", "jury_run", { jurors: 5 });
    expect(q.credits).toBe(25);
    expect(q.balance).toBeNull();
    expect(q.label.toLowerCase()).toContain("not connected");
    const hold = c.hold("acct", q.id);
    const missed = c.finishRun(hold.id, 2, 4, false);
    expect(missed.charged).toBe(0);
    expect(missed.status).toBe("released");
    const q2 = c.quote("acct", "jury_run");
    const hold2 = c.hold("acct", q2.id);
    const failed = c.finishRun(hold2.id, 5, 4, true);
    expect(failed.charged).toBe(0);
    const q3 = c.quote("acct", "compile");
    const hold3 = c.hold("acct", q3.id);
    expect(c.settle(hold3.id, q3.credits).charged).toBe(2);
    expect(() => c.settle(c.hold("acct", c.quote("acct", "compile").id).id, 99)).toThrow(/above the quote/);
  });
});

describe("sandbox", () => {
  it("evaluates hot-wallet steps without calling a model", () => {
    expect(evalTest("registered || amountUsd <= 1000000", { registered: false, amountUsd: 6_000_000_000 })).toBe(false);
    expect(evalTest("registered || amountUsd <= 1000000", { registered: true, amountUsd: 6_000_000_000 })).toBe(true);
    expect(evalTest("to in declaredList", { to: "registered-wallet", declaredList: ["registered-wallet"] })).toBe(true);
    const hot = TEMPLATES[0];
    const ok = simulate({ rules: hot.rules, request: JSON.parse(hot.request), behaviors: ["honest"], jurors: 5, quorum: 4 });
    expect(ok.mode).toBe("simulated");
    expect(ok.ruling).toBe("allow");
    expect(ok.allow).toBe(5);
    const drain = simulate({
      rules: hot.rules,
      request: { to: "unknown", amountUsd: 6_000_000_000, registered: false, sentTodayUsd: 4_000_000, registeredHoursAgo: 0, declaredList: ["registered-wallet"], hotWalletBalanceUsd: 2_000_000_000 },
      behaviors: ["honest"],
      jurors: 5,
      quorum: 4,
    });
    expect(drain.ruling).toBe("deny");
    expect(drain.allow).toBe(0);
    expect(drain.failedRules.length).toBe(5);
    const hijack = simulate({ rules: hot.rules, request: JSON.parse(hot.request), behaviors: ["hijacked"], jurors: 5, quorum: 4 });
    expect(hijack.allow).toBe(4);
    expect(hijack.ruling).toBe("allow");
    const poison = simulate({ rules: hot.rules, request: JSON.parse(hot.request), behaviors: ["poisoned"], jurors: 5, quorum: 4 });
    expect(poison.votes.every((v) => v.vote === "deny")).toBe(true);
    const stub = simulate({ rules: "Never send more than $10 to anyone.", request: { amountUsd: 50 }, behaviors: ["honest"], jurors: 3, quorum: 2 });
    expect(stub.mode).toBe("stub");
    expect(stub.ruling).toBe("deny");
  });
});

describe("standards and performance", () => {
  it("parses the draft standards and their rule counts", () => {
    const all = loadStandards();
    const counts = Object.fromEntries(all.map((s) => [s.code, s.rules.length]));
    expect(counts).toEqual({ EDO: 5, EAO: 10, ETC: 12, EVC: 8, EMO: 10, "ASC-0": 0 });
    expect(all.every((s) => s.status === "Draft")).toBe(true);
  });

  it("computes the performance headlines from the model file", () => {
    const h = headlines();
    expect(usd(h.rulingUsd)).toBe("$0.0059");
    expect(usd(h.compileUsd)).toBe("$0.084");
    expect(usd(h.inscribeBaseUsd)).toBe("$0.0013");
    expect(usd(h.payoutUsd)).toBe("$0.0004");
    expect(usd(h.certifyUsd)).toBe("$0.269");
    expect(usd(h.maverickRulingUsd)).toBe("$0.0024");
    expect(usd(h.proveExtraUsd)).toBe("$0.049");
    expect(usd(h.proveLowUsd)).toBe("$0.026");
    expect(usd(h.proveHighUsd)).toBe("$0.080");
    expect(usd(h.verifyUsd)).toBe("$0.024");
    expect(h.certifyProofs).toBe(540);
    expect(usd(h.certifyProveLow)).toBe("$2.78");
    expect(usd(h.certifyProveHigh)).toBe("$8.60");
    expect(usd(h.certifyVerify)).toBe("$2.55");
    expect(Math.round(h.certifyGpuMinutes)).toBe(84);
    expect(usd(h.hardwareLowMonth)).toBe("$1,453");
    expect(usd(h.hardwareHighMonth)).toBe("$4,497");
  });
});

describe("redirects", () => {
  it("301s the removed pages to their v2 homes (SITE_SPEC_v2)", async () => {
    const rules = await config.redirects!();
    const map = Object.fromEntries(rules.map((r) => [r.source, `${r.destination}:${"statusCode" in r ? r.statusCode : ""}`]));
    expect(map["/docs"]).toBe("/simds:301");
    expect(map["/docs/:path*"]).toBe("/simds:301");
    expect(map["/docs/trust"]).toBe("/security:301");
    expect(map["/docs/recorded-runs/:slug"]).toBe("/runs/:slug:301");
    expect(map["/code"]).toBe("/simds:301");
    expect(map["/proposal"]).toBe("/simds:301");
    expect(map["/certify"]).toBe("/certifications:301");
    expect(map["/demos"]).toBe("/:301");
    expect(map["/trust"]).toBe("/security:301");
    expect(map["/asc"]).toBe("/inscribed:301");
    // the specific /docs rules must come before the catch-all
    const order = rules.map((r) => r.source);
    expect(order.indexOf("/docs/trust")).toBeLessThan(order.indexOf("/docs/:path*"));
    expect(order.indexOf("/docs/recorded-runs/:slug")).toBeLessThan(order.indexOf("/docs/:path*"));
  });
});

describe("v2 nav and SIMDs", () => {
  it("has the one nav, in the spec order", () => {
    expect(NAV.map((n) => n.label)).toEqual(["Home", "How it works", "Sandbox", "Templates", "Read the SIMDs", "Standards", "Certifications", "Performance", "Security"]);
    expect(isCurrent("/", "/")).toBe(true);
    expect(isCurrent("/", "/simds")).toBe(false);
    expect(isCurrent("/standards", "/standards/edo")).toBe(true);
  });

  it("lists every template in the menu, each with a page, a shipped VIP and a prompt", () => {
    expect(TEMPLATE_LINKS.map((t) => t.slug)).toEqual(ASC_TEMPLATES.map((t) => t.slug));
    for (const t of ASC_TEMPLATES) {
      expect(t.vip.status).toMatch(/^Shipped/);
      expect(PROMPTS[t.slug]).toContain(`policyFromTemplate('${t.templateId}'`);
      expect(PROMPTS[t.slug]).toContain("Never ask for or handle private keys");
    }
  });

  it("renders the three SIMDs with every anchor the site links to", () => {
    const simds = loadSimds();
    expect(simds.map((s) => s.title)).toEqual(["Inference Programs", "Inference Evaluators and Attestations", "Inference Rulings, Disputes and Challenges"]);
    const ids = new Set<string>(["programs", "attestations", "rulings"]);
    for (const s of simds) for (const m of s.html.matchAll(/ id="([^"]+)"/g)) ids.add(m[1]);
    const roots = ["app", "components", "public/sandbox"].map((p) => path.join(process.cwd(), p));
    const files = roots.flatMap((p) => walk(p, [], /\.(tsx|ts|js)$/));
    const missing: string[] = [];
    for (const file of files) for (const m of readFileSync(file, "utf8").matchAll(/\/simds#([a-z0-9-]+)/g)) if (!ids.has(m[1])) missing.push(`${file}: ${m[1]}`);
    expect(missing).toEqual([]);
  });
});
