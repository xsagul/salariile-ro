// Vacanțele școlare, din ordinul ministrului educației privind structura anului școlar.
// Proprietarul faptului: acest fișier. Se adaugă un an școlar nou numai după publicarea
// ordinului în Monitorul Oficial (regula „numai legislație în vigoare”, CLAUDE.md).
// Adăugate pe 6 noiembrie 2026: primele rezultate la „zile libere 2027” le au, noi nu.

export type Vacanta = { nume: string; perioada: string };
export type AnScolar = {
  eticheta: string;
  /** Anii calendaristici pe ale căror pagini de zile libere apare. */
  ani: number[];
  vacante: Vacanta[];
  exceptii: string[];
  sursa: { text: string; url: string };
};

export const ANI_SCOLARI: AnScolar[] = [
  {
    eticheta: "2026–2027",
    ani: [2026, 2027],
    vacante: [
      { nume: "Vacanța de toamnă", perioada: "24 octombrie – 1 noiembrie 2026" },
      { nume: "Vacanța de iarnă", perioada: "23 decembrie 2026 – 10 ianuarie 2027" },
      { nume: "Vacanța de schi (intermodulară)", perioada: "o săptămână între 15 februarie și 7 martie 2027, aleasă de fiecare inspectorat județean" },
      { nume: "Vacanța de primăvară", perioada: "24 aprilie – 4 mai 2027" },
      { nume: "Vacanța de vară", perioada: "19 iunie – 5 septembrie 2027" },
    ],
    exceptii: [
      "Clasa a XII-a termină pe 4 iunie 2027, iar clasa a VIII-a pe 11 iunie 2027.",
      "Liceele tehnologice (fără clasa a IX-a) și învățământul profesional termină pe 25 iunie 2027.",
      "Pe 5 octombrie, Ziua internațională a educației, nu se țin cursuri.",
    ],
    sursa: {
      text: "Ordinul ministrului educației nr. 3.194/2026, Monitorul Oficial nr. 126 din 16 februarie 2026",
      url: "https://cdn.edupedu.ro/wp-content/uploads/2026/02/Ordin-Nr.-3.1942026-STRUCTURA-AN-SCOLAR-2026-2027-Monitorul-Oficial-Partea-I-nr.-126.pdf",
    },
  },
];

export const aniScolariPentru = (an: number) => ANI_SCOLARI.filter((a) => a.ani.includes(an));
