import { openrouter } from "./llm";

/** Live mode runs only when SWARM_LIVE=1 and a server-side key exist. The key never reaches the client. */
export const LIVE_CAP_USD = 0.5; // per server instance
let spent = 0;
export function liveStatus() {
  const key = process.env.OPENROUTER_API_KEY;
  const on = process.env.SWARM_LIVE === "1" && !!key;
  return { on, key: on ? key! : null, spent, cap: LIVE_CAP_USD };
}
export function liveCaller(key: string) {
  return async (model: string, prompt: string, maxTokens: number) => {
    if (spent >= LIVE_CAP_USD) return { text: null, ms: 0, costUsd: 0, error: "live budget exhausted" };
    const r = await openrouter(key, model, prompt, { maxTokens: Math.max(maxTokens, model.startsWith("openai/gpt-5") ? 2500 : 1200) });
    spent += r.costUsd;
    return r;
  };
}
export const disabled = () => Response.json({ error: "Live mode is disabled on this deployment. The recorded runs on this page are real; set SWARM_LIVE=1 and a server-side OPENROUTER_API_KEY to enable it." }, { status: 503 });
