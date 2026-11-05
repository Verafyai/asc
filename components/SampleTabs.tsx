"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

type Props = { rulesName: string; rules: string; code: { name: string; text: string }[]; ruling: string; label: string };
const TABS = ["The rules", "The code", "A ruling"] as const;

export default function SampleTabs({ rulesName, rules, code, ruling, label }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("The rules");
  return (
    <div>
      <div className="d-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === "The rules" && (
        <div role="tabpanel">
          <div className="d-codehead"><span className="mono">{rulesName}</span><span style={{ marginLeft: "auto" }}><CopyButton text={rules} /></span></div>
          <pre className="d-pre">{rules}</pre>
        </div>
      )}
      {tab === "The code" && (
        <div role="tabpanel">
          {code.map((f) => (
            <div key={f.name} className="d-codeblock">
              <div className="d-codehead"><span className="mono">{f.name}</span><span className={`d-tag ${label === "illustrative" ? "ill" : ""}`}>{label}</span><span style={{ marginLeft: "auto" }}><CopyButton text={f.text} /></span></div>
              <pre className="d-pre">{f.text}</pre>
            </div>
          ))}
        </div>
      )}
      {tab === "A ruling" && (
        <div role="tabpanel">
          <div className="d-codehead"><span className="mono">ruling.json</span><span className="d-tag ill">illustrative</span><span style={{ marginLeft: "auto" }}><CopyButton text={ruling} /></span></div>
          <pre className="d-pre">{ruling}</pre>
          <p className="d-dim" style={{ fontSize: 14 }}>Illustrative. Not a recorded run. Same shape as every ruling; see <a href="/docs/request-a-ruling">Request a ruling</a>.</p>
        </div>
      )}
    </div>
  );
}
