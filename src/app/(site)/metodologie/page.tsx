// app/metodologie/page.tsx
// Server Component. Metodologia de calcul — semnal E-E-A-T pentru YMYL.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import { Hero, Section, Breadcrumb, H1, Lead, Eyebrow, CardCompanion, Formula, SUB_TITLU } from "@/app/components/ui";
import { calculStandardCuRegim, DEDUCERE_MINIM, REGIM_FISCAL_CURENT, SALARIU_MINIM } from "@/lib/fiscal";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);
const fmt2 = (n: number) => new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 4 }).format(n);
// Exemplul de rotunjire vine din motorul de calcul, ca să nu rămână în urmă la următorul minim.
const EX = calculStandardCuRegim(SALARIU_MINIM, REGIM_FISCAL_CURENT)!;
const BAZA_EX = SALARIU_MINIM - EX.facilitate;

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
        name: "Salariile",
        url: "https://salariile.ro",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/icon-512.png", width: 512, height: 512 },
      },
      image: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      datePublished: "2026-04-01",
      dateModified: PAGE_LAST_MODIFIED["/metodologie"].toISOString().slice(0, 10),
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
        <p className={`${SUB_TITLU} text-sm text-stone-600 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2`}>
          Scris de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Publicat 1 aprilie 2026 · Actualizat {PAGE_LAST_MODIFIED["/metodologie"].toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
        </p>
        <Lead>
          Documentația completă a formulelor folosite de calculator. Fiecare componentă este însoțită de articolul exact din Codul Fiscal sau actul normativ aplicabil în 2026.
        </Lead>
        <Eyebrow>VERIFICAT SEPARAT PRIN FORMULARUL D112</Eyebrow>
      </Hero>

      <Section
        companion={
          <CardCompanion titlu="Cotele și temeiul lor">
            <table className="w-full text-sm">
              <tbody className="text-stone-600 [&_td]:py-1 [&_th]:py-1">
                <tr><th scope="row" className="text-left font-normal">CAS, pensie</th><td className="text-right text-stone-900">25%</td><td className="pl-3 text-xs">CF art. 138</td></tr>
                <tr><th scope="row" className="text-left font-normal">CASS, sănătate</th><td className="text-right text-stone-900">10%</td><td className="pl-3 text-xs">CF art. 156</td></tr>
                <tr><th scope="row" className="text-left font-normal">Impozit</th><td className="text-right text-stone-900">10%</td><td className="pl-3 text-xs">CF art. 64</td></tr>
                <tr><th scope="row" className="text-left font-normal">CAM, angajator</th><td className="text-right text-stone-900">2,25%</td><td className="pl-3 text-xs">CF art. 220^3</td></tr>
                <tr><th scope="row" className="text-left font-normal">Deducere</th><td className="text-right text-stone-900">variabilă</td><td className="pl-3 text-xs">CF art. 77</td></tr>
                <tr><th scope="row" className="text-left font-normal">Sumă netaxată la minim</th><td className="text-right text-stone-900">{DEDUCERE_MINIM} lei</td><td className="pl-3 text-xs">OUG 89/2025</td></tr>
                <tr><th scope="row" className="text-left font-normal">Salariul minim</th><td className="text-right text-stone-900">{fmt(SALARIU_MINIM)} lei</td><td className="pl-3 text-xs">HG 146/2026</td></tr>
              </tbody>
            </table>
            <p className="mt-3 text-xs text-stone-600">CF = Codul Fiscal. Minimul și suma netaxată sunt cele din 1 iulie 2026.</p>
          </CardCompanion>
        }
      >
        <h2>Formula completă brut → net</h2>
        <p>
          Din salariul brut B din contract se rețin pensia, sănătatea și impozitul. Deducerea personală D scade doar
          baza impozitului. Suma netaxată F se aplică numai la salariul minim și scoate o parte din brut de sub toate
          taxele. Angajatorul plătește în plus CAM, care nu atinge netul.
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

      <Section
        companion={
          <CardCompanion titlu="Suma netaxată de la salariul minim">
            <p className="text-sm text-stone-600">
              La salariul minim, cu normă întreagă și la locul de muncă de bază, {DEDUCERE_MINIM} de lei pe lună nu
              plătesc nici contribuții, nici impozit (300 de lei până în iunie). Suma se scade din brut înaintea
              oricărui calcul, deci baza devine {fmt(SALARIU_MINIM - DEDUCERE_MINIM)} lei.
            </p>
            <p className="mt-3 text-sm text-stone-600">
              Nu se aplică peste salariul minim, la program parțial sau la un al doilea contract.
            </p>
            <p className="mt-3 text-xs text-stone-600">OUG 89/2025.</p>
          </CardCompanion>
        }
      >
        <h2>Deducerea personală</h2>
        <p>
          Deducerea se scade din baza impozitului, numai la locul de muncă de bază (Codul Fiscal, art. 77). Are două
          părți, care se adună:
        </p>
        <ul>
          <li>
            <strong>Deducerea de bază</strong> pornește de la 20% din salariul minim fără persoane în întreținere și
            ajunge la 45% cu patru sau mai multe. Scade cu 0,5 puncte pentru fiecare 50 de lei peste minim și devine
            zero peste {fmt(SALARIU_MINIM + 2000)} lei brut.
          </li>
          <li>
            <strong>Deducerea suplimentară</strong>: 15% din salariul minim pentru cei sub 26 de ani, cu brut de cel
            mult {fmt(SALARIU_MINIM + 2000)} lei, și 100 de lei pentru fiecare copil la școală.
          </li>
        </ul>
        <p>
          Calculatorul ia persoanele în întreținere din „Calculator avansat”. Valorile pe salariu și persoane sunt
          în <Link href="/deducere-personala-2026">tabelul deducerii personale</Link>.
        </p>
      </Section>

      <Section
        companion={
          <CardCompanion titlu="Verificat prin Declarația 112">
            <p className="text-sm text-stone-600">
              Declarația 112 e formularul lunar prin care firmele raportează la ANAF impozitul și contribuțiile
              salariaților. Motorul calculatorului leagă CAS, CASS, impozitul, deducerea și CAM de câmpurile din
              formular.
            </p>
            <p className="mt-3 text-sm text-stone-600">
              Pentru cazul standard, calculul a fost verificat separat, prin completarea formularului D112 și prin
              validatorul ANAF. Sumele au coincis. Cazurile speciale rămân sub limitările de mai jos.
            </p>
          </CardCompanion>
        }
      >
        <h2>Rotunjirile</h2>
        <p>
          Fiecare obligație declarată se rotunjește la cel mai apropiat leu: CAS, CASS, impozitul și CAM. La fel
          deducerea personală. Pașii următori folosesc valorile rotunjite; calculatorul nu duce zecimale de la un
          pas la altul. Pentru salariul minim:
        </p>
        <Formula
          eticheta={`Rotunjirile la ${fmt(SALARIU_MINIM)} lei brut`}
          randuri={[
            `Bază     = ${fmt(SALARIU_MINIM)} − ${EX.facilitate} netaxați = ${fmt(BAZA_EX)}`,
            `CAS      = rotund(${fmt2(BAZA_EX * 0.25)})  = ${fmt(EX.cas)}`,
            `CASS     = rotund(${fmt2(BAZA_EX * 0.1)})    = ${fmt(EX.cass)}`,
            `Impozit  = rotund(${fmt2((BAZA_EX - EX.cas - EX.cass - EX.deducerePersonala) * 0.1)})    = ${fmt(EX.impozit)}   (deducere ${fmt(EX.deducerePersonala)})`,
            `Net      = ${fmt(SALARIU_MINIM)} − ${fmt(EX.cas)} − ${fmt(EX.cass)} − ${fmt(EX.impozit)} = ${fmt(EX.netBani)} lei`,
            `CAM      = rotund(${fmt2(BAZA_EX * 0.0225)})    = ${fmt(EX.cam)}   → cost firmă ${fmt(EX.costTotal)} lei`,
          ]}
        />
      </Section>

      <Section
        companion={
          <CardCompanion titlu="Jurnal de corecții">
            <div id="corectii" className="scroll-mt-24 text-sm text-stone-600 [&_time]:font-medium [&_time]:text-stone-900">
              <p><time dateTime="2026-09-07">7 septembrie 2026</time>: am retras afirmațiile despre eșantioane de anunțuri și scoruri de încredere fără înregistrări verificabile, am înlocuit reperele de piață cu valori atribuite punctual și am separat intervalele din grile de salariile declarate. Am adăugat raportări de angajator cu baza și componentele lunare distincte. Revizia de date și implementarea aparțin autorului site-ului; nu declarăm o revizie contabilă externă.</p>
            </div>
          </CardCompanion>
        }
      >
        <h2 id="salarii">Cum verificăm salariile pe meserii</h2>
        <p>Fiecare reper din <Link href="/salarii">catalog</Link> păstrează sursa, perioada, populația și natura sumei. Sursele independente sunt prezentate alături, cu diferențele explicate. Nu calculăm o medie între un sondaj, o ofertă și o grilă.</p>
        <h3>Salarii declarate de angajați</h3>
        <p>Folosim mediile nete publicate în <a href="https://cariera.ejobs.ro/salarii-romania-ghidul-salarial-ejobs-2026/">Ghidul Salarial eJobs 2026</a>, pentru raportări între 31 martie 2025 și 31 martie 2026. Eșantionul este voluntar. Numărul total de răspunsuri din ghid nu reprezintă numărul de răspunsuri al fiecărei meserii. Păstrăm denumirea exactă a rolului sursei și semnalăm asocierile mai largi.</p>
        <h3>Raportări de angajator și grile</h3>
        <p>Pentru ofertele de angajare, <Link href="/salarii/acoperire">pagina de acoperire</Link> arată câte anunțuri am verificat pe meserie și cât am parcurs din fiecare sursă. Registrul păstrează sumele originale, conversiile și ipotezele. Un reper central al ofertelor se publică numai după verificarea volumului, diversității și sensibilității rezultatului; nu este mediana salariilor tuturor angajaților.</p>
        <p>Documentele de transparență salarială permit separarea bazei de sporuri. Publicăm intervale ale funcțiilor din instituția citată. Conversia brut/net este standard, fără presupuneri despre deducerile persoanelor. Rândurile nu sunt tratate automat ca angajați distincți. Componentele anuale nu se adună la salariul lunar.</p>
        <p>Grilele Legii 153/2017 indică trepte ale bazei legale, nu media salariilor încasate. Afișăm intervalul treptelor disponibile. Fără ponderile angajaților pe trepte nu putem calcula o mediană a personalului.</p>
        <h3>Estimări INS și limite ocupaționale</h3>
        <p>FOM121A încrucișează activitatea economică și grupa majoră ISCO. Corelarea cu seria lunară FOM106G produce o estimare de grupă, nu salariul unui cod COR. Datele pe județe descriu activități economice, iar vârsta nu este echivalentul experienței profesionale.</p>
        <h3>Controlul surselor</h3>
        <p>Nu inventăm numere de anunțuri, percentile sau scoruri de încredere. Două meserii pot avea aceeași valoare raportată. Nu modificăm cifrele pentru a obține salarii distincte și nu eliminăm observații istorice folosind pragul legal dintr-o altă perioadă.</p>
      </Section>

      <Section
        companion={
          <CardCompanion titlu="Cum se ține la zi">
            <p className="text-sm text-stone-600">
              Urmăresc Monitorul Oficial și comunicările Ministerului Finanțelor, ANAF și Ministerului Muncii. Când
              apare un act nou, schimb formulele, valorile de referință și paginile care le folosesc, inclusiv pe
              aceasta. Data ultimei revizuiri e sub titlul fiecărei pagini.
            </p>
            <p className="mt-3 text-sm text-stone-600">
              Ai găsit o diferență față de o sursă oficială? Scrie-mi, adresa e la{" "}
              <Link href="/contact" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600">contact</Link>.
            </p>
          </CardCompanion>
        }
      >
        <h2>Limitări declarate</h2>
        <p>
          Calculatorul reproduce formula standard pentru un salariu lunar tipic, dar <strong>nu poate înlocui</strong> un calcul personalizat făcut de un contabil pentru cazuri speciale. În particular, calculatorul:
        </p>
        <ul>
          <li><strong>Nu integrează sporuri și beneficii nesalariale</strong> tratate diferențiat (tichete de masă peste plafon, tichete cadou, prime ocazionale, indemnizații de delegare etc.)</li>
          <li><strong>Nu calculează concediile medicale</strong> (alte reguli de calcul, plată împărțită între angajator și fondul de sănătate; vezi <Link href="/noutati/concediu-medical-2026">ghidul despre concediul medical</Link>)</li>
          <li><strong>Nu acoperă cazurile de cumul de funcții</strong> (mai multe contracte simultane, funcție de bază vs locuri suplimentare de muncă)</li>
          <li><strong>Nu aplică scutirile sectoriale</strong> care erau în vigoare înainte de 2025 (IT, construcții, agroalimentar), eliminate prin OUG 156/2024</li>
          <li><strong>Nu calculează contribuțiile angajatorilor speciali</strong> (entități non-profit, cooperative agricole etc.)</li>
          <li><strong>Nu înlocuiește fluturașul oficial</strong>: <Link href="/fluturas-salariu">generatorul de fluturaș</Link> include ore lucrate, ore suplimentare, sporuri și rețineri, dar documentul oficial îl emite doar angajatorul</li>
        </ul>
        <p>
          Pentru aceste situații, recomand consultarea unui contabil autorizat sau a unui expert fiscal. Calculatorul este util pentru a obține o estimare rapidă și acurată pentru cazul standard.
        </p>
      </Section>

      <Section wide>
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
      </Section>
    </>
  );
}
