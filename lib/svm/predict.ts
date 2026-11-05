import SVM from "./core.cjs";
import type { Balances } from "../types";

/**
 * svmLLM (github.com/Verafyai/svmLLM) compiles a reduced sBPF virtual machine into transformer weights.
 * The side check uses its "Balance transfer" program: input words [from, to, amount], exit 0 on success,
 * 1 if the sender is short, 2 on overflow. svmLLM predicts each block's post-state by running every
 * transfer through that program. The harness compares the prediction with the deterministic ledger.
 */
export const TRANSFER_ASM = `ldxdw r2, [r1+0]         # from balance
ldxdw r3, [r1+8]         # to balance
ldxdw r4, [r1+16]        # amount
jgt r4, r2, insufficient
mov64 r5, r3
add64 r5, r4
jlt r5, r3, overflow
sub64 r2, r4
stxdw [r1+0], r2
stxdw [r1+8], r5
mov64 r0, 0
exit
insufficient:
mov64 r0, 1
exit
overflow:
mov64 r0, 2
exit`;

export interface SvmRequest {
  pre: Balances;
  transfers: { from: string; to: string; amount: number }[];
  leader: string;
  reward: number;
}

export interface SvmStep { exit: number; status: string; cu: number; applied: boolean }

export interface SvmPrediction {
  engine: string; // which svmLLM path produced this
  source: "weights" | "reference";
  balances: Balances;
  steps: SvmStep[];
  cu: number;
  ms: number;
  weightsMatchReference?: boolean; // box-side cross-check, only for weights runs
}

export interface Predictor {
  label: string;
  source: SvmPrediction["source"];
  predict(req: SvmRequest, slot: number): Promise<SvmPrediction | null>;
}

let prog: Uint8Array | null = null;
const word = (mem: Uint8Array, i: number) => Number(new DataView(mem.buffer, mem.byteOffset).getBigUint64(i * 8, true));

/** svmLLM's own JS reference interpreter (site/js/core.js). Deterministic. Not the weights. */
export function referencePredict(req: SvmRequest): SvmPrediction {
  prog ??= SVM.assemble(TRANSFER_ASM);
  const t0 = Date.now();
  const bal: Balances = { ...req.pre };
  const steps: SvmStep[] = [];
  let cu = 0;
  for (const t of req.transfers) {
    const r = SVM.run(prog, SVM.u64s([bal[t.from] ?? 0, bal[t.to] ?? 0, t.amount]), 10000);
    const exit = Number(r.r0);
    const applied = r.status === "ok" && exit === 0;
    if (applied) {
      bal[t.from] = word(r.mem, 0);
      bal[t.to] = word(r.mem, 1);
    }
    cu += r.cu;
    steps.push({ exit, status: r.status, cu: r.cu, applied });
  }
  if (bal[req.leader] !== undefined) bal[req.leader] += req.reward;
  return { engine: "svmLLM reference interpreter (JS, not the weights)", source: "reference", balances: bal, steps, cu, ms: Date.now() - t0 };
}

export const referencePredictor: Predictor = {
  label: "svmLLM reference interpreter (JS)",
  source: "reference",
  async predict(req) {
    return referencePredict(req);
  },
};
