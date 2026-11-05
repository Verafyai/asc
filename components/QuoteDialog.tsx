"use client";
import { useState } from "react";

export interface QuoteView {
  id: string;
  credits: number;
  detail: string;
  label: string;
  balance: number | null;
  balanceAfter: number | null;
}

export default function QuoteDialog({
  quote,
  onClose,
  onConfirm,
}: {
  quote: QuoteView;
  onClose: () => void;
  onConfirm: () => Promise<string>;
}) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  return (
    <div className="d-modal" role="dialog" aria-modal="true" aria-labelledby="quote-title">
      <div className="d-card" style={{ maxWidth: 520, width: "100%" }}>
        <div className="d-eb">Quote, then confirm</div>
        <h2 id="quote-title" className="d-h2" style={{ fontSize: 28, marginTop: 8 }}>{quote.detail}</h2>
        <p className="d-mut">Price: <b style={{ color: "#e8edf2" }}>{quote.credits} credits</b></p>
        <p className="d-mut">Balance after: {quote.balanceAfter == null ? "unknown (credits account not connected)" : `${quote.balanceAfter} credits`}</p>
        <p className="d-dim" style={{ fontSize: 14 }}>{quote.label}</p>
        {result && <p className="d-ok" style={{ marginTop: 12 }}>{result}</p>}
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <button
            type="button"
            className="d-btn p"
            disabled={busy || !!result}
            onClick={async () => {
              setBusy(true);
              try { setResult(await onConfirm()); } finally { setBusy(false); }
            }}
          >Confirm</button>
          <button type="button" className="d-btn g" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
