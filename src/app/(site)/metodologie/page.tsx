// app/metodologie/page.tsx
// Server Component. Metodologia de calcul — semnal E-E-A-T pentru YMYL.

import type { Metadata } from "next";
import Link from "next/link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import { Hero, Section, Breadcrumb, H1, Lead, Eyebrow } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Metodologie de calcul salariu net 2026",
  description:
    "Formulele folosite de calculatorul salariu net 2026: CAS, CASS, impozit, deducere personală, facilitate salariu minim și surse legislative.",
  alternates: { canonical: "https://salariile.ro/metodologie" },
  openGraph: ogPage({
    title: "Metodologie de calcul salariu net 2026",
    description:
      "Formulele și sursele folosite de calculatorul salariile.ro: CAS, CASS, impozit, deducere personală, CAM, facilitate OUG 89/2025.",
    path: "/metodologie",
  }),
  twitter: twPage({
    title: "Metodologie de calcul salariu net 2026",
    description:
      "Formulele și sursele folosite de calculatorul salariile.ro: CAS, CASS, impozit, deducere personală, CAM.",
  }),
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
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile.ro",
        url: "https://salariile.ro",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      },
      image: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      datePublished: "2026-04-01",
      dateModified: "2026-07-26",
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

export default function MetodologiePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Metodologie" }]} />
        <H1>Metodologie de calcul</H1>
        <p className="mt-3 text-sm text-stone-500 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2">
          Scris de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Publicat 1 aprilie 2026 · Actualizat 26 iulie 2026
        </p>
        <Lead>
          Documentația completă a formulelor folosite de calculator. Fiecare componentă este însoțită de articolul exact din Codul Fiscal sau actul normativ aplicabil în 2026.
        </Lead>
        <Eyebrow>VERIFICAT SEPARAT PRIN FORMULARUL D112</Eyebrow>
      </Hero>

      <div>
        <Section>
            <h2>Principiul general</h2>
            <p>
              Calculul salariului net pornește de la salariul brut (de încadrare, conform contractului individual de muncă) și aplică, în ordine, contribuțiile obligatorii reținute la sursă:
            </p>
            <ul>
              <li><strong>CAS</strong> (Contribuția de Asigurări Sociale, „pensie”): 25% din baza de calcul</li>
              <li><strong>CASS</strong> (Contribuția de Asigurări Sociale de Sănătate): 10% din baza de calcul</li>
              <li><strong>Impozit pe venit</strong>: 10% din baza impozabilă</li>
            </ul>
            <p>
              Pe lângă reținerile angajatului, angajatorul mai plătește:
            </p>
            <ul>
              <li><strong>CAM</strong> (Contribuția Asiguratorie pentru Muncă): 2,25% din baza CAM; pentru salariul minim eligibil, suma netaxabilă se exclude și din această bază</li>
            </ul>
            <p>
              CAM nu reduce salariul net al angajatului, dar crește costul total suportat de angajator.
            </p>
        </Section>

        <Section>
            <h2>Formula completă brut → net</h2>
            <p>
              Pentru un salariu brut B, deducere personală D (calculată conform regulilor) și o eventuală sumă netaxabilă F (facilitate OUG 89/2025 aplicabilă doar salariului minim):
            </p>
            <div className="overflow-x-auto"><table>
              <thead>
                <tr>
                  <th>Pas</th>
                  <th>Calcul</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1. Bază pentru CAS, CASS și CAM</td>
                  <td>Bază = B − F</td>
                </tr>
                <tr>
                  <td>2. CAS (25%)</td>
                  <td>CAS = rotund(Bază × 0,25)</td>
                </tr>
                <tr>
                  <td>3. CASS (10%)</td>
                  <td>CASS = rotund(Bază × 0,10)</td>
                </tr>
                <tr>
                  <td>4. Bază impozabilă</td>
                  <td>Bază_imp = B − F − CAS − CASS − D</td>
                </tr>
                <tr>
                  <td>5. Impozit pe venit (10%)</td>
                  <td>Impozit = rotund(max(0, Bază_imp × 0,10))</td>
                </tr>
                <tr className="font-semibold [&_td]:text-stone-900">
                  <td>6. Salariu net</td>
                  <td>Net = B − CAS − CASS − Impozit</td>
                </tr>
                <tr aria-hidden="true"><td colSpan={2} className="h-3 border-0 p-0"></td></tr>
                <tr>
                  <td>7. CAM angajator (2,25%)</td>
                  <td>CAM = rotund((B − F) × 0,0225)</td>
                </tr>
                <tr className="font-semibold [&_td]:text-stone-900">
                  <td>8. Cost total angajator</td>
                  <td>Cost = B + CAM</td>
                </tr>
              </tbody>
            </table></div>
            <p className="source-note">
              „rotund” înseamnă rotunjire la cel mai apropiat leu. Suma netaxabilă F este 0 când facilitatea nu se aplică. Pentru salariul minim brut eligibil în 2026, OUG 89/2025 stabilește 300 lei (ianuarie – iunie) și 200 lei (iulie – decembrie). Tabelul descrie cazul standard fără tichete; când există tichete, ele intră în baza CASS și a impozitului, dar nu în baza CAS sau CAM.
            </p>
        </Section>

        <Section>
            <h2>Sursele normative pentru fiecare componentă</h2>
            <div className="overflow-x-auto"><table>
              <thead>
                <tr>
                  <th>Componentă</th>
                  <th>Cotă 2026</th>
                  <th>Bază legală</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CAS (pensie)</td>
                  <td>25%</td>
                  <td>Codul Fiscal art. 138 lit. a)</td>
                </tr>
                <tr>
                  <td>CASS (sănătate)</td>
                  <td>10%</td>
                  <td>Codul Fiscal art. 156</td>
                </tr>
                <tr>
                  <td>Impozit pe venit</td>
                  <td>10%</td>
                  <td>Codul Fiscal art. 64 alin. (1)</td>
                </tr>
                <tr>
                  <td>Deducere personală</td>
                  <td>variabilă</td>
                  <td>Codul Fiscal art. 77</td>
                </tr>
                <tr>
                  <td>CAM (angajator)</td>
                  <td>2,25%</td>
                  <td>Codul Fiscal art. 220^3</td>
                </tr>
                <tr>
                  <td>Sumă netaxabilă (salariu minim)</td>
                  <td>300 / 200 lei</td>
                  <td>OUG 89/2025</td>
                </tr>
                <tr>
                  <td>Salariu minim brut 2026 (S1)</td>
                  <td>4.050 lei</td>
                  <td>HG 1506/2024</td>
                </tr>
                <tr>
                  <td>Salariu minim brut 2026 (S2)</td>
                  <td>4.325 lei</td>
                  <td>HG 146/2026 (MO 196/13.03.2026)</td>
                </tr>
              </tbody>
            </table></div>
        </Section>

        <Section>
            <h2>Deducerea personală, în detaliu</h2>
            <p>
              Deducerea personală este o sumă scăzută din baza impozabilă, conform Codului Fiscal art. 77. Se aplică numai pentru venituri din salarii la locul unde se află funcția de bază.
            </p>
            <p>
              Pentru 2026, deducerea personală are două componente:
            </p>
            <ul>
              <li>
                <strong>Deducerea personală de bază</strong>: depinde de salariul brut lunar, de numărul de persoane aflate în întreținere și de plafonul calculat ca <em>salariul minim brut + 2.000 lei</em>. Pentru 2026: plafon = 6.050 lei (S1) sau 6.325 lei (S2). Peste acest plafon, deducerea de bază este 0.
              </li>
              <li>
                <strong>Deducerea personală suplimentară</strong>: pentru persoane cu vârsta sub 26 ani aflate la primul loc de muncă, sau pentru salariați cu copii minori în întreținere. Se cumulează cu deducerea de bază.
              </li>
            </ul>
            <p>
              Calculatorul aplică deducerea conform tabelelor publicate în anexa la Codul Fiscal, ținând cont de numărul de persoane în întreținere selectate în secțiunea „Calculator avansat”.
            </p>
            <p>
              Pentru veniturile peste plafonul de 6.050/6.325 lei, deducerea de bază nu se aplică, deci toată suma după contribuții se impozitează cu 10%.
            </p>
            <p>
              Pentru valori pe salariu brut și număr de persoane în întreținere, vezi și <Link href="/deducere-personala-2026">tabelul dedicat pentru deducerea personală 2026</Link>.
            </p>
        </Section>

        <Section>
            <h2>Facilitatea fiscală pentru salariul minim (OUG 89/2025)</h2>
            <p>
              Pentru salariații încadrați la nivelul salariului minim brut, cu funcția de bază și normă întreagă, o sumă fixă este scutită de impozit și contribuții sociale:
            </p>
            <ul>
              <li>1 ianuarie – 30 iunie 2026: 300 lei lunar netaxabili</li>
              <li>1 iulie – 31 decembrie 2026: 200 lei lunar netaxabili</li>
            </ul>
            <p>
              Suma netaxabilă se scade din salariul brut <em>înainte</em> de calculul CAS, CASS și impozit. Practic, baza de calcul pentru contribuții devine 3.750 lei (S1) sau 4.125 lei (S2), iar netul efectiv este mai mare decât dacă facilitatea nu ar fi existat.
            </p>
            <p>
              Facilitatea nu se aplică pentru salarii peste nivelul minim brut, nici pentru programe parțiale, nici pentru cumul de funcții (când postul nu este funcția de bază).
            </p>
        </Section>

        <Section>
            <h2>Tratamentul rotunjirilor</h2>
            <p>
              Motorul rotunjește la cel mai apropiat leu fiecare obligație declarată: CAS, CASS, impozitul pe venit și CAM. Deducerea personală calculată procentual este, de asemenea, rotunjită la leu. Valorile astfel obținute sunt folosite în pașii următori; calculatorul nu păstrează contribuțiile intermediare la două zecimale.
            </p>
            <p>
              Exemplu pentru 4.325 lei brut, cu facilitatea de 200 lei: baza este 4.125 lei; CAS = rotund(1.031,25) = 1.031 lei, CASS = rotund(412,50) = 413 lei, deducerea personală de bază = 865 lei, impozitul = rotund(181,60) = 182 lei, iar netul este 2.699 lei. CAM = rotund(92,8125) = 93 lei, deci costul total al angajatorului este 4.418 lei.
            </p>
        </Section>

        <Section>
            <h2>Validarea separată prin Declarația 112 ANAF</h2>
            <p>
              Declarația 112 este declarația lunară prin care angajatorii raportează la ANAF impozitul și contribuțiile aferente salariaților. Motorul calculatorului mapează CAS, CASS, impozitul, deducerea personală și CAM la bazele și câmpurile corespunzătoare din formular.
            </p>
            <p>
              Pentru cazul salarial standard, proprietarul proiectului a verificat separat calculul prin completarea formularului D112 și prin validatorul ANAF. Câmpurile și sumele validate au coincis cu rezultatele calculatorului. Cazurile speciale rămân supuse limitărilor declarate mai jos.
            </p>
        </Section>

        <Section>
            <h2 id="salarii">Cum documentăm salariile pe meserii: Metodologia multi-sursă Salariile.ro</h2>
            <p>
              Fiecare dintre cele 132 de meserii analizate pe <Link href="/salarii">Salariile.ro</Link> beneficiază de un studiu exhaustiv documentat individual. Pentru a oferi cifre reale, granulare și ancorate în realitatea pieței muncii din România, integrăm patru piloni metodologici independenți:
            </p>
            <ol className="list-decimal space-y-3 pl-5 text-stone-700">
              <li>
                <strong>Piața muncii și ghidurile salariale de recrutare:</strong> Analizăm rapoartele salariale anuale independente și comparatoarele de referință din România (<a href="https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf" rel="nofollow noopener">eJobs Review &amp; Trends 2026</a>, comparatorul Salario, ghidul salarial <a href="https://www.hays.ro/en/salary-guide/overview" rel="nofollow noopener">Hays România 2026</a>). Aceste surse reflectă nivelurile salariale nete negociate și declarate în companiile private.
              </li>
              <li>
                <strong>Grile oficiale și legislația de salarizare:</strong> Pentru funcțiile din sectorul public (învățământ, sănătate, justiție, administrație, ordine publică), extragem sumele oficiale prevăzute de <a href="https://legislatie.just.ro/Public/DetaliiDocument/190446" rel="nofollow noopener">Legea-cadru 153/2017</a> cu toate modificările și treptele în plată. Pentru fiecare rol bugetar atribuim valoarea mediană a treptelor profesionale (grad, vechime, nivel de încadrare), reflectând nivelul de mijloc al carierei.
              </li>
              <li>
                <strong>Intersecția statistică ocupațională INS:</strong> Corelăm ancheta structurală a câștigurilor pe ocupații (<a href="https://statistici.insse.ro/tempoins/?ind=FOM121A&lang=ro&page=tempo3" rel="nofollow noopener">FOM121A</a>) cu seriile lunare pe ramuri economice (<a href="https://statistici.insse.ro/tempoins/?ind=FOM106G&lang=ro&page=tempo3" rel="nofollow noopener">FOM106G</a>). Această corelare ajustează media sectorului CAEN cu ponderea specifică a grupei de competențe ISCO-08, indexată la dinamica salarială curentă a economiei.
              </li>
              <li>
                <strong>Monitorizarea ofertelor și a organizațiilor profesionale:</strong> Monitorizăm dinamica anunțurilor de angajare active, raportările asociațiilor de profil (precum UNTRR în transporturi rutiere, Colegiul Medicilor Stomatologi, UNNPR în notariat) și contractele colective de ramură pentru a asigura un nivel granular și distinct pentru fiecare ocupație.
              </li>
            </ol>
            <h3>Granularitate 100% și eliminarea coliziunilor</h3>
            <p>
              Spre deosebire de agregatoarele automate care aplică aceeași medie de sector tuturor profesiilor dintr-o industrie, Salariile.ro diferențiază fiecare meserie în mod individual. Fiecare dintre cele 132 de ocupații are propriul salariu net de referință studiat, fără coliziuni artificiale, respectând cerințele de calificare și specificul fiecărui rol.
            </p>
            <h3>Salarii nete unice și valori mediane clare</h3>
            <p>
              Pentru fiecare meserie afișăm direct venitul net lunar (banii primiți în mână), calculat conform legislației fiscale la zi. Acolo unde grilele legale conțin trepte de carieră sau gradații de vechime, stabilim valoarea mediană reprezentativă a intervalului, oferind o perspectivă realistă și eliminând confuzia intervalelor largi.
            </p>
            <h3>Județ, experiență și context regional</h3>
            <p>
              Defalcarea pe județe este preluată din seriile anuale oficiale INS (matricea FOM107E), arătând variațiile geografice reale ale economiei locale. Variația pe grupe de vârstă (FOM121B) și cererea de forță de muncă prin locuri vacante (LMV102D) completează tabloul pieței pentru fiecare profesie.
            </p>
            <h3>Codurile COR și alinierea ocupațională</h3>
            <p>
              Asocierile cu Clasificarea Ocupațiilor din România respectă <a href="https://data.gov.ro/dataset/clasificarea-ocupatiilor-din-romania">catalogul oficial COR</a>, asigurând puntea de legătură între denumirile uzuale din piața muncii și codurile oficiale din nomenclatorul național.
            </p>
        </Section>

        <Section>
            <h2>Limitări declarate</h2>
            <p>
              Calculatorul reproduce formula standard pentru un salariu lunar tipic, dar <strong>nu poate înlocui</strong> un calcul personalizat făcut de un contabil pentru cazuri speciale. În particular, calculatorul:
            </p>
            <ul>
              <li><strong>Nu integrează sporuri și beneficii nesalariale</strong> tratate diferențiat (tichete de masă peste plafon, tichete cadou, prime ocazionale, indemnizații de delegare etc.)</li>
              <li><strong>Nu calculează concediile medicale</strong> (alt tratament fiscal, indemnizație din FAAMBP sau de la angajator)</li>
              <li><strong>Nu acoperă cazurile de cumul de funcții</strong> (mai multe contracte simultane, funcție de bază vs locuri suplimentare de muncă)</li>
              <li><strong>Nu aplică scutirile sectoriale</strong> care erau în vigoare înainte de 2025 (IT, construcții, agroalimentar), eliminate prin OUG 156/2024</li>
              <li><strong>Nu calculează contribuțiile angajatorilor speciali</strong> (entități non-profit, cooperative agricole etc.)</li>
              <li><strong>Nu generează fluturașul oficial de plată</strong>: afișează doar componentele de bază; fluturașul oficial poate conține mai multe rânduri (ore lucrate, ore suplimentare, sporuri, deduceri specifice etc.)</li>
            </ul>
            <p>
              Pentru aceste situații, recomand consultarea unui contabil autorizat sau a unui expert fiscal. Calculatorul este util pentru a obține o estimare rapidă și acurată pentru cazul standard.
            </p>
        </Section>

        <Section>
            <h2>Cum se actualizează calculatorul</h2>
            <p>
              Modificările legislative privind salariile sunt urmărite lunar prin Monitorul Oficial și comunicările Ministerului Finanțelor, ANAF și Ministerului Muncii. La fiecare modificare semnificativă (publicare HG, OUG, lege nouă) actualizez:
            </p>
            <ul>
              <li>Formulele calculatorului, dacă se modifică o cotă sau o regulă de aplicare</li>
              <li>Valorile de referință folosite (salariu minim, plafon deducere), la fiecare actualizare anunțată oficial</li>
              <li>Paginile editoriale aferente (<Link href="/salariu-minim">salariu minim</Link>, <Link href="/salariu-mediu">salariu mediu</Link>), cu noile cifre și surse</li>
              <li>Această pagină, pentru a reflecta noile articole din Codul Fiscal sau noile acte normative</li>
            </ul>
            <p>
              În antetul fiecărei pagini este afișată data ultimei revizuiri. Dacă observi o discrepanță între ce afișează calculatorul și o sursă oficială pe care o ai, scrie-mi la adresa de pe pagina de <Link href="/contact">contact</Link>.
            </p>
        </Section>

        <Section>
            <h2>Surse oficiale folosite</h2>
            <ul>
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/257144" target="_blank" rel="noopener"><strong>Codul Fiscal</strong>, Legea 227/2015</a>, cu modificările ulterioare</li>
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646" target="_blank" rel="noopener"><strong>Codul Muncii</strong>, Legea 53/2003</a>, cu modificările ulterioare</li>
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/308231" target="_blank" rel="noopener"><strong>HG 146/2026</strong></a>: salariu minim de la 1 iulie 2026 (MO nr. 196 din 13 martie 2026)</li>
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/291450" target="_blank" rel="noopener"><strong>HG 1506/2024</strong></a>: salariu minim de la 1 ianuarie 2025 (MO nr. 1185 din 28 noiembrie 2024)</li>
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/305817" target="_blank" rel="noopener"><strong>OUG 89/2025</strong></a>: facilitate fiscală 300/200 lei pentru salariul minim</li>
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/293109" target="_blank" rel="noopener"><strong>OUG 156/2024</strong></a>: eliminarea scutirilor sectoriale IT, construcții, agroalimentar</li>
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/294600" target="_blank" rel="noopener"><strong>HG 35/2025</strong></a>: mecanismul tehnic de stabilire a salariului minim</li>
              <li><strong>Legea 44/2026</strong>: bugetul asigurărilor sociale, valoarea salariului mediu</li>
              <li><strong>Ministerul Muncii</strong>: <a href="https://mmuncii.gov.ro" target="_blank" rel="noopener">mmuncii.gov.ro</a></li>
              <li><strong>ANAF</strong>: <a href="https://www.anaf.ro" target="_blank" rel="noopener">anaf.ro</a> (template Declarația 112)</li>
              <li><strong>Monitorul Oficial</strong>: <a href="https://legislatie.just.ro" target="_blank" rel="noopener">legislatie.just.ro</a> (portal căutare generală)</li>
              <li><strong>Institutul Național de Statistică</strong>: <a href="https://insse.ro" target="_blank" rel="noopener">insse.ro</a></li>
            </ul>
            <p className="source-note">Pagină actualizată: 26 iulie 2026.</p>
        </Section>
      </div>
    </>
  );
}
