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

  await Promise.all(
    locations.map(async (location) => {
      const localUrl = location.replace("https://salariile.ro", BASE_URL);
      try {
        const response = await fetch(localUrl);
        const html = await response.text();
        rendered.set(new URL(location).pathname, html);

        const h1Count = html.match(/<h1(?:\s[^>]*)?>/gi)?.length ?? 0;
        const canonical = canonicalFrom(html);
        if (response.status !== 200) failures.push(`${location}: HTTP ${response.status}`);
        if (h1Count !== 1) failures.push(`${location}: ${h1Count} elemente H1`);
        if (canonical !== location) failures.push(`${location}: canonical ${canonical || "lipsa"}`);
      } catch (error) {
        failures.push(`${location}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
  );

  const contentChecks = [
    ["/calculator/calcul-salariu-net-4050-brut", "2.574", "netul S1 pentru 4.050 brut"],
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

  const salary4050 = rendered.get("/calculator/calcul-salariu-net-4050-brut") ?? "";
  const schemaNodes = jsonLdBlocks(salary4050).flatMap((block) =>
    Array.isArray(block["@graph"]) ? block["@graph"] : [block],
  );
  const webPage = schemaNodes.find((block) => block["@type"] === "WebPage");
  if (!webPage || typeof webPage.name !== "string") {
    failures.push("/calculator/calcul-salariu-net-4050-brut: WebPage.name nu este string");
  }

  console.log(`Rute din sitemap verificate: ${locations.length}`);
  console.log(`Verificari P0 de continut: ${contentChecks.length + 1}`);

  if (failures.length > 0) {
    throw new Error(`Auditul randat a esuat:\n- ${failures.join("\n- ")}`);
  }

  console.log("OK: HTTP 200, un singur H1 si canonical corect pe toate rutele.");
  console.log("OK: continutul P0 si JSON-LD-ul paginii 4.050 au trecut.");
}

try {
  await auditRenderedSite();
} finally {
  if (server.exitCode === null) {
    server.kill();
    await Promise.race([once(server, "exit"), delay(3_000)]);
  }
}
