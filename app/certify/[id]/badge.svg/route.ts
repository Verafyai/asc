import example from "@/asc-standards/examples/certificate-EDO-example.json";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (id !== "example-edo") return new Response("Not found", { status: 404 });
  const lines = example.badge.replace(/\n$/, "").split("\n");
  const height = 28 + lines.length * 18;
  const body = lines.map((line, i) => `<text x="16" y="${32 + i * 18}" fill="#C6CFD8" font-family="ui-monospace,monospace" font-size="14">${escapeXml(line)}</text>`).join("");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="560" height="${height}" viewBox="0 0 560 ${height}"><rect width="100%" height="100%" fill="#080B0F" rx="12"/>${body}</svg>`;
  return new Response(svg, { headers: { "content-type": "image/svg+xml; charset=utf-8" } });
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
