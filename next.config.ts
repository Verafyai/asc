import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // v2 (SITE_SPEC_v2): Docs, Sample code, Proposal and Certify are gone.
      { source: "/docs/trust", destination: "/security", statusCode: 301 },
      { source: "/docs/recorded-runs", destination: "/runs", statusCode: 301 },
      { source: "/docs/recorded-runs/:slug", destination: "/runs/:slug", statusCode: 301 },
      { source: "/docs", destination: "/simds", statusCode: 301 },
      { source: "/docs/:path*", destination: "/simds", statusCode: 301 },
      { source: "/code", destination: "/simds", statusCode: 301 },
      { source: "/code/:path*", destination: "/simds", statusCode: 301 },
      { source: "/proposal", destination: "/simds", statusCode: 301 },
      { source: "/certify", destination: "/certifications", statusCode: 301 },
      { source: "/certify/:id", destination: "/certifications", statusCode: 301 },
      { source: "/demos", destination: "/", statusCode: 301 },
      // Older URLs, pointed straight at their v2 homes.
      { source: "/demos/:slug", destination: "/runs/:slug", statusCode: 301 },
      { source: "/trust", destination: "/security", statusCode: 301 },
      { source: "/contracts", destination: "/runs", statusCode: 301 },
      { source: "/settlement", destination: "/runs/settlement", statusCode: 301 },
      { source: "/evidence", destination: "/how-it-works", statusCode: 301 },
      { source: "/asc", destination: "/inscribed", statusCode: 301 },
    ];
  },
};

export default config;
