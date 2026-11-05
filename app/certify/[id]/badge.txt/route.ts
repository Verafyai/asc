import fs from "node:fs";
import path from "node:path";
import example from "@/asc-standards/examples/certificate-EDO-example.json";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (id === "example-edo") return new Response(example.badge, { headers: { "content-type": "text/plain; charset=utf-8" } });
  if (id === "example-fail") {
    const fail = fs.readFileSync(path.join(process.cwd(), "asc-standards/badges/FAIL.txt"), "utf8");
    return new Response(fail, { headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  return new Response("Not found\n", { status: 404 });
}
