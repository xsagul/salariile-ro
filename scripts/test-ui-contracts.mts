import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

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

// public/llms.txt este fisier static, deci poate ramane in urma continutului
// editorial fara ca nimic sa semnaleze. Pe 21 august 2026 listase 1 articol
// din 10 publicate, adica motoarele generative vedeau o zecime din sectiunea
// de noutati. Verificarea de mai jos prinde derivarea la urmatorul `npm test`.
const llms = await read("public/llms.txt");
const slugs = (await readdir(new URL("../content/noutati", import.meta.url)))
  .filter((name) => name.endsWith(".md"))
  .map((name) => name.slice(0, -3));
assert.ok(slugs.length > 0, "Nu am gasit niciun articol in content/noutati");
for (const slug of slugs) {
  assert.ok(llms.includes(`/noutati/${slug}`), `llms.txt nu listeaza articolul ${slug}`);
}

console.log("✓ Contractele UI, analytics cookieless și CTR sunt valide");
