import type { InputState } from "@/lib/fiscal";

export interface CampuriFluturas {
  sporOre: string;
  sporuri: string;
  normaOre: string;
  oreLucrate: string;
}

/**
 * Compune venitul brut realizat pentru fluturaș și atașează contextul fiscal
 * care nu poate fi dedus sigur doar din suma brută: tipul normei contractuale
 * și fracția de lună. `oreNormaIntreaga` este norma legală a lunii afișate.
 */
export function compuneFluturas(
  inp: InputState,
  extra: CampuriFluturas,
  oreNormaIntreaga: number,
) {
  const baza = parseFloat(inp.brut) || 0;
  const sporProc = parseFloat(extra.sporOre) || 0;
  const fixe = parseInt(extra.sporuri) || 0;
  const normaIntreagaLuna = Math.max(1, Math.round(oreNormaIntreaga));
  const oreNorma = Math.max(1, parseInt(extra.normaOre) || normaIntreagaLuna);
  const oreLucrateTotal = extra.oreLucrate === ""
    ? oreNorma
    : Math.max(0, parseInt(extra.oreLucrate) || 0);
  const oreSupl = Math.max(0, oreLucrateTotal - oreNorma);
  const oreLucrate = Math.min(oreNorma, oreLucrateTotal);

  // Norma contractuală este distinctă de o lună parțial lucrată: dacă norma
  // introdusă este sub norma legală a lunii, contractul este tratat ca part-time
  // și nu primește facilitatea. La normă întreagă, raportul orelor proratează
  // facilitatea OUG 89/2025 pentru fracția de lună efectiv realizată.
  const normaContract: NonNullable<InputState["normaContract"]> =
    oreNorma < normaIntreagaLuna ? "partiala" : "intreaga";
  const fractieLuna = normaContract === "intreaga" ? oreLucrate / oreNorma : 1;
  const bazaRealizata = Math.round(baza * (oreLucrate / oreNorma));
  const plataSupl = baza > 0 && oreSupl > 0
    ? Math.round((baza / oreNorma) * oreSupl * (1 + sporProc / 100))
    : 0;
  const brutCompus = bazaRealizata + plataSupl + fixe;

  return {
    input: {
      ...inp,
      brut: String(brutCompus),
      salariuDeBaza: String(baza),
      normaContract,
      fractieLuna,
    } as InputState,
    baza,
    bazaRealizata,
    plataSupl,
    fixe,
    oreNorma,
    oreLucrate,
    oreSupl,
    normaContract,
    fractieLuna,
  };
}
