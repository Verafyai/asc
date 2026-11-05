import type { AgentDriver, RawReply, Role } from "../engine";

export const LIVE_MODELS: { wallet: string; model: string; family: string; size: string; role: Role; stake: number }[] = [
  // Slot leaders, in rotation order. They also vote when another model leads.
  { wallet: "gpt-5-mini", model: "openai/gpt-5-mini", family: "OpenAI", size: "small reasoning", role: "leader", stake: 30 },
  { wallet: "claude-haiku-4.5", model: "anthropic/claude-haiku-4.5", family: "Anthropic", size: "small", role: "leader", stake: 25 },
  { wallet: "gemini-2.5-flash", model: "google/gemini-2.5-flash", family: "Google", size: "mid", role: "leader", stake: 25 },
  { wallet: "qwen3-235b", model: "qwen/qwen3-235b-a22b-2507", family: "Alibaba Qwen", size: "large MoE", role: "leader", stake: 20 },
  // Auditor-only validators.
  { wallet: "deepseek-v4-flash", model: "deepseek/deepseek-v4-flash", family: "DeepSeek", size: "MoE", role: "auditor", stake: 20 },
  { wallet: "llama-3.3-70b", model: "meta-llama/llama-3.3-70b-instruct", family: "Meta Llama", size: "70B dense", role: "auditor", stake: 15 },
  { wallet: "mistral-small-3.2", model: "mistralai/mistral-small-3.2-24b-instruct", family: "Mistral", size: "24B", role: "auditor", stake: 10 },
  { wallet: "nova-micro", model: "amazon/nova-micro-v1", family: "Amazon Nova", size: "micro", role: "auditor", stake: 5 },
];

export async function callOpenRouter(apiKey: string, model: string, prompt: string, maxTokens: number, timeoutMs = 90_000): Promise<RawReply> {
  const t0 = Date.now();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: ac.signal,
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-Title": "Actually Smart Contracts demo" },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: maxTokens, temperature: 0.2, usage: { include: true } }),
    });
    const ms = Date.now() - t0;
    if (!res.ok) return { text: null, ms, error: `HTTP ${res.status}` };
    const j = await res.json();
    const text = j?.choices?.[0]?.message?.content ?? null;
    return { text: typeof text === "string" ? text : null, ms, costUsd: Number(j?.usage?.cost ?? 0) };
  } catch (e) {
    return { text: null, ms: Date.now() - t0, error: (e as Error).name === "AbortError" ? "timed out" : (e as Error).message };
  } finally {
    clearTimeout(timer);
  }
}

export function liveSwarm(apiKey: string, onCost?: (usd: number) => void): AgentDriver[] {
  const call = async (model: string, prompt: string, max: number) => {
    const r = await callOpenRouter(apiKey, model, prompt, max);
    onCost?.(r.costUsd ?? 0);
    return r;
  };
  return LIVE_MODELS.map(({ wallet, model, family, size, role, stake }) => ({
    wallet, label: model, family, size, role, stake, kind: "live" as const,
    propose: (prompt) => call(model, prompt, 6000),
    vote: (prompt) => call(model, prompt, 3000),
  }));
}
