import { credits, STUB_ACCOUNT } from "@/lib/credits";
import type { PaidAction } from "@/config/pricing";

const ACTIONS: PaidAction[] = ["jury_run", "inscription", "certify", "compile"];

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({})) as { action?: PaidAction; jurors?: number; rules?: number; files?: number; passThroughCredits?: number };
  const action = body.action && ACTIONS.includes(body.action) ? body.action : "jury_run";
  const quote = credits.quote(STUB_ACCOUNT, action, body);
  return Response.json(quote);
}
