// app/not-found.tsx
// Server Component. Pagina 404 custom — apare automat când Next.js
// nu găsește o rută. Conform App Router file convention.

import type { Metadata } from "next";
import Link from "next/link";
import { Hero, Section, H1, Lead, Eyebrow } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Pagina nu există · salariile.ro",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Hero>
        <Eyebrow>EROARE 404</Eyebrow>
        <H1>Pagina căutată nu există</H1>
        <Lead>
          Linkul pe care l-ai accesat este greșit, expirat sau pagina a fost mutată. Cele mai utile pagini ale site-ului sunt mai jos.
        </Lead>
      </Hero>

      <main>
        <Section>
            <h2>Pagini frecvent accesate</h2>
            <ul>
              <li>
                <Link href="/"><strong>Calculator salariu net</strong></Link> — calculează brut → net sau net → brut pentru orice sumă, conform legislației 2026.
              </li>
              <li>
                <Link href="/salariu-minim"><strong>Salariul minim 2026</strong></Link> — valorile semestriale (4.050 → 4.325 lei), calcul net detaliat, plafoane fiscale.
              </li>
              <li>
                <Link href="/salariu-mediu"><strong>Salariul mediu pe economie 2026</strong></Link> — valoarea oficială (9.192 lei) conform Legii 44/2026.
              </li>
              <li>
                <Link href="/metodologie"><strong>Metodologia de calcul</strong></Link> — formulele și sursele exacte din Codul Fiscal.
              </li>
              <li>
                <Link href="/despre"><strong>Despre proiect</strong></Link> — cine întreține site-ul și de ce a apărut.
              </li>
            </ul>
        </Section>

        <Section>
            <h2>Dacă crezi că ai ajuns aici dintr-un link de pe acest site</h2>
            <p>
              Toate linkurile interne sunt verificate, dar pot apărea erori. Dacă ai ajuns la această pagină dintr-un link de pe salariile.ro (nu dintr-un link extern sau o căutare Google veche), te rog să-mi scrii la adresa de pe pagina de <Link href="/contact">contact</Link> cu URL-ul exact unde ai dat click — corectez problema rapid.
            </p>
        </Section>
      </main>
    </>
  );
}
