import Link from "@/app/components/Link";
import type { Limba } from "@/lib/calculator-texte";

// Invitatia de a semnala o greseala, sub rezultat. Are nevoie de limba pentru
// ca apare si in calculatorul de pe /en/salary-calculator — un indemn in romana
// sub un tabel in engleza arata ca o scapare, si chiar este una.

const TEXTE = {
  ro: {
    calcul: "Rezultatul pare greșit?",
    pdf: "PDF-ul are o problemă?",
    semnaleaza: "Semnalează eroarea",
    avertisment: ". Nu include date personale sau salariale în mesaj.",
  },
  en: {
    calcul: "Does the result look wrong?",
    pdf: "Is there a problem with the PDF?",
    semnaleaza: "Report the error",
    avertisment: ". Please do not include personal or salary details in the message.",
  },
} as const;

export default function FeedbackContextual({
  context = "calcul",
  limba = "ro",
}: {
  context?: "calcul" | "pdf";
  limba?: Limba;
}) {
  const t = TEXTE[limba];
  return (
    <p className="mt-4 text-xs leading-relaxed text-stone-600" data-md-strip>
      {context === "pdf" ? t.pdf : t.calcul}{" "}
      <Link href={`/contact#eroare-${context}`} className="font-medium text-stone-700 underline underline-offset-2 hover:text-stone-900">
        {t.semnaleaza}
      </Link>
      {t.avertisment}
    </p>
  );
}
