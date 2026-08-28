"use client";

// src/app/components/SelectorPastile.tsx
//
// Selector cu pastile, pentru cazul in care optiunile sunt putine si fixe.
//
// De ce nu dropdown: grila de invatamant are 21 de functii cu gradul copt in
// denumire. Intr-un `select`, o educatoare trebuie sa parcurga toate ca sa se
// recunoasca. Cu pastile pe axe separate vede tot deodata si combinatiile
// imposibile sunt vizibil stinse, nu ascunse.
//
// REGULA DE COMPACTARE. Prima versiune punea explicatia sub FIECARE pastila.
// Cu cinci grupuri, formularul ajungea la 1.831 px si nu se mai alinia cu
// panoul de rezultat. Acum pastila arata doar eticheta, pe un rand, iar
// explicatia se afiseaza o singura data — a optiunii selectate, sub titlu.
// N randuri duble devin N randuri simple plus unul.
//
// Culorile respecta BRAND.md §9: selectat = plin stone-900 (ca butonul primar),
// neselectat = `surface` cu bordura stone-300 (ca butonul secundar).

export type OptiunePastila<T extends string | number> = {
  valoare: T;
  eticheta: string;
  /** Explicatia din lege. Se arata doar cand optiunea e cea selectata. */
  detaliu?: string;
  /** Cand e fals, pastila se stinge si nu se poate apasa. */
  posibil?: boolean;
};

export function SelectorPastile<T extends string | number>({
  eticheta,
  ajutor,
  optiuni,
  valoare,
  onChange,
  coloane,
}: {
  eticheta: string;
  ajutor?: string;
  optiuni: OptiunePastila<T>[];
  valoare: T | null;
  onChange: (v: T) => void;
  /** Fortat pe o coloana — doar pentru liste cu denumiri lungi, ca la conducere. */
  coloane?: 1;
}) {
  const selectata = optiuni.find((o) => o.valoare === valoare);
  const nota = selectata?.detaliu ?? ajutor;

  // Daca exista o singura optiune posibila, nu e o alegere — e un fapt. Nu se
  // deseneaza deloc; valoarea e deja fixata de constrangerile grilei.
  const posibile = optiuni.filter((o) => o.posibil !== false);
  if (posibile.length <= 1) return null;

  return (
    <fieldset className="mb-3">
      <legend className="mb-1 text-xs font-medium text-stone-500">{eticheta}</legend>

      <div className={coloane === 1 ? "flex flex-col gap-1" : "flex flex-wrap gap-1"}>
        {optiuni.map((o) => {
          const posibil = o.posibil !== false;
          const activ = o.valoare === valoare;
          return (
            <button
              key={String(o.valoare)}
              type="button"
              disabled={!posibil}
              aria-pressed={activ}
              onClick={() => onChange(o.valoare)}
              className={[
                "min-h-11 rounded px-3 text-sm transition-colors",
                coloane === 1 ? "w-full text-left" : "",
                activ
                  ? "bg-stone-900 font-medium text-white"
                  : posibil
                    ? "border border-stone-300 bg-surface text-stone-900 hover:bg-canvas"
                    : "cursor-not-allowed border border-stone-200 bg-canvas text-stone-400 line-through decoration-stone-300",
              ].join(" ")}
              title={!posibil ? "Nu există în grilă pentru selecția curentă" : undefined}
            >
              {o.eticheta}
            </button>
          );
        })}
      </div>

      {nota && <p className="mt-1 text-xs text-stone-600">{nota}</p>}
    </fieldset>
  );
}
