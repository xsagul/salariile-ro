import Link from "next/link";

// ─── Logică fiscală (copiată din page.tsx principal) ─────────────────────────

const SALARIU_MINIM = 4050;
const CAS_PROCENT = 0.25;
const CASS_PROCENT = 0.10;
const IMPOZIT_PROCENT = 0.10;
const CAM_PROCENT = 0.0225;
const DEDUCERE_MINIM = 300;

function calculeazaDeducerePersonala(brut: number): number {
  const limita = SALARIU_MINIM + 2000;
  if (brut > limita) return 0;
  const baza = Math.floor((0.20 * SALARIU_MINIM) / 10) * 10;
  if (brut <= SALARIU_MINIM) return baza;
  const coeficient = 1 - (brut - SALARIU_MINIM) / 2000;
  return Math.max(0, Math.floor((baza * coeficient) / 10) * 10);
}

function calculeaza(brut: number) {
  const facilitate = brut === SALARIU_MINIM ? DEDUCERE_MINIM : 0;
  const baza = brut - facilitate;
  const cas = Math.round(baza * CAS_PROCENT);
  const cass = Math.round(baza * CASS_PROCENT);
  const deducere = calculeazaDeducerePersonala(brut);
  const bazaImpozit = Math.max(0, brut - cas - cass - facilitate - deducere);
  const impozit = Math.round(bazaImpozit * IMPOZIT_PROCENT);
  const net = brut - cas - cass - impozit;
  const cam = Math.round(baza * CAM_PROCENT);
  return { net, cas, cass, impozit, deducere, cam, costTotal: brut + cam };
}

function calculeazaBrutDinNet(net: number): number {
  if (net === calculeaza(SALARIU_MINIM).net) return SALARIU_MINIM;
  let lo = net, hi = net * 3;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (calculeaza(Math.round(mid)).net < net) lo = mid;
    else hi = mid;
  }
  return Math.round((lo + hi) / 2);
}

// ─── Parser URL ───────────────────────────────────────────────────────────────

function parseValoare(valoare: string): { suma: number; mod: "brut" | "net" } | null {
  // Format: "4050-lei-brut-in-net" sau "2574-lei-net-in-brut"
  const match = valoare.match(/^(\d+)-lei-(brut|net)/);
  if (!match) return null;
  return { suma: parseInt(match[1]), mod: match[2] as "brut" | "net" };
}

// ─── Metadata SEO ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ valoare: string }> }) {
  const { valoare } = await params;
  const parsed = parseValoare(valoare);
  if (!parsed) return { title: "Calculator Salariu Net 2026" };

  const { suma, mod } = parsed;
  const brut = mod === "brut" ? suma : calculeazaBrutDinNet(suma);
  const { net } = calculeaza(brut);

  if (mod === "brut") {
    return {
      title: `${suma} lei brut = ${net} lei net 2026 | Salariile.ro`,
      description: `${suma} lei brut în net 2026: CAS ${Math.round((brut - (brut === SALARIU_MINIM ? DEDUCERE_MINIM : 0)) * CAS_PROCENT)} lei, CASS ${Math.round((brut - (brut === SALARIU_MINIM ? DEDUCERE_MINIM : 0)) * CASS_PROCENT)} lei. Salariu net: ${net} lei.`,
    };
  } else {
    return {
      title: `${suma} lei net = ${brut} lei brut 2026 | Salariile.ro`,
      description: `${suma} lei net în brut 2026: salariul brut corespunzător este ${brut} lei. Calculator actualizat cu legislația fiscală 2026.`,
    };
  }
}

// ─── Pagina ───────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n) + " lei";

export default async function CalculatorValoare({ params }: { params: Promise<{ valoare: string }> }) {
  const { valoare } = await params;
  const parsed = parseValoare(valoare);

  if (!parsed) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <h1>Pagină negăsită</h1>
        <Link href="/">← Înapoi la calculator</Link>
      </div>
    );
  }

  const { suma, mod } = parsed;
  const brut = mod === "brut" ? suma : calculeazaBrutDinNet(suma);
  const rez = calculeaza(brut);

  return (
    <div className="page">
      <header className="site-header">
        <div className="container">
          <a href="/" className="logo">salariile<span>.ro</span></a>
          <nav>
            <a href="/" className="active">Calculator</a>
            <a href="/salariu-minim">Salariu minim</a>
            <a href="/salariu-mediu">Salariu mediu</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div className="breadcrumb">
            <a href="/">Acasă</a><span>/</span>
            <a href="/">Calculator</a><span>/</span>
            <span>{suma} lei {mod} în {mod === "brut" ? "net" : "brut"}</span>
          </div>
          <h1>
            {mod === "brut"
              ? <>{suma} lei brut în net <em>2026</em></>
              : <>{suma} lei net în brut <em>2026</em></>
            }
          </h1>
          <p className="subtitle">
            {mod === "brut"
              ? `Pentru un salariu brut de ${fmt(suma)}, salariul net în mână este ${fmt(rez.net)} în 2026.`
              : `Pentru un salariu net de ${fmt(suma)}, salariul brut corespunzător este ${fmt(brut)} în 2026.`
            }
          </p>
        </div>
      </section>

      <main className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        {/* Rezultat principal */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div className="card net-card" style={{ textAlign: "center", padding: "2rem" }}>
            <div className="net-label">{mod === "brut" ? "Salariu net în mână" : "Salariu brut corespunzător"}</div>
            <div className="net-value">{mod === "brut" ? fmt(rez.net) : fmt(brut)}</div>
            <div className="net-sub">din {fmt(mod === "brut" ? brut : rez.net)} {mod === "brut" ? "brut" : "net"}</div>
          </div>

          <div className="card details-card">
            <h3>Detalii calcul {mod === "brut" ? fmt(suma) : fmt(brut)} brut</h3>
            <div className="detail-rows">
              <div className="detail-row"><span>CAS (pensie 25%)</span><strong>−{fmt(rez.cas)}</strong></div>
              <div className="detail-row"><span>CASS (sănătate 10%)</span><strong>−{fmt(rez.cass)}</strong></div>
              {rez.deducere > 0 && <div className="detail-row green"><span>Deducere personală</span><strong>+{fmt(rez.deducere)}</strong></div>}
              <div className="detail-row"><span>Impozit venit (10%)</span><strong>−{fmt(rez.impozit)}</strong></div>
              <div className="detail-row total-row"><span>Salariu net</span><strong>{fmt(rez.net)}</strong></div>
            </div>
          </div>
        </div>

        <div className="card details-card" style={{ marginBottom: "1.5rem" }}>
          <h3>Cost angajator</h3>
          <div className="detail-rows">
            <div className="detail-row"><span>Salariu brut</span><strong>{fmt(brut)}</strong></div>
            <div className="detail-row"><span>CAM (2.25%)</span><strong>+{fmt(rez.cam)}</strong></div>
            <div className="detail-row total-row"><span>Cost total</span><strong>{fmt(rez.costTotal)}</strong></div>
          </div>
        </div>

        {/* CTA spre calculator interactiv */}
        <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ marginBottom: "1rem", color: "var(--muted)", fontFamily: "system-ui" }}>
            Vrei să calculezi cu tichete de masă, persoane în întreținere sau alte opțiuni?
          </p>
          <a
            href={`/?${mod}=${suma}`}
            style={{
              background: "var(--accent)",
              color: "white",
              padding: "0.75rem 2rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontFamily: "system-ui",
              fontWeight: 600,
            }}
          >
            Deschide calculatorul avansat →
          </a>
        </div>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-bottom">
            <p>© 2026 Salariile.ro — Actualizat conform legislației fiscale în vigoare</p>
          </div>
        </div>
      </footer>
    </div>
  );
}