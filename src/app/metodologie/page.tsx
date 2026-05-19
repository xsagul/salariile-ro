// app/metodologie/page.tsx
// Server Component. Metodologia de calcul — semnal E-E-A-T pentru YMYL.

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Metodologie de calcul salariu net 2026",
  description:
    "Documentația completă a formulelor și surselor folosite de calculatorul salariile.ro pentru anul 2026: CAS, CASS, impozit, deducere personală, CAM, facilitate OUG 89/2025.",
  alternates: { canonical: "https://salariile.ro/metodologie" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Metodologie", item: "https://salariile.ro/metodologie" },
      ],
    },
    {
      "@type": "TechArticle",
      headline: "Metodologie de calcul salariu net 2026",
      description:
        "Formulele complete și sursele legislative folosite de calculatorul salariile.ro: CAS 25%, CASS 10%, impozit 10%, CAM 2,25%, deducere personală art. 77 Cod Fiscal, facilitate OUG 89/2025.",
      url: "https://salariile.ro/metodologie",
      inLanguage: "ro-RO",
      author: {
        "@type": "Person",
        name: "Știuriuc Sorin-Marian",
        jobTitle: "Dezvoltator full-stack",
      },
      publisher: {
        "@type": "Organization",
        name: "Salariile.ro",
        url: "https://salariile.ro",
      },
      dateModified: "2026-04-30",
      proficiencyLevel: "Expert",
      about: [
        { "@type": "Thing", name: "Codul Fiscal Legea 227/2015" },
        { "@type": "Thing", name: "Codul Muncii Legea 53/2003" },
        { "@type": "Thing", name: "HG 146/2026" },
        { "@type": "Thing", name: "OUG 89/2025" },
      ],
      mainEntityOfPage: "https://salariile.ro/metodologie",
    },
  ],
};

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

export default function MetodologiePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Acasă</Link>
            <span>/</span>
            <span>Metodologie</span>
          </nav>
          <h1>Metodologie de calcul</h1>
          <p className="subtitle">
            Documentația completă a formulelor folosite de calculator. Fiecare componentă este însoțită de articolul exact din Codul Fiscal sau actul normativ aplicabil în 2026.
          </p>
          <p className="skeleton-hint">
            ULTIMA REVIZUIRE: 30 APRILIE 2026 · SINCRONIZAT CU DECLARAȚIA 112 ANAF
          </p>
        </div>
      </section>

      <main>
        <section className="article-section">
          <div className="container">
            <h2>Principiul general</h2>
            <p>
              Calculul salariului net pornește de la salariul brut (de încadrare, conform contractului individual de muncă) și aplică, în ordine, contribuțiile obligatorii reținute la sursă:
            </p>
            <ul className="article-list">
              <li><strong>CAS</strong> (Contribuția de Asigurări Sociale, „pensie"): 25% din baza de calcul</li>
              <li><strong>CASS</strong> (Contribuția de Asigurări Sociale de Sănătate): 10% din baza de calcul</li>
              <li><strong>Impozit pe venit</strong>: 10% din baza impozabilă</li>
            </ul>
            <p>
              Pe lângă reținerile angajatului, angajatorul mai plătește:
            </p>
            <ul className="article-list">
              <li><strong>CAM</strong> (Contribuția Asiguratorie pentru Muncă): 2,25% din salariul brut</li>
            </ul>
            <p>
              CAM nu reduce salariul net al angajatului, dar crește costul total suportat de angajator.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>Formula completă brut → net</h2>
            <p>
              Pentru un salariu brut B, deducere personală D (calculată conform regulilor) și o eventuală sumă netaxabilă F (facilitate OUG 89/2025 aplicabilă doar salariului minim):
            </p>
            <div className="table-scroll"><table className="flat-table">
              <thead>
                <tr>
                  <th>Pas</th>
                  <th>Calcul</th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-base">
                  <td>1. Bază pentru CAS și CASS</td>
                  <td>Bază = B − F</td>
                </tr>
                <tr className="row-base">
                  <td>2. CAS (25%)</td>
                  <td>CAS = Bază × 0,25</td>
                </tr>
                <tr className="row-base">
                  <td>3. CASS (10%)</td>
                  <td>CASS = Bază × 0,10</td>
                </tr>
                <tr className="row-base">
                  <td>4. Bază impozabilă</td>
                  <td>Bază_imp = B − F − CAS − CASS − D</td>
                </tr>
                <tr className="row-base">
                  <td>5. Impozit pe venit (10%)</td>
                  <td>Impozit = max(0, Bază_imp × 0,10)</td>
                </tr>
                <tr className="total-net">
                  <td>6. Salariu net</td>
                  <td>Net = B − CAS − CASS − Impozit</td>
                </tr>
                <tr className="spacer-row"><td colSpan={2}></td></tr>
                <tr className="row-base">
                  <td>7. CAM angajator (2,25%)</td>
                  <td>CAM = B × 0,0225</td>
                </tr>
                <tr className="total-cost">
                  <td>8. Cost total angajator</td>
                  <td>Cost = B + CAM</td>
                </tr>
              </tbody>
            </table></div>
            <p className="source-note">
              Suma netaxabilă F este 0 pentru salarii peste nivelul minim. Pentru salariul minim brut în 2026 se aplică OUG 89/2025: 300 lei (ianuarie – iunie), 200 lei (iulie – decembrie).
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>Sursele normative pentru fiecare componentă</h2>
            <div className="table-scroll"><table className="flat-table">
              <thead>
                <tr>
                  <th>Componentă</th>
                  <th>Cotă 2026</th>
                  <th>Bază legală</th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-base">
                  <td>CAS (pensie)</td>
                  <td>25%</td>
                  <td>Codul Fiscal art. 138 lit. a)</td>
                </tr>
                <tr className="row-base">
                  <td>CASS (sănătate)</td>
                  <td>10%</td>
                  <td>Codul Fiscal art. 156</td>
                </tr>
                <tr className="row-base">
                  <td>Impozit pe venit</td>
                  <td>10%</td>
                  <td>Codul Fiscal art. 64 alin. (1)</td>
                </tr>
                <tr className="row-base">
                  <td>Deducere personală</td>
                  <td>variabilă</td>
                  <td>Codul Fiscal art. 77</td>
                </tr>
                <tr className="row-base">
                  <td>CAM (angajator)</td>
                  <td>2,25%</td>
                  <td>Codul Fiscal art. 220^3</td>
                </tr>
                <tr className="row-base">
                  <td>Sumă netaxabilă (salariu minim)</td>
                  <td>300 / 200 lei</td>
                  <td>OUG 89/2025</td>
                </tr>
                <tr className="row-base">
                  <td>Salariu minim brut 2026 — S1</td>
                  <td>4.050 lei</td>
                  <td>HG 1506/2024</td>
                </tr>
                <tr className="row-base">
                  <td>Salariu minim brut 2026 — S2</td>
                  <td>4.325 lei</td>
                  <td>HG 146/2026 (MO 196/13.03.2026)</td>
                </tr>
              </tbody>
            </table></div>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>Deducerea personală — detalii</h2>
            <p>
              Deducerea personală este o sumă scăzută din baza impozabilă, conform Codului Fiscal art. 77. Se aplică numai pentru venituri din salarii la locul unde se află funcția de bază.
            </p>
            <p>
              Pentru 2026, deducerea personală are două componente:
            </p>
            <ul className="article-list">
              <li>
                <strong>Deducerea personală de bază</strong> — depinde de salariul brut lunar, de numărul de persoane aflate în întreținere și de plafonul calculat ca <em>salariul minim brut + 2.000 lei</em>. Pentru 2026: plafon = 6.050 lei (S1) sau 6.325 lei (S2). Peste acest plafon, deducerea de bază este 0.
              </li>
              <li>
                <strong>Deducerea personală suplimentară</strong> — pentru persoane cu vârsta sub 26 ani aflate la primul loc de muncă, sau pentru salariați cu copii minori în întreținere. Se cumulează cu deducerea de bază.
              </li>
            </ul>
            <p>
              Calculatorul aplică deducerea conform tabelelor publicate în anexa la Codul Fiscal, ținând cont de numărul de persoane în întreținere selectate în secțiunea „Calculator avansat".
            </p>
            <p>
              Pentru veniturile peste plafonul de 6.050/6.325 lei, deducerea de bază nu se aplică — toată suma după contribuții se impozitează cu 10%.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>Facilitatea fiscală pentru salariul minim (OUG 89/2025)</h2>
            <p>
              Pentru salariații încadrați la nivelul salariului minim brut, cu funcția de bază și normă întreagă, o sumă fixă este scutită de impozit și contribuții sociale:
            </p>
            <ul className="article-list">
              <li>1 ianuarie – 30 iunie 2026: 300 lei lunar netaxabili</li>
              <li>1 iulie – 31 decembrie 2026: 200 lei lunar netaxabili</li>
            </ul>
            <p>
              Suma netaxabilă se scade din salariul brut <em>înainte</em> de calculul CAS, CASS și impozit. Practic, baza de calcul pentru contribuții devine 3.750 lei (S1) sau 4.125 lei (S2), iar netul efectiv este mai mare decât dacă facilitatea nu ar fi existat.
            </p>
            <p>
              Facilitatea nu se aplică pentru salarii peste nivelul minim brut, nici pentru programe parțiale, nici pentru cumul de funcții (când postul nu este funcția de bază).
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>Tratamentul rotunjirilor</h2>
            <p>
              Calculul intern se face cu precizie de două zecimale (la nivel de bani), pentru a coincide cu valorile transmise în Declarația 112 ANAF. La afișare, sumele sunt rotunjite la cel mai apropiat leu pentru lizibilitate, dar valorile intermediare nu se rotunjesc.
            </p>
            <p>
              Exemple: pentru un brut de 4.050 lei (salariu minim S1), CAS = 937,50 lei, CASS = 375 lei. Suma se păstrează exactă în calcul, iar afișajul final pentru salariul net rotunjește la 2.574 lei.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>Sincronizarea cu Declarația 112 ANAF</h2>
            <p>
              Declarația 112 este declarația lunară pe care orice angajator o transmite la ANAF, conținând impozitele și contribuțiile reținute pentru toți salariații. Calculatorul folosește aceleași formule și aceeași logică de încadrare pe care le aplică ANAF în validarea declarațiilor 112.
            </p>
            <p>
              Pentru un salariu standard (brut fix, fără sporuri speciale, fără concedii, fără tichete personalizate), sumele calculate aici sunt aceleași pe care angajatorul tău le declară lunar la ANAF.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>Limitări declarate</h2>
            <p>
              Calculatorul reproduce formula standard pentru un salariu lunar tipic, dar <strong>nu poate înlocui</strong> un calcul personalizat făcut de un contabil pentru cazuri speciale. În particular, calculatorul:
            </p>
            <ul className="article-list">
              <li><strong>Nu integrează sporuri și beneficii nesalariale</strong> tratate diferențiat (tichete de masă peste plafon, tichete cadou, prime ocazionale, indemnizații de delegare etc.)</li>
              <li><strong>Nu calculează concediile medicale</strong> (alt tratament fiscal, indemnizație din FAAMBP sau de la angajator)</li>
              <li><strong>Nu acoperă cazurile de cumul de funcții</strong> (mai multe contracte simultane, funcție de bază vs locuri suplimentare de muncă)</li>
              <li><strong>Nu aplică scutirile sectoriale</strong> care erau în vigoare înainte de 2025 (IT, construcții, agroalimentar) — eliminate prin OUG 156/2024</li>
              <li><strong>Nu calculează contribuțiile angajatorilor speciali</strong> (entități non-profit, cooperative agricole etc.)</li>
              <li><strong>Nu generează fluturașul oficial de plată</strong> — afișează doar componentele de bază; fluturașul oficial poate conține mai multe rânduri (ore lucrate, ore suplimentare, sporuri, deduceri specifice etc.)</li>
            </ul>
            <p>
              Pentru aceste situații, recomand consultarea unui contabil autorizat sau a unui expert fiscal. Calculatorul este util pentru a obține o estimare rapidă și acurată pentru cazul standard.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>Cum se actualizează calculatorul</h2>
            <p>
              Modificările legislative privind salariile sunt urmărite lunar prin Monitorul Oficial și comunicările Ministerului Finanțelor, ANAF și Ministerului Muncii. La fiecare modificare semnificativă (publicare HG, OUG, lege nouă) actualizez:
            </p>
            <ul className="article-list">
              <li>Formulele calculatorului — dacă se modifică o cotă sau o regulă de aplicare</li>
              <li>Valorile de referință folosite (salariu minim, plafon deducere) — la fiecare actualizare anunțată oficial</li>
              <li>Paginile editoriale aferente (<Link href="/salariu-minim">salariu minim</Link>, <Link href="/salariu-mediu">salariu mediu</Link>) — cu noile cifre și surse</li>
              <li>Această pagină — pentru a reflecta noile articole din Codul Fiscal sau noile acte normative</li>
            </ul>
            <p>
              În antetul fiecărei pagini este afișată data ultimei revizuiri. Dacă observi o discrepanță între ce afișează calculatorul și o sursă oficială pe care o ai, scrie-mi la adresa de pe pagina de <Link href="/contact">contact</Link>.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>Surse oficiale folosite</h2>
            <ul className="article-list">
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/257144" target="_blank" rel="noopener"><strong>Codul Fiscal</strong> — Legea 227/2015</a>, cu modificările ulterioare</li>
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646" target="_blank" rel="noopener"><strong>Codul Muncii</strong> — Legea 53/2003</a>, cu modificările ulterioare</li>
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/308231" target="_blank" rel="noopener"><strong>HG 146/2026</strong></a> — salariu minim de la 1 iulie 2026 (MO nr. 196 din 13 martie 2026)</li>
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/291450" target="_blank" rel="noopener"><strong>HG 1506/2024</strong></a> — salariu minim de la 1 ianuarie 2025 (MO nr. 1185 din 28 noiembrie 2024)</li>
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/305817" target="_blank" rel="noopener"><strong>OUG 89/2025</strong></a> — facilitate fiscală 300/200 lei pentru salariul minim</li>
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/293109" target="_blank" rel="noopener"><strong>OUG 156/2024</strong></a> — eliminarea scutirilor sectoriale IT, construcții, agroalimentar</li>
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/294600" target="_blank" rel="noopener"><strong>HG 35/2025</strong></a> — mecanismul tehnic de stabilire a salariului minim</li>
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/308863" target="_blank" rel="noopener"><strong>Legea 44/2026</strong></a> — bugetul asigurărilor sociale, valoarea salariului mediu</li>
              <li><strong>Ministerul Muncii</strong> — <a href="https://mmuncii.gov.ro" target="_blank" rel="noopener">mmuncii.gov.ro</a></li>
              <li><strong>ANAF</strong> — <a href="https://www.anaf.ro" target="_blank" rel="noopener">anaf.ro</a> (template Declarația 112)</li>
              <li><strong>Monitorul Oficial</strong> — <a href="https://legislatie.just.ro" target="_blank" rel="noopener">legislatie.just.ro</a> (portal căutare generală)</li>
              <li><strong>Institutul Național de Statistică</strong> — <a href="https://insse.ro" target="_blank" rel="noopener">insse.ro</a></li>
            </ul>
            <p className="source-note">Pagină actualizată: 30 aprilie 2026.</p>
          </div>
        </section>
      </main>
    </>
  );
}
