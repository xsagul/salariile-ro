import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [salary, pfa, header, embedLayout, siteLayout, rootLayout, googlePreferences, csp, home, widgetPage, widgetDemo, widgetCalculator] = await Promise.all([
  read("src/app/components/CalculatorSalariu.tsx"),
  read("src/app/components/CalculatorPFA.tsx"),
  read("src/app/components/Header.tsx"),
  read("src/app/(embed)/layout.tsx"),
  read("src/app/(site)/layout.tsx"),
  read("src/app/layout.tsx"),
  read("src/app/components/ButonPreferinteGoogle.tsx"),
  read("src/lib/csp.ts"),
  read("src/app/(site)/page.tsx"),
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
// Meniul mobil (24 septembrie 2026): sertar din dreapta, cu fundal întunecat.
// Două grupuri deschise depășeau cândva ecranul fără scroll, cu pagina din spate
// blocată. Acum lista are scroll propriu, iar acordeonul ține un singur grup
// deschis odată (o singură stare, nu una pe grup).
assert.match(header, /id="meniu-mobil"[\s\S]*inert=\{!open\}[\s\S]*style=\{\{ top: susSertar \}\}/, "Sertarul mobil e inert când e închis și pornește de sub bara de sus");
assert.match(header, /aria-label=\{open \? "Închide meniul" : "Deschide meniul"\}/, "Butonul de meniu devine X pe loc");
assert.match(header, /<nav aria-label="Meniu principal" className="[^"]*overflow-y-auto[^"]*overscroll-contain/, "Lista din sertar trebuie să aibă scroll propriu");
assert.match(header, /useState<string \| null>\(\s*\(\) => NAV\.filter\(isGroup\)/, "Acordeonul mobil ține un singur grup deschis");
assert.doesNotMatch(header, /groupsOpen/, "Nu reveni la o stare pe grup: se deschideau mai multe odată");
assert.match(header, /aria-controls="meniu-mobil"/, "Butonul de meniu trebuie legat de sertar");
assert.match(header, /event\.key === "Escape"/);
// Testul A/B/C al barei de sus (24 septembrie – 8 octombrie 2026): varianta vine
// doar din cookie-ul `_ga`, care există numai după acord. Nimic nou pe dispozitiv.
assert.match(header, /variantaNavbarDinCookie\(document\.cookie\)/, "Varianta barei se citește din cookie-ul GA4");
assert.doesNotMatch(header, /localStorage|sessionStorage|document\.cookie\s*=/, "Testul barei nu scrie nimic pe dispozitiv");
assert.match(header, /useState<VariantaNavbar>\("a"\)/, "Fără acord și la randarea statică, bara rămâne ca până acum");
assert.match(header, /if \(navbar !== "b"\) return;\s*const radacina = document\.documentElement;\s*radacina\.style\.scrollPaddingTop/, "Cu bara lipită, derularea la rezultat se oprește sub bară");
assert.match(header, /if \(previzualizare\) \{\s*setNavbar\(previzualizare\);[^\n]*\n\s*return;/, "Previzualizarea `?navbar=` nu se raportează la GA4");
assert.doesNotMatch(embedLayout, /stats\.js|umami/i, "Layout-ul embed nu trebuie să activeze analytics");
assert.doesNotMatch(embedLayout, /adsbygoogle|googlesyndication|googletagmanager|google-analytics/i, "Layout-ul embed nu trebuie să activeze AdSense sau GA4");
assert.match(siteLayout, /ca-pub-5894290637571256[\s\S]*google-adsense-account/, "Verificarea AdSense trebuie să rămână în meta tag");
assert.match(siteLayout, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/, "Scriptul AdSense trebuie să publice CMP-ul Google");
assert.doesNotMatch(siteLayout + rootLayout, /<ins[^>]+adsbygoogle|adsbygoogle\.push/, "Codul nu trebuie să conțină unități de reclamă");
assert.match(rootLayout, /google-consent-default[\s\S]*strategy="beforeInteractive"[\s\S]*analytics_storage':'denied'/, "Consent Mode trebuie inițializat pe denied înaintea tagurilor");
assert.match(rootLayout, /googlefc\.callbackQueue=window\.googlefc\.callbackQueue\|\|\[\]/, "Coada API a CMP-ului trebuie inițializată înaintea scriptului AdSense");
assert.match(siteLayout, /googletagmanager\.com\/gtag\/js/, "Layout-ul public trebuie să încarce Google tag");
assert.match(siteLayout, /<Masurare \/>/, "Layout-ul public trebuie să monteze măsurarea GA4");
assert.doesNotMatch(embedLayout, /Masurare|@\/lib\/analytics/, "Widgeturile nu trebuie măsurate");

// GA4, 18 septembrie 2026: calculatorul scrie `?brut=6000` în bară, iar GA4
// trimitea adresa la fiecare schimbare — suma pleca la Google și fiecare calcul
// devenea o afișare falsă. Afișările se trimit acum din cod, cu adresa curățată,
// iar în GA4 Admin afișările pe istoricul browserului sunt oprite.
const analyticsPath = "../src/lib/analytics.ts";
const { adresaFaraSume, clasaViewport, GA_MEASUREMENT_ID } = (await import(analyticsPath)) as typeof import("../src/lib/analytics");
assert.equal(GA_MEASUREMENT_ID, "G-2L1J64H5H9", "Fluxul GA4 trebuie să rămână cel al site-ului");
assert.equal(adresaFaraSume("https://salariile.ro/?brut=6000"), "https://salariile.ro/");
assert.equal(adresaFaraSume("https://salariile.ro/?net=3500#rezultat"), "https://salariile.ro/");
assert.equal(adresaFaraSume("https://salariile.ro/?salariu-input=7.823"), "https://salariile.ro/");
assert.equal(
  adresaFaraSume("https://salariile.ro/?brut=6000&utm_source=reddit&utm_medium=social"),
  "https://salariile.ro/?utm_source=reddit&utm_medium=social",
  "Parametrii de campanie trebuie să rămână",
);
assert.equal(adresaFaraSume(""), "");
assert.equal(clasaViewport(393), "360-399");
assert.equal(clasaViewport(768), "768-1023");
assert.equal(clasaViewport(1920), ">=1536");
{
  const { variantaNavbarDinCookie } = (await import(analyticsPath)) as typeof import("../src/lib/analytics");
  assert.equal(variantaNavbarDinCookie("alt=1"), null, "Fără cookie GA4 nu există test");
  assert.equal(adresaFaraSume("https://salariile.ro/?navbar=c"), "https://salariile.ro/", "Previzualizarea variantei nu ajunge în GA4");
  const numar = { a: 0, b: 0, c: 0 };
  for (let i = 0; i < 3000; i++) numar[variantaNavbarDinCookie(`_ga=GA1.1.${1000000 + i * 7919}.${1790000000 + i}`)!]++;
  for (const n of Object.values(numar)) assert.ok(n > 900 && n < 1100, `Variantele barei trebuie împărțite egal: ${JSON.stringify(numar)}`);
}

const [masurare, analytics] = await Promise.all([read("src/app/components/Masurare.tsx"), read("src/lib/analytics.ts")]);
assert.match(masurare, /const adresa = adresaFaraSume\(window\.location\.href\)/, "Adresa trimisă la GA4 trebuie curățată de sume");
assert.match(masurare, /page_location: adresa/, "page_location trebuie să fie adresa curățată");
assert.match(masurare, /send_page_view: false[\s\S]*allow_google_signals: false[\s\S]*allow_ad_personalization_signals: false/, "GA4 fără afișare automată, fără Signals și fără personalizare publicitară");
// `gtag("set", {viewport})` nu ajunge în GA4 (verificat în producție): parametrii
// comuni trebuie lipiți pe fiecare eveniment, iar clasa ferestrei e proprietate de utilizator.
assert.match(masurare, /seteazaParametriComuni\(\{ viewport:/, "Viewportul trebuie trimis pe fiecare eveniment, nu prin gtag set");
assert.match(masurare, /gtag\("set", "user_properties", \{ viewport_clasa \}\)/, "Clasa ferestrei trebuie să fie proprietate de utilizator");
assert.match(masurare, /DOMENII_MASURATE\.has\(window\.location\.hostname\)/, "GA4 se configurează doar pe domeniul de producție");
assert.doesNotMatch(siteLayout + masurare + analytics, /anonymize_ip/, "anonymize_ip nu există în GA4 și ar pleca drept parametru inutil");
assert.match(salary, /action=\{embedded \? undefined : pathname\}/, "Formularul nu trebuie să aibă `?brut=` ca destinație (form_destination în GA4)");

// Fiecare calculator raportează calculul, iar niciun eveniment nu poartă suma.
const calculatoare = [
  "CalculatorSalariu", "CalculatorPFA", "CalculatorInvatamant", "CalculatorSanatate", "CalculatorSomaj",
  "CalculatorOreSuplimentare", "CalculatorPartTime", "CalculatorIntervalZile",
];
for (const nume of calculatoare) {
  const sursa = await read(`src/app/components/${nume}.tsx`);
  assert.match(sursa, /masoaraCalcul\(/, `${nume} trebuie să trimită evenimentul calcul`);
}
for (const nume of [...calculatoare, "FiltruMeserii", "EmbedCode", "Masurare"]) {
  const sursa = await read(`src/app/components/${nume}.tsx`);
  for (const apel of sursa.matchAll(/(?:masoaraCalcul|trimiteEveniment)\(([\s\S]*?)\);/g)) {
    assert.doesNotMatch(
      apel[1],
      /\binput\b|parseFloat|parseInt|Number\(|rezAfisat|brutEfectiv|firma|incasari|\bmedia\b|\bbaza\b|location\.href/,
      `${nume}: un eveniment GA4 pare să poarte o sumă sau adresa brută: ${apel[0].slice(0, 120)}`,
    );
  }
}

assert.match(googlePreferences, /CONSENT_API_READY[\s\S]*showRevocationMessage/, "Setările cookies trebuie să redeschidă mesajul Google");
assert.match(csp, /ADSENSE_SCRIPT[\s\S]*ADSENSE_FRAME[\s\S]*ADSENSE_CONNECT/, "CSP-ul public trebuie să permită CMP-ul AdSense");
assert.equal((await read("public/ads.txt")).trim(), "google.com, pub-5894290637571256, DIRECT, f08c47fec0942fa0", "ads.txt trebuie să autorizeze numai contul AdSense al site-ului");
assert.match(home, /Calculator salariu net 2026 - Brut în net și invers/);

// Widgeturile sunt acum cod HTML copiat explicit de publisher, fără vechiul
// public/widget.js. Creditul extern rămâne vizibil și la alegerea publisherului.
assert.doesNotMatch(widgetPage, /widget\.js/, "Pagina /widget nu trebuie să mai depindă de vechiul public/widget.js");
assert.doesNotMatch(widgetPage, /rel="nofollow noopener"/, "Codurile de embed nu trebuie să forțeze nofollow pe creditul extern");
assert.doesNotMatch(widgetDemo, /rel="nofollow noopener"/, "Demo-ul trebuie să reproducă creditul extern fără nofollow forțat");
assert.match(widgetCalculator, /rel="nofollow noopener"/, "Creditul informativ din iframe-ul minimalist rămâne calificat separat");
assert.doesNotMatch(widgetPage, /stableResizeCode/, "Widgeturile nu trebuie să rezerve înălțimi mobile uriașe");
assert.match(widgetPage, /const AUTO_RESIZE_CODE = `<script>/, "Codurile de embed trebuie să includă auto-resize după conținut");
assert.match(widgetPage, /frame\.style\.height = nextHeight \+ "px"/, "Iframe-ul trebuie să urmeze înălțimea reală raportată de conținut");
assert.match(widgetDemo, /setHeight\(\(current\) => Math\.abs\(nextHeight - current\) >= 8 \? nextHeight : current\)/, "Demo-ul trebuie să urmeze aceeași regulă de auto-height");
for (const source of [widgetPage, widgetDemo, widgetCalculator, salary, home]) {
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

// Pre-încărcarea automată a link-urilor consuma Edge Requests pe planul Hobby:
// măsurat pe 11 septembrie 2026, 113 din 143 de cereri ale unei vizite pe
// homepage erau pre-încărcări. Toate link-urile trec prin wrapperul fără prefetch.
const { sep } = await import("node:path");
const extensiiSursa = [".ts", ".tsx", ".js", ".jsx"];
const fisiereSrc = (await readdir(new URL("../src", import.meta.url), { recursive: true }))
  .map((f) => String(f).split(sep).join("/"))
  .filter((f) => extensiiSursa.some((ext) => f.endsWith(ext)) && f !== "app/components/Link.tsx");
for (const f of fisiereSrc) {
  const sursa = await read(`src/${f}`);
  assert.ok(
    !sursa.includes('from "next/link"') && !sursa.includes("from 'next/link'"),
    `${f} importă next/link direct; folosește @/app/components/Link`,
  );
}
// Scara titlurilor are un singur proprietar: TITLU_PAGINA și TITLU_SECTIUNE din
// ui.tsx (26/30/36 și 20/22/24 px). Un h1 sau h2 cu mărime scrisă de mână
// reintroduce amestecul măsurat pe 25 septembrie 2026.
const marimiVechi = /<h[12][^>]*className="[^"]*(?:sm:)?text-(?:3xl|4xl|\[1\.625rem\])/;
for (const f of fisiereSrc) {
  const sursa = await read(`src/${f}`);
  assert.ok(!marimiVechi.test(sursa), `${f} are un titlu cu mărime proprie; folosește TITLU_PAGINA / TITLU_SECTIUNE din ui.tsx`);
}
const ui = await read("src/app/components/ui.tsx");
assert.ok(
  ui.includes('"text-[26px] font-bold leading-tight tracking-[-0.02em] text-stone-900 lg:text-[30px] 2xl:text-4xl"'),
  "TITLU_PAGINA trebuie să rămână 26 px pe telefon și tabletă, 30 pe laptop mic, 36 pe ecran mare",
);
assert.ok(
  (await read("src/app/components/Link.tsx")).includes("prefetch = false"),
  "Wrapperul Link trebuie să oprească pre-încărcarea implicit",
);

console.log("✓ Contractele UI, analytics cu consimțământ și CTR sunt valide");
