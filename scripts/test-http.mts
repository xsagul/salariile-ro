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
