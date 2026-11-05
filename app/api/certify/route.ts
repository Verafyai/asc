import { credits, STUB_ACCOUNT } from "@/lib/credits";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({})) as { quoteId?: string; repo?: string };
  if (!body.quoteId) return Response.json({ error: "Quote first with POST /api/quote action certify.", planned: true, label: "planned" }, { status: 400 });
  try {
    const hold = credits.hold(STUB_ACCOUNT, body.quoteId);
    credits.release(hold.id);
  } catch {
    return Response.json({ error: "Unknown quote.", planned: true }, { status: 400 });
  }
  return Response.json({
    status: "not_run",
    charged: 0,
    label: "planned",
    message: "Certify review is not connected. No repository was fetched and no model was called. Credits charged: 0.",
    repo: body.repo ?? null,
  }, { status: 501 });
}
