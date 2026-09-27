import Link from "@/app/components/Link";
import date from "@/data/cerinte-meserii.json";

/**
 * Primul ecran al meseriilor fără o cifră verificată (27 septembrie 2026): ce cer și ce oferă
 * angajatorii, din anunțurile citite (≥ 20) sau din ofertele depuse la ANOFM (≥ 15). Înlocuiește
 * caseta cu media INS a sectorului și rândurile „sursa nu are încă date”, pe care proprietarul
 * le-a respins: nu erau despre meserie. Fără nicio sumă. Datele: scripts/colectare/baza.mjs.
 */

type Rand = { eticheta: string; valori: { v: string; p: number }[] };
type Cerinte = { sursa: "anunturi" | "anofm"; n: number; randuri: Rand[] };

const D = date as unknown as { luna: string; meserii: Record<string, Cerinte> };
export const cerinteMeserie = (slug: string): Cerinte | null =>
  Object.hasOwn(D.meserii, slug) && D.meserii[slug].randuri.length ? D.meserii[slug] : null;

const CARD = "rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6";

export default function CeCerAngajatorii({ slug, de }: { slug: string; de: string }) {
  const c = cerinteMeserie(slug);
  if (!c) return null;
  return (
    <section className={`mt-6 ${CARD}`} data-salary-kind="cerinte-angajatori">
      <h2 className="text-base font-semibold text-stone-900">Ce cer angajatorii unui {de}</h2>
      <p className="mt-1 text-xs text-stone-600">
        {c.sursa === "anunturi"
          ? `Din ${c.n.toLocaleString("ro-RO")} anunțuri de angajare citite în ${D.luna}. Procentul arată în câte anunțuri apare.`
          : `Din ${c.n.toLocaleString("ro-RO")} oferte depuse de angajatori la ANOFM, active în ${D.luna}.`}
      </p>
      <dl className="mt-4 divide-y divide-stone-100">
        {c.randuri.map((r) => (
          <div key={r.eticheta} className="grid gap-1 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt className="text-sm text-stone-600">{r.eticheta}</dt>
            <dd className="text-sm text-stone-900">
              {r.valori.map((v, i) => (
                <span key={v.v}>
                  {i > 0 && ", "}
                  {v.v} <span className="text-stone-500">{v.p}%</span>
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-stone-600">
        <Link href={`/salarii/acoperire#${slug}`} className="underline underline-offset-2">Sursele pentru meseria asta</Link>
      </p>
    </section>
  );
}
