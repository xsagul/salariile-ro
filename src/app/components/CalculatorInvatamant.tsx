"use client";

// src/app/components/CalculatorInvatamant.tsx
// Calculator salariu învățământ preuniversitar — Legea 153/2017, Anexa I, cap. I.
//
// Toată aritmetica stă în `@/lib/invatamant`. Aici nu se calculează nimic —
// componenta colectează opțiunile și afișează rezultatul cu temeiul legal pe
// fiecare linie, conform promisiunii din BRAND.md: de la cifră se ajunge
// întotdeauna la formulă, la actul normativ și la data de la care se aplică.
//
// De ce pastile și nu dropdown-uri: grila are 21 de funcții cu gradul copt în
// denumire („Profesor, educator-puericultor studii superioare de lungă durată
// grad didactic I"). Într-un select, o educatoare le parcurge pe toate ca să se
// recunoască. Pe axe separate vede tot deodată, iar combinațiile care nu există
// în grilă sunt stinse vizibil — nu ascunse și nu greșite în tăcere.
//
// Două categorii de personal, cu reguli OPUSE:
//   didactic  — sumele sunt la gradația 0, deci gradația se aplică;
//   conducere — sumele includ deja sporul de vechime la nivel maxim (nota 2),
//               deci gradația NU se aplică.

import { useState } from "react";
import FeedbackContextual from "@/app/components/FeedbackContextual";
import { SelectorPastile, type OptiunePastila } from "@/app/components/SelectorPastile";
import { trackUmami } from "@/lib/umami";
import {
  calculeazaInvatamantComplet,
  calculeazaConducereComplet,
  functiaPentru,
  gradePosibile,
  studiiPosibile,
  vechimiPentruFunctie,
  CONDUCERE,
  GRUPURI,
  GRADE,
  NIVELURI,
  GRADATII,
  MAJORARI,
  INDEMNIZATIE_DOCTORAT_2026,
  SURSA_GRILA,
  type Grup,
  type Grad,
  type NivelGradatie,
} from "@/lib/invatamant";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(Math.round(n));

const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";

type Categorie = "didactic" | "conducere";

/** `value === null` = încă nu s-a calculat; se afișează „–”. */
function Row({ label, value, sub, neg, bold, ultim, temei }: {
  label: string; value: string | null; sub?: boolean; neg?: boolean;
  bold?: boolean; ultim?: boolean; temei?: string;
}) {
  const b = ultim ? "" : "border-b ";
  return (
    <tr>
      <td className={`${b}border-r border-stone-300 px-3 py-3 text-left ${sub ? "pl-4 sm:pl-8" : ""} ${bold ? "font-bold text-stone-900" : ""}`}>
        {label}
        {temei ? <span className="mt-0.5 block text-xs text-stone-600">{temei}</span> : null}
      </td>
      <td className={`${b}border-stone-300 px-3 py-3 text-right tabular-nums whitespace-nowrap ${bold ? "font-bold text-stone-900" : ""}`}>
        {value === null ? "–" : `${neg ? "− " : ""}${value} lei`}
      </td>
    </tr>
  );
}

function Toggle({ label, hint, checked, onChange }: {
  label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-sm text-stone-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-400 text-stone-900 focus:ring-stone-300"
      />
      <span>
        {label}
        {hint ? <span className="mt-0.5 block text-xs text-stone-600">{hint}</span> : null}
      </span>
    </label>
  );
}

export default function CalculatorInvatamant() {
  const [categorie, setCategorie] = useState<Categorie>("didactic");

  // didactic
  const [grup, setGrup] = useState<Grup>("profesor");
  const [grad, setGrad] = useState<Grad>("gradul-i");
  const [studii, setStudii] = useState("S");
  const [vechimeInv, setVechimeInv] = useState<string | null>(null);
  const [gradatie, setGradatie] = useState<NivelGradatie>(5);

  // conducere — implicit directorul de unitate, cel mai cautat
  const [functieCond, setFunctieCond] = useState(5);
  const [gradCond, setGradCond] = useState<"I" | "II">("I");
  const [studiiScurte, setStudiiScurte] = useState(false);

  // comune
  const [majorari, setMajorari] = useState<string[]>([]);
  const [doctorat, setDoctorat] = useState(false);
  const [avansat, setAvansat] = useState(false);
  const [rez, setRez] = useState<
    | { fel: "didactic"; d: NonNullable<ReturnType<typeof calculeazaInvatamantComplet>> }
    | { fel: "conducere"; c: NonNullable<ReturnType<typeof calculeazaConducereComplet>> }
    | null
  >(null);

  const sterge = () => setRez(null);

  // ─── Axele didactice, cu posibilitățile derivate din grilă ────────────────
  const gradeOk = gradePosibile(grup);
  const studiiOk = studiiPosibile(grup, grad);
  const nrFunctie = functiaPentru(grup, grad, studii);
  const vechimi = nrFunctie ? vechimiPentruFunctie(nrFunctie) : [];
  const vechimeCurenta = vechimeInv && vechimi.includes(vechimeInv) ? vechimeInv : (vechimi[0] ?? null);

  function alegeGrup(g: Grup) {
    setGrup(g); sterge();
    const grade = gradePosibile(g);
    const gradNou = grade.has(grad) ? grad : [...grade][0];
    setGrad(gradNou);
    const st = studiiPosibile(g, gradNou);
    if (!st.has(studii)) setStudii([...st][0]);
  }

  function alegeGrad(g: Grad) {
    setGrad(g); sterge();
    const st = studiiPosibile(grup, g);
    if (!st.has(studii)) setStudii([...st][0]);
  }

  // Pe mobil coloanele sunt una sub alta: dupa calcul rezultatul e sub pliu,
  // deci se aduce in ecran. Acelasi comportament ca pe homepage si part-time.
  function dupaCalcul() {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    // Amanat un cadru: la momentul apelului React inca n-a re-randat, deci
    // panoul de rezultat are inaltimea veche si tinta ar fi calculata gresit.
    requestAnimationFrame(() => {
      document.getElementById("rezultat-invatamant")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function calculeaza() {
    if (categorie === "conducere") {
      const c = calculeazaConducereComplet({ functie: functieCond, grad: gradCond, studiiScurte, doctorat });
      setRez(c ? { fel: "conducere", c } : null);
      dupaCalcul();
      if (c) trackUmami({ name: "calcul-invatamant", data: { gradatie: "0" } });
      return;
    }
    if (!nrFunctie || !vechimeCurenta) { setRez(null); return; }
    // Anii care cad sigur în fiecare tranșă de gradație.
    const aniPtGradatie = [0, 3, 5, 10, 15, 20][gradatie];
    const d = calculeazaInvatamantComplet({
      functie: nrFunctie, vechimeInvatamant: vechimeCurenta, aniMunca: aniPtGradatie, majorari, doctorat,
    });
    setRez(d ? { fel: "didactic", d } : null);
    dupaCalcul();
    if (d) trackUmami({ name: "calcul-invatamant", data: { gradatie: String(d.gradatie) as "0" | "1" | "2" | "3" | "4" | "5" } });
  }

  const r = rez ? (rez.fel === "didactic" ? rez.d : rez.c) : null;

  const optGrup: OptiunePastila<Grup>[] = GRUPURI.map((g) => ({ valoare: g.cod, eticheta: g.eticheta }));
  const optGrad: OptiunePastila<Grad>[] = GRADE.map((g) => ({ valoare: g.cod, eticheta: g.eticheta, posibil: gradeOk.has(g.cod) }));
  const optStudii: OptiunePastila<string>[] = NIVELURI.map((n) => ({ valoare: n.cod, eticheta: n.eticheta, posibil: studiiOk.has(n.cod) }));

  return (
    // Secțiunea stă pe `canvas`, cardurile pe `surface` deasupra ei — altfel
    // cardurile (#fffdf9) cad pe `<body>`-ul alb și dispar (BRAND.md §15).
    <section className="border-y border-stone-200 bg-canvas">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-5">
        {/* ─── Formular ───────────────────────────────────────────────── */}
        <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2">
          <h2 className={colHeader}>Încadrarea ta</h2>

          <SelectorPastile<Categorie>
            eticheta="Ce fel de post ocupi"
            optiuni={[
              { valoare: "didactic", eticheta: "Predare" },
              { valoare: "conducere", eticheta: "Conducere" },
            ]}
            valoare={categorie}
            onChange={(v) => { setCategorie(v); sterge(); }}
          />

          {categorie === "didactic" ? (
            <>
              <SelectorPastile<Grup> eticheta="Funcția" optiuni={optGrup} valoare={grup} onChange={alegeGrup} />
              <SelectorPastile<Grad> eticheta="Gradul didactic" optiuni={optGrad} valoare={grad} onChange={alegeGrad} />
              <SelectorPastile<string>
                eticheta="Nivelul studiilor"
                optiuni={optStudii}
                valoare={studii}
                onChange={(v) => { setStudii(v); sterge(); }}
              />
              <SelectorPastile<string>
                eticheta="Vechimea în învățământ"
                ajutor="Cât ai lucrat efectiv în sistem — nu toată cariera."
                optiuni={vechimi.map((v) => ({ valoare: v, eticheta: v }))}
                valoare={vechimeCurenta}
                onChange={(v) => { setVechimeInv(v); sterge(); }}
              />
              <SelectorPastile<NivelGradatie>
                eticheta="Gradația"
                ajutor="După vechimea în muncă, din toată cariera."
                optiuni={GRADATII.map((g) => ({ valoare: g.nivel as NivelGradatie, eticheta: String(g.nivel) }))}
                valoare={gradatie}
                onChange={(v) => { setGradatie(v); sterge(); }}
              />
            </>
          ) : (
            <>
              <SelectorPastile<number>
                eticheta="Funcția de conducere"
                optiuni={CONDUCERE.map((c) => ({ valoare: c.nr, eticheta: c.functie }))}
                valoare={functieCond}
                onChange={(v) => { setFunctieCond(v); sterge(); }}
                coloane={1}
              />
              <SelectorPastile<"I" | "II">
                eticheta="Gradul"
                optiuni={[{ valoare: "I", eticheta: "Gradul I" }, { valoare: "II", eticheta: "Gradul II" }]}
                valoare={gradCond}
                onChange={(v) => { setGradCond(v); sterge(); }}
              />
              <div className="mb-5 rounded border border-stone-300 bg-canvas px-3 py-2 text-xs text-stone-600">
                La funcțiile de conducere <strong className="text-stone-900">nu se aplică gradația</strong> —
                salariile din anexă cuprind deja sporul de vechime în muncă la nivel maxim (nota 2).
              </div>
              <fieldset className="mb-5 border-t border-stone-200 pt-4">
                <Toggle
                  label="Studii superioare de scurtă durată"
                  hint="−20% · Anexa I, cap. I, pct. 2, nota 1"
                  checked={studiiScurte}
                  onChange={(v) => { setStudiiScurte(v); sterge(); }}
                />
              </fieldset>
            </>
          )}

          {/* Majorările stau pliate, ca „Calculator avansat" de pe homepage.
              Un profesor care vrea doar cifra de bază nu derulează pe lângă ele. */}
          <button
            type="button"
            onClick={() => setAvansat((v) => !v)}
            aria-expanded={avansat}
            className="mb-3 min-h-11 w-full rounded border border-dashed border-stone-300 px-3 text-xs font-medium text-stone-600 transition-colors hover:bg-canvas"
          >
            {avansat ? "▲ Ascunde majorările" : "▼ Majorări: dirigenție, gradație de merit, doctorat"}
          </button>

          {avansat && (
            <fieldset className="mb-4 border-t border-stone-200 pt-3">
              {categorie === "didactic" &&
                MAJORARI.map((m) => (
                  <Toggle
                    key={m.cod}
                    label={m.eticheta}
                    hint={`+${(m.cota * 100).toLocaleString("ro-RO")}%${m.detaliu ? " · " + m.detaliu : ""} · ${m.temei}`}
                    checked={majorari.includes(m.cod)}
                    onChange={(on) => { setMajorari((p) => (on ? [...p, m.cod] : p.filter((c) => c !== m.cod))); sterge(); }}
                  />
                ))}
              <Toggle
                label="Titlu științific de doctor"
                hint={`${INDEMNIZATIE_DOCTORAT_2026} lei brut · OUG 7/2026`}
                checked={doctorat}
                onChange={(v) => { setDoctorat(v); sterge(); }}
              />
            </fieldset>
          )}

          <button
            type="button"
            onClick={calculeaza}
            className="block min-h-12 w-full rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-800 active:translate-y-px"
          >
            Calculează
          </button>
        </div>

        {/* ─── Rezultat ───────────────────────────────────────────────── */}
        <div id="rezultat-invatamant" className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3">
          <h2 className={colHeader}>Rezultatul</h2>

          {/* Tabel fiscal, după BRAND.md §9: antet pe `canvas`, corp pe `surface`,
              iar rândul de total INVERSAT — singurul fundal plin de rând din sistem. */}
          <div className="overflow-hidden rounded border border-stone-300">
            <table className="w-full table-auto border-collapse text-sm text-stone-700 [&_td]:align-middle [&_th]:align-middle sm:table-fixed">
              <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
              <thead>
                <tr>
                  <th className="border-b border-r border-b-stone-300 border-r-stone-300 bg-canvas px-3 py-3 text-left text-sm font-medium text-stone-700">
                    Element de salarizare
                  </th>
                  <th className="border-b border-stone-300 bg-canvas px-3 py-3 text-right text-sm font-medium text-stone-700">
                    Sumă
                  </th>
                </tr>
              </thead>
              <tbody>
                {rez?.fel === "conducere" ? (
                  <Row
                    label="Salariu de bază din anexă"
                    value={fmt(rez.c.salariuDeBaza)}
                    bold
                  />
                ) : (
                  <>
                    <Row
                      label="Salariu de bază din grilă (gradația 0)"
                      value={rez?.fel === "didactic" ? fmt(rez.d.salariuGrila) : null}
                      />
                    <Row
                      label={rez?.fel === "didactic" ? `Gradația ${rez.d.gradatie} de vechime în muncă` : "Gradația de vechime în muncă"}
                      value={rez?.fel === "didactic" ? fmt(rez.d.salariuDeBaza - rez.d.salariuGrila) : null}
                      sub
                    />
                    <Row label="Salariul de bază deținut" value={r ? fmt(r.salariuDeBaza) : null} bold />
                  </>
                )}

                {r?.linii.map((l) => (
                  <Row key={l.eticheta} label={l.eticheta} value={fmt(l.suma)} sub />
                ))}

                <Row label="Total brut" value={r ? fmt(r.brutTotal) : null} bold />
                <Row label="CAS (pensie – 25%)" value={r ? fmt(r.fiscal.cas) : null} sub neg />
                <Row label="CASS (sănătate – 10%)" value={r ? fmt(r.fiscal.cass) : null} sub neg />
                <Row label="Impozit pe venit (10%)" value={r ? fmt(r.fiscal.impozit) : null} sub neg />

                <tr className="bg-stone-900">
                  <td className="border-r border-r-stone-600 px-3 py-3 text-left text-sm font-bold text-white">
                    Salariu net
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right text-sm font-bold tabular-nums text-white">
                    {r ? `${fmt(r.fiscal.netBani)} lei` : "–"}
                  </td>
                </tr>

                <Row label="CAM (plătit de unitate – 2,25%)" value={r ? fmt(r.fiscal.cam) : null} />
                <Row label="Cost total pentru unitatea de învățământ" value={r ? fmt(r.fiscal.costTotal) : null} bold ultim />
              </tbody>
            </table>
          </div>

          {!r && (
            <p className="mt-4 text-xs leading-relaxed text-stone-500">
              Alege încadrarea și apasă <strong className="text-stone-900">Calculează</strong>.
              Fiecare linie își arată temeiul din lege.
            </p>
          )}

          {r && (
            <>
              <div className="mt-5 border-t border-stone-200 pt-4 text-xs text-stone-600">
                <p className="mb-2">
                  <strong className="text-stone-900">De unde vine cifra.</strong>{" "}
                  {SURSA_GRILA.act}, {SURSA_GRILA.anexa}. Formă consolidată la{" "}
                  {new Date(SURSA_GRILA.formaConsolidata).toLocaleDateString("ro-RO")}.
                </p>
                <p className="mb-2">
                  Coloana folosită este cea din <strong className="text-stone-900">iunie 2024</strong>, pentru că
                  salariile de bază din sectorul public s-au menținut prin lege: în 2025 la nivelul lunii
                  decembrie 2024, iar în 2026 la nivelul lunii decembrie 2025.
                </p>
                <p className="mb-2">
                  Rezultatul este salariul de bază plus majorările bifate. Nu include sporuri de condiții
                  de muncă, plata cu ora, premii sau norma didactică sub/peste normă.
                </p>
                <p>
                  <strong className="text-stone-900">Temeiul fiecărei linii.</strong>{" "}
                  {rez?.fel === "conducere"
                    ? rez.c.temeiSalariu
                    : "Salariul de bază: Anexa I, cap. I, pct. 5. Gradația: art. 10 alin. (4) — cotele se compun, nu se adună."}
                  {r?.linii.length ? " " + r.linii.map((l) => `${l.eticheta}: ${l.temei}.`).join(" ") : ""}
                </p>
              </div>

              <FeedbackContextual context="calcul" />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
