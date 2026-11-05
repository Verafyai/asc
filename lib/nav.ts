/** The one site nav. Order is fixed by SITE_SPEC_v2. */
export const NAV = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/sandbox", label: "Sandbox" },
  { href: "/simds", label: "Read the SIMDs" },
  { href: "/standards", label: "Standards" },
  { href: "/certifications", label: "Certifications" },
  { href: "/performance", label: "Performance" },
  { href: "/security", label: "Security" },
] as const;

export function isCurrent(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
