// Șablonul paginilor de anunțuri (28 septembrie 2026). Nu e o pagină publică: Worker-ul
// (worker/pagini.ts) îl ia din assets, înlocuiește marcajele MARCAJE și pune conținutul în
// [data-anunturi-continut]. Cererile directe la /locuri-de-munca/sablon primesc 404.
//
// Marcajele, nu valori obișnuite: metadatele apar de două ori în pagină, în <head> și în datele
// din care React își refă <head> la pornire. Cu valori obișnuite, Worker-ul schimba numai prima
// copie, iar după hidratare anunțul primea titlul șablonului, un al doilea canonical spre
// /locuri-de-munca și „noindex” (proba în browser, 28 septembrie 2026).
import type { Metadata } from "next";
import { SPATIU_JOS, SPATIU_SUS } from "@/app/components/ui";
import { MARCAJE as M } from "@/lib/anunturi/sablon";

export const metadata: Metadata = {
  title: { absolute: M.titlu },
  description: M.descriere,
  alternates: { canonical: M.canonic },
  robots: M.robots,
  openGraph: { title: M.titluScurt, description: M.descriere, url: M.canonic, siteName: "Salariile", locale: "ro_RO", type: "website", images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: M.titluScurt, description: M.descriere, images: ["/og-image.png"] },
};

export default function SablonAnunturi() {
  return (
    <div className="bg-canvas">
      {/* Conținutul îl pune Worker-ul. Fără dangerouslySetInnerHTML, React vedea la hidratare un div
          gol în componentă și unul plin în pagină, și îl golea (proba locală, 28 septembrie 2026);
          HTML-ul intern dat astfel nu se compară și rămâne cum l-a trimis serverul. */}
      <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${SPATIU_SUS} ${SPATIU_JOS}`} data-anunturi-continut="" dangerouslySetInnerHTML={{ __html: "" }} suppressHydrationWarning />
    </div>
  );
}
