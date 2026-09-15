// src/lib/deruleaza-la-rezultat.ts
//
// După „Calculează", rezultatul trebuie adus în ecran, ca pe homepage. Pe mobil
// coloanele sunt una sub alta, deci rezultatul e sub formular și omul apăsa
// butonul fără să vadă că s-a întâmplat ceva. Pe desktop se aduce tot blocul,
// ca să se vadă și ce ai ales, și ce a ieșit.
//
// Amânat un cadru: la momentul apelului React încă n-a re-randat, deci panoul
// de rezultat are înălțimea veche și ținta ar fi calculată greșit.

export function deruleazaLaRezultat(idRezultat: string, idBloc: string) {
  if (typeof window === "undefined") return;
  const mobil = window.matchMedia("(max-width: 768px)").matches;
  const tinta = mobil ? idRezultat : idBloc;
  requestAnimationFrame(() => {
    document.getElementById(tinta)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
