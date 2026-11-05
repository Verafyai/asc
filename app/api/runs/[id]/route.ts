type RunRec = { id: string; status: string; charged: number; message: string; mode: string; createdAt: string };

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const g = globalThis as unknown as { __ascRuns?: Map<string, RunRec> };
  const rec = g.__ascRuns?.get(id);
  if (!rec) return Response.json({ error: "No run with that id in this server process.", planned: true, label: "planned" }, { status: 404 });
  return Response.json({ ...rec, label: "real pipeline not connected" });
}
