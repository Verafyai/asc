import { PRICING, certifyCredits, juryRunCredits } from "@/config/pricing";

type Body = {
  kind?: "ruling" | "dispute" | "draft" | "publish" | "certify";
  jury?: { size?: number; tier?: "fast" | "standard" | "frontier" };
  rules?: number;
  files?: number;
  networkCredits?: number;
};

const KINDS = ["ruling", "dispute", "draft", "publish", "certify"] as const;

/** Prices a call without running it. Free. Prices are proposals. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Body;
  const kind = b.kind ?? "ruling";
  if (!KINDS.includes(kind)) return Response.json({ error: "unknown_kind", kinds: KINDS }, { status: 400 });
  const base = { kind, unit: "credits", proposed: true, charged: 0 };
  if (kind === "ruling" || kind === "dispute") {
    const size = Math.min(9, Math.max(3, Math.round(b.jury?.size ?? PRICING.baseJurors)));
    const tier = b.jury?.tier ?? "standard";
    if (tier !== "standard") return Response.json({ ...base, credits: null, jury: { size, tier }, error: "tier_price_not_set" }, { status: 422 });
    const credits = juryRunCredits(size);
    return Response.json({ ...base, credits, jury: { size, tier }, detail: `${size} jurors, standard tier${kind === "dispute" ? ", same price as the original ruling" : ""}` });
  }
  if (kind === "draft") return Response.json({ ...base, credits: PRICING.compileCredits, detail: "compile and loophole check" });
  if (kind === "publish") {
    const net = Math.max(0, Number(b.networkCredits ?? 0));
    return Response.json({ ...base, credits: Math.ceil(net * (1 + PRICING.inscriptionMarkup)), detail: "network cost plus 10%" });
  }
  const rules = Math.max(1, Math.round(b.rules ?? 12));
  const files = Math.max(1, Math.round(b.files ?? 120));
  return Response.json({ ...base, credits: certifyCredits(rules, files), detail: `${rules} rules, ${files} files` });
}

export async function GET() {
  return Response.json({ usage: "POST a JSON body: { kind: 'ruling' | 'dispute' | 'draft' | 'publish' | 'certify', jury?: { size, tier }, rules?, files?, networkCredits? }", proposed: true });
}
