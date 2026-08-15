import Link from "next/link";

export default function FeedbackContextual({ context = "calcul" }: { context?: "calcul" | "pdf" }) {
  return (
    <p className="mt-4 text-xs leading-relaxed text-stone-500" data-md-strip>
      {context === "pdf" ? "PDF-ul are o problemă?" : "Rezultatul pare greșit?"}{" "}
      <Link href={`/contact#eroare-${context}`} className="font-medium text-stone-700 underline underline-offset-2 hover:text-stone-900">
        Semnalează eroarea
      </Link>
      . Nu include date personale sau salariale în mesaj.
    </p>
  );
}
