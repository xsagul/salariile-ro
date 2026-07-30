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
  "Widget gratuit pentru calculator salariu net și brut. Îl adaugi prin copy-paste și folosește central versiunea curentă a motorului salariile.ro.";

export const metadata: Metadata = {
  title: TITLU,
  description: DESC,
  alternates: { canonical: "https://salariile.ro/widget" },
  openGraph: ogPage({ title: TITLU, description: DESC, path: "/widget" }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const CREDIT_CODE = `<a class="salariile-credit" href="https://salariile.ro?utm_source=widget"
  target="_blank" rel="noopener"
  style="display:block;max-width:420px;margin:8px auto 0;font:14px/1.4 system-ui,sans-serif;color:#57534e">
  Calculator de salarii oferit de salariile.ro
</a>`;

// Integrare directă prin iframe. Înălțimea este fixă și poate fi ajustată din
// atributul height dacă este nevoie.
const EMBED_CODE_IFRAME = `<iframe src="https://salariile.ro/widget/frame"
  width="100%" height="790" loading="lazy" scrolling="no"
  style="border:1px solid #e7e5e4;border-radius:8px;max-width:420px;display:block;box-sizing:border-box;margin:0 auto"
  title="Calculator salariu net 2026"></iframe>
${CREDIT_CODE}`;

const FAQ = [
  {
    q: "Cât costă widgetul?",
    a: "Nimic. Îl integrezi liber pe orice site: firmă de contabilitate, blog de HR, portal de joburi, intranet. Nu cerem cont, nu afișăm reclame în widget.",
  },
  {
    q: "Ce se întâmplă când se schimbă legislația?",
    a: "Widgetul încarcă motorul de calcul direct de pe salariile.ro. Când actualizăm central regulile fiscale — salariul minim, plafoanele sau deducerile — integrarea ta preia versiunea publicată fără să fie nevoie să înlocuiești codul de embed.",
  },
  {
    q: "Trebuie să păstrez linkul către salariile.ro?",
    a: "Da. Linkul de credit trebuie păstrat când preiei widgetul. Este modul simplu prin care proiectul rămâne gratuit, fără cont și fără reclame.",
  },
  {
    q: "Trebuie să fixez înălțimea?",
    a: "Da. Codul folosește o înălțime de 790 px, potrivită pentru afișarea completă a calculatorului. O poți ajusta din atributul height dacă designul paginii tale o cere.",
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
          Widgetul folosește motorul publicat central de salariile.ro, iar integrarea preia modificările când actualizăm motorul.
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
          Aplică aceeași versiune a regulilor fiscale publicată pe site. Formulele complete
          sunt publice pe <a href="/metodologie">pagina de metodologie</a>.
        </p>
      </Section>

      <Section>
        <h2>Codul de integrare</h2>
        <p>
          Copiază tot codul și lipește-l în pagina ta, unde vrei să
          apară calculatorul. Înălțimea este fixă și se ajustează manual din atributul <code>height</code>:
        </p>
        <div className="my-6">
          <EmbedCode code={EMBED_CODE_IFRAME} />
        </div>
        <p>
          Păstrează rândul cu creditul când preiei widgetul. Ne ajută să ținem proiectul gratuit, fără cont și
          fără reclame.
        </p>
        <p>
          Pentru cerințe speciale (dimensiuni sau integrare în CMS), scrie-ne la{" "}
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
