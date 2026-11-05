import { SIMDS, readSimdMarkdown } from "@/lib/simds";

/** Serves simds/*.md unchanged, so the downloads on /simds are the same files as the repo. */
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return SIMDS.map((s) => ({ file: s.file })); }

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const s = SIMDS.find((x) => x.file === file);
  if (!s) return new Response("Not found", { status: 404 });
  return new Response(readSimdMarkdown(s.file), {
    headers: { "content-type": "text/markdown; charset=utf-8", "content-disposition": `attachment; filename="${s.file}"` },
  });
}
