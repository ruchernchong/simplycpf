import specification from "../../../openapi.json";

export const dynamic = "force-static";

export function GET(): Response {
  return Response.json(specification);
}
