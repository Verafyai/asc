"use client";
import "@/styles/chrome.css";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { PRODUCT_NAME } from "@/lib/brand";
import { NAV, isCurrent } from "@/lib/nav";


export default function Header() {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  return (
    <header className={`hdr${open ? " open" : ""}`}>
      <a className="brand" href="/"><img src="/asc-logo.png" alt="" width={64} height={64} />{PRODUCT_NAME}</a>
      <span className="pill">alpha</span>
      <button type="button" className="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>Menu</button>
      <nav aria-label="Primary">
        {NAV.map((n) => {
          const on = isCurrent(n.href, pathname);
          return <a key={n.href} href={n.href} className={on ? "on" : undefined} aria-current={on ? "page" : undefined}>{n.label}</a>;
        })}
      </nav>
    </header>
  );
}
