import { credits, STUB_ACCOUNT } from "@/lib/credits";

type RunRec = { id: string; status: string; charged: number; message: string; mode: "real"; createdAt: string };

function runs(): Map<string, RunRec> {
  const g = globalThis as unknown as { __ascRuns?: Map<string, RunRec> };
  if (!g.__ascRuns) g.__ascRuns = new Map();
  return g.__ascRuns;
}

/** Planned real-jury endpoint. Quotes first. This build does not call a model and charges 0. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({})) as { quoteId?: string; answered?: number; quorum?: number; failed?: boolean };
  if (!body.quoteId) return Response.json({ error: "Quote first. POST /api/quote, then confirm.", planned: true }, { status: 400 });
  let hold;
  try { hold = credits.hold(STUB_ACCOUNT, body.quoteId); }
  catch { return Response.json({ error: "Unknown quote. Quote again.", planned: true }, { status: 400 }); }
  const answered = body.answered ?? 0;
  const quorum = body.quorum ?? 4;
  const finished = credits.finishRun(hold.id, answered, quorum, body.failed ?? true);
  const id = `run_${hold.id}`;
  const rec: RunRec = {
    id,
    status: "not_run",
    charged: finished.charged,
    mode: "real",
    createdAt: new Date().toISOString(),
    message: "Real jury calls are not connected in this build. No model was called. No inscription was made. Credits charged: 0 because the run did not complete.",
  };
  runs().set(id, rec);
  return Response.json(rec, { status: 501 });
}

export function getRun(id: string): RunRec | undefined {
  return runs().get(id);
}
