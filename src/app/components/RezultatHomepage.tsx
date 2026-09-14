import Link from "@/app/components/Link";
import type { Rezultat } from "@/lib/fiscal";

const numar = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

/** Prezentare compactă; toate sumele vin din motorul fiscal existent. */
export default function RezultatHomepage({ rezultat, brut, mod, stale }: {
  rezultat: Rezultat | null;
  brut: number;
  mod: "brut" | "net";
  stale: boolean;
}) {
  const invers = mod === "net";
  const randuri: [string, number][] = rezultat ? [
    ["Salariu brut", brut],
    ["CAS · pensie", rezultat.cas],
    ["CASS · sănătate", rezultat.cass],
    ["Impozit pe venit", rezultat.impozit],
    ["Salariu net în bani", rezultat.netBani],
  ] : [];

  return (
    <>
      <div className="rounded bg-stone-900 px-5 py-5 text-white sm:px-6 sm:py-6" role="status" aria-live="polite" aria-atomic="true">
        <h2 className="text-sm font-medium">{invers ? "Salariul brut estimat" : "Salariul tău net"}</h2>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-3">
          <span className="break-all text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
            {rezultat ? numar(invers ? brut : rezultat.netBani) : "—"}
          </span>
          <span className="text-sm">lei / lună</span>
        </p>
        <p className="mt-3 text-sm leading-relaxed">
          {stale ? "Date modificate. Apasă Calculează pentru noul rezultat." : rezultat
            ? invers ? `Pentru ${numar(rezultat.netBani)} lei net în bani.` : `Banii primiți din ${numar(brut)} lei brut.`
            : "Introdu suma și apasă Calculează."}
        </p>
      </div>

      {rezultat ? (
        <>
          {invers && <p className="mt-3 text-xs leading-relaxed text-stone-600">Netul rezultat poate diferi ușor de suma cerută, din cauza rotunjirilor.</p>}
          {rezultat.tichete > 0 && <p className="mt-3 text-sm text-stone-700">Separat, pe cardul de masă: <strong>{numar(rezultat.tichete)} lei</strong>. Taxele pe tichete sunt deja reținute din netul în bani.</p>}
          <dl className="mt-2 text-sm">
            <div className="flex justify-between gap-4 border-b border-stone-200 py-3">
              <dt>Contribuții și impozit</dt><dd className="whitespace-nowrap font-medium text-stone-900">{numar(rezultat.cas + rezultat.cass + rezultat.impozit)} lei</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt>Cost total angajator</dt><dd className="whitespace-nowrap font-medium text-stone-900">{numar(rezultat.costTotal)} lei</dd>
            </div>
          </dl>
          <details className="group border-y border-stone-200">
            <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm font-medium text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden">
              Vezi calculul și taxele <span aria-hidden="true" className="group-open:hidden">+</span><span aria-hidden="true" className="hidden group-open:inline">−</span>
            </summary>
            <table className="mb-3 w-full text-sm">
              <caption className="sr-only">Defalcarea salariului și a costului angajatorului</caption>
              <tbody>
                {randuri.map(([label, value]) => <tr key={label} className="border-b border-stone-200"><th scope="row" className="py-2 pr-3 text-left font-normal">{label}</th><td className="py-2 text-right whitespace-nowrap">{numar(value)} lei</td></tr>)}
                <tr><th scope="row" className="py-2 pr-3 text-left font-normal">CAM · plătită de angajator</th><td className="py-2 text-right whitespace-nowrap">{numar(rezultat.cam)} lei</td></tr>
              </tbody>
            </table>
            <p className="mb-3 text-xs leading-relaxed text-stone-600">Deducere personală: {numar(rezultat.deducerePersonala)} lei. Bază impozabilă: {numar(rezultat.bazaCalculImpozit)} lei. Sumă netaxabilă aplicată: {numar(rezultat.facilitate)} lei. Deducerea reduce baza impozitului; nu este o reținere din salariu.</p>
          </details>
        </>
      ) : <p className="mt-4 max-w-prose text-sm leading-relaxed text-stone-600">Aici vei vedea suma calculată, taxele reținute și costul total pentru angajator.</p>}
      <p className="mt-3 text-xs leading-relaxed text-stone-600">Calcul pentru iulie–decembrie 2026. <Link href="/metodologie" className="underline underline-offset-2">Metodologie și limite</Link></p>
    </>
  );
}
