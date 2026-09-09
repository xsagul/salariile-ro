import Link from 'next/link';
import type { DateMeserie } from '@/lib/meserii';
import { piloniMeserie, convergentaPiloni, type Pilon } from '@/lib/repere-meserii';

const lei = (n: number) => `${Math.round(n).toLocaleString('ro-RO')} lei`;

function cifra(p: Pilon) {
  if (p.valoare !== null) return lei(p.valoare);
  if (p.interval) return `${lei(p.interval.min)} – ${lei(p.interval.max)}`;
  // „Nu avem" spune ca am incercat si n-am reusit. Cand meseria e platita dupa
  // grila legala, anuntul e instrumentul gresit, iar asta se scrie pe fata.
  if (p.motivLipsa) return 'nu se măsoară aici';
  if (p.stare === 'insuficient') return 'date insuficiente';
  // Pentru anunturi lipsa e a colectarii noastre, care continua; pentru o sursa
  // externa pe care doar o citam, nu.
  return p.cheie === 'anunturi' ? 'încă necolectat' : 'nu avem';
}

/**
 * Trei surse care raspund la trei intrebari diferite. Nu se pondereaza intr-o
 * singura cifra: o medie a lor nu ar avea nicio sursa care s-o sustina.
 */
export default function PiloniSalariu({ date }: { date: DateMeserie }) {
  const piloni = piloniMeserie(date);
  const c = convergentaPiloni(piloni);
  const nume = date.meserie.nume.toLowerCase();
  return (
    <section className="mt-8" id="piloni" data-piloni={piloni.filter(p => p.stare !== 'lipsa').length}>
      <h2 className="text-xl font-bold text-stone-900 sm:text-2xl">Trei surse despre cât se câștigă ca {nume}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-700">
        Fiecare răspunde la altă întrebare: cât se oferă la angajare, cât declară cine lucrează deja acolo, cât s-a
        plătit efectiv. Le arătăm separat, ca să vezi unde sunt de acord și unde nu.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {piloni.map((p, i) => (
          <div key={p.cheie} className="rounded-md border border-stone-300 bg-surface p-4" data-pilon={p.cheie} data-stare={p.stare}>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Pilonul {i + 1}</p>
            <p className="mt-1 text-sm font-medium text-stone-700">{p.titlu}</p>
            <p className={`mt-2 font-bold tracking-tight text-stone-900 ${p.valoare !== null ? 'text-2xl' : 'text-lg'}`}>{cifra(p)}</p>
            <p className="mt-1 text-xs text-stone-600">net / lună · {p.concept}</p>
            {p.n !== null && p.n > 0 && <p className="mt-1 text-xs text-stone-600">{p.n} anunțuri verificate</p>}
            {p.motivLipsa && <p className="mt-1 text-xs text-stone-600">{p.motivLipsa}</p>}
            <p className="mt-2 text-xs text-stone-600">
              {p.url.startsWith('/')
                ? <Link className="underline underline-offset-2" href={p.url}>{p.sursa}</Link>
                : <a className="underline underline-offset-2" href={p.url} rel="nofollow noopener">{p.sursa}</a>}
            </p>
          </div>
        ))}
      </div>
      {c && (
        <p className="mt-4 max-w-3xl rounded-md border border-stone-200 bg-canvas p-4 text-sm leading-relaxed text-stone-700">
          {c.raspandire <= 0.15
            ? <>Cele {c.puncte.length} repere comparabile cad între <strong>{lei(c.min)}</strong> și <strong>{lei(c.max)}</strong> net pe lună.
              Surse independente, cu metode diferite, ajung aproximativ în același loc — este cel mai puternic semnal pe care îl putem da.</>
            : <>Cele {c.puncte.length} repere comparabile se întind de la <strong>{lei(c.min)}</strong> la <strong>{lei(c.max)}</strong> net pe lună,
              o diferență de {Math.round(c.raspandire * 100)}%. Nu este o eroare de măsurare: dacă ofertele sunt sub ce arată statistica,
              postul se scoate la angajare mai jos decât câștigă cine e deja acolo. Exact asta e util de știut înainte de a accepta o ofertă.</>}
        </p>
      )}
    </section>
  );
}
