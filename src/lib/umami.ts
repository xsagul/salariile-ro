export type UmamiEvent =
  | { name: "calcul-finalizat"; data: { mod: "brut-net" | "net-brut"; context: "principal" | "fluturas" } }
  | { name: "mod-calcul"; data: { mod: "brut-net" | "net-brut" } }
  | { name: "calcul-pfa"; data: { regim: "real" | "norma"; mod: "venit-anual" | "net-lunar" } }
  | { name: "descarca-fluturas"; data: { context: "calculator" | "pagina-fluturas" } }
  | { name: "copiaza-link-calcul"; data: { mod: "brut-net" | "net-brut" } }
  | { name: "copiaza-embed"; data: { varianta: "minimal" | "complet" | "fluturas" } };

type UmamiWindow = Window & {
  umami?: { track: (name: string, data?: Record<string, string>) => void };
};

/** Emite numai categorii finite; tipurile nu permit sume, text liber sau PII. */
export function trackUmami(event: UmamiEvent): void {
  if (typeof window === "undefined") return;
  (window as UmamiWindow).umami?.track(event.name, event.data);
}
