// Cazuri-capcană pentru factorii din anunțuri (scripts/crawler/atribute.mjs). Fiecare caz e o
// formulare reală sau aproape reală; cele de „nu” sunt la fel de importante ca cele de „da”.
import assert from "node:assert/strict";
import { atributeAnunt } from "./crawler/atribute.mjs";
import { reparaCodare } from "./crawler/extract.mjs";
import { classifyAll } from "./crawler/occupations.mjs";

const a = (description, title = "Anunț") => atributeAnunt({ title, description });
let n = 0;
const ok = (cond, mesaj) => { assert.ok(cond, mesaj); n++; };
const eq = (x, y, mesaj) => { assert.deepEqual(x, y, mesaj); n++; };

// Experiență: anii se citesc doar lângă „experiență”
eq(a("Cerințe: experiență de minim 2 ani în domeniu.").experienta, { cerinta: "ani", min: 2, max: null }, "minim 2 ani");
eq(a("Experienta 3-5 ani pe un post similar").experienta, { cerinta: "ani", min: 3, max: 5 }, "interval 3-5");
eq(a("Minim 1 an experiență ca electrician").experienta, { cerinta: "ani", min: 1, max: null }, "1 an înainte");
eq(a("Căutăm candidați cu 2+ ani de experiență").experienta, { cerinta: "ani", min: 2, max: null }, "2+ ani");
eq(a("Nu este necesară experiență, te calificăm noi.").experienta, { cerinta: "fara", min: 0, max: null }, "fără experiență");
eq(a("Experiența constituie un avantaj.").experienta, { cerinta: "avantaj", min: null, max: null }, "avantaj, nu cerință");
eq(a("Vârsta între 18 și 50 de ani. Seriozitate.").experienta, null, "vârsta nu e experiență");
eq(a("Firmă cu 25 de ani pe piață, garanție 2 ani.").experienta, null, "vechimea firmei nu e experiență");
eq(a("Companie cu peste 15 ani de experiență, își mărește echipa! Angajăm fasonator.").experienta, null, "vechimea firmei cu „experiență”");
eq(a("Catering cu peste 16 ani de experiență angajează șofer. Experiență auto: permis categoria B de minimum 2 ani.").experienta?.min ?? null, null, "vechimea permisului nu e experiență în meserie");
eq(a("Firmă cu 22 ani experiență în domeniu angajează confecționer, cu experiență minim 3 ani.").experienta, { cerinta: "ani", min: 3, max: null }, "cerința, nu vechimea firmei");
eq(a("Experiență în vânzări B2B").experienta, { cerinta: "da", min: null, max: null }, "experiență fără ani");
// Studii
eq(a("Studii superioare în domeniul economic").studii, "superioare", "studii superioare");
eq(a("Studii medii (liceu)").studii, "medii", "liceu");
eq(a("Minim 8 clase").studii, "generale", "8 clase");
eq(a("Seriozitate și punctualitate").studii, null, "fără studii menționate");
// Limbi: doar cu context de cerință
eq(a("Cunoștințe de limba engleză nivel mediu").limbi, ["engleza"], "engleză cu context");
eq(a("Germană nivel B1 obligatoriu").limbi, ["germana"], "germană B1");
eq(a("We are looking for a developer to join our team and build features").limbi, [], "anunț în engleză nu cere engleza");
eq(a("Magazin cu produse germane de calitate").limbi, [], "produse germane nu e limbă");
// Permis
eq(a("Permis de conducere categoria B").permis, ["B"], "permis B");
eq(a("Permis cat. C+E și atestat CPC").permis, ["CE"], "C+E");
eq(a("Posesor permis de conducere").permis, ["da"], "permis fără categorie");
ok(a("Permis cat. C+E și atestat CPC").atestate.includes("atestat transport (CPC)"), "atestat CPC");
ok(a("Electrician autorizat ANRE").atestate.includes("ANRE"), "ANRE");
eq(a("Certificare ANRE (grad IIB) constituie un avantaj.").atestate, ["ANRE (avantaj)"], "ANRE ca avantaj, nu cerință");
eq(a("Autorizare ANRE obligatorie. Experiența constituie un avantaj.").atestate, ["ANRE"], "avantajul din propoziția următoare nu e al atestatului");
// Program și mod
ok(a("Program în ture, inclusiv tura de noapte").program.includes("ture"), "ture");
ok(a("Program în ture, inclusiv tura de noapte").program.includes("noapte"), "noapte");
ok(a("Program luni - vineri, 8 ore/zi").program.includes("luni–vineri"), "luni-vineri");
eq(a("Program luni - vineri, 8 ore/zi").norma, "full-time", "8 ore = full-time");
eq(a("Job part-time, 4 ore/zi").norma, "part-time", "part-time");
ok(a("Lucru 100% remote").mod.includes("remote"), "remote");
ok(a("Model de lucru hibrid, 2 zile la birou").mod.includes("hibrid"), "hibrid");
eq(a("Program flexibil").mod, [], "flexibil nu e remote");
eq(a("Contract pe perioadă nedeterminată").durata, "nedeterminată", "nedeterminată");
// Beneficii
const b = a("Oferim: tichete de masă, transport gratuit, cazare asigurată, bonusuri de performanță, abonament medical.").beneficii;
for (const x of ["tichete de masă", "transport", "cazare", "bonus", "asigurare medicală"]) ok(b.includes(x), `beneficiu ${x}`);
ok(!a("Transportul mărfii în țară").beneficii.includes("transport"), "transportul mărfii nu e beneficiu");
ok(!a("Cazarea turiștilor la recepție").beneficii.includes("cazare"), "cazarea turiștilor nu e beneficiu");
// Tehnologii
const tech = a("Stack: Java 17, Spring Boot, React, PostgreSQL, Docker, Kubernetes pe AWS.", "Senior Java Developer").tehnologii;
for (const x of ["Java", "Spring", "React", "SQL", "Docker", "Kubernetes", "AWS"]) ok(tech.includes(x), `tehnologie ${x}`);
ok(!a("Experiență cu JavaScript și TypeScript").tehnologii.includes("Java"), "JavaScript nu e Java");
// Nivel din titlu
eq(a("", "Senior Java Developer").nivel, "senior", "senior");
eq(a("", "Programator junior").nivel, "junior", "junior");
eq(a("", "Electrician").nivel, null, "fără nivel");
// Anunțuri în engleză și câmpurile structurate
eq(a("Requirements: 3+ years of experience with Java and Spring.").experienta, { cerinta: "ani", min: 3, max: null }, "3+ years of experience");
eq(a("You have at least 2 years of hands-on experience in testing.").experienta, { cerinta: "ani", min: 2, max: null }, "at least 2 years");
eq(a("We have 25 years of experience in software and we are hiring.").experienta, null, "vechimea firmei, în engleză");
eq(a("Bachelor's degree in Computer Science or related field").studii, "superioare", "bachelor");
eq(atributeAnunt({ title: "Dev", description: "Despre firmă.", extra: "1 - 5 ani experientaDespre firmă" }).experienta, { cerinta: "ani", min: 1, max: 5 }, "experienceRequirements lipit de text (hipo)");
ok(atributeAnunt({ title: "Dev", description: "x", structurat: { remote: true, ore: 40 } }).mod.includes("remote"), "TELECOMMUTE = remote");
eq(atributeAnunt({ title: "Dev", description: "Cerem 3+ years of experience.", structurat: { experientaPortal: "1–5 ani" } }).experienta, { cerinta: "ani", min: 3, max: null }, "cerința scrisă, nu treapta portalului");
// Text publicat cu codare dublă (hipo.ro) și „programare” ≠ programator
eq(reparaCodare("dezvoltÄ soluÈii"), "dezvoltă soluții", "codare dublă reparată");
eq(reparaCodare("Salariu 5000 lei, ședință"), "Salariu 5000 lei, ședință", "text corect rămâne neatins");
eq(classifyAll("programare cnc").slugs, [], "programare CNC nu e programator");
eq(classifyAll("Programator").slugs, ["programator"], "programator rămâne programator");
// Limba anunțului
eq(a("We are looking for a developer with experience in our team and you will work with the best").limbaAnunt, "en", "anunț în engleză");

console.log(`OK: ${n} verificări pentru factorii din anunțuri (experiență, studii, limbi, permis, program, beneficii, tehnologii).`);
