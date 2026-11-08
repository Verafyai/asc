"use client";
import "@/styles/chrome.css";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PRODUCT_NAME } from "@/lib/brand";
import { NAV_GROUPS, isCurrent } from "@/lib/nav";
import { TEMPLATE_LINKS } from "@/lib/template-links";

export default function Header() {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const link = (href: string, label: string) => {
    const on = isCurrent(href, pathname) && (href !== "/templates" || pathname === "/templates");
    return <a key={href} href={href} className={on ? "on" : undefined} aria-current={on ? "page" : undefined}>{label}</a>;
  };
  return (
    <header className={`hdr${open ? " open" : ""}`}>
      <a className="brand" href="/"><img src="/asc-logo.png" alt="" width={64} height={64} />{PRODUCT_NAME}</a>
      <span className="pill">alpha</span>
      <a className="quick" href="/templates">Templates</a>
      <button type="button" className="menu" aria-expanded={open} aria-controls="site-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
        <span className="bars" aria-hidden="true"><i /><i /><i /></span>
      </button>
      {open && <button type="button" className="scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <nav id="site-menu" aria-label="Primary" hidden={!open}>
        {NAV_GROUPS.map((g) => (
          <div key={g.title} className="grp">
            <p className="gt">{g.title}</p>
            {g.items.map((n) => (n.href === "/templates" ? (
              <div key={n.href}>
                {link(n.href, n.label)}
                <div className="sub">{TEMPLATE_LINKS.map((t) => link(`/templates/${t.slug}`, t.name))}</div>
              </div>
            ) : link(n.href, n.label)))}
          </div>
        ))}
      </nav>
    </header>
  );
}
