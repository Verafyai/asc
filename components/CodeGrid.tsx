"use client";
import { useState } from "react";

export type CardData = { slug: string; title: string; ascName: string; judgment: string; runs: string; languages: string[]; label: string; chip: string };

export default function CodeGrid({ cards, chips }: { cards: CardData[]; chips: string[] }) {
  const [chip, setChip] = useState("All");
  const shown = cards.filter((c) => chip === "All" || c.chip === chip);
  return (
    <>
      <div className="d-chips" role="group" aria-label="Filter samples">
        {chips.map((c) => (
          <button key={c} type="button" className="d-chip" aria-pressed={chip === c} onClick={() => setChip(c)}>{c}</button>
        ))}
      </div>
      <div className="d-code-cards">
        {shown.map((s) => (
          <a key={s.slug} className="d-card d-sample-card" href={`/code/${s.slug}`}>
            <b style={{ fontSize: 18 }}>{s.title}</b>
            <div className="d-dim" style={{ fontSize: 14 }}>{s.ascName}</div>
            <div className="d-mut" style={{ fontSize: 15.5 }}>Judgment rule: <q>{s.judgment.replace(/^"|"$/g, "")}</q></div>
            <div className="d-dim" style={{ fontSize: 14 }}>Where it runs: {s.runs}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: "auto" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#5fe0c8" }}>{s.languages.join(" · ")}</span>
              <span className={`d-tag ${s.label === "illustrative" ? "ill" : ""}`} style={{ marginLeft: "auto" }}>{s.label}</span>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
