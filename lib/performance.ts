/**
 * Every figure on /performance is computed from data/performance-model.json.
 * Costs are costs, not credit prices.
 */
import model from "@/data/performance-model.json";

export type ModelFile = typeof model;
export type Tier = "budget" | "flagship" | "maverick";

const prices = model.model_prices_usd_per_token as unknown as Record<string, [number, number]>;

export function tokenCost(modelId: string, input: number, output: number): number {
  const row = prices[modelId];
  if (!row) throw new Error(`No price for ${modelId}`);
  return input * row[0] + output * row[1];
}

export function juryIds(tier: Tier, jurors: number): string[] {
  if (tier === "budget") {
    const base = model.juries.budget;
    return Array.from({ length: jurors }, (_, i) => base[i % base.length]);
  }
  if (tier === "maverick") {
    const id = model.juries.proven_today[0];
    return Array.from({ length: jurors }, () => id);
  }
  // Flagship is not a recorded jury. Price every seat as the highest priced model in the file.
  const flagship = Object.entries(prices).sort((a, b) => b[1][0] + b[1][1] - (a[1][0] + a[1][1]))[0][0];
  return Array.from({ length: jurors }, () => flagship);
}

export function rulingCost(tier: Tier, jurors: number, input: number, output: number): number {
  return juryIds(tier, jurors).reduce((sum, id) => sum + tokenCost(id, input, output), 0);
}

export function compileCost(): { usd: number; modelId: string; calls: number } {
  const c = model.inputs.compile_tokens;
  return { usd: c.calls * tokenCost(c.model, c.input, c.output), modelId: c.model, calls: c.calls };
}

export function solTxUsd(signatures: number, solUsd = model.inputs.sol_usd): number {
  return (signatures * model.inputs.lamports_per_signature * solUsd) / 1_000_000_000;
}

/** Hot-wallet inscription is 1,909 bytes, which IQ places in the multi-transaction tier. The model does not store a tx count; 3 matches the published tier for that size (SITE_SPEC) and is passed in by the page from that spec constant kept next to the byte count. */
export function inscriptionBaseFeeUsd(transactions: number, solUsd?: number): number {
  return solTxUsd(transactions, solUsd);
}

export function proofSecondsPerContext(contextTokens: number): number {
  return contextTokens / model.inputs.flashprove.proving_tokens_per_sec_per_h100;
}

export function gpuHour(which: "low" | "typical"): number {
  return model.inputs.h100_usd_per_hour[which];
}

export function proveCostUsd(proofs: number, contextTokens: number, gpuPerHour: number): number {
  const hours = (proofs * proofSecondsPerContext(contextTokens)) / 3600;
  return hours * gpuPerHour;
}

export function verifyCostUsd(proofs: number): number {
  const hours = (proofs * model.inputs.flashprove.verify_seconds_24_threads) / 3600;
  return hours * model.inputs.cpu24_usd_per_hour;
}

export function proofsForRuling(jurors: number, tokensPerJuror: number): number {
  const cap = model.inputs.flashprove.max_context_tokens;
  const chunks = Math.ceil(tokensPerJuror / cap);
  return chunks * jurors;
}

export function hardwareMonthUsd(gpuPerHour: number): number {
  return gpuPerHour * 730;
}

export function certifyReviewCost(rules: number, jurors: number, tier: Tier): number {
  const t = model.inputs.certify_tokens_per_rule;
  return rules * rulingCost(tier, jurors, t.input, t.output);
}

export function certifyProofCount(rules: number, jurors: number): number {
  const t = model.inputs.certify_tokens_per_rule;
  return proofsForRuling(jurors, t.input + t.output) * rules / jurors * jurors;
}

/** chunks per juror per rule, times rules, times jurors. */
export function certifyProofs(rules: number, jurors: number): number {
  const t = model.inputs.certify_tokens_per_rule;
  const chunks = Math.ceil((t.input + t.output) / model.inputs.flashprove.max_context_tokens);
  return chunks * rules * jurors;
}

export interface Headlines {
  asOf: string;
  priceSource: string;
  rulingUsd: number;
  rulingMeasured: [number, number];
  rulingSeconds: [number, number];
  proveExtraUsd: number;
  certifyUsd: number;
  compileUsd: number;
  inscribeBaseUsd: number;
  payoutUsd: number;
  maverickRulingUsd: number;
  proveLowUsd: number;
  proveHighUsd: number;
  verifyUsd: number;
  proofMb: number;
  proofsStorageMb: number;
  batchRequests: number;
  batchSeconds: number;
  proofSeconds: number;
  verifySeconds: number;
  overheadTypical: number;
  overheadHeaviest: number;
  hardwareLowMonth: number;
  hardwareHighMonth: number;
  certifyProveLow: number;
  certifyProveHigh: number;
  certifyVerify: number;
  certifyGpuMinutes: number;
  certifyProofs: number;
  inscriptionBytes: number;
  inscriptionTxs: number;
}

const INSCRIPTION_TXS = 3;

export function headlines(): Headlines {
  const input = model.inputs.ruling_tokens.input;
  const output = model.inputs.ruling_tokens.output;
  const jurors = model.inputs.jurors;
  const proveLow = proveCostUsd(jurors, model.inputs.flashprove.max_context_tokens, gpuHour("low"));
  const proveHigh = proveCostUsd(jurors, model.inputs.flashprove.max_context_tokens, gpuHour("typical"));
  const verify = verifyCostUsd(jurors);
  const rules = model.inputs.certify_rules;
  const cProofs = certifyProofs(rules, jurors);
  const cProveLow = proveCostUsd(cProofs, model.inputs.flashprove.max_context_tokens, gpuHour("low"));
  const cProveHigh = proveCostUsd(cProofs, model.inputs.flashprove.max_context_tokens, gpuHour("typical"));
  const gpuMinutes = (cProofs * proofSecondsPerContext(model.inputs.flashprove.max_context_tokens)) / 60;
  return {
    asOf: model.asOf,
    priceSource: model.model_prices_usd_per_token._source,
    rulingUsd: rulingCost("budget", jurors, input, output),
    rulingMeasured: model.measured.ruling_model_usd as [number, number],
    rulingSeconds: model.measured.ruling_seconds as [number, number],
    proveExtraUsd: proveLow + verify,
    certifyUsd: certifyReviewCost(rules, jurors, "budget"),
    compileUsd: compileCost().usd,
    inscribeBaseUsd: inscriptionBaseFeeUsd(INSCRIPTION_TXS),
    payoutUsd: solTxUsd(1),
    maverickRulingUsd: rulingCost("maverick", jurors, input, output),
    proveLowUsd: proveLow,
    proveHighUsd: proveHigh,
    verifyUsd: verify,
    proofMb: model.inputs.flashprove.proof_mb,
    proofsStorageMb: model.inputs.flashprove.proof_mb * jurors,
    batchRequests: model.inputs.flashprove.batch_example.requests,
    batchSeconds: model.inputs.flashprove.batch_example.seconds,
    proofSeconds: proofSecondsPerContext(model.inputs.flashprove.max_context_tokens),
    verifySeconds: model.inputs.flashprove.verify_seconds_24_threads,
    overheadTypical: model.inputs.flashprove.overhead_vs_vllm.typical,
    overheadHeaviest: model.inputs.flashprove.overhead_vs_vllm.heaviest,
    hardwareLowMonth: hardwareMonthUsd(gpuHour("low")),
    hardwareHighMonth: hardwareMonthUsd(gpuHour("typical")),
    certifyProveLow: cProveLow,
    certifyProveHigh: cProveHigh,
    certifyVerify: verifyCostUsd(cProofs),
    certifyGpuMinutes: gpuMinutes,
    certifyProofs: cProofs,
    inscriptionBytes: model.measured.hot_wallet_inscription_bytes,
    inscriptionTxs: INSCRIPTION_TXS,
  };
}

export function usd(n: number): string {
  const abs = Math.abs(n);
  const digits = abs >= 100 ? 0 : abs >= 1 ? 2 : abs >= 0.01 ? 3 : 4;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function usdRange(a: number, b: number): string {
  return `${usd(a)} to ${usd(b)}`;
}

export interface CalcInput {
  jurors: number;
  tier: Tier;
  tokens: number;
  prove: boolean;
  gpuPerHour: number;
  solUsd: number;
  rulingsPerMonth: number;
  rules: number;
}

export interface CalcOutput {
  perRuling: number;
  perMonth: number;
  proveUsd: number;
  verifyUsd: number;
  rulingSeconds: [number, number];
  extraProofSeconds: number;
  certifyUsd: number;
  certifyProveUsd: number;
  certifyVerifyUsd: number;
  models: string[];
}

export function calculate(input: CalcInput): CalcOutput {
  const ratioIn = model.inputs.ruling_tokens.input / (model.inputs.ruling_tokens.input + model.inputs.ruling_tokens.output);
  const inputTokens = Math.round(input.tokens * ratioIn);
  const outputTokens = Math.max(0, input.tokens - inputTokens);
  const call = rulingCost(input.tier, input.jurors, inputTokens, outputTokens);
  const proofs = input.prove ? proofsForRuling(input.jurors, Math.min(input.tokens, model.inputs.flashprove.max_context_tokens) === input.tokens ? input.tokens : input.tokens) : 0;
  const proveUsd = input.prove ? proveCostUsd(proofsForRuling(input.jurors, input.tokens), Math.min(input.tokens, model.inputs.flashprove.max_context_tokens), input.gpuPerHour) : 0;
  const verifyUsd = input.prove ? verifyCostUsd(proofsForRuling(input.jurors, input.tokens)) : 0;
  const perRuling = call + proveUsd + verifyUsd + solTxUsd(1, input.solUsd);
  const cProofs = input.prove ? certifyProofs(input.rules, input.jurors) : 0;
  return {
    perRuling,
    perMonth: perRuling * input.rulingsPerMonth,
    proveUsd,
    verifyUsd,
    rulingSeconds: model.measured.ruling_seconds as [number, number],
    extraProofSeconds: input.prove ? proofSecondsPerContext(Math.min(input.tokens, model.inputs.flashprove.max_context_tokens)) * Math.ceil(input.tokens / model.inputs.flashprove.max_context_tokens) : 0,
    certifyUsd: certifyReviewCost(input.rules, input.jurors, input.tier === "maverick" ? "maverick" : input.tier === "flagship" ? "flagship" : "budget"),
    certifyProveUsd: input.prove ? proveCostUsd(cProofs, model.inputs.flashprove.max_context_tokens, input.gpuPerHour) : 0,
    certifyVerifyUsd: input.prove ? verifyCostUsd(cProofs) : 0,
    models: juryIds(input.tier, input.jurors),
  };
}

export { model as performanceModel, INSCRIPTION_TXS };
