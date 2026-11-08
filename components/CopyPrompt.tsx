"use client";
import { useState } from "react";

/** The template's tailoring prompt, with a copy button. */
export default function CopyPrompt({ text, file }: { text: string; file: string }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { setOpen(true); }
  };
  return (
    <div className="prompt">
      <div className="prompt-bar">
        <span className="kv">{file}</span>
        <div className="row">
          <button type="button" className="btn sm" onClick={() => setOpen((o) => !o)}>{open ? "Collapse" : "Show all"}</button>
          <button type="button" className="btn sm p" onClick={copy}>{copied ? "Copied" : "Copy prompt"}</button>
        </div>
      </div>
      <pre className={open ? "open" : undefined}>{text}</pre>
    </div>
  );
}
