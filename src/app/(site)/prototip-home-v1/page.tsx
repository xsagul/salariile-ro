import type { Metadata } from "next";
import CalculatorSalariu from "@/app/components/CalculatorSalariu";

export const metadata: Metadata = {
  title: "Prototip homepage V1",
  robots: { index: false, follow: false },
};

export default function PrototipHomeV1() {
  return (
    <div data-prototip-v1>
      <style>{`
        /* V1: aceeași logică și același conținut, doar densitate mai bună. */
        [data-prototip-v1] > section:first-of-type > div {
          padding-top: 1.5rem;
          padding-bottom: 1.5rem;
        }

        [data-prototip-v1] > section:first-of-type h1 {
          margin-bottom: .5rem;
          line-height: 1.05;
        }

        [data-prototip-v1] > section:first-of-type p {
          max-width: 42rem;
        }

        [data-prototip-v1] #calc-layout {
          gap: 1rem;
          padding-top: 1.5rem;
          padding-bottom: 2rem;
        }

        [data-prototip-v1] #calc-layout > form,
        [data-prototip-v1] #rezultat-calcul {
          padding: 1rem;
          box-shadow: none;
        }

        [data-prototip-v1] #calc-layout > form > h2,
        [data-prototip-v1] #rezultat-calcul > h2 {
          margin-bottom: .75rem;
          padding-bottom: .5rem;
          font-size: 1rem;
        }

        /* Câmpurile principale stau mai aproape unele de altele. */
        [data-prototip-v1] #calc-layout > form .mb-5 {
          margin-bottom: .85rem;
        }

        [data-prototip-v1] #calc-layout > form button[type="submit"] {
          min-height: 2.75rem;
          padding-top: .65rem;
          padding-bottom: .65rem;
        }

        /* Starea goală actuală conține un tabel complet cu liniuțe.
           În V1 îl înlocuim vizual cu trei repere scurte. După calcul,
           tabelul real revine automat, fără nicio schimbare de logică. */
        [data-prototip-v1] #rezultat-calcul:has(> [aria-hidden="true"][data-md-strip]) > [aria-hidden="true"][data-md-strip],
        [data-prototip-v1] #rezultat-calcul:has(> [aria-hidden="true"][data-md-strip]) > p[data-md-strip] {
          display: none;
        }

        [data-prototip-v1] #rezultat-calcul:has(> [aria-hidden="true"][data-md-strip])::after {
          content: "SALARIU NET\\A—\\A\\A TAXE TOTALE\\A—\\A\\A COST ANGAJATOR\\A—";
          display: block;
          white-space: pre-line;
          border: 1px solid rgb(214 211 209);
          border-radius: .375rem;
          padding: 1rem;
          color: rgb(68 64 60);
          font-size: .75rem;
          font-weight: 600;
          letter-spacing: .025em;
          line-height: 1.35;
          background: rgb(250 250 249);
        }

        @media (min-width: 640px) {
          [data-prototip-v1] > section:first-of-type > div {
            padding-top: 1.75rem;
            padding-bottom: 1.75rem;
          }

          [data-prototip-v1] #calc-layout {
            padding-top: 1.75rem;
            padding-bottom: 2.25rem;
          }

          [data-prototip-v1] #calc-layout > form,
          [data-prototip-v1] #rezultat-calcul {
            padding: 1.25rem;
          }
        }

        @media (min-width: 768px) {
          [data-prototip-v1] #calc-layout {
            gap: 1.25rem;
          }

          [data-prototip-v1] #rezultat-calcul:has(> [aria-hidden="true"][data-md-strip])::after {
            min-height: 11.5rem;
            display: flex;
            align-items: center;
          }
        }
      `}</style>

      <CalculatorSalariu />

      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <p className="border-t border-stone-200 pt-5 text-xs leading-relaxed text-stone-600">
          Prototip V1 — doar densitate și ierarhie vizuală. Logica fiscală este aceeași componentă folosită pe homepage.
        </p>
      </div>
    </div>
  );
}
