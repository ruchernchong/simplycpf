import { CACHE_HEADERS } from "@/lib/cache-headers";
import openapi from "../../../openapi.json";

/** Publish the source contract verbatim as Swagger/OpenAPI 2.0 JSON. */
export function GET(): Response {
  return Response.json(openapi, {
    headers: CACHE_HEADERS.policy,
  });
}
