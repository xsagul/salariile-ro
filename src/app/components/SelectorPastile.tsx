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
// Culorile respecta BRAND.md §9: selectat = plin stone-900 (ca butonul primar),
// neselectat = `surface` cu bordura stone-300 (ca butonul secundar). Fara
// culoare de accent — sistemul e monocrom.

export type OptiunePastila<T extends string | number> = {
  valoare: T;
  eticheta: string;
  /** Text mic sub eticheta — explicatia din lege, de exemplu. */
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
  /** Fortat pe o coloana, pentru liste cu etichete lungi. */
  coloane?: 1;
}) {
  const selectata = optiuni.find((o) => o.valoare === valoare);

  return (
    <fieldset className="mb-5">
      <legend className="mb-2 flex flex-wrap items-baseline gap-x-2 text-xs font-medium text-stone-500">
        <span>{eticheta}</span>
        {selectata && (
          <span className="font-bold text-stone-900">{selectata.eticheta}</span>
        )}
      </legend>
      {ajutor && <p className="mb-2 text-xs text-stone-600">{ajutor}</p>}

      <div className={coloane === 1 ? "flex flex-col gap-1.5" : "flex flex-wrap gap-1.5"}>
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
                "min-h-11 rounded px-3 py-2 text-left text-sm transition-colors",
                coloane === 1 ? "w-full" : "",
                activ
                  ? "bg-stone-900 font-medium text-white"
                  : posibil
                    ? "border border-stone-300 bg-surface text-stone-900 hover:bg-canvas"
                    : "cursor-not-allowed border border-stone-200 bg-canvas text-stone-400",
              ].join(" ")}
              title={!posibil ? "Nu există în grilă pentru selecția curentă" : undefined}
            >
              <span className={!posibil ? "line-through decoration-stone-300" : ""}>
                {o.eticheta}
              </span>
              {o.detaliu && (
                <span
                  className={`mt-0.5 block text-xs font-normal ${
                    activ ? "text-stone-300" : posibil ? "text-stone-600" : "text-stone-400"
                  }`}
                >
                  {o.detaliu}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
