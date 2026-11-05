"use client";
import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="d-btn g sm"
      style={{ margin: "12px 0" }}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
      }}
    >{done ? "Copied" : "Copy"}</button>
  );
}
