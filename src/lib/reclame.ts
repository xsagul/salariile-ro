// src/lib/reclame.ts
//
// Proprietarul unic al reclamelor: contul AdSense, unitățile de anunț, starea lor și
// felul în care arată un slot. Paginile Next folosesc componenta Reclama, paginile
// Worker-ului (hubul de anunțuri) folosesc htmlReclama; amândouă citesc de aici.
//
// Mandatul proprietarului din 15 octombrie 2026 (CLAUDE.md): maximizarea veniturilor.
// Regulile de plasare, care protejează chiar venitul (traficul organic și contul):
//   - nu în calculator și nici între datele introduse și rezultat;
//   - nu în formulare, în widgeturi (layout-ul embed nu încarcă AdSense deloc) sau pe
//     paginile legale și de contact;
//   - spațiu rezervat cu dimensiunea exactă a reclamei, deci pagina nu sare când vine;
//   - eticheta „Publicitate” deasupra, ca reclama să nu se confunde cu conținutul.
//
// Auto ads (ancoră, vinietă, laterale) se pornesc din contul AdSense, nu de aici. Ce e
// pornit acolo nu se vede din cod; se verifică în cont.

export const ADSENSE_CLIENT = "ca-pub-5894290637571256";

/**
 * Întrerupătorul sloturilor din cod. `false` le scoate pe toate, la următorul deploy,
 * fără să atingă unitățile de mai jos (de exemplu, dacă Core Web Vitals din teren se strică).
 */
export const RECLAME_PORNITE = true;

/**
 * Unitățile de anunț din contul AdSense (Ads → By ad unit → Display ads, dimensiune
 * „Responsive”). Valoarea e `data-ad-slot`, numai cifre; un slot fără unitate nu randează nimic.
 *
 * 15 octombrie 2026: proprietarul a creat o singură unitate, „salariile” (5847831779), folosită
 * deocamdată pe toate plasările. O unitate separată pe plasare ar arăta în raportul AdSense unde se
 * câștigă; se înlocuiește aici, fără altă schimbare de cod.
 */
export const UNITATI = {
  /** Sub calculatoare: după rezultat și după tabelul cu detalii, niciodată între ele. */
  calculator: "5847831779",
  /** În articole și în paginile informative (zile libere, salariul minim, meserii). */
  continut: "5847831779",
  /** Hubul de locuri de muncă: în lista de anunțuri și sub descrierea unui anunț. */
  anunturi: "5847831779",
} as const;

export type PlasareReclama = keyof typeof UNITATI;

/** ID-ul unității pentru o plasare, sau null când slotul nu se afișează. */
export function unitate(plasare: PlasareReclama): string | null {
  const id: string = UNITATI[plasare];
  return RECLAME_PORNITE && /^\d{6,}$/.test(id) ? id : null;
}

export const ETICHETA_RECLAMA = "Publicitate";

// Dimensiune fixă pe lățimea ecranului (metoda AdSense „dimensiune exactă pe lățime”, fără
// `data-ad-format`): 300×250 sub 368 px, 336×280 de la 368 px. Rezervată din HTML, deci reclama
// nu împinge nimic când se încarcă. 368 = 336 + marginile de 16 px ale paginii.
export const CLASA_SLOT_RECLAMA = "flex w-full flex-col items-center gap-1";
export const CLASA_ETICHETA_RECLAMA = "text-xs text-stone-600";
export const CLASA_INS_RECLAMA = "adsbygoogle inline-block h-[250px] w-[300px] min-[368px]:h-[280px] min-[368px]:w-[336px]";

/**
 * Slotul pentru paginile randate ca text de Worker (hubul de anunțuri). Cererea către AdSense e
 * scriptul inline de după `<ins>`, ca în codul oficial; CSP-ul hubului permite scripturile inline.
 * `element` e `li` când slotul stă într-o listă de anunțuri.
 */
export function htmlReclama(plasare: PlasareReclama, clasa = "", element: "aside" | "li" = "aside"): string {
  const id = unitate(plasare);
  if (!id) return "";
  return `<${element} aria-label="${ETICHETA_RECLAMA}" class="${CLASA_SLOT_RECLAMA} ${clasa}" data-reclama="${plasare}"><span class="${CLASA_ETICHETA_RECLAMA}">${ETICHETA_RECLAMA}</span><ins class="${CLASA_INS_RECLAMA}" style="display:inline-block" data-ad-client="${ADSENSE_CLIENT}" data-ad-slot="${id}"></ins><script>(window.adsbygoogle=window.adsbygoogle||[]).push({})</script></${element}>`;
}
