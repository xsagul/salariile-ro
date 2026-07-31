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
  ] as const;

  for (const [pathname, expected, label] of contentChecks) {
    if (!rendered.get(pathname)?.includes(expected)) failures.push(`${pathname}: lipseste ${label}`);
  }

  const editorialTable = rendered.get("/noutati/salariul-minim-1-iulie-2026") ?? "";
  if (!/<th\b[^>]*scope="col"[^>]*>\s*Indicator\s*<\/th>/i.test(editorialTable)) {
    failures.push("/noutati/salariul-minim-1-iulie-2026: antetul de coloană al tabelului nu are scope");
  }
  if (!/<th\b[^>]*scope="row"[^>]*>\s*Salariul minim brut\s*<\/th>/i.test(editorialTable)) {
    failures.push("/noutati/salariul-minim-1-iulie-2026: primul câmp al rândului nu este antet semantic");
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

  console.log(`Rute din sitemap verificate: ${locations.length}`);
  console.log(`Blocuri JSON-LD parsate: ${jsonLdBlockCount}`);
  console.log(`Verificari P0/P1 de continut: ${contentChecks.length + 1}`);

  if (failures.length > 0) {
    throw new Error(`Auditul randat a esuat:\n- ${failures.join("\n- ")}`);
  }

  console.log("OK: HTTP 200, un singur H1/main si canonical corect pe toate rutele.");
  console.log("OK: JSON-LD valid, allowlist inchis, link graph si valorile GSC au trecut.");
  console.log("OK: Markdown allowlist/negociere si headerele asseturilor au trecut.");
}

try {
  await auditRenderedSite();
} finally {
  if (server.exitCode === null) {
    server.kill();
    await Promise.race([once(server, "exit"), delay(3_000)]);
  }
}
