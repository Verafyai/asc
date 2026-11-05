"use client";
import { useMemo, useState } from "react";
import { calculate, performanceModel, usd, type Tier } from "@/lib/performance";

export default function PerformanceCalc() {
  const [jurors, setJurors] = useState(performanceModel.inputs.jurors);
  const [tier, setTier] = useState<Tier>("budget");
  const [tokens, setTokens] = useState(performanceModel.inputs.ruling_tokens.input + performanceModel.inputs.ruling_tokens.output);
  const [prove, setProve] = useState(false);
  const [gpu, setGpu] = useState(performanceModel.inputs.h100_usd_per_hour.low);
  const [sol, setSol] = useState(performanceModel.inputs.sol_usd);
  const [perMonth, setPerMonth] = useState(10000);
  const [rules, setRules] = useState(performanceModel.inputs.certify_rules);
  const out = useMemo(() => calculate({ jurors, tier, tokens, prove, gpuPerHour: gpu, solUsd: sol, rulingsPerMonth: perMonth, rules }), [jurors, tier, tokens, prove, gpu, sol, perMonth, rules]);
  return (
    <div>
      <div className="d-card d-calc" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <Slider label="Jurors" value={jurors} min={3} max={9} step={1} show={String(jurors)} onChange={setJurors} />
        <label className="d-dim" style={{ fontSize: 13 }}>Model tier
          <select className="d-field" value={tier} onChange={(e) => setTier(e.target.value as Tier)}>
            <option value="budget">Budget</option>
            <option value="flagship">Flagship (highest price in the file, every seat)</option>
            <option value="maverick">Maverick</option>
          </select>
        </label>
        <Slider label="Tokens per juror" value={tokens} min={200} max={8000} step={100} show={tokens.toLocaleString("en-US")} onChange={setTokens} />
        <label className="d-dim" style={{ fontSize: 13 }}>Prove answers
          <select className="d-field" value={prove ? "on" : "off"} onChange={(e) => setProve(e.target.value === "on")}>
            <option value="off">Off</option>
            <option value="on">On</option>
          </select>
        </label>
        <Slider label="GPU price per hour" value={gpu} min={performanceModel.inputs.h100_usd_per_hour.low} max={performanceModel.inputs.h100_usd_per_hour.typical} step={0.01} show={usd(gpu)} onChange={setGpu} />
        <Slider label="SOL price" value={sol} min={20} max={200} step={1} show={usd(sol)} onChange={setSol} />
        <Slider label="Rulings per month" value={perMonth} min={0} max={100000} step={1000} show={perMonth.toLocaleString("en-US")} onChange={setPerMonth} />
        <Slider label="Rules to certify" value={rules} min={1} max={20} step={1} show={String(rules)} onChange={setRules} />
      </div>
      <div className="d-grid4" style={{ marginTop: 14 }}>
        <Tile k="Cost per ruling" v={usd(out.perRuling)} />
        <Tile k="Per month" v={usd(out.perMonth)} />
        <Tile k="Time per ruling" v={prove ? `${out.rulingSeconds[0]} to ${out.rulingSeconds[1]} s, plus about ${Math.round(out.extraProofSeconds)} s of proving per chunk` : `${out.rulingSeconds[0]} to ${out.rulingSeconds[1]} s`} />
        <Tile k="Certification" v={`${usd(out.certifyUsd + out.certifyProveUsd + out.certifyVerifyUsd)} model and proof cost`} />
      </div>
      <p className="d-dim" style={{ fontSize: 13, marginTop: 8 }}>Flagship prices every juror as {out.models[0]}. That jury was not recorded. Maverick is five copies of one open model. 10,000 rulings a month is a calculator input, not a measured volume. Proofs are design only.</p>
    </div>
  );
}

function Slider({ label, value, min, max, step, show, onChange }: { label: string; value: number; min: number; max: number; step: number; show: string; onChange: (n: number) => void }) {
  return (
    <label className="d-dim" style={{ fontSize: 13 }}>{label}
      <input className="d-slider" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <div style={{ fontSize: 15, color: "#e8edf2", marginTop: 8 }}>{show}</div>
    </label>
  );
}

function Tile({ k, v }: { k: string; v: string }) {
  return <div className="d-card" style={{ padding: 16 }}><div className="d-dim" style={{ fontSize: 13 }}>{k}</div><div style={{ fontWeight: 700, marginTop: 4 }}>{v}</div></div>;
}
