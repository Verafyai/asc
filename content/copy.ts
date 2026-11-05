/** Final copy for the ASC run (/inscribed). Do not add prose on that page. */

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

export function proseWords(parts: string[]): number {
  const text = parts.join(" ").replace(/[`*_#]/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}
