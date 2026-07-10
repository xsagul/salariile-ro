// app/salariu-minim/page.tsx
// Server Component pur — SSR maxim, SEO maxim, zero JS la client.
// Restructurat 10 iulie 2026 conform standardului de content (STUDIU-SPECTRUM-CONTENT.md):
// răspunsul o singură dată în primul ecran (lede canonic, fără caseta care îl dubla),
// secțiuni pe intenții (net → firmă → drepturi → oră/zi/normă parțială → angajator →
// sectoare → istoric), carduri aditive în dreapta (niciun card nu repetă corpul),
// istoric și ca tabel HTML, FAQ redus la întrebările neacoperite în corp.
// Cifrele derivate: motorul fiscal (scripts/calc-parttime.mts, scripts/calc-carduri.mts).

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

// Imaginea de share a paginii: crop 1200×630 din hero (nu brandul generic).
const OG_SALARIU_MINIM = {
  url: "/og-salariu-minim.jpg",
  width: 1200,
  height: 630,
  alt: "Ilustrație: o mână deschisă care susține o căsuță și o siluetă mică, salariul minim ca o podea ce asigură un trai demn",
} as const;

// ─── Metadata SEO ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Salariul minim pe economie 2026: cât rămâne net la tine",
  description:
    "Din 1 iulie 2026, minimul brut e 4.325 lei. Vezi netul tău real cu facilitatea de 200 lei, când o pierzi, ce e cu tichetele și cât plătește firma de fapt.",
  alternates: { canonical: "https://salariile.ro/salariu-minim" },
  openGraph: ogPage({
    title: "Salariul minim pe economie 2026: cât rămâne net la tine",
    description:
      "Din 1 iulie 2026, minimul brut e 4.325 lei. Netul real cu facilitatea de 200 lei, când o pierzi, tichetele și costul firmei.",
    path: "/salariu-minim",
    image: OG_SALARIU_MINIM,
  }),
  twitter: twPage({
    title: "Salariul minim pe economie 2026: cât rămâne net la tine",
    description:
      "Din 1 iulie 2026, minimul brut e 4.325 lei. Netul real cu facilitatea de 200 lei, când o pierzi, tichetele și costul firmei.",
    image: OG_SALARIU_MINIM,
  }),
};

// ─── Date factuale 2026 (verificate prin acte normative) ─────────────────────

const ISTORIC = [
  { perioada: "2019", short: "2019", brut: 2080, net: 1263, crestere: "–" },
  { perioada: "2020", short: "2020", brut: 2230, net: 1346, crestere: "+7,2%" },
  { perioada: "2021", short: "2021", brut: 2300, net: 1386, crestere: "+3,1%" },
  { perioada: "2022", short: "2022", brut: 2550, net: 1524, crestere: "+10,9%" },
  { perioada: "ian 2023", short: "ian. 2023", brut: 3000, net: 1863, crestere: "+17,6%" },
  { perioada: "oct 2023", short: "oct. 2023", brut: 3300, net: 2079, crestere: "+10,0%" },
  { perioada: "iul 2024", short: "iul. 2024", brut: 3700, net: 2363, crestere: "+12,1%" },
  { perioada: "ian 2025 – iun 2026", short: "din ian. 2025", brut: 4050, net: 2574, crestere: "+9,5%" },
  { perioada: "iul 2026 – dec 2026", short: "din iul. 2026", brut: 4325, net: 2699, crestere: "+6,8%" },
];

// Netul la normă parțială — motorul fiscal, iul–dec 2026 (fără facilitate:
// OUG 89/2025 cere normă întreagă; deducerea personală se aplică integral).
const PARTTIME = [
  { norma: "2 ore pe zi", brut: 1081, net: 703 },
  { norma: "4 ore pe zi", brut: 2163, net: 1352 },
  { norma: "6 ore pe zi", brut: 3244, net: 1985 },
  { norma: "8 ore pe zi (normă întreagă)", brut: 4325, net: 2699 },
];

// FAQ: doar întrebările neacoperite de secțiunile din corp (răspunsuri de sine
// stătătoare, pentru schema FAQPage — aici repetarea cifrelor e permisă).
const FAQ = [
  {
    q: "Cât este salariul minim brut pe țară în 2026?",
    a: "Salariul minim brut este 4.325 lei din 1 iulie 2026 (conform HG 146/2026, publicat în Monitorul Oficial nr. 196 din 13 martie 2026). Până la 30 iunie a fost 4.050 lei (HG 1506/2024, în vigoare din ianuarie 2025).",
  },
  {
    q: "Cât rămâne net la salariul minim în 2026?",
    a: "Din 1 iulie 2026, la 4.325 lei brut, salariatul primește net 2.699 lei (cu facilitatea fiscală de 200 lei netaxabili, OUG 89/2025). Până la 1 iulie, la 4.050 lei brut, netul era 2.574 lei (facilitate de 300 lei).",
  },
  {
    q: "Care este costul total al angajatorului?",
    a: "Costul total pentru un salariu minim include brutul plus contribuția asiguratorie pentru muncă (CAM 2,25%). Rezultă 4.134 lei lunar în semestrul I 2026 și 4.418 lei începând cu 1 iulie 2026, o creștere de 284 lei lunar.",
  },
  {
    q: "Salariul minim sectorul construcții se schimbă?",
    a: "Nu. HG 146/2026 menționează explicit că nu modifică salariul minim brut pentru sectorul construcțiilor, care rămâne 4.582 lei lunar pe tot parcursul anului 2026.",
  },
  {
    q: "Cât este salariul minim în agricultură și industria alimentară din 1 iulie 2026?",
    a: "4.325 lei, la fel ca minimul general. De la 1 iulie 2026, sectorul agricol și industria alimentară nu mai au un salariu minim propriu: OUG 29/2026 a abrogat nivelul distinct (art. LXX din OUG 156/2024), tocmai ca aceste sectoare să nu rămână la 4.050 lei în urma majorării generale. Construcțiile rămân singurul sector cu prag propriu, 4.582 lei.",
  },
  {
    q: "Ce este facilitatea fiscală de 300/200 lei?",
    a: "OUG 89/2025 scutește o sumă fixă din salariul minim de impozit pe venit și contribuții sociale: 300 lei/lună în perioada 1 ianuarie – 30 iunie 2026, respectiv 200 lei/lună în perioada 1 iulie – 31 decembrie 2026. Se aplică doar la funcția de bază, cu normă întreagă, și doar dacă venitul brut din salarii (fără tichete) nu depășește 4.300 lei până în iunie, respectiv 4.600 lei din iulie. Dacă ai sporuri sau bonusuri care trec de acest plafon, pierzi scutirea și plătești taxe pe toată suma.",
  },
  {
    q: "Se impozitează tichetele de masă la salariul minim?",
    a: "Da. Tichetele de masă sunt supuse impozitului pe venit (10%) și CASS (10%), dar nu și CAS. Important: valoarea tichetelor nu se include în plafonul de 4.300/4.600 lei folosit pentru facilitatea fiscală, deci tichetele nu îți anulează scutirea de 300/200 lei.",
  },
  {
    q: "Mai există scutirea de impozit pentru IT, construcții și agricultură?",
    a: "Nu. OUG 156/2024 a eliminat scutirile fiscale pentru salariații din IT, construcții, agricultură și industria alimentară începând cu veniturile lunii ianuarie 2025. Acum se aplică toate taxele și contribuțiile standard, indiferent de sector.",
  },
];

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

// Grafic SVG (server-side, zero JS): puncte pentru evoluția brut/net.
const CHART = (() => {
  const W = 600, H = 300, padL = 6, padR = 58, padT = 18, padB = 28, max = 4600;
  const n = ISTORIC.length;
  const X = (i: number) => padL + (i / (n - 1)) * (W - padL - padR);
  const Y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  const pts = (k: "brut" | "net") => ISTORIC.map((r, i) => `${X(i).toFixed(1)},${Y(r[k]).toFixed(1)}`).join(" ");
  const ticks: [number, string][] = [[0, "2019"], [3, "2022"], [6, "2024"], [8, "2026"]];
  return {
    W, H,
    baseY: (H - padB).toFixed(1), x0: padL, x1: (W - padR).toFixed(1),
    brut: pts("brut"), net: pts("net"),
    lastX: X(n - 1).toFixed(1), brutY: Y(4325).toFixed(1), netY: Y(2699).toFixed(1),
    xticks: ticks.map(([i, l]) => ({ x: X(i).toFixed(1), l, anchor: (i === 0 ? "start" : i === n - 1 ? "end" : "middle") as "start" | "end" | "middle" })),
    dots: ISTORIC.map((r, i) => ({ x: X(i).toFixed(1), by: Y(r.brut).toFixed(1), ny: Y(r.net).toFixed(1) })),
    // Zone de hover (în %), pentru tooltip HTML suprapus, aliniat exact pe puncte.
    cols: ISTORIC.map((r, i) => {
      const cx = X(i);
      const leftEdge = i === 0 ? 0 : (X(i - 1) + cx) / 2;
      const rightEdge = i === n - 1 ? W : (cx + X(i + 1)) / 2;
      const w = rightEdge - leftEdge;
      return {
        short: r.short, brut: r.brut, net: r.net,
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
        { "@type": "ListItem", position: 2, name: "Salariul minim 2026", item: "https://salariile.ro/salariu-minim" },
      ],
    },
    {
      "@type": "Article",
      headline: "Salariul minim brut 2026 în România: 4.050 → 4.325 lei",
      description:
        "Analiză a salariului minim brut pe țară în 2026: cadrul legal (HG 146/2026, OUG 89/2025), calcul net, ce câștigă angajatul și ce plătește firma, drepturi, normă parțială, sectoare (construcții 4.582 lei) și obligații.",
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile.ro",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      },
      image: { "@type": "ImageObject", url: "https://salariile.ro/og-salariu-minim.jpg", width: 1200, height: 630 },
      mainEntityOfPage: "https://salariile.ro/salariu-minim",
      datePublished: "2026-04-27",
      dateModified: "2026-07-10",
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

// ─── Stiluri (limbajul pilonului: stone monocrom, fără accent, tracking Inter) ─

const articol =
  "[&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:tracking-[-0.02em] [&>h2]:text-stone-900 sm:[&>h2]:text-3xl [&>h2:first-child]:mt-0 " +
  "[&_p]:mb-4 [&_p]:text-base [&_p]:leading-normal [&_p]:tracking-[-0.01em] [&_p]:text-stone-600 " +
  "[&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2 [&_li]:leading-normal [&_li]:tracking-[-0.01em] [&_li]:text-stone-600 " +
  "[&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600 " +
  "[&_strong]:font-semibold [&_strong]:text-stone-900";

// Card cu înălțimea secțiunii (h-full + flex-col), ca pe homepage.
const card = "flex h-full flex-col rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6";
const links =
  "[&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600";
const strong = "[&_strong]:font-semibold [&_strong]:text-stone-900";
const row = "md:grid md:grid-cols-5 md:gap-8 lg:gap-10";
const aside = "mt-8 md:col-span-2 md:mt-0";

// ─── Componente: tabele și grafic ────────────────────────────────────────────

function TabelPasCuPas() {
  return (
    <div className="my-6 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
      <table className="w-full text-sm tabular-nums [&_td]:py-2.5 [&_thead_th]:pb-2 [&_tbody_th]:py-2.5 [&_tbody_th]:text-left [&_td:first-child]:pr-2 [&_th:first-child]:pr-2 [&_td:not(:first-child)]:whitespace-nowrap [&_td:not(:first-child)]:pl-3 [&_th:not(:first-child)]:pl-3 [&_td:not(:first-child)]:text-right [&_th:not(:first-child)]:text-right">
        <thead>
          <tr className="border-b border-stone-300 text-xs font-medium uppercase tracking-wide text-stone-500">
            <th scope="col" className="text-left">Pas</th>
            <th scope="col">ian–iun</th>
            <th scope="col">iul–dec</th>
            <th scope="col" className="hidden sm:table-cell">Dif.</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-stone-100">
            <th scope="row" className="font-normal text-stone-600">Salariu brut</th>
            <td className="font-medium text-stone-900">4.050</td>
            <td className="font-medium text-stone-900">4.325</td>
            <td className="hidden text-stone-500 sm:table-cell">+275</td>
          </tr>
          <tr className="border-b border-stone-100">
            <th scope="row" className="font-normal text-stone-600">− Scutit de taxe</th>
            <td className="text-stone-700">300</td>
            <td className="text-stone-700">200</td>
            <td className="hidden text-stone-500 sm:table-cell">−100</td>
          </tr>
          <tr className="border-b border-stone-100 bg-stone-50">
            <th scope="row" className="font-medium text-stone-900">= Bază pentru taxe</th>
            <td className="font-medium text-stone-900">3.750</td>
            <td className="font-medium text-stone-900">4.125</td>
            <td className="hidden font-medium text-stone-900 sm:table-cell">+375</td>
          </tr>
          <tr className="border-b border-stone-100">
            <th scope="row" className="font-normal text-stone-600">− CAS 25% <span className="text-stone-600">(pensie)</span></th>
            <td className="text-stone-700">938</td>
            <td className="text-stone-700">1.031</td>
            <td className="hidden text-stone-500 sm:table-cell">+93</td>
          </tr>
          <tr className="border-b border-stone-100">
            <th scope="row" className="font-normal text-stone-600">− CASS 10% <span className="text-stone-600">(sănătate)</span></th>
            <td className="text-stone-700">375</td>
            <td className="text-stone-700">413</td>
            <td className="hidden text-stone-500 sm:table-cell">+38</td>
          </tr>
          <tr className="border-b border-stone-100">
            <th scope="row" className="font-normal text-stone-600">− Impozit 10%</th>
            <td className="text-stone-700">163</td>
            <td className="text-stone-700">182</td>
            <td className="hidden text-stone-500 sm:table-cell">+19</td>
          </tr>
          <tr className="[&_td]:pt-3 [&_td]:font-bold [&_td]:text-stone-900 [&_th]:pt-3 [&_th]:font-bold [&_th]:text-stone-900">
            <th scope="row">= Net în mână</th>
            <td>2.574</td>
            <td>2.699</td>
            <td className="hidden sm:table-cell">+125</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function TabelPartTime() {
  return (
    <div className="my-6 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
      <table className="w-full text-sm tabular-nums [&_td]:py-2.5 [&_tbody_th]:py-2.5 [&_tbody_th]:pr-2 [&_tbody_th]:text-left [&_td:not(:first-child)]:pl-3 [&_th:not(:first-child)]:pl-3 [&_td:not(:first-child)]:text-right [&_th:not(:first-child)]:text-right">
        <thead>
          <tr className="border-b border-stone-300 text-xs font-medium uppercase tracking-wide text-stone-500">
            <th scope="col" className="pb-2 text-left">Normă</th>
            <th scope="col" className="pb-2">Brut</th>
            <th scope="col" className="pb-2">Net în mână</th>
          </tr>
        </thead>
        <tbody>
          {PARTTIME.map((r, i) => (
            <tr key={r.norma} className={i === PARTTIME.length - 1 ? "font-medium text-stone-900" : "border-b border-stone-100"}>
              <th scope="row" className="font-normal text-stone-600">{r.norma}</th>
              <td className="text-stone-900">{fmt(r.brut)}</td>
              <td className="font-medium text-stone-900">{fmt(r.net)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-stone-500">
        Perioada iulie–decembrie 2026, funcție de bază, fără persoane în întreținere. Facilitatea de 200 lei cere normă
        întreagă, iar deducerea personală rămâne întreagă la orice normă, de aceea netul nu scade exact proporțional cu orele.
      </p>
    </div>
  );
}

function TabelIstoric() {
  return (
    <div className="my-6 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
      <table className="w-full text-sm tabular-nums [&_td]:py-2 [&_tbody_th]:py-2 [&_tbody_th]:pr-2 [&_tbody_th]:text-left [&_td:not(:first-child)]:pl-3 [&_th:not(:first-child)]:pl-3 [&_td:not(:first-child)]:text-right [&_th:not(:first-child)]:text-right">
        <thead>
          <tr className="border-b border-stone-300 text-xs font-medium uppercase tracking-wide text-stone-500">
            <th scope="col" className="pb-2 text-left">Perioadă</th>
            <th scope="col" className="pb-2">Brut</th>
            <th scope="col" className="pb-2">Net</th>
            <th scope="col" className="hidden pb-2 sm:table-cell">Creștere brut</th>
          </tr>
        </thead>
        <tbody>
          {ISTORIC.map((r, i) => (
            <tr key={r.perioada} className={i === ISTORIC.length - 1 ? "font-medium text-stone-900" : "border-b border-stone-100"}>
              <th scope="row" className="font-normal text-stone-600">{r.perioada}</th>
              <td className="text-stone-900">{fmt(r.brut)}</td>
              <td className="text-stone-700">{fmt(r.net)}</td>
              <td className="hidden text-stone-500 sm:table-cell">{r.crestere}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GraficIstoric() {
  return (
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
          aria-label="Grafic cu evoluția salariului minim brut și net între 2019 și 2026. Brutul crește de la 2.080 la 4.325 lei, netul de la 1.263 la 2.699 lei."
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
          <text x={Number(CHART.lastX) + 9} y={Number(CHART.brutY) + 5} fontSize="15" fontWeight="700" fill="#1c1917">4.325</text>
          <text x={Number(CHART.lastX) + 9} y={Number(CHART.netY) + 5} fontSize="15" fontWeight="600" fill="#78716c">2.699</text>
          {CHART.xticks.map((t) => (
            <text key={t.l} x={t.x} y={CHART.H - 6} fontSize="13" fill="#78716c" textAnchor={t.anchor}>{t.l}</text>
          ))}
        </svg>
        {/* Overlay tooltip HTML — aliniat pe puncte prin %, zero JS, hover + tap (focus) */}
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
                aria-label={`${c.short}: brut ${fmt(c.brut)} lei, net ${fmt(c.net)} lei`}
              >
                <div className="absolute inset-y-0 w-px -translate-x-1/2 bg-stone-300 opacity-0 group-hover:opacity-100 group-focus:opacity-100" style={{ left: `${c.guidePct}%` }} aria-hidden="true" />
                <span className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-900 opacity-0 ring-2 ring-surface group-hover:opacity-100 group-focus:opacity-100" style={{ left: `${c.guidePct}%`, top: `${c.brutYPct}%` }} aria-hidden="true" />
                <span className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-400 opacity-0 ring-2 ring-surface group-hover:opacity-100 group-focus:opacity-100" style={{ left: `${c.guidePct}%`, top: `${c.netYPct}%` }} aria-hidden="true" />
                <div
                  className={`absolute top-0 z-10 hidden whitespace-nowrap rounded-md border border-stone-200 bg-surface px-2.5 py-1.5 text-xs leading-tight shadow-soft group-hover:block group-focus:block ${c.anchor === "center" ? "-translate-x-1/2" : ""}`}
                  style={tipStyle}
                >
                  <div className="font-semibold text-stone-900">{c.short}</div>
                  <div className="mt-1 flex items-center gap-2 text-stone-600"><span className="inline-block h-1.5 w-1.5 rounded-full bg-stone-900" aria-hidden="true" />Brut<span className="ml-auto pl-3 font-medium tabular-nums text-stone-900">{fmt(c.brut)}</span></div>
                  <div className="mt-0.5 flex items-center gap-2 text-stone-600"><span className="inline-block h-1.5 w-1.5 rounded-full bg-stone-400" aria-hidden="true" />Net<span className="ml-auto pl-3 font-medium tabular-nums text-stone-900">{fmt(c.net)}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-4 text-xs text-stone-500">Brut = salariul minim legal al fiecărui an; net = suma rămasă în mână, după CAS, CASS și impozit. Treci cu mouse-ul (sau atinge) un an pentru cifre.</p>
    </figure>
  );
}

function BaraAngajatStat() {
  return (
    <div className="mt-6 max-w-prose">
      <div className="flex h-11 w-full overflow-hidden rounded border border-stone-300 text-xs font-medium" role="img" aria-label="Din 4.418 lei costul firmei din iulie, 2.699 ajung la angajat (61%) și 1.719 la stat (39%).">
        <div className="flex min-w-0 items-center justify-start overflow-hidden whitespace-nowrap bg-stone-900 px-3 text-white" style={{ flexGrow: 61, flexBasis: 0 }}>Angajat 61%</div>
        <div className="flex min-w-0 items-center justify-end overflow-hidden whitespace-nowrap border-l border-stone-300 bg-canvas px-3 text-stone-700" style={{ flexGrow: 39, flexBasis: 0 }}>Stat 39%</div>
      </div>
      <p className="mt-2 text-xs leading-normal text-stone-600">
        Împărțirea costului total din iulie, <strong className="font-medium text-stone-700">4.418 lei</strong>:{" "}
        <strong className="font-medium text-stone-700">2.699</strong> la angajat (net),{" "}
        <strong className="font-medium text-stone-700">1.719</strong> la stat (CAS, CASS, impozit, CAM).
      </p>
    </div>
  );
}

// ─── Componente: carduri aditive (niciun card nu repetă corpul de alături) ────

function CardPentruCe() {
  return (
    <div className={`${card} ${strong}`}>
      <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Pentru ce plătești, de fapt</h3>
      <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
        <strong>CAS</strong> e contribuția ta la pensie: anii lucrați cu normă întreagă contează integral ca stagiu de
        cotizare, chiar la salariul minim. Punctajul, în schimb, crește cu salariul. <strong>CASS</strong> te face
        asigurat cu drepturi depline la sănătate, aceleași servicii ca la orice venit. <strong>Impozitul</strong>{" "}
        finanțează serviciile publice, de la școli la drumuri.
      </p>
    </div>
  );
}

function CardPastrezi() {
  return (
    <div className={`${card} ${strong}`}>
      <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Cât păstrezi din brut</h3>
      <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
        Din fiecare 100 de lei bruți, din iulie ajung la tine ~62 (<strong>62,4%</strong>), restul merge la
        stat. Rata a scăzut puțin față de prima parte a anului (<strong>63,6%</strong>), pentru că partea scutită
        de taxe s-a redus de la 300 la 200 de lei.
      </p>
      <p className="mt-auto pt-4 text-xs text-stone-500">CAS și CASS se aplică pe „bază&quot; (brut minus partea scutită), nu pe brutul întreg, de aceea îți rămâne peste 60%.</p>
    </div>
  );
}

function CardCatiOameni() {
  return (
    <div className={`${card} ${strong}`}>
      <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Câți oameni iau minimul</h3>
      <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
        <strong>831.382 de salariați</strong> erau plătiți la nivelul minim la majorarea din iulie 2026, potrivit
        Ministerului Muncii. Pentru toți, noul brut e obligatoriu de la 1 iulie, indiferent ce scrie încă în
        contract.
      </p>
    </div>
  );
}

function CardCifre() {
  return (
    <div className={card}>
      <h3 className="mb-3 text-xs font-medium text-stone-500">Cifre · 2026 (lei / lună)</h3>
      <table className="w-full text-sm tabular-nums">
        <thead>
          <tr className="border-b border-stone-200 text-stone-500">
            <th scope="col" className="pb-2 text-left text-xs font-medium"></th>
            <th scope="col" className="pb-2 text-right text-xs font-medium uppercase tracking-wide">ian–iun</th>
            <th scope="col" className="pb-2 text-right text-xs font-medium uppercase tracking-wide">iul–dec</th>
          </tr>
        </thead>
        <tbody className="[&_td]:py-2 [&_th]:py-2">
          <tr className="border-b border-stone-100">
            <th scope="row" className="text-left font-normal text-stone-600">Brut</th>
            <td className="text-right font-medium text-stone-900">{fmt(4050)}</td>
            <td className="text-right font-medium text-stone-900">{fmt(4325)}</td>
          </tr>
          <tr className="border-b border-stone-100">
            <th scope="row" className="text-left font-normal text-stone-600">Net (în mână)</th>
            <td className="text-right font-bold text-stone-900">{fmt(2574)}</td>
            <td className="text-right font-bold text-stone-900">{fmt(2699)}</td>
          </tr>
          <tr className="border-b border-stone-100">
            <th scope="row" className="text-left font-normal text-stone-600">La stat</th>
            <td className="text-right text-stone-700">{fmt(1560)}</td>
            <td className="text-right text-stone-700">{fmt(1719)}</td>
          </tr>
          <tr>
            <th scope="row" className="text-left font-normal text-stone-600">Cost firmă</th>
            <td className="text-right text-stone-700">{fmt(4134)}</td>
            <td className="text-right text-stone-700">{fmt(4418)}</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-auto pt-4 text-xs text-stone-500">Net standard, funcție de bază, cu facilitatea fiscală inclusă.</p>
    </div>
  );
}

function CardSalariuIntarziat() {
  return (
    <div className={`${card} ${strong}`}>
      <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Dacă salariul nu vine la timp</h3>
      <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
        Salariul se plătește cel puțin o dată pe lună, la data din contract. Pentru întârziere nejustificată poți cere{" "}
        <strong>daune-interese</strong> (Codul Muncii, art. 166), iar dacă angajatorul nu își respectă obligațiile,
        poți demisiona <strong>fără preaviz</strong> (art. 81).
      </p>
    </div>
  );
}

function CardOreSuplimentare() {
  return (
    <div className={`${card} ${strong}`}>
      <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Peste program? Se plătește</h3>
      <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
        Orele suplimentare se compensează cu <strong>timp liber plătit</strong> în următoarele 90 de zile; dacă nu se
        poate, se plătesc cu spor de cel puțin <strong>75%</strong> (Codul Muncii, art. 122–123). Munca în sărbătorile
        legale se compensează cu zi liberă în 30 de zile sau cu spor de cel puțin <strong>100%</strong> (art. 142).
      </p>
    </div>
  );
}

function CardPartTimeGri() {
  return (
    <div className={`${card} ${strong}`}>
      <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Plătit la 4 ore, muncit la 8?</h3>
      <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
        E muncă nedeclarată parțial, iar factura o plătești tu: <strong>pensia, concediile medicale și orice credit
        bancar</strong> se calculează din venitul declarat, nu din banii primiți în mână. Dacă programul real depășește
        constant norma din contract, contractul trebuie modificat să reflecte orele reale.
      </p>
    </div>
  );
}

function CardCostFirma() {
  return (
    <div className={`${card} ${strong}`}>
      <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Cât o costă pe firmă majorarea</h3>
      <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
        Până la finalul anului, fiecare salariat la minim înseamnă <strong>1.704 lei</strong> în plus (284 lei × 6
        luni). O firmă cu 10 oameni la minim plătește în semestrul al II-lea cu peste <strong>17.000 de lei</strong>{" "}
        mai mult, bani de bugetat din iulie.
      </p>
    </div>
  );
}

function CardSectoareNet() {
  return (
    <div className={card}>
      <h3 className="mb-3 text-xs font-medium text-stone-500">Brut și net pe sectoare (iul–dec, lei / lună)</h3>
      <table className="w-full text-sm tabular-nums">
        <thead>
          <tr className="border-b border-stone-200 text-stone-500">
            <th scope="col" className="pb-2 text-left text-xs font-medium">Sector</th>
            <th scope="col" className="pb-2 text-right text-xs font-medium uppercase tracking-wide">Brut</th>
            <th scope="col" className="pb-2 text-right text-xs font-medium uppercase tracking-wide">Net</th>
          </tr>
        </thead>
        <tbody className="[&_td]:py-2 [&_th]:py-2">
          <tr className="border-b border-stone-100">
            <th scope="row" className="text-left font-normal text-stone-600">Minim general</th>
            <td className="text-right font-medium text-stone-900">{fmt(4325)}</td>
            <td className="text-right font-bold text-stone-900">{fmt(2699)}</td>
          </tr>
          <tr className="border-b border-stone-100">
            <th scope="row" className="text-left font-normal text-stone-600">Construcții</th>
            <td className="text-right font-medium text-stone-900">{fmt(4582)}</td>
            <td className="text-right font-bold text-stone-900">{fmt(2754)}</td>
          </tr>
          <tr>
            <th scope="row" className="text-left font-normal text-stone-600">Agro și alimentar</th>
            <td className="text-right font-medium text-stone-900">{fmt(4325)}</td>
            <td className="text-right font-bold text-stone-900">{fmt(2699)}</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-auto pt-4 text-xs text-stone-500">
        În construcții, brutul e cu 257 de lei mai mare, dar netul doar cu 55: facilitatea de 200 de lei se acordă numai
        la minimul general, iar deducerea personală scade pe măsură ce brutul urcă.
      </p>
    </div>
  );
}

function CardPutereCumparare() {
  return (
    <div className={`${card} ${strong}`}>
      <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Cât a crescut cu adevărat</h3>
      <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
        Pe hârtie, minimul s-a mai mult decât dublat din 2019. Dar între timp au urcat și prețurile, cam{" "}
        <strong>55%</strong>. După ce scazi scumpirea, puterea de cumpărare a crescut cu aproximativ{" "}
        <strong>o treime</strong>, nu de două ori.
      </p>
      <table className="mt-4 w-full text-sm tabular-nums">
        <tbody className="[&_td]:py-2">
          <tr className="border-b border-stone-100">
            <td className="text-left text-stone-600">Pe hârtie (nominal)</td>
            <td className="text-right font-medium text-stone-900">+108%</td>
          </tr>
          <tr>
            <td className="text-left text-stone-600">În puterea de cumpărare</td>
            <td className="text-right font-bold text-stone-900">≈ +35%</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-auto pt-4 text-xs text-stone-500">
        Brut 2.080 → 4.325 lei. Inflație cumulată 2019–2026 ≈ 55%, estimată din ratele anuale INS.
      </p>
    </div>
  );
}

function CardUrmatoareaCrestere() {
  return (
    <div className={`${card} ${strong}`}>
      <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Când crește data viitoare</h3>
      <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
        Minimul se stabilește prin <strong>hotărâre de guvern</strong>, de regulă o dată pe an, după consultarea
        sindicatelor și a patronatelor. Pentru 2027, discuțiile încep de obicei toamna. Actualizăm pagina imediat ce
        apare hotărârea.
      </p>
    </div>
  );
}

function CardSurse() {
  return (
    <div className={card}>
      <h3 className="mb-3 text-xs font-medium text-stone-500">Surse oficiale</h3>
      <ul className={`flex flex-col gap-2 text-sm leading-normal text-stone-600 ${links}`}>
        <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/308231" target="_blank" rel="noopener">HG 146/2026</a>: salariul minim, 1 iulie 2026</li>
        <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/291450" target="_blank" rel="noopener">HG 1506/2024</a>: salariul minim, 1 ian. 2025</li>
        <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/305817" target="_blank" rel="noopener">OUG 89/2025</a>: facilitatea 300/200 lei</li>
        <li><a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/309674" target="_blank" rel="noopener">OUG 29/2026</a>: agroalimentarul, aliniat la minimul general</li>
        <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/293109" target="_blank" rel="noopener">OUG 156/2024</a>: eliminare scutiri sectoriale</li>
        <li><a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646" target="_blank" rel="noopener">Codul Muncii</a> · <a href="https://legislatie.just.ro/Public/DetaliiDocument/257144" target="_blank" rel="noopener">Codul Fiscal</a></li>
      </ul>
      <h3 className="mb-3 mt-6 text-xs font-medium text-stone-500">Pagini conexe</h3>
      <ul className={`flex flex-col gap-2 text-sm ${links}`}>
        <li><Link href="/noutati/salariul-minim-1-iulie-2026">Ce se schimbă de la 1 iulie 2026</Link></li>
        <li><Link href="/noutati/cosul-minim-de-consum">Salariul minim față de coșul minim de trai</Link></li>
        <li><Link href="/salariu-mediu">Salariul mediu pe economie</Link></li>
        <li><Link href="/zile-libere-2026">Zile libere și lucrătoare 2026</Link></li>
      </ul>
      <p className="mt-auto pt-6 text-xs text-stone-500">Ultima actualizare: 10 iulie 2026.</p>
    </div>
  );
}

// ─── Pagina ──────────────────────────────────────────────────────────────────

export default function SalariuMinimPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">

          {/* HERO — lede = răspunsul, o singură dată */}
          <div className={`${row} md:items-center`}>
            <div className="md:col-span-3">
              <h1 className="text-3xl font-bold tracking-[-0.02em] text-stone-900 sm:text-4xl">Salariul minim în 2026</h1>
              <p className="mt-4 text-xs text-stone-600 [&_a]:font-medium [&_a]:text-stone-700 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-900">
                Scris de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Actualizat 10 iulie 2026
              </p>
              <p className={`mt-5 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600 ${strong}`}>
                Din 1 iulie 2026, salariul minim brut este <strong>4.325 lei</strong>, adică <strong>2.699 lei</strong>{" "}
                net, în mână. Până la 1 iulie a fost 4.050 lei, cu 2.574 net. În continuare vezi ce reține statul, cât
                costă firma și de ce netul a crescut mai puțin decât brutul.
              </p>
            </div>
            <div className={aside}>
              <Image
                src="/hero-salariu-minim.png"
                alt="Ilustrație: o mână deschisă care susține o căsuță și o siluetă mică, salariul minim ca o podea ce asigură un trai demn"
                width={1200}
                height={896}
                priority
                sizes="(max-width: 768px) 100vw, 480px"
                className="w-full rounded-md"
              />
            </div>
          </div>

          {/* RÂNDURI cu linie de separare între secțiuni */}
          <div className="[&>div]:mt-10 [&>div]:border-t [&>div]:border-stone-200 [&>div]:pt-10 sm:[&>div]:mt-14 sm:[&>div]:pt-14">

            {/* RÂND 1 — mecanismul reținerilor (fără repetarea cifrelor din lede) */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2>Ce se reține din brut</h2>
                  <p>
                    Minimul îl stabilește Guvernul prin hotărâre, nu se negociază între tine și firmă. Din brut se rețin
                    trei lucruri: <strong>CAS 25%</strong> (contribuția la pensie), <strong>CASS 10%</strong> (sănătate) și{" "}
                    <strong>impozitul pe venit, 10%</strong>.
                  </p>
                  <p>
                    La salariul minim mai intervine ceva: dacă e locul tău de muncă de bază, cu normă întreagă, o parte
                    fixă din brut e scutită complet de taxe: 200 de lei din iulie, 300 înainte (facilitatea din OUG
                    89/2025). Reținerile se aplică doar pe ce rămâne.
                  </p>
                </div>
              </div>
              <aside className={aside}>
                <CardPentruCe />
              </aside>
            </div>

            {/* RÂND 2 — calculul, pas cu pas */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2 id="net" className="scroll-mt-24">Netul, pas cu pas</h2>
                  <p>
                    Drumul de la brut la net, pe ambele perioade ale anului: pornești de la brut, scazi partea scutită de
                    taxe, iar pe rest („baza&quot;) se aplică cele trei rețineri.
                  </p>
                  <TabelPasCuPas />
                  <p>
                    Cheia e rândul „bază pentru taxe&quot;: urcă cu 375 de lei, nu cu 275, fiindcă partea scutită scade cu 100. O
                    felie mai mare devine impozabilă, așa că statul reține în plus exact cei 150 de lei (93 + 38 + 19) care
                    „lipsesc&quot; din creșterea netă. Tabelul complet pe plafoane e la <Link href="/deducere-personala-2026">deducerea personală 2026</Link>; pentru orice altă sumă, folosește <Link href="/">calculatorul</Link>.
                  </p>
                </div>
              </div>
              <aside className={aside}>
                <div className="flex h-full flex-col gap-6">
                  <CardPastrezi />
                  <CardCatiOameni />
                </div>
              </aside>
            </div>

            {/* RÂND 3 — angajat vs firmă (cifrele împărțirii stau doar la bară) */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2>Ce câștigă angajatul, ce plătește firma</h2>
                  <p>
                    Peste brut, firma plătește un singur lucru în plus: contribuția asiguratorie pentru muncă
                    (<strong>CAM 2,25%</strong>). Atenție la o confuzie des întâlnită: CAS, CASS și impozitul nu sunt
                    costuri suplimentare ale firmei, ci se rețin din salariul tău.
                  </p>
                  <p>
                    Majorarea din iulie arată și partea mai puțin spusă: firma plătește cu <strong>284 de lei</strong> mai
                    mult pe lună, dar la tine ajung doar <strong>125</strong>. Restul de 159 sunt taxe în plus la stat.
                  </p>
                </div>
                <BaraAngajatStat />
              </div>
              <aside className={aside}>
                <CardCifre />
              </aside>
            </div>

            {/* RÂND 4 — drepturile, în corpul articolului */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2>Drepturile tale la salariul minim</h2>
                  <p>
                    La normă întreagă, niciun angajator nu te poate plăti legal sub minim, indiferent ce scrie în contract
                    (<strong>Codul Muncii, art. 164</strong>). Pragul se aplică și pe oră: la normă parțială, plata e
                    proporțională cu orele, dar niciodată sub tariful orar minim. Dacă primești mai puțin, te poți adresa{" "}
                    <strong>Inspecției Muncii (ITM)</strong>.
                  </p>
                  <p>
                    După <strong>24 de luni</strong> la salariul minim la același angajator, legea îl obligă să îți
                    negocieze un salariu mai mare (art. 164²). E protecția împotriva blocării pe termen lung la minim.
                  </p>
                  <p>
                    Dacă ești plătit peste minim, majorarea din iulie nu te atinge automat: legea obligă doar aducerea la
                    4.325 lei a celor aflați sub noul prag. Diferența față de colegii la minim se strânge, fenomen numit
                    tasarea grilei de salarizare.
                  </p>
                </div>
              </div>
              <aside className={aside}>
                <CardSalariuIntarziat />
              </aside>
            </div>

            {/* RÂND 5 — cazuri particulare: oră, zi, normă parțială */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2>Pe oră, pe zi și la normă parțială</h2>
                  <p>
                    Tariful orar minim e <strong>25,949 lei</strong> din iulie (4.325 lei la 166,667 ore medii pe lună);
                    în prima jumătate a anului a fost 24,496 lei. Pe zi lucrătoare, netul revine la circa{" "}
                    <strong>129 de lei</strong> din iulie (123 înainte). Suma pe zi diferă de la lună la lună, fiindcă
                    zilele lucrătoare variază între 19 și 23, dar netul lunar rămâne fix.
                  </p>
                  <p>La normă parțială, brutul e proporțional cu orele. Netul, nu chiar:</p>
                  <TabelPartTime />
                  <p>
                    Încă o protecție: la un contract sub salariul minim, CAS și CASS se datorează tot la baza minimului,
                    iar diferența o suportă <strong>angajatorul</strong>, nu se reține din netul tău. Excepție fac elevii
                    și studenții sub 26 de ani, pensionarii, persoanele cu handicap și cei cu mai multe contracte care
                    însumate ating minimul.
                  </p>
                </div>
              </div>
              <aside className={aside}>
                <div className="flex h-full flex-col gap-6">
                  <CardOreSuplimentare />
                  <CardPartTimeGri />
                </div>
              </aside>
            </div>

            {/* RÂND 6 — obligațiile angajatorului */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2>Obligațiile angajatorului</h2>
                  <p>Dacă ești angajator, majorarea din iulie nu se aplică de la sine, fiecare contract la minim cere pași concreți:</p>
                  <ul>
                    <li><strong>Act adițional</strong> semnat individual cu fiecare salariat (nu o decizie colectivă).</li>
                    <li><strong>REGES-Online</strong>: noul brut se raportează în maximum 20 de zile lucrătoare.</li>
                    <li><strong>Amenzi</strong>: 5.000–8.000 lei pentru raportarea întârziată; 3.000–5.000 lei pe salariat dacă plătești sub minim.</li>
                  </ul>
                </div>
              </div>
              <aside className={aside}>
                <CardCostFirma />
              </aside>
            </div>

            {/* RÂND 7 — minimul pe sectoare */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2>Minimul pe sectoare</h2>
                  <p>
                    Construcțiile au un salariu minim propriu, <strong>4.582 lei</strong>, neschimbat tot anul, și au rămas
                    singurul sector cu prag distinct: de la 1 iulie 2026, <strong>agricultura și industria alimentară</strong>{" "}
                    au trecut pe minimul general de 4.325 lei, după ce <strong>OUG 29/2026</strong> le-a abrogat nivelul
                    separat (altfel ar fi rămas la 4.050 lei). Iar un muncitor în construcții plătește azi aceleași taxe ca
                    oricine: scutirile pe care le aveau <strong>IT-ul, construcțiile și agroalimentarul</strong> au fost{" "}
                    <strong>eliminate (OUG 156/2024)</strong> din ianuarie 2025. Acum nu mai există niciun regim fiscal
                    special pe sectoare.
                  </p>
                </div>
              </div>
              <aside className={aside}>
                <CardSectoareNet />
              </aside>
            </div>

            {/* RÂND 8 — istoric: întâi tabelul (text), apoi graficul */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2>Cum a crescut în timp</h2>
                  <p>În șapte ani, minimul brut s-a mai mult decât dublat, de la 2.080 lei în 2019 la 4.325 în 2026. Întâi cifrele, apoi aceeași evoluție pe grafic:</p>
                  <TabelIstoric />
                  <GraficIstoric />
                </div>
              </div>
              <aside className={aside}>
                <div className="flex h-full flex-col gap-6">
                  <CardPutereCumparare />
                  <CardUrmatoareaCrestere />
                </div>
              </aside>
            </div>

            {/* RÂND 9 — FAQ, fără întrebările acoperite în corp */}
            <div className={row}>
              <div className="md:col-span-3">
                <h2 className="mb-4 text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">Întrebări frecvente</h2>
                <div className="flex flex-col">
                  {FAQ.map((item, i) => (
                    <details key={i} name="faq-minim" className="group border-b border-stone-200 py-4">
                      <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-medium tracking-[-0.01em] text-stone-900 [&::-webkit-details-marker]:hidden">
                        {item.q}
                        <span className="flex-shrink-0 text-xl text-stone-900 group-open:hidden">+</span>
                        <span className="hidden flex-shrink-0 text-xl text-stone-900 group-open:inline">−</span>
                      </summary>
                      <p className="mt-3 text-base leading-normal tracking-[-0.01em] text-stone-600">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
              <aside className={aside}>
                <CardSurse />
              </aside>
            </div>

            {/* RÂND FINAL — CTA pe stânga */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={card}>
                  <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900">Calculează orice salariu</h2>
                  <p className="mt-2 text-base leading-normal tracking-[-0.01em] text-stone-600">
                    Vezi ce primești în mână, ce reține statul și cât plătește firma, pentru orice sumă brută sau netă.
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
    </>
  );
}
