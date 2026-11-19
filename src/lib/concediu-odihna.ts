// src/lib/concediu-odihna.ts
// Calculul indemnizației de concediu de odihnă, al zilelor proporționale
// și al compensării în bani la încetarea contractului:
//   - Codul Muncii (Legea nr. 53/2003), art. 145–150.

import { calculStandard } from "@/lib/fiscal";

export const MINIM_ZILE_CONCEDIU_AN = 20;
export const URL_CODUL_MUNCII = "https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646";

export const TEMEI_CONCEDIU_ODIHNA = {
  durata: "Codul Muncii, art. 145 alin. (1)",
  proportional: "Codul Muncii, art. 145 alin. (2)",
  compensare: "Codul Muncii, art. 146 alin. (3)",
  indemnizatie: "Codul Muncii, art. 150",
} as const;

export type IntrareIndemnizatieCO = {
  /** Salariul de bază + sporuri permanente din contract (brut lunar). */
  salariuBrutContract: number;
  /** Media veniturilor brute lunare din ultimele 3 luni (include bonusuri/sporuri lunare). */
  mediaBruta3Luni?: number;
  /** Numărul de zile lucrătoare din luna concediului (implicit 21). */
  zileLucratoareLuna: number;
  /** Numărul de zile lucrătoare de concediu efectuate în acea lună. */
  zileConcediu: number;
};

export type RezultatIndemnizatieCO = {
  tarifZilnicContract: number;
  tarifZilnic3Luni: number;
  tarifZilnicAplicat: number;
  /** True când media ultimelor 3 luni depășește salariul de bază curent. */
  castigaMedia3Luni: boolean;
  zileLucrate: number;
  zileConcediu: number;
  brutConcediu: number;
  brutZileLucrate: number;
  totalBrutLuna: number;
  netLunaTotal: number;
  netConcediuEstimat: number;
  netLunaFaraConcediu: number;
  diferentaNetFataDeNormal: number;
};

export function calculeazaIndemnizatieCO(input: IntrareIndemnizatieCO): RezultatIndemnizatieCO | null {
  const brut = Number(input.salariuBrutContract);
  const media3 = input.mediaBruta3Luni !== undefined && input.mediaBruta3Luni > 0 ? Number(input.mediaBruta3Luni) : brut;
  const zileLuna = Math.round(Number(input.zileLucratoareLuna));
  const zileCO = Math.round(Number(input.zileConcediu));

  if (!Number.isFinite(brut) || brut <= 0) return null;
  if (!Number.isFinite(media3) || media3 <= 0) return null;
  if (!Number.isFinite(zileLuna) || zileLuna < 18 || zileLuna > 23) return null;
  if (!Number.isFinite(zileCO) || zileCO < 1 || zileCO > zileLuna) return null;

  const tarifZilnicContract = brut / zileLuna;
  const tarifZilnic3Luni = media3 / zileLuna;
  // Art. 150 alin. (1)-(2) Codul Muncii: indemnizația nu poate fi mai mică decât
  // salariul de bază și sporurile permanente din contract.
  const tarifZilnicAplicat = Math.max(tarifZilnicContract, tarifZilnic3Luni);
  const castigaMedia3Luni = tarifZilnic3Luni > tarifZilnicContract + 0.01;

  const zileLucrate = zileLuna - zileCO;
  const brutConcediu = Math.round(tarifZilnicAplicat * zileCO);
  const brutZileLucrate = Math.round(tarifZilnicContract * zileLucrate);
  const totalBrutLuna = zileLucrate === 0 ? brutConcediu : brutConcediu + brutZileLucrate;

  const calcTotal = calculStandard(totalBrutLuna);
  const calcNormal = calculStandard(brut);
  if (!calcTotal || !calcNormal) return null;

  const netConcediuEstimat = totalBrutLuna > 0 ? Math.round((calcTotal.net * brutConcediu) / totalBrutLuna) : 0;

  return {
    tarifZilnicContract,
    tarifZilnic3Luni,
    tarifZilnicAplicat,
    castigaMedia3Luni,
    zileLucrate,
    zileConcediu: zileCO,
    brutConcediu,
    brutZileLucrate,
    totalBrutLuna,
    netLunaTotal: calcTotal.net,
    netConcediuEstimat,
    netLunaFaraConcediu: calcNormal.net,
    diferentaNetFataDeNormal: calcTotal.net - calcNormal.net,
  };
}

export type IntrareZileProportionale = {
  /** Numărul de zile de concediu de odihnă pe an din contract (minim legal 20). */
  zilePeAn: number;
  /** Luni lucrate în anul calendaristic (1–12, acceptă zecimale). */
  luniLucrate: number;
  /** Zile de concediu deja efectuate în anul respectiv. */
  zileEfectuate: number;
  /** Salariul brut lunar, pentru estimarea compensării în bani la încetarea contractului. */
  salariuBrut: number;
  /** Zile lucrătoare lunare medii (implicit 21). */
  zileLucratoareMedii?: number;
};

export type RezultatZileProportionale = {
  zileCuveniteExact: number;
  /** Rotunjit în sus la zi întreagă în favoarea salariatului. */
  zileCuveniteRotunjite: number;
  zileRamase: number;
  brutCompensare: number;
  netCompensareEstimat: number;
};

export function calculeazaZileProportionale(input: IntrareZileProportionale): RezultatZileProportionale | null {
  const zilePeAn = Math.round(Number(input.zilePeAn));
  const luni = Number(input.luniLucrate);
  const efectuate = Math.max(0, Math.round(Number(input.zileEfectuate)));
  const brut = Number(input.salariuBrut);
  const zileMedii = Math.round(Number(input.zileLucratoareMedii ?? 21));

  if (!Number.isFinite(zilePeAn) || zilePeAn < MINIM_ZILE_CONCEDIU_AN || zilePeAn > 60) return null;
  if (!Number.isFinite(luni) || luni <= 0 || luni > 12) return null;
  if (!Number.isFinite(brut) || brut <= 0) return null;

  const zileCuveniteExact = (zilePeAn * luni) / 12;
  const zileCuveniteRotunjite = Math.ceil(zileCuveniteExact - 1e-9);
  const zileRamase = Math.max(0, zileCuveniteRotunjite - efectuate);
  const brutCompensare = Math.round((brut / zileMedii) * zileRamase);

  // Compensarea în bani la încetarea contractului se taxează ca venit salarial (CAS 25%, CASS 10%, impozit 10%).
  const calcCuComp = calculStandard(brut + brutCompensare);
  const calcFara = calculStandard(brut);
  const netCompensareEstimat =
    zileRamase === 0
      ? 0
      : calcCuComp && calcFara
        ? Math.max(0, calcCuComp.net - calcFara.net)
        : Math.round(brutCompensare * 0.585);

  return {
    zileCuveniteExact,
    zileCuveniteRotunjite,
    zileRamase,
    brutCompensare,
    netCompensareEstimat,
  };
}
