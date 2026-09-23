// app/salariu-minim/page.tsx
// Server Component pur — zero JS la client.
// Rescris pe 24 septembrie 2026 după regulile din BRAND.md §2 („Textul servește
// intenția"): răspunsul sus, calculul într-un card de formulă, o idee pe paragraf,
// cifrele multe în tabele. Cifrele curente vin din motorul fiscal; istoricul e
// fix, fiindcă trecutul nu se mai schimbă.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/app/components/Link";
import { Formula } from "@/app/components/ui";
import { personSchema } from "@/lib/person";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import { calculStandard, calculStandardCuRegim, PLAFON_FACILITATE, SALARIU_MINIM, SALARIU_MINIM_CONSTRUCTII } from "@/lib/fiscal";

// Imaginea de share a paginii: crop 1200×630 din hero (nu brandul generic).
const OG_SALARIU_MINIM = {
  url: "/og-salariu-minim.jpg",
  width: 1200,
  height: 630,
  alt: "Ilustrație: o mână deschisă care susține o căsuță și o siluetă mică, salariul minim ca o podea ce asigură un trai demn",
} as const;

// ─── Metadata SEO ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  // Titlu absolut: cu sufixul de brand ajungea la 70 de caractere și se trunchia
  // în SERP exact peste cifre.
  title: { absolute: "Salariul minim pe economie 2026 - Brut, net și taxe" },
  description:
    "Salariul minim e 4.325 lei brut și 2.699 lei net din 1 iulie 2026, o creștere de la 4.050 lei. Vezi cum s-a calculat și costul total pentru angajator.",
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

// ─── Cifre ───────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);
const ACUM = calculStandard(SALARIU_MINIM)!;
const MINIM_S1 = 4050;
const INAINTE = calculStandardCuRegim(MINIM_S1, "2026-S1")!;
const CRESTERE_BRUT = SALARIU_MINIM - MINIM_S1;
const CRESTERE_NET = ACUM.netBani - INAINTE.netBani;
const CRESTERE_COST = ACUM.costTotal - INAINTE.costTotal;
const LA_ANGAJAT = Math.round((ACUM.netBani / ACUM.costTotal) * 100);
// Media lunară de ore din HG 146/2026 și media zilelor lucrătoare dintr-o lună.
const TARIF_ORAR = "25,949";
const NET_PE_ZI = Math.round(ACUM.netBani / (166.667 / 8));

const ISTORIC = [
  { perioada: "2019", short: "2019", brut: 2080, net: 1263 },
  { perioada: "2020", short: "2020", brut: 2230, net: 1346 },
  { perioada: "2021", short: "2021", brut: 2300, net: 1386 },
  { perioada: "2022", short: "2022", brut: 2550, net: 1524 },
  { perioada: "ianuarie 2023", short: "ian. 2023", brut: 3000, net: 1863 },
  { perioada: "octombrie 2023", short: "oct. 2023", brut: 3300, net: 2079 },
  { perioada: "iulie 2024", short: "iul. 2024", brut: 3700, net: 2363 },
  { perioada: "ianuarie 2025", short: "din ian. 2025", brut: 4050, net: 2574 },
  { perioada: "iulie 2026", short: "din iul. 2026", brut: 4325, net: 2699 },
];

// Netul la normă parțială — motorul fiscal (scripts/calc-parttime.mts). Fără
// scutirea de 200 lei, care cere normă întreagă; deducerea rămâne întreagă.
const PARTTIME = [
  { norma: "2 ore pe zi", brut: 1081, net: 703 },
  { norma: "4 ore pe zi", brut: 2163, net: 1352 },
  { norma: "6 ore pe zi", brut: 3244, net: 1985 },
  { norma: "8 ore pe zi", brut: 4325, net: 2699 },
];

// FAQ: doar ce nu acoperă corpul paginii. Răspunsuri de sine stătătoare, scurte.
const FAQ = [
  {
    q: "Se aplică salariul minim și în agricultură și industria alimentară?",
    a: `Da. Din 1 iulie 2026, aceste sectoare nu mai au un minim separat, așa că plătesc tot ${fmt(SALARIU_MINIM)} lei brut.`,
  },
  {
    q: "Tichetele de masă îmi anulează scutirea de 200 de lei?",
    a: `Nu. Plafonul de ${fmt(PLAFON_FACILITATE)} lei se verifică fără tichete. Pe valoarea tichetelor plătești doar contribuția de sănătate și impozitul.`,
  },
  {
    q: "Pierd scutirea dacă primesc un spor?",
    a: `Doar dacă sporul, bonusul sau orele suplimentare urcă brutul lunii peste ${fmt(PLAFON_FACILITATE)} de lei. În luna aceea se taxează tot salariul.`,
  },
  {
    q: "Cât e salariul minim net pe zi?",
    a: `În medie, cam ${fmt(NET_PE_ZI)} de lei în mână pe o zi lucrătoare. Suma pe zi variază, fiindcă lunile au între 19 și 23 de zile lucrătoare, dar netul lunar rămâne același.`,
  },
  {
    q: "Mai există scutirea de impozit pentru IT și construcții?",
    a: `Nu, a dispărut din ianuarie 2025. În construcții există în schimb un salariu minim mai mare, de ${fmt(SALARIU_MINIM_CONSTRUCTII)} lei brut.`,
  },
];

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
      headline: "Salariul minim pe economie 2026: cât rămâne net la tine",
      description:
        "Salariul minim în 2026: cât e brut și net, cum se calculează, ce plătește firma, drepturile angajatului și istoricul creșterilor.",
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/icon-512.png", width: 512, height: 512 },
      },
      image: { "@type": "ImageObject", url: "https://salariile.ro/og-salariu-minim.jpg", width: 1200, height: 630 },
      mainEntityOfPage: "https://salariile.ro/salariu-minim",
      datePublished: "2026-04-27",
      dateModified: PAGE_LAST_MODIFIED["/salariu-minim"].toISOString().slice(0, 10),
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

// ─── Stiluri ─────────────────────────────────────────────────────────────────

const articol =
  "[&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:tracking-[-0.02em] [&>h2]:text-stone-900 sm:[&>h2]:text-3xl [&>h2:first-child]:mt-0 " +
  "[&_p]:mb-4 [&_p]:text-base [&_p]:leading-normal [&_p]:tracking-[-0.01em] [&_p]:text-stone-600 " +
  "[&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2 [&_li]:leading-normal [&_li]:tracking-[-0.01em] [&_li]:text-stone-600 " +
  "[&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600 " +
  "[&_strong]:font-semibold [&_strong]:text-stone-900";

const card = "flex h-full flex-col rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6";
const links =
  "[&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600";
const strong = "[&_strong]:font-semibold [&_strong]:text-stone-900";
const row = "md:grid md:grid-cols-5 md:gap-8 lg:gap-10";
const aside = "mt-8 md:col-span-2 md:mt-0";
const textCard = "mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600";
const titluCard = "text-base font-bold tracking-[-0.01em] text-stone-900";

// ─── Tabele și grafic ────────────────────────────────────────────────────────

function TabelPartTime() {
  return (
    <div className="my-6 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
      <table className="w-full text-sm tabular-nums [&_td]:py-2.5 [&_tbody_th]:py-2.5 [&_tbody_th]:pr-2 [&_tbody_th]:text-left [&_td:not(:first-child)]:pl-3 [&_th:not(:first-child)]:pl-3 [&_td:not(:first-child)]:text-right [&_th:not(:first-child)]:text-right">
        <thead>
          <tr className="border-b border-stone-300 text-xs font-medium uppercase tracking-wide text-stone-600">
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
    </div>
  );
}

function TabelIstoric() {
  return (
    <div className="my-6 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
      <table className="w-full text-sm tabular-nums [&_td]:py-2 [&_tbody_th]:py-2 [&_tbody_th]:pr-2 [&_tbody_th]:text-left [&_td:not(:first-child)]:pl-3 [&_th:not(:first-child)]:pl-3 [&_td:not(:first-child)]:text-right [&_th:not(:first-child)]:text-right">
        <thead>
          <tr className="border-b border-stone-300 text-xs font-medium uppercase tracking-wide text-stone-600">
            <th scope="col" className="pb-2 text-left">Din</th>
            <th scope="col" className="pb-2">Brut</th>
            <th scope="col" className="pb-2">Net</th>
          </tr>
        </thead>
        <tbody>
          {ISTORIC.map((r, i) => (
            <tr key={r.perioada} className={i === ISTORIC.length - 1 ? "font-medium text-stone-900" : "border-b border-stone-100"}>
              <th scope="row" className="font-normal text-stone-600">{r.perioada}</th>
              <td className="text-stone-900">{fmt(r.brut)}</td>
              <td className="text-stone-700">{fmt(r.net)}</td>
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
      <p className="mt-4 text-xs text-stone-600">Treci cu mouse-ul sau atinge un punct ca să vezi brutul și netul din acel an.</p>
    </figure>
  );
}

function BaraAngajatStat() {
  return (
    <div className="mt-6 max-w-prose">
      <div className="flex h-11 w-full overflow-hidden rounded border border-stone-300 text-xs font-medium" role="img" aria-label={`Din tot ce plătește firma pentru un salariat la minim, ${LA_ANGAJAT}% ajunge la angajat și ${100 - LA_ANGAJAT}% la stat.`}>
        <div className="flex min-w-0 items-center justify-start overflow-hidden whitespace-nowrap bg-stone-900 px-3 text-white" style={{ flexGrow: LA_ANGAJAT, flexBasis: 0 }}>Angajat {LA_ANGAJAT}%</div>
        <div className="flex min-w-0 items-center justify-end overflow-hidden whitespace-nowrap border-l border-stone-300 bg-canvas px-3 text-stone-700" style={{ flexGrow: 100 - LA_ANGAJAT, flexBasis: 0 }}>Stat {100 - LA_ANGAJAT}%</div>
      </div>
      <p className="mt-2 text-xs leading-normal text-stone-600">
        Din tot ce plătește firma pentru un salariat la minim, partea care ajunge la el și partea care merge la stat.
      </p>
    </div>
  );
}

// ─── Carduri laterale: fiecare spune ceva ce corpul nu spune ─────────────────

function CardPentruCe() {
  return (
    <div className={`${card} ${strong}`}>
      <h3 className={titluCard}>Pe ce se duc banii reținuți</h3>
      <p className={textCard}>
        <strong>Pensia.</strong> Un an cu normă întreagă contează întreg la stagiul de cotizare, chiar la
        salariul minim. Pensia în sine crește însă cu salariul.
      </p>
      <p className={textCard}>
        <strong>Sănătatea.</strong> Ești asigurat cu drepturi depline, la fel ca oricine câștigă mai mult.
      </p>
      <p className={textCard}>
        <strong>Impozitul</strong> merge la bugetul din care se plătesc școlile, spitalele și drumurile.
      </p>
    </div>
  );
}

function CardCatiOameni() {
  return (
    <div className={`${card} ${strong}`}>
      <h3 className={titluCard}>Câți oameni iau minimul</h3>
      <p className={textCard}>
        <strong>831.382 de salariați</strong> erau plătiți la minim când a crescut în iulie 2026, potrivit
        Ministerului Muncii. Pentru toți, noul brut e obligatoriu de la 1 iulie, orice ar scrie încă în contract.
      </p>
    </div>
  );
}

function CardUrmatoareaCrestere() {
  return (
    <div className={`${card} ${strong}`}>
      <h3 className={titluCard}>Când crește data viitoare</h3>
      <p className={textCard}>
        Minimul îl stabilește Guvernul prin hotărâre, de obicei o dată pe an, după discuții cu sindicatele și
        patronatele. Pentru 2027, discuțiile încep de regulă toamna. Actualizăm pagina în ziua în care apare
        hotărârea în Monitorul Oficial.
      </p>
    </div>
  );
}

function CardOreSuplimentare() {
  return (
    <div className={`${card} ${strong}`}>
      <h3 className={titluCard}>Orele peste program</h3>
      <p className={textCard}>
        Se compensează cu timp liber plătit în următoarele 90 de zile. Dacă nu se poate, se plătesc cu un spor de
        cel puțin <strong>75%</strong>. Munca într-o sărbătoare legală înseamnă o zi liberă în 30 de zile sau un
        spor de cel puțin <strong>100%</strong>.
      </p>
      <p className="mt-auto pt-4 text-xs text-stone-600">
        <Link href="/calculator-ore-suplimentare" className="font-medium text-stone-900 underline underline-offset-2">Calculează orele suplimentare</Link>
      </p>
    </div>
  );
}

function CardPartTimeGri() {
  return (
    <div className={`${card} ${strong}`}>
      <h3 className={titluCard}>Plătit la 4 ore, muncit la 8?</h3>
      <p className={textCard}>
        E muncă la negru pe jumătate, iar nota o plătești tu: <strong>pensia, concediile medicale și orice
        credit</strong> se calculează din salariul declarat, nu din banii primiți în mână. Dacă lucrezi constant mai
        mult decât scrie în contract, contractul trebuie schimbat.
      </p>
    </div>
  );
}

function CardSurse() {
  return (
    <div className={card}>
      <h3 className="mb-3 text-xs font-medium text-stone-600">Surse oficiale</h3>
      <ul className={`flex flex-col gap-2 text-sm leading-normal text-stone-600 ${links}`}>
        <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/308231" target="_blank" rel="noopener">HG 146/2026</a>: salariul minim din 1 iulie 2026</li>
        <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/291450" target="_blank" rel="noopener">HG 1506/2024</a>: salariul minim din 1 ianuarie 2025</li>
        <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/305817" target="_blank" rel="noopener">OUG 89/2025</a>: suma netaxată de 300 și 200 lei</li>
        <li><a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/309674" target="_blank" rel="noopener">OUG 29/2026</a>: agricultura și industria alimentară, aliniate la minimul general</li>
        <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/293109" target="_blank" rel="noopener">OUG 156/2024</a>: eliminarea scutirilor pe sectoare</li>
        <li><a href="https://www.inspectiamuncii.ro/documents/66402/268210/Comunicat%2B1%2Biulie.pdf/c0655b8a-b9d1-4ec7-b641-b470c7bab969" target="_blank" rel="noopener">Inspecția Muncii</a>: actele individuale și raportarea în REGES</li>
        <li><a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646" target="_blank" rel="noopener">Codul Muncii</a>, art. 164 și 166 · <a href="https://legislatie.just.ro/Public/DetaliiDocument/257144" target="_blank" rel="noopener">Codul Fiscal</a></li>
      </ul>
    </div>
  );
}

function CardConexe() {
  return (
    <div className={card}>
      <h3 className="mb-3 text-xs font-medium text-stone-600">Pagini conexe</h3>
      <ul className={`flex flex-col gap-2 text-sm ${links}`}>
        <li><Link href="/noutati/salariul-minim-1-iulie-2026">Ce s-a schimbat de la 1 iulie 2026</Link></li>
        <li><Link href="/noutati/salariu-peste-minim-1-iulie-2026">Salariile puțin peste minim</Link></li>
        <li><Link href="/noutati/salariul-minim-romania-vs-uniunea-europeana-2026">Salariul minim din România față de restul Uniunii</Link></li>
        <li><Link href="/noutati/cosul-minim-de-consum">Salariul minim față de coșul minim de trai</Link></li>
        <li><Link href="/noutati/tichete-de-masa-2026">Cum se taxează tichetele de masă</Link></li>
        <li><Link href="/salariu-mediu">Salariul mediu pe economie</Link></li>
        <li><Link href="/calculator-salariu-part-time">Calculator salariu part-time</Link></li>
        <li><Link href="/zile-libere-2026">Zile libere 2026</Link></li>
      </ul>
    </div>
  );
}

// ─── Pagina ──────────────────────────────────────────────────────────────────

export default function SalariuMinimPage() {
  const dataActualizare = PAGE_LAST_MODIFIED["/salariu-minim"].toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">

          {/* HERO — răspunsul, o singură dată */}
          <div className={`${row} md:items-center`}>
            <div className="md:col-span-3">
              <h1 className="text-3xl font-bold tracking-[-0.02em] text-stone-900 sm:text-4xl">Salariul minim pe economie 2026: brut și net</h1>
              <p className="mt-4 text-xs text-stone-600 [&_a]:font-medium [&_a]:text-stone-700 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-900">
                Scris de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Actualizat {dataActualizare}
              </p>
              <p className={`mt-5 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600 ${strong}`}>
                De la 1 iulie 2026, salariul minim brut este <strong>{fmt(SALARIU_MINIM)} lei</strong> pe lună. În mână
                ajung <strong>{fmt(ACUM.netBani)} lei</strong>. Până la 30 iunie, minimul a fost {fmt(MINIM_S1)} lei brut.
              </p>
              <p className="mt-4 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600">
                Creșterea din iulie costă firma {fmt(CRESTERE_COST)} de lei în plus pe lună pentru fiecare om plătit la
                minim. În buzunarul lui ajung doar {fmt(CRESTERE_NET)}.
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

          <div className="[&>div]:mt-10 [&>div]:border-t [&>div]:border-stone-200 [&>div]:pt-10 sm:[&>div]:mt-14 sm:[&>div]:pt-14">

            {/* Calculul netului */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2 id="net" className="scroll-mt-24">Cum se ajunge de la {fmt(SALARIU_MINIM)} la {fmt(ACUM.netBani)} lei</h2>
                  <p>
                    Din brut pleacă taxele oricărui salariu: 25% pentru pensie, 10% pentru sănătate și impozitul de 10%.
                    La salariul minim, două lucruri îți lasă mai mulți bani în mână.
                  </p>
                  <Formula
                    eticheta={`Calculul netului la ${fmt(SALARIU_MINIM)} lei brut`}
                    randuri={[
                      `Bază    = ${fmt(SALARIU_MINIM)} − ${fmt(ACUM.facilitate)} netaxați = ${fmt(SALARIU_MINIM - ACUM.facilitate)}`,
                      `CAS     = ${fmt(SALARIU_MINIM - ACUM.facilitate)} × 25%         = ${fmt(ACUM.cas)}`,
                      `CASS    = ${fmt(SALARIU_MINIM - ACUM.facilitate)} × 10%         = ${fmt(ACUM.cass)}`,
                      `Impozit = 10%, după deducere   = ${fmt(ACUM.impozit)}`,
                      `Net     = ${fmt(SALARIU_MINIM)} − ${fmt(ACUM.cas)} − ${fmt(ACUM.cass)} − ${fmt(ACUM.impozit)} = ${fmt(ACUM.netBani)} lei`,
                    ]}
                  />
                  <p>
                    Primul e partea netaxată: <strong>200 de lei din brut</strong> nu plătesc nicio taxă, iar taxele se
                    calculează pe ce rămâne. Scutirea e doar pentru cine lucrează cu normă întreagă, la locul de muncă de
                    bază, și dispare în luna în care sporurile sau bonusurile urcă brutul peste {fmt(PLAFON_FACILITATE)} de lei.
                  </p>
                  <p>
                    Al doilea e <Link href="/deducere-personala-2026">deducerea personală</Link>, cea mai mare tocmai la
                    salariul minim: o parte din venit pe care nu se plătește impozit. Dacă ai copii sau alte persoane în
                    întreținere, crește, iar netul odată cu ea.
                  </p>
                  {/* Pagina asta are cele mai multe backlinkuri dofollow din site, iar
                      pagina de calcul pentru 4.325 lei are mii de afișări cu puțină
                      autoritate internă. Linkul din text le leagă. */}
                  <p>
                    Toate reținerile, cu costul firmei, sunt pe pagina cu{" "}
                    <Link href="/calculator/calcul-salariu-net-4325-brut">calculul salariului net la 4.325 lei brut</Link>.
                  </p>
                </div>
              </div>
              <aside className={aside}>
                <CardPentruCe />
              </aside>
            </div>

            {/* Creșterea din iulie */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2>De ce netul a crescut mai puțin decât brutul</h2>
                  <p>
                    În iulie, brutul a urcat cu {fmt(CRESTERE_BRUT)} de lei, dar netul doar cu {fmt(CRESTERE_NET)}.
                    Motivul e partea netaxată: până în iunie erau 300 de lei, acum sunt 200. O felie mai mare din salariu
                    a intrat la taxe.
                  </p>
                  <p>
                    Pentru firmă, creșterea e mai mare decât pentru angajat. Peste brut, ea plătește 2,25% contribuție
                    pentru muncă, așa că un salariat la minim o costă acum {fmt(ACUM.costTotal)} de lei pe lună. Taxele
                    reținute din salariu nu sunt un cost în plus pentru firmă: ele pleacă din brutul tău.
                  </p>
                </div>
                <BaraAngajatStat />
              </div>
              <aside className={aside}>
                <CardCatiOameni />
              </aside>
            </div>

            {/* Angajatorul */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2>Ce trebuie să facă angajatorul</h2>
                  <p>Pentru fiecare salariat rămas sub noul minim, firma avea de făcut trei lucruri de la 1 iulie:</p>
                  <ul>
                    <li>să-i mărească salariul prin act adițional la contract sau prin decizie individuală;</li>
                    <li>să transmită noul brut în registrul salariaților (REGES), în cel mult 20 de zile lucrătoare;</li>
                    <li>să nu-l plătească sub minim, pentru că amenda e de 3.000–5.000 de lei pentru fiecare om, până la 200.000 de lei în total.</li>
                  </ul>
                  <p>
                    Cine era deja plătit peste noul minim nu primește automat o mărire. Diferența față de colegii de la
                    minim se micșorează, iar asta e una dintre cele mai frecvente surse de nemulțumire după o creștere.
                  </p>
                </div>
              </div>
              <aside className={aside}>
                <CardUrmatoareaCrestere />
              </aside>
            </div>

            {/* Drepturile angajatului */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2>Drepturile tale la salariul minim</h2>
                  <p>
                    La normă întreagă, nimeni nu te poate plăti legal sub minim, orice ar scrie în contract. Dacă se
                    întâmplă, poți face o sesizare la Inspecția Muncii (ITM).
                  </p>
                  <p>
                    Puțini știu că minimul are și o limită în timp. Același angajator te poate ține la salariul de bază
                    minim cel mult <strong>doi ani</strong> de la semnarea contractului. După aceea, salariul de bază
                    trebuie să fie peste minim, iar o creștere generală a minimului nu repornește termenul.
                  </p>
                  <p>
                    Salariul se plătește cel puțin o dată pe lună, la data din contract. Dacă întârzie fără motiv, poți
                    cere despăgubiri, iar dacă angajatorul nu-și respectă obligațiile, poți demisiona fără preaviz.
                  </p>
                </div>
              </div>
              <aside className={aside}>
                <CardOreSuplimentare />
              </aside>
            </div>

            {/* Normă parțială și pe oră */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2>Pe oră și la normă parțială</h2>
                  <p>
                    Pe oră, minimul înseamnă <strong>{TARIF_ORAR} lei brut</strong>. La normă parțială, brutul scade
                    proporțional cu orele. Netul scade ceva mai puțin, pentru că deducerea personală rămâne întreagă:
                  </p>
                  <TabelPartTime />
                  <p>
                    Mai e o protecție: la un contract part-time sub minim, contribuțiile la pensie și sănătate se plătesc
                    ca pentru salariul minim întreg, iar diferența o suportă angajatorul, nu tu. Excepție fac elevii și
                    studenții sub 26 de ani, pensionarii, persoanele cu handicap și cei care ating minimul din mai multe
                    contracte. Pentru orice altă normă, folosește{" "}
                    <Link href="/calculator-salariu-part-time">calculatorul de part-time</Link>.
                  </p>
                </div>
              </div>
              <aside className={aside}>
                <CardPartTimeGri />
              </aside>
            </div>

            {/* Istoric */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2>Cum a crescut salariul minim</h2>
                  <p>În șapte ani, minimul brut s-a dublat.</p>
                  <GraficIstoric />
                  <TabelIstoric />
                  <p>
                    Două sectoare au reguli proprii. În construcții, minimul e mai mare, de {fmt(SALARIU_MINIM_CONSTRUCTII)} lei
                    brut, și are <Link href="/salariu-minim-constructii-2026">pagina lui separată</Link>. Agricultura și
                    industria alimentară au trecut la minimul general din 1 iulie 2026.
                  </p>
                  <p>
                    Minimul mai servește și ca unitate de măsură pentru contribuțiile unui PFA. Acolo contează valoarea
                    de la 1 ianuarie, deci pentru tot anul fiscal 2026 se calculează cu {fmt(MINIM_S1)} lei, nu cu{" "}
                    {fmt(SALARIU_MINIM)}. Pragurile sunt în <Link href="/calculator-pfa">calculatorul PFA</Link>.
                  </p>
                </div>
              </div>
              <aside className={aside}>
                <CardSurse />
              </aside>
            </div>

            {/* FAQ */}
            <div className={row}>
              <div className="md:col-span-3">
                <h2 className="mb-4 text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">Întrebări frecvente</h2>
                <div className="flex flex-col">
                  {FAQ.map((item, i) => (
                    <details key={i} name="faq-minim" className="group border-b border-stone-200">
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
                <CardConexe />
              </aside>
            </div>

            {/* CTA */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={card}>
                  <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900">Calculează orice salariu</h2>
                  <p className="mt-2 text-base leading-normal tracking-[-0.01em] text-stone-600">
                    Scrie brutul sau netul și vezi taxele și costul firmei.
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
