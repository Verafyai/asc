import type { Operator } from "./types";

const op = (model: string, family: string, weights: Operator["weights"]): Operator => ({
  id: `op-${model.split("/")[1]}`,
  model,
  family,
  weights,
  identityProof: model === "meta-llama/llama-4-maverick" ? "FlashProve-supported family: proof not generated" : weights === "closed" ? "unproven provider attestation" : "open weights, hosted: unproven",
});

/** Committee A: six model families. Llama 4 Maverick is the one family FlashProve supports. */
export const SWARM_A: Operator[] = [
  op("openai/gpt-5-mini", "OpenAI", "closed"),
  op("anthropic/claude-haiku-4.5", "Anthropic", "closed"),
  op("google/gemini-2.5-flash", "Google", "closed"),
  op("qwen/qwen3-235b-a22b-2507", "Alibaba Qwen", "open"),
  op("deepseek/deepseek-v4-flash", "DeepSeek", "open"),
  op("meta-llama/llama-4-maverick", "Meta Llama", "open"),
];

/** Committee B, used for disputes: no family overlaps committee A. */
export const SWARM_B: Operator[] = [
  op("mistralai/mistral-small-3.2-24b-instruct", "Mistral", "open"),
  op("moonshotai/kimi-k2", "Moonshot", "open"),
  op("z-ai/glm-4.6", "Zhipu GLM", "open"),
  op("amazon/nova-lite-v1", "Amazon", "closed"),
];

export const COMPILER_MODEL = "anthropic/claude-haiku-4.5";
export const AUDITOR_MODEL = "openai/gpt-5-mini";
