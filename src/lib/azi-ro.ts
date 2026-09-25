// Ziua de azi în România, pentru paginile statice care o arată (cardurile și
// calendarul de pe Zile libere). Se ia de la server, nu din ceasul telefonului,
// care poate fi dat greșit (cerut de proprietar pe 25 septembrie 2026): antetul
// `Date` al răspunsului Cloudflare, prezent și pe fișierele servite din cache.

const ZI_MS = 86_400_000;
const ZI_RO = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest", year: "numeric", month: "2-digit", day: "2-digit" });

// Ziua calendaristică din România pentru un moment dat, ca miezul nopții UTC.
export function ziRo(d: Date) {
  const [y, m, z] = ZI_RO.format(d).split("-").map(Number);
  return Date.UTC(y, m - 1, z);
}

// O singură cerere pe pagină, oricâte componente o folosesc.
let cerere: Promise<Date | null> | null = null;

// Ora exactă, de la server. Dacă cererea eșuează, ceasul telefonului e folosit doar
// dacă pare plauzibil (după build și în cel mult doi ani); altfel întoarce null.
export function oraServer(dataBuild: number): Promise<Date | null> {
  cerere ??= (async () => {
    try {
      const r = await fetch("/robots.txt", { method: "HEAD", cache: "no-store" });
      const h = r.headers.get("date");
      const d = h ? new Date(h) : null;
      if (d && !Number.isNaN(d.getTime())) return d;
    } catch {
      // fără rețea: cade pe verificarea de mai jos
    }
    const acum = Date.now();
    return acum >= dataBuild && acum - dataBuild < 2 * 365 * ZI_MS ? new Date(acum) : null;
  })();
  return cerere;
}
