// app/widget/page.tsx
// Pagina publică a widgetului embeddabil: demo live, codul de integrare (copiabil),
// condiții de folosire și FAQ. Aceasta e pagina indexabilă; conținutul iframe-ului
// trăiește la /widget/frame (noindex, frame-ancestors *).

import type { Metadata } from "next";
import { ogPage, twPage } from "@/lib/seo";
import { Hero, Breadcrumb, H1, Lead, Section, Faq } from "@/app/components/ui";
import EmbedCode from "@/app/components/EmbedCode";
import WidgetDemo from "@/app/components/WidgetDemo";

const TITLU = "Widget calculator de salarii pentru site-ul tău";
const DESC =
  "Integrează calculatorul de salariu net pe site-ul firmei tale cu un simplu copy-paste. Se actualizează automat la fiecare schimbare legislativă, fără mentenanță din partea ta.";

export const metadata: Metadata = {
  title: TITLU,
  description: DESC,
  alternates: { canonical: "https://salariile.ro/widget" },
  openGraph: ogPage({ title: TITLU, description: DESC, path: "/widget" }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

// Metoda recomandată (hibrid, ca la Calendly/Typeform): un div placeholder + scriptul
// nostru. Scriptul injectează iframe-ul, îl dimensionează automat (fără height fix,
// se potrivește pe orice ecran) și adaugă linkul de credit în pagina ta.
const EMBED_CODE = `<div class="salariile-widget"></div>
<script src="https://salariile.ro/widget.js" async></script>`;

// Alternativă simplă (iframe direct), pentru cine preferă zero JavaScript. Înălțimea
// e fixă; ajusteaz-o din atributul height dacă e nevoie.
const EMBED_CODE_IFRAME = `<iframe src="https://salariile.ro/widget/frame"
  width="100%" height="560" loading="lazy" scrolling="no"
  style="border:1px solid #e7e5e4;border-radius:8px;max-width:420px"
  title="Calculator salariu net 2026"></iframe>
<p style="font-size:14px;margin-top:8px">
  Calculator de salarii oferit de
  <a href="https://salariile.ro" target="_blank" rel="noopener">salariile.ro</a>
</p>`;

const FAQ = [
  {
    q: "Cât costă widgetul?",
    a: "Nimic. Îl integrezi liber pe orice site: firmă de contabilitate, blog de HR, portal de joburi, intranet. Nu cerem cont, nu afișăm reclame în widget.",
  },
  {
    q: "Ce se întâmplă când se schimbă legislația?",
    a: "Widgetul folosește exact motorul de calcul al site-ului salariile.ro, care se actualizează la fiecare modificare legislativă (salariu minim, plafoane, deduceri). Site-ul tău afișează automat calculul corect, fără nicio intervenție.",
  },
  {
    q: "Pot scoate linkul către salariile.ro?",
    a: "Da, linkul de sub widget e în pagina ta și îl poți elimina. Îl oferim ca modalitate de creditare a sursei și ne ajută să ținem proiectul gratuit, dar rămâne alegerea ta.",
  },
  {
    q: "Trebuie să fixez înălțimea?",
    a: "Nu, dacă folosești varianta recomandată (div + script): widgetul își comunică singur înălțimea paginii tale și se dimensionează automat, pe orice ecran. Doar la varianta cu iframe simplu înălțimea e fixă și o poți ajusta din atributul height.",
  },
  {
    q: "Pot porni calculatorul cu o valoare anume?",
    a: "Da. Adaugă data-brut pe div, de exemplu <div class=\"salariile-widget\" data-brut=\"5000\"></div>, iar widgetul se încarcă direct cu acel salariu brut calculat.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Widget calculator salarii", item: "https://salariile.ro/widget" },
      ],
    },
    {
      "@type": "WebPage",
      name: TITLU,
      description: DESC,
      url: "https://salariile.ro/widget",
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

export default function WidgetPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Widget" }]} />
        <H1>Calculatorul de salarii, pe site-ul tău</H1>
        <Lead>
          Un copy-paste și vizitatorii tăi calculează salariul net direct la tine pe site, cu taxele defalcate
          și procentul care pleacă la stat. Calculul rămâne mereu corect: la fiecare schimbare legislativă,
          widgetul se actualizează singur.
        </Lead>
      </Hero>

      <Section>
        <h2>Cum arată</h2>
        <p>
          Demo-ul de mai jos e chiar widgetul, exact cum va apărea pe site-ul tău. Introdu un brut și încearcă-l:
        </p>
        <div className="my-6">
          <WidgetDemo />
        </div>
        <p>
          Aplică aceleași reguli ca site-ul: facilitatea de 200 de lei la salariul minim cu plafonul de 4.600 lei,
          deducerea personală cu rotunjirea actuală și contribuțiile la zi, conform HG 146/2026 și OUG 89/2025.
          Formulele complete sunt publice pe <a href="/metodologie">pagina de metodologie</a>.
        </p>
      </Section>

      <Section>
        <h2>Codul de integrare</h2>
        <p>
          Copiază codul și lipește-l în pagina ta, unde vrei să apară calculatorul. Această variantă se
          dimensionează automat, se potrivește pe orice ecran și adaugă singură linkul de credit:
        </p>
        <div className="my-6">
          <EmbedCode code={EMBED_CODE} />
        </div>
        <p>
          Poți porni calculatorul cu o valoare din start adăugând <code>data-brut</code> pe div, de exemplu{" "}
          <code>{`<div class="salariile-widget" data-brut="5000"></div>`}</code>.
        </p>

        <h3 className="mt-8">Preferi un iframe simplu, fără JavaScript?</h3>
        <p>Merge și așa. Singura diferență: înălțimea e fixă (o ajustezi din atributul <code>height</code>):</p>
        <div className="my-6">
          <EmbedCode code={EMBED_CODE_IFRAME} />
        </div>
        <p>
          Rândul cu creditul e opțional, dar ne ajută să ținem proiectul gratuit și fără reclame. Pentru
          cerințe speciale (dimensiuni, integrare în CMS), scrie-ne la{" "}
          <a href="mailto:contact@salariile.ro">contact@salariile.ro</a>.
        </p>
      </Section>

      <Section>
        <h2>Pentru cine e</h2>
        <ul>
          <li><strong>Firme de contabilitate și salarizare</strong>: clienții calculează singuri scenariile simple, tu rămâi sursa pentru cele complicate.</li>
          <li><strong>Bloguri și site-uri de HR</strong>: articolele despre salarii primesc o unealtă interactivă, nu doar text.</li>
          <li><strong>Portaluri de joburi</strong>: candidații văd „în mână" lângă ofertele afișate în brut.</li>
        </ul>
      </Section>

      <Faq items={FAQ} />
    </>
  );
}
