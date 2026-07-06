// app/widget/page.tsx
// Pagina publică a widgetului embeddabil: demo live, codul de integrare (copiabil),
// condiții de folosire și FAQ. Aceasta e pagina indexabilă; conținutul iframe-ului
// trăiește la /widget/frame (noindex, frame-ancestors *).

import type { Metadata } from "next";
import { ogPage, twPage } from "@/lib/seo";
import { Hero, Breadcrumb, H1, Lead, Section, Faq } from "@/app/components/ui";
import EmbedCode from "@/app/components/EmbedCode";
import WidgetDemo from "@/app/components/WidgetDemo";

const TITLU = "Widget Calculator Salariu";
const DESC =
  "Widget gratuit pentru calculator salariu net și brut. Îl adaugi pe site-ul tău cu un simplu copy-paste și se actualizează automat la schimbările legislative.";

export const metadata: Metadata = {
  title: TITLU,
  description: DESC,
  alternates: { canonical: "https://salariile.ro/widget" },
  openGraph: ogPage({ title: TITLU, description: DESC, path: "/widget" }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const CREDIT_CODE = `<a class="salariile-credit" href="https://salariile.ro?utm_source=widget"
  target="_blank" rel="noopener"
  style="display:block;max-width:420px;margin-top:8px;font:14px/1.4 system-ui,sans-serif;color:#57534e">
  Calculator de salarii oferit de salariile.ro
</a>`;

const EMBED_CODE = `<div class="salariile-widget">
  ${CREDIT_CODE}
</div>
<script src="https://salariile.ro/widget.js" async></script>`;

// Alternativă simplă (iframe direct), pentru cine preferă zero JavaScript. Înălțimea
// e fixă; ajusteaz-o din atributul height dacă e nevoie.
const EMBED_CODE_IFRAME = `<iframe src="https://salariile.ro/widget/frame"
  width="100%" height="790" loading="lazy" scrolling="no"
  style="border:1px solid #e7e5e4;border-radius:8px;max-width:420px;display:block;box-sizing:border-box"
  title="Calculator salariu net 2026"></iframe>
${CREDIT_CODE}`;

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
    q: "Trebuie să păstrez linkul către salariile.ro?",
    a: "Da. Linkul de credit trebuie păstrat când preiei widgetul. Este modul simplu prin care proiectul rămâne gratuit, fără cont și fără reclame.",
  },
  {
    q: "Trebuie să fixez înălțimea?",
    a: "Nu, dacă folosești varianta recomandată (div + script): widgetul își comunică singur înălțimea paginii tale și se dimensionează automat, pe orice ecran. Doar la varianta cu iframe simplu înălțimea e fixă și o poți ajusta din atributul height.",
  },
  {
    q: "Pot porni calculatorul cu o valoare anume?",
    a: "Da. Adaugă data-brut pe div, de exemplu <div class=\"salariile-widget\" data-brut=\"4325\"></div>, iar widgetul se încarcă direct cu acel salariu brut calculat.",
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
        <H1>Widget Calculator Salariu</H1>
        <Lead>
          Widget gratuit, adaugă calculatorul de salariu net și brut pe site-ul tău. Un copy-paste și vizitatorii
          tăi calculează salariul direct la tine pe site, cu taxele defalcate și procentul care pleacă la stat.
          Calculul rămâne mereu corect: la fiecare schimbare legislativă, widgetul se actualizează singur.
        </Lead>
      </Hero>

      <Section noTopBorder>
        <h2>Cum arată</h2>
        <p>
          Demo-ul de mai jos e chiar widgetul, exact cum va apărea pe site-ul tău. Introdu un brut și încearcă-l:
        </p>
        <div className="my-6">
          <WidgetDemo />
        </div>
        <p>
          Aplică aceleași reguli ca site-ul, actualizat mereu cu legislația curentă aplicabilă. Formulele complete
          sunt publice pe <a href="/metodologie">pagina de metodologie</a>.
        </p>
      </Section>

      <Section>
        <h2>Codul de integrare</h2>
        <h3>Metoda 1: iframe simplu</h3>
        <p>
          Aceasta este varianta cea mai ușor de integrat. Copiază tot codul și lipește-l în pagina ta, unde vrei să
          apară calculatorul. Înălțimea este fixă și se ajustează manual din atributul <code>height</code>:
        </p>
        <div className="my-6">
          <EmbedCode code={EMBED_CODE_IFRAME} />
        </div>
        <p>
          Păstrează rândul cu creditul când preiei widgetul. Ne ajută să ținem proiectul gratuit, fără cont și
          fără reclame.
        </p>

        <h3 className="mt-8">Metoda 2: script cu dimensionare automată</h3>
        <p>
          Aceasta este varianta recomandată dacă site-ul tău permite scripturi externe. Scriptul injectează iframe-ul,
          îl dimensionează automat și include explicit linkul de credit în codul de mai jos:
        </p>
        <div className="my-6">
          <EmbedCode code={EMBED_CODE} />
        </div>
        <p>
          Poți porni calculatorul cu o valoare din start adăugând <code>data-brut</code> pe div, de exemplu{" "}
          <code>{`<div class="salariile-widget" data-brut="4325"></div>`}</code>. Pentru cerințe speciale
          (dimensiuni, integrare în CMS), scrie-ne la{" "}
          <a href="mailto:contact@salariile.ro">contact@salariile.ro</a>.
        </p>
      </Section>

      <Section>
        <h2>Pentru cine e</h2>
        <ul>
          <li><strong>Firme de contabilitate și salarizare</strong>: clienții calculează singuri scenariile simple, tu rămâi sursa pentru cele complicate.</li>
          <li><strong>Bloguri și site-uri de HR</strong>: articolele despre salarii primesc o unealtă interactivă, nu doar text.</li>
          <li><strong>Portaluri de joburi</strong>: candidații văd „în mână&quot; lângă ofertele afișate în brut.</li>
        </ul>
      </Section>

      <Faq items={FAQ} />
    </>
  );
}
