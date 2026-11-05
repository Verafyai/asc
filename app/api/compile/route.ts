import { compileContract } from "@/lib/oracle/compile";
import { AUDITOR_MODEL, COMPILER_MODEL } from "@/lib/oracle/models";
import { disabled, liveCaller, liveStatus } from "@/lib/oracle/live";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function GET() { const s = liveStatus(); return Response.json({ live: s.on, spent: s.spent, cap: s.cap }); }
export async function POST(req: Request) {
  const s = liveStatus();
  if (!s.on) return disabled();
  if (s.spent >= s.cap) return Response.json({ error: "live budget for this instance is used up" }, { status: 429 });
  const { english } = await req.json().catch(() => ({}));
  if (typeof english !== "string" || english.length < 40 || english.length > 4000) return Response.json({ error: "English contract must be 40 to 4,000 characters" }, { status: 400 });
  const r = await compileContract(english, liveCaller(s.key!), COMPILER_MODEL, AUDITOR_MODEL);
  return Response.json(r);
}
