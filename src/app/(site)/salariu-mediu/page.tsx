// app/salariu-mediu/page.tsx
// Server Component pur — SSR maxim, SEO maxim, zero JS la client.
// Restructurat 10 iulie 2026 pe formula de la /salariu-minim (STUDIU-SPECTRUM-CONTENT.md):
// lede canonic unic, secțiuni în ordinea intențiilor din GSC (două cifre → pensia și
// valoarea oficială → net → diferența medie/mediană → istoric cu tabel HTML + grafic), FAQ redus la
// întrebările neacoperite în corp, carduri aditive pe fiecare rând.

import type { Metadata } from "next";
import { PaginiConexe } from "@/app/components/ui";
import Image from "next/image";
import Link from "next/link";
import { LATEST_INS_EARNINGS } from "@/lib/date-salarii";
import { LUNA_REFERINTA, TOTAL_ECONOMIE } from "@/lib/ins-date";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

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

// Imaginea de share a paginii: crop 1200×630 din hero (nu brandul generic).
const OG_SALARIU_MEDIU = {
  url: "/og-salariu-mediu.jpg",
  width: 1200,
  height: 630,
  alt: "Ilustrație: siluete de înălțimi diferite lângă o linie orizontală, reprezentând diferența dintre valori individuale și medie",
} as const;

// ─── Metadata SEO ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: { absolute: "Salariul mediu pe economie 2026: brut, net, mediană" },
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
    q: "Cât este salariul mediu pe economie în 2026 (net și brut)?",
    a: `Cea mai recentă valoare lunară publicată de INS este pentru ${INS_PERIOD_LABEL}: ${INS_BRUT_LABEL} lei brut și ${INS_NET_LABEL} lei net, cu o creștere a netului de ${LATEST_INS_EARNINGS.monthlyNetChangePercent.toLocaleString("ro-RO")}% față de ${LATEST_INS_EARNINGS.previousPeriodLabel}. Separat, Legea 44/2026 fixează la 9.192 lei câștigul salarial mediu brut folosit la fundamentarea bugetului asigurărilor sociale; din acesta rezultă aproximativ 5.377 lei net într-un calcul salarial standard.`,
  },
  {
    q: "Care este diferența dintre salariul mediu și cel minim?",
    a: "Salariul minim (4.325 lei brut din iulie 2026) este pragul legal pentru un contract cu normă întreagă. Câștigul salarial mediu publicat lunar de INS este un indicator statistic, nu o obligație de plată. Valoarea bugetară separată de 9.192 lei este folosită la pensii, ajutorul de deces și alte calcule prevăzute de lege.",
  },
  {
    q: "Cine stabilește valoarea oficială a salariului mediu?",
    a: "Valoarea folosită la pensii, ajutoare și plafoane se fixează anual prin Legea bugetului asigurărilor sociale de stat, pe baza prognozelor Comisiei Naționale de Strategie și Prognoză (CNSP) și a datelor INS. Pentru 2026, Legea 44/2026 a fixat-o la 9.192 lei.",
  },
  {
    q: "Cât este ajutorul de deces în 2026?",
    a: "Din 30 martie 2026, ajutorul de deces este 9.192 lei pentru un asigurat sau pensionar și 4.596 lei pentru un membru de familie, corelat direct cu salariul mediu brut. Până atunci (1 ianuarie – 29 martie 2026) valorile erau 8.620, respectiv 4.310 lei.",
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
        name: "Salariile.ro",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      },
      image: { "@type": "ImageObject", url: "https://salariile.ro/og-salariu-mediu.jpg", width: 1200, height: 630 },
      mainEntityOfPage: "https://salariile.ro/salariu-mediu",
      datePublished: "2026-03-30",
      dateModified: "2026-08-25",
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

// ─── Pagina ──────────────────────────────────────────────────────────────────

export default function SalariuMediuPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">

        {/* HERO — lede = răspunsul, o singură dată (cele două cifre) */}
        <div className={`${row} md:items-center`}>
          <div className="md:col-span-3">
            <h1 className="text-3xl font-bold tracking-[-0.02em] text-stone-900 sm:text-4xl">Salariul mediu pe economie în 2026</h1>
            <p className="mt-4 text-xs text-stone-600 [&_a]:font-medium [&_a]:text-stone-700 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-900">
              Scris de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Actualizat 25 august 2026
            </p>
            <p className={`mt-5 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600 ${strong}`}>
              Cea mai recentă valoare publicată de INS este pentru {INS_PERIOD_LABEL}: <strong>{INS_NET_LABEL} lei net</strong> și{" "}
              <strong>{INS_BRUT_LABEL} lei brut</strong>. Netul a crescut cu <strong>{LATEST_INS_EARNINGS.monthlyNetChangePercent.toLocaleString("ro-RO")}%</strong> față de {LATEST_INS_EARNINGS.previousPeriodLabel}. Valoarea bugetară
              pentru 2026, folosită la pensii și ajutoare, e alta:{" "}
              <strong>9.192 lei brut</strong> (Legea 44/2026). În continuare vezi de ce sunt două cifre, la ce se
              folosește cea oficială, cât rămâne net și de ce media nu descrie venitul fiecărui angajat.
            </p>
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

        <div className="[&>div]:mt-10 [&>div]:border-t [&>div]:border-stone-200 [&>div]:pt-10 sm:[&>div]:mt-14 sm:[&>div]:pt-14">

          {/* RÂND 1 — de ce sunt două cifre (fără repetarea valorilor din lede) */}
          <div className={row}>
            <div className="md:col-span-3">
              <div className={`max-w-prose ${articol}`}>
                <h2>De ce sunt două cifre</h2>
                <p>
                  <strong>Cifra reală</strong> o măsoară INS în fiecare lună, din salariile efectiv plătite, și se
                  mișcă în sus și în jos (în iunie a crescut față de mai). <strong>Cifra oficială</strong>{" "}
                  se fixează o dată pe an prin legea bugetului de asigurări sociale, nu se schimbă în cursul anului și
                  e cea de care statul leagă pensii, ajutoare și plafoane.
                </p>
                <p>
                  Atenție, nu e ca salariul minim. <strong>Minimul</strong> e un prag legal: nimeni nu poate plăti sub
                  el. <strong>Media</strong> e doar o statistică: nu obligă niciun angajator să plătească atât. E un
                  indicator de care statul leagă alte sume, nu un salariu pe care-l ia cineva anume.
                </p>
              </div>
            </div>
            <aside className={aside}>
              <div className={card}>
                <h3 className="mb-3 text-xs font-medium text-stone-500">Cifre · 2026 (lei / lună)</h3>
                <table className="w-full text-sm tabular-nums">
                  <tbody className="[&_td]:py-2">
                    <tr className="border-b border-stone-100">
                      <td className="text-left text-stone-600">Net (real, INS)</td>
                      <td className="text-right font-bold text-stone-900">{fmt(INS_NET_VALUE)}</td>
                    </tr>
                    <tr className="border-b border-stone-100">
                      <td className="text-left text-stone-600">Brut (real, INS)</td>
                      <td className="text-right font-medium text-stone-900">{fmt(INS_BRUT_VALUE)}</td>
                    </tr>
                    <tr>
                      <td className="text-left text-stone-600">Brut oficial (la pensii)</td>
                      <td className="text-right text-stone-700">{fmt(9192)}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="mt-auto pt-4 text-xs text-stone-500">Real = ce măsoară INS lunar (5.518 net în ian., 5.557 în feb., 5.938 în mar., 5.843 în apr., 5.684 în mai, 5.734 în iun.). Oficial = valoare fixă (Legea 44/2026), folosită la pensii și ajutoare.</p>
              </div>
            </aside>
          </div>

          {/* RÂND 2 — intenția nr. 1 din GSC: pensia și valoarea oficială */}
          <div className={row}>
            <div className="md:col-span-3">
              <div className={`max-w-prose ${articol}`}>
                <h2>Salariul mediu brut 2026 pentru calculul pensiei și plafoane</h2>
                <p>
                  Numele complet al cifrei oficiale e <strong>câștigul salarial mediu brut utilizat la fundamentarea
                  bugetului asigurărilor sociale de stat</strong>: 9.192 lei pentru 2026. De ea se leagă:
                </p>
                <ul>
                  <li>
                    <strong>Punctajul de pensie</strong>: se calculează raportând salariul tău brut la media anului.
                    Ca să faci un punct de pensie pe 2026, trebuie să fi câștigat exact media, 9.192 lei brut pe lună;
                    la jumătate din medie faci o jumătate de punct.
                  </li>
                  <li><strong>Ajutorul de deces</strong> din sistemul public de pensii.</li>
                  <li><strong>Plafoane</strong> pentru prestații și indemnizații sociale.</li>
                  <li><strong>Fundamentarea bugetului</strong> de pensii, șomaj și accidente de muncă.</li>
                </ul>
                <p>
                  Pentru toate astea contează valoarea oficială, nu cifra reală INS care se schimbă lună de lună.
                </p>
              </div>
            </div>
            <aside className={aside}>
              <div className={`${card} ${strong}`}>
                <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Valoarea oficială · 2026</h3>
                <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">Cifra fixă (Legea 44/2026) pe care o folosește statul:</p>
                <table className="mt-3 w-full text-sm tabular-nums">
                  <tbody className="[&_td]:py-2">
                    <tr className="border-b border-stone-100">
                      <td className="text-left text-stone-600">Câștig mediu brut (la pensii)</td>
                      <td className="text-right font-bold text-stone-900">{fmt(9192)}</td>
                    </tr>
                    <tr className="border-b border-stone-100">
                      <td className="text-left text-stone-600">Ajutor deces, asigurat</td>
                      <td className="text-right text-stone-700">{fmt(9192)}</td>
                    </tr>
                    <tr>
                      <td className="text-left text-stone-600">Ajutor deces, membru familie</td>
                      <td className="text-right text-stone-700">{fmt(4596)}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="mt-auto pt-4 text-xs text-stone-500">Din 30 martie 2026. Înainte: 8.620 lei (ajutor 8.620 / 4.310).</p>
              </div>
            </aside>
          </div>

          {/* RÂND 3 — netul, pas cu pas */}
          <div className={row}>
            <div className="md:col-span-3">
              <div className={`max-w-prose ${articol}`}>
                <h2 id="net" className="scroll-mt-24">Netul, pas cu pas</h2>
                <p>
                  Calculul pe valoarea oficială de 9.192 lei. La acest nivel <strong>nu se aplică deducerea
                  personală</strong> (ea se dă doar sub 6.325 lei brut), așa că reținerile se calculează la brutul
                  întreg. Raportul agregat net/brut publicat de INS este de aproximativ 60%, dar nu reprezintă
                  conversia unui salariu individual: media include angajați cu situații fiscale și componente salariale diferite.
                </p>
                <div className="my-6 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
                  <table className="w-full text-sm tabular-nums [&_td]:py-2.5 [&_th]:pb-2 [&_td:first-child]:pr-2 [&_td:not(:first-child)]:whitespace-nowrap [&_td:not(:first-child)]:pl-3 [&_td:not(:first-child)]:text-right">
                    <tbody>
                      <tr className="border-b border-stone-100">
                        <td className="text-stone-600">Salariu brut</td>
                        <td className="font-medium text-stone-900">9.192</td>
                      </tr>
                      <tr className="border-b border-stone-100">
                        <td className="text-stone-600">− CAS 25% <span className="text-stone-600">(pensie)</span></td>
                        <td className="text-stone-700">2.298</td>
                      </tr>
                      <tr className="border-b border-stone-100">
                        <td className="text-stone-600">− CASS 10% <span className="text-stone-600">(sănătate)</span></td>
                        <td className="text-stone-700">919</td>
                      </tr>
                      <tr className="border-b border-stone-100 bg-stone-50">
                        <td className="font-medium text-stone-900">= Bază impozabilă</td>
                        <td className="font-medium text-stone-900">5.975</td>
                      </tr>
                      <tr className="border-b border-stone-100">
                        <td className="text-stone-600">− Impozit 10% <span className="text-stone-600">(fără deducere)</span></td>
                        <td className="text-stone-700">598</td>
                      </tr>
                      <tr className="[&_td]:pt-3 [&_td]:font-bold [&_td]:text-stone-900">
                        <td>= Net în mână</td>
                        <td>~5.377</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  Peste brut, firma mai adaugă doar contribuția asiguratorie pentru muncă (CAM 2,25% = 207 lei), așa că un
                  salariu mediu o costă în total ~<strong>9.399 lei</strong>. Pentru orice altă sumă, ai{" "}
                  <Link href="/">calculatorul</Link>.
                </p>
              </div>
            </div>
            <aside className={aside}>
              <div className={`${card} ${strong}`}>
                <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Cât păstrezi din brut</h3>
                <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
                  La indicatorul bugetar, din fiecare 100 de lei bruți ajung la tine ~<strong>58</strong> (5.377 din 9.192),
                  restul, la stat. E mai puțin decât la salariul minim (~62%), pentru că aici dispar facilitatea netaxabilă
                  și deducerea personală.
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
                  Aici e capcana cuvântului „mediu&quot;. Media se calculează adunând toate valorile și împărțind la numărul de
                  salariați, astfel că un grup de salarii foarte mari poate influența rezultatul. Doar din valoarea mediei
                  nu putem deduce câți angajați se află sub sau peste ea.
                </p>
                <p>
                  <strong>Mediana</strong> este valoarea de la mijloc: jumătate dintre observații sunt sub ea și jumătate
                  peste ea. Pentru o comparație corectă este nevoie însă de o mediană calculată pentru aceeași populație,
                  aceeași perioadă și aceeași definiție a venitului ca seria INS folosită aici.
                </p>
              </div>
            </div>
            <aside className={aside}>
              <div className={`${card} ${strong}`}>
                <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Ce arată mediana</h3>
                <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
                  Mediana, adică salariul de la mijloc, arată pragul sub care se află jumătate dintre angajați. INS nu
                  publică o mediană salarială lunară în același comunicat cu media.
                </p>
                <p className="mt-auto pt-4 text-xs text-stone-500">Nu publicăm o estimare numerică fără un set de date compatibil, o perioadă clară și o metodologie verificabilă.</p>
              </div>
            </aside>
          </div>

          {/* RÂND 5 — istoric: întâi tabelul (text), apoi graficul */}
          <div className={row}>
            <div className="md:col-span-3">
              <div className={`max-w-prose ${articol}`}>
                <h2>Cum a crescut în timp</h2>
                <p>În șase ani, indicatorul BASS brut a crescut de la 5.429 lei în 2020 la 9.192 lei în 2026. Întâi cifrele, apoi aceeași evoluție pe grafic:</p>
                <div className="my-6 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
                  <table className="w-full text-sm tabular-nums [&_td]:py-2 [&_tbody_th]:py-2 [&_tbody_th]:pr-2 [&_tbody_th]:text-left [&_td:not(:first-child)]:pl-3 [&_th:not(:first-child)]:pl-3 [&_td:not(:first-child)]:text-right [&_th:not(:first-child)]:text-right">
                    <thead>
                      <tr className="border-b border-stone-300 text-xs font-medium uppercase tracking-wide text-stone-500">
                        <th scope="col" className="pb-2 text-left">An</th>
                        <th scope="col" className="pb-2">Brut</th>
                        <th scope="col" className="pb-2">Net</th>
                        <th scope="col" className="hidden pb-2 sm:table-cell">Creștere</th>
                        <th scope="col" className="hidden pb-2 md:table-cell">Stabilit prin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ISTORIC.map((r, i) => (
                        <tr key={r.an} className={i === ISTORIC.length - 1 ? "font-medium text-stone-900" : "border-b border-stone-100"}>
                          <th scope="row" className="font-normal text-stone-600">{r.an}</th>
                          <td className="text-stone-900">{fmt(r.brut)}</td>
                          <td className="text-stone-700">{fmt(r.net)}</td>
                          <td className="hidden text-stone-500 sm:table-cell">{r.crestere}</td>
                          <td className="hidden text-stone-500 md:table-cell">{r.lege}</td>
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
                  <p className="mt-4 text-xs text-stone-500">Brut = valoarea oficială folosită la buget; net = estimat (~58% din brut). Treci cu mouse-ul (sau atinge) un an pentru cifre.</p>
                </figure>
              </div>
            </div>
            <aside className={aside}>
              <div className="flex h-full flex-col gap-6">
                <div className={`${card} ${strong}`}>
                  <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Ce urmează</h3>
                  <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
                    Prognoza CNSP (toamna 2025) estimează salariul mediu brut la <strong>9.786 lei</strong> în 2027 și{" "}
                    <strong>10.381 lei</strong> în 2028. Sunt doar estimări, iar valoarea fiecărui an se fixează prin legea
                    bugetului de asigurări sociale.
                  </p>
                </div>
                <div className={`${card} ${links} ${strong}`}>
                  <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Media față de minim</h3>
                  <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
                    Indicatorul BASS (9.192 lei) e de peste două ori minimul (4.325). Pe net, distanța e mai mică:
                    5.377 față de 2.699, aproape exact dublu, pentru că la minim taxele sunt îndulcite de facilitate și
                    de deducerea personală.
                  </p>
                  <p className="mt-auto pt-4 text-sm">
                    <Link href="/salariu-minim">Salariul minim, în detaliu →</Link>
                  </p>
                </div>
              </div>
            </aside>
          </div>

          {/* RÂND 6 — FAQ, fără întrebările acoperite în corp */}
          <div className={row}>
            <div className="md:col-span-3">
              <h2 className="mb-4 text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">Întrebări frecvente</h2>
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
                <h3 className="mb-3 text-xs font-medium text-stone-500">Surse oficiale</h3>
                <ul className={`flex flex-col gap-2 text-sm leading-normal text-stone-600 ${links}`}>
                  <li><strong className="font-medium text-stone-900">Legea 44/2026</strong>: bugetul asigurărilor sociale 2026</li>
                  <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/276927" target="_blank" rel="noopener">Legea 360/2023</a>: sistemul public de pensii și ajutorul de deces</li>
                  <li><a href={LATEST_INS_EARNINGS.officialUrl} target="_blank" rel="noopener">INS, comunicatul pentru {INS_PERIOD_LABEL}</a>: {INS_BRUT_LABEL} lei brut, {INS_NET_LABEL} lei net, publicat {LATEST_INS_EARNINGS.publicationDateLabel}</li>
                  <li><a href="https://cnp.ro" target="_blank" rel="noopener">CNSP</a>: prognoze 2026–2028</li>
                </ul>
                <h3 className="mb-3 mt-6 text-xs font-medium text-stone-500">Pagini conexe</h3>
                <ul className={`flex flex-col gap-2 text-sm ${links}`}>
                  <li><Link href="/salariu-minim">Salariul minim 2026</Link></li>
                  <li><Link href="/">Calculator salariu net</Link></li>
                  <li><Link href="/zile-libere-2026">Zile libere 2026</Link></li>
                </ul>
                <p className="mt-auto pt-6 text-xs text-stone-500">Ultima actualizare: 25 august 2026.</p>
              </div>
            </aside>
          </div>

          {/* RÂND FINAL — CTA pe stânga */}
          <div className={row}>
            <div className="md:col-span-3">
              <div className={card}>
                <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900">Unde te situezi față de medie?</h2>
                <p className="mt-2 text-base leading-normal tracking-[-0.01em] text-stone-600">
                  Pune-ți salariul în calculator și vezi exact unde ești față de medie, ce reține statul și cât costă firma.
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
          { href: "/salarii", label: "Salarii pe meserii", descriere: "Media pe economie e una; pe meserie, alta. 123 de meserii, cu datele INS." },
          { href: "/salarii/judete", label: "Salarii pe județe", descriere: "Unde se câștigă mai mult: toate cele 42 de județe." },
          { href: "/salarii/clasament", label: "Cele mai bine plătite meserii", descriere: "Clasamentul complet, după câștigul mediu brut." },
          { href: "/salariu-minim", label: "Salariul minim 2026", descriere: "Celălalt pilon: 4.325 lei brut din 1 iulie." },
        ]}
      />
    </>
  );
}
