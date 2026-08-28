import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [salary, pfa, header, embedLayout, home, widgetScript, widgetPage, widgetDemo, widgetCalculator] = await Promise.all([
  read("src/app/components/CalculatorSalariu.tsx"),
  read("src/app/components/CalculatorPFA.tsx"),
  read("src/app/components/Header.tsx"),
  read("src/app/(embed)/layout.tsx"),
  read("src/app/(site)/page.tsx"),
  read("public/widget.js"),
  read("src/app/(site)/widget/page.tsx"),
  read("src/app/components/WidgetDemo.tsx"),
  read("src/app/components/WidgetCalculator.tsx"),
]);

// Contractul de evenimente Umami a dispărut odată cu instanța, dezafectată pe
// 28 august 2026. Verificarea care conta rămâne, mutată de pe forma
// payload-ului pe codul de client: dacă nu se emite nimic către exterior, nu se
// poate scurge nicio sumă. Testul cade dacă reapare un apel de tracking.
for (const sursa of [salary, pfa, home, widgetCalculator]) {
  assert.doesNotMatch(sursa, /trackUmami|umami\?\.track|"\/api\/send"/, "A reapărut un apel de tracking");
}
assert.match(salary, /if \(rezTemp\) set\("brut", String\(rezTemp\.netBani\)\)/, "Comutarea brut→net trebuie să folosească netul cash, fără tichetele de pe card");
assert.match(salary, /normaContract[\s\S]*fractieLuna/, "Generatorul trebuie să transmită explicit norma contractuală și fracția de lună");
assert.match(pfa, /<button[\s\S]*role="switch"[\s\S]*aria-checked=/, "Switch-ul PFA trebuie să fie un singur buton semantic");
assert.doesNotMatch(pfa, /<label[^>]*>[\s\S]{0,500}<button[^>]*role="switch"/, "Switch-ul nu poate fi imbricat într-un label");
// Bara de sus are mai multe dropdownuri („Meserii", „Ghiduri"). Starea trebuie
// tinuta PE GRUP: cu un singur boolean partajat se deschideau toate odata, iar
// un `id` hardcodat ar fi duplicat `aria-controls` intre meniuri.
assert.match(header, /aria-expanded=\{desktopOpen === item\.label\}/, "Starea dropdownului trebuie sa fie per grup");
assert.match(header, /aria-controls=\{idGrup\(item\.label\)\}/, "aria-controls trebuie derivat din eticheta grupului");
assert.doesNotMatch(header, /id="desktop-[a-z-]+-menu"/, "Meniurile nu pot avea id hardcodat");
assert.match(header, /groupsOpen\[item\.label\]/, "Accordeonul mobil trebuie sa fie per grup");
assert.match(header, /event\.key === "Escape"/);
assert.doesNotMatch(embedLayout, /stats\.js|umami/i, "Layout-ul embed nu trebuie să activeze analytics");
assert.match(home, /Calculator salariu net 2026: net, taxe și cost angajator/);
assert.match(widgetScript, /credit\.setAttribute\("rel", "nofollow noopener"\)/, "Widgetul trebuie să califice și creditele furnizate de gazdă");
assert.match(widgetScript, /a\.rel = "nofollow noopener"/, "Creditul generat de widget trebuie să fie nofollow");
assert.equal((widgetPage.match(/rel="nofollow noopener"/g) ?? []).length, 3, "Toate cele trei coduri de embed trebuie să aibă credit nofollow");
assert.match(widgetDemo, /rel="nofollow noopener"/, "Demo-ul widgetului trebuie să reproducă atributul nofollow");
assert.match(widgetCalculator, /rel="nofollow noopener"/, "Creditul din iframe trebuie să fie nofollow");
for (const source of [widgetScript, widgetPage, widgetDemo, widgetCalculator, salary, home]) {
  assert.doesNotMatch(source, /contează pentru SEO|motorul de backlink|produce backlink|dofollow|crawlable|crawlabil/i, "Copy-ul widgetului nu trebuie să promită valoare SEO");
}

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
