"use client";
import { useState } from "react";
import { PRODUCT_NAME } from "@/lib/brand";

const LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/sandbox", label: "Sandbox" },
  { href: "/docs", label: "Docs" },
  { href: "/code", label: "Sample code" },
  { href: "/standards", label: "Standards" },
  { href: "/certify", label: "Certify" },
  { href: "/performance", label: "Performance" },
  { href: "/security", label: "Security" },
];

function currentOf(href: string, current?: string): boolean {
  if (!current) return false;
  if (href === "/docs") return current === "/docs" || current.startsWith("/docs/") || current === "/inscribed" || current === "/proposal";
  if (href === "/standards") return current.startsWith("/standards");
  if (href === "/certify") return current.startsWith("/certify");
  if (href === "/code") return current.startsWith("/code");
  return current === href;
}

export default function Header({ current }: { current?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className={`asc-header${open ? " menu-open" : ""}`}>
      <button type="button" className="asc-menu" aria-expanded={open} aria-label={open ? "Close menu" : "Menu"} onClick={() => setOpen((v) => !v)}>
        {open ? "×" : "☰"}
      </button>
      <a className="brand" href="/" aria-label={`${PRODUCT_NAME} home`}><img src="/asc-logo.png" alt="" width={32} height={32} className="brand-logo" />{PRODUCT_NAME}</a>
      <span className="d-tag">alpha</span>
      <nav aria-label="Primary">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} aria-current={currentOf(l.href, current) ? "page" : undefined} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
