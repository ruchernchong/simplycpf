import type { Document } from "fumadocs-openapi";
import { createOpenAPI } from "fumadocs-openapi/server";
import spec from "../../../../openapi.json";

export const openapi = createOpenAPI({
  input: async () => ({
    "./openapi.json": {
      ...spec,
      openapi: "3.2.0",
      servers: [
        {
          url: "/api/cpf",
          description:
            process.env.NODE_ENV === "production"
              ? "Production"
              : "Development",
        },
      ],
    } as Document,
  }),
});
