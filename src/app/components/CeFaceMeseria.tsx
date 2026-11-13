import esco from "@/data/esco-meserii.json";

/**
 * „Ce face un …”, imediat sub cifră, ca la Paylab (13 noiembrie 2026: paginile cu un singur card
 * păreau goale dedesubt). Textul nu e scris de noi: e descrierea ocupației din clasificarea
 * europeană ESCO (Comisia Europeană), în română, cu aptitudinile și cunoștințele ei esențiale.
 * Date: src/data/esco-meserii.json, generat de scripts/date/genereaza-esco.mjs.
 */

type Esco = { titlu: string; uri: string; descriere: string; face: string[]; stie: string[] };
const E = (esco as unknown as { meserii: Record<string, Esco> }).meserii;
const CARD = "rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6";

export const areCeFace = (slug: string) => Object.hasOwn(E, slug) && !!E[slug].descriere;

export default function CeFaceMeseria({ slug, de }: { slug: string; de: string }) {
  if (!areCeFace(slug)) return null;
  const e = E[slug];
  const face = e.face.slice(0, 6);
  // Unele descrieri ESCO au 700–860 de caractere; pe telefon, primele fraze până pe la 380.
  const fraze = e.descriere.match(/[^.!?]+[.!?]+/g) ?? [e.descriere];
  let descriere = "";
  for (const f of fraze) { if (descriere.length >= 200 && (descriere + f).length > 380) break; descriere += f; }
  descriere = descriere.trim() || e.descriere;
  const stie = e.stie.slice(0, 5);
  return (
    <section className={`mt-6 ${CARD}`} data-section="ce-face">
      <h2 className="text-base font-semibold text-stone-900">Ce face un {de}</h2>
      <p className="mt-2 text-base leading-relaxed text-stone-700">{descriere}</p>
      {face.length > 0 && (
        <>
          <h3 className="mt-4 text-sm font-semibold text-stone-900">Ce face în mod obișnuit</h3>
          <ul className="mt-2 grid gap-x-6 gap-y-1.5 text-sm text-stone-700 sm:grid-cols-2">
            {face.map((x) => (
              <li key={x} className="flex gap-2"><span aria-hidden="true" className="text-stone-400">•</span><span>{x[0].toLocaleUpperCase("ro-RO") + x.slice(1)}</span></li>
            ))}
          </ul>
        </>
      )}
      {stie.length > 0 && (
        <p className="mt-4 text-sm text-stone-600">
          <span className="font-semibold text-stone-900">Ce trebuie să știe:</span> {stie.join(", ")}.
        </p>
      )}
      <p className="mt-4 text-xs text-stone-600">
        Din{" "}
        <a href={`https://esco.ec.europa.eu/ro/classification/occupation?uri=${encodeURIComponent(e.uri)}`} className="underline underline-offset-2" rel="noopener">
          clasificarea europeană a ocupațiilor ESCO
        </a>
        , ocupația „{e.titlu}”.
      </p>
    </section>
  );
}
