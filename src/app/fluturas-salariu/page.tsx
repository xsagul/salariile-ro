// app/fluturas-salariu/page.tsx
// Landing dedicat: generator de fluturaș de salariu (PDF) + explicații.
// Refolosește CalculatorSalariu (butonul „Descarcă fluturaș PDF" există deja
// în componenta de rezultat); pagina adaugă contextul editorial și FAQ-ul.

import type { Metadata } from "next";
import Link from "next/link";
import CalculatorSalariu from "@/app/components/CalculatorSalariu";
import { Section } from "@/app/components/ui";
import { personSchema } from "@/lib/person";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Fluturaș de salariu: generator PDF și model explicat 2026",
  description:
    "Generează un fluturaș de salariu în format PDF: salariu de bază, ore suplimentare, sporuri, tichete, rețineri și toate taxele, pe legislația 2026. Plus ghid pentru fiecare rând.",
  alternates: { canonical: "https://salariile.ro/fluturas-salariu" },
  openGraph: ogPage({
    title: "Fluturaș de salariu: generator PDF și model explicat 2026",
    description:
      "Generează un fluturaș de salariu PDF cu ore suplimentare, sporuri, tichete și rețineri, calculat pe legislația 2026.",
    path: "/fluturas-salariu",
  }),
  twitter: twPage({
    title: "Fluturaș de salariu: generator PDF 2026",
    description:
      "Generează un fluturaș de salariu PDF cu ore suplimentare, sporuri, tichete și rețineri, calculat pe legislația 2026.",
  }),
};

const FAQ = [
  {
    q: "Ce este fluturașul de salariu?",
    a: "Fluturașul de salariu este documentul lunar care detaliază cum s-a ajuns de la salariul brut la suma primită în cont: reținerile de CAS (25%), CASS (10%), impozit pe venit (10%), deducerea personală, tichetele de masă și eventualele sporuri sau rețineri. Este oglinda lunară a contractului tău de muncă.",
  },
  {
    q: "Este angajatorul obligat să îmi dea fluturaș de salariu?",
    a: "Codul Muncii (art. 168) obligă angajatorul să poată dovedi plata salariului prin statele de plată și documente justificative, iar tu ai dreptul să ceri detaliile calculului. Fluturașul, ca document numit așa, nu e impus explicit de lege, dar este practica standard, iar multe contracte colective de muncă îl prevăd expres. Dacă nu îl primești, cere-l în scris.",
  },
  {
    q: "Ce verific prima dată pe fluturaș?",
    a: "Trei lucruri: brutul să fie cel din contract (sau actul adițional, după majorarea salariului minim din 1 iulie 2026), deducerea personală să fie aplicată dacă ai sub 6.325 lei brut pe funcția de bază, iar la salariul minim, facilitatea de 200 lei netaxabili (OUG 89/2025) să apară în calcul. Lipsa ei înseamnă un net mai mic cu circa 80-100 lei pe lună.",
  },
  {
    q: "Fluturașul generat aici este valabil oficial?",
    a: "Nu. Generatorul produce un fluturaș demonstrativ, calculat corect pe legislația 2026 (același calcul validat cu Declarația 112 ANAF), în formatul folosit de programele de salarizare. E util ca să verifici fluturașul primit de la angajator sau să înțelegi o ofertă salarială, dar nu înlocuiește documentul oficial emis de firmă.",
  },
  {
    q: "Pot adăuga ore suplimentare, sporuri, rețineri sau o lună parțial lucrată?",
    a: "Da, pe toate. Generatorul acceptă normă lunară și ore lucrate (pentru angajare la mijloc de lună sau concediu fără plată, salariul de bază se plătește proporțional), ore suplimentare (la tariful orar, cu sporul procentual ales, minim legal 75%), sporuri și prime brute, tichete de masă și rețineri (avans, popriri), plus numele firmei pe document. Un detaliu pe care multe softuri îl greșesc: dacă salariul de bază e minimul pe economie și sporurile nu duc venitul brut peste plafonul de 4.600 lei, facilitatea de 200 lei netaxabili (OUG 89/2025) se păstrează — calculatorul o aplică corect.",
  },
  {
    q: "Care e diferența dintre fluturaș și statul de plată?",
    a: "Statul de plată e documentul contabil al firmei, cu toți salariații pe același tabel, semnat și arhivat ca dovadă a plății (Codul Muncii art. 168). Fluturașul e extrasul individual al unui singur angajat din acel stat: aceleași cifre, dar doar ale tale. De aceea formatul fluturașului variază de la un program de salarizare la altul, în timp ce statul de plată are cerințe contabile fixe.",
  },
  {
    q: "De ce ar putea diferi fluturașul meu de calculul de aici?",
    a: "Cazurile neacoperite de generator: concediu medical în lună (indemnizația se calculează pe alte reguli), concediu de odihnă plătit la medie, cumul de funcții sau deduceri speciale negociate. Pentru acestea, fluturașul oficial al angajatorului rămâne referința.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Fluturaș de salariu", item: "https://salariile.ro/fluturas-salariu" },
      ],
    },
    {
      "@type": "WebApplication",
      "@id": "https://salariile.ro/fluturas-salariu#generator",
      name: "Generator fluturaș de salariu PDF",
      url: "https://salariile.ro/fluturas-salariu",
      description:
        "Generator gratuit de fluturaș de salariu în format PDF, cu CAS, CASS, impozit, deducere personală și tichete de masă, conform legislației 2026.",
      applicationCategory: "FinanceApplication",
      operatingSystem: "All",
      isAccessibleForFree: true,
      publisher: { "@type": "Organization", name: "Salariile.ro", url: "https://salariile.ro" },
      author: personSchema,
    },
    {
      "@type": "WebPage",
      url: "https://salariile.ro/fluturas-salariu",
      name: "Fluturaș de salariu: generator PDF gratuit și model explicat 2026",
      inLanguage: "ro",
      dateModified: PAGE_LAST_MODIFIED["/fluturas-salariu"].toISOString().slice(0, 10),
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

export default function FluturasSalariuPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <CalculatorSalariu
          modInitial="brut"
          fluturas
          titluCustom={<>Generator fluturaș de salariu</>}
          subtitluCustom={
            <>
              Completează salariul de bază și, dacă e cazul, orele lucrate, orele suplimentare, sporurile, tichetele
              și reținerile. Apasă Calculează, apoi descarcă fluturașul în PDF cu butonul de sub tabel. Calcul conform
              legislației 2026, în formatul programelor de salarizare.
            </>
          }
        />
      </div>

      <Section>
        <h2>Ce conține fluturașul generat</h2>
        <p>
          PDF-ul reproduce structura fluturașului emis de programele de salarizare folosite de firmele din România:
          numele firmei (dacă îl completezi), pontajul lunii (norma, orele lucrate, tariful orar), salariul de bază
          plătit proporțional cu orele lucrate, orele suplimentare cu sporul lor, sporurile și primele, reținerile
          individuale (CAS 25%, CASS 10%, impozit 10%), deducerea personală, tichetele de masă cu taxarea lor separată,
          reținerile din net (avans, popriri) și restul de plată. Fiecare cifră vine din același modul de calcul folosit
          de <Link href="/">calculatorul de salariu</Link>, sincronizat cu Declarația 112 ANAF.
        </p>
        <p className="source-note">
          Pentru înțelegerea fiecărui rând de pe fluturașul primit de la firmă, citește ghidul:{" "}
          <Link href="/noutati/cum-citesti-fluturasul-de-salariu">cum îți citești fluturașul de salariu</Link>.
        </p>
      </Section>

      <Section>
        <h2>La ce e util un fluturaș generat de tine</h2>
        <ul>
          <li>
            <strong>Verifici fluturașul de la angajator.</strong> Generezi varianta corectă pentru brutul tău și compari
            rând cu rând. Diferențele nejustificate (deducere lipsă, facilitate neaplicată) se văd imediat.
          </li>
          <li>
            <strong>Evaluezi o ofertă de muncă.</strong> Oferta e în brut; fluturașul îți arată exact ce înseamnă în
            mână, cu toate reținerile, înainte să semnezi.
          </li>
          <li>
            <strong>Negociezi în cunoștință de cauză.</strong> Vezi exact unde se duce fiecare sută de lei negociată în
            plus: cât ajunge în cont și cât se oprește la stat.
          </li>
        </ul>
      </Section>

      <Section>
        <h2>Întrebări frecvente</h2>
        <div className="flex flex-col">
          {FAQ.map((item, i) => (
            <details key={i} name="faq-fluturas" className="group border-b border-stone-200 py-4">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-medium tracking-[-0.01em] text-stone-900 [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="flex-shrink-0 text-xl text-stone-900 group-open:hidden">+</span>
                <span className="hidden flex-shrink-0 text-xl text-stone-900 group-open:inline">−</span>
              </summary>
              <p className="mt-3 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600">{item.a}</p>
            </details>
          ))}
        </div>
        <p className="source-note">
          Surse: Codul Muncii (Legea 53/2003, art. 166-168), Codul Fiscal (Legea 227/2015), HG 146/2026, OUG 89/2025.
          Ultima actualizare: 2 iulie 2026.
        </p>
      </Section>
    </>
  );
}
