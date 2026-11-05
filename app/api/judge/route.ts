import { validateSpec } from "@/lib/oracle/spec";
import { runJudgment } from "@/lib/oracle/judge";
import { SWARM_A } from "@/lib/oracle/models";
import { disabled, liveCaller, liveStatus } from "@/lib/oracle/live";
import type { ContractSpec } from "@/lib/oracle/types";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function POST(req: Request) {
  const s = liveStatus();
  if (!s.on) return disabled();
  if (s.spent >= s.cap) return Response.json({ error: "live budget for this instance is used up" }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const spec = body.spec as ContractSpec;
  const text = body.evidence;
  if (typeof text !== "string" || text.length < 20 || text.length > 8000) return Response.json({ error: "Evidence must be 20 to 8,000 characters" }, { status: 400 });
  const issues = validateSpec(spec);
  if (issues.length) return Response.json({ error: "spec invalid", issues }, { status: 400 });
  const call = liveCaller(s.key!);
  const run = await runJudgment({ spec, clauseId: spec.judgmentClauses[0].id, evidence: [{ id: "user-evidence", label: "Evidence you pasted", source: "pasted by the visitor", provenance: "illustrative", text }], operators: SWARM_A, call: (op, p) => call(op.model, p, 1200) });
  return Response.json(run);
}
