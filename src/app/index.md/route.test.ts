import { GET as getFullReference } from "../llms-full.txt/route";
import { GET } from "./route";

describe("Markdown homepage and extended reference", () => {
  it("serves an overview with navigation and a distinct content type", async () => {
    const response = GET();
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response.headers.get("vary")).toContain("Accept");
    const text = await response.text();
    expect(text).toContain("# SimplyCPF");
    expect(text).toContain("/openapi.json");
    expect(text).toContain("not a calculated result");
    expect(text).not.toContain("<html");
  });
  it("preserves the detailed reference previously in llms.txt", async () => {
    const text = await (await getFullReference()).text();
    expect(text).toContain("## CPF Contribution Rates by Age Group");
    expect(text).toContain("## PR Graduated CPF Rates");
  });
});
