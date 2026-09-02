"use client";

import FeedbackContextual from "@/app/components/FeedbackContextual";

// src/app/components/CalculatorPFA.tsx
// Calculator PFA 2026 — sistem real și normă de venit.
// Tipar identic cu CalculatorSalariu: calcul O DATĂ la „Calculează"/Enter,
// formular col-span-2 + rezultat col-span-3, tabel cu header, rând negru, bară.
//
// Reguli 2026 (reper salariu minim 4.050 lei, 1 ian):
//   impozit 10% × (venit net − CAS − CASS deductibilă); diferența CASS
//   până la minimul de 6 salarii nu este deductibilă;
//   CAS 25% de la 12 salarii minime inclusiv (bază 12 minime între 12–24,
//   respectiv 24 minime de la pragul de 24 inclusiv);
//   CASS 10% pe venitul net, plafon 72 minime; sub 6 minime se poate datora
//   diferența până la minim, cu excepțiile prevăzute de Codul fiscal;
//   rotunjire Math.round (confirmat din codul ANAF al Declarației Unice).
//
// La normă de venit, norma ține locul venitului net la plafoanele CAS/CASS, iar
// impozitul de 10% se aplică pe normă fără deducerea contribuțiilor — deducerea
// din art. 118 alin. (2) este rezervată veniturilor stabilite în sistem real.

import { useState } from "react";
import {
  calculeazaPFA,
  calculeazaPfaNormaVenit,
  venitNetPfaPentruRamas,
  PLAFON_NORMA_VENIT_LEI,
} from "@/lib/pfa";
import {
  calculeazaSrl,
  CONTABILITATE_SRL_IMPLICIT,
  PLAFON_MICRO_LEI,
  type RezultatSrl,
} from "@/lib/forme-juridice";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(Math.round(n));
const doarCifre = (s: string) => s.replace(/\D/g, "");
const grupeazaMii = (raw: string) => {
  const n = Number(raw);
  return raw && Number.isFinite(n) ? new Intl.NumberFormat("ro-RO").format(n) : "";
};

type Regim = "real" | "norma";
type Mod = "venit" | "net";

const LUNI_PE_AN = 12;
/** Forma juridică afișată în tabelul de rezultat. */
type Forma = "pfa" | "micro" | "profit";
type Snap = {
  regim: Regim;
  mod: Mod;
  incasari: string;
  cheltuieli: string;
  norma: string;
  netDorit: string;
  luni: string;
  salariatPestePlafonCASS: boolean;
  pensionar: boolean;
  handicapGravAccentuat: boolean;
  student: boolean;
};
const snapKey = (s: Snap) => JSON.stringify([
  s.regim,
  s.mod,
  s.incasari,
  s.cheltuieli,
  s.norma,
  s.netDorit,
  s.luni,
  s.salariatPestePlafonCASS,
  s.pensionar,
  s.handicapGravAccentuat,
  s.student,
]);

const optiuniDinSnap = (s: Snap) => ({
  salariatPestePlafonCASS: s.salariatPestePlafonCASS,
  pensionar: s.pensionar,
  handicapGravAccentuat: s.handicapGravAccentuat,
  student: s.student,
});

type Rezultat =
  | {
      tip: "real";
      r: ReturnType<typeof calculeazaPFA>;
      /** Comparația cu SRL cere cifra de afaceri, pe care o avem doar în modul
       *  „din venit anual"; la calculul invers nu știm cum se împarte în
       *  încasări și cheltuieli, iar impozitul micro se aplică pe încasări. */
      srl: { micro: RezultatSrl; profit: RezultatSrl; venituri: number } | null;
    }
  | {
      tip: "norma";
      r: ReturnType<typeof calculeazaPfaNormaVenit>;
      /** Încasările efective declarate, 0 dacă utilizatorul nu le-a completat. */
      incasari: number;
      /** Baza pe care se afișează „rămâne la tine": încasările reale sau, în lipsa lor, norma. */
      baza: number;
      ramas: number;
      /** Taxele aceluiași an dacă persoana ar fi în sistem real; null fără încasări. */
      totalTaxeReal: number | null;
      pestePragulDeIesire: boolean;
    };

function buildResult(s: Snap): Rezultat | null {
  const optiuni = optiuniDinSnap(s);

  if (s.regim === "norma") {
    const norma = Number(s.norma) || 0;
    if (norma <= 0) return null;

    const r = calculeazaPfaNormaVenit(norma, optiuni);
    const incasari = Number(s.incasari) || 0;
    const cheltuieli = Number(s.cheltuieli) || 0;

    // Cheltuielile nu reduc baza la normă, dar reduc banii rămași efectiv.
    const baza = incasari > 0 ? incasari - cheltuieli : norma;
    const venitNetReal = Math.max(0, incasari - cheltuieli);

    return {
      tip: "norma",
      r,
      incasari,
      baza,
      ramas: baza - r.totalTaxe,
      totalTaxeReal: incasari > 0 ? calculeazaPFA(venitNetReal, optiuni).totalTaxe : null,
      pestePragulDeIesire: incasari > PLAFON_NORMA_VENIT_LEI,
    };
  }

  let venitNet: number;
  // Formularul cere sume LUNARE (ca SOLO, locul 1 pe „calculator pfa”), dar
  // toata fiscalitatea PFA e anuala: plafoanele CAS/CASS se raporteaza la
  // venitul net ANUAL. Conversia se face AICI, la granita de intrare, si
  // nicaieri altundeva — tot ce urmeaza ramane in lei/an, neatins.
  // Cate luni ai activitate. Fara asta, cine lucreaza jumatate de an ar primi
  // taxele unui an intreg: introduce 8.000/luna si i-am calcula 96.000 venit.
  // Gol sau 0 inseamna anul intreg; peste 12 nu are sens, deci se limiteaza.
  const luni = Math.min(LUNI_PE_AN, Math.max(1, Number(s.luni) || LUNI_PE_AN));
  const venituri = (Number(s.incasari) || 0) * luni;
  const cheltuieli = (Number(s.cheltuieli) || 0) * luni;
  if (s.mod === "venit") {
    venitNet = Math.max(0, venituri - cheltuieli);
  } else {
    const lunar = Number(s.netDorit) || 0;
    if (lunar <= 0) return null;
    venitNet = venitNetPfaPentruRamas(lunar * 12, optiuni);
  }
  if (venitNet <= 0) return null;

  // Ipoteza fixa, nu intrebare: acesta e un calculator PFA, iar contabilitatea
  // in partida dubla e un cost care exista doar la SRL. Ramane declarata in
  // rezultat — randul „Cheltuieli (inclusiv contabilitate)” si nota de sub tabel.
  const contabilitate = CONTABILITATE_SRL_IMPLICIT;
  const optiuniSrl = { cheltuialaContabilitate: contabilitate };

  return {
    tip: "real",
    r: calculeazaPFA(venitNet, optiuni),
    srl:
      s.mod === "venit" && venituri > 0
        ? {
            venituri,
            micro: calculeazaSrl(venituri, cheltuieli, { tip: "micro", ...optiuniSrl }),
            profit: calculeazaSrl(venituri, cheltuieli, { tip: "profit", ...optiuniSrl }),
          }
        : null,
  };
}

// ─── Tokens ──────────────────────────────────────────────────────────────────
const fieldLabel = "mb-2 block text-xs font-medium text-stone-500";
const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";
const cellL = "border-b border-r border-stone-300 px-3 py-3 text-left";
const cellR = "border-b border-stone-300 px-3 py-3 text-right tabular-nums whitespace-nowrap";

function MoneyField({ id, label, hint, value, placeholder, unit = "lei / an", onChange, onEnter }: {
  id: string; label: string; hint?: string; value: string; placeholder?: string; unit?: string;
  onChange: (v: string) => void; onEnter: () => void;
}) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className={fieldLabel}>{label}</label>
      {hint && <span className="mb-2 block text-xs text-stone-500">{hint}</span>}
      <div className="flex w-full overflow-hidden rounded border border-stone-300 transition focus-within:border-stone-400 focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)]">
        <input id={id} name={id} type="text" inputMode="numeric" value={grupeazaMii(value)}
          onChange={(e) => onChange(doarCifre(e.target.value))}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onEnter(); } }}
          placeholder={placeholder || "0"}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base leading-7 text-stone-900 outline-none" />
        <span className="flex items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-500">{unit}</span>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full cursor-pointer items-center justify-between border-b border-stone-100 py-3 text-left text-sm text-stone-700 last:border-b-0"
    >
      <span>{label}</span>
      <span aria-hidden="true" className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${checked ? "bg-stone-900" : "bg-stone-300"}`}>
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-surface shadow-soft transition-transform ${checked ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

function Row({ label, value, sub, neg, bold }: { label: string; value: string; sub?: boolean; neg?: boolean; bold?: boolean }) {
  return (
    <tr className={bold ? "bg-canvas" : undefined}>
      <td className={`${cellL} ${sub ? "pl-4 sm:pl-8" : ""} ${bold ? "font-bold text-stone-900" : ""}`} dangerouslySetInnerHTML={{ __html: label }} />
      <td className={`${cellR} ${bold ? "font-bold text-stone-900" : ""}`}>{neg ? "− " : ""}{value}</td>
    </tr>
  );
}

export default function CalculatorPFA() {
  // Regimul e FIXAT pe sistem real din 3 septembrie 2026. Comutatorul era
  // prima intrebare a formularului si cea mai greu de raspuns: regimul nu se
  // alege liber (depinde de activitate si de plafon, art. 69 alin. (9)), deci
  // ceream o alegere care pentru majoritate e deja determinata.
  //
  // Codul pentru norma NU s-a sters — ramurile de mai jos raman corecte si
  // acoperite de test-pfa.mts. Norma isi primeste pagina proprie, ca sa poata
  // tinti interogari proprii; atunci se reactiveaza de aici. Nu o reintroduce
  // in acest formular.
  // `as Regim` e intentionat: fara el, TypeScript ingusteaza constanta la
  // tipul literal "real" si marcheaza ramurile de norma drept cod mort, ceea ce
  // rupe build-ul. Asa raman verificate de tipuri si nu putrezesc pana la
  // pagina normei.
  const regim = "real" as Regim;
  // Fixat pe „din venit” din 3 septembrie 2026, odata cu trecerea la sume
  // lunare. Calculul invers („vreau sa-mi ramana X”) ramane implementat in
  // buildResult si acoperit de teste; daca se reactiveaza, se reintroduce si
  // comutatorul. `as Mod` impiedica ingustarea la tipul literal.
  const mod = "venit" as Mod;
  const [incasari, setIncasari] = useState("");
  const [cheltuieli, setCheltuieli] = useState("");
  const [norma, setNorma] = useState("");
  const [netDorit, setNetDorit] = useState("");
  const [luni, setLuni] = useState("");
  const [forma, setForma] = useState<Forma>("pfa");
  const [salariatPestePlafonCASS, setSalariatPestePlafonCASS] = useState(false);
  const [pensionar, setPensionar] = useState(false);
  const [handicapGravAccentuat, setHandicapGravAccentuat] = useState(false);
  const [student, setStudent] = useState(false);
  const [avansat, setAvansat] = useState(false);

  const [rez, setRez] = useState<Rezultat | null>(null);
  const [rezKey, setRezKey] = useState("");
  const [warn, setWarn] = useState(false);

  const snap: Snap = { regim, mod, incasari, cheltuieli, norma, netDorit, luni, salariatPestePlafonCASS, pensionar, handicapGravAccentuat, student };
  const stale = rez !== null && rezKey !== snapKey(snap);

  // Câmpul pe care îl focalizăm când lipsește informația obligatorie.
  const campObligatoriu = regim === "norma" ? "pfa-norma" : mod === "venit" ? "pfa-incasari" : "pfa-netdorit";

  const handleCalc = () => {
    const r = buildResult(snap);
    if (!r) {
      setWarn(true);
      if (typeof window !== "undefined") document.getElementById(campObligatoriu)?.focus();
      return;
    }
    setWarn(false);
    setRez(r); setRezKey(snapKey(snap));
    if (typeof window !== "undefined") {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      document.getElementById(isMobile ? "pfa-rezultat" : "pfa-layout")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };


  const tab = (active: boolean, extra = "") =>
    `${extra} flex-1 inline-flex min-h-11 items-center justify-center px-2 text-sm font-medium transition-colors ${active ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-canvas"}`;

  // Comparația între forme e disponibilă doar când avem cifra de afaceri.
  const srl = rez !== null && rez.tip === "real" ? rez.srl : null;
  // Dacă utilizatorul comută pe „din net lunar", tabelul revine la PFA.
  const formaActiva: Forma = srl === null ? "pfa" : forma;
  const rezultatSrl = srl === null ? null : formaActiva === "micro" ? srl.micro : formaActiva === "profit" ? srl.profit : null;

  // Ce rămâne pe fiecare formă, la aceleași încasări și cheltuieli. Micro intră
  // în clasament doar dacă e accesibilă: peste plafonul de 100.000 euro nu mai
  // este o opțiune, deci a o recomanda ar fi un sfat greșit.
  const microAccesibila = srl !== null && srl.venituri <= PLAFON_MICRO_LEI;
  const clasament =
    rez !== null && rez.tip === "real" && srl !== null
      ? [
          { forma: "pfa" as Forma, nume: "PFA în sistem real", ramas: rez.r.ramas },
          ...(microAccesibila ? [{ forma: "micro" as Forma, nume: "SRL micro", ramas: srl.micro.ramas }] : []),
          { forma: "profit" as Forma, nume: "SRL pe impozit pe profit", ramas: srl.profit.ramas },
        ].sort((a, b) => b.ramas - a.ramas)
      : null;

  // Baza barei: venitul net în sistem real, respectiv ce s-a încasat efectiv la normă.
  // Pentru SRL folosim aceeași bază ca la PFA, ca procentele să fie comparabile.
  const bazaBara = rez === null ? 0 : rez.tip === "real" ? rez.r.venitNet : rez.baza;
  const ramasBara =
    rez === null ? 0 : rez.tip === "real" ? (rezultatSrl ? rezultatSrl.ramas : rez.r.ramas) : rez.ramas;
  const ang = bazaBara > 0 ? Math.max(0, Math.min(100, Math.round((ramasBara / bazaBara) * 100))) : 0;

  return (
    <div id="pfa-layout" className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-5">
      {/* FORMULAR */}
      <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2">
        <h2 className={colHeader}>Date</h2>


        {regim === "real" ? (
          <>

            {mod === "venit" ? (
              <>
                <MoneyField id="pfa-incasari" label="Cât încasezi pe lună" unit="lei / lună" placeholder="ex: 8.000" value={incasari} onChange={(v) => { setIncasari(v); if (warn) setWarn(false); }} onEnter={handleCalc} />
                <MoneyField id="pfa-cheltuieli" label="Cheltuieli deductibile pe lună" unit="lei / lună" hint="Costurile activității (chirie, echipamente, transport…) – se scad din încasări, iar taxele se calculează pe ce rămâne." placeholder="ex: 2.000" value={cheltuieli} onChange={setCheltuieli} onEnter={handleCalc} />
                <MoneyField id="pfa-luni" label="Câte luni ai activitate în 2026" unit="luni" placeholder="ex: 12" value={luni} onChange={setLuni} onEnter={handleCalc} />
              </>
            ) : (
              <MoneyField id="pfa-netdorit" label="Vreau să-mi rămână" unit="lei / lună" hint="Suma netă pe care vrei s-o ai în mână, pe lună." placeholder="ex: 6.000" value={netDorit} onChange={(v) => { setNetDorit(v); if (warn) setWarn(false); }} onEnter={handleCalc} />
            )}
          </>
        ) : (
          <>
            <MoneyField
              id="pfa-norma"
              label="Norma anuală de venit"
              hint="Suma fixă stabilită de direcția regională a finanțelor publice pentru activitatea și județul tău. Taxele se calculează pe ea, nu pe cât încasezi."
              placeholder="ex: 40.000"
              value={norma}
              onChange={(v) => { setNorma(v); if (warn) setWarn(false); }}
              onEnter={handleCalc}
            />
            <MoneyField
              id="pfa-incasari"
              label="Încasări brute efective (opțional)"
              hint="Nu schimbă taxele, dar arată cât îți rămâne cu adevărat și dacă depășești pragul de ieșire de pe normă."
              placeholder="ex: 100.000"
              value={incasari}
              onChange={setIncasari}
              onEnter={handleCalc}
            />
            <MoneyField
              id="pfa-cheltuieli"
              label="Cheltuieli reale (opțional)"
              hint="La normă nu reduc baza de impozitare, dar reduc banii care îți rămân – și decid dacă sistemul real ar fi mai avantajos."
              placeholder="ex: 20.000"
              value={cheltuieli}
              onChange={setCheltuieli}
              onEnter={handleCalc}
            />
          </>
        )}

        <button type="button"
          className="mb-5 flex min-h-11 w-full items-center justify-center rounded border border-dashed border-stone-300 px-4 text-xs font-medium text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-700"
          onClick={() => {
            if (avansat) {
              // TOATE bifele, nu doar primele doua. Un comutator ramas activ
              // sub un panou inchis schimba rezultatul fara ca omul sa vada de ce.
              setSalariatPestePlafonCASS(false);
              setPensionar(false);
              setHandicapGravAccentuat(false);
              setStudent(false);
            }
            setAvansat(!avansat);
          }}>
          {/* Eticheta neutra, ca la SOLO. A trecut prin doua versiuni care numeau
              cazurile — „Calculator avansat", apoi „Sunt pensionar sau salariat" —
              si care aveau un defect comun: enumerau, deci trebuiau sa fie complete.
              Cu patru bife inauntru, orice enumerare fie se lungeste pe doua randuri,
              fie minte prin omisiune (un student citea „pensionar sau salariat” si
              trecea mai departe).

              Compromisul asumat: „Afiseaza optiuni” nu mai spune PE CINE priveste,
              deci cineva care nu se stie caz special poate sa nu deschida deloc.
              Legenda dinauntru — „In 2026 esti?” — preia sarcina asta imediat dupa
              deschidere. 3 septembrie 2026. */}
          {avansat ? "▲ Ascunde opțiunile" : "▼ Afișează opțiuni"}
        </button>

        {avansat && (
          <div className="mb-5">
            <span className={fieldLabel}>În 2026 ești?</span>
            {/* Doar „Angajat”, fara pragul de 24.300 lei. Pragul e real —
                art. 174 alin. (7) cere venituri salariale de cel putin 6 salarii
                minime — dar un angajat cu salariul minim pe un an intreg face
                12 × 4.050 = 48.600 lei, adica DUBLUL pragului. Ca sa cazi sub el
                trebuie sa fi lucrat sub sase luni.

                Eticheta cu prag cerea deci un calcul mental pentru un caz care
                aproape nu apare, si sugera ca pragul e o conditie obisnuita.
                Cazul-limita ramane necalculat corect pentru cine a lucrat cateva
                luni; e un compromis asumat in favoarea celor multi. */}
            <Toggle
              label="Angajat"
              checked={salariatPestePlafonCASS}
              onChange={setSalariatPestePlafonCASS}
            />
            <Toggle
              label="Persoană cu handicap grav sau accentuat"
              checked={handicapGravAccentuat}
              onChange={setHandicapGravAccentuat}
            />
            <Toggle
              label="Elev sau student, până în 26 de ani"
              checked={student}
              onChange={setStudent}
            />
            <Toggle
              label="Pensionar"
              checked={pensionar}
              onChange={setPensionar}
            />
          </div>
        )}

        <button type="button" onClick={handleCalc}
          className="block min-h-12 w-full rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-800 active:translate-y-px"
          aria-label="Calculează și navighează la rezultat">
          Calculează
        </button>
        {warn && (
          <p role="alert" className="mt-3 text-xs font-medium text-stone-900">
            {regim === "norma"
              ? "Introdu norma de venit mai întâi."
              : mod === "venit"
                ? "Introdu niște încasări mai întâi."
                : "Introdu cât vrei să-ți rămână pe lună."}
          </p>
        )}
      </div>

      {/* REZULTAT */}
      <div id="pfa-rezultat" className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3">
        <h2 className={colHeader}>Rezultat</h2>

        {stale && (
          <p className="mb-4 rounded border border-stone-300 bg-canvas px-3 py-2 text-xs text-stone-600" role="status">
            Ai modificat datele – apasă <strong className="font-medium text-stone-900">Calculează</strong> pentru a actualiza rezultatul.
          </p>
        )}

        {rez ? (
          <div className={stale ? "opacity-50 transition-opacity" : "transition-opacity"}>
            {srl !== null && clasament !== null && (
              <div className="mb-4">
                <span className={fieldLabel}>Dacă alegeai altă formă juridică</span>
                <div className="flex w-full overflow-hidden rounded border border-stone-300">
                  <button type="button" className={tab(formaActiva === "pfa")} onClick={() => setForma("pfa")}>PFA</button>
                  <button type="button" className={tab(formaActiva === "micro", "border-l border-stone-300")} onClick={() => setForma("micro")}>SRL micro</button>
                  <button type="button" className={tab(formaActiva === "profit", "border-l border-stone-300")} onClick={() => setForma("profit")}>SRL profit</button>
                </div>
                <p className="mt-3 text-sm leading-normal text-stone-700">
                  {clasament[0].ramas - clasament[1].ramas < 1_000 ? (
                    <>
                      La cifrele tale, <strong className="font-bold text-stone-900">{clasament[0].nume}</strong> și{" "}
                      <strong className="font-bold text-stone-900">{clasament[1].nume}</strong> ies aproape la fel –
                      diferența e de doar {fmt(clasament[0].ramas - clasament[1].ramas)} lei pe an, sub marja ipotezei
                      de contabilitate.
                    </>
                  ) : (
                    <>
                      La cifrele tale ieși cel mai bine cu{" "}
                      <strong className="font-bold text-stone-900">{clasament[0].nume}</strong>: îți rămân{" "}
                      <strong className="font-bold text-stone-900">{fmt(clasament[0].ramas)} lei</strong>, cu{" "}
                      {fmt(clasament[0].ramas - clasament[1].ramas)} lei peste {clasament[1].nume}.
                    </>
                  )}
                </p>
                {srl.venituri > PLAFON_MICRO_LEI && (
                  <p role="status" className="mt-3 rounded border border-stone-900 bg-surface px-3 py-2 text-xs leading-normal text-stone-700">
                    <strong className="font-bold text-stone-900">Peste plafonul micro.</strong> Cu {fmt(srl.venituri)} lei
                    depășești {fmt(PLAFON_MICRO_LEI)} lei (100.000 euro), deci varianta microîntreprindere nu îți este
                    accesibilă pentru anul următor.
                  </p>
                )}
              </div>
            )}

            <div className="overflow-hidden rounded border border-stone-300">
              <table className="w-full table-auto border-collapse text-sm text-stone-700 [&_td]:align-middle [&_th]:align-middle sm:table-fixed">
                <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                <thead>
                  <tr>
                    <th className="border-b border-r border-b-stone-300 border-r-stone-300 bg-canvas px-3 py-3 text-left text-sm font-medium text-stone-700">Indicator fiscal</th>
                    <th className="border-b border-stone-300 bg-canvas px-3 py-3 text-right text-sm font-medium text-stone-700">Sumă</th>
                  </tr>
                </thead>
                <tbody>
                  {rezultatSrl ? (
                    <>
                      <Row label="Venituri (cifra de afaceri)" value={fmt(rezultatSrl.venituri)} />
                      <Row label='Cheltuieli <span class="text-stone-400">(inclusiv contabilitate)</span>' value={fmt(rezultatSrl.cheltuieli)} sub neg />
                      <Row
                        label={'Cost salariu minim <span class="text-stone-400">' + (rezultatSrl.tip === "micro" ? "(obligatoriu la micro)" : "(opțional, dar reduce impozitul)") + "</span>"}
                        value={fmt(rezultatSrl.costSalarial)}
                        sub
                        neg
                      />
                      <Row
                        label={rezultatSrl.tip === "micro" ? 'Impozit micro <span class="text-stone-400">(1% pe venituri)</span>' : 'Impozit pe profit <span class="text-stone-400">(16%)</span>'}
                        value={fmt(rezultatSrl.impozitFirma)}
                        sub
                        neg
                      />
                      <Row label="Dividende brute" value={fmt(rezultatSrl.dividendeBrute)} />
                      <Row label='Impozit pe dividende <span class="text-stone-400">(16%)</span>' value={fmt(rezultatSrl.impozitDividende)} sub neg />
                      <Row
                        label={'CASS pe dividende <span class="text-stone-400">' + (rezultatSrl.cassDividende > 0 ? "(pe trepte, nu procent)" : "(sub 6 salarii minime)") + "</span>"}
                        value={fmt(rezultatSrl.cassDividende)}
                        sub
                        neg
                      />
                      <Row label='Salariu net încasat <span class="text-stone-400">(se adaugă)</span>' value={fmt(rezultatSrl.salariuNet)} sub />
                      <Row label="Total taxe la stat" value={fmt(rezultatSrl.totalTaxe)} bold />
                      <tr className="bg-stone-900">
                        <td className="border-r border-r-stone-600 px-3 py-3 text-left text-sm font-bold text-white">Rămâne la tine</td>
                        <td className="px-3 py-3 text-right text-sm font-bold tabular-nums whitespace-nowrap text-white">{fmt(rezultatSrl.ramas)}</td>
                      </tr>
                    </>
                  ) : (
                    <>
                      {rez.tip === "real" ? (
                        <Row label={mod === "net" ? "Venit net necesar" : "Venit net (încasări − cheltuieli)"} value={fmt(rez.r.venitNet)} />
                      ) : (
                        <>
                          <Row label="Normă de venit (bază de calcul)" value={fmt(rez.r.norma)} />
                          {rez.incasari > 0 && (
                            <Row label='Încasări efective <span class="text-stone-400">(nu schimbă taxele)</span>' value={fmt(rez.incasari)} sub />
                          )}
                        </>
                      )}
                      <Row label='CAS <span class="text-stone-400">(Pensii − 25%)</span>' value={fmt(rez.r.cas)} sub neg />
                      <Row label='CASS <span class="text-stone-400">(Sănătate − 10%)</span>' value={fmt(rez.r.cass)} sub neg />
                      {rez.r.cassDiferentaMinima > 0 && (
                        <Row label='din care diferență până la minimul CASS <span class="text-stone-400">(nedeductibilă)</span>' value={fmt(rez.r.cassDiferentaMinima)} sub />
                      )}
                      <Row
                        label={rez.tip === "real" ? "Impozit pe venit (10%)" : 'Impozit pe venit <span class="text-stone-400">(10% pe normă, fără deducerea contribuțiilor)</span>'}
                        value={fmt(rez.r.impozit)}
                        sub
                        neg
                      />
                      <Row label="Total taxe la stat" value={fmt(rez.r.totalTaxe)} bold />
                      <tr className="bg-stone-900">
                        <td className="border-r border-r-stone-600 px-3 py-3 text-left text-sm font-bold text-white">
                          Rămâne la tine
                          {rez.tip === "norma" && rez.incasari === 0 && (
                            <span className="block text-xs font-normal text-white/70">dacă încasezi exact cât norma</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right text-sm font-bold tabular-nums whitespace-nowrap text-white">
                          {fmt(rez.tip === "real" ? rez.r.ramas : rez.ramas)}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 overflow-hidden rounded border border-stone-300">
              <table className="w-full table-auto border-collapse text-sm text-stone-700 [&_td]:align-middle sm:table-fixed">
                <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                <tbody>
                  <tr className="bg-canvas">
                    <td className="border-r border-stone-300 px-3 py-3 text-left text-sm font-bold text-stone-700">Rămâne pe lună (≈)</td>
                    <td className="px-3 py-3 text-right text-sm font-bold tabular-nums whitespace-nowrap text-stone-900">
                      {fmt(ramasBara / 12)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Comparația directă a celor două regimuri, la aceleași cifre reale. */}
            {rez.tip === "norma" && rez.totalTaxeReal !== null && (
              <div className="mt-3 rounded border border-stone-300 bg-canvas p-4">
                <h3 className="mb-2 text-xs font-medium text-stone-500">La aceleași cifre, în sistem real</h3>
                {rez.totalTaxeReal === rez.r.totalTaxe ? (
                  <p className="text-sm leading-normal text-stone-700">
                    Taxele ar fi identice: <strong className="font-bold text-stone-900">{fmt(rez.totalTaxeReal)} lei</strong>.
                  </p>
                ) : (
                  <p className="text-sm leading-normal text-stone-700">
                    Ai plăti <strong className="font-bold text-stone-900">{fmt(rez.totalTaxeReal)} lei</strong> taxe, adică{" "}
                    {rez.totalTaxeReal > rez.r.totalTaxe ? (
                      <>
                        cu <strong className="font-bold text-stone-900">{fmt(rez.totalTaxeReal - rez.r.totalTaxe)} lei mai mult</strong>{" "}
                        decât pe normă. La cifrele astea, norma de venit este mai avantajoasă.
                      </>
                    ) : (
                      <>
                        cu <strong className="font-bold text-stone-900">{fmt(rez.r.totalTaxe - rez.totalTaxeReal)} lei mai puțin</strong>{" "}
                        decât pe normă. La cifrele astea, sistemul real este mai avantajos.
                      </>
                    )}
                  </p>
                )}
                <p className="mt-2 text-xs leading-normal text-stone-500">
                  Comparație orientativă la aceleași încasări și cheltuieli. Trecerea de la un regim la altul nu este
                  liberă oricând: depinde de activitate, de opțiunea depusă și de pragul de mai jos.
                </p>
              </div>
            )}

            {rez.tip === "norma" && rez.pestePragulDeIesire && (
              <p role="status" className="mt-3 rounded border border-stone-900 bg-surface px-3 py-2 text-xs leading-normal text-stone-700">
                <strong className="font-bold text-stone-900">Ai depășit pragul de {fmt(PLAFON_NORMA_VENIT_LEI)} lei</strong>{" "}
                (echivalentul a 25.000 euro) la încasări brute. Dacă anul se încheie așa, din anul fiscal următor treci
                obligatoriu la determinarea venitului net în sistem real.
              </p>
            )}

            <div className="mt-3">
              <div className="flex h-10 w-full overflow-hidden rounded border border-dashed border-stone-300 text-xs font-medium" role="img" aria-label={`Din venitul net, ${ang}% rămâne la tine și ${100 - ang}% merge la stat.`}>
                <div className="flex min-w-0 items-center justify-start overflow-hidden whitespace-nowrap bg-stone-900 px-3 text-white" style={{ flexGrow: ang, flexBasis: 0 }}>Tu {ang}%</div>
                <div className="flex min-w-0 items-center justify-end overflow-hidden whitespace-nowrap border-l border-dashed border-stone-300 bg-canvas px-3 text-stone-700" style={{ flexGrow: 100 - ang, flexBasis: 0 }}>Stat {100 - ang}%</div>
              </div>
              <p className="mt-2 text-xs text-stone-500">
                {rez.tip === "real"
                  ? "Din venitul net: cât rămâne la tine și cât la stat."
                  : rez.incasari > 0
                    ? "Din încasările efective, minus cheltuieli: cât rămâne la tine și cât la stat."
                    : "Dacă încasezi exact cât norma: cât rămâne la tine și cât la stat."}
              </p>
            </div>

            <p className="mt-4 text-xs leading-normal text-stone-500">
              {rezultatSrl ? (
                <>
                  Estimare pentru {rezultatSrl.tip === "micro" ? "SRL microîntreprindere" : "SRL cu impozit pe profit"},
                  an fiscal 2026, pe ipoteze explicite: proprietarul e și salariat la nivelul salariului minim, iar tot
                  profitul se distribuie ca dividende în același an, după 1 ianuarie 2026, deci cu impozit de 16%.
                  Cota micro este 1% pe venituri – tranșa de 3% a fost eliminată prin OUG 89/2025. CASS pe dividende se
                  datorează pe trepte de 6, 12 și 24 de salarii minime, calculate pe dividendul net. Schimbă salariul,
                  momentul distribuirii sau costul de contabilitate și rezultatul se mută – confirmă cu un contabil.
                </>
              ) : rez.tip === "real" ? (
                <>
                  PFA în sistem real, an fiscal 2026 (reper salariu minim 4.050 lei). Sub 12 salarii minime (48.600 lei)
                  nu datorezi CAS obligatoriu. Calculul folosește baza CAS minimă a tranșei; poți alege o bază mai mare
                  în Declarația unică. Estimare orientativă – pentru situații speciale confirmă cu un contabil.
                </>
              ) : (
                <>
                  PFA la normă de venit, an fiscal 2026 (reper salariu minim 4.050 lei). Norma ține locul venitului net:
                  ea se compară cu plafoanele CAS și CASS, indiferent cât încasezi. Impozitul de 10% se aplică pe normă,
                  fără deducerea contribuțiilor. Estimare orientativă – pentru situații speciale confirmă cu un contabil.
                </>
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded border border-stone-300 text-stone-600" aria-hidden="true">
              <table className="w-full table-auto border-collapse text-sm [&_td]:align-middle [&_th]:align-middle sm:table-fixed">
                <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                <thead>
                  <tr>
                    <th className="border-b border-r border-b-stone-300 border-r-stone-300 bg-canvas px-3 py-3 text-left text-sm font-medium text-stone-700">Indicator fiscal</th>
                    <th className="border-b border-stone-300 bg-canvas px-3 py-3 text-right text-sm font-medium text-stone-700">Sumă</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className={`${cellL} font-medium`}>{regim === "norma" ? "Normă de venit" : "Venit net"}</td><td className={cellR}>–</td></tr>
                  <tr><td className={`${cellL} pl-4 sm:pl-8`}>CAS (Pensii)</td><td className={cellR}>–</td></tr>
                  <tr><td className={`${cellL} pl-4 sm:pl-8`}>CASS (Sănătate)</td><td className={cellR}>–</td></tr>
                  <tr><td className={`${cellL} pl-4 sm:pl-8`}>Impozit pe venit</td><td className={cellR}>–</td></tr>
                  <tr className="bg-canvas"><td className={`${cellL} font-bold`}>Total taxe la stat</td><td className={cellR}>–</td></tr>
                  <tr className="bg-stone-900">
                    <td className="border-r border-r-stone-600 px-3 py-3 text-left text-sm font-bold text-white">Rămâne la tine</td>
                    <td className="px-3 py-3 text-right text-sm font-bold text-white/80">–</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-stone-500">
              Completează datele și apasă Calculează · CAS 25%, CASS 10%, impozit 10% · Plafoane 2026
            </p>
          </>
        )}
        {rez && <FeedbackContextual />}
      </div>
    </div>
  );
}
