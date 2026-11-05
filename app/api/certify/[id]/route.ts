import example from "@/asc-standards/examples/certificate-EDO-example.json";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (id === "example-edo") {
    return Response.json({ ...example, label: "example data, demo repo", live: false });
  }
  return Response.json({ error: "Unknown certificate. Only the example-edo certificate is published in this build.", label: "planned" }, { status: 404 });
}
