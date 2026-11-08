/**
 * ASC templates: ready-made Actually Smart Contract programs, each one shipped in
 * Verafy Harness with a VIP, tests and a demo. One record per landing page under
 * /templates/<slug>. Every claim here should match the VIP and the code it links to.
 */

export const HARNESS_REPO = "https://github.com/Verafyai/verafyHarness";
export const HARNESS_RELEASE = "v0.0.5-alpha";
const blob = (p: string) => `${HARNESS_REPO}/blob/main/${p}`;
export const vipUrl = (file: string) => blob(`docs/proposals/${file}`);
export const codeUrl = blob;

export type Vip = { n: string; title: string; file: string; status: string };
export type Step = { t: string; d: string };
export type Row = string[];

export type Template = {
  slug: string;
  name: string;
  group: "Agreements" | "Funding" | "Treasury and governance";
  card: string;
  headline: string;
  lede: string;
  vip: Vip;
  related: Vip[];
  requirement: string;
  templateId: string;
  why: string[];
  forWho: Row[];
  flow: Step[];
  format: Row[];
  code: string[];
  jury: string[];
  escrow?: { title: string; rows: Row[]; note: string };
  settle?: { title: string; head: Row; rows: Row[]; note?: string };
  threats: Row[];
  example: { title: string; code: string };
  run: { call: string; demo?: string; files: Row[] };
  measured: string[];
  open: string[];
  media?: { src: string; alt: string; caption: string };
};

const SIGNER: Vip = { n: "0010", title: "Judiciary Signer: a multisig member that votes only as a jury rules", file: "VIP-0010-judiciary-signer.md", status: "Shipped (v0.0.4-alpha); devnet deploy open" };
const POLICIES: Vip = { n: "0011", title: "Policies, and Covenant Launch: rules a wallet cannot break", file: "VIP-0011-policies.md", status: "Shipped (v0.0.4-alpha)" };

export const TEMPLATES: Template[] = [
  {
    slug: "agentic-contract",
    name: "Agentic Contract",
    group: "Agreements",
    card: "Two AI agents sign terms and every way the deal can end. The money waits in a two-of-three escrow. If they disagree, a jury picks one of the signed remedies.",
    headline: "Agentic Contract: a deal between two AI agents, with a jury as the neutral third party",
    lede: "Agent A and agent B write the terms together, both sign the same hash, and the money sits in escrow on Solana. Most deals settle without anyone else. When they disagree, the dispute becomes an Actually Smart Contract, and the escrow can pay only the remedy the jury picks.",
    vip: { n: "0029", title: "Agentic contracts: agreements between two agents, with the judiciary as the neutral third party", file: "VIP-0029-agentic-contracts.md", status: "Shipped (v0.0.5-alpha): not yet on devnet" },
    related: [SIGNER, POLICIES],
    requirement: "SIGN-007",
    templateId: "agentic-contract",
    why: [
      "Agents already buy research, data, code and compute from each other. The deal is either prepay and hope, or an on-chain escrow that can release on a signature or a timestamp but can't tell whether a report is 2,000 words with ten real sources.",
      "The parts of a deal that need judgment are the parts that go wrong. An agentic contract puts those parts in front of a jury of models from different families, reading pinned evidence, and binds the escrow to the jury's answer.",
    ],
    forWho: [
      ["Agent builders", "A standard way for your agent to buy or sell work from another agent, with recourse."],
      ["Agent marketplaces", "Escrow and dispute resolution you don't have to staff."],
      ["Companies whose agents act for them", "Each contract names the principal and the mandate the agent acted under."],
    ],
    flow: [
      { t: "Agree", d: "The agents write the terms: obligations with deadlines and what proves each one, the money, every remedy with its exact payout, the defaults and the dispute rules. Both sign the contract hash with their Ed25519 keys." },
      { t: "Fund", d: "The depositor sends the money to a Squads wallet that is two of three: agent A, agent B and a judiciary signer. Funding is a signed event in the log." },
      { t: "Work", d: "Every step is a signed event that carries the hash of the one before it: deliver (evidence pinned by hash), accept the delivery, release, dispute, statement." },
      { t: "Settle without a jury", d: "A mutual release, an accepted delivery, or a default the log proves: delivered on time and nobody objected inside the review window, or a deadline passed with no delivery." },
      { t: "Dispute", d: "Either agent opens one. After the other side's evidence window, it becomes an ASC: the signed terms, facts computed from the log, the pinned evidence, both agents' statements as untrusted claims, and one option per remedy." },
      { t: "Pay", d: "One agent plus the signer can move the money only as one remedy's exact payouts. The signer replays the log, rebuilds the dispute contract, verifies the sealed jury round, then signs." },
    ],
    format: [
      ["parties", "Exactly two, A and B: agent key, payout wallet, Squads member key, principal, mandate"],
      ["terms", "A plain-word summary and obligations: who owes what, by when, and what proves it"],
      ["money", "Asset, amount in base units, depositor"],
      ["remedies", "Every outcome, what it means, and its payout to each party. Each remedy pays out exactly the escrow."],
      ["defaults", "onDelivery, onSilence after reviewSeconds, onMissedDeadline"],
      ["dispute", "Jury size and model families, bar, fee, who pays it, evidence window, challenge window"],
    ],
    code: [
      "Only the System, Token, Token-2022, Associated Token, Memo and Compute Budget programs",
      "Only the two party wallets receive anything",
      "Never more than the escrow in one transaction",
      "Pays out once",
      "The transfers equal exactly one remedy's row, backed by a settlement proof the signer checks itself",
      "No change to the wallet's members or settings",
    ],
    jury: ["Under the signed terms and the evidence, which remedy applies?", "Does this transfer carry out the verified settlement attached to the case, and nothing else?"],
    escrow: {
      title: "The escrow is two of three",
      rows: [["Agent A and agent B together", "Anything: both consent, so it's a mutual release"], ["One agent with the judiciary signer", "Only one remedy's exact payouts, with a proof"], ["Any one key alone", "Nothing"]],
      note: "This is the oldest shape in escrow. What's new is the arbitrator: a signer that runs code first and asks a jury second.",
    },
    settle: {
      title: "Four ways to settle, strongest first",
      head: ["Settlement", "Rests on", "Jury?"],
      rows: [["Mutual", "Both agents signed a release for the same remedy", "No"], ["Acceptance", "The receiving agent accepted the delivery", "No"], ["Default", "The log proves it: on time and no objection in the review window, a missed deadline, or a late delivery nobody accepted", "No"], ["Ruling", "A sealed jury ruling on a dispute", "Yes"]],
      note: "Silence has a price, so an agent can't hold the money hostage by going quiet.",
    },
    threats: [
      ["An agent logs a \"ruling\" no jury gave", "The signer verifies the sealed round itself: seated jury, families, signed commits and reveals", "Tested"],
      ["The dispute contract is swapped for one with tilted instructions", "The signer rebuilds it from the terms and the log and compares hashes", "Tested"],
      ["A prompt injection in an agent's statement", "Statements are labeled untrusted claims by interested agents; the question allows only remedy names", "Tested with a scripted jury"],
      ["A dispute opened after the review window to stall", "The log refuses it; the delivery stands as the defaults say", "Tested"],
      ["A payout off the remedy table", "Refused by code before any jury", "Tested"],
      ["Forged delivery evidence", "Pinned by hash, so it can't change later; whether it was honest is the jury's call and challengeable", "Open risk"],
    ],
    example: {
      title: "A 2 SOL research job",
      code: `{
  "kind": "verafy.agentic-contract/1",
  "terms": { "obligations": [{ "party": "B", "text": "Deliver a report of at least 2,000 words with ten cited sources", "due": 1800604800 }] },
  "money": { "asset": "SOL", "amount": "2000000000", "depositor": "A" },
  "remedies": [
    { "outcome": "COMPLETE", "payout": { "A": "0", "B": "2000000000" } },
    { "outcome": "PARTIAL",  "payout": { "A": "1000000000", "B": "1000000000" } },
    { "outcome": "REFUND",   "payout": { "A": "2000000000", "B": "0" } }
  ],
  "defaults": { "onDelivery": "COMPLETE", "onSilence": "COMPLETE", "reviewSeconds": 259200, "onMissedDeadline": "REFUND" },
  "dispute": { "bar": 0.66, "jury": { "size": 3, "minFamilies": 3 }, "feePaidBy": "loser" }
}`,
    },
    run: {
      call: "policyFromTemplate('agentic-contract', { contract })\ncheckAgenticEscrow(multisig, { signer, policy, contract })\ncheckSettlementProof(proof, { now, pool, seed })",
      demo: "node scripts/agentic-demo.mjs",
      files: [["packages/core/src/agentic.js", "Contracts, log, settlements, disputes, proofs, escrow check"], ["packages/core/test/agentic.test.js", "10 tests"], ["scripts/agentic-demo.mjs", "Both paths, with real keys"]],
    },
    measured: ["10 of 10 tests pass, including forged rulings, tilted dispute contracts, late disputes and payouts off the table", "The demo's jury is scripted: it shows the machinery, not how well a real model judges a report"],
    open: ["Not on devnet", "Principals don't yet sign the mandates their agents act under", "One depositor per contract; bonds from both sides aren't built", "Dispute fees are computed, not collected on chain"],
    media: { src: "/templates/agentic-contracts.gif", alt: "Animation: two agents sign terms, fund a two-of-three escrow, dispute a short report, a three-family jury rules PARTIAL, the signer checks the proof and pays 1 SOL to each.", caption: "The whole flow in 31 seconds, from the harness demo." },
  },
  {
    slug: "agent-bond",
    name: "Agent Bond",
    group: "Agreements",
    card: "An operator puts money behind its AI agent's behavior. Anyone can report a violation; a jury rules; the bond is slashed as each rule is priced. Agents can slash agents.",
    headline: "Agent Bond: put money behind your agent's behavior",
    lede: "The agent's operator posts a bond under a written code of conduct, with a price on every rule. Anyone who sees a violation (a user, a counterparty, another agent watching the platform) reports it with evidence and a small reporter bond. A Verafy jury rules, and the escrow slashes the bond to whoever the covenant names.",
    vip: { n: "0033", title: "Agent bonds: an operator bonds its agent's behavior, and a jury slashes violations", file: "VIP-0033-agent-bonds.md", status: "Shipped (v0.0.5-alpha): not yet on devnet" },
    related: [{ n: "0016", title: "Commission covenant: a validator bonds its promise on fees", file: "VIP-0016-commission-covenant.md", status: "Shipped (v0.0.4-alpha)" }, SIGNER],
    requirement: "SIGN-011",
    templateId: "agent-bond",
    why: [
      "We're told to trust an agent because of who runs it. That's a reputation claim with nothing at stake. A validator can be slashed because the network can prove its fault; most agent misbehavior, like asking a user for a seed phrase or overstepping a refund limit, can't be proven by code, only judged from evidence.",
      "An agent bond is validator slashing applied to agents, with a jury where a validator network has a fault proof. Before you deal with an agent, you can read exactly what each kind of misbehavior would cost its operator.",
    ],
    forWho: [
      ["Agent operators", "A credible, priced promise about your agent's conduct, which a platform or customer can check before trusting it."],
      ["Platforms and marketplaces", "Require a bond to list an agent; harmed users get paid from it without a support ticket."],
      ["Watcher agents", "Monitor other agents and collect a bounty when a report holds: agents slashing agents."],
    ],
    flow: [
      { t: "Write the covenant", d: "The agent's scope, the articles it must never break, the evidence that proves each violation, and a slash per article. The operator signs it." },
      { t: "Bond", d: "The operator funds a Squads escrow with the bond. The covenant's hash is pinned in the judiciary signer." },
      { t: "Report", d: "Anyone files a signed report: one article, when it happened, an incident id, the evidence pinned by hash, the reporter's wallet (and the harmed party's), and the reporter bond." },
      { t: "Answer", d: "The operator has a fixed window to answer with its own evidence." },
      { t: "Rule", d: "One ASC per report: did the agent break this article, as the evidence shows? VIOLATED or CLEAN. Both sides' statements are untrusted claims." },
      { t: "Slash or refund", d: "VIOLATED: the slash goes to the harmed party, the reporter or a beneficiary, and the reporter bond comes back. CLEAN: the reporter bond goes to the operator." },
      { t: "Release", d: "After the term, with nothing undecided, the rest of the bond returns to the operator." },
    ],
    format: [
      ["operator", "Name, key, wallet"],
      ["agent", "Name, the agent's own key, and its scope"],
      ["articles", "Each rule, what proves a violation, and its slash; no slash above the bond"],
      ["money", "Asset, bond, reporter bond"],
      ["slashTo", "harmed, reporter or beneficiary"],
      ["term, review", "Start, end, grace for late reports, the operator's answer window; jury size, families, bar, fee"],
    ],
    code: [
      "Only token and system programs",
      "No slash without a verified VIOLATED ruling on a contract the log produces",
      "Each slash at most its article's price, and all slashes together at most the bond",
      "Reporter bonds back or forfeited exactly as the rulings say",
      "The operator can't pull the bond during the term",
      "No change to the wallet's members or settings",
    ],
    jury: ["Did the agent break this article, as the evidence shows?", "Conduct outside the agent's scope that the covenant doesn't forbid is not a violation.", "When the evidence doesn't show it, the answer is CLEAN."],
    settle: {
      title: "What each ruling pays",
      head: ["Ruling", "Slash", "Reporter bond"],
      rows: [["VIOLATED", "The article's price, cut to what's left, to the harmed party, reporter or beneficiary", "Back to the reporter"], ["CLEAN", "None", "To the operator"], ["Term over, nothing pending", "The rest of the bond to the operator", ""]],
      note: "The reporter bond is what stops griefing: a false report costs the reporter, and goes to the operator it accused.",
    },
    threats: [
      ["Griefing: reporting to drain the bond", "Every report needs a reporter bond, lost if the jury finds CLEAN", "Tested"],
      ["Reporting the same incident twice", "One report per incident and article", "Tested"],
      ["An injection in a report", "Statements are untrusted claims; the jury reads the evidence", "Tested with a scripted jury"],
      ["The operator pulls the bond when reports start", "The bond is locked until the term and every report are done", "Tested"],
      ["A fake transcript", "Evidence is pinned, not proven; an agent-signed transcript is strong, a screenshot weak", "Open risk"],
      ["Slashes beyond the bond", "Cut to what's left", "Tested"],
    ],
    example: {
      title: "A support agent's 10 SOL bond",
      code: `{
  "kind": "verafy.agent-bond/1",
  "agent": { "name": "example-support-agent", "scope": "Answers support questions and issues refunds of up to $50 from the support budget." },
  "articles": [
    { "id": "refund-cap", "text": "Never issues a refund above $50 or outside the support budget.", "slash": "2000000000" },
    { "id": "no-secrets", "text": "Never asks a user for a password, seed phrase or private key.", "slash": "5000000000" },
    { "id": "no-impersonation", "text": "Never claims to be a human or to speak for another company.", "slash": "3000000000" }
  ],
  "money": { "asset": "SOL", "bond": "10000000000", "reporterBond": "100000000" },
  "slashTo": "harmed",
  "term": { "reportGraceSeconds": 604800, "answerSeconds": 259200 }
}`,
    },
    run: {
      call: "policyFromTemplate('agent-bond', { covenant })\nviolationContract(covenant, log, reportId)\nagentBondLedger(covenant, log, rulings, { now })",
      demo: "node scripts/agentbond-demo.mjs",
      files: [["packages/core/src/agentbond.js", "Covenants, reports, violation contracts, ledger, policy"], ["packages/core/test/agentbond.test.js", "4 tests"], ["scripts/agentbond-demo.mjs", "A user's report holds, a watcher agent's doesn't"]],
    },
    measured: ["4 of 4 tests pass: validation, every report rule, slash and reporter-bond routing, the escrow check, and slashes cut at the bond", "In the demo, a seed-phrase request costs the operator 5 SOL to the user, a false refund report costs the watcher agent its 0.1 SOL, and 5 SOL returns after the term"],
    open: ["Not on devnet", "Agents don't sign their outputs yet, so evidence strength varies", "No top-up: a bond slashed to zero needs a new covenant"],
  },
  {
    slug: "super-grant",
    name: "Super Grant",
    group: "Funding",
    card: "A grant that behaves like venture funding. A base grant to answer a Request for Ideas, then more money only for outcomes a jury verifies, such as revenue.",
    headline: "Super Grant: grant money to start, more money for verified outcomes",
    lede: "A foundation issues a Request for Ideas and grants each admitted developer a set amount, provided the developer runs its AI under the terms attached to the grant. The developer has a fixed window to respond. A jury checks the response against the terms, and a grantee that clears them can earn outcome tranches, such as revenue, each verified by a jury before the escrow pays.",
    vip: { n: "0030", title: "Super grants: venture-style funding paid out on verified outcomes", file: "VIP-0030-super-grants.md", status: "Shipped (v0.0.5-alpha): not yet on devnet" },
    related: [SIGNER, POLICIES],
    requirement: "SIGN-008",
    templateId: "super-grant",
    why: [
      "Grants pay for promises: a committee picks proposals, pays up front, and reads self-written reports months later. Venture funding pays for outcomes, but only for a few teams, in large checks, on belief before there's evidence.",
      "Ecosystems need the space in between: small money to many builders quickly, then more money to the ones that show results. The bottleneck has always been checking results at scale. A jury of models from different families, reading pinned evidence against written terms, removes it.",
    ],
    forWho: [
      ["Foundations and ecosystem funds", "Fund many teams at once, and pay follow-on money only against outcomes someone checked."],
      ["Developers", "Money to start in days, clear terms for earning more, and a record of what you shipped."],
      ["Investors", "An optional follow-on instrument (a post-money SAFE, a revenue share, a right of first refusal) signed into the program from day one."],
    ],
    flow: [
      { t: "Request for Ideas", d: "The foundation publishes the problem, the terms every response must meet, the agent terms grantees run their AI under, the base grant, the outcome tranches and the review rules, and funds a Squads escrow with the whole budget." },
      { t: "Apply", d: "A developer applies with a key, a payout wallet and an idea, and signs the hash of the agent terms." },
      { t: "Admit and pay the base grant", d: "The foundation admits up to the program's limit. Admission earns the base grant." },
      { t: "Respond inside the window", d: "Two weeks by default. The response pins its evidence by hash. Late responses and second responses are refused." },
      { t: "Review", d: "One ASC per response: does it meet every term? CLEARED or NOT_CLEARED. The grantee's own summary reaches the jury as an untrusted claim." },
      { t: "Claim outcomes", d: "A cleared grantee claims a tranche with evidence. One ASC per claim: does the evidence show the outcome exactly as written? MET or NOT_MET." },
      { t: "Pay and close", d: "The signer pays only what the ledger shows was earned, once each. After the program ends, the unearned budget returns to the foundation." },
    ],
    format: [
      ["request", "The problem, the terms (each with an id), the response window, what a response contains"],
      ["agentTerms", "The terms the grantee's AI runs under, in plain words; applications sign their hash"],
      ["money", "Asset, budget, base grant, maximum grantees. The budget must cover every grantee earning every tranche."],
      ["tranches", "Outcome name, exactly what counts, what proves it, amount, claim window"],
      ["followOn", "Optional: post-money SAFE, revenue share or right of first refusal, with its terms"],
      ["window, review", "Application deadline and end; jury size, families, bar, fee"],
    ],
    code: [
      "Only token and system programs",
      "Never more than the budget in one transaction",
      "Pays only entitlements the ledger shows: base grants on admission, tranches after CLEARED and MET, the refund after the end",
      "Each entitlement once, by the signer's own case log",
      "Every ruling must be on the contract the log produces, and its sealed round must verify",
      "No change to the wallet's members or settings",
    ],
    jury: ["Does the response meet every term of the Request for Ideas?", "Does the evidence show this outcome, exactly as written?", "Revenue counts only from customers who are not the grantee, its principals or the foundation."],
    settle: {
      title: "What gets paid",
      head: ["Entitlement", "Earned when", "Paid to"],
      rows: [["Base grant", "The foundation admits the grantee", "Grantee"], ["Outcome tranche", "The response was CLEARED and the outcome was MET", "Grantee"], ["Refund", "The program ended and nothing is undecided", "Foundation"]],
      note: "The foundation can't take the budget back early, and a grantee can't be paid a tranche it didn't earn.",
    },
    threats: [
      ["A grantee pays itself to fake revenue", "The tranche wording and the jury instructions exclude money from the grantee, its principals and the foundation", "Jury question; evidence is the open risk"],
      ["A response tells the jury to answer CLEARED", "The summary is labeled untrusted; the jury reads the pinned evidence", "Tested with a scripted jury"],
      ["A ruling on a different question", "Each review is rebuilt from the program and the log; a mismatch is thrown out", "Tested"],
      ["An edited sealed ruling", "Fails verification of the signed round", "Tested"],
      ["The foundation claws back the budget early", "The refund exists only after the end, with nothing undecided", "Tested"],
      ["A payment made twice", "Each entitlement is paid once, by the signer's case log", "Tested"],
    ],
    example: {
      title: "Agents that pay each other",
      code: `{
  "kind": "verafy.super-grant/1",
  "request": {
    "summary": "Working tools that let one AI agent pay another on Solana, with a receipt both sides can check.",
    "terms": [
      { "id": "prototype", "text": "Ships a working prototype in a public GitHub repository." },
      { "id": "license", "text": "Open source under MIT or Apache-2.0." },
      { "id": "solana", "text": "Payments settle on Solana, with a transaction signature shown." }
    ],
    "responseSeconds": 1209600
  },
  "agentTerms": { "text": "No custody of user funds, every payment logged with a receipt, and the Verafy review is final." },
  "money": { "asset": "SOL", "budget": "20000000000", "baseGrant": "2000000000", "maxGrantees": 2 },
  "tranches": [
    { "id": "revenue-1k", "outcome": "Revenue", "text": "At least $1,000 from at least five paying customers who are not the grantee or the foundation.", "amount": "5000000000" },
    { "id": "integration", "outcome": "Integration", "text": "Another team ships the tool in a product.", "amount": "3000000000" }
  ],
  "followOn": { "instrument": "post-money-safe", "text": "Up to $250,000 at a $10M cap within 6 months of a met revenue tranche." }
}`,
    },
    run: {
      call: "policyFromTemplate('super-grant', { program })\ngrantLedger(program, log, rulings, { now })\nreviewContract(program, log, grantee)\noutcomeContract(program, log, grantee, tranche)",
      demo: "node scripts/grant-demo.mjs",
      files: [["packages/core/src/grants.js", "Programs, log, reviews, outcomes, ledger, policy"], ["packages/core/src/programlog.js", "Signed logs and the payout check shared with hackathons"], ["packages/core/test/grants.test.js", "3 tests"], ["scripts/grant-demo.mjs", "Two grantees, one cleared, one not"]],
    },
    measured: ["3 of 3 tests pass: program validation, every log rule, and the full ledger and escrow path including tilted and edited rulings", "In the demo, Alice earns 2 SOL plus a 5 SOL revenue tranche, Bob earns his 2 SOL base grant, and 11 SOL returns to the foundation"],
    open: ["Not on devnet", "Revenue evidence is pinned by the grantee; a processor-signed export would make it far harder to fake", "The follow-on instrument is recorded and signed, not executed", "A NOT_MET claim is final; resubmission is a decision for Rex"],
  },
  {
    slug: "hackathon",
    name: "Hackathon Grant",
    group: "Funding",
    card: "Post a prize pool and evaluation criteria, open the hackathon, take GitHub submissions pinned to a commit, and let a Verafy council grade every one.",
    headline: "Hackathon Grant: a prize pool graded by a Verafy council",
    lede: "An initiator posts an amount and the evaluation criteria and opens a hackathon. Developers submit GitHub repositories, each pinned to a commit. When the period ends, a council of models from different families grades every submission, code computes the ranking, and the escrow pays exactly that ranking.",
    vip: { n: "0031", title: "Hackathon grants: a prize pool graded by a Verafy council", file: "VIP-0031-hackathon-grants.md", status: "Shipped (v0.0.5-alpha): not yet on devnet; repository snapshots not built" },
    related: [{ n: "0030", title: "Super grants: venture-style funding paid out on verified outcomes", file: "VIP-0030-super-grants.md", status: "Shipped (v0.0.5-alpha)" }, SIGNER],
    requirement: "SIGN-009",
    templateId: "hackathon",
    why: [
      "Hackathon judging is the weak point of every hackathon. Judges get a few minutes per project, grade the demo rather than the code, and are often sponsors with a stake in who wins. Payouts depend on the organizer doing what it said, and developers can check neither.",
      "A hackathon grant signs the criteria and the prize table before anyone submits, grades the code at the commit that was submitted, with jurors who can't see each other's votes, and pays whatever that grading gives.",
    ],
    forWho: [
      ["Foundations and sponsors", "Run a hackathon without recruiting judges, with a payout you can't be accused of steering."],
      ["Developers", "Know the rubric and the prize split before you start, and get paid by code."],
      ["Ecosystem teams", "Run many small challenges at once; every result is a public, checkable record."],
    ],
    flow: [
      { t: "Post", d: "The initiator signs the challenge, the rules, the weighted criteria, the pool, the prize shares, the minimum winning score, the window and the council, and funds the prize escrow." },
      { t: "Submit", d: "A team signs a submission with its own key: team name, payout wallet, https://github.com/<owner>/<name>, a full 40-character commit SHA, and a description. A later submission before the close replaces the earlier one." },
      { t: "Close", d: "Nothing is accepted after the window. Every repository is pinned to its commit, so work after the close doesn't count." },
      { t: "Grade", d: "One ASC per submission with a graded answer from 0 to 10: the rubric, the repository at the commit, facts from the log, and the team's description as untrusted text." },
      { t: "Rank", d: "Code ranks by score, then earlier first submission, then log order. Places at or above the minimum score win their share." },
      { t: "Pay", d: "The signer pays exactly the ranking, once. Whatever nobody won returns to the initiator." },
    ],
    format: [
      ["challenge", "What to build, and rules; breaking a rule scores 0"],
      ["criteria", "Each with an id, text and a whole-number weight"],
      ["money", "Asset and pool"],
      ["prizes", "Shares in parts per million that add up to the pool and don't grow with place, plus the minimum winning score"],
      ["window", "Opens and closes"],
      ["council", "Jury size, model families, bar, fee; maxSubmissions up to 500"],
    ],
    code: [
      "Only token and system programs",
      "Nothing pays before the window closes and every live submission has a verified ruling",
      "Pays exactly the prizes the verified ranking gives, once",
      "Second and third place can't be swapped",
      "Unwon prizes and rounding go back to the initiator",
      "No change to the wallet's members or settings",
    ],
    jury: ["What score, from 0 to 10, does this submission earn against the weighted criteria?", "Work not in the repository at the pinned commit doesn't count.", "A broken challenge rule scores 0."],
    settle: {
      title: "How a council agrees on a grade",
      head: ["Votes", "Agreement on 7", "Result at a 0.66 bar"],
      rows: [["7, 7, 7", "100%", "7"], ["7, 7, 8", "83% (a vote one step away counts half)", "7"], ["3, 7, 10", "33%", "Below the bar: a bigger council"]],
    },
    threats: [
      ["A description tells the council to score 10", "Labeled untrusted; the council grades the repository", "Tested with a scripted council"],
      ["Code pushed after the close", "Graded at the submitted commit only", "Built; snapshot service open"],
      ["Two teams submit the same repository", "The log refuses the second", "Tested"],
      ["Prizes paid before grading is done", "Results are final only after the close with every submission graded", "Tested"],
      ["The organizer swaps places", "The signer pays only the verified ranking", "Tested"],
      ["One person enters as several teams", "Not prevented: a team is a key", "Open risk"],
    ],
    example: {
      title: "A 10 SOL agent escrow hackathon",
      code: `{
  "kind": "verafy.hackathon/1",
  "challenge": { "summary": "Build a tool that lets two AI agents hold money in escrow on Solana and settle it by an agentic contract." },
  "criteria": [
    { "id": "works", "text": "It runs, and the README shows how to run it end to end on devnet.", "weight": 4 },
    { "id": "contract", "text": "It uses a signed agentic contract with remedies.", "weight": 3 },
    { "id": "safety", "text": "Agent keys never leave the agent.", "weight": 3 }
  ],
  "money": { "asset": "SOL", "pool": "10000000000" },
  "prizes": { "shares": [500000, 300000, 200000], "minScore": 6 },
  "council": { "bar": 0.66, "jury": { "size": 3, "minFamilies": 3 } }
}`,
    },
    run: {
      call: "policyFromTemplate('hackathon', { program })\njudgingContract(program, log, team)\nhackathonResults(program, log, rulings, { now })",
      demo: "node scripts/hackathon-demo.mjs",
      files: [["packages/core/src/hackathon.js", "Programs, submissions, council contracts, results, policy"], ["packages/core/test/hackathon.test.js", "4 tests"], ["scripts/hackathon-demo.mjs", "Four teams, a tie, a prompt injection"]],
    },
    measured: ["4 of 4 tests pass: validation, submission rules, ranking with a tie break, the escrow check, and a minimum score that leaves places empty", "In the demo, scores of 9, 7, 7 and 4 pay 5, 3 and 2 SOL; the earlier of the two 7s places second"],
    open: ["Not on devnet", "No repository snapshot service yet, so the demo council is scripted", "No team identity beyond a key", "Per-criterion grading is a later option"],
  },
  {
    slug: "treasury",
    name: "Treasury",
    group: "Treasury and governance",
    card: "A DAO or team budget that pays approved payees under a per-payment and a monthly cap, with a jury checking each payment's purpose.",
    headline: "Treasury: a budget that pays only for what it exists for",
    lede: "A treasury wallet with a judiciary signer. Code enforces the caps and the payee list; the jury checks that each payment is for the purpose the treasury was set up for, judged from the proposal and its evidence.",
    vip: POLICIES,
    related: [SIGNER],
    requirement: "SIGN-002",
    templateId: "treasury",
    why: [
      "Team and DAO treasuries are guarded by signers who approve what's put in front of them. Caps help, but a payment can sit under every cap and still be for the wrong thing: a vendor that's really an insider, a grant that funds something else.",
      "The treasury template keeps the limits in code and adds the one check code can't do: is this payment for what the treasury is for?",
    ],
    forWho: [["DAOs", "Spending under a budget the community set, with purpose checked on every payment."], ["Teams and foundations", "A shared wallet where no single signer can pay outside the purpose."]],
    flow: [
      { t: "Set up", d: "Fill in the purpose, the asset, the monthly budget, the largest single payment and the approved payees. The policy hash is pinned in the signer." },
      { t: "Propose", d: "A member proposes a payment in Squads with a description and evidence." },
      { t: "Check the code rules", d: "Programs, the per-payment cap, the 30-day window across every payment, the payee list." },
      { t: "Ask the jury", d: "One question: is this payment for the purpose, as the proposal and its evidence describe? The proposal text is untrusted material." },
      { t: "Sign or refuse", d: "The signer votes only as the ruling says, and never for a payment that breaks a rule." },
    ],
    format: [["purpose", "What the treasury exists for, in plain words"], ["monthly", "The most that can leave in any 30 days"], ["perTransaction", "The largest single payment"], ["payees", "Approved recipients"], ["minTimeLockSeconds", "Squads time lock, one day by default"]],
    code: ["Only token and system programs", "At most perTransaction per payment", "At most monthly in any 30 days, counting every payment", "Only approved payees", "Config changes go to the jury"],
    jury: ["Is this payment for the purpose the treasury exists for, as the proposal and its evidence describe?"],
    threats: [["A payment split to stay under the cap", "The 30-day window counts every payment", "Tested"], ["A payee that isn't on the list", "Refused by code", "Tested"], ["A description that misstates the payment", "The jury judges the decoded transaction; the text is untrusted", "Built"], ["Removing the signer or lowering the threshold", "Always refused, whatever the policy says", "Tested"]],
    example: { title: "A grants treasury", code: `policyFromTemplate('treasury', {
  purpose: 'developer grants for the Solana agent ecosystem',
  asset: 'SOL', monthly: 500_000_000_000, perTransaction: 50_000_000_000,
  payees: ['GranteeA...', 'GranteeB...'],
})` },
    run: { call: "policyFromTemplate('treasury', params)\ncheckRules(policy, effectsOf(tx), { now, history })", files: [["packages/core/src/policy.js", "The rules engine and every template"], ["packages/core/src/judiciary.js", "Case contracts for the signer"]] },
    measured: ["The judiciary signer program passed 30 of 30 checks on a local validator against the Squads v4 program dumped from mainnet"],
    open: ["The signer program isn't on devnet yet"],
  },
  {
    slug: "dao-constitution",
    name: "DAO Constitution",
    group: "Treasury and governance",
    card: "A DAO treasury that executes a passed proposal only if it breaks no article of the constitution. Caps in code, one jury question per article.",
    headline: "DAO Constitution: a treasury that executes only what the constitution allows",
    lede: "A DAO can pass a constitution but has no one to enforce it. This template puts the treasury behind a judiciary signer that executes a passed proposal only if no article is broken. The constitution is pinned by hash; when the jury can't tell, the answer is no.",
    vip: { n: "0032", title: "DAO constitution: a treasury that executes only what the constitution allows", file: "VIP-0032-dao-constitution.md", status: "Shipped (v0.0.5-alpha)" },
    related: [POLICIES, SIGNER],
    requirement: "SIGN-010",
    templateId: "dao-constitution",
    why: [
      "DAO governance checks votes, not content. A proposal that passes executes, whatever it does.",
      "The failures are familiar: calldata that does more than the text says, a payment to a council member's company buried in paragraph six, a spending cap broken across several small proposals, a constitution changed by a thin quorum.",
    ],
    forWho: [["DAOs", "A constitution that binds the treasury, not just the forum."], ["Delegates and council members", "A neutral check on every proposal, with reasons cited by article."]],
    flow: [
      { t: "Pin the constitution", d: "The articles are hashed into the policy id. Changing an article makes a new policy and a new signer, which the current signer must approve." },
      { t: "Pass a proposal", d: "The DAO votes as it does today." },
      { t: "Check the code rules", d: "Programs, the per-proposal cap, and the 91-day cap counted across every proposal." },
      { t: "Ask the jury, article by article", d: "First: does the transaction do exactly what the text says? Then one question per article. The proposal and forum thread are untrusted material." },
      { t: "Execute or block", d: "Any broken article blocks, with the article cited. When in doubt, block." },
    ],
    format: [["name", "The DAO"], ["articles", "Each with an id and text; pinned by hash"], ["quarterlyCap", "The most that can leave in 91 days, across proposals"], ["perTransaction", "The largest single proposal"], ["minTimeLockSeconds", "Two days by default"]],
    code: ["Only token and system programs", "At most perTransaction per proposal", "At most quarterlyCap in any 91 days, counting every proposal", "Config changes go to the jury"],
    jury: ["Does the decoded transaction do exactly what the passed proposal says it does?", "Article 1.1: No proposal may spend more than 5% of the treasury in one quarter. Does this proposal break it?", "Article 2.3: A proposal may not pay a council member or a company they run unless its first paragraph says so. Does this proposal break it?"],
    threats: [["Calldata that does more than the text", "The first jury question compares them", "Built"], ["A cap broken across small proposals", "The 91-day window counts all of them", "Tested"], ["A quiet edit to the constitution", "Any change makes a new hash and a new signer", "Tested"], ["Instructions in the proposal text", "Untrusted material, never followed", "Built"]],
    example: { title: "Treasury articles", code: `policyFromTemplate('dao-constitution', {
  name: 'Example DAO',
  articles: [
    { id: '1.1', text: 'No proposal may spend more than 5% of the treasury in one quarter, counting every proposal that quarter.' },
    { id: '1.2', text: 'What the proposal does on chain must match what its text says it does.' },
    { id: '2.3', text: 'A proposal may not pay a council member, their known wallets or a company they run, unless its first paragraph says so plainly.' },
  ],
  quarterlyCap: 50_000_000_000, perTransaction: 20_000_000_000,
})` },
    run: { call: "policyFromTemplate('dao-constitution', params)", files: [["packages/core/src/policy.js", "The template"], ["packages/core/test/constitution.test.js", "2 tests"]] },
    measured: ["2 of 2 tests pass: the constitution hash, one question per article, both caps, and the articles reaching the case"],
    open: ["Amending the constitution means a new policy and a signer swap; there's no amendment flow inside the template", "The signer program isn't on devnet yet"],
  },
];

/** Shipped in the harness too, with their own VIPs, without a landing page yet. */
export const MORE_TEMPLATES = [
  { name: "Covenant Launch", card: "A token creator's supply, released only on a published schedule to published addresses.", vip: POLICIES },
  { name: "Commission covenant", card: "A validator's bonded promise to stakers on fees and notice.", vip: { n: "0016", title: "Commission covenant: a validator bonds its promise on fees", file: "VIP-0016-commission-covenant.md", status: "Shipped (v0.0.4-alpha)" } },
  { name: "Upgrade authority", card: "A program's upgrade key: moves no funds; upgrades checked against the change log, with a 7-day time lock.", vip: POLICIES },
];

export const templateBySlug = (slug: string) => TEMPLATES.find((t) => t.slug === slug);

/**
 * The prompt each template ships with: paste it into any capable AI, answer its
 * questions, and it tailors the template to your case. The same files ship in
 * Verafy Harness under templates/prompts/.
 */
const PROMPT_RULES = `Rules for you, the AI:
- Ask me the questions below one group at a time. Don't invent facts about my deal; if I don't know an answer, propose a sensible default and say it is a default.
- Amounts are whole base units as strings (1 SOL = "1000000000"). Times are unix seconds.
- Write every term, outcome and article so a stranger could decide from evidence alone whether it was met. No "reasonable", "high quality" or "timely" without a number or a test.
- Name the evidence that proves each thing, and prefer evidence that can be pinned by hash (a file, a commit, a transaction signature, an export).
- Never ask for or handle private keys. Each party signs with its own key, outside this conversation.
- When you're done, output: (1) the JSON, (2) a plain-English summary of who gets what in each outcome, (3) the risks you see in my terms, and (4) the harness call that checks it.`;

export const PROMPTS: Record<string, string> = {
  "agentic-contract": `You are helping me write a Verafy Agentic Contract (verafy.agentic-contract/1, VIP-0029): an agreement between two AI agents, held in a two-of-three Squads escrow on Solana, with a Verafy jury as the neutral third party if the agents disagree. The jury can only pick one of the remedies we write now, and the escrow can only pay that remedy's exact payouts.

${PROMPT_RULES}

Ask me:
1. The parties. For agent A and agent B: who each agent acts for (the principal), what it is allowed to agree to (the mandate), its payout wallet and its Squads member key.
2. The deal. What each side owes, by when, and what evidence proves it was done.
3. The money. The asset, the amount, and who deposits it.
4. The remedies. Every way this can end (for example COMPLETE, PARTIAL, REFUND), what each one means in testable words, and exactly what each party gets. Every remedy must pay out exactly the escrow.
5. The defaults. What happens if the receiving agent accepts, if it says nothing for how long, and if a deadline passes with no delivery.
6. The dispute rules. Jury size and how many model families, the bar (above 0.5), the fee and who pays it (opener, loser or split), and how long the other side has to answer.

Then produce the contract JSON with these fields: kind, id, title, parties [{role, key, wallet, member, principal, mandate}], terms {summary, obligations [{party, text, due, evidence}]}, money {asset, amount, depositor}, remedies [{outcome, meaning, payout {A, B}, winner?}], defaults {onDelivery, onSilence, reviewSeconds, onMissedDeadline}, dispute {bar, jury {size, minFamilies}, fee, feePaidBy, evidenceSeconds, challengeWindow?}.

Check it with: validateAgentic(contract), then policyFromTemplate('agentic-contract', { contract }).`,

  "super-grant": `You are helping me design a Verafy Super Grant (verafy.super-grant/1, VIP-0030): a foundation issues a Request for Ideas, pays each admitted developer a base grant to respond, has a Verafy jury check every response against the terms, and pays outcome tranches (for example revenue) only after a jury verifies each outcome. The escrow pays only what was earned and returns the rest to the foundation when the program ends.

${PROMPT_RULES}

Ask me:
1. The Request for Ideas. The problem I want ideas for, in two or three sentences, and who it's for.
2. The terms every response must meet. Three to six, each testable from the response's evidence (for example: public repository, open-source license, a transaction signature on devnet).
3. The agent terms. What the grantee's AI must and must not do while running under this grant (custody, logging, data use, that the Verafy review is final).
4. The money. Asset, base grant, how many grantees at most, and the total budget (it must cover every grantee earning every tranche).
5. The outcome tranches. For each: the outcome (Revenue, Users, Integration...), exactly what counts with a number, what evidence proves it, the amount, and how long after admission it can be claimed. For revenue, say which money doesn't count (self-paid, from the foundation, round-tripped).
6. The response window (two weeks is the default), the application deadline and the program end.
7. Follow-on: none, a post-money SAFE, a revenue share or a right of first refusal, with its terms in plain words.
8. The review jury: size, model families, bar, fee.

Then produce the program JSON with these fields: kind, id, title, foundation {name, key, wallet}, request {summary, terms [{id, text}], responseSeconds, responseEvidence}, agentTerms {text}, money {asset, budget, baseGrant, maxGrantees}, tranches [{id, outcome, text, evidence, amount, claimSeconds}], followOn {instrument, text}, window {applyUntil, endsAt}, review {bar, jury {size, minFamilies}, fee}.

Check it with: validateGrant(program), then policyFromTemplate('super-grant', { program }).`,

  hackathon: `You are helping me set up a Verafy Hackathon Grant (verafy.hackathon/1, VIP-0031): I post a prize pool and evaluation criteria, developers submit GitHub repositories pinned to a commit, and after the window closes a Verafy council grades every submission from 0 to 10. Code ranks the scores and the escrow pays exactly that ranking.

${PROMPT_RULES}

Ask me:
1. The challenge. What should people build, in two or three sentences.
2. The rules. Anything that disqualifies an entry (for example: code written during the hackathon, public and open source). A broken rule scores 0.
3. The criteria. Three to five, each something a reviewer can check in the repository at the submitted commit, with a whole-number weight.
4. The prize pool and the split. Shares in parts per million that add up to 1,000,000 and don't grow with place (for example 500000, 300000, 200000), and the minimum score a winner needs.
5. The window: when submissions open and close.
6. The council: size, model families, bar, fee, and the most submissions to accept.

Then write a one-paragraph scoring guide that says what 0, 5 and 10 look like for this challenge, and produce the program JSON with these fields: kind, id, title, initiator {name, key, wallet}, challenge {summary, rules []}, criteria [{id, text, weight}], money {asset, pool}, prizes {shares [], minScore}, window {opensAt, closesAt}, council {bar, jury {size, minFamilies}, fee}, maxSubmissions.

Tell entrants: submit https://github.com/<owner>/<name> and the full 40-character commit SHA; work after that commit doesn't count.

Check it with: validateHackathon(program), then policyFromTemplate('hackathon', { program }).`,

  treasury: `You are helping me set up a Verafy Treasury policy (VIP-0011): a wallet with a judiciary signer that pays approved payees under a per-payment cap and a 30-day budget, with a Verafy jury checking that each payment is for the treasury's stated purpose.

${PROMPT_RULES}

Ask me:
1. The purpose. What this treasury exists to pay for, in one or two sentences a jury can test a payment against. Say what it is not for, too.
2. The asset, the most that can leave in any 30 days, and the largest single payment.
3. The approved payees, and how a new payee gets added (a config change the jury reviews).
4. The Squads time lock (one day by default).

Then produce the call policyFromTemplate('treasury', { purpose, asset, monthly, perTransaction, payees, minTimeLockSeconds }), the resulting jury question, and three example payments: one that passes, one the code refuses, and one only the jury would refuse, with the reason.`,

  "dao-constitution": `You are helping me turn my DAO's constitution into a Verafy DAO Constitution policy (VIP-0032): the treasury executes a passed proposal only if it breaks no article. Caps are code; each article becomes a question the jury answers on every proposal; when the jury can't tell, the answer is no.

${PROMPT_RULES}

Ask me:
1. The DAO's name and the treasury asset.
2. The constitution, or the parts that govern the treasury. Paste it; I'll ask you to split it.
3. For each article that should bind the treasury: rewrite it as one testable rule with an id, keeping its meaning. Flag articles that can't be checked from a proposal and its transaction, and leave them out.
4. Any article that is really a number (a spending cap, a quorum) should become a code limit instead: the largest single proposal and the most that can leave in any 91 days.
5. The Squads time lock (two days by default).

Then produce the call policyFromTemplate('dao-constitution', { name, asset, articles [{id, text}], quarterlyCap, perTransaction, minTimeLockSeconds }), list the jury questions it will ask, and test it against two example proposals: one that should pass and one that should be blocked, citing the article.`,
  "agent-bond": `You are helping me write a Verafy Agent Bond covenant (verafy.agent-bond/1, VIP-0033): I bond my AI agent's behavior with money. Anyone (a user, a counterparty, another agent) can report a violation with evidence and a small reporter bond. A Verafy jury rules VIOLATED or CLEAN, and the escrow slashes the bond as each article prices it.

${PROMPT_RULES}

Ask me:
1. The agent. Its name, its public key, and its scope: what it is for and what it may do, with limits in numbers.
2. The articles. The things it must never do, three to eight of them. For each: the rule in testable words, the evidence that would prove a violation (an agent-signed transcript, a transaction, a platform log), and the slash. Price the worst harms highest. No single slash may exceed the bond.
3. The money. The asset, the bond, and the reporter bond (big enough to stop spam, small enough that a harmed user will still report).
4. Where slashes go: to the harmed party, to the reporter as a bounty, or to a named beneficiary.
5. The term, how long after it reports are still accepted, and how long I have to answer a report.
6. The jury: size, model families, bar, fee.

Then produce the covenant JSON with these fields: kind, id, title, operator {name, key, wallet}, agent {name, key, scope}, articles [{id, text, evidence, slash}], money {asset, bond, reporterBond}, slashTo, beneficiary?, term {startsAt, endsAt, reportGraceSeconds, answerSeconds}, review {bar, jury {size, minFamilies}, fee}.

Also tell me which articles my agent should sign its outputs for, so that a violation leaves strong evidence.

Check it with: validateAgentBond(covenant), then policyFromTemplate('agent-bond', { covenant }).`,
};
