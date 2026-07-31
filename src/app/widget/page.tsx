// app/widget/page.tsx
// Pagina publică a celor trei widgeturi embeddabile: demo live, codurile de
// integrare, condițiile de folosire și FAQ. Conținutul iframe-urilor trăiește la
// /widget/frame (noindex, frame-ancestors *).

import type { Metadata } from "next";
import { ogPage, twPage } from "@/lib/seo";
import { Hero, Breadcrumb, H1, Lead, Section, Faq } from "@/app/components/ui";
import EmbedCode from "@/app/components/EmbedCode";
import WidgetDemo from "@/app/components/WidgetDemo";

const TITLU = "Widget Calculator Salariu";
const DESC =
  "Trei widgeturi gratuite pentru salarii: calculator minimalist, calculator complet și generator de fluturaș PDF.";

export const metadata: Metadata = {
  title: TITLU,
  description: DESC,
  alternates: { canonical: "https://salariile.ro/widget" },
  openGraph: ogPage({ title: TITLU, description: DESC, path: "/widget" }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const MINIMAL_CREDIT_CODE = `<a class="salariile-credit" href="https://salariile.ro?utm_source=widget"
  target="_blank" rel="noopener"
  style="display:block;max-width:420px;margin:8px auto 0;font:14px/1.4 system-ui,sans-serif;color:#57534e">
  Calculator de salarii oferit de salariile.ro
</a>`;

const MINIMAL_EMBED_CODE = `<iframe src="https://salariile.ro/widget/frame"
  width="100%" height="790" loading="lazy" scrolling="no"
  style="border:1px solid #e7e5e4;border-radius:8px;max-width:420px;display:block;box-sizing:border-box;margin:0 auto"
  title="Calculator salariu net 2026"></iframe>
${MINIMAL_CREDIT_CODE}`;

const COMPLETE_CREDIT_CODE = `<a class="salariile-credit" href="https://salariile.ro?utm_source=widget-complet"
  target="_blank" rel="noopener"
  style="display:block;max-width:1152px;margin:8px auto 0;font:14px/1.4 system-ui,sans-serif;color:#57534e">
  Calculator complet de salarii oferit de salariile.ro
</a>`;

const COMPLETE_EMBED_CODE = `<iframe src="https://salariile.ro/widget/frame?variant=complet"
  width="100%" height="900" loading="lazy"
  style="border:1px solid #e7e5e4;border-radius:8px;max-width:1152px;display:block;box-sizing:border-box;margin:0 auto"
  title="Calculator complet de salarii 2026"></iframe>
${COMPLETE_CREDIT_CODE}`;

const PAYSLIP_CREDIT_CODE = `<a class="salariile-credit" href="https://salariile.ro/fluturas-salariu?utm_source=widget-fluturas"
  target="_blank" rel="noopener"
  style="display:block;max-width:1152px;margin:8px auto 0;font:14px/1.4 system-ui,sans-serif;color:#57534e">
  Generator de fluturaș de salariu oferit de salariile.ro
</a>`;

const PAYSLIP_EMBED_CODE = `<iframe src="https://salariile.ro/widget/frame/fluturas"
  width="100%" height="1000" loading="lazy"
  style="border:1px solid #e7e5e4;border-radius:8px;max-width:1152px;display:block;box-sizing:border-box;margin:0 auto"
  title="Generator fluturaș de salariu 2026"></iframe>
${PAYSLIP_CREDIT_CODE}`;

const FAQ = [
  {
    q: "Cât costă widgeturile?",
    a: "Nimic. Le integrezi liber pe orice site: firmă de contabilitate, blog de HR, portal de joburi sau intranet. Nu cerem cont și nu afișăm reclame în widgeturi.",
  },
  {
    q: "Ce variantă aleg?",
    a: "Widgetul minimalist este potrivit în articole, sidebaruri și coloane înguste. Widgetul complet reproduce calculatorul principal și este potrivit în secțiuni late. Widgetul pentru fluturaș adaugă pontaj, sporuri, rețineri și descărcare PDF, deci funcționează cel mai bine într-o pagină dedicată.",
  },
  {
    q: "Ce se întâmplă când se schimbă legislația?",
    a: "Toate cele trei widgeturi încarcă motorul de calcul direct de pe salariile.ro. Când actualizăm central salariul minim, plafoanele sau deducerile, integrarea ta preia versiunea publicată fără să înlocuiești codul.",
  },
  {
    q: "Trebuie să păstrez linkul către salariile.ro?",
    a: "Da. Linkul de credit trebuie păstrat când preiei un widget. Este modul simplu prin care proiectul rămâne gratuit, fără cont și fără reclame.",
  },
  {
    q: "Trebuie să fixez înălțimea?",
    a: "Da. Varianta minimalistă folosește 790 px, cea completă 900 px, iar generatorul de fluturaș 1.000 px. Ultimele două permit derularea în interior când opțiunile avansate sunt deschise sau coloanele se stivuiesc pe mobil. Poți ajusta atributul height pentru pagina ta.",
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
          Adaugă gratuit pe site-ul tău un calculator de salariu net și brut sau generatorul de fluturaș PDF. Alege
          varianta minimalistă pentru articole, calculatorul complet pentru o secțiune lată ori generatorul pentru
          o pagină dedicată. Toate folosesc același motor fiscal actualizat central de salariile.ro.
        </Lead>
      </Hero>

      <Section noTopBorder>
        <h2>Widget minimalist</h2>
        <p>
          Varianta compactă este potrivită în articole, sidebaruri și coloane de până la 420 px. Introdu un salariu
          și încearc-o chiar aici:
        </p>
        <div className="my-6">
          <WidgetDemo />
        </div>
        <h3>Codul widgetului minimalist</h3>
        <p>
          Copiază tot codul și lipește-l în pagina ta, unde vrei să apară calculatorul. Înălțimea se poate ajusta
          manual din atributul <code>height</code>.
        </p>
        <div className="my-6">
          <EmbedCode code={MINIMAL_EMBED_CODE} />
        </div>
        <p>
          Aplică aceeași versiune a regulilor fiscale publicată pe site. Formulele complete sunt publice pe pagina
          de <a href="/metodologie">metodologie</a>.
        </p>
      </Section>

      <Section wide>
        <h2>Widget complet</h2>
        <p className="max-w-3xl">
          Varianta completă reproduce calculatorul principal de pe homepage: formularul cu opțiuni avansate și
          tabelul detaliat al rezultatului. Este recomandată pentru pagini dedicate și zone late.
        </p>
        <div className="my-6">
          <WidgetDemo variant="complet" />
        </div>
        <div className="max-w-3xl">
          <h3>Codul widgetului complet</h3>
          <p>
            Copiază tot codul de mai jos. Pe ecrane înguste calculatorul se adaptează și permite derularea în
            interiorul iframe-ului, fără să lărgească pagina gazdă.
          </p>
        </div>
        <div className="my-6">
          <EmbedCode code={COMPLETE_EMBED_CODE} />
        </div>
      </Section>

      <Section wide>
        <h2>Widget fluturaș de salariu</h2>
        <p className="max-w-3xl">
          Această variantă reutilizează generatorul de pe pagina <a href="/fluturas-salariu">Fluturaș de salariu</a>.
          Include salariul de bază, pontajul, orele suplimentare, sporurile, tichetele, reținerile și descărcarea
          fluturașului în format PDF. Este recomandată pentru o pagină dedicată sau o zonă lată.
        </p>
        <div className="my-6">
          <WidgetDemo variant="fluturas" />
        </div>
        <div className="max-w-3xl">
          <h3>Codul widgetului pentru fluturaș</h3>
          <p>
            Codul folosește o pagină iframe separată de landingul public. Generatorul se adaptează pe mobil și
            păstrează derularea internă pentru formularul avansat și rezultatul complet.
          </p>
        </div>
        <div className="my-6">
          <EmbedCode code={PAYSLIP_EMBED_CODE} />
        </div>
        <p className="max-w-3xl">
          Păstrează rândul cu creditul când preiei oricare dintre cele trei widgeturi. Ne ajută să ținem proiectul gratuit,
          fără cont și fără reclame. Pentru dimensiuni speciale sau integrare într-un CMS, scrie-ne la{" "}
          <a href="mailto:contact@salariile.ro">contact@salariile.ro</a>.
        </p>
      </Section>

      <Section>
        <h2>Pentru cine sunt</h2>
        <ul>
          <li><strong>Firme de contabilitate și salarizare</strong>: clienții calculează singuri scenariile simple, iar tu rămâi sursa pentru cele complicate.</li>
          <li><strong>Bloguri și site-uri de HR</strong>: articolele despre salarii primesc o unealtă interactivă, nu doar text.</li>
          <li><strong>Portaluri de joburi</strong>: candidații văd suma „în mână” lângă ofertele afișate în brut.</li>
        </ul>
      </Section>

      <Faq items={FAQ} />
    </>
  );
}
