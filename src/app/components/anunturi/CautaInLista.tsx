"use client";

// Câmp cu sugestii: scrii „b” și apar București, Bacău, Brașov (proprietar, 28 septembrie 2026).
// Combobox ARIA: săgețile mută selecția, Enter alege, Escape închide. Lista o dă componenta-părinte,
// deja filtrată; aici e numai comportamentul.
import { useId, useState } from "react";

export type Optiune = { cheie: string; text: string; detaliu?: string };

export default function CautaInLista({ eticheta, valoare, onText, optiuni, onAlege, onFocus, nota, eroare, placeholder, maxLength, gol }: {
  eticheta: string;
  valoare: string;
  onText: (s: string) => void;
  optiuni: Optiune[];
  onAlege: (o: Optiune) => void;
  onFocus?: () => void;
  nota?: React.ReactNode;
  eroare?: string;
  placeholder?: string;
  maxLength?: number;
  /** Ce scrie sub câmp când nu se potrivește nimic; fără el, lista doar nu apare. */
  gol?: string;
}) {
  const id = useId();
  const [deschis, setDeschis] = useState(false);
  const [activ, setActiv] = useState(0);
  const arata = deschis && valoare.trim().length > 0 && (optiuni.length > 0 || !!gol);

  const alege = (o: Optiune) => { onAlege(o); setDeschis(false); };
  const taste = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && optiuni.length) { e.preventDefault(); setDeschis(true); setActiv((i) => (i + 1) % optiuni.length); }
    else if (e.key === "ArrowUp" && optiuni.length) { e.preventDefault(); setActiv((i) => (i - 1 + optiuni.length) % optiuni.length); }
    else if (e.key === "Enter" && arata && optiuni[activ]) { e.preventDefault(); alege(optiuni[activ]); }
    else if (e.key === "Escape") setDeschis(false);
  };

  return (
    <div className="relative">
      <label htmlFor={`${id}-c`} className="block text-sm font-medium text-stone-800">{eticheta}</label>
      <input
        id={`${id}-c`} type="text" role="combobox" autoComplete="off" spellCheck={false}
        aria-expanded={arata} aria-controls={`${id}-l`} aria-autocomplete="list" aria-invalid={!!eroare}
        aria-activedescendant={arata && optiuni[activ] ? `${id}-o${activ}` : undefined}
        value={valoare} placeholder={placeholder} maxLength={maxLength}
        onChange={(e) => { onText(e.target.value); setDeschis(true); setActiv(0); }}
        onFocus={() => { onFocus?.(); setDeschis(true); }}
        onBlur={() => setDeschis(false)}
        onKeyDown={taste}
        className="mt-1 block w-full rounded-md border border-stone-300 bg-surface px-3 py-2 text-base text-stone-900 focus:border-stone-600 focus:outline-none"
      />
      {arata && (
        <ul id={`${id}-l`} role="listbox" className="absolute left-0 right-0 z-20 mt-1 max-h-80 overflow-auto rounded-md border border-stone-300 bg-surface py-1 shadow-lg">
          {optiuni.length === 0 && <li className="px-3 py-2 text-sm text-stone-600">{gol}</li>}
          {optiuni.map((o, i) => (
            <li key={o.cheie} id={`${id}-o${i}`} role="option" aria-selected={i === activ}
              // mousedown, nu click: altfel câmpul pierde focusul și lista se închide înainte de alegere.
              onMouseDown={(e) => { e.preventDefault(); alege(o); }}
              onMouseEnter={() => setActiv(i)}
              className={`flex min-h-11 cursor-pointer flex-col justify-center px-3 py-1.5 ${i === activ ? "bg-stone-100" : ""}`}>
              <span className="text-base text-stone-900">{o.text}</span>
              {o.detaliu && <span className="text-xs text-stone-600">{o.detaliu}</span>}
            </li>
          ))}
        </ul>
      )}
      {nota && <span className="mt-1 block text-xs text-stone-600">{nota}</span>}
      {eroare && <span className="mt-1 block text-sm text-red-700">{eroare}</span>}
    </div>
  );
}
