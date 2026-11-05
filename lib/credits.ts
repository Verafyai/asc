/**
 * Quote, then hold, then settle or release.
 * Stub: the Verafy credits account is not available in this build.
 * getBalance returns null. Holds are recorded in memory and never move money.
 * A failed run or a run with fewer answers than the quorum needs settles at 0.
 */
import { certifyCredits, CREDITS_BACKEND, inscriptionCredits, juryRunCredits, PRICING, type PaidAction } from "@/config/pricing";

export type HoldStatus = "held" | "settled" | "released";

export interface Quote {
  id: string;
  action: PaidAction;
  credits: number;
  detail: string;
  backend: typeof CREDITS_BACKEND;
  /** Null when the credits account cannot be read. Not a grant of free credits. */
  balance: number | null;
  balanceAfter: number | null;
  label: string;
}

export interface Hold {
  id: string;
  account: string;
  action: PaidAction;
  amount: number;
  status: HoldStatus;
  charged: number;
  quoteId: string;
  at: string;
}

export interface SpendEntry {
  at: string;
  action: PaidAction;
  credits: number;
  link: string;
  note: string;
}

export interface CreditsClient {
  readonly backend: typeof CREDITS_BACKEND;
  getBalance(account: string): { credits: number | null; source: typeof CREDITS_BACKEND; note: string };
  quote(account: string, action: PaidAction, params?: { jurors?: number; rules?: number; files?: number; passThroughCredits?: number }): Quote;
  hold(account: string, quoteId: string): Hold;
  settle(holdId: string, actual: number): Hold;
  release(holdId: string): Hold;
  /** Under quorum or failure: charged credits are 0 and the hold is released. */
  finishRun(holdId: string, answered: number, quorum: number, failed: boolean): Hold;
  spendLog(account: string): SpendEntry[];
}

const STUB_LABEL =
  "Verafy credits are not connected in this build. This quote is a placeholder. Confirming does not charge credits and does not grant free credits.";

type Store = {
  quotes: Map<string, Quote & { account: string }>;
  holds: Map<string, Hold>;
  spend: SpendEntry[];
};

function store(): Store {
  const g = globalThis as unknown as { __ascCredits?: Store };
  if (!g.__ascCredits) g.__ascCredits = { quotes: new Map(), holds: new Map(), spend: [] };
  return g.__ascCredits;
}

let seq = 1;
const nid = (p: string) => `${p}_${(seq++).toString(36)}_${Date.now().toString(36)}`;

export function createCreditsClient(): CreditsClient {
  return {
    backend: CREDITS_BACKEND,
    getBalance() {
      return {
        credits: null,
        source: CREDITS_BACKEND,
        note: "No Verafy credits balance is available. Shown as 0 in the header. This is not a free-credit grant.",
      };
    },
    quote(account, action, params = {}) {
      let credits = 0;
      let detail = "";
      if (action === "jury_run") {
        const jurors = params.jurors ?? PRICING.baseJurors;
        credits = juryRunCredits(jurors);
        detail = `Real jury run, ${jurors} jurors`;
      } else if (action === "compile") {
        credits = PRICING.compileCredits;
        detail = "Compile English to steps";
      } else if (action === "certify") {
        const rules = params.rules ?? PRICING.certifyBaseRules;
        const files = params.files ?? PRICING.certifyBaseFiles;
        credits = certifyCredits(rules, files);
        detail = `Certify review, ${rules} rules, about ${files} files`;
      } else {
        credits = inscriptionCredits(params.passThroughCredits ?? 0);
        detail = "Inscription pass-through plus 10 percent. IQ's Solana fee is not published, so pass-through is 0 in this quote.";
      }
      const q: Quote & { account: string } = {
        id: nid("q"),
        account,
        action,
        credits,
        detail,
        backend: CREDITS_BACKEND,
        balance: null,
        balanceAfter: null,
        label: STUB_LABEL,
      };
      store().quotes.set(q.id, q);
      return q;
    },
    hold(account, quoteId) {
      const q = store().quotes.get(quoteId);
      if (!q || q.account !== account) throw new Error("Unknown quote");
      const h: Hold = {
        id: nid("h"),
        account,
        action: q.action,
        amount: q.credits,
        status: "held",
        charged: 0,
        quoteId,
        at: new Date().toISOString(),
      };
      store().holds.set(h.id, h);
      return h;
    },
    settle(holdId, actual) {
      const h = store().holds.get(holdId);
      if (!h) throw new Error("Unknown hold");
      if (h.status !== "held") return h;
      if (actual > h.amount) throw new Error("Settle above the quote is not allowed");
      h.status = "settled";
      h.charged = actual;
      if (actual > 0) {
        store().spend.push({
          at: new Date().toISOString(),
          action: h.action,
          credits: actual,
          link: "",
          note: "Stub ledger. No Verafy account was charged.",
        });
      }
      return h;
    },
    release(holdId) {
      const h = store().holds.get(holdId);
      if (!h) throw new Error("Unknown hold");
      if (h.status === "held") {
        h.status = "released";
        h.charged = 0;
      }
      return h;
    },
    finishRun(holdId, answered, quorum, failed) {
      if (failed || answered < quorum) return this.release(holdId);
      const h = store().holds.get(holdId);
      if (!h) throw new Error("Unknown hold");
      return this.settle(holdId, h.amount);
    },
    spendLog() {
      return [...store().spend];
    },
  };
}

export const credits = createCreditsClient();
export const STUB_ACCOUNT = "local-stub";
