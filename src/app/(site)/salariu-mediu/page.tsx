// app/salariu-mediu/page.tsx
// Server Component pur — SSR maxim, SEO maxim, zero JS la client.
// Restructurat 10 iulie 2026 pe formula de la /salariu-minim (STUDIU-SPECTRUM-CONTENT.md):
// lede canonic unic, secțiuni în ordinea intențiilor din GSC (două cifre → pensia și
// valoarea oficială → net → diferența medie/mediană → istoric cu tabel HTML + grafic), FAQ redus la
// întrebările neacoperite în corp, carduri aditive pe fiecare rând.

import type { Metadata } from "next";
import { Formula, PaginiConexe, TITLU_CARD, TITLU_PAGINA, TITLU_SECTIUNE, SPATIU_JOS, SPATIU_SUS, SUB_TITLU } from "@/app/components/ui";
import Image from "next/image";
import Link from "@/app/components/Link";
import { LATEST_INS_EARNINGS } from "@/lib/date-salarii";
import { LUNA_REFERINTA, TOTAL_ECONOMIE } from "@/lib/ins-date";
import { personSchema } from "@/lib/person";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import { calculStandard, SALARIU_MINIM } from "@/lib/fiscal";
import { TABEL_STANDARD } from "@/app/components/TabelArticol";

const INS_PERIOD_LABEL = LUNA_REFERINTA.replace(/^Luna\s+/, "");
const INS_MONTH_NAME = INS_PERIOD_LABEL.split(" ")[0];
const INS_BRUT_VALUE = TOTAL_ECONOMIE.brutCurent;
const insNetValue = TOTAL_ECONOMIE.netCurent;

if (insNetValue === null) {
  throw new Error("Câștigul mediu net lipsește din ultima serie TEMPO.");
}

const INS_NET_VALUE = insNetValue;

if (
  INS_PERIOD_LABEL !== LATEST_INS_EARNINGS.periodLabel ||
  INS_BRUT_VALUE !== LATEST_INS_EARNINGS.grossLei ||
  INS_NET_VALUE !== LATEST_INS_EARNINGS.netLei
) {
  throw new Error("Datele editoriale despre câștigul mediu INS nu corespund ultimei serii TEMPO.");
}

const INS_BRUT_LABEL = INS_BRUT_VALUE.toLocaleString("ro-RO");
const INS_NET_LABEL = INS_NET_VALUE.toLocaleString("ro-RO");
const NET_MINIM = calculStandard(SALARIU_MINIM)!.netBani;
const PROCENT_MINIM_DIN_MEDIE = Math.round((NET_MINIM / INS_NET_VALUE) * 100);
const DATA_ACTUALIZARE = PAGE_LAST_MODIFIED["/salariu-mediu"].toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// Imaginea de share a paginii: crop 1200×630 din hero (nu brandul generic).
const OG_SALARIU_MEDIU = {
  url: "/og-salariu-mediu.jpg",
  width: 1200,
  height: 630,
  alt: "Ilustrație: siluete de înălțimi diferite lângă o linie orizontală, reprezentând diferența dintre valori individuale și medie",
} as const;

// ─── Metadata SEO ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: { absolute: "Salariul mediu pe economie 2026 - Brut, net, mediană" },
  description:
    `Salariul mediu 2026: ${INS_BRUT_LABEL} lei brut și ${INS_NET_LABEL} lei net în ${INS_MONTH_NAME}, conform INS; indicatorul bugetar este 9.192 lei. Date, explicații și surse.`,
  alternates: { canonical: "https://salariile.ro/salariu-mediu" },
  openGraph: ogPage({
    title: "Salariul mediu pe economie 2026: brut, net, mediană",
    description:
      `În ${INS_PERIOD_LABEL}, câștigul salarial mediu a fost ${INS_BRUT_LABEL} lei brut și ${INS_NET_LABEL} lei net, conform INS. Indicatorul bugetar este 9.192 lei.`,
    path: "/salariu-mediu",
    image: OG_SALARIU_MEDIU,
  }),
  twitter: twPage({
    title: "Salariul mediu pe economie 2026: brut, net, mediană",
    description:
      `În ${INS_PERIOD_LABEL}, câștigul salarial mediu a fost ${INS_BRUT_LABEL} lei brut și ${INS_NET_LABEL} lei net, conform INS. Indicatorul bugetar este 9.192 lei.`,
    image: OG_SALARIU_MEDIU,
  }),
};

// ─── Date factuale 2026 (identice cu pagina live) ─────────────────────────────

const ISTORIC = [
  { an: "2020", brut: 5429, net: 3176, lege: "Legea 6/2020", crestere: "–" },
  { an: "2021", brut: 5380, net: 3147, lege: "Legea 16/2021", crestere: "−0,9%" },
  { an: "2022", brut: 6095, net: 3566, lege: "Legea 318/2021", crestere: "+13,3%" },
  { an: "2023", brut: 6789, net: 3972, lege: "Legea 369/2022", crestere: "+11,4%" },
  { an: "2024", brut: 7567, net: 4427, lege: "Legea 422/2023", crestere: "+11,5%" },
  { an: "2025", brut: 8620, net: 5043, lege: "Legea 313/2024", crestere: "+13,9%" },
  { an: "2026", brut: 9192, net: 5377, lege: "Legea 44/2026", crestere: "+6,6%" },
];

// FAQ: doar întrebările fără secțiune proprie în corp (răspunsuri de sine
// stătătoare, pentru schema FAQPage).
const FAQ = [
  {
    q: "Cât este salariul mediu pe economie în 2026?",
    a: `Potrivit INS, în ${INS_PERIOD_LABEL} salariul mediu a fost de ${INS_NET_LABEL} lei net, adică ${INS_BRUT_LABEL} lei brut. Pentru pensii și ajutorul de deces, statul folosește o altă cifră, fixă pe tot anul: 9.192 lei brut.`,
  },
  {
    q: "Care e diferența dintre salariul mediu și salariul minim?",
    a: "Minimul e o obligație: nimeni nu poate fi plătit sub el la normă întreagă. Media e doar o statistică, calculată din salariile plătite efectiv, și nu obligă pe nimeni la nimic.",
  },
  {
    q: "Cine stabilește salariul mediu folosit la pensii?",
    a: "Parlamentul, o dată pe an, prin legea bugetului asigurărilor sociale, pe baza prognozelor Comisiei Naționale de Strategie și Prognoză. Pentru 2026, cifra e 9.192 lei brut.",
  },
  {
    q: "Cât este ajutorul de deces în 2026?",
    a: "9.192 de lei pentru un asigurat sau pensionar și 4.596 de lei pentru un membru al familiei, din 30 martie 2026. Până atunci au fost 8.620 și 4.310 lei.",
  },
];

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

// Grafic SVG (server-side, zero JS): evoluția salariului mediu brut și net.
const CHART = (() => {
  const W = 600, H = 280, padL = 6, padR = 56, padT = 18, padB = 28, max = 10000;
  const n = ISTORIC.length;
  const X = (i: number) => padL + (i / (n - 1)) * (W - padL - padR);
  const Y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  const pts = (k: "brut" | "net") => ISTORIC.map((r, i) => `${X(i).toFixed(1)},${Y(r[k]).toFixed(1)}`).join(" ");
  const ticks: [number, string][] = [[0, "2020"], [2, "2022"], [4, "2024"], [6, "2026"]];
  return {
    W, H,
    baseY: (H - padB).toFixed(1), x0: padL, x1: (W - padR).toFixed(1),
    brut: pts("brut"), net: pts("net"),
    lastX: X(n - 1).toFixed(1), brutY: Y(9192).toFixed(1), netY: Y(5377).toFixed(1),
    xticks: ticks.map(([i, l]) => ({ x: X(i).toFixed(1), l, anchor: (i === 0 ? "start" : i === n - 1 ? "end" : "middle") as "start" | "end" | "middle" })),
    dots: ISTORIC.map((r, i) => ({ x: X(i).toFixed(1), by: Y(r.brut).toFixed(1), ny: Y(r.net).toFixed(1) })),
    cols: ISTORIC.map((r, i) => {
      const cx = X(i);
      const leftEdge = i === 0 ? 0 : (X(i - 1) + cx) / 2;
      const rightEdge = i === n - 1 ? W : (cx + X(i + 1)) / 2;
      const w = rightEdge - leftEdge;
      return {
        an: r.an, brut: r.brut, net: r.net,
        leftPct: (leftEdge / W) * 100,
        widthPct: (w / W) * 100,
        guidePct: ((cx - leftEdge) / w) * 100,
        brutYPct: (Y(r.brut) / H) * 100,
        netYPct: (Y(r.net) / H) * 100,
        anchor: (i <= 1 ? "left" : i >= n - 2 ? "right" : "center") as "left" | "right" | "center",
      };
    }),
  };
})();

// ─── JSON-LD ─────────────────────────────────────────────────────────────────

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Salariul mediu 2026", item: "https://salariile.ro/salariu-mediu" },
      ],
    },
    {
      "@type": "Article",
      headline: "Salariul mediu pe economie 2026: oficial și INS",
      description:
        `Câștigul salarial mediu INS în ${INS_PERIOD_LABEL}: ${INS_BRUT_LABEL} lei brut și ${INS_NET_LABEL} lei net. Indicatorul bugetar din Legea 44/2026 este 9.192 lei. Explicații despre mediană, pensie și ajutorul de deces.`,
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/icon-512.png", width: 512, height: 512 },
      },
      image: { "@type": "ImageObject", url: "https://salariile.ro/og-salariu-mediu.jpg", width: 1200, height: 630 },
      mainEntityOfPage: "https://salariile.ro/salariu-mediu",
      datePublished: "2026-03-30",
      dateModified: PAGE_LAST_MODIFIED["/salariu-mediu"].toISOString().slice(0, 10),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

// ─── Stiluri (limbajul pilonului) ─────────────────────────────────────────────

const articol =
  "[&>h2]:mt-8 sm:[&>h2]:mt-9 [&>h2]:mb-4 [&>h2]:text-[22px] [&>h2]:font-bold [&>h2]:leading-tight [&>h2]:tracking-[-0.02em] [&>h2]:text-stone-900 lg:[&>h2]:text-2xl [&>h2:first-child]:mt-0 [&>:last-child]:mb-0 " +
  "[&_p]:mb-3 sm:[&_p]:mb-3.5 [&_p]:text-base [&_p]:leading-normal [&_p]:tracking-[-0.01em] [&_p]:text-stone-600 " +
  "[&_ul]:mb-3 sm:[&_ul]:mb-3.5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2 [&_li]:leading-normal [&_li]:tracking-[-0.01em] [&_li]:text-stone-600 " +
  "[&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600 " +
  "[&_strong]:font-semibold [&_strong]:text-stone-900";

const card = "flex h-full flex-col rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6";
const links =
  "[&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600";
const strong = "[&_strong]:font-semibold [&_strong]:text-stone-900";
const row = "md:grid md:grid-cols-5 md:gap-8 lg:gap-10";
const aside = "mt-8 md:col-span-2 md:mt-0 md:self-start";

// ─── Pagina ──────────────────────────────────────────────────────────────────

export default function SalariuMediuPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
      <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${SPATIU_SUS} ${SPATIU_JOS}`}>

        {/* HERO — lede = răspunsul, o singură dată (cele două cifre) */}
        <div className={`${row} md:items-center`}>
          <div className="md:col-span-3">
            <h1 className={TITLU_PAGINA}>Salariul mediu pe economie în 2026</h1>
            <p className={`${SUB_TITLU} text-xs text-stone-600 [&_a]:font-medium [&_a]:text-stone-700 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-900`}>
              Scris de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Actualizat {DATA_ACTUALIZARE}
            </p>
            <p className={`mt-5 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600 ${strong}`}>
              În {INS_PERIOD_LABEL}, salariul mediu din România a fost de <strong>{INS_NET_LABEL} lei net</strong>, adică{" "}
              <strong>{INS_BRUT_LABEL} lei brut</strong>, potrivit INS. E cea mai nouă cifră: institutul o publică în fiecare
              lună. Pentru pensii și ajutorul de deces, statul folosește altă cifră, fixă pe tot anul.
            </p>

            {/* Separare vizuală imediată INS vs BASS */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-stone-200 bg-surface p-3.5 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-600">Cât se câștigă în medie</p>
                <div className="mt-1 text-xl font-bold tabular-nums text-stone-900">{INS_NET_LABEL} lei <span className="text-sm font-normal text-stone-600">net</span></div>
                <p className="mt-0.5 text-xs text-stone-600">{INS_BRUT_LABEL} lei brut · INS, {INS_PERIOD_LABEL}</p>
              </div>
              <div className="rounded-md border border-stone-200 bg-surface p-3.5 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-600">Cifra folosită la pensie</p>
                <div className="mt-1 text-xl font-bold tabular-nums text-stone-900">9.192 lei <span className="text-sm font-normal text-stone-600">brut</span></div>
                <p className="mt-0.5 text-xs text-stone-600">fixă pe tot anul 2026</p>
              </div>
            </div>
          </div>
          <figure className={aside}>
            <Image
              src="/hero-salariu-mediu.png"
              alt="Ilustrație: siluete de înălțimi diferite lângă o linie orizontală, reprezentând diferența dintre valori individuale și medie"
              width={1200}
              height={896}
              priority
              sizes="(max-width: 768px) 100vw, 480px"
              className="w-full rounded-md"
            />
            <figcaption className="mt-2 text-xs text-stone-600">
              Ilustrație conceptuală; nu reprezintă distribuția salarială măsurată de INS.
            </figcaption>
          </figure>
        </div>

        <div className="[&>div]:mt-[38px] [&>div]:border-t [&>div]:border-stone-200 [&>div]:pt-[38px] sm:[&>div]:mt-[42px] sm:[&>div]:pt-[42px]">

          {/* RÂND 1 — de ce sunt două cifre și la ce folosește cea fixă */}
          <div className={row}>
            <div className="md:col-span-3">
              <div className={`max-w-prose ${articol}`}>
                <h2 id="de-ce-sunt-doua-cifre" className="scroll-mt-20">De ce sunt două cifre</h2>
                <p>
                  Prima o măsoară INS în fiecare lună, din salariile plătite efectiv, așa că urcă și coboară de la o lună
                  la alta. A doua o fixează Parlamentul o dată pe an, prin legea bugetului de asigurări sociale, și nu se
                  mai schimbă până în ianuarie.
                </p>
                <p id="calcul-pensie" className="scroll-mt-20">
                  Cifra fixă, numită oficial <strong>câștigul salarial mediu brut utilizat la fundamentarea bugetului
                  asigurărilor sociale de stat</strong>, e de 9.192 lei în 2026. De ea depind pensia ta, ajutorul de deces
                  și plafoanele mai multor ajutoare sociale.
                </p>
                <p>
                  La pensie, mecanismul e simplu: salariul tău brut se împarte la această cifră. Dacă ai câștigat exact
                  media tot anul, strângi un punct de pensie. La jumătate din medie, jumătate de punct.
                </p>
              </div>
            </div>
            <aside className={aside}>
              <div className={`${card} ${strong}`}>
                <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Cifrele fixe din 2026</h3>
                <table className="mt-3 w-full text-sm tabular-nums">
                  <tbody className="[&_td]:py-2">
                    <tr className="border-b border-stone-100">
                      <td className="text-left text-stone-600">Salariul mediu, la pensie</td>
                      <td className="text-right font-bold text-stone-900">{fmt(9192)} lei</td>
                    </tr>
                    <tr className="border-b border-stone-100">
                      <td className="text-left text-stone-600">Ajutor de deces, asigurat</td>
                      <td className="text-right text-stone-700">{fmt(9192)} lei</td>
                    </tr>
                    <tr>
                      <td className="text-left text-stone-600">Ajutor de deces, familie</td>
                      <td className="text-right text-stone-700">{fmt(4596)} lei</td>
                    </tr>
                  </tbody>
                </table>
                <p className="mt-auto pt-4 text-xs text-stone-600">Valabile din 30 martie 2026. Până atunci, cifra era 8.620 de lei.</p>
              </div>
            </aside>
          </div>

          {/* RÂND 2 — cât rămâne în mână */}
          <div className={row}>
            <div className="md:col-span-3">
              <div className={`max-w-prose ${articol}`}>
                <h2 id="net" className="scroll-mt-24">Cât rămâne în mână din salariul mediu</h2>
                <p>
                  Netul mediu nu trebuie calculat: INS îl publică direct, iar în {INS_PERIOD_LABEL} a fost de{" "}
                  {INS_NET_LABEL} lei. Dacă vrei totuși să treci singur din brut în net, la salariile de acest nivel
                  calculul e scurt, pentru că deducerea personală nu se mai aplică:
                </p>
                <Formula
                  eticheta="Netul unui salariu peste 6.325 lei brut"
                  randuri={[
                    "Net = brut − 25% − 10% − impozit",
                    "    = brut × 0,585",
                  ]}
                />
                <p>
                  Pe cifra de la pensie, 9.192 lei brut, rezultă cam 5.380 de lei în mână. Pentru salariul tău exact,
                  folosește <Link href="/">calculatorul</Link>.
                </p>
              </div>
            </div>
            <aside className={aside}>
              <div className={`${card} ${links} ${strong}`}>
                <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Media față de minim</h3>
                <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
                  Cine e plătit cu salariul minim primește în mână {fmt(NET_MINIM)} de lei, adică <strong>{PROCENT_MINIM_DIN_MEDIE}%</strong> din
                  netul mediu. Pe brut distanța e și mai mare, pentru că la minim taxele sunt mai mici.
                </p>
                <p className="mt-auto pt-4 text-sm">
                  <Link href="/salariu-minim">Salariul minim, în detaliu →</Link>
                </p>
              </div>
            </aside>
          </div>

          {/* RÂND 4 — mediana (aha-ul onest) */}
          <div className={row}>
            <div className="md:col-span-3">
              <div className={`max-w-prose ${articol}`}>
                <h2>Media nu e cât câștigi tu</h2>
                <p>
                  Media adună toate salariile și le împarte la numărul de oameni. Câteva salarii foarte mari o trag în sus,
                  așa că majoritatea oamenilor câștigă sub medie. Din cifra ei nu poți afla câți sunt deasupra și câți
                  dedesubt.
                </p>
                <p>
                  Pentru asta e nevoie de <strong>mediană</strong>, salariul de la mijloc: jumătate câștigă mai puțin,
                  jumătate mai mult.
                </p>
              </div>
            </div>
            <aside className={aside}>
              <div className={`${card} ${strong}`}>
                <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">De ce nu vezi aici mediana</h3>
                <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
                  INS nu o publică lunar, alături de medie. N-o estimăm noi, pentru că o cifră fără date compatibile și
                  fără o metodă verificabilă ar fi o ghicitoare.
                </p>
              </div>
            </aside>
          </div>

          {/* RÂND 5 — istoric: întâi tabelul (text), apoi graficul */}
          <div className={row}>
            <div className="md:col-span-3">
              <div className={`max-w-prose ${articol}`}>
                <h2>Cum a crescut în timp</h2>
                <p>Cifra fixă folosită la pensie, adică indicatorul BASS, a crescut cu aproape 70% în șase ani.</p>
                <div className="table-wrap my-6 overflow-x-auto">
                  <table className={`${TABEL_STANDARD} [&_td:not(:first-child)]:text-right [&_th:not(:first-child)]:text-right`}>
                    <thead>
                      <tr className="border-b border-stone-300 text-xs font-medium uppercase tracking-wide text-stone-600">
                        <th scope="col" className="pb-2 text-left">An</th>
                        <th scope="col" className="pb-2">Brut</th>
                        <th scope="col" className="pb-2">Net</th>

                      </tr>
                    </thead>
                    <tbody>
                      {ISTORIC.map((r, i) => (
                        <tr key={r.an} className={i === ISTORIC.length - 1 ? "font-medium text-stone-900" : "border-b border-stone-100"}>
                          <th scope="row" className="font-normal text-stone-600">{r.an}</th>
                          <td className="text-stone-900">{fmt(r.brut)}</td>
                          <td className="text-stone-700">{fmt(r.net)}</td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <figure className="my-6 rounded-md border border-stone-200 bg-surface p-5 sm:p-6">
                  <figcaption className="mb-3 flex gap-5 text-xs font-medium text-stone-600">
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-[3px] w-5 rounded-full bg-stone-900" aria-hidden="true" />
                      Brut
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-[3px] w-5 rounded-full bg-stone-400" aria-hidden="true" />
                      Net
                    </span>
                  </figcaption>
                  <div className="relative">
                    <svg
                      viewBox={`0 0 ${CHART.W} ${CHART.H}`}
                      className="w-full"
                      role="img"
                      aria-label="Grafic cu evoluția salariului mediu brut și net între 2020 și 2026. Brutul crește de la 5.429 la 9.192 lei, netul de la 3.176 la 5.377 lei."
                    >
                      <line x1={CHART.x0} y1={CHART.baseY} x2={CHART.x1} y2={CHART.baseY} stroke="#e7e5e4" strokeWidth="1" />
                      {CHART.xticks.map((t) => (
                        <line key={t.l} x1={t.x} y1="14" x2={t.x} y2={CHART.baseY} stroke="#f5f5f4" strokeWidth="1" />
                      ))}
                      <polyline points={CHART.net} fill="none" stroke="#a8a29e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                      <polyline points={CHART.brut} fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                      {CHART.dots.map((d, i) => (
                        <g key={i}>
                          <circle cx={d.x} cy={d.ny} r="2.5" fill="#a8a29e" />
                          <circle cx={d.x} cy={d.by} r="2.5" fill="#1c1917" />
                        </g>
                      ))}
                      <text x={Number(CHART.lastX) + 9} y={Number(CHART.brutY) + 5} fontSize="15" fontWeight="700" fill="#1c1917">9.192</text>
                      <text x={Number(CHART.lastX) + 9} y={Number(CHART.netY) + 5} fontSize="15" fontWeight="600" fill="#78716c">5.377</text>
                      {CHART.xticks.map((t) => (
                        <text key={t.l} x={t.x} y={CHART.H - 6} fontSize="13" fill="#78716c" textAnchor={t.anchor}>{t.l}</text>
                      ))}
                    </svg>
                    <div className="pointer-events-none absolute inset-0">
                      {CHART.cols.map((c, i) => {
                        const tipStyle = c.anchor === "left" ? { left: "0%" } : c.anchor === "right" ? { right: "0%" } : { left: `${c.guidePct}%` };
                        return (
                          <div
                            key={i}
                            tabIndex={0}
                            role="img"
                            className="group pointer-events-auto absolute inset-y-0 outline-none"
                            style={{ left: `${c.leftPct}%`, width: `${c.widthPct}%` }}
                            aria-label={`${c.an}: ${fmt(c.brut)} lei brut, ${fmt(c.net)} lei net`}
                          >
                            <div className="absolute inset-y-0 w-px -translate-x-1/2 bg-stone-300 opacity-0 group-hover:opacity-100 group-focus:opacity-100" style={{ left: `${c.guidePct}%` }} aria-hidden="true" />
                            <span className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-900 opacity-0 ring-2 ring-surface group-hover:opacity-100 group-focus:opacity-100" style={{ left: `${c.guidePct}%`, top: `${c.brutYPct}%` }} aria-hidden="true" />
                            <span className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-400 opacity-0 ring-2 ring-surface group-hover:opacity-100 group-focus:opacity-100" style={{ left: `${c.guidePct}%`, top: `${c.netYPct}%` }} aria-hidden="true" />
                            <div
                              className={`absolute top-0 z-10 hidden whitespace-nowrap rounded-md border border-stone-200 bg-surface px-2.5 py-1.5 text-xs leading-tight shadow-soft group-hover:block group-focus:block ${c.anchor === "center" ? "-translate-x-1/2" : ""}`}
                              style={tipStyle}
                            >
                              <div className="font-semibold text-stone-900">{c.an}</div>
                              <div className="mt-1 flex items-center gap-2 text-stone-600"><span className="inline-block h-1.5 w-1.5 rounded-full bg-stone-900" aria-hidden="true" />Brut<span className="ml-auto pl-3 font-medium tabular-nums text-stone-900">{fmt(c.brut)}</span></div>
                              <div className="mt-0.5 flex items-center gap-2 text-stone-600"><span className="inline-block h-1.5 w-1.5 rounded-full bg-stone-400" aria-hidden="true" />Net<span className="ml-auto pl-3 font-medium tabular-nums text-stone-900">{fmt(c.net)}</span></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-stone-600">Netul e estimat din brut, cu taxele obișnuite. Treci cu mouse-ul sau atinge un an ca să vezi cifrele.</p>
                </figure>
              </div>
            </div>
            <aside className={aside}>
              <div className="flex h-full flex-col gap-6">
                <div className={`${card} ${strong}`}>
                  <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Ce urmează</h3>
                  <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
                    Comisia de Prognoză estimează că media brută ajunge la <strong>9.786 lei</strong> în 2027 și la{" "}
                    <strong>10.381 lei</strong> în 2028. Sunt doar estimări: cifra fiecărui an o fixează legea bugetului.
                  </p>
                </div>
              </div>
            </aside>
          </div>

          {/* RÂND 6 — FAQ, fără întrebările acoperite în corp */}
          <div className={row}>
            <div className="md:col-span-3">
              <h2 className={`mb-4 ${TITLU_SECTIUNE}`}>Întrebări frecvente</h2>
              <div className="flex flex-col">
                {FAQ.map((item, i) => (
                  <details key={i} name="faq-mediu" className="group border-b border-stone-200">
                    <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 py-4 text-base font-medium tracking-[-0.01em] text-stone-900 [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <span className="flex-shrink-0 text-xl text-stone-900 group-open:hidden">+</span>
                      <span className="hidden flex-shrink-0 text-xl text-stone-900 group-open:inline">−</span>
                    </summary>
                    <p className="mb-4 text-base leading-normal tracking-[-0.01em] text-stone-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
            <aside className={aside}>
              <div className={card}>
                <h3 className="mb-2 text-base font-bold tracking-[-0.01em] text-stone-900">Surse oficiale</h3>
                <ul className={`flex flex-col gap-2 text-sm leading-normal text-stone-600 ${links}`}>
                  <li><strong className="font-medium text-stone-900">Legea 44/2026</strong>: bugetul asigurărilor sociale 2026</li>
                  <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/276927" target="_blank" rel="noopener">Legea 360/2023</a>: sistemul public de pensii și ajutorul de deces</li>
                  <li><a href={LATEST_INS_EARNINGS.officialUrl} target="_blank" rel="noopener">INS, comunicatul pentru {INS_PERIOD_LABEL}</a>: {INS_BRUT_LABEL} lei brut, {INS_NET_LABEL} lei net, publicat {LATEST_INS_EARNINGS.publicationDateLabel}</li>
                  <li><a href="https://cnp.ro" target="_blank" rel="noopener">CNSP</a>: prognoze 2026–2028</li>
                </ul>
                <h3 className="mt-6 mb-2 text-base font-bold tracking-[-0.01em] text-stone-900">Pagini conexe</h3>
                <ul className={`flex flex-col gap-2 text-sm ${links}`}>
                  <li><Link href="/salariu-minim">Salariul minim 2026</Link></li>
                  <li><Link href="/salarii/locuri-vacante">Locuri de muncă vacante în economie</Link></li>
                  <li><Link href="/">Calculator salariu net</Link></li>
                  <li><Link href="/zile-libere-2026">Zile libere 2026</Link></li>
                </ul>

              </div>
            </aside>
          </div>

          {/* RÂND FINAL — CTA pe stânga */}
          <div className={row}>
            <div className="md:col-span-3">
              <div className={card}>
                <h2 className={TITLU_CARD}>Unde te situezi față de medie?</h2>
                <p className="mt-2 text-base leading-normal tracking-[-0.01em] text-stone-600">
                  Scrie-ți salariul în calculator și compară-l cu media.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex min-h-11 items-center self-start rounded border border-stone-900 bg-stone-900 px-5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
                >
                  Mergi la calculator →
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
      <PaginiConexe
        linkuri={[
          { href: "/salarii", label: "Salarii pe meserii", descriere: "Media pe economie ascunde diferențe mari între meserii." },
          { href: "/salarii/locuri-vacante", label: "Locuri de muncă vacante", descriere: "Cât se caută în economie: posturi vacante și rata pe grupe de ocupații." },
          { href: "/salarii/judete", label: "Salarii pe județe", descriere: "Unde se câștigă mai mult: toate cele 42 de județe." },
          { href: "/salarii/clasament", label: "Cele mai bine plătite meserii", descriere: "Clasamentul meseriilor după salariul net." },
          { href: "/salariu-minim", label: "Salariul minim 2026", descriere: "Cât e minimul și cum se calculează netul." },
        ]}
      />
    </>
  );
}
