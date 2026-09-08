import type { DateMeserie } from '@/lib/meserii';
import { grilaPublica } from '@/lib/grile-publice';
import { grilaEducatie } from '@/lib/repere-meserii';
import { calculStandard } from '@/lib/fiscal';

/**
 * Treptele grilei, imediat sub cifra principala. Cea mai cautata intrebare la o
 * meserie bugetara nu e „cat castiga un profesor", ci „cat castiga un profesor
 * debutant": treapta de inceput are singura mai multe cautari decat termenul
 * general. Tabelul complet ramane mai jos in pagina; aici sta raspunsul scurt,
 * fara sa fie nevoie de derulare.
 */
export default function TrepteRapide({ date }: { date: DateMeserie }) {
  const didactic = grilaEducatie(date.meserie.slug);
  const grila = grilaPublica(date.meserie.slug);
  const trepte = didactic.length
    ? didactic.map(r => ({ eticheta: r.functie, net: calculStandard(r.iun2024)!.net }))
    : grila?.trepte.map(t => ({ eticheta: t.eticheta, net: t.net })) ?? [];
  if (trepte.length < 2) return null;

  const dupaSuma = [...trepte].sort((a, b) => a.net - b.net);
  const debutanti = trepte.filter(t => /debutant|stagiar|an i\b/i.test(t.eticheta));
  const debut = debutanti.length ? debutanti.reduce((min, t) => (t.net < min.net ? t : min)) : dupaSuma[0];
  const varf = dupaSuma[dupaSuma.length - 1];
  // La invatamant etichetele difera abia dupa cincizeci de caractere — „Profesor,
  // educator-puericultor studii superioare de lunga durata gradul I". Taiata la
  // inceput, treapta devine indistinctibila, asa ca se scoate partea comuna.
  const cuvinte = (t: string) => t.split(/\s+/);
  const comun = (() => {
    const a = cuvinte(debut.eticheta), b = cuvinte(varf.eticheta);
    let i = 0;
    while (i < a.length - 1 && i < b.length - 1 && a[i].toLowerCase() === b[i].toLowerCase()) i++;
    return i;
  })();
  const scurt = (t: string) => {
    const rest = cuvinte(t).slice(comun).join(' ') || t;
    const final = rest.length > 44 ? cuvinte(rest).slice(-4).join(' ') : rest;
    return final.charAt(0).toLocaleUpperCase('ro-RO') + final.slice(1);
  };

  return (
    <section className="mt-4 rounded-md border border-stone-300 bg-surface p-5" data-trepte={trepte.length}>
      <h2 className="text-sm font-semibold text-stone-900">
        Cât câștigă un {date.meserie.de} la început și la vârf
      </h2>
      <dl className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-stone-600">{scurt(debut.eticheta)}</dt>
          <dd className="mt-1 text-2xl font-bold tracking-tight text-stone-900">
            {debut.net.toLocaleString('ro-RO')} lei net
          </dd>
        </div>
        {varf.net > debut.net && (
          <div>
            <dt className="text-xs text-stone-600">{scurt(varf.eticheta)}</dt>
            <dd className="mt-1 text-2xl font-bold tracking-tight text-stone-900">
              {varf.net.toLocaleString('ro-RO')} lei net
            </dd>
          </div>
        )}
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-stone-600">
        Salariu de bază la gradația 0, convertit în net. Peste el vin gradațiile de vechime și sporurile.
        Toate cele {trepte.length} trepte sunt mai jos în pagină.
      </p>
    </section>
  );
}
