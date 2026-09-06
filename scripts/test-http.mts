import assert from "node:assert/strict";

// Calea variabilă păstrează compatibilitatea între execuția TypeScript directă
// din Node și verificarea statică făcută de Next/TypeScript.
const httpModulePath = "../src/lib/http.ts";
const { prefersMarkdown } = await import(httpModulePath);

const cases: Array<[string, boolean]> = [
  ["text/markdown", true],
  ["TEXT/MARKDOWN", true],
  ["text/markdown, text/html;q=0.9", true],
  ["text/html, text/markdown;q=0.9", false],
  ["text/markdown;q=0, text/html;q=1", false],
  ["text/markdown;q=0, */*;q=1", false],
  ["text/html,application/xhtml+xml,*/*;q=0.8", false],
  ["*/*", false],
  ["", false],
];

for (const [header, expected] of cases) {
  assert.equal(prefersMarkdown(header), expected, `Accept: ${header || "<gol>"}`);
}

console.log(`HTTP content negotiation: ${cases.length} cazuri trecute.`);

import { readFile } from "node:fs/promises";

const routeSource = await readFile(
  new URL("../src/app/api/markdown/[[...path]]/route.ts", import.meta.url),
  "utf8"
);

// Verificări A17: toate familiile de rute publice au reprezentare Markdown permisă
assert.match(routeSource, /MESERII\.map/, "ALLOWED_MARKDOWN_PATHS include meseriile");
assert.match(routeSource, /JUDETE\.map/, "ALLOWED_MARKDOWN_PATHS include județele");
assert.match(routeSource, /CATEGORII\.map/, "ALLOWED_MARKDOWN_PATHS include domeniile");
assert.match(routeSource, /COMPARATII\.map/, "ALLOWED_MARKDOWN_PATHS include comparațiile");

console.log("Markdown allowlist contracte: verificat.");


