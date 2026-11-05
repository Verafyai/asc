import model from "@/data/performance-model.json";

/** The inputs behind /performance, served from data/performance-model.json. */
export const dynamic = "force-static";

export function GET() {
  return Response.json(model);
}
