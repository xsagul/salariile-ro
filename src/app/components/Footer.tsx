// src/app/components/Footer.tsx
// Footer global. Server Component pur (zero JS la client)
// pentru că e static și nu are nevoie de interactivitate.

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <Link href="/" className="logo">
            salariile<span>.ro</span>
          </Link>
          <p>
            Informații și instrumente despre salariile din România.
            <br />
            Calculele au caracter orientativ. Consultați un specialist contabil
            pentru situații complexe.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Calculatoare</h4>
            <Link href="/">Calculator salariu net</Link>
            <Link href="/calculator-pfa">Calculator PFA</Link>
            <Link href="/calculator-concediu">Calculator concediu medical</Link>
          </div>
          <div>
            <h4>Informații</h4>
            <Link href="/salariu-minim">Salariu minim 2026</Link>
            <Link href="/salariu-mediu">Salariu mediu 2026</Link>
            <Link href="/noutati">Noutăți legislative</Link>
          </div>
          <div>
            <h4>Legal</h4>
            <Link href="/politica-confidentialitate">Politică confidențialitate</Link>
            <Link href="/termeni">Termeni și condiții</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Salariile.ro — Actualizat conform
            legislației fiscale în vigoare
          </p>
        </div>
      </div>
    </footer>
  );
}
