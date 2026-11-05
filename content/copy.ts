/** Final copy for Home, the ASC run and the Proposal. Do not add prose on those pages. */

export const HOME = {
  eyebrow: "Verafy · alpha · play money, no token",
  headline: "Smart contracts you can write in English",
  subhead:
    "An actually smart contract (ASC) is rules in plain language, inscribed on Solana. An AI jury reads them, votes, and signs. The contract acts only when enough jurors agree.",
  primary: "See it run",
  secondary: "Read the proposal",
  ruleLabel: "Rule",
  rule: "Never send more than $1,000,000 to a wallet not registered to the exchange.",
  okTitle: "$250,000 to a registered wallet",
  okResult: "5 of 5 jurors allow · paid",
  noTitle: "$6,000,000,000 to an unknown wallet",
  noResult: "0 of 5 allow · refused, held for review",
  exampleNote: "Real run on a local Solana validator · verdicts scripted from the rules",
  problemTitle: "Smart contracts can't use judgment",
  problem:
    "Today's smart contracts do exactly what their code says. They can't follow \"never pay an unknown wallet more than $1 million\" unless someone turned that into code first.",
  ideaTitle: "Write the rule. Let an AI jury enforce it.",
  steps: [
    ["Write", "A policy, a rule set, or a prompt, in any language."],
    ["Compile and check", "One model writes a loop-free step list, another hunts loopholes, a person signs off."],
    ["Inscribe", "The steps go on Solana with IQ Labs code-in and can't change."],
    ["Call it", "Send a request and pay for the check."],
    ["The jury votes", "Models from different labs each sign from their own wallet."],
    ["Act or refuse", "Only when enough votes agree."],
  ] as const,
  waysTitle: "Two ways to use it",
  wayATitle: "Run an ASC on its own",
  wayATag: "Built on a local validator.",
  wayA: "The ASC is the contract: rules in, ruling out, payment on quorum.",
  wayBTitle: "Guard a contract you already have",
  wayBTag: "Design only.",
  wayB: "Your program calls requestRuling() before a risky action. The jury checks your inscribed policy first.",
  proofTitle: "Recorded runs, failures included",
  proofLine: "Every row is a real recorded run with real model calls, except where marked.",
  trustTitle: "Models vote. Code pays.",
  trust: [
    ["Bounded", "Jurors pick only listed outcomes. Caps in code limit any payout."],
    ["Signed", "Every vote is signed and stored with the evidence it saw."],
    ["Checked twice", "A dispute goes to a second jury from other model families."],
    ["Next", "Proof of which model answered. Anthropic's FlashProve shows it for one open model. Not used here."],
  ] as const,
  nextTitle: "Where this goes",
  next: [
    ["Private ASCs", "Rules encrypted so only the jury can read them."],
    ["EVM chains", "Sepolia, Monad and Robinhood Chain. Ethereum mainnet isn't deployed."],
    ["Paid jurors anywhere", "Anyone can run a juror and be paid per ruling."],
  ] as const,
  nextNote: "IQ Labs can do the first two today. None of the three is built yet.",
  limitsTitle: "What it can't do yet",
  limitsLink: "Full limits",
} as const;

export const INSCRIBED = {
  eyebrow: "ASC run · inscribed on Solana with IQ Labs code-in",
  tag: "real, local validator",
  headline: "One rule set, two withdrawals, one refused",
  subhead: "We wrote an exchange hot wallet's withdrawal rules in English, inscribed them on Solana, and asked five AI jurors to check two withdrawals.",
  rulesTitle: "The rules",
  rulesNote: "Hypothetical, written for this demo. Not used or endorsed by any exchange.",
  happenedTitle: "What happened",
  happenedNote: "Signatures, inscription and transfer are real on a local validator. The jurors' verdicts were scripted from the rules for this run; no model calls were made.",
  howTitle: "How it ran",
  how: [
    "The English rules were compiled into 7 loop-free steps.",
    "The steps were inscribed on Solana with IQ Labs and read back byte for byte.",
    "Each withdrawal was checked by five jurors, each signing from its own wallet.",
    "The payout transaction checked every signature; an altered signature made the whole transaction fail.",
  ],
  dataTitle: "The data",
} as const;

export const PROPOSAL = {
  eyebrow: "Proposal",
  tag: "design only",
  outline: "EIP and SIMD style outline",
  headline: "requestRuling(): ask an AI jury before any contract call",
  subhead:
    "Before a Solidity or Solana program does something risky, it asks a jury to rule on the action against a published ASC. Independent models vote and sign. The contract checks the signed ruling with verifyRuling and runs the action only on allow.",
  diagram: "withdraw() → requestRuling(asc, action, jury) → jury votes → verifyRuling → allow: runs, else: revert",
  whyTitle: "1. Why",
  why: "Most losses come from actions the authors would never have allowed in plain words. Writing those words down, and having independent models check each risky call against them, catches what the code missed. A hypothetical $6B withdrawal to an unknown wallet gets no allow votes, so the call reverts.",
  ifaceTitle: "2. The interface",
  solana: "Solana: verify_ruling(&asc, &action, &instructions) -> Outcome. The juror signatures ride in the same transaction (Ed25519 precompile). It fails if the ASC id, action hash, juror keys or quorum don't match.",
  evm: "EVM: requestRuling(ascId, action, jury) emits an event; then verifyRuling(requestId, attestations) returns the outcome. Two steps, because a contract can't wait for models.",
  caps: "Hard caps stay in the contract's own code. The jury can only pick a listed outcome.",
  storeTitle: "3. How the ASC is stored",
  storeStatus: "Status: inscribing and reading back is built; referencing it from an EVM contract isn't.",
  signTitle: "4. What the contract receives",
  signLine: "Each juror signs from its own wallet. The attestations field carries the signed votes, ready to pass to verify_ruling or verifyRuling.",
  failTitle: "5. When it fails",
  fail: [
    "Timeout: the ASC's default outcome, never allow.",
    "Disagreement: a second jury.",
    "Bad signature: the transaction fails.",
    "Compromised juror key: limited by quorum and hard caps.",
  ],
  limitsTitle: "6. Limits",
  limits: [
    "Seconds to a minute and a small model cost, so wrap only risky calls.",
    "Models can be fooled by poisoned evidence.",
    "Solana transaction size limits a single transaction to about 6 or 7 juror signatures.",
  ],
} as const;

export function proseWords(parts: string[]): number {
  const text = parts.join(" ").replace(/[`*_#]/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}
