// src/app/api/joburi/raport/route.ts
//
// „Postul nu mai e liber" — un click de la candidat.
//
// ACESTA E PRIMUL ENDPOINT AL SITE-ULUI CARE ACCEPTA SCRIERE DE PE INTERNET.
// Pana acum salariile.ro era integral read-only. De aceea regulile de mai jos
// nu sunt optionale:
//
//   1. RAPORTUL NU ASCUNDE ANUNTUL. Doar notifica. Daca un click ar retrage
//      anuntul, oricine ar putea sterge concurenta de pe site cu un script.
//      Retragerea ramane manuala.
//   2. NU SE STOCHEAZA NIMIC DESPRE CINE RAPORTEAZA. Fara IP salvat, fara
//      cookie, fara identificator. IP-ul se foloseste doar in memorie, pentru
//      limitarea de rata, si nu paraseste procesul.
//   3. SLUGUL SE VALIDEAZA contra catalogului. Un slug inexistent nu produce
//      notificare, deci endpointul nu poate fi folosit ca releu de mesaje.
//
// robots.txt interzice /api/, deci ruta nu e crawlata.

import { JOBURI } from "@/lib/joburi";

export const dynamic = "force-dynamic";

const MAX_BODY = 2_000;
/** Cate rapoarte acceptam de la acelasi IP intr-o fereastra. */
const LIMITA = 5;
const FEREASTRA_MS = 10 * 60 * 1000;

// Best-effort: pe serverless memoria nu e partajata intre instante, deci nu e o
// aparare reala. Opreste scriptul naiv; abuzul serios cere altceva, iar „altceva"
// se decide odata cu baza de date.
const contor = new Map<string, { n: number; pana: number }>();

function prealimit(ip: string): boolean {
  const acum = Date.now();
  const e = contor.get(ip);
  if (!e || acum > e.pana) {
    contor.set(ip, { n: 1, pana: acum + FEREASTRA_MS });
    return true;
  }
  if (e.n >= LIMITA) return false;
  e.n += 1;
  return true;
}

/**
 * Trimiterea notificarii. Un singur loc, ca sa se poata schimba canalul fara
 * sa se atinga ruta. Cu `RESEND_API_KEY` in mediu pleaca email; fara ea,
 * raportul ramane in logurile Vercel, marcat ca sa fie usor de filtrat.
 */
async function notifica(job: { slug: string; titlu: string; companie: string }) {
  const subiect = `[joburi] Raport: ${job.titlu} — ${job.companie}`;
  const text = [
    "Un vizitator a raportat că postul nu mai e liber.",
    "",
    `Anunț:    ${job.titlu}`,
    `Companie: ${job.companie}`,
    `Link:     https://salariile.ro/locuri-de-munca/${job.slug}`,
    "",
    "Verifică și retrage anunțul dacă e cazul. Raportul nu a schimbat nimic pe site.",
  ].join("\n");

  const cheie = process.env.RESEND_API_KEY;
  const catre = process.env.EMAIL_RAPOARTE;
  if (!cheie || !catre) {
    console.warn(`RAPORT_JOB ${JSON.stringify({ slug: job.slug, la: new Date().toISOString() })}`);
    return;
  }
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${cheie}`, "content-type": "application/json" },
      body: JSON.stringify({ from: "joburi@salariile.ro", to: catre, subject: subiect, text }),
    });
  } catch (e) {
    console.error("RAPORT_JOB_ESUAT", e);
  }
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "necunoscut";

  if (!prealimit(ip)) {
    return Response.json({ ok: false, motiv: "prea multe" }, { status: 429 });
  }

  const brut = await request.text();
  if (brut.length > MAX_BODY) {
    return Response.json({ ok: false, motiv: "corp prea mare" }, { status: 413 });
  }

  let slug: unknown;
  try {
    slug = (JSON.parse(brut) as { slug?: unknown }).slug;
  } catch {
    return Response.json({ ok: false, motiv: "json invalid" }, { status: 400 });
  }

  const job = typeof slug === "string" ? JOBURI.find((j) => j.slug === slug) : undefined;
  if (!job) {
    return Response.json({ ok: false, motiv: "anunț inexistent" }, { status: 404 });
  }

  await notifica(job);
  // Raspuns identic indiferent daca notificarea a plecat sau doar s-a logat:
  // candidatul a facut ce trebuia, restul e treaba noastra.
  return Response.json({ ok: true });
}

