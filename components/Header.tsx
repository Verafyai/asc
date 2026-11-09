"use client";
import "@/styles/chrome.css";
import { usePathname } from "next/navigation";
import { NAV_GROUPS, isCurrent } from "@/lib/nav";
import { TEMPLATE_LINKS } from "@/lib/template-links";

/** The canonical Verafy header (www.verafy.ai/header/v1). The full grouped site menu rides in its menu slot. */
export default function Header() {
  const pathname = usePathname() ?? "";
  const link = (href: string, label: string) => {
    const on = isCurrent(href, pathname) && (href !== "/templates" || pathname === "/templates");
    return <a key={href} href={href} aria-current={on ? "page" : undefined}>{label}</a>;
  };
  return (
    <verafy-header product="asc" links="Templates:/templates, How it works:/how-it-works, Sandbox:/sandbox" style={{ display: "block", minHeight: 64, background: "#0B0E12" }}>
      <div slot="menu" className="vh-menu">
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
      </div>
    </verafy-header>
  );
}
