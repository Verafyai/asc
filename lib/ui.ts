import { b58 } from "./base58";
export const pt = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" }) + " PT";
export const short = (hex: string, n = 10) => (hex.length > n * 2 ? `${hex.slice(0, n)}…${hex.slice(-4)}` : hex);
export const b58s = (hex: string, n = 10) => { const s = b58(hex); return s.length > n + 4 ? `${s.slice(0, n)}…${s.slice(-4)}` : s; };
export const usd = (x: number) => `$${x.toFixed(x < 0.1 ? 4 : 3)}`;
export const pct = (x: number | null | undefined) => (x == null ? "n/a" : `${Math.round(x * 100)}%`);
