/** Check the CSS actually linked by the prerendered production homepage. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import postcss from "postcss";

const buildDirectory = process.argv[2] ?? ".next";
const html = await readFile(
  join(buildDirectory, "server/app/index.html"),
  "utf8",
);
const stylesheets = [
  ...html.matchAll(/href="(\/_next\/static\/[^"?]+\.css)(?:\?[^"\s]*)?"/g),
];
assert(stylesheets.length > 0, "Production homepage must link its CSS");
const declarations = new Map();
for (const [, href] of stylesheets) {
  const css = await readFile(
    join(buildDirectory, href.replace("/_next/", "")),
    "utf8",
  );
  postcss.parse(css).walkRules((rule) => {
    for (const selector of rule.selectors) {
      const properties = declarations.get(selector) ?? new Set();
      rule.walkDecls((declaration) => properties.add(declaration.prop));
      declarations.set(selector, properties);
    }
  });
}

for (const [selector, property] of [
  [".site-container", "width"],
  [".home-title", "font-size"],
  [".home-figures", "grid-template-columns"],
  [".home-amount", "font-size"],
  [".home-figure--take-home .home-amount", "font-size"],
]) {
  assert(
    declarations.get(selector)?.has(property),
    `Production CSS is missing ${selector} ${property}`,
  );
}
console.log(
  "Production homepage CSS: container, heading and financial statement rules verified.",
);
