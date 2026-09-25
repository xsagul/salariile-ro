// src/app/components/ui.tsx
// Primitive de layout + tipografie pentru paginile de conținut.
// Limbajul pilonului: stone monocrom, fără accent, tracking Inter, bg-canvas.
// <Prose> stilează automat h2/h3/p/ul/a/strong/table prin variante descendente.

import Link from "@/app/components/Link";
import type { ReactNode } from "react";

// Scara de text, decisă de proprietar pe 25 septembrie 2026, după comparația cu
// GOV.UK, BBC GEL, Carbon, Material 3, Tailwind, Primer, USWDS și Apple.
// Trepte: telefon sub 768 px, tabletă 768–1023, laptop mic 1024–1535, laptop
// de la 1536 (inclusiv 1920 px cu scalare 125%) și monitor mare.
//                        telefon  tabletă  laptop mic  laptop  PC mare
//   titlul paginii:        26       28        30         36      36
//   titlul de secțiune:    22       22        24         24      24
//   subtitlu în text:      18 peste tot
//   titlul de card:        16 bold peste tot
//   text de citit:         16 peste tot
//   text mic:              14 peste tot
// Secțiunea pe telefon a urcat de la 20 la 22 px în aceeași zi, la cererea
// proprietarului, după ce a privit homepage-ul pe telefon.
export const TITLU_PAGINA =
  "text-[26px] font-bold leading-tight tracking-[-0.02em] text-stone-900 md:text-[28px] lg:text-[30px] 2xl:text-4xl";
export const TITLU_SECTIUNE =
  "text-[22px] font-bold leading-tight tracking-[-0.02em] text-stone-900 lg:text-2xl";
/** Titlul de card fără margine, pentru cardurile care își pun singure spațierea. */
export const TITLU_CARD = "text-base font-bold tracking-[-0.01em] text-stone-900";

// Spațierea pe verticală, decisă de proprietar pe 25 septembrie 2026. Cifrele
// proprietarului sunt distanțe PERCEPUTE: de la ultimul semn vizibil (linie,
// margine de card, linia de bază a textului) la vârful literelor următoare.
// Marginile de aici sunt calculate din ele pentru Inter (vârful literei mari
// stă la lh/2 − 0,36·mărimea de marginea cutiei), apoi verificate prin măsurare.
//                                         telefon   de la 640 px
//   bara de sus → titlul paginii             30          44
//   titlul paginii → text                    24          28
//   deasupra unei secțiuni                   44          48
//   deasupra subtitlului                     30          38
//   paragraf → paragraf                      22          22
//   în carduri (text de 14 px):  titlu → text 20, paragraf sau punct → următorul 16
//   ultimul conținut → subsol                38          44
//   titlul secțiunii → text                  24          28
//   titlul cardului → text                   20          20
// Cu breadcrumb, el ia locul titlului sub bară, iar titlul vine la ~16/20 px
// sub el. Rândurile de pe salariu-minim și salariu-mediu repetă 38/42 ca
// variantă de copil (`[&>div]:`), pe care o constantă n-o poate exprima.
export const SPATIU_SUS = "pt-6 sm:pt-9 2xl:pt-[35px]";
export const SPATIU_JOS = "pb-[38px] sm:pb-[44px]";
const SECTIUNE_SUS = "pt-[38px] sm:pt-[42px]";
const SECTIUNE_JOS = "pb-[38px] sm:pb-[42px]";
export const SPATIU_SECTIUNE = `${SECTIUNE_SUS} ${SECTIUNE_JOS} sm:last:pb-[44px]`;
export const SEPARATOR_SECTIUNE = "mt-[38px] border-t border-stone-200 pt-[38px] sm:mt-[42px] sm:pt-[42px]";
/** O secțiune fără linie deasupra, după un card, tabel sau calculator. */
export const INAINTE_DE_SECTIUNE = "mt-[38px] sm:mt-[42px]";
/** O secțiune fără linie deasupra, direct după un paragraf. */
export const SECTIUNE_DUPA_TEXT = "mt-8 sm:mt-9";
/** Sub breadcrumb, până la titlul paginii. */
export const SUB_BREADCRUMB = "mb-1.5 sm:mb-2";
/** Între titlul paginii și fraza de sub el. */
export const SUB_TITLU = "mt-[11px] sm:mt-3.5 2xl:mt-3";
/** Sub un paragraf de text de 16 px, până la următorul. */
export const SPATIU_PARAGRAF = "mb-2.5";
/** Lista dintr-un card: text de 14 px, 16 px percepuți între puncte, sub cei 20 de sub titlu. */
export const LISTA_CARD = "flex flex-col gap-[5px] text-sm leading-normal";
/** Între două blocuri de text de 14 px dintr-un card. */
export const SPATIU_TEXT_CARD = "mt-[5px]";
/** Sub titlul unei secțiuni, când urmează text. */
export const SUB_TITLU_SECTIUNE = "mb-3 sm:mb-4";
/** Sub titlul unei secțiuni, când urmează direct carduri sau un tabel. */
export const SUB_TITLU_SECTIUNE_CUTIE = "mb-[18px] sm:mb-[22px]";
/** Lista de întrebări: prima întrebare stă la distanța de text sub titlu. */
export const LISTA_FAQ = "flex flex-col [&>details:first-child>summary]:pt-3 sm:[&>details:first-child>summary]:pt-4";

const PROSE = [
  "[&_h2]:mt-8 sm:[&_h2]:mt-9 [&_h2]:mb-3 sm:[&_h2]:mb-4 [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:tracking-[-0.02em] [&_h2]:text-stone-900 lg:[&_h2]:text-2xl",
  "[&>h2:first-child]:mt-0 [&>:last-child]:mb-0 [&_li:last-child]:mb-0",
  // După un card, un tabel sau o formulă, marginea de sus a titlului e marginea
  // vizibilă, deci distanța se ia de acolo, nu de la un rând de text.
  "[&>:is(figure,table,.table-wrap,section)+h2]:mt-[38px] sm:[&>:is(figure,table,.table-wrap,section)+h2]:mt-[42px]",
  // Și invers: un tabel direct sub titlu stă la distanța de card, nu de text.
  "[&_h2+:is(table,.table-wrap)]:mt-[18px] sm:[&_h2+:is(table,.table-wrap)]:mt-[22px]",
  "[&_h3]:mt-4 sm:[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:tracking-[-0.01em] [&_h3]:text-stone-900",
  "[&_p]:mb-2.5 [&_p]:text-base [&_p]:leading-normal [&_p]:tracking-[-0.01em] [&_p]:text-stone-600",
  "[&_ul]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-stone-600 [&_li]:mb-2 [&_li]:leading-normal [&_li]:tracking-[-0.01em]",
  // Pașii numerotați: fără stil propriu, preflight-ul Tailwind le ștergea cifrele.
  "[&_ol]:mb-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:text-stone-600",
  "[&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-stone-600",
  "[&_strong]:font-semibold [&_strong]:text-stone-900",
  "[&_em]:not-italic [&_em]:font-medium [&_em]:text-stone-900",
  // Tabele: card boxat (border rotunjit + header pe bg-canvas), linii de rând, tabular-nums.
  "[&_table]:my-6 [&_table]:w-full [&_table]:overflow-hidden [&_table]:rounded-md [&_table]:border [&_table]:border-stone-200 [&_table]:bg-surface [&_table]:shadow-soft [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:text-left [&_table]:text-sm [&_table]:tabular-nums [&_table]:text-stone-700",
  // .table-wrap (adăugat de noutati.ts în jurul tabelelor din markdown): scroll
  // orizontal propriu pe ecrane înguste, ca tabelul lat să nu lărgească pagina.
  "[&_.table-wrap]:my-6 [&_.table-wrap]:overflow-x-auto [&_.table-wrap>table]:my-0",
  "[&_thead_th]:border-b [&_thead_th]:border-stone-200 [&_thead_th]:bg-canvas [&_thead_th]:px-3 [&_thead_th]:py-3 [&_thead_th]:text-xs [&_thead_th]:font-medium [&_thead_th]:uppercase [&_thead_th]:tracking-wide [&_thead_th]:text-stone-600",
  "[&_tbody_td]:border-b [&_tbody_td]:border-stone-100 [&_tbody_td]:px-3 [&_tbody_td]:py-3",
  "[&_tbody_th]:border-b [&_tbody_th]:border-stone-100 [&_tbody_th]:px-3 [&_tbody_th]:py-3 [&_tbody_th]:font-medium [&_tbody_th]:text-stone-900",
  "[&_tbody_tr:last-child_td]:border-b-0",
  "[&_tbody_tr:last-child_th]:border-b-0",
  // Blocul de cod din Markdown (```) devine cardul de formulă din articole, cu
  // același aspect ca <Formula>. Doar `div > pre`, ca să nu dubleze bordura
  // cardului <Formula>, al cărui <pre> stă într-un <figure>.
  "[&_div>pre]:my-5 [&_div>pre]:overflow-x-auto [&_div>pre]:rounded-md [&_div>pre]:border [&_div>pre]:border-stone-200 [&_div>pre]:border-l-4 [&_div>pre]:border-l-stone-900 [&_div>pre]:bg-surface [&_div>pre]:px-4 [&_div>pre]:py-3 [&_div>pre]:font-mono [&_div>pre]:text-sm [&_div>pre]:leading-7 [&_div>pre]:text-stone-900 [&_div>pre]:shadow-soft",
  // .source-note (specificitate 0,2,0) bate variantele de element 0,1,1
  "[&_.source-note]:mt-4 [&_.source-note]:text-xs [&_.source-note]:leading-normal [&_.source-note]:text-stone-600",
].join(" ");

export function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`${PROSE} ${className}`}>{children}</div>;
}

export function Hero({
  children,
  peGrila = false,
}: {
  children: ReactNode;
  /** Pune hero-ul pe grila 3+2, deci exact lățimea cardului de rezultat de
   *  dedesubt. Se folosește pe paginile cu calculator, ca pe homepage. Pe
   *  paginile de conținut rămâne pe toată lățimea, ca până acum. */
  peGrila?: boolean;
}) {
  // Pe paginile-instrument hero-ul e doar titlul și o frază, lipit de instrument:
  // măsurat pe 15 septembrie 2026, banda cu padding de 40–48 px și linie dedesubt
  // împingea primul control la 425–509 px. Paginile de conținut rămân neschimbate.
  if (peGrila) {
    return (
      <section className={`bg-canvas ${SPATIU_SUS}`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <GrilaPagina continut={children} />
        </div>
      </section>
    );
  }
  return (
    <section className={`border-b border-stone-200 bg-canvas ${SPATIU_SUS} ${SECTIUNE_JOS}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function Section({
  children,
  wide = false,
  noTopBorder = false,
  companion,
}: {
  children: ReactNode;
  wide?: boolean;
  noTopBorder?: boolean;
  /** Cardul din dreapta, pe grila 3+2 a paginii. */
  companion?: ReactNode;
}) {
  // Din 24 septembrie 2026 toate secțiunile stau de la aceeași margine ca titlul
  // și calculatorul. Până atunci, o secțiune fără card lateral se centra pe
  // `max-w-3xl` și pagina avea două margini. Cardul din dreapta se pune doar
  // când aduce ceva propriu: un cuprins care urmărește cititorul a fost încercat
  // și respins de proprietar pe 24 septembrie 2026. `wide` e pentru tabelele late.
  const clase = `${noTopBorder ? "border-t-0" : "border-t border-stone-200 first:border-t-0"} bg-canvas ${SPATIU_SECTIUNE}`;
  return (
    <section className={clase}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {wide && !companion
          ? <Prose>{children}</Prose>
          : <GrilaPagina continut={<Prose>{children}</Prose>} companion={companion} />}
      </div>
    </section>
  );
}

export function Breadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav className={`${SUB_BREADCRUMB} flex flex-wrap gap-2 text-xs text-stone-600`} aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={i} className="flex gap-2">
          {it.href ? (
            <Link href={it.href} className="hover:text-stone-700">{it.label}</Link>
          ) : (
            <span aria-current="page">{it.label}</span>
          )}
          {i < items.length - 1 && <span aria-hidden="true">/</span>}
        </span>
      ))}
    </nav>
  );
}

export function H1({ children }: { children: ReactNode }) {
  return (
    <h1 className={`${TITLU_PAGINA} [&_em]:not-italic [&_em]:text-stone-900`}>
      {children}
    </h1>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className={`${SUB_TITLU} max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-stone-600`}>
      {children}
    </p>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-xs uppercase tracking-wide text-stone-600">{children}</p>;
}

// Listă FAQ cu <details>/<summary> nativ. Marker custom +/− prin group-open.
export function Faq({
  items,
  title = "Întrebări frecvente",
  companion,
}: {
  items: { q: string; a: string }[];
  title?: string;
  /** Cardul din dreapta, pe grila 3+2, ca pe homepage. */
  companion?: ReactNode;
}) {
  return (
    <section className={`border-t border-stone-200 bg-canvas ${SPATIU_SECTIUNE}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <GrilaPagina
          companion={companion}
          continut={<>
        <h2 className={TITLU_SECTIUNE}>{title}</h2>
        <div className={LISTA_FAQ}>
          {items.map((item, i) => (
            <details key={i} name="faq" className="group border-b border-stone-200">
              {/* min-h-11 = 44px, pragul de zona de atingere. Cu `py-4` pe
                  <details> si nimic pe <summary>, intrebarile scurte ieseau
                  la 28px inaltime — sub prag pe tot site-ul, fiindca FAQ-ul
                  apare pe aproape fiecare pagina. */}
              <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 py-4 text-base font-medium tracking-[-0.01em] text-stone-900 [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="flex-shrink-0 text-xl text-stone-900 group-open:hidden">+</span>
                <span className="hidden flex-shrink-0 text-xl text-stone-900 group-open:inline">−</span>
              </summary>
              <p className="mb-4 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600">{item.a}</p>
            </details>
          ))}
        </div>
          </>}
        />
      </div>
    </section>
  );
}

// Card CTA final — titlu, paragraf, buton stone (fără accent).
/**
 * Pagini conexe, la finalul unei pagini de continut.
 *
 * De ce exista: masurat pe 24 august 2026, /fluturas-salariu dadea DOUA linkuri
 * interne din corp, iar /salariu-mediu si /deducere-personala-2026 cate patru,
 * niciunul catre clusterul de meserii. Erau fundaturi: cititorul termina si nu
 * avea unde sa mearga, iar paginile nu pasau nimic mai departe.
 */
export function PaginiConexe({
  titlu = "Mai departe",
  linkuri,
}: {
  titlu?: string;
  linkuri: { href: string; label: string; descriere: string }[];
}) {
  return (
    <section className={`border-t border-stone-200 bg-canvas ${SPATIU_SECTIUNE}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className={`${SUB_TITLU_SECTIUNE_CUTIE} ${TITLU_SECTIUNE}`}>{titlu}</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {linkuri.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex h-full flex-col rounded-md border border-stone-200 bg-surface p-4 shadow-soft transition-colors hover:border-stone-300 hover:bg-canvas"
              >
                <span className="text-sm font-medium text-stone-900">{link.label}</span>
                <span className="mt-1 text-sm leading-normal text-stone-600">{link.descriere}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CtaCard({
  title,
  children,
  href = "/",
  label,
}: {
  title: string;
  children: ReactNode;
  href?: string;
  label: string;
}) {
  return (
    <section className={`border-t border-stone-200 bg-canvas ${SPATIU_SECTIUNE}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <GrilaPagina continut={
        <div className="rounded-md border border-stone-200 bg-surface p-6 shadow-soft sm:p-8">
          <h2 className={CARD_TITLU}>{title}</h2>
          <p className="mb-5 leading-normal tracking-[-0.01em] text-stone-600">{children}</p>
          <Link
            href={href}
            className="inline-flex min-h-11 items-center rounded border border-stone-900 bg-stone-900 px-5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
          >
            {label}
          </Link>
        </div>} />
      </div>
    </section>
  );
}

// ─── Grila paginii: 3 + 2 ────────────────────────────────────────────────────
//
// Homepage-ul tine acelasi ritm de sus pana jos, intr-o grila de 5 coloane:
// hero pe 3, calculator 2 + 3, articol 3 + card companion 2, FAQ 3 + companion.
// Textul nu e niciodata centrat — sta in cele 3 coloane din stanga, exact cat
// e cardul de rezultat, iar dreapta poarta un card cu informatie utila.
//
// Paginile noi foloseau trei latimi suprapuse: hero pe toata latimea, apoi
// grila de 5, apoi articol centrat pe `max-w-3xl`. Arata ca trei pagini lipite.
// Primitivele de aici exista ca sa nu se mai intample.

export function GrilaPagina({
  continut,
  companion,
}: {
  continut: ReactNode;
  /** Cardul din dreapta. Fara el, continutul ramane tot pe 3 coloane — ca la
   *  hero — deci latimea se pastreaza si cand nu ai ce pune alaturi. */
  companion?: ReactNode;
}) {
  return (
    <div className="md:grid md:grid-cols-5 md:gap-6">
      <div className="md:col-span-3">{continut}</div>
      {/* `self-start`: cardul ia doar înălțimea conținutului, nu a textului din
          stânga — decis de proprietar pe 24 septembrie 2026, după ce cardurile
          întinse lăsau cutii goale lângă secțiunile lungi. */}
      {companion ? <aside className="mt-8 md:col-span-2 md:mt-0 md:self-start">{companion}</aside> : null}
    </div>
  );
}

/**
 * Titlul cardurilor din dreapta, același pe tot site-ul (decis de proprietar pe
 * 24 septembrie 2026): mai mare decât textul cardului și în culoarea titlurilor,
 * dar sub titlul secțiunii de alături. Textul cardului rămâne `text-sm
 * text-stone-600`, notele `text-xs`.
 */
export const CARD_TITLU = `mb-2 ${TITLU_CARD}`;

/** Cardul din coloana din dreapta: `surface`, bordura stone-200, umbra unica. */
export function CardCompanion({
  titlu,
  children,
  nota,
}: {
  titlu: string;
  children: ReactNode;
  nota?: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 [&>dl>div:first-child]:pt-0 [&>p+p]:mt-[5px] [&>p+ul]:mt-[5px] [&>ul+p]:mt-[5px]">
      <h3 className={CARD_TITLU}>{titlu}</h3>
      {children}
      {nota ? <p className="mt-3 text-xs text-stone-600">{nota}</p> : null}
    </div>
  );
}

/**
 * Cardul de formulă de sub un calculator: rânduri scurte, monospațiate, cu bara
 * din stânga. Decis de proprietar pe 24 septembrie 2026: sub instrument stă
 * formula, nu un tabel cu un exemplu pe care cititorul nu l-a cerut.
 */
export function Formula({ randuri, eticheta }: { randuri: readonly string[]; eticheta?: string }) {
  // Pe ecran lat: rândurile monospațiate, aliniate la „=”, ca până acum.
  // Pe ecran îngust (sub `lg`, unde coloana are sub ~570 px) un rând de până la
  // ~57 de caractere nu încape. Ruperea lui cu indentare arăta ca o formulă
  // stricată (respinsă de proprietar pe 24 septembrie 2026), așa că acolo
  // aceleași rânduri se citesc ca un bon: eticheta și rezultatul pe un rând,
  // calculul dedesubt. Ambele variante vin din aceleași `randuri`.
  const pasi = pasiFormula(randuri);
  return (
    <figure className="my-5 max-w-full rounded-md border border-stone-200 border-l-4 border-l-stone-900 bg-surface px-4 py-3 shadow-soft">
      {eticheta ? <figcaption className="sr-only">{eticheta}</figcaption> : null}
      <pre className="hidden overflow-x-auto font-mono text-sm leading-7 text-stone-900 lg:block">{randuri.join("\n")}</pre>
      <dl className="text-sm lg:hidden">
        {pasi.map((pas, i) => (
          <div key={i} className="border-b border-stone-100 py-2 last:border-b-0">
            {(pas.eticheta || pas.rezultat) && (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="font-medium text-stone-900">{pas.eticheta}</dt>
                {pas.rezultat ? (
                  <dd className="whitespace-nowrap font-semibold tabular-nums text-stone-900">{pas.rezultat}</dd>
                ) : null}
              </div>
            )}
            {pas.calcul.map((linie, j) => (
              <dd key={j} className="mt-0.5 leading-snug tabular-nums text-stone-600">{linie}</dd>
            ))}
          </div>
        ))}
      </dl>
    </figure>
  );
}

type PasFormula = { eticheta: string; calcul: string[]; rezultat: string | null };

/** Desface rândurile unei formule în pași: „Etichetă = calcul = rezultat”. */
function pasiFormula(randuri: readonly string[]): PasFormula[] {
  const pasi: PasFormula[] = [];
  const curat = (t: string) => t.replace(/\s+/g, " ").trim();
  for (const rand of randuri) {
    // Rând de continuare (începe cu spații): se lipește de pasul anterior.
    if (/^\s/.test(rand) && pasi.length) {
      pasi[pasi.length - 1].calcul.push(curat(rand));
      continue;
    }
    const egal = rand.indexOf(" = ");
    let eticheta = "";
    let rest = rand;
    if (egal >= 0) {
      eticheta = curat(rand.slice(0, egal));
      rest = rand.slice(egal + 3);
    } else {
      // „Plus:       15% din…”: etichetă urmată de spații de aliniere
      const m = rand.match(/^(\S+?):?\s{2,}(.*)$/);
      if (m) {
        eticheta = m[1];
        rest = m[2];
      }
    }
    let rezultat: string | null = null;
    const ultimEgal = rest.lastIndexOf(" = ");
    if (ultimEgal >= 0) {
      rezultat = rest.slice(ultimEgal + 3);
      rest = rest.slice(0, ultimEgal);
    }
    const calcul = [curat(rest)].filter(Boolean);
    // „182   (deducere 865)”: ce vine după spațiile de aliniere e o notă, nu rezultat.
    if (rezultat) {
      const [principal, ...nota] = rezultat.trim().split(/\s{2,}/);
      rezultat = principal;
      if (nota.length) calcul.push(curat(nota.join(" ")));
    }
    pasi.push({ eticheta, calcul, rezultat });
  }
  return pasi;
}

/** Lista de perechi cheie-valoare pentru cardul companion. */
export function Repere({ randuri }: { randuri: readonly (readonly [string, string])[] }) {
  return (
    <dl className="text-sm">
      {randuri.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between gap-3 border-b border-stone-100 py-2 first:pt-0 last:border-b-0">
          <dt className="text-stone-600">{k}</dt>
          <dd className="font-medium tabular-nums whitespace-nowrap text-stone-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
