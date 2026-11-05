import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { referencePredict } from "../lib/svm/predict";
import type { Settlement, ContractSpec } from "../lib/oracle/types";

/** svmLLM side check before settlement: predict escrow post-balances with the weights machine and compare. */
export function svmChecker() {
  const py = spawn(process.env.SVLLM_PY ?? "/workspace/svllm-venv/bin/python", ["scripts/svmllm_predict.py"], { stdio: ["pipe", "pipe", "inherit"] });
  const lines = createInterface({ input: py.stdout! })[Symbol.asyncIterator]();
  return {
    async check(spec: ContractSpec, s: Settlement) {
      if (s.status !== "settled") return null;
      const pre: Record<string, number> = { escrow: spec.escrow.amount };
      for (const p of spec.parties) pre[p.id] = 0;
      const transfers = s.payouts.filter((p) => p.paid > 0).map((p) => ({ from: "escrow", to: p.to, amount: p.paid }));
      const req = { pre, transfers, leader: "none", reward: 0 };
      py.stdin!.write(JSON.stringify(req) + "\n");
      const { value } = await lines.next();
      const weights = JSON.parse(value);
      const expected: Record<string, number> = { ...pre, escrow: pre.escrow - s.total };
      for (const p of s.payouts) expected[p.to] += p.paid;
      const ref = referencePredict(req);
      const same = (b: Record<string, number>) => Object.keys(expected).every((k) => b[k] === expected[k]);
      return { pre, transfers, expected, weights, referenceBalances: ref.balances, weightsMatchEscrow: same(weights.balances), referenceMatchEscrow: same(ref.balances) };
    },
    close() { py.stdin!.end(); },
  };
}
