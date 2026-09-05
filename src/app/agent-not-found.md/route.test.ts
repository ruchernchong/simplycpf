import { GET } from "./route";

it("returns a real Markdown 404 with recovery links", async () => {
  const response = GET();
  expect(response.status).toBe(404);
  expect(await response.text()).toContain("/sitemap.xml");
});
