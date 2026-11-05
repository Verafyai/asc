import fs from "node:fs";
import path from "node:path";

export type Chip = "Money" | "DAOs" | "Agents" | "Models" | "Software";
export const CHIPS: ("All" | Chip)[] = ["All", "Money", "DAOs", "Agents", "Models", "Software"];

type Vote = { juror: string; lab: string; outcome: string };

export interface SampleMeta {
  slug: string;
  folder: string;
  title: string;
  chip: Chip;
  runs: string;
  judgment: string;
  languages: string[];
  label: "illustrative" | "planned";
  rulesFile: string;
  codeFiles: string[];
  ruling: Record<string, unknown>;
  sandboxRequest: Record<string, unknown>;
}

export interface Sample extends SampleMeta {
  ascName: string;
  rules: string;
  code: { name: string; text: string }[];
}

const LABS: [string, string][] = [
  ["gpt", "OpenAI"], ["claude", "Anthropic"], ["gemini", "Google"], ["qwen", "Alibaba"],
  ["deepseek", "DeepSeek"], ["mistral", "Mistral"], ["llama", "Meta"],
];
const SIGS = ["3fa9c1", "b07e42", "9d21aa", "51c8e0", "e6f30b", "7c44d2", "a18f5e"];

function votes(outcomes: string[]): (Vote & { wallet: string; sig: string })[] {
  return outcomes.map((o, i) => ({ juror: LABS[i][0], lab: LABS[i][1], outcome: o, wallet: `J${i + 1}${LABS[i][0][0]}...`, sig: `${SIGS[i]}...` }));
}

function ruling(p: {
  id: string; asc: string; outcome: string; broken: { rule: number; votes: number; note: string }[];
  size: number; quorum: number; tier: string; outcomes: string[]; items: number; dispute: string | null; credits: number | null;
}) {
  return {
    id: p.id,
    asc: p.asc,
    status: "final",
    outcome: p.outcome,
    rulesBroken: p.broken,
    jury: { size: p.size, quorum: p.quorum, tier: p.tier, answered: p.outcomes.length },
    votes: votes(p.outcomes),
    evidence: { sha256: "4b1e07c2a9d3...", items: p.items },
    attestations: "<base64: the signed votes, ready to pass to verify_ruling / verifyRuling>",
    dispute: p.dispute ? { open_until: p.dispute } : null,
    cost: p.credits === null ? { quoted: null, charged: null, unit: "credits", note: `${p.tier} tier price not set yet` } : { quoted: p.credits, charged: p.credits, unit: "credits" },
    record: `https://asc.verafy.ai/rulings/${p.id}`,
    illustrative: true,
  };
}

export const SAMPLES: SampleMeta[] = [
  {
    slug: "exchange-withdrawals", folder: "01-exchange-withdrawals", title: "Exchange withdrawal checks", chip: "Money",
    runs: "Backend (TS) + Solana program (Rust)", judgment: "Hold if it looks like an account takeover", languages: ["TypeScript", "Rust"], label: "illustrative",
    rulesFile: "withdrawals.asc.md", codeFiles: ["check_withdrawal.ts", "withdraw.anchor.rs"],
    ruling: ruling({ id: "rul_8fK2c9", asc: "asc_hotwallet_v1", outcome: "hold", broken: [{ rule: 5, votes: 5, note: "Email and 2FA changed 3 hours ago; withdrawal to an address never used by this account." }], size: 5, quorum: 4, tier: "standard", outcomes: ["hold", "hold", "hold", "hold", "hold"], items: 4, dispute: "2026-11-07T16:20:00Z", credits: 25 }),
    sandboxRequest: { type: "withdrawal", amountUsd: 250000, to: "new-address", registered: true, registeredHoursAgo: 30, emailChangedHoursAgo: 3, twoFactorChangedHoursAgo: 3, sentTodayUsd: 4000000, hotWalletBalanceUsd: 2000000000 },
  },
  {
    slug: "dao-constitution", folder: "02-dao-constitution", title: "A DAO constitution that can block a vote", chip: "DAOs",
    runs: "EVM Governor (Solidity)", judgment: "What the proposal does must match what it says", languages: ["Solidity"], label: "illustrative",
    rulesFile: "constitution.asc.md", codeFiles: ["ConstitutionGuard.sol", "../00-shared/IAsc.sol"],
    ruling: ruling({ id: "rul_D7q41m", asc: "asc_dao_constitution_v1", outcome: "block", broken: [{ rule: 2, votes: 6, note: "The calldata also grants a new spender role on the treasury safe. The proposal text doesn't mention it." }], size: 7, quorum: 5, tier: "frontier", outcomes: ["block", "block", "block", "block", "block", "block", "allow"], items: 3, dispute: "2026-11-07T18:00:00Z", credits: null }),
    sandboxRequest: { type: "proposal_execution", text: "Fund the Q1 audit, 120,000 USDC", calldata: ["transfer 120000 USDC to auditor", "grantRole(SPENDER, 0x9a1...)"], treasuryUsd: 40000000, spentThisQuarterUsd: 900000 },
  },
  {
    slug: "grant-milestones", folder: "03-dao-grant-milestones", title: "Grant milestone payouts", chip: "DAOs",
    runs: "Backend (TS)", judgment: "Pay only if what was delivered is what was promised", languages: ["TypeScript"], label: "illustrative",
    rulesFile: "grants.asc.md", codeFiles: ["claim_milestone.ts"],
    ruling: ruling({ id: "rul_G3n8vx", asc: "asc_grants_v1", outcome: "partial", broken: [{ rule: 3, votes: 4, note: "The release and the repo are public. The usage dashboard the milestone names is still missing, and the claim says so." }], size: 5, quorum: 4, tier: "standard", outcomes: ["partial", "partial", "partial", "partial", "pay"], items: 3, dispute: "2026-11-11T16:20:00Z", credits: 25 }),
    sandboxRequest: { type: "milestone_claim", milestone: "Ship v1 of the SDK with docs and a public usage dashboard", delivered: ["v1.0.0 release", "docs site"], missing: ["usage dashboard"], amountUsd: 40000 },
  },
  {
    slug: "agent-spending", folder: "04-agent-spending", title: "An agent's spending limits", chip: "Agents",
    runs: "Agent tool hook (TS)", judgment: "Deny purchases the task didn't need", languages: ["TypeScript"], label: "illustrative",
    rulesFile: "agent-spending.asc.md", codeFiles: ["guard.ts"],
    ruling: ruling({ id: "rul_A5p0kz", asc: "asc_agent_spending_v1", outcome: "deny", broken: [{ rule: 2, votes: 3, note: "The task was \"renew our domain\". The call also buys a premium hosting plan the task didn't ask for." }], size: 3, quorum: 2, tier: "fast", outcomes: ["deny", "deny", "deny"], items: 2, dispute: null, credits: null }),
    sandboxRequest: { type: "agent_tool_call", tool: "buy", task: "renew our domain", items: ["domain renewal $18", "premium hosting plan $240/yr"], amountUsd: 258, firstTimeVendor: false },
  },
  {
    slug: "customer-data", folder: "05-agent-customer-data", title: "A support agent's data rules", chip: "Agents",
    runs: "Outbound email (Python)", judgment: "Never send a customer's data to anyone else", languages: ["Python"], label: "illustrative",
    rulesFile: "customer-data.asc.md", codeFiles: ["guard.py"],
    ruling: ruling({ id: "rul_C2t6wd", asc: "asc_customer_data_v1", outcome: "redact", broken: [{ rule: 3, votes: 3, note: "Paragraph 3 quotes an internal note that names a staff member. The rest of the reply is fine." }], size: 3, quorum: 2, tier: "fast", outcomes: ["redact", "redact", "redact"], items: 2, dispute: null, credits: null }),
    sandboxRequest: { type: "agent_outbound_message", to: "customer on this ticket", body: "Your refund is on its way. Internal note from Dana: customer is a repeat refunder.", containsOtherCustomerData: false },
  },
  {
    slug: "model-behavior", folder: "06-model-output", title: "Model behavior audit", chip: "Models",
    runs: "Nightly batch (Python)", judgment: "Never give a dose for a specific person", languages: ["Python"], label: "illustrative",
    rulesFile: "model-behavior.asc.md", codeFiles: ["audit.py"],
    ruling: ruling({ id: "rul_M9b3ec", asc: "asc_model_behavior_v1", outcome: "fail", broken: [{ rule: 1, votes: 5, note: "The answer tells this user to take 800 mg of ibuprofen every 4 hours for their back pain." }], size: 5, quorum: 4, tier: "standard", outcomes: ["fail", "fail", "fail", "fail", "fail"], items: 1, dispute: null, credits: 25 }),
    sandboxRequest: { type: "model_output", question: "My back hurts, how much ibuprofen should I take?", answer: "Take 800 mg every 4 hours until it feels better." },
  },
  {
    slug: "treasury-rebalancing", folder: "07-treasury-rebalancing", title: "Treasury trading rules", chip: "Money",
    runs: "Treasury bot (TS)", judgment: "A price prediction isn't a reason to trade", languages: ["TypeScript"], label: "illustrative",
    rulesFile: "treasury.asc.md", codeFiles: ["rebalance.ts"],
    ruling: ruling({ id: "rul_T4r7hn", asc: "asc_treasury_v1", outcome: "deny", broken: [{ rule: 3, votes: 5, note: "The written reason is \"SOL will rally after the upgrade\", which is a price prediction." }], size: 5, quorum: 4, tier: "frontier", outcomes: ["deny", "deny", "deny", "deny", "deny"], items: 3, dispute: "2026-11-07T16:20:00Z", credits: null }),
    sandboxRequest: { type: "treasury_trade", sell: "USDC", buy: "SOL", amountUsd: 3000000, reason: "SOL will rally after the upgrade", venue: "approved-dex", stableMonthsAfter: 22 },
  },
  {
    slug: "vesting-release", folder: "08-vesting-release", title: "Contributor vesting", chip: "Money",
    runs: "Solana program (Rust)", judgment: "\"Performance\" alone isn't cause", languages: ["Rust"], label: "illustrative",
    rulesFile: "vesting.asc.md", codeFiles: ["release.anchor.rs"],
    ruling: ruling({ id: "rul_V1s5qa", asc: "asc_vesting_v1", outcome: "pause", broken: [{ rule: 5, votes: 4, note: "The HR status says on leave. A notice dated Oct 30 says the work ended for performance. They disagree, so the board decides." }], size: 5, quorum: 4, tier: "standard", outcomes: ["pause", "pause", "pause", "pause", "release"], items: 3, dispute: "2026-11-18T16:20:00Z", credits: 25 }),
    sandboxRequest: { type: "vesting_release", monthsSinceStart: 15, status: "on leave", notice: "Work ended Oct 30 for performance", amountTokens: 12500 },
  },
  {
    slug: "certify-in-ci", folder: "09-certify-in-ci", title: "Certify on every push", chip: "Software",
    runs: "GitHub Action", judgment: "Your repo's claims, checked rule by rule", languages: ["YAML"], label: "planned",
    rulesFile: "asc.yml", codeFiles: ["asc-certify.yml"],
    ruling: {
      id: "cert_E8k2pf", standard: "EAO@1.0", repo: "example/agent", commit: "9f3c2e1", status: "final", outcome: "NOT CERTIFIED",
      score: { passed_weight: 19, evaluable_weight: 25, percent: 76 },
      rulesFailed: [{ rule: "EAO-02", votes: 5, file: "agent/tools/refund.ts", line: 42, note: "The refund tool can pay out up to $5,000 without going through the jury guard. The repo declares a $1,000 limit in agent/limits.ts." }],
      jury: { size: 5, quorum: 4, tier: "standard", answered: 5 },
      votes: votes(["NOT CERTIFIED", "NOT CERTIFIED", "NOT CERTIFIED", "NOT CERTIFIED", "NOT CERTIFIED"]),
      badge: "[ EAO@1.0 | NOT CERTIFIED | 9f3c2e1 ]",
      cost: { quoted: 400, charged: 400, unit: "credits" },
      record: "https://asc.verafy.ai/certificates/cert_E8k2pf",
      illustrative: true,
    },
    sandboxRequest: { type: "certification", standard: "EAO@1.0", scope: "agent/", commit: "9f3c2e1" },
  },
];

const ROOT = path.join(process.cwd(), "samples");
const read = (folder: string, file: string) => fs.readFileSync(path.join(ROOT, folder, file), "utf8");

function ascName(rules: string): string {
  const m = rules.match(/^name:\s*(.+)$/m);
  return m ? m[1].trim() : "Repo claims (asc.yml)";
}

export function getSample(slug: string): Sample | undefined {
  const s = SAMPLES.find((x) => x.slug === slug);
  if (!s) return undefined;
  const rules = read(s.folder, s.rulesFile);
  return {
    ...s,
    rules,
    ascName: s.slug === "certify-in-ci" ? "Repo claims: EAO@1.0 and ETC@1.0" : ascName(rules),
    code: s.codeFiles.map((f) => ({ name: path.basename(f), text: read(s.folder, f) })),
  };
}

export const allSamples = (): Sample[] => SAMPLES.map((s) => getSample(s.slug)!);
export const sharedFile = (file: string) => read("00-shared", file);

/** The IQ Labs files shown on Under the hood, unchanged. */
export const IQ_FILES = ["iq_inscribe_asc.solana.ts", "iq_inscribe_asc.evm.ts", "iq_private_asc.ts", "iq_jury_tables.solana.ts"];
export const readExample = (file: string) => fs.readFileSync(path.join(process.cwd(), "examples", file), "utf8");
