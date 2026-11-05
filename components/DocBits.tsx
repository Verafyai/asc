import CopyButton from "@/components/CopyButton";

export type PillKind = "live" | "planned" | "illustrative" | "design only";

export function Pill({ kind }: { kind: PillKind }) {
  const cls = kind === "live" ? "real" : kind === "illustrative" ? "ill" : "";
  return <span className={`d-tag ${cls} d-pill`}>{kind}</span>;
}

/** The one-line status every docs page starts with. */
export function Status({ children }: { children?: React.ReactNode }) {
  return (
    <p className="d-status">
      <b>Status:</b>{" "}
      {children ?? <>the sandbox runs today <Pill kind="live" />. The SDK and API on this page are planned <Pill kind="planned" />.</>}
    </p>
  );
}

export function Code({ code, title, pill, lang }: { code: string; title?: string; pill?: PillKind; lang?: string }) {
  return (
    <div className="d-codeblock">
      {(title || pill) && (
        <div className="d-codehead">
          {title && <span className="mono">{title}</span>}
          {lang && <span className="d-dim" style={{ fontSize: 13 }}>{lang}</span>}
          {pill && <Pill kind={pill} />}
          <span style={{ marginLeft: "auto" }}><CopyButton text={code} /></span>
        </div>
      )}
      <pre className="d-pre">{code}</pre>
    </div>
  );
}

export function DocHead({ title, intro }: { title: string; intro?: React.ReactNode }) {
  return (
    <>
      <div className="d-eb">Docs</div>
      <h1 className="d-h1 d-sm">{title}</h1>
      {intro && <p className="d-lede" style={{ fontSize: 19 }}>{intro}</p>}
    </>
  );
}

export function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return <h2 className="d-h2 d-doc-h2" id={id}>{children}</h2>;
}

export function T({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="d-tablewrap">
      <table className="d-table">
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export const QUICK_RULES = `---
asc: 1
name: Exchange hot wallet withdrawals
outcomes: { allow: send the withdrawal, hold: refuse and page the on-call reviewer }
default: hold
min_jury: { size: 5, quorum: 4, different_labs: true }
---
# Hard limits
1. Never send more than $1,000,000 to a wallet not registered to the exchange.
# Judgment
5. Hold the withdrawal if it looks like an account takeover: a password, email or
   2FA change in the last 48 hours, followed by a withdrawal to an address the
   account has never used.`;

export const REQUEST_FULL = `const ruling = await asc.requestRuling({
  asc: 'asc_hotwallet_v1',                 // a published ASC id, optionally pinned: 'asc_hotwallet_v1@1.0.0'
  action: { type: 'withdrawal', to, amount_usd: 250000 },   // what you want to do
  evidence: { account, destination, ticket, totals },       // what the jury may read
  jury: { size: 5, quorum: 4, tier: 'standard' },
  standards: ['EAO@1.0'],                  // optional: also judge against a standard's rules
  maxCredits: 40,                          // refuse to run if the quote is higher
  wait: true,                              // false: return at once with status 'pending'; use a webhook
  webhook: 'https://example.com/asc',      // optional
});`;

export const REQUEST_SHORT = `import { asc } from '@verafy/asc';

const ruling = await asc.requestRuling({
  asc: 'asc_hotwallet_v1',
  action: { type: 'withdrawal', to, amount_usd: 250000 },
  evidence: { account, destination, ticket, totals },
  jury: { size: 5, quorum: 4, tier: 'standard' },
});`;
