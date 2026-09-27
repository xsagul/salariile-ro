import Link from "@/app/components/Link";
import { calculStandard } from "@/lib/fiscal";
import { grilaPublica } from "@/lib/grile-publice";
import { grilaEducatie } from "@/lib/repere-meserii";

/**
 * Primul ecran al meseriilor plătite după grila legii (27 septembrie 2026), la fel ca
 * salariul-concluzie: o cifră, brutul ei, vârful grilei și câteva trepte. Aici nu e nevoie de
 * anunțuri: salariul îl stabilește legea. Cifra e salariul de pornire, înainte de vechime și
 * sporuri; tabelul complet al grilei rămâne mai jos, pe pagină. Fără anul actului în primul
 * ecran (CLAUDE.md, „Niciun an vechi în prima parte a paginii”).
 */

type Treapta = { eticheta: string; brut: number; net: number };

const lei = (n: number) => n.toLocaleString("ro-RO");
const CARD = "rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6";

/** Rândurile grilei didactice au denumirea lungă din lege; pe card ajunge treapta, scurt. */
function etichetaDidactica(functie: string, studii: string, vechime: string) {
  const treapta = /debutant/i.test(functie) ? "Debutant" : /grad didactic II\b/i.test(functie) ? "Gradul II"
    : /grad didactic I\b/i.test(functie) ? "Gradul I" : /definitiv/i.test(functie) ? "Definitiv" : functie;
  const s = studii === "S" ? "studii superioare" : studii === "SSD" ? "studii superioare scurte" : "studii medii";
  return treapta === "Debutant" ? `${treapta}, ${s}` : `${treapta}, ${vechime}, ${s}`;
}

export function trepteGrila(slug: string): { trepte: Treapta[]; domeniu: string; numeSuma: string } | null {
  const didactic = grilaEducatie(slug);
  if (didactic.length) {
    const trepte = didactic.flatMap((r) => {
      const net = calculStandard(r.iun2024)?.net;
      return net == null ? [] : [{ eticheta: etichetaDidactica(r.functie, r.studii, r.vechime), brut: r.iun2024, net }];
    });
    return { trepte, domeniu: "școlile și grădinițele de stat", numeSuma: "salariul de bază" };
  }
  const g = grilaPublica(slug);
  if (!g || g.doarSectiune || !g.trepte.length) return null;
  return { trepte: g.trepte.map((t) => ({ eticheta: t.eticheta, brut: t.brut, net: t.net })), domeniu: g.domeniu, numeSuma: g.numeSuma };
}

export default function SalariuGrila({ slug, de }: { slug: string; de: string }) {
  const g = trepteGrila(slug);
  if (!g || !g.trepte.length) return null;
  const dupaSuma = [...g.trepte].sort((a, b) => a.net - b.net);
  // Pornirea: treapta de debut, dacă grila o are; altfel cea mai mică sumă.
  const start = g.trepte.find((t) => /debutant|stagiar|anul i\b|soldat/i.test(t.eticheta)) ?? dupaSuma[0];
  const varf = dupaSuma[dupaSuma.length - 1];
  const mijloc = dupaSuma[Math.floor(dupaSuma.length / 2)];
  const repere = [start, mijloc, varf].filter((t, i, a) => a.findIndex((x) => x.eticheta === t.eticheta) === i);
  const suma = g.numeSuma.replace(/\s*brut(ă|a)?(?=\s|$)/i, "");
  // Unde treptele sunt deja pe vechime (profesori, judecători), vin peste doar sporurile.
  const cuVechime = g.trepte.some((t) => /\bani\b/.test(t.eticheta));

  return (
    <section className={`mt-6 ${CARD}`} data-salary-kind="grila-legala" data-salary-primary={start.net}>
      <p className="text-xs font-medium text-stone-700">Cât ia în mână un {de} la început, după lege</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{lei(start.net)} lei net</p>
      <p className="mt-1 text-base text-stone-700">≈ {lei(start.brut)} lei brut pe lună</p>
      <p className="mt-1 text-sm text-stone-600">
        {suma.charAt(0).toUpperCase() + suma.slice(1)} din grila legii, la treapta „{start.eticheta}”. {cuVechime ? "Sporurile vin peste." : "Vechimea și sporurile vin peste."}
      </p>
      {varf.net > start.net && (
        <p className="mt-3 text-base text-stone-700">
          Ajunge la <strong className="font-semibold text-stone-900">{lei(varf.net)} lei net</strong> la treapta cea mai înaltă:{" "}
          {varf.eticheta}.
        </p>
      )}
      {repere.length > 1 && (
        <dl className={`mt-4 grid gap-2 sm:gap-3 ${repere.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {repere.map((t) => (
            <div key={t.eticheta} className="rounded-md border border-stone-200 p-2.5 sm:p-3">
              <dt className="text-xs text-stone-600">{t.eticheta}</dt>
              <dd className="mt-1 text-base font-semibold text-stone-900">{lei(t.net)} lei</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-4 text-xs text-stone-600">
        Din grila legii salarizării în vigoare, pentru {g.domeniu} · {g.trepte.length} trepte în tabelul de mai jos ·{" "}
        <Link href={`/salarii/acoperire#${slug}`} className="underline underline-offset-2">toate sursele</Link>
      </p>
    </section>
  );
}
