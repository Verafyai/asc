"use client";
import { useState } from "react";
import type { ContractSpec } from "@/lib/oracle/types";
import { settle } from "@/lib/oracle/escrow";
import { Checks } from "./RunView";

/** Runs the real escrow code in the browser on a hypothetical verdict. Not a recorded run. */
export default function CapsWhatIf({ spec, initialAmount, initialOutcome }: { spec: ContractSpec; initialAmount?: number; initialOutcome?: string | null }) {
  const clause = spec.judgmentClauses[0];
  const variable = spec.outcomes.find((o) => o.payouts.some((p) => p.variable));
  const [outcome, setOutcome] = useState(initialOutcome ?? variable?.id ?? clause.allowedOutcomes[0]);
  const [amount, setAmount] = useState(initialAmount ?? 220000);
  const [quorum, setQuorum] = useState(true);
  const s = settle(spec, clause.id, outcome, amount, { quorum });
  return (
    <div className="card">
      <p className="eyebrow">What if the jury asked for more? <span className="pill purple">hypothetical, runs the real escrow code in your browser</span></p>
      <p>Pick a verdict and an amount, including one far over the cap or an outcome the clause does not allow. The models can only choose; the escrow decides what moves.</p>
      <div className="controls">
        <label>Outcome{" "}
          <select value={outcome} onChange={(e) => setOutcome(e.target.value)}>
            {spec.outcomes.map((o) => <option key={o.id} value={o.id}>{o.id}{clause.allowedOutcomes.includes(o.id) ? "" : " (not allowed)"}</option>)}
            <option value="pay_attacker">pay_attacker (not in spec)</option>
          </select>
        </label>
        <label>Amount{" "}<input type="number" value={amount} min={0} step={10000} onChange={(e) => setAmount(Number(e.target.value))} style={{ width: 140 }} /></label>
        <div className="seg">{[220000, 1000000, 50000].map((a) => <button key={a} aria-pressed={amount === a} onClick={() => setAmount(a)}>{a.toLocaleString()}</button>)}</div>
        <label><input type="checkbox" checked={quorum} onChange={(e) => setQuorum(e.target.checked)} /> quorum reached</label>
      </div>
      <div className="grid2">
        <Checks items={s.checks} />
        <div>
          <p><b>{s.status}</b> · {s.total.toLocaleString()} PLAY paid</p>
          {s.payouts.map((p) => <p key={p.to} className="mono">{p.to}: requested {p.requested.toLocaleString()} → paid {p.paid.toLocaleString()} {p.capped && <span className="pill bad">capped</span>}</p>)}
        </div>
      </div>
    </div>
  );
}
