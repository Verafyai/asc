import type { RawCall } from "./types";

/** Server-only OpenRouter call. Never import this from a client component. */
export async function openrouter(apiKey: string, model: string, prompt: string, opts: { maxTokens?: number; timeoutMs?: number; temperature?: number } = {}): Promise<RawCall> {
  const t0 = Date.now();
  try {
    const body: Record<string, unknown> = {
      model, messages: [{ role: "user", content: prompt }], max_tokens: opts.maxTokens ?? 700,
      temperature: opts.temperature ?? 0, usage: { include: true },
    };
    if (model.startsWith("openai/gpt-5")) body.reasoning = { effort: "low" };
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://asc.verafy.ai", "X-Title": "Actually Smart Contracts oracle demo" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 90_000),
    });
    const j = await r.json();
    if (!r.ok) return { text: null, ms: Date.now() - t0, costUsd: 0, error: `HTTP ${r.status}: ${String(j?.error?.message ?? "").slice(0, 160)}` };
    return { text: j.choices?.[0]?.message?.content ?? null, ms: Date.now() - t0, costUsd: Number(j.usage?.cost ?? 0), servedModel: j.model };
  } catch (e) {
    return { text: null, ms: Date.now() - t0, costUsd: 0, error: String((e as Error).message ?? e).slice(0, 160) };
  }
}
