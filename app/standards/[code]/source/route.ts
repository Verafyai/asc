import { loadStandard } from "@/lib/standards";

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const s = loadStandard((await ctx.params).code);
  if (!s) return new Response("Not found", { status: 404 });
  return new Response(s.markdown, { headers: { "content-type": "text/markdown; charset=utf-8" } });
}
