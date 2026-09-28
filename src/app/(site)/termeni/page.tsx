// app/termeni/page.tsx
// Server Component. Termeni și condiții de utilizare.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import { Hero, Section, Breadcrumb, H1, Lead, Eyebrow } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Termeni și condiții de utilizare",
  description:
    "Termenii și condițiile de utilizare a site-ului salariile.ro: caracter informativ, limitări de răspundere, drepturi de autor.",
  alternates: { canonical: "https://salariile.ro/termeni" },
  openGraph: ogPage({
    title: "Termeni și condiții de utilizare",
    description:
      "Termenii de utilizare a site-ului salariile.ro: caracter informativ, limitări de răspundere, drepturi de autor.",
    path: "/termeni",
  }),
  twitter: twPage({
    title: "Termeni și condiții de utilizare",
    description:
      "Termenii de utilizare a site-ului salariile.ro: caracter informativ, limitări de răspundere.",
  }),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Termeni și condiții", item: "https://salariile.ro/termeni" },
      ],
    },
    {
      "@type": "WebPage",
      name: "Termeni și condiții salariile.ro",
      description:
        "Termenii de utilizare a salariile.ro: caracter informativ al conținutului, limitări de răspundere, drepturi de autor, soluționare litigii.",
      url: "https://salariile.ro/termeni",
      inLanguage: "ro-RO",
      dateModified: PAGE_LAST_MODIFIED["/termeni"].toISOString().slice(0, 10),
      isPartOf: {
        "@type": "WebSite",
        name: "Salariile",
        url: "https://salariile.ro",
      },
    },
  ],
};

export default function TermeniPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Termeni și condiții" }]} />
        <H1>Termeni și condiții de utilizare</H1>
        <Lead>
          Prin accesarea și utilizarea salariile.ro accepți termenii de mai jos. Te rugăm să citești această pagină înainte de a folosi calculatorul sau informațiile publicate.
        </Lead>
        <Eyebrow>ÎN VIGOARE: 29 IULIE 2026</Eyebrow>
      </Hero>

      <div>
        <Section>
            <h2>1. Acceptarea termenilor</h2>
            <p>
              Salariile.ro este un site web public, accesibil oricui. Prin vizitarea și utilizarea oricărei pagini, accepți implicit termenii descriși mai jos. Dacă nu ești de acord cu acești termeni, te rugăm să nu folosești site-ul.
            </p>
        </Section>

        <Section>
            <h2>2. Caracterul informativ al conținutului</h2>
            <p>
              Toate informațiile, calculele și articolele publicate pe salariile.ro au <strong>caracter strict informativ</strong>. Nu constituie consultanță fiscală, juridică, financiară sau de altă natură profesională.
            </p>
            <p>
              Site-ul este întreținut individual ca proiect personal, nu de către un contabil autorizat, expert fiscal sau jurist. Detalii despre cine întreține site-ul găsești pe pagina <Link href="/despre">Despre</Link>, iar metodologia de calcul este documentată pe pagina <Link href="/metodologie">Metodologie</Link>.
            </p>
            <p>
              Pentru situații fiscale individuale complexe (cumul de venituri, scutiri speciale, beneficii nesalariale ample, contracte cu clauze atipice, situații PFA, micro-întreprinderi, dividende etc.) recomand consultarea unui specialist autorizat: contabil, expert contabil sau consultant fiscal.
            </p>
        </Section>

        <Section>
            <h2>3. Acuratețea informațiilor</h2>
            <p>
              Depun efortul rezonabil pentru ca toate informațiile publicate să fie corecte și actualizate conform legislației în vigoare. Sursele folosite sunt acte normative oficiale publicate în Monitorul Oficial, iar fiecare cifră afișată este însoțită, acolo unde este relevant, de referința legală exactă.
            </p>
            <p>
              Cu toate acestea, <strong>nu garantez că informațiile sunt complete, exacte sau actualizate în orice moment</strong>. Legislația fiscală română se modifică frecvent, uneori prin ordonanțe de urgență cu efect imediat, și pot exista perioade scurte (de regulă câteva zile) între o modificare oficială și actualizarea conținutului site-ului.
            </p>
            <p>
              Dacă observi o eroare sau o informație neactualizată, poți semnala asta prin pagina de <Link href="/contact">contact</Link>. Erorile concrete (cifre greșite, articole citate inexact) sunt prioritate maximă și se corectează rapid.
            </p>
        </Section>

        <Section>
            <h2>4. Limitarea răspunderii</h2>
            <p>
              Operatorul site-ului nu este responsabil pentru decizii financiare, fiscale sau de altă natură luate de utilizator pe baza informațiilor obținute de pe salariile.ro. Utilizatorul este singurul responsabil pentru verificarea independentă a informațiilor înainte de a le folosi în orice scop oficial (negocieri salariale, declarații fiscale, planificare financiară etc.).
            </p>
            <p>
              În măsura permisă de legislația aplicabilă, nu se asumă răspunderea pentru:
            </p>
            <ul>
              <li>Erori de calcul rezultate din diferențe între cazul standard și situații individuale</li>
              <li>Daune directe sau indirecte rezultate din utilizarea informațiilor publicate</li>
              <li>Indisponibilitatea temporară a site-ului din motive tehnice</li>
              <li>Modificări ale informațiilor publicate fără notificare prealabilă</li>
            </ul>
        </Section>

        <Section>
            <h2>5. Drepturi de autor</h2>
            <p>
              Conținutul editorial al site-ului (textele explicative, structura informațiilor și materialele vizuale originale) este proprietatea operatorului și este protejat de Legea 8/1996 privind dreptul de autor.
            </p>
            <p>
              Utilizarea informațiilor publicate este permisă gratuit pentru uz personal (calcul propriu, informare, planificare individuală). Republicarea integrală a articolelor sau preluarea structurii editoriale fără permisiune nu este permisă. Pentru cereri de utilizare extinsă (citare în publicații, integrare educațională, reproducere în alte medii), scrie la adresa de pe pagina de <Link href="/contact">contact</Link>.
            </p>
            <p>
              Codul software original publicat în repository-ul GitHub al proiectului este disponibil separat sub Apache License 2.0, în limitele descrise în fișierul <code>LICENSING.md</code>. Licența software nu include automat textele editoriale, materialele vizuale, numele, domeniul, logo-ul sau identitatea salariile.ro.
            </p>
            <p>
              Cifrele și valorile fiscale (salariu minim, cote contribuții etc.) provin din acte normative publice și pot fi reutilizate liber, cu mențiunea sursei legale (HG, OUG, articol Cod Fiscal etc.). Nu este necesară citarea salariile.ro pentru aceste informații publice.
            </p>
        </Section>

        <Section>
            <h2>6. Linkuri către alte site-uri</h2>
            <p>
              Site-ul include linkuri către surse oficiale (Monitorul Oficial, ANAF, MMUNCII, INS) și ocazional către alte resurse externe relevante. Operatorul nu este responsabil pentru conținutul, disponibilitatea sau practicile de confidențialitate ale acestor site-uri externe.
            </p>
        </Section>

        <Section>
            <h2>7. Date personale</h2>
            <p>
              Prelucrarea datelor personale este descrisă separat în <Link href="/politica-confidentialitate">politica de confidențialitate</Link>. Pe scurt: site-ul nu afișează reclame; Google Analytics respectă alegerea din bannerul Google prin Consent Mode, iar refuzul nu limitează nicio funcție.
            </p>
        </Section>

        <Section>
            <h2 id="anunturi">8. Anunțurile de angajare</h2>
            <p>
              Oricine angajează poate adăuga gratuit, fără cont, un anunț de angajare pe <Link href="/adauga-anunt-angajare">salariile.ro</Link>. Anunțul se publică după confirmarea din emailul primit și rămâne 30 de zile; din același link se modifică, se prelungește sau se șterge oricând.
            </p>
            <p>Un anunț se publică numai dacă:</p>
            <ul>
              <li>are salariul lunar, cu baza spusă (brut sau net), cel puțin cât salariul minim pe economie, proporțional la normă parțială;</li>
              <li>descrie un loc de muncă real, în România, al angajatorului care îl publică sau pentru care are dreptul să recruteze;</li>
              <li>nu cere o anumită vârstă, un anumit sex, stare civilă, etnie sau alte criterii interzise de Codul muncii (art. 5) și de OG 137/2000;</li>
              <li>nu cere bani candidaților, sub nicio formă (Legea 156/2000), și nu promovează scheme de câștig, investiții sau activități ilegale;</li>
              <li>are telefonul la care candidații pot suna sau, la un număr de mobil, scrie pe WhatsApp.</li>
            </ul>
            <p>
              Cel care publică anunțul răspunde de adevărul lui și are acordul angajatorului pentru datele de contact afișate. Salariile.ro nu intermediază angajarea, nu primește CV-uri și nu verifică identitatea angajatorilor; verifică automat regulile de mai sus înainte de publicare. Salariul din anunțuri poate fi folosit, fără date de contact, în cifrele agregate de pe paginile meseriilor.
            </p>
            <p>
              Orice anunț poate fi raportat din pagina lui. Anunțurile care încalcă regulile sau legea sunt scoase; la trei raportări nerezolvate, anunțul se suspendă automat până la verificare. Cel care l-a publicat primește motivul pe email. Punctul de contact pentru autorități și pentru utilizatori, conform Regulamentului (UE) 2022/2065 privind serviciile digitale, este <a href="mailto:contact@salariile.ro">contact@salariile.ro</a>, în română sau engleză.
            </p>
        </Section>

        <Section>
            <h2>9. Modificări ale termenilor</h2>
            <p>
              Acești termeni pot fi modificați periodic. Modificările semnificative vor fi marcate vizibil pe homepage înainte de a intra în vigoare. Continuarea utilizării site-ului după publicarea unei versiuni noi reprezintă acceptarea acesteia. Versiunea în vigoare este menționată în antetul paginii cu data corespunzătoare.
            </p>
        </Section>

        <Section>
            <h2>10. Legislația aplicabilă și soluționarea litigiilor</h2>
            <p>
              Acești termeni sunt guvernați de legislația din România. Orice litigiu legat de utilizarea site-ului va fi soluționat conform procedurilor de drept român, în fața instanțelor competente teritorial conform regulilor din Codul de procedură civilă.
            </p>
            <p>
              Pentru reclamații prealabile, recomand contactul direct la adresa de pe pagina de <Link href="/contact">contact</Link>. Răspund la toate reclamațiile rezonabile în maximum 30 de zile.
            </p>
            <p className="source-note">Ultima actualizare: 11 mai 2026.</p>
        </Section>
      </div>
    </>
  );
}
