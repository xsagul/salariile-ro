// src/lib/person.ts
// Schema.org Person partajat — folosit pe homepage, /despre, /metodologie etc.
// sameAs leagă identitatea autorului de profile externe verificabile
// (LinkedIn, GitHub, dev.to). Asta ajută Google să construiască knowledge graph
// în jurul autorului, semnal E-E-A-T important pentru topic YMYL (fiscal).

export const PERSON_ID = "https://salariile.ro/#person";

export const personSchema = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Știuriuc Sorin-Marian",
  url: "https://salariile.ro/despre",
  jobTitle: "Dezvoltator full-stack",
  description:
    "Întreține salariile.ro ca proiect personal independent de transparență fiscală pentru România.",
  sameAs: [
    "https://www.linkedin.com/in/%C8%99tiuriuc-sorin-marian/",
    "https://github.com/xsagul",
    "https://dev.to/sorin_stiuriuc",
  ],
} as const;
