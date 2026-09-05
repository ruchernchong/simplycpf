/** Run against Portless: node scripts/verify-agent-readiness.mjs https://simplycpf.localhost */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { setTimeout } from "node:timers/promises";

const origin = process.argv[2] || "https://simplycpf.localhost";
let checks = 0;
const failures = [];
function request(path, accept = "*/*", method = "GET", body) {
  const args = [
    "-sS",
    "--max-time",
    "60",
    "-i",
    "-X",
    method,
    "-H",
    `Accept: ${accept}`,
  ];
  if (body)
    args.push(
      "-H",
      "Content-Type: application/json",
      "--data",
      JSON.stringify(body),
    );
  const raw = execFileSync("curl", [...args, `${origin}${path}`], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  const split = raw.indexOf("\r\n\r\n");
  const lines = raw.slice(0, split).split("\r\n");
  const headers = new Headers();
  for (const line of lines.slice(1)) {
    const colon = line.indexOf(":");
    if (colon > 0)
      headers.append(line.slice(0, colon), line.slice(colon + 1).trim());
  }
  return {
    status: Number(lines[0].split(" ")[1]),
    headers,
    body: raw.slice(split + 4),
  };
}
function check(label, run) {
  try {
    run();
    checks++;
    console.log(`PASS ${label}`);
  } catch (error) {
    failures.push(label);
    console.error(`FAIL ${label}: ${error.message}`);
  }
}
function markdown(path, status = 200) {
  const result = request(path, "text/markdown");
  assert.equal(result.status, status);
  assert.match(result.headers.get("content-type") || "", /^text\/markdown/);
  assert.match(result.headers.get("vary") || "", /\bAccept\b/i);
  assert.match(result.body, /^# /);
  if (status === 404)
    for (const link of ["/sitemap.xml", "/llms.txt", "/docs", "/openapi.json"])
      assert.ok(result.body.includes(link));
  return result;
}
for (const path of [
  "/",
  "/index.md",
  "/docs",
  "/docs/llms.mdx",
  "/docs/getting-started",
  "/docs/getting-started.mdx",
  "/cpf-rates.md",
])
  check(`Markdown ${path}`, () => markdown(path));
for (const path of [
  "/agent-audit-missing",
  "/nested/agent-audit-missing",
  "/docs/agent-audit-missing",
  "/docs/llms.mdx/agent-audit-missing",
])
  check(`404 ${path}`, () => markdown(path, 404));
check("HTML 404 preserves the product page", () => {
  const result = request("/agent-audit-missing", "text/html");
  assert.equal(result.status, 404);
  assert.ok(result.body.includes("Back to Home"));
});
check("Markdown quality preference", () => {
  const result = request("/", "text/html;q=0.2,text/markdown;q=1");
  assert.equal(result.status, 200);
  assert.match(result.headers.get("content-type"), /text\/markdown/);
});
check("406 unsupported representation", () =>
  assert.equal(request("/", "application/json").status, 406),
);
for (const path of [
  "/llms.txt",
  "/llms-full.txt",
  "/docs/llms-full.txt",
  "/robots.txt",
  "/sitemap.xml",
  "/openapi.json",
])
  check(`Discovery ${path}`, () => {
    const result = request(path);
    assert.equal(result.status, 200);
    assert.ok(result.body.length > 30);
    assert.ok(!result.body.includes("<!DOCTYPE html>"));
  });
// Check every documentation page, including generated API pages.
for (const file of readdirSync("content/docs", { recursive: true }).filter(
  (file) => file.endsWith(".mdx"),
)) {
  const slug = file.replace(/(?:^|\/)index\.mdx$/, "").replace(/\.mdx$/, "");
  check(`Documentation ${file}`, () =>
    markdown(`/docs/llms.mdx${slug ? `/${slug}` : ""}`),
  );
}
const spec = JSON.parse(request("/openapi.json").body);
for (const [path, methods] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(methods)) {
    if (!["get", "post"].includes(method)) continue;
    // Stay within the existing 10 requests / 10 seconds API limit.
    await setTimeout(1100);
    check(`API ${method.toUpperCase()} ${path}`, () => {
      const query = new URLSearchParams();
      for (const parameter of operation.parameters || []) {
        if (parameter.in === "query" && parameter.required)
          query.set(
            parameter.name,
            String(
              parameter.example ??
                parameter.schema?.example ??
                { age: 30, birthDate: "1990-01-01", sgsYield: 3 }[
                  parameter.name
                ],
            ),
          );
      }
      const body =
        operation.requestBody?.content?.["application/json"]?.example;
      const result = request(
        `/api/cpf${path}${query.size ? `?${query}` : ""}`,
        "application/json",
        method.toUpperCase(),
        body,
      );
      assert.equal(result.status, 200, result.body);
      assert.match(result.headers.get("content-type"), /application\/json/);
      JSON.parse(result.body);
    });
  }
}
for (const accept of [
  "text/html",
  "text/html;q=1,text/markdown;q=0.2",
  "text/markdown;q=0,*/*;q=1",
])
  check(`HTML preference ${accept}`, () => {
    const result = request("/", accept);
    assert.equal(result.status, 200);
    assert.match(result.headers.get("content-type"), /text\/html/);
    assert.match(result.headers.get("vary"), /Accept/i);
  });
console.log(`${checks} passed; ${failures.length} failed.`);
if (failures.length) process.exitCode = 1;
