/**
 * Credit prices. Placeholders until Rex sets them.
 * The Verafy credits API is not connected in this build (see lib/credits.ts).
 * Quotes are computed here. Nothing is charged and no free credits are granted.
 */
export const CREDITS_BACKEND = "stub" as const;

export const PRICING = {
  /** Real jury run with the base juror count. */
  realJuryRunCredits: 25,
  baseJurors: 5,
  extraJurorCredits: 5,
  /** Inscription: pass-through network cost plus this fraction. Pass-through is 0 until IQ publishes a Solana fee. */
  inscriptionMarkup: 0.1,
  /** Compile English to steps with a real model. Sandbox shows the quote and does not call a model. */
  compileCredits: 2,
  /**
   * Certify example from the spec: 12 rules and about 120 files is about 400 credits.
   * credits = round(400 * (rules/12) * (files/120)). Rex replaces this before launch.
   */
  certifyBaseCredits: 400,
  certifyBaseRules: 12,
  certifyBaseFiles: 120,
} as const;

export type PaidAction = "jury_run" | "inscription" | "certify" | "compile";

export function juryRunCredits(jurors: number): number {
  const extra = Math.max(0, jurors - PRICING.baseJurors);
  return PRICING.realJuryRunCredits + extra * PRICING.extraJurorCredits;
}

export function certifyCredits(rules: number, files: number): number {
  const rulesN = Math.max(1, rules);
  const filesN = Math.max(1, files);
  return Math.round(
    PRICING.certifyBaseCredits * (rulesN / PRICING.certifyBaseRules) * (filesN / PRICING.certifyBaseFiles),
  );
}

export function inscriptionCredits(passThroughCredits: number): number {
  return Math.ceil(passThroughCredits * (1 + PRICING.inscriptionMarkup));
}
