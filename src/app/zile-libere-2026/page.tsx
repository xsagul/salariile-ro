// app/zile-libere-2026/page.tsx
// Server Component pur — SSR maxim, SEO maxim, zero JS la client.
// Pagină dedicată cluster-ului "calendar zile libere / sărbători legale 2026".

import type { Metadata } from "next";
import Link from "next/link";

// ─── Metadata SEO ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Zile libere 2026: calendar sărbători legale și zile lucrătoare",
  description:
    "Calendar complet 2026: 17 sărbători legale (Codul Muncii art. 139), zile lucrătoare per lună (total 249), ore lucrătoare, punți recomandate. Date oficiale.",
  keywords: [
    "zile libere 2026",
    "sărbători legale 2026",
    "calendar zile libere 2026",
    "zile lucrătoare 2026",
    "ore lucrătoare 2026",
    "punți 2026",
    "calendar lucrător 2026",
    "Codul Muncii art. 139",
  ],
  alternates: { canonical: "https://salariile.ro/zile-libere-2026" },
  openGraph: {
    title: "Zile libere 2026: calendar sărbători legale și zile lucrătoare",
    description:
      "Calendar oficial cu 17 sărbători legale 2026, zile lucrătoare per lună, ore lucrătoare totale (1.992 ore) și punți recomandate.",
    url: "https://salariile.ro/zile-libere-2026",
  },
};

// ─── Date factuale 2026 ──────────────────────────────────────────────────────

const SARBATORI = [
  { data: "1 ianuarie",    zi: "joi",       nume: "Anul Nou",                                weekend: false },
  { data: "2 ianuarie",    zi: "vineri",    nume: "A doua zi de Anul Nou",                   weekend: false },
  { data: "6 ianuarie",    zi: "marți",     nume: "Bobotează",                               weekend: false },
  { data: "7 ianuarie",    zi: "miercuri",  nume: "Sfântul Ioan Botezătorul",                weekend: false },
  { data: "24 ianuarie",   zi: "sâmbătă",   nume: "Ziua Unirii Principatelor Române",        weekend: true },
  { data: "17 aprilie",    zi: "vineri",    nume: "Vinerea Mare (Vinerea Patimilor)",        weekend: false },
  { data: "19 aprilie",    zi: "duminică",  nume: "Paștele (ortodox)",                       weekend: true },
  { data: "20 aprilie",    zi: "luni",      nume: "A doua zi de Paște",                      weekend: false },
  { data: "1 mai",         zi: "vineri",    nume: "Ziua Muncii",                             weekend: false },
  { data: "1 iunie",       zi: "luni",      nume: "Ziua Copilului",                          weekend: false },
  { data: "7 iunie",       zi: "duminică",  nume: "Rusalii",                                 weekend: true },
  { data: "8 iunie",       zi: "luni",      nume: "A doua zi de Rusalii",                    weekend: false },
  { data: "15 august",     zi: "sâmbătă",   nume: "Adormirea Maicii Domnului (Sfânta Maria)", weekend: true },
  { data: "30 noiembrie",  zi: "luni",      nume: "Sfântul Apostol Andrei",                  weekend: false },
  { data: "1 decembrie",   zi: "marți",     nume: "Ziua Națională a României",               weekend: false },
  { data: "25 decembrie",  zi: "vineri",    nume: "Crăciunul",                               weekend: false },
  { data: "26 decembrie",  zi: "sâmbătă",   nume: "A doua zi de Crăciun",                    weekend: true },
];

const LUNI = [
  { luna: "Ianuarie",    zile: 31, lucrătoare: 18, ore: 144, sarbatori: "1, 2, 6, 7 (24 sâmbătă)" },
  { luna: "Februarie",   zile: 28, lucrătoare: 20, ore: 160, sarbatori: "—" },
  { luna: "Martie",      zile: 31, lucrătoare: 22, ore: 176, sarbatori: "—" },
  { luna: "Aprilie",     zile: 30, lucrătoare: 20, ore: 160, sarbatori: "17, 20 (19 duminică)" },
  { luna: "Mai",         zile: 31, lucrătoare: 20, ore: 160, sarbatori: "1" },
  { luna: "Iunie",       zile: 30, lucrătoare: 20, ore: 160, sarbatori: "1, 8 (7 duminică)" },
  { luna: "Iulie",       zile: 31, lucrătoare: 23, ore: 184, sarbatori: "—" },
  { luna: "August",      zile: 31, lucrătoare: 21, ore: 168, sarbatori: "15 sâmbătă" },
  { luna: "Septembrie",  zile: 30, lucrătoare: 22, ore: 176, sarbatori: "—" },
  { luna: "Octombrie",   zile: 31, lucrătoare: 22, ore: 176, sarbatori: "—" },
  { luna: "Noiembrie",   zile: 30, lucrătoare: 20, ore: 160, sarbatori: "30" },
  { luna: "Decembrie",   zile: 31, lucrătoare: 21, ore: 168, sarbatori: "1, 25 (26 sâmbătă)" },
];

const TOTAL_ZILE_LUCRATOARE = LUNI.reduce((s, l) => s + l.lucrătoare, 0); // 249
const TOTAL_ORE_LUCRATOARE = LUNI.reduce((s, l) => s + l.ore, 0); // 1992

const PUNTI = [
  {
    perioada: "1–4 ianuarie",
    detalii: "Anul Nou (joi 1 ian) + A doua zi (vineri 2 ian) + weekend = 4 zile libere natural, fără punte.",
  },
  {
    perioada: "5–7 ianuarie (punte propusă)",
    detalii: "Cere luni 5 ianuarie liber → combinat cu Bobotează (marți 6) și Sf. Ioan (miercuri 7) = 5 zile libere consecutive (sâmbătă 3 → miercuri 7).",
  },
  {
    perioada: "17–20 aprilie",
    detalii: "Vinerea Mare (vineri 17) + weekend Paște + A doua zi Paște (luni 20) = 4 zile libere consecutive, fără punte.",
  },
  {
    perioada: "1–3 mai",
    detalii: "Ziua Muncii (vineri 1 mai) + weekend = 3 zile libere consecutive.",
  },
  {
    perioada: "30 mai – 1 iunie",
    detalii: "Weekend + Ziua Copilului (luni 1 iunie) = 3 zile libere consecutive.",
  },
  {
    perioada: "6–8 iunie",
    detalii: "Weekend Rusalii + A doua zi Rusalii (luni 8) = 3 zile libere consecutive.",
  },
  {
    perioada: "28 noiembrie – 1 decembrie",
    detalii: "Weekend + Sf. Andrei (luni 30 nov) + Ziua Națională (marți 1 dec) = 4 zile libere consecutive.",
  },
  {
    perioada: "25–27 decembrie",
    detalii: "Crăciunul (vineri 25) + A doua zi Crăciun (sâmbătă 26) + duminică = 3 zile libere consecutive. Atenție: Ajunul (24 dec) nu e zi liberă legală.",
  },
];

const FAQ = [
  {
    q: "Câte zile libere oficiale sunt în 2026 în România?",
    a: "În 2026 sunt 17 sărbători legale conform Codului Muncii art. 139. Dintre acestea, 5 cad în weekend (24 ianuarie sâmbătă, 19 aprilie duminică, 7 iunie duminică, 15 august sâmbătă, 26 decembrie sâmbătă), iar restul de 12 sunt zile lucrătoare scoase din calendar.",
  },
  {
    q: "Câte zile lucrătoare are anul 2026?",
    a: "Totalul zilelor lucrătoare în 2026 este de 249, echivalent cu 1.992 ore (la 8 ore/zi). Distribuția lunară variază: iulie are cele mai multe (23 zile), ianuarie are cele mai puține (18 zile, din cauza Anului Nou și a celor 4 zile libere de la Anul Nou și Bobotează/Sf. Ioan).",
  },
  {
    q: "Ce este Codul Muncii art. 139?",
    a: "Articolul 139 din Legea 53/2003 (Codul Muncii) stabilește lista oficială a zilelor de sărbătoare legală în care nu se lucrează. Pentru salariații care lucrează în zilele de sărbătoare (telecomunicații, sănătate, energie, comerț etc.), angajatorul trebuie să acorde fie repaus compensator în următoarele 30 de zile, fie spor la salariu de minimum 100%.",
  },
  {
    q: "Cad sărbătorile legale în weekend se recuperează ziua liberă?",
    a: "Codul Muncii NU prevede automat recuperarea sărbătorilor care cad în weekend. În 2026, 5 sărbători cad în weekend și pierd valoarea de „zi liberă suplimentară”. Unele guverne aprobă prin Hotărâri de Guvern punți individuale, dar acestea trebuie verificate anual în Monitorul Oficial.",
  },
  {
    q: "Cum se plătește lucrul în zilele de sărbătoare?",
    a: "Conform art. 142 din Codul Muncii, lucrul în zilele de sărbătoare legală se compensează cu zile libere în următoarele 30 de zile. Dacă din motive justificate nu se acordă zilele libere, angajații beneficiază de un spor de minimum 100% din salariul de bază pentru orele prestate.",
  },
  {
    q: "Există zile libere suplimentare pentru salariații de alte religii?",
    a: "Da. Codul Muncii art. 139 alin. (3) permite acordarea de zile libere salariaților din alte culte religioase (catolici, protestanți, musulmani, evrei, etc.) pentru sărbătorile lor proprii, în condițiile stabilite prin contractul individual de muncă sau contractul colectiv aplicabil.",
  },
  {
    q: "Salariul pe oră se calculează la 8 ore/zi sau pe baza orelor lucrătoare lunare?",
    a: "Tariful orar standard se calculează ca salariu brut împărțit la 168 ore/lună (media anuală: 1.992 ore / 12 luni = 166 ore). În contractele care folosesc program standard, se acceptă și 170 ore/lună. Pentru salariul minim 2026 (4.050 lei brut), tariful orar mediu este aproximativ 24,5 lei/oră.",
  },
];

// ─── JSON-LD ─────────────────────────────────────────────────────────────────

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Zile libere 2026", item: "https://salariile.ro/zile-libere-2026" },
      ],
    },
    {
      "@type": "Article",
      headline: "Zile libere 2026 în România: calendar complet sărbători legale",
      description:
        "Calendar oficial cu 17 sărbători legale 2026 (Codul Muncii art. 139), distribuția lunară a zilelor lucrătoare (total 249), ore lucrătoare (1.992) și punți recomandate pentru weekend-uri prelungite.",
      author: { "@type": "Organization", name: "Salariile.ro", url: "https://salariile.ro" },
      publisher: {
        "@type": "Organization",
        name: "Salariile.ro",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      },
      image: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      mainEntityOfPage: "https://salariile.ro/zile-libere-2026",
      datePublished: "2026-05-19",
      dateModified: "2026-05-19",
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

// ─── Pagina ──────────────────────────────────────────────────────────────────

export default function ZileLibere2026Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Acasă</Link>
            <span>/</span>
            <span>Zile libere 2026</span>
          </nav>
          <h1>Zile libere 2026 în România</h1>
          <p className="subtitle">
            Calendar complet cu <strong>17 sărbători legale</strong> conform Codului Muncii art. 139, distribuția lunară a celor <strong>249 zile lucrătoare</strong> și a celor <strong>1.992 ore lucrătoare</strong>, plus punți recomandate pentru weekend-uri prelungite.
          </p>
          <p className="skeleton-hint">
            ULTIMA ACTUALIZARE: 19 MAI 2026 · SURSA: CODUL MUNCII ART. 139 (LEGEA 53/2003)
          </p>
        </div>
      </section>

      <main>
        {/* CALENDAR */}
        <section className="article-section">
          <div className="container">
            <h2>Calendarul sărbătorilor legale 2026</h2>
            <p>
              Lista celor 17 sărbători legale recunoscute oficial în România pentru anul 2026, conform <a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646" target="_blank" rel="noopener">Codului Muncii art. 139</a>. Cele marcate cu sâmbătă/duminică cad în weekend și nu generează zi liberă suplimentară.
            </p>
            <div className="table-scroll">
              <table className="flat-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Ziua săptămânii</th>
                    <th>Sărbătoare</th>
                  </tr>
                </thead>
                <tbody>
                  {SARBATORI.map((s) => (
                    <tr key={s.data} className={s.weekend ? "row-base" : "row-bright"}>
                      <td><strong>{s.data}</strong></td>
                      <td>{s.zi}</td>
                      <td>{s.nume}{s.weekend && " (weekend)"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="source-note">
              Sărbători care cad în weekend în 2026: 24 ianuarie (sâmbătă), 19 aprilie (duminică), 7 iunie (duminică), 15 august (sâmbătă), 26 decembrie (sâmbătă). Rămân 12 zile lucrătoare libere efective din cele 17 sărbători calendaristice.
            </p>
          </div>
        </section>

        {/* ZILE LUCRATOARE PER LUNA */}
        <section className="article-section">
          <div className="container">
            <h2>Zile și ore lucrătoare per lună 2026</h2>
            <p>
              Distribuția zilelor lucrătoare pe lună, calculată după norma standard de 5 zile/săptămână (luni–vineri) cu scăderea sărbătorilor legale care nu cad în weekend.
            </p>
            <div className="table-scroll">
              <table className="flat-table">
                <thead>
                  <tr>
                    <th>Lună</th>
                    <th>Zile total</th>
                    <th>Zile lucrătoare</th>
                    <th>Ore lucrătoare (8h/zi)</th>
                    <th>Sărbători legale în lună</th>
                  </tr>
                </thead>
                <tbody>
                  {LUNI.map((l) => (
                    <tr key={l.luna} className="row-base">
                      <td><strong>{l.luna}</strong></td>
                      <td>{l.zile}</td>
                      <td>{l.lucrătoare}</td>
                      <td>{l.ore}</td>
                      <td>{l.sarbatori}</td>
                    </tr>
                  ))}
                  <tr className="total-net">
                    <td><strong>TOTAL 2026</strong></td>
                    <td>365</td>
                    <td>{TOTAL_ZILE_LUCRATOARE}</td>
                    <td>{TOTAL_ORE_LUCRATOARE}</td>
                    <td>17 (12 în zile lucrătoare)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="source-note">
              Pentru calculul tarifului orar standard, multe contracte folosesc media anuală: 1.992 ore / 12 luni = <strong>166 ore/lună</strong>. Salariul minim 2026 (4.050 lei brut) revine la aproximativ <strong>24,4 lei/oră brut</strong>.
            </p>
          </div>
        </section>

        {/* PUNTI */}
        <section className="article-section">
          <div className="container">
            <h2>Punți și weekend-uri prelungite 2026</h2>
            <p>
              Combinații de sărbători + weekend care permit pauze mai lungi. Unele necesită „punți” (cerere de zi liberă plătită din concediul anual), altele sunt naturale.
            </p>
            <ul className="article-list">
              {PUNTI.map((p) => (
                <li key={p.perioada}>
                  <strong>{p.perioada}</strong> — {p.detalii}
                </li>
              ))}
            </ul>
            <p className="source-note">
              Cele mai favorabile perioade în 2026: <strong>17–20 aprilie</strong> (Paște, 4 zile libere natural), <strong>28 noiembrie – 1 decembrie</strong> (4 zile libere natural cu Sf. Andrei + Ziua Națională), și <strong>1–4 ianuarie</strong> (4 zile libere natural cu Anul Nou).
            </p>
          </div>
        </section>

        {/* CADRU LEGAL */}
        <section className="article-section">
          <div className="container">
            <h2>Cadrul legal — Codul Muncii art. 139</h2>
            <p>
              Articolul 139 din <a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646" target="_blank" rel="noopener">Legea 53/2003 (Codul Muncii)</a> reglementează zilele de sărbătoare legală în care nu se lucrează în România. Prevederile principale:
            </p>
            <ul className="article-list">
              <li>
                <strong>Alin. (1)</strong>: Lista celor 17 sărbători legale (vezi tabelul de mai sus). Salariații nu sunt obligați să se prezinte la muncă.
              </li>
              <li>
                <strong>Alin. (2)</strong>: Pentru salariații angajați în sectoare unde activitatea nu poate fi întreruptă (sănătate, telecomunicații, energie, transport, comerț, alimentație publică), se aplică art. 142 — recuperare cu zile libere sau spor de minimum 100%.
              </li>
              <li>
                <strong>Alin. (3)</strong>: Salariații aparținând cultelor religioase oficiale legale, alte decât cele creștine, beneficiază de zile libere pentru sărbătorile religioase proprii, declarate astfel de aceste culte (max. 2 zile/an).
              </li>
            </ul>
            <p>
              Pentru lucrul în zilele de sărbătoare, art. 142 Codul Muncii stabilește că angajatorul trebuie să acorde:
            </p>
            <ul className="article-list">
              <li><strong>Variant 1</strong>: zile libere plătite în următoarele 30 zile calendaristice; sau</li>
              <li><strong>Variant 2</strong>: spor la salariul de bază de cel puțin 100% din salariul corespunzător programului normal de lucru (doar dacă varianta 1 nu poate fi acordată).</li>
            </ul>
          </div>
        </section>

        {/* IMPLICATII SALARIALE */}
        <section className="article-section">
          <div className="container">
            <h2>Implicații salariale — cum afectează plata</h2>
            <p>
              Numărul zilelor lucrătoare din lună <strong>nu modifică salariul brut</strong> contractual. Salariul lunar negociat se plătește integral indiferent dacă luna are 18 sau 23 zile lucrătoare (cu condiția prezenței la program normal de muncă).
            </p>
            <p>
              <strong>Tariful orar</strong> rezultă din împărțirea salariului brut la numărul de ore lucrătoare din lună. Pentru contractele part-time sau de prestare temporală (lucru la oră), tariful orar e variabil de la lună la lună.
            </p>
            <p>
              Pentru salariul minim 2026 (<Link href="/salariu-minim">vezi analiza completă</Link>), tariful orar legal mediu este:
            </p>
            <ul className="article-list">
              <li><strong>Salariu minim S1</strong> (4.050 lei brut, ian–iun 2026): 4.050 / 165,334 ore = <strong>24,496 lei/oră brut</strong></li>
              <li><strong>Salariu minim S2</strong> (4.325 lei brut, iul–dec 2026): 4.325 / 166,667 ore = <strong>25,949 lei/oră brut</strong></li>
            </ul>
            <p>
              Pentru a calcula tariful orar al salariului tău, folosește <Link href="/">calculatorul principal</Link> și împărte salariul brut la numărul de ore din luna respectivă (vezi tabelul de sus).
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="info-section">
          <div className="container">
            <h2 className="mb-2">Întrebări frecvente</h2>
            <div className="faq-list">
              {FAQ.map((item, i) => (
                <details key={i} className="faq-item">
                  <summary>{item.q}</summary>
                  <p className="faq-answer">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* SURSE */}
        <section className="article-section">
          <div className="container">
            <h2>Surse oficiale</h2>
            <ul className="article-list">
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646" target="_blank" rel="noopener"><strong>Legea 53/2003 — Codul Muncii</strong></a>, art. 139 (sărbători legale) și art. 142 (compensarea lucrului în zilele de sărbătoare)</li>
              <li><strong>Calendar ortodox 2026</strong> — pentru date exacte ale Vinerii Mari, Paștelui și Rusaliilor (calcul fix conform tradiției ortodoxe)</li>
              <li><strong>Hotărâri de Guvern</strong> care pot adăuga zile libere punctuale (apar anual în Monitorul Oficial — neacoperite aici)</li>
              <li><a href="https://mmuncii.gov.ro" target="_blank" rel="noopener">Ministerul Muncii și Solidarității Sociale</a> — referință pentru clarificări de aplicare</li>
            </ul>
            <p className="source-note">Pagină actualizată: 19 mai 2026. Datele de Paște și Rusalii sunt fixate conform calendarului ortodox.</p>
          </div>
        </section>

        {/* CTA */}
        <div className="cta-card">
          <h2>Calculează salariul net pentru 2026</h2>
          <p>Folosește calculatorul nostru pentru a vedea exact câți bani primești în mână, cu toate contribuțiile și deducerea personală aplicate.</p>
          <Link href="/" className="btn-cta">Mergi la calculator →</Link>
        </div>
      </main>
    </>
  );
}
