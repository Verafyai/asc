import type { AgentDriver, Role } from "../engine";
import type { Predictor, SvmPrediction } from "../svm/predict";

export interface RecordedAgent { wallet: string; model: string; family: string; size: string; role: Role; stake: number }
export interface RecordedReply { text: string | null; ms: number; costUsd?: number; error?: string }
export interface RecordedSlot { slot: number; leader: string; propose: RecordedReply; votes: Record<string, RecordedReply>; svm?: SvmPrediction | null }
export interface Recording {
  recordedAt: string;
  note: string;
  agents: RecordedAgent[];
  svmllm: { engine: string; repo: string; commit: string };
  slots: RecordedSlot[];
  totalCostUsd: number;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Replays real model replies captured by scripts/record-live.ts, looked up by slot. The harness
 * re-runs every hash, signature and state check on the replayed text in the browser.
 */
export function replaySwarm(rec: Recording, speed = 0.2): AgentDriver[] {
  const at = (slot: number) => rec.slots.find((s) => s.slot === slot);
  return rec.agents.map((a) => ({
    wallet: a.wallet, label: a.model, family: a.family, size: a.size, role: a.role, stake: a.stake, kind: "replay" as const,
    async propose(_p, ctx) {
      const r = at(ctx.slot)?.propose;
      if (!r) return { text: null, ms: 0, error: "recording has no reply for this slot" };
      await delay(Math.min(r.ms * speed, 1500));
      return r;
    },
    async vote(_p, ctx) {
      const r = at(ctx.slot)?.votes[a.wallet];
      if (!r) return { text: null, ms: 0, error: "recording has no vote for this slot" };
      await delay(Math.min(r.ms * speed, 900));
      return r;
    },
  }));
}

/** Returns the svmLLM weights output recorded on the box for each slot. */
export function replayPredictor(rec: Recording): Predictor {
  return {
    label: rec.svmllm.engine,
    source: "weights",
    async predict(_req, slot) {
      return rec.slots.find((s) => s.slot === slot)?.svm ?? null;
    },
  };
}
