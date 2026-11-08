import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";
import { NAV } from "@/lib/nav";
import { DEMO_DATA } from "@/lib/oracle/demos-data";
import { STANDARD_ORDER } from "@/lib/standards";
import { TEMPLATES } from "@/lib/templates";

const PATHS = [
  ...NAV.map((n) => n.href),
  "/inscribed",
  "/runs",
  "/runs/settlement",
  ...DEMO_DATA.map((d) => `/runs/${d.slug}`),
  ...STANDARD_ORDER.map((c) => `/standards/${c.toLowerCase()}`),
  ...TEMPLATES.map((t) => `/templates/${t.slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}` }));
}
