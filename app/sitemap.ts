import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";
import { DEMO_DATA } from "@/lib/oracle/demos-data";
import { SAMPLES } from "@/lib/samples";
import { STANDARD_ORDER } from "@/lib/standards";

const PATHS = [
  "/",
  "/how-it-works",
  "/sandbox",
  "/docs",
  "/docs/write",
  "/docs/publish",
  "/docs/request-a-ruling",
  "/docs/enforce",
  "/docs/agents-and-models",
  "/docs/disputes",
  "/docs/standards",
  "/docs/credits",
  "/docs/trust",
  "/docs/recorded-runs",
  "/docs/recorded-runs/settlement",
  "/docs/api",
  "/docs/under-the-hood",
  "/proposal",
  "/inscribed",
  "/code",
  "/standards",
  "/certify",
  "/certify/example-edo",
  "/performance",
  "/security",
  "/sign-in",
  ...DEMO_DATA.map((d) => `/docs/recorded-runs/${d.slug}`),
  ...SAMPLES.map((s) => `/code/${s.slug}`),
  ...STANDARD_ORDER.map((c) => `/standards/${c.toLowerCase()}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({
    url: path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`,
  }));
}
