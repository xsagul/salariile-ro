import marturii from "@/data/marturii-meserii.json";

/**
 * Ce spune cineva din meserie despre venitul pe care nu-l publică nimeni (bacșiș, ture), sub cifră.
 * E o mărturie, nu o statistică, și cardul o numește așa (13 noiembrie 2026: barmanul, de la
 * proprietar, care a lucrat ca barman). Date: src/data/marturii-meserii.json.
 */
type Marturie = { titlu: string; text: string; data: string };
const M = (marturii as unknown as { meserii: Record<string, Marturie> }).meserii;

export default function MarturieMeserie({ slug }: { slug: string }) {
  if (!Object.hasOwn(M, slug)) return null;
  const m = M[slug];
  return (
    <section className="mt-6 rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6" data-section="marturie">
      <h2 className="text-base font-semibold text-stone-900">{m.titlu}</h2>
      <p className="mt-2 text-base leading-relaxed text-stone-700">{m.text}</p>
      <p className="mt-3 text-xs text-stone-600">Mărturia cuiva care a lucrat în meserie, {m.data}. Nu e o medie măsurată.</p>
    </section>
  );
}
