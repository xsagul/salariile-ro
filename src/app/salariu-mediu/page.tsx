// app/salariu-mediu/page.tsx
// Server Component pur — SSR maxim, SEO maxim, zero JS la client.
// Articol uman în limbajul pilonului (stone monocrom, fără accent, tracking Inter).
// Construit pe aceeași regulă ca /salariu-minim: hero 3+2, rânduri pereche cu
// linie de separare, carduri h-full, grafic SVG cu tooltip, FAQ nativ.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

// ─── Metadata SEO ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Salariul mediu pe economie 2026: brut, net, mediană",
  description:
    "Salariul mediu brut pe economie 2026 este 9.192 lei (~5.377 lei net), conform Legii 44/2026. Dar mediana e mult mai jos: vezi cât câștigă de fapt un angajat tipic și la ce se folosește.",
  alternates: { canonical: "https://salariile.ro/salariu-mediu" },
  openGraph: ogPage({
    title: "Salariul mediu pe economie 2026: brut, net, mediană",
    description:
      "Salariul mediu brut 2026 este 9.192 lei (~5.377 net), Legea 44/2026. Media e trasă în sus de salariile mari, vezi cât câștigă un angajat tipic.",
    path: "/salariu-mediu",
  }),
  twitter: twPage({
    title: "Salariul mediu pe economie 2026: brut, net, mediană",
    description:
      "Salariul mediu brut 2026 este 9.192 lei (~5.377 net), Legea 44/2026. Media e trasă în sus de salariile mari, vezi cât câștigă un angajat tipic.",
  }),
};

// ─── Date factuale 2026 (verificate prin acte normative) ─────────────────────

const ISTORIC = [
  { an: "2020", brut: 5429, net: 3176, lege: "Legea 6/2020", crestere: "–" },
  { an: "2021", brut: 5380, net: 3147, lege: "Legea 16/2021", crestere: "−0,9%" },
  { an: "2022", brut: 6095, net: 3566, lege: "Legea 318/2021", crestere: "+13,3%" },
  { an: "2023", brut: 6789, net: 3972, lege: "Legea 369/2022", crestere: "+11,4%" },
  { an: "2024", brut: 7567, net: 4427, lege: "Legea 422/2023", crestere: "+11,5%" },
  { an: "2025", brut: 8620, net: 5043, lege: "Legea 313/2024", crestere: "+13,9%" },
  { an: "2026", brut: 9192, net: 5377, lege: "Legea 44/2026", crestere: "+6,6%", recent: true },
];

const FAQ = [
  {
    q: "Cât este salariul mediu pe economie în 2026 (net și brut)?",
    a: "În 2026 circulă două cifre. Cea reală, măsurată lunar de INS: netul mediu e ~5.518 lei în ianuarie și ~5.938 lei în martie, la ~9.900 lei brut, în creștere. Cea oficială, fixată prin Legea 44/2026: 9.192 lei brut (din ea rezultă ~5.377 lei net prin calcul standard), folosită la pensii și ajutoare.",
  },
  {
    q: "De ce câștig mai puțin decât salariul mediu?",
    a: "Pentru că „media\" e trasă în sus de salariile foarte mari din IT, finanțe și management. Indicatorul corect pentru „un angajat obișnuit\" e mediana, salariul de la mijloc, sub care se află jumătate dintre angajați. În România mediana e în jur de 6.000 lei brut, mult sub media de 9.192 lei. Deci dacă tu câștigi sub medie, ești de fapt în rândul majorității.",
  },
  {
    q: "Cât rămâne net din 9.192 lei brut?",
    a: "După reținerea CAS (25%), CASS (10%) și a impozitului pe venit (10%), netul este aproximativ 5.377 lei. La acest nivel de salariu nu se aplică deducerea personală (se acordă doar sub 6.325 lei brut), așa că toată suma rămasă după contribuții se impozitează.",
  },
  {
    q: "Care este diferența dintre salariul mediu și cel minim?",
    a: "Salariul minim (4.325 lei brut din iulie 2026) este pragul legal sub care niciun angajator nu poate plăti. Salariul mediu (9.192 lei) e doar o medie statistică, nu obligă pe nimeni să plătească atât. În schimb, valoarea medie dictează plafoane pentru ajutoare și prestații sociale.",
  },
  {
    q: "Cine stabilește valoarea oficială a salariului mediu?",
    a: "Valoarea folosită la pensii, ajutoare și plafoane se fixează anual prin Legea bugetului asigurărilor sociale de stat, pe baza prognozelor Comisiei Naționale de Strategie și Prognoză (CNSP) și a datelor INS. Pentru 2026, Legea 44/2026 a fixat-o la 9.192 lei.",
  },
  {
    q: "Ce salariu mediu se folosește la calculul pensiei?",
    a: "Se folosește câștigul salarial mediu brut utilizat la fundamentarea bugetului de asigurări sociale, adică pentru 2026, 9.192 lei (Legea 44/2026). Punctajul de pensie se raportează la această valoare (cât ai câștigat față de media anului), nu la cifra reală INS care variază lunar.",
  },
  {
    q: "Cât este ajutorul de deces în 2026?",
    a: "Din 30 martie 2026, ajutorul de deces este 9.192 lei pentru un asigurat sau pensionar și 4.596 lei pentru un membru de familie, corelat direct cu salariul mediu brut. Până atunci (1 ianuarie – 29 martie 2026) valorile erau 8.620, respectiv 4.310 lei.",
  },
  {
    q: "Ce se estimează pentru anii următori?",
    a: "Conform prognozei CNSP (toamna 2025), salariul mediu brut ar ajunge la 9.786 lei în 2027 și 10.381 lei în 2028. Sunt estimări, iar valoarea oficială a fiecărui an se fixează prin legea bugetului de asigurări sociale.",
  },
];

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

// Grafic SVG (server-side, zero JS): o linie — evoluția salariului mediu brut.
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
        an: r.an, brut: r.brut, net: r.net, lege: r.lege,
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
      headline: "Salariul mediu pe economie 2026: 9.192 lei brut, 5.377 net",
      description:
        "Salariul mediu brut pe economie în 2026 (Legea 44/2026): 9.192 lei brut, ~5.377 lei net. Mediana, calcul net pas cu pas, la ce se folosește, ajutor de deces, evoluție și prognoze.",
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile.ro",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      },
      image: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      mainEntityOfPage: "https://salariile.ro/salariu-mediu",
      datePublished: "2026-03-30",
      dateModified: "2026-06-08",
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

// ─── Stiluri (limbajul pilonului: stone, fără accent, tracking Inter) ─────────

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

          {/* HERO — 3+2: text stânga, imagine dreapta */}
          <div className={`${row} md:items-center`}>
            <div className="md:col-span-3">
              <h1 className="text-3xl font-bold tracking-[-0.02em] text-stone-900 sm:text-4xl">Salariul mediu pe economie în 2026</h1>
              <p className="mt-4 text-xs text-stone-600 [&_a]:font-medium [&_a]:text-stone-700 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-900">
                Scris de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Actualizat 8 iunie 2026
              </p>
              <p className={`mt-5 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600 ${strong}`}>
                În 2026, salariul mediu net pe economie e în jur de <strong>5.900 lei</strong> (~9.900 brut), după datele
                INS, și crește lunar. Dar e o medie: <strong>jumătate</strong> dintre angajați câștigă sub ~<strong>6.000
                lei brut</strong> (~3.500 net). Pentru pensii și ajutoare, statul folosește o valoare oficială fixă, mai
                mică: 9.192 lei brut.
              </p>
            </div>
            <div className={aside}>
              <Image
                src="/hero-salariu-mediu.png"
                alt="Ilustrație: oameni de înălțimi diferite, ca un grafic, cu o linie a mediei, majoritatea sub linie, câțiva mari o trag în sus"
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

            {/* RÂND 1 — Cât e și ce înseamnă · card „Cifre 2026" */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2>Cât e salariul mediu și ce înseamnă</h2>
                  <p>
                    Sunt, de fapt, două cifre. <strong>Cea reală</strong>, măsurată lunar de INS: în 2026 salariul mediu net e
                    în jur de <strong>5.900 lei</strong> (~9.900 brut) și crește. <strong>Cea oficială</strong>, fixată prin
                    <strong> Legea 44/2026</strong> la 9.192 lei brut, e mai mică și nu se schimbă în cursul anului, iar pe ea o
                    folosește statul la pensii și ajutoare (până la 30 martie 2026 a fost 8.620 lei).
                  </p>
                  <p>
                    Atenție, nu e ca salariul minim. <strong>Minimul</strong> e un prag legal: nimeni nu poate plăti sub el.
                    <strong> Media</strong> e doar o statistică: nu obligă niciun angajator să plătească atât. E mai degrabă un
                    reper, un <em className="not-italic font-medium text-stone-900">indicator</em> de care statul leagă alte
                    sume (ajutoare, plafoane), nu un salariu pe care-l ia cineva anume.
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
                        <td className="text-right font-bold text-stone-900">~{fmt(5900)}</td>
                      </tr>
                      <tr className="border-b border-stone-100">
                        <td className="text-left text-stone-600">Brut (real, INS)</td>
                        <td className="text-right font-medium text-stone-900">~{fmt(9900)}</td>
                      </tr>
                      <tr>
                        <td className="text-left text-stone-600">Brut oficial (la pensii)</td>
                        <td className="text-right text-stone-700">{fmt(9192)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-auto pt-4 text-xs text-stone-500">Real = ce măsoară INS lunar, în creștere (5.518 net în ian., 5.938 în martie). Oficial = valoare fixă (Legea 44/2026), folosită la pensii și ajutoare.</p>
                </div>
              </aside>
            </div>

            {/* RÂND 2 — Mediană (aha-ul onest) · card „Minim vs mediu" */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2>Media nu e cât câștigi tu</h2>
                  <p>
                    Aici e capcana cuvântului „mediu". Media se calculează adunând toate salariile și împărțind la numărul de
                    angajați, așa că <strong>salariile foarte mari din IT, finanțe și management o trag în sus</strong>.
                    Rezultatul: cei mai mulți oameni câștigă sub această medie.
                  </p>
                  <p>
                    Indicatorul corect pentru „un angajat obișnuit" e <strong>mediana</strong>, salariul de la mijloc, sub
                    care se află exact jumătate dintre angajați (vezi cifra alături). Pe scurt: dacă tu câștigi sub medie, nu
                    ești o excepție, ci ești în rândul majorității.
                  </p>
                </div>
              </div>
              <aside className={aside}>
                <div className={`${card} ${strong}`}>
                  <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Cât câștigă, de fapt, majoritatea</h3>
                  <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
                    Mediana, adică salariul de la mijloc, e cifra realistă. Jumătate dintre angajați câștigă <strong>sub</strong>{" "}
                    aceste valori:
                  </p>
                  <table className="mt-3 w-full text-sm tabular-nums">
                    <tbody className="[&_td]:py-2">
                      <tr className="border-b border-stone-100">
                        <td className="text-left text-stone-600">Median brut</td>
                        <td className="text-right font-medium text-stone-900">~6.000</td>
                      </tr>
                      <tr>
                        <td className="text-left text-stone-600">Median net</td>
                        <td className="text-right font-bold text-stone-900">~3.500</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-auto pt-4 text-xs text-stone-500">Media (9.192 brut) e cu ~50% peste mediană, fiindcă o trag în sus salariile foarte mari.</p>
                </div>
              </aside>
            </div>

            {/* RÂND 3 — Calculul net pas cu pas · card „Cât păstrezi din brut" */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2 id="net" className="scroll-mt-24">Cât rămâne net, pas cu pas</h2>
                  <p>
                    Iată cum se calculează netul din brut, pe valoarea oficială de 9.192 lei. (Media reală INS iese ceva mai
                    mare (netul e ~60% din brut), fiindcă include deduceri pentru copii și alte situații.) La acest nivel{" "}
                    <strong>nu se aplică deducerea personală</strong> (ea se dă doar sub 6.325 lei brut), așa că toate
                    contribuțiile se calculează la brutul întreg.
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
                    La salariul mediu, din fiecare 100 de lei bruți ajung la tine ~<strong>58</strong> (5.377 din 9.192),
                    restul, la stat. E mai puțin decât la salariul minim (~62%), pentru că aici dispar facilitatea netaxabilă
                    și deducerea personală.
                  </p>
                </div>
              </aside>
            </div>

            {/* RÂND 4 — La ce se folosește · card „Ajutor de deces" */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2>La ce se folosește de fapt</h2>
                  <p>
                    Fiindcă e un indicator, nu un salariu, valoarea oficială (9.192 lei brut) e folosită ca reper în sistemul
                    public, de aici și căutările „salariu mediu brut pentru calcul pensie":
                  </p>
                  <ul>
                    <li><strong>Calculul pensiei</strong>: punctajul se raportează la salariul mediu brut al anului (cât ai câștigat față de medie).</li>
                    <li><strong>Plafoane</strong> pentru prestații și indemnizații sociale.</li>
                    <li><strong>Ajutorul de deces</strong> din sistemul public de pensii.</li>
                    <li><strong>Fundamentarea bugetului</strong> de pensii, șomaj și accidente de muncă.</li>
                  </ul>
                  <p>
                    Pentru toate astea contează valoarea oficială (9.192 lei), nu cifra reală INS care se schimbă lună de lună.
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

            {/* RÂND 5 — Evoluție (grafic) · card „Prognoze CNSP" */}
            <div className={row}>
              <div className="md:col-span-3">
                <div className={`max-w-prose ${articol}`}>
                  <h2>Cum a crescut în timp</h2>
                  <p>În șase ani, salariul mediu brut s-a apropiat de dublu, de la 5.429 lei în 2020 la 9.192 în 2026:</p>
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
                    <p className="mt-4 text-xs text-stone-500">Brut = valoarea oficială folosită la buget; net = estimat (~58% din brut). Scăderea din 2021 vine din ajustări de pandemie. Treci cu mouse-ul (sau atinge) un an pentru cifre.</p>
                  </figure>
                </div>
              </div>
              <aside className={aside}>
                <div className={`${card} ${strong}`}>
                  <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Ce urmează</h3>
                  <p className="mt-2 text-sm leading-normal tracking-[-0.01em] text-stone-600">
                    Prognoza CNSP (toamna 2025) estimează salariul mediu brut la <strong>9.786 lei</strong> în 2027 și{" "}
                    <strong>10.381 lei</strong> în 2028. Sunt doar estimări, iar valoarea fiecărui an se fixează prin legea
                    bugetului de asigurări sociale.
                  </p>
                </div>
              </aside>
            </div>

            {/* RÂND 6 — FAQ · card „Surse + pagini conexe" */}
            <div className={row}>
              <div className="md:col-span-3">
                <h2 className="mb-4 text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">Întrebări frecvente</h2>
                <div className="flex flex-col">
                  {FAQ.map((item, i) => (
                    <details key={i} name="faq-mediu" className="group border-b border-stone-200 py-4">
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
                <div className={card}>
                  <h3 className="mb-3 text-xs font-medium text-stone-500">Surse oficiale</h3>
                  <ul className={`flex flex-col gap-2 text-sm leading-normal text-stone-600 ${links}`}>
                    <li><strong className="font-medium text-stone-900">Legea 44/2026</strong>: bugetul asigurărilor sociale 2026</li>
                    <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/182597" target="_blank" rel="noopener">Legea 263/2010</a>: pensii publice (ajutor de deces)</li>
                    <li><a href="https://insse.ro" target="_blank" rel="noopener">INS</a>: câștigul salarial mediu lunar</li>
                    <li><a href="https://cnp.ro" target="_blank" rel="noopener">CNSP</a>: prognoze 2026–2028</li>
                  </ul>
                  <h3 className="mb-3 mt-6 text-xs font-medium text-stone-500">Pagini conexe</h3>
                  <ul className={`flex flex-col gap-2 text-sm ${links}`}>
                    <li><Link href="/salariu-minim">Salariul minim 2026</Link></li>
                    <li><Link href="/">Calculator salariu net</Link></li>
                    <li><Link href="/zile-libere-2026">Zile libere și lucrătoare 2026</Link></li>
                  </ul>
                  <p className="mt-auto pt-6 text-xs text-stone-500">Ultima actualizare: 8 iunie 2026.</p>
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
    </>
  );
}
