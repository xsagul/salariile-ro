// Șablonul paginilor de anunțuri (28 septembrie 2026). Nu e o pagină publică: Worker-ul
// (worker/pagini.ts) îl ia din assets și îi pune titlul, descrierea, canonicul, robots și
// conținutul în [data-anunturi-continut]. Cererile directe la /locuri-de-munca/sablon primesc 404.
import type { Metadata } from "next";
import { SPATIU_JOS, SPATIU_SUS } from "@/app/components/ui";

export const metadata: Metadata = {
  title: { absolute: "Locuri de muncă | Salariile" },
  description: "Anunțuri de angajare cu salariul scris.",
  alternates: { canonical: "https://salariile.ro/locuri-de-munca" },
  robots: { index: false, follow: true },
  openGraph: { title: "Locuri de muncă", description: "Anunțuri de angajare cu salariul scris.", url: "https://salariile.ro/locuri-de-munca", siteName: "Salariile", locale: "ro_RO", type: "website" },
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
