export type NavItem = { href: string; label: string };

/** The one site nav, grouped for the menu. */
export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  { title: "Start", items: [
    { href: "/", label: "Home" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/sandbox", label: "Sandbox" },
  ] },
  { title: "Build", items: [
    { href: "/templates", label: "Templates" },
    { href: "/simds", label: "Read the SIMDs" },
    { href: "/standards", label: "Standards" },
    { href: "/certifications", label: "Certifications" },
  ] },
  { title: "Measure", items: [
    { href: "/performance", label: "Performance" },
    { href: "/security", label: "Security" },
  ] },
];

export const NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function isCurrent(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
