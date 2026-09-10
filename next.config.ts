import type { NextConfig } from "next";
import { CSP_PAGINI_PUBLICE, LINK_HEADER } from "./src/lib/csp";

const nextConfig: NextConfig = {

  // Nu expunem implementarea frameworkului în răspunsurile HTTP.
  poweredByHeader: false,

  // Compresie automată
  compress: true,

  // Headers pentru SEO și performance
  async headers() {
    return [
      {
        // Toate rutele, CU EXCEPȚIA /widget/frame (widgetul embeddabil, care
        // trebuie să poată rula în <iframe> pe alte site-uri — acolo framing-ul
        // e controlat prin CSP frame-ancestors din middleware, nu X-Frame-Options).
        source: "/((?!widget/frame).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
          // Headere noi adăugate pentru securitate maximă (Lighthouse):
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" }
          // NOTE: CSP și Link (RFC 8288) sunt în blocul de mai jos, restrâns la
          // căile fără extensie — nu are sens să trimitem hint-uri de sitemap pe
          // fiecare .png/.woff2/.svg. Până pe 10 septembrie 2026 veneau din
          // middleware, care se invoca la fiecare cerere HTML.
        ],
      },
      {
        // Widgetul embeddabil: aceleași headere de securitate, fără X-Frame-Options.
        source: "/widget/frame",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        // Generatorul de fluturaș are o pagină iframe dedicată, separată de landing.
        source: "/widget/frame/fluturas",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        // --- CSP + Link pe paginile publice ------------------------------
        // Mutate aici din `src/proxy.ts` pe 10 septembrie 2026. Sunt siruri
        // CONSTANTE: nu depind de cerere, deci nu au ce cauta intr-o functie
        // invocata la fiecare cerere HTML, boti inclusi.
        //
        // `[^.]*` = doar caile fara punct, adica exact ce prindea si matcher-ul
        // vechi al proxy-ului (care excludea `.*\..*`). Asseturile din public/
        // raman, ca si inainte, fara aceste headere.
        //
        // `widget/frame` e exclus: acolo CSP-ul are nonce per cerere si ramane
        // in proxy, singurul loc unde chiar e nevoie de cerere.
        source: "/((?!widget/frame|api/|_next/)[^.]*)",
        // `missing` oglindeste exact matcher-ul din proxy: cererile care cer
        // markdown sunt rescrise catre /api/markdown, care isi pune propriul
        // header `Link` cu rel="canonical". Fara conditia asta, Link-ul de aici
        // l-ar suprascrie si agentii ar pierde canonicalul.
        missing: [{ type: "header" as const, key: "accept", value: ".*text/markdown.*" }],
        headers: [
          { key: "Content-Security-Policy", value: CSP_PAGINI_PUBLICE },
          { key: "Link", value: LINK_HEADER },
        ],
      },
      {
        // Deploy-urile de preview nu trebuie indexate. Era tot in proxy, pe
        // baza header-ului `host`; `has` face acelasi lucru la nivel de CDN.
        source: "/(.*)",
        has: [{ type: "host" as const, value: ".*\\.vercel\\.app" }],
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/(.*)\\.(ico|png|svg|jpg|jpeg|webp|woff2)",
        headers: [
          // Fișierele din public/ nu au hash în nume. Un TTL finit permite
          // înlocuirea imaginilor OG/hero fără ca browserul să țină un an copia veche.
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // ─── Redirect-uri permanente pentru URL-uri vechi (păstrează SEO juice) ───
      // Acestea au intent clar: utilizatorul caută calculator → îl ducem pe homepage.
      {
        source: "/calculator-salariu",
        destination: "/",
        permanent: true,
      },
      {
        source: "/calcul-salariu-net",
        destination: "/",
        permanent: true,
      },
      {
        source: "/calculator",
        destination: "/",
        permanent: true,
      },

      // Consolidare: pagina „net" a fost absorbită în pilonul /salariu-minim
      // (secțiunea #net). Redirect permanent ca să nu pierdem autoritatea URL-ului.
      {
        source: "/salariu-minim/net",
        destination: "/salariu-minim",
        permanent: true,
      },

      // ─── Redirectele către /info au fost ELIMINATE (30 aprilie 2026) ─────────
      // Motivul: /info e noindex, deci Google marca lanțul "redirect → pagină
      // neindexabilă", afectând crawl budget și generând mesaje GSC.
      //
      // URL-urile afectate (acum returnează 404 natural):
      //   /politica-confidentialitate
      //   /termeni
      //   /calculator-pfa
      //   /calculator-concediu
      //   /noutati
      //
      // Pe măsură ce construim aceste pagini real, le adăugăm ca rute Next.js,
      // nu ca redirecte. Google va re-indexa automat cu conținut real.
    ];
  },
};

export default nextConfig;
