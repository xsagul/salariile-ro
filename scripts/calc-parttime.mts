// Calcul temporar pentru draft-urile /salariu-minim: netul angajatului la normă
// parțială (facilitatea nu se aplică — cere normă întreagă cu bază = minim).
import { calculStandard } from "../src/lib/fiscal";

for (const [ore, brut] of [["8h", 4325], ["6h", 3244], ["4h", 2163], ["2h", 1081]] as const) {
  const r = calculStandard(brut);
  console.log(ore, "brut", brut, "→", JSON.stringify(r));
}
