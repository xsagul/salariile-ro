import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [umami, salary, pfa, header, embedLayout, home] = await Promise.all([
  read("src/lib/umami.ts"),
  read("src/app/components/CalculatorSalariu.tsx"),
  read("src/app/components/CalculatorPFA.tsx"),
  read("src/app/components/Header.tsx"),
  read("src/app/(embed)/layout.tsx"),
  read("src/app/(site)/page.tsx"),
]);

for (const event of ["calcul-finalizat", "mod-calcul", "calcul-pfa", "descarca-fluturas", "copiaza-embed"]) {
  assert.match(umami, new RegExp(`name: "${event}"`), `Lipsește contractul Umami ${event}`);
}
for (const forbidden of ["salariu", "suma", "firma", "venituri", "incasari", "email"]) {
  assert.doesNotMatch(umami, new RegExp(`\\b${forbidden}\\b`, "i"), `Payload-ul Umami nu trebuie să accepte ${forbidden}`);
}
assert.match(salary, /await generarePDFFluturas[\s\S]*trackUmami\(\{ name: "descarca-fluturas"/, "PDF-ul se măsoară după generare");
assert.match(pfa, /<button[\s\S]*role="switch"[\s\S]*aria-checked=/, "Switch-ul PFA trebuie să fie un singur buton semantic");
assert.doesNotMatch(pfa, /<label[^>]*>[\s\S]{0,500}<button[^>]*role="switch"/, "Switch-ul nu poate fi imbricat într-un label");
assert.match(header, /aria-expanded=\{desktopOpen\}/);
assert.match(header, /event\.key === "Escape"/);
assert.doesNotMatch(embedLayout, /stats\.js|umami/i, "Layout-ul embed nu trebuie să activeze analytics");
assert.match(home, /Calculator salariu net 2026: net, taxe și cost angajator/);

console.log("✓ Contractele UI, analytics cookieless și CTR sunt valide");
