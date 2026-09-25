import Link from "@/app/components/Link";
import type { DateMeserie } from '@/lib/meserii';
import { piloniMeserie, convergentaPiloni, type Pilon } from '@/lib/repere-meserii';
import { TITLU_SECTIUNE, INAINTE_DE_SECTIUNE } from "@/app/components/ui";

const lei = (n: number) => `${Math.round(n).toLocaleString('ro-RO')} lei`;

const areDate = (p: Pilon) => p.valoare !== null || !!p.interval;

function cifra(p: Pilon) {
  if (p.valoare !== null) return lei(p.valoare);
  if (p.interval) return `${lei(p.interval.min)} – ${lei(p.interval.max)}`;
  return '';
}

/**
 * De ce lipsește o sursă, într-o frază. Regulile rămân cele de dinainte: când
 * meseria e plătită după grila legală, anunțul e instrumentul greșit și asta se
 * spune pe față; cu câteva anunțuri sub prag, „prea puține"; la o sursă externă
 * pe care doar o citam, „nu are încă date". Nicăieri „0 anunțuri".
 */
function lipsa(p: Pilon) {
  if (p.motivLipsa && !p.n) return p.motivLipsa;
  if (p.stare === 'insuficient') return 'Sunt încă prea puține date ca să dăm o cifră.';
  return p.cheie === 'anunturi' ? 'Nu le-am colectat încă.' : 'Sursa nu are încă date pentru această meserie.';
}

/**
 * Sursele care răspund la întrebări diferite: cât se oferă la angajare, cât
 * declară cine lucrează deja, cât prevede legea. Nu se amestecă într-o singură
 * cifră: o medie a lor n-ar avea nicio sursă care s-o susțină.
 *
 * Rescris pe 24 septembrie 2026: pe majoritatea meseriilor, două din trei
 * carduri spuneau doar „nu se măsoară aici" și „nu avem". Acum apar doar
 * sursele cu date; celelalte primesc un rând. Dacă rămâne o singură sursă, ea e
 * deja cifra din partea de sus a paginii și nu se mai repetă.
 */
export default function PiloniSalariu({ date }: { date: DateMeserie }) {
  const piloni = piloniMeserie(date);
  const cuDate = piloni.filter(areDate);
  const faraDate = piloni.filter((p) => !areDate(p));
  const c = convergentaPiloni(piloni);
  const nume = date.meserie.nume.toLowerCase();
  if (cuDate.length < 2 && faraDate.length === 0) return null;

  return (
    <section className={INAINTE_DE_SECTIUNE} id="piloni" data-piloni={piloni.filter(p => p.stare !== 'lipsa').length}>
      {cuDate.length > 1 && (
        <>
          <h2 className={TITLU_SECTIUNE}>Ce spun sursele despre salariul de {nume}</h2>
          <p className="mt-2 max-w-3xl text-sm text-stone-700">
            Fiecare măsoară altceva, așa că le arătăm separat.
          </p>
          <div className={`mt-5 grid gap-4 ${cuDate.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
            {cuDate.map((p) => (
              <div key={p.cheie} className="rounded-md border border-stone-300 bg-surface p-4" data-pilon={p.cheie} data-stare={p.stare}>
                <p className="text-sm font-medium text-stone-700">{p.titlu}</p>
                <p className={`mt-2 font-bold tracking-tight text-stone-900 ${p.valoare !== null ? 'text-2xl' : 'text-lg'}`}>{cifra(p)}</p>
                <p className="mt-1 text-xs text-stone-600">net pe lună · {p.concept}</p>
                {p.n !== null && p.n > 0 && <p className="mt-1 text-xs text-stone-600">din {p.n} anunțuri verificate</p>}
                <p className="mt-2 text-xs text-stone-600">
                  {p.url.startsWith('/')
                    ? <Link className="underline underline-offset-2" href={p.url}>{p.sursa}</Link>
                    : <a className="underline underline-offset-2" href={p.url} rel="nofollow noopener">{p.sursa}</a>}
                </p>
              </div>
            ))}
          </div>
          {c && (
            <p className="mt-4 max-w-3xl rounded-md border border-stone-200 bg-canvas p-4 text-sm text-stone-700">
              {c.raspandire <= 0.15
                ? <>Sursele ajung aproape în același loc, între <strong>{lei(c.min)}</strong> și <strong>{lei(c.max)}</strong> net
                  pe lună. Când metode diferite dau aceeași cifră, e cel mai sigur semn că e aproape de realitate.</>
                : <>Sursele se întind de la <strong>{lei(c.min)}</strong> la <strong>{lei(c.max)}</strong> net pe lună, cu{" "}
                  {Math.round(c.raspandire * 100)}% diferență. Dacă ofertele sunt sub ce câștigă cei care lucrează deja, merită
                  să negociezi: postul se scoate la angajare mai jos decât se plătește după câțiva ani.</>}
            </p>
          )}
        </>
      )}
      {faraDate.length > 0 && (
        <ul className="mt-4 max-w-3xl space-y-1 text-sm text-stone-600">
          {faraDate.map((p) => (
            <li key={p.cheie} data-pilon={p.cheie} data-stare={p.stare}>
              <span className="font-medium text-stone-700">{p.titlu}:</span> {lipsa(p)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
