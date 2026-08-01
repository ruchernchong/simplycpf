import type { Document } from "fumadocs-openapi";
import { createOpenAPI } from "fumadocs-openapi/server";
import spec from "../../../../openapi.json";

export const openapi = createOpenAPI({
  input: async () => ({
    // Fumadocs processes this published Swagger/OpenAPI 2.0 contract through
    // its bundled Scalar upgrader before exposing the typed 3.2 document.
    "./openapi.json": spec as unknown as Document,
  }),
});
