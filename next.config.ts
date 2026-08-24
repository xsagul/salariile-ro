import type { NextConfig } from "next";

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
          // NOTE: Link header (RFC 8288) e setat din middleware ca să se aplice
          // DOAR pe răspunsurile HTML/dynamic (nu pe asseturi statice — nu are
          // sens să trimitem hint-uri de sitemap pe fiecare .png/.woff2/.svg).
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
        source: "/(.*)\\.(ico|png|svg|jpg|jpeg|webp|woff2)",
        headers: [
          // Fișierele din public/ nu au hash în nume. Un TTL finit permite
          // înlocuirea imaginilor OG/hero fără ca browserul să țină un an copia veche.
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },

  // Analytics proprii (Umami), servite prin domeniul propriu.
  //
  // De ce proxy și nu scriptul direct de pe instanța Umami: blocantele de
  // reclame taie cererile către domenii cunoscute de analytics, dar lasă
  // domeniul site-ului. În plus, scriptul își deduce singur endpointul din
  // propriul `src`, deci servit de la /stats.js va trimite la /api/send —
  // same-origin, adică `default-src 'self'` din CSP acoperă totul fără nicio
  // excepție adăugată. Exact opusul situației de la Google Analytics.
  async rewrites() {
    const umami = "https://umami-salariile.vercel.app";
    return [
      { source: "/stats.js", destination: `${umami}/script.js` },
      { source: "/api/send", destination: `${umami}/api/send` },
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
