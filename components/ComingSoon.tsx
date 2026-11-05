"use client";
import { useState } from "react";

export default function ComingSoon({ label = "Attach a Solana wallet" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="d-btn g sm" onClick={() => setOpen(true)}>
        {label} <span className="d-tag" style={{ marginLeft: 6 }}>coming soon</span>
      </button>
      {open && (
        <div className="d-modal" role="dialog" aria-modal="true" aria-labelledby="soon-title">
          <div className="d-card" style={{ maxWidth: 460 }}>
            <h2 id="soon-title" className="d-h2" style={{ fontSize: 26 }}>Coming soon</h2>
            <p className="d-mut">Attaching a Solana wallet is not built. It will not sign, pay, or own certificates in this build.</p>
            <button type="button" className="d-btn g" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
