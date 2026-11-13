import type { ReactNode } from "react";

/**
 * Primul ecran al unei meserii, aceeași formă oricare ar fi sursa (13 noiembrie 2026): proprietarul
 * a văzut pe telefon cardurile noi ca pe „un raft pe care s-au trântit informații la întâmplare”.
 * Modelul e cardul salariilor plătite la stat (SalariuConcluzie), care are cele mai bune cifre pe
 * site: o etichetă, cifra, brutul, o singură propoziție, cel mult trei repere și sursa într-un rând.
 * Tabelele și listele de surse stau dedesubt, în secțiuni proprii, nu în card.
 */

export type Reper = { eticheta: string; valoare: string };

const CARD = "rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6";

export default function CardSalariu({
  tip, primar, eticheta, cifra, brut, explicatie, repere = [], nota, sursa,
}: {
  tip: string;
  primar: number | null | undefined;
  eticheta: string;
  cifra: string;
  brut?: string | null;
  explicatie?: string | null;
  repere?: Reper[];
  nota?: string | null;
  sursa: ReactNode;
}) {
  const r = repere.slice(0, 3);
  return (
    <section className={`mt-6 ${CARD}`} data-salary-kind={tip} data-salary-primary={primar ?? undefined}>
      <p className="text-xs font-medium text-stone-700">{eticheta}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{cifra}</p>
      {brut && <p className="mt-1 text-base text-stone-700">{brut}</p>}
      {explicatie && <p className="mt-1 text-sm text-stone-600">{explicatie}</p>}
      {r.length > 0 && (
        <dl className={`mt-4 grid gap-2 sm:gap-3 ${r.length === 3 ? "grid-cols-3" : r.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
          {r.map((x) => (
            <div key={x.eticheta} className="rounded-md border border-stone-200 p-2.5 sm:p-3">
              <dt className="text-xs text-stone-600">{x.eticheta}</dt>
              <dd className="mt-1 text-base font-semibold text-stone-900">{x.valoare}</dd>
            </div>
          ))}
        </dl>
      )}
      {nota && <p className="mt-3 text-sm text-stone-600">{nota}</p>}
      <p className="mt-4 text-xs text-stone-600">{sursa}</p>
    </section>
  );
}

/** O secțiune de detaliu sub card, ca „Pe vechime în muncă” de la salariile plătite. */
export function SectiuneDetaliu({ titlu, subtitlu, children }: { titlu: string; subtitlu?: string; children: ReactNode }) {
  return (
    <section className={`mt-6 ${CARD}`}>
      <h2 className="text-base font-semibold text-stone-900">{titlu}</h2>
      {subtitlu && <p className="mt-1 text-xs text-stone-600">{subtitlu}</p>}
      {children}
    </section>
  );
}
