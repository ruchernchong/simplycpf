import { GET } from "./route";

vi.mock("@/app/(docs)/lib/source", () => ({
  source: {
    getPage: (slug?: string[]) =>
      slug?.[0] === "missing" ? undefined : { url: "/docs" },
  },
}));
vi.mock("@/app/(docs)/lib/get-llm-text", () => ({
  getLLMText: async () => "# Documentation\n\nAPI reference",
}));

it("returns Markdown and cache variation for existing documentation", async () => {
  const response = await GET(new Request("https://simplycpf.com/docs"), {
    params: Promise.resolve({ slug: [] }),
  });
  expect(response.status).toBe(200);
  expect(response.headers.get("vary")).toContain("Accept");
  expect(await response.text()).toContain("# Documentation");
});
it("returns Markdown recovery for missing documentation", async () => {
  const response = await GET(
    new Request("https://simplycpf.com/docs/missing"),
    { params: Promise.resolve({ slug: ["missing"] }) },
  );
  expect(response.status).toBe(404);
  expect(await response.text()).toContain("/llms.txt");
});
