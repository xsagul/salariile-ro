import { once } from "node:events";
import path from "node:path";
import { spawn } from "node:child_process";

const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const PROJECT_ROOT = process.cwd();
const NEXT_BIN = path.join(PROJECT_ROOT, "node_modules", "next", "dist", "bin", "next");

const server = spawn(process.execPath, [NEXT_BIN, "start", "-p", String(PORT)], {
  cwd: PROJECT_ROOT,
  env: { ...process.env, NODE_ENV: "production" },
  stdio: ["ignore", "pipe", "pipe"],
  windowsHide: true,
});

let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk.toString();
});

const delay = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Serverul Next.js s-a oprit prematur.\n${serverOutput}`);
    }

    try {
      const response = await fetch(`${BASE_URL}/`);
      if (response.ok) return;
    } catch {
      // Serverul inca porneste.
    }

    await delay(250);
  }

  throw new Error(`Serverul Next.js nu a pornit la ${BASE_URL}.\n${serverOutput}`);
}

function decodeXml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function canonicalFrom(html: string) {
  const tag = html.match(/<link\b(?=[^>]*\brel="canonical")[^>]*>/i)?.[0];
  return tag?.match(/\bhref="([^"]+)"/i)?.[1] ?? "";
}

function decodeHtml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&#x2F;", "/");
}

function titleFrom(html: string) {
  return decodeHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim();
}

function metaDescriptionFrom(html: string) {
  const tag = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map(([match]) => match)
    .find((match) => /\bname=["']description["']/i.test(match));
  return decodeHtml(tag?.match(/\bcontent="([^"]*)"/i)?.[1] ?? "").trim();
}

function hasNoindex(html: string) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].some(([tag]) => {
    const name = tag.match(/\bname=["']([^"']+)["']/i)?.[1]?.toLowerCase();
    const content = tag.match(/\bcontent=["']([^"']+)["']/i)?.[1]?.toLowerCase() ?? "";
    return name === "robots" && content.split(/[\s,]+/).includes("noindex");
  });
}

function jsonLdBlocks(html: string) {
  return [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]));
}

async function auditRenderedSite() {
  await waitForServer();

  const sitemapResponse = await fetch(`${BASE_URL}/sitemap.xml`);
  if (!sitemapResponse.ok) {
    throw new Error(`sitemap.xml a raspuns cu HTTP ${sitemapResponse.status}.`);
  }

  const sitemap = await sitemapResponse.text();
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    decodeXml(match[1]),
  );
  if (locations.length === 0) throw new Error("Sitemapul nu contine URL-uri.");

  const failures: string[] = [];
  const rendered = new Map<string, string>();
  let jsonLdBlockCount = 0;

  await Promise.all(
    locations.map(async (location) => {
      const localUrl = location.replace("https://salariile.ro", BASE_URL);
      try {
        const response = await fetch(localUrl);
        const html = await response.text();
        const pathname = new URL(location).pathname;
        rendered.set(pathname, html);

        const h1Count = html.match(/<h1(?:\s[^>]*)?>/gi)?.length ?? 0;
        const mainCount = html.match(/<main(?:\s[^>]*)?>/gi)?.length ?? 0;
        const canonical = canonicalFrom(html);
        if (response.status !== 200) failures.push(`${location}: HTTP ${response.status}`);
        if (h1Count !== 1) failures.push(`${location}: ${h1Count} elemente H1`);
        if (mainCount !== 1) failures.push(`${location}: ${mainCount} elemente main`);
        if (canonical !== location) failures.push(`${location}: canonical ${canonical || "lipsa"}`);

        try {
          jsonLdBlockCount += jsonLdBlocks(html).length;
        } catch (error) {
          failures.push(
            `${location}: JSON-LD invalid (${error instanceof Error ? error.message : String(error)})`,
          );
        }

        if (pathname.startsWith("/calculator/")) {
          const internalLinks = [
            ...html.matchAll(/<a\b[^>]*href="(\/calculator\/[^"]+)"[^>]*>/gi),
          ].map((match) => match[1]);
          if (internalLinks.length < 2) {
            failures.push(`${location}: link graph insuficient (${internalLinks.length} linkuri)`);
          }
        }

        // Clusterul de meserii: fiecare pagina de meserie trebuie sa citeze
        // sursa INS si sa trimita inapoi in cluster, altfel devine o frunza
        // izolata cu o cifra fara provenienta.
        if (pathname.startsWith("/salarii/")) {
          const linkuriCluster = [
            ...html.matchAll(/<a\b[^>]*href="(\/(?:salarii|compara)(?:\/[^"]*)?)"[^>]*>/gi),
          ].map((match) => match[1]);
          if (linkuriCluster.length < 3) {
            failures.push(`${location}: link graph insuficient (${linkuriCluster.length} linkuri in cluster)`);
          }
          if (!html.includes("TEMPO-Online")) {
            failures.push(`${location}: nu citeaza sursa INS TEMPO-Online`);
          }
          // Regula cere ca o cifra sa aiba clasificarea declarata. Majoritatea
          // paginilor se sprijina pe CAEN, dar cele construite dinspre OCUPATIE
          // — diferenta pe sexe si locurile vacante — se sprijina pe grupele
          // majore ISCO-08. Le cerem ISCO, nu le exceptam de la regula.
          const PAGINI_ISCO = ["/salarii/femei-barbati", "/salarii/locuri-vacante"];
          const clasificareCeruta = PAGINI_ISCO.includes(pathname) ? /ISCO/ : /CAEN\s/;
          if (!clasificareCeruta.test(html)) {
            failures.push(`${location}: nu declara clasificarea din spatele cifrei`);
          }
        }
      } catch (error) {
        failures.push(`${location}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
  );

  const expectedGscCalculatorPaths = [
    "/calculator/calcul-salariu-net-4582-brut",
    "/calculator/calcul-salariu-net-20000-brut",
    "/calculator/calcul-salariu-brut-2574-net",
    "/calculator/calcul-salariu-brut-2700-net",
    "/calculator/calcul-salariu-brut-3200-net",
    "/calculator/calcul-salariu-brut-7000-net",
  ] as const;

  for (const pathname of expectedGscCalculatorPaths) {
    if (!rendered.has(pathname)) failures.push(`${pathname}: valoarea GSC lipseste din sitemap`);
  }

  const contentChecks = [
    ["/calculator/calcul-salariu-net-4050-brut", "2.574", "netul S1 pentru 4.050 brut"],
    ["/calculator/calcul-salariu-brut-2574-net", "4.050", "brutul S1 pentru 2.574 net"],
    ["/calculator/calcul-salariu-brut-2574-net", "facilitate de 300 lei", "regimul istoric S1 pentru 2.574 net"],
    ["/calculator/calcul-salariu-net-4582-brut", "2.754", "netul curent pentru 4.582 brut"],
    ["/calculator-pfa", "24.300", "pragul salarial PFA"],
    ["/salariu-mediu", "9.483", "brutul INS din mai"],
    ["/salariu-mediu", "5.684", "netul INS din mai"],
    ["/", "indicatorul BASS", "eticheta BASS de pe homepage"],
    ["/metodologie", "D112", "validarea D112"],
    ["/noutati/cosul-minim-de-consum", "11.370", "cosul pentru doi adulti si doi copii"],
    // Clusterul de meserii. Verificam eticheta, nu cifra: cifrele se schimba la
    // fiecare rulare `npm run ins:tempo`, dar promisiunea paginii — sa spuna ce
    // masoara si de unde vine — nu are voie sa dispara.
    ["/salarii", "TEMPO-Online", "citarea sursei INS pe hubul de meserii"],
    ["/salarii", "grupe majore de ocupații", "a doua masuratoare, dinspre ocupatie"],
    ["/salarii/programator", "CAEN 62", "activitatea din spatele cifrei de programator"],
    // Pagina de meserie raspunde cu un INTERVAL, nu cu media sectorului: cele
    // doua masuratori INS (activitate si grupa de ocupatii) incadreaza ocupatia
    // si, spre deosebire de cifra de sector singura, o si diferentiaza de
    // meseriile vecine. Verificam ca ambele capete si eticheta lor sunt in
    // pagina, plus nota care spune de ce cifra pe ocupatii e indexata.
    ["/salarii/programator", "Estimare net, pe lună", "intervalul net estimat, calculat cu motorul fiscal"],
    ["/salarii/programator", "Grupa de ocupații, indexat", "capatul dinspre ocupatie, adus la luna curenta"],
    ["/salarii/programator", "Cum citești intervalul", "explicatia metodei direct in pagina"],
    ["/salarii/asistent-medical", "Tehnicieni", "grupa de ocupatii care separa asistentul de medic"],
    ["/salarii/medic", "Specialiști", "grupa de ocupatii a medicului"],
    // Diferenta pe sexe: date care existau in matricea INS de la inceput, dar
    // pe care importul le arunca. Verificam eticheta si avertismentul de
    // interpretare, nu cifra — cifra se schimba la fiecare `npm run ins:tempo`,
    // dar pagina nu are voie sa ramana fara precizarea ca NU masoara
    // discriminarea la post egal.
    ["/salarii/femei-barbati", "Ce NU spune cifra", "avertismentul de interpretare"],
    ["/salarii/femei-barbati", "post egal", "precizarea ca nu se masoara diferenta la post egal"],
    ["/salarii/femei-barbati", "FOM121B", "citarea matricei INS"],
    ["/salarii/medic", "Femei și bărbați", "contextul pe sexe pe pagina de meserie"],
    // Locuri de munca vacante: singura serie TRIMESTRIALA din set. Pagina
    // raspundea doar la „cat se castiga"; asta raspunde la „cat se cauta".
    ["/salarii/programator", "Posturi vacante", "semnalul de cerere pe pagina de meserie"],
    ["/salarii/programator", "LMV102D", "citarea matricei de locuri vacante"],
    ["/salarii/programator", "Cifra e a grupei", "precizarea ca vacantele sunt ale grupei, nu ale meseriei"],
    ["/salarii/locuri-vacante", "Nu sunt anunțuri de angajare", "precizarea ca vacantele INS nu sunt anunturi"],
    ["/salarii/locuri-vacante", "LMV101D", "citarea matricei de rate"],
    ["/salarii/medic", "Cât contează vechimea", "progresia pe varste din ancheta din octombrie"],
    ["/compara", "activități economice diferite", "regula perechilor din sectoare diferite"],
    ["/compara/programator-vs-medic", "Tabel comparativ", "tabelul comparativ"],
    ["/compara/programator-vs-medic", "Cost total angajator", "randul de cost total"],
  ] as const;

  for (const [pathname, expected, label] of contentChecks) {
    if (!rendered.get(pathname)?.includes(expected)) failures.push(`${pathname}: lipseste ${label}`);
  }

  // ── Meseriile din acelasi sector nu au voie sa dea acelasi raspuns ──────────
  // Regresia pazita: cat timp pagina afisa media activitatii CAEN, un medic si
  // un asistent medical primeau EXACT aceeasi cifra, desi unul e in grupa
  // „specialisti" si celalalt in „tehnicieni". Descrierea meta e locul unde se
  // vede cel mai repede, fiindca ea ajunge in SERP.
  const perechiCareTrebuieSaDifere: [string, string][] = [
    ["/salarii/medic", "/salarii/asistent-medical"],
    ["/salarii/avocat", "/salarii/secretar"],
    ["/salarii/inginer", "/salarii/muncitor-industria-alimentara"],
  ];
  for (const [unu, altul] of perechiCareTrebuieSaDifere) {
    const a = metaDescriptionFrom(rendered.get(unu) ?? "");
    const b = metaDescriptionFrom(rendered.get(altul) ?? "");
    const cifre = (text: string) => (text.match(/[\d.]+–[\d.]+/g) ?? []).join("|");
    if (a && b && cifre(a) && cifre(a) === cifre(b)) {
      failures.push(`${unu} si ${altul}: acelasi interval in descriere (${cifre(a)}) — meseriile nu se diferentiaza`);
    }
  }

  // ── SERP: titlul si descrierea trebuie sa contina RASPUNSUL, nu intrebarea ──
  // Titlu peste 60 de caractere se trunchiaza; descrierea care incepe cu un verb
  // la imperativ (call-to-action) este ignorata de Google, care alege alt text
  // din pagina — in trecut, meniul de navigatie.
  const TITLE_MAX_LENGTH = 60;
  const DESCRIPTION_MIN_LENGTH = 110;
  const DESCRIPTION_MAX_LENGTH = 165;

  const strictTitlePaths = new Set([
    "/salariu-minim-constructii-2026",
    "/deducere-personala-2026",
  ]);
  const titluriLungi: string[] = [];

  for (const [pathname, html] of rendered) {
    const title = titleFrom(html);
    const description = metaDescriptionFrom(html);

    if (title.length > TITLE_MAX_LENGTH) {
      const raport = `${pathname} (${title.length}): ${title}`;
      const clusterStrict =
        pathname.startsWith("/calculator/") ||
        pathname.startsWith("/salarii") ||
        pathname.startsWith("/compara");
      if (clusterStrict || strictTitlePaths.has(pathname)) {
        failures.push(`${raport} — title peste ${TITLE_MAX_LENGTH} caractere`);
      } else {
        titluriLungi.push(raport);
      }
    }
    if (!description) {
      failures.push(`${pathname}: meta description lipseste`);
    }

    if (!pathname.startsWith("/calculator/")) continue;

    // Formatul de titlu-raspuns: "5.000 lei brut în net = 2.981 lei (2026)".
    const titleMatch = title.match(
      /^([\d.]+) lei (brut în net|net în brut) = ([\d.]+) lei \((?:2026|ian\.–iun\. 2026)\)/,
    );
    if (!titleMatch) {
      failures.push(`${pathname}: titlul nu contine raspunsul ("${title}")`);
      continue;
    }

    const [, intrare, , rezultat] = titleMatch;
    const slugValue = pathname.match(/-(\d+)-(?:brut|net)$/)?.[1] ?? "";
    if (intrare.replaceAll(".", "") !== slugValue) {
      failures.push(`${pathname}: titlul foloseste alta valoare de intrare (${intrare})`);
    }
    if (!html.includes(rezultat)) {
      failures.push(`${pathname}: cifra rezultat ${rezultat} din titlu lipseste din pagina`);
    }
    if (!description.startsWith(rezultat)) {
      failures.push(`${pathname}: descrierea nu incepe cu cifra rezultat ("${description}")`);
    }
    if (!/CAS .*CASS .*impozit/.test(description)) {
      failures.push(`${pathname}: descrierea nu contine defalcarea CAS/CASS/impozit`);
    }
    if (/^(Calculează|Află|Vezi|Descoperă)/i.test(description)) {
      failures.push(`${pathname}: descrierea incepe cu un call-to-action`);
    }
    if (
      description.length < DESCRIPTION_MIN_LENGTH ||
      description.length > DESCRIPTION_MAX_LENGTH
    ) {
      failures.push(`${pathname}: descriere de ${description.length} caractere`);
    }

    // Paragraful-raspuns dinaintea calculatorului trebuie sa contina cifra si
    // defalcarea, ca sa fie extractabil de LLM-uri si de featured snippets.
    const leadStart = html.indexOf("</h1>");
    const lead = leadStart >= 0 ? html.slice(leadStart, leadStart + 2500) : "";
    for (const necesar of [rezultat, "CAS", "CASS", "impozit", "costul total al angajatorului"]) {
      if (!lead.includes(necesar)) {
        failures.push(`${pathname}: paragraful-raspuns nu contine "${necesar}"`);
      }
    }
  }

  // Descrierile rescrise dupa ce Google le-a inlocuit cu meniul de navigatie.
  const descriptionAnswers = [
    ["/salariu-minim-constructii-2026", "4.582 lei brut", "2.754 lei net"],
    ["/deducere-personala-2026", "865 lei", "1.946 lei"],
  ] as const;
  for (const [pathname, ...asteptate] of descriptionAnswers) {
    const description = metaDescriptionFrom(rendered.get(pathname) ?? "");
    for (const asteptat of asteptate) {
      if (!description.includes(asteptat)) {
        failures.push(`${pathname}: descrierea nu contine "${asteptat}" ("${description}")`);
      }
    }
  }

  const editorialTable = rendered.get("/noutati/salariul-minim-1-iulie-2026") ?? "";
  if (!/<th\b[^>]*scope="col"[^>]*>\s*Indicator\s*<\/th>/i.test(editorialTable)) {
    failures.push("/noutati/salariul-minim-1-iulie-2026: antetul de coloană al tabelului nu are scope");
  }
  if (!/<th\b[^>]*scope="row"[^>]*>\s*Salariul minim brut\s*<\/th>/i.test(editorialTable)) {
    failures.push("/noutati/salariul-minim-1-iulie-2026: primul câmp al rândului nu este antet semantic");
  }

  const widgetPage = rendered.get("/widget") ?? "";
  if (!widgetPage.includes("/widget/frame?variant=complet")) {
    failures.push("/widget: lipseste codul de integrare pentru widgetul complet");
  }
  if (!widgetPage.includes("/widget/frame/fluturas")) {
    failures.push("/widget: lipseste codul de integrare pentru widgetul fluturas");
  }
  if (/widget\.js/i.test(widgetPage)) {
    failures.push("/widget: varianta widget.js nu trebuia sa mai fie publicata");
  }

  const minimalSnippetStart = widgetPage.indexOf("https://salariile.ro/widget/frame&quot;");
  const completeSnippetStart = widgetPage.indexOf(
    "https://salariile.ro/widget/frame?variant=complet&quot;",
  );
  const payslipSnippetStart = widgetPage.indexOf(
    "https://salariile.ro/widget/frame/fluturas&quot;",
  );
  const minimalSnippet = minimalSnippetStart >= 0
    ? widgetPage.slice(minimalSnippetStart, minimalSnippetStart + 500)
    : "";
  const completeSnippet = completeSnippetStart >= 0
    ? widgetPage.slice(completeSnippetStart, completeSnippetStart + 500)
    : "";
  const payslipSnippet = payslipSnippetStart >= 0
    ? widgetPage.slice(payslipSnippetStart, payslipSnippetStart + 500)
    : "";
  if (!minimalSnippet.includes("scrolling=&quot;no&quot;")) {
    failures.push('/widget: snippetul minimalist trebuie sa pastreze scrolling="no"');
  }
  if (completeSnippet.includes("scrolling=&quot;no&quot;")) {
    failures.push('/widget: snippetul complet nu trebuie sa blocheze scrollul intern');
  }
  if (payslipSnippet.includes("scrolling=&quot;no&quot;")) {
    failures.push('/widget: snippetul fluturas nu trebuie sa blocheze scrollul intern');
  }

  const frameSitemapEntries = locations.filter(
    (location) => new URL(location).pathname.startsWith("/widget/frame"),
  );
  if (frameSitemapEntries.length > 0) {
    failures.push(`/widget/frame: iframe-ul nu trebuie sa apara in sitemap (${frameSitemapEntries.join(", ")})`);
  }

  const widgetFrames = [
    {
      pathname: "/widget/frame",
      label: "minimal",
      kind: "minimal",
      canonical: "https://salariile.ro/widget",
    },
    {
      pathname: "/widget/frame?variant=complet",
      label: "complet",
      kind: "complete",
      canonical: "https://salariile.ro/widget",
    },
    {
      pathname: "/widget/frame/fluturas",
      label: "fluturas",
      kind: "payslip",
      canonical: "https://salariile.ro/fluturas-salariu",
    },
  ] as const;

  for (const { pathname, label, kind, canonical: expectedCanonical } of widgetFrames) {
    try {
      const response = await fetch(`${BASE_URL}${pathname}`);
      const html = await response.text();
      const mainCount = html.match(/<main(?:\s[^>]*)?>/gi)?.length ?? 0;
      const headerCount = html.match(/<header(?:\s[^>]*)?>/gi)?.length ?? 0;
      const footerCount = html.match(/<footer(?:\s[^>]*)?>/gi)?.length ?? 0;
      const canonical = canonicalFrom(html);
      const csp = response.headers.get("content-security-policy") ?? "";

      if (response.status !== 200) failures.push(`${pathname}: HTTP ${response.status}`);
      if (!hasNoindex(html)) failures.push(`${pathname}: meta robots noindex lipseste`);
      if (canonical !== expectedCanonical) {
        failures.push(`${pathname}: canonical ${canonical || "lipsa"}`);
      }
      if (mainCount !== 1) failures.push(`${pathname}: ${mainCount} elemente main`);
      if (headerCount !== 0) failures.push(`${pathname}: ${headerCount} elemente header`);
      if (footerCount !== 0) failures.push(`${pathname}: ${footerCount} elemente footer`);
      if (!/(?:^|;)\s*frame-ancestors\s+\*(?:\s*;|$)/i.test(csp)) {
        failures.push(`${pathname}: CSP fara frame-ancestors *`);
      }
      if (response.headers.has("x-frame-options")) {
        failures.push(`${pathname}: X-Frame-Options blocheaza integrarea externa`);
      }
      if (kind !== "minimal" && !html.includes("Date salariale")) {
        failures.push(`${pathname}: lipseste sectiunea Date salariale`);
      }
      if (kind === "complete" && !html.includes("Rezultat calcul")) {
        failures.push(`${pathname}: lipseste sectiunea Rezultat calcul`);
      }
      if (kind === "payslip" && !html.includes("Fluturaș de salariu")) {
        failures.push(`${pathname}: lipseste rezultatul pentru fluturas`);
      }
      if (kind === "payslip" && !html.includes("Salariu de bază (brut)")) {
        failures.push(`${pathname}: lipseste formularul generatorului de fluturas`);
      }

      console.log(`Widget ${label} verificat: ${pathname}`);
    } catch (error) {
      failures.push(`${pathname}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const rejectedCalculatorPaths = [
    "/calculator/calcul-salariu-net-5551-brut",
    "/calculator/calcul-salariu-net-00004325-brut",
  ] as const;

  for (const pathname of rejectedCalculatorPaths) {
    const response = await fetch(`${BASE_URL}${pathname}`);
    if (response.status !== 404) {
      failures.push(`${pathname}: trebuia HTTP 404, a raspuns ${response.status}`);
    }
  }

  const retiredInfoResponse = await fetch(`${BASE_URL}/info`);
  if (retiredInfoResponse.status !== 410) {
    failures.push(`/info: trebuia HTTP 410, a răspuns ${retiredInfoResponse.status}`);
  }
  if (!retiredInfoResponse.headers.get("x-robots-tag")?.includes("noindex")) {
    failures.push("/info: lipsește X-Robots-Tag noindex");
  }

  const calculatorPaths = [...rendered.keys()].filter((pathname) =>
    pathname.startsWith("/calculator/"),
  );
  for (const targetPath of calculatorPaths) {
    const hasInboundLink = [...rendered.entries()].some(
      ([sourcePath, html]) =>
        sourcePath !== targetPath &&
        new RegExp(`<a\\b[^>]*href="${targetPath.replaceAll("/", "\\/")}"`, "i").test(html),
    );
    if (!hasInboundLink) failures.push(`${targetPath}: fara link intern de intrare`);
  }

  const depths = new Map<string, number>([["/", 0]]);
  const queue = ["/"];
  while (queue.length > 0) {
    const sourcePath = queue.shift()!;
    const sourceDepth = depths.get(sourcePath)!;
    const sourceHtml = rendered.get(sourcePath) ?? "";
    const hrefs = [...sourceHtml.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/gi)]
      .map((match) => {
        try {
          const url = new URL(match[1], "https://salariile.ro");
          return url.origin === "https://salariile.ro" ? url.pathname : "";
        } catch {
          return "";
        }
      })
      .filter((pathname) => rendered.has(pathname));

    for (const targetPath of hrefs) {
      if (depths.has(targetPath)) continue;
      depths.set(targetPath, sourceDepth + 1);
      queue.push(targetPath);
    }
  }

  const deepCalculatorPaths = calculatorPaths
    .map((pathname) => ({ pathname, depth: depths.get(pathname) ?? Number.POSITIVE_INFINITY }))
    .filter(({ depth }) => depth > 3);
  if (deepCalculatorPaths.length > 0) {
    failures.push(
      `calculator: adâncime peste 3 clickuri (${deepCalculatorPaths
        .map(({ pathname, depth }) => `${pathname}=${depth}`)
        .join(", ")})`,
    );
  }

  const markdownResponse = await fetch(`${BASE_URL}/salariu-minim`, {
    headers: { Accept: "text/markdown" },
  });
  const markdownBody = await markdownResponse.text();
  if (markdownResponse.status !== 200) {
    failures.push(`/salariu-minim Accept markdown: HTTP ${markdownResponse.status}`);
  }
  if (!markdownResponse.headers.get("content-type")?.includes("text/markdown")) {
    failures.push("/salariu-minim Accept markdown: Content-Type incorect");
  }
  if (!markdownBody.includes("# Salariul minim")) {
    failures.push("/salariu-minim Accept markdown: continutul principal lipseste");
  }

  const rejectedMarkdownPaths = [
    "/api/markdown/calculator/calcul-salariu-net-5551-brut",
    "/api/markdown/api/markdown/salariu-minim",
  ] as const;
  for (const pathname of rejectedMarkdownPaths) {
    const response = await fetch(`${BASE_URL}${pathname}`);
    if (response.status !== 404) {
      failures.push(`${pathname}: trebuia HTTP 404, a raspuns ${response.status}`);
    }
  }

  const publicAssetResponse = await fetch(`${BASE_URL}/og-image.png`);
  const assetCacheControl = publicAssetResponse.headers.get("cache-control") || "";
  if (assetCacheControl.includes("immutable")) {
    failures.push("/og-image.png: fisier public nehashuit servit immutable");
  }
  if (publicAssetResponse.headers.has("content-security-policy")) {
    failures.push("/og-image.png: middleware-ul HTML ruleaza inutil pe asset static");
  }

  if (jsonLdBlockCount === 0) failures.push("Nu a fost gasit niciun bloc JSON-LD.");

  const salary4050 = rendered.get("/calculator/calcul-salariu-net-4050-brut") ?? "";
  const schemaNodes = jsonLdBlocks(salary4050).flatMap((block) =>
    Array.isArray(block["@graph"]) ? block["@graph"] : [block],
  );
  const webPage = schemaNodes.find((block) => block["@type"] === "WebPage");
  if (!webPage || typeof webPage.name !== "string") {
    failures.push("/calculator/calcul-salariu-net-4050-brut: WebPage.name nu este string");
  }

  if (titluriLungi.length > 0) {
    console.log(`AVERTISMENT: ${titluriLungi.length} titluri peste ${TITLE_MAX_LENGTH} caractere in afara clusterelor verificate strict:`);
    for (const raport of titluriLungi) console.log(`  - ${raport}`);
  }

  console.log(`Rute din sitemap verificate: ${locations.length}`);
  console.log(`Blocuri JSON-LD parsate: ${jsonLdBlockCount}`);
  console.log(`Verificari P0/P1 de continut: ${contentChecks.length + 1}`);

  if (failures.length > 0) {
    throw new Error(`Auditul randat a esuat:\n- ${failures.join("\n- ")}`);
  }

  console.log("OK: HTTP 200, un singur H1/main si canonical corect pe toate rutele.");
  console.log("OK: JSON-LD valid, allowlist inchis, link graph si valorile GSC au trecut.");
  console.log("OK: Markdown allowlist/negociere si headerele asseturilor au trecut.");
  console.log("OK: toate cele trei iframe-uri sunt integrabile, noindex si absente din sitemap.");
}

try {
  await auditRenderedSite();
} finally {
  if (server.exitCode === null) {
    server.kill();
    await Promise.race([once(server, "exit"), delay(3_000)]);
  }
}
