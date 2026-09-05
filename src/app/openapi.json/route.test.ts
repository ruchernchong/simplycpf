import { readdirSync } from "node:fs";
import spec from "../../../openapi.json";
import { GET } from "./route";

describe("public OpenAPI specification", () => {
  it("publishes the same document used by the developer portal", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(await response.json()).toEqual(spec);
    expect(spec.openapi).toBe("3.1.0");
  });
  it("documents every public CPF route", () => {
    const paths = readdirSync("src/app/api/cpf", {
      recursive: true,
      encoding: "utf8",
    })
      .filter((path) => path.endsWith("/route.ts"))
      .map((path) => `/${path.slice(0, -9)}`);
    expect(Object.keys(spec.paths).sort()).toEqual(paths.sort());
  });
  it("has resolvable references and unique operation IDs", () => {
    const ids: string[] = [];
    function visit(value: unknown): void {
      if (!value || typeof value !== "object") return;
      for (const [key, child] of Object.entries(value)) {
        if (key === "$ref" && typeof child === "string") {
          let target: unknown = spec;
          for (const segment of child.slice(2).split("/")) {
            expect(target).toHaveProperty(segment);
            target = Reflect.get(Object(target), segment);
          }
        } else if (key === "operationId" && typeof child === "string")
          ids.push(child);
        else visit(child);
      }
    }
    visit(spec);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
