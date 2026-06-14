// app/contact/page.tsx
// Server Component. Pagina de contact — onest minimal.

import type { Metadata } from "next";
import Link from "next/link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import { Hero, Section, Breadcrumb, H1, Lead } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Contact: raportează erori sau sugestii",
  description:
    "Pagina de contact pentru salariile.ro. Folosește email-ul de mai jos pentru a raporta erori de calcul, a sugera funcționalități noi sau pentru cereri privind datele personale.",
  alternates: { canonical: "https://salariile.ro/contact" },
  openGraph: ogPage({
    title: "Contact: raportează erori sau sugestii",
    description:
      "Scrie-mi pentru a raporta erori de calcul, a sugera funcționalități noi sau pentru cereri privind datele personale.",
    path: "/contact",
  }),
  twitter: twPage({
    title: "Contact: raportează erori sau sugestii",
    description:
      "Scrie-mi pentru a raporta erori de calcul, a sugera funcționalități noi sau cereri privind datele personale.",
  }),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Contact", item: "https://salariile.ro/contact" },
      ],
    },
    {
      "@type": "ContactPage",
      name: "Contact Salariile.ro",
      description:
        "Pagina de contact pentru salariile.ro: email, subiecte potrivite și limitări declarate.",
      url: "https://salariile.ro/contact",
      inLanguage: "ro-RO",
      mainEntity: {
        ...personSchema,
        email: "contact@salariile.ro",
      },
    },
  ],
};

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Contact" }]} />
        <H1>Contact</H1>
        <Lead>
          Salariile.ro este un proiect personal întreținut de un singur om. Cel mai bun mod de contact este prin email.
        </Lead>
      </Hero>

      <main>
        <Section>
            <h2>Adresă de email</h2>
            <p>
              Pentru orice subiect legat de site, scrie la:
            </p>
            <p>
              <strong><a href="mailto:contact@salariile.ro">contact@salariile.ro</a></strong>
            </p>
            <p>
              Răspund la toate mesajele primite, deși timpul de răspuns poate varia de la câteva ore la câteva zile, fiind un proiect personal întreținut în timpul liber. Mesajele primite în weekend sau în zile aglomerate la jobul principal pot avea răspuns mai târziu.
            </p>
        </Section>

        <Section>
            <h2>Ce subiecte sunt potrivite</h2>
            <ul>
              <li>
                <strong>Raportarea erorilor de calcul.</strong> Dacă observi o cifră care nu se potrivește cu fluturașul tău sau cu o sursă oficială, scrie-mi cu detalii (brutul folosit, cifra obținută pe site, cifra corectă, sursa pe care o ai). Erorile concrete au prioritate maximă, de regulă le corectez în aceeași zi.
              </li>
              <li>
                <strong>Sugerări de pagini sau funcționalități noi.</strong> Calculator PFA, calculator concediu medical, pagină dedicată unei prestații sociale specifice etc. Toate sugestiile sunt binevenite și ajută la prioritizarea dezvoltării.
              </li>
              <li>
                <strong>Întrebări despre metodologia de calcul.</strong> Dacă o cifră afișată nu îți este clară sau vrei să înțelegi cum se aplică o regulă fiscală specifică, întreabă. Pagina <Link href="/metodologie">metodologie</Link> acoperă cazurile principale, dar răspund cu plăcere și pe email pentru cazuri specifice.
              </li>
              <li>
                <strong>Cereri privind datele personale (GDPR).</strong> Acces, ștergere, opoziție: vezi pagina <Link href="/politica-confidentialitate">politica de confidențialitate</Link>. Răspund în maximum 30 de zile conform termenului GDPR.
              </li>
              <li>
                <strong>Citarea sau utilizarea conținutului.</strong> Pentru publicații, articole sau resurse educaționale care vor să folosească extinse pasaje din site, scrie-mi pentru clarificarea drepturilor de utilizare.
              </li>
            </ul>
        </Section>

        <Section>
            <h2>Ce nu pot face</h2>
            <p>
              Pentru claritate, există subiecte la care nu pot răspunde util prin email:
            </p>
            <ul>
              <li>
                <strong>Consultanță fiscală individuală.</strong> Nu sunt contabil sau expert fiscal autorizat. Pentru calcule personalizate care țin cont de sporuri, beneficii, scutiri sau cumul de venituri, consultă un specialist autorizat. Camera Consultanților Fiscali sau Corpul Experților Contabili au directoare publice de profesioniști.
              </li>
              <li>
                <strong>Interpretarea juridică a unei dispute cu angajatorul.</strong> Calculatorul îți arată ce ar trebui să rezulte conform legii pentru un caz standard, dar pentru dispute reale (ex. salariul efectiv plătit nu corespunde cu cel calculat) recomand consultarea unui avocat de drept al muncii sau a Inspectoratului Teritorial de Muncă (ITM).
              </li>
              <li>
                <strong>Verificarea individuală a unui fluturaș de plată.</strong> Pot explica de ce o formulă dă un anumit rezultat, dar nu pot verifica detaliat un fluturaș real fără să cunosc toate elementele (sporuri specifice, ore suplimentare, deduceri speciale etc.).
              </li>
            </ul>
        </Section>

        <Section>
            <h2>Mai multe informații</h2>
            <p>
              Despre cine întreține site-ul: <Link href="/despre">pagina Despre</Link>.<br />
              Cum funcționează calculele: <Link href="/metodologie">pagina Metodologie</Link>.<br />
              Datele tale personale: <Link href="/politica-confidentialitate">politica de confidențialitate</Link>.<br />
              Termenii de utilizare: <Link href="/termeni">pagina Termeni</Link>.
            </p>
        </Section>
      </main>
    </>
  );
}
