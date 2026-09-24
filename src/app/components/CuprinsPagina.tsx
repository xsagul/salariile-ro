"use client";

import { useEffect, useState } from "react";

type Intrare = { id: string; text: string };

const slug = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

/**
 * Cuprinsul din coloana din dreapta (varianta A, aleasă pe 24 septembrie 2026).
 * Își ia titlurile din coloana de text marcată cu `data-cuprins`, deci nu se
 * întreține de mână pe fiecare pagină și nu poate rămâne în urmă față de text.
 * Marchează secțiunea în care se află cititorul.
 */
export default function CuprinsPagina() {
  const [intrari, setIntrari] = useState<Intrare[]>([]);
  const [activ, setActiv] = useState<string | null>(null);

  useEffect(() => {
    const radacina = document.querySelector("[data-cuprins]");
    if (!radacina) return;
    const titluri = [...radacina.querySelectorAll("h2")].filter((h) => h.textContent?.trim());
    const folosite = new Set<string>();
    const lista = titluri.map((h) => {
      if (!h.id) {
        let id = slug(h.textContent ?? "") || "sectiune";
        while (folosite.has(id) || document.getElementById(id)) id = `${id}-x`;
        h.id = id;
      }
      folosite.add(h.id);
      h.classList.add("scroll-mt-24");
      return { id: h.id, text: (h.textContent ?? "").trim() };
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lista se citește din DOM după randare; nu există altă sursă
    setIntrari(lista);

    const observator = new IntersectionObserver(
      (intrariVizibile) => {
        const vizibil = intrariVizibile.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vizibil) setActiv(vizibil.target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    titluri.forEach((h) => observator.observe(h));
    return () => observator.disconnect();
  }, []);

  if (intrari.length < 2) return null;

  return (
    <nav aria-label="Cuprinsul paginii">
      <p className="mb-3 text-xs font-medium text-stone-600">Pe această pagină</p>
      <ul className="flex flex-col border-l border-stone-200 text-sm">
        {intrari.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={activ === i.id ? "location" : undefined}
              className={`-ml-px block border-l-2 py-1.5 pl-3 leading-snug transition-colors ${
                activ === i.id
                  ? "border-stone-900 font-medium text-stone-900"
                  : "border-transparent text-stone-600 hover:text-stone-900"
              }`}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
