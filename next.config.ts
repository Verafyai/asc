import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/trust", destination: "/docs/trust", statusCode: 301 },
      { source: "/demos", destination: "/docs/recorded-runs", statusCode: 301 },
      { source: "/demos/:slug", destination: "/docs/recorded-runs/:slug", statusCode: 301 },
      { source: "/contracts", destination: "/docs/recorded-runs", statusCode: 301 },
      { source: "/settlement", destination: "/docs/recorded-runs/settlement", statusCode: 301 },
      { source: "/evidence", destination: "/how-it-works", statusCode: 301 },
      { source: "/asc", destination: "/inscribed", statusCode: 301 },
      { source: "/docs/checkpolicy", destination: "/docs/enforce", statusCode: 301 },
      { source: "/docs/check-policy", destination: "/docs/enforce", statusCode: 301 },
      { source: "/docs/concepts", destination: "/docs#words", statusCode: 301 },
      { source: "/docs/writing", destination: "/docs/write", statusCode: 301 },
      { source: "/docs/jury", destination: "/docs/request-a-ruling", statusCode: 301 },
      { source: "/docs/iq", destination: "/docs/under-the-hood", statusCode: 301 },
      { source: "/code/iq-:rest", destination: "/docs/under-the-hood", statusCode: 301 },
      { source: "/code/check-policy-anchor", destination: "/code/exchange-withdrawals", statusCode: 301 },
      { source: "/code/hot-wallet-sol", destination: "/code/dao-constitution", statusCode: 301 },
      { source: "/code/certify-action", destination: "/code/certify-in-ci", statusCode: 301 },
    ];
  },
};

export default config;
