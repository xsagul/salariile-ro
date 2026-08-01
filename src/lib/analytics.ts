// Google Analytics 4 — configurare și starea consimțământului.
//
// Measurement ID-ul nu este secret: apare oricum în HTML-ul livrat. Îl ținem aici,
// nu în variabilă de mediu, ca deployul să nu depindă de o setare din dashboard.
export const GA_MEASUREMENT_ID = "G-2L1J64H5H9";

// Cheia în care reținem alegerea vizitatorului.
export const CONSENT_STORAGE_KEY = "salariile-consimtamant-analytics";

// Memorare asimetrică, decisă de proprietar:
//   - acceptul se ține în localStorage 6 luni;
//   - refuzul se ține doar în sessionStorage, deci reapare la vizita următoare.
// Este o alegere comercială asumată, nu o recomandare: EDPB tratează
// reîntrebarea repetată după refuz ca uzură a consimțământului, iar un
// consimțământ obținut prin insistență este mai ușor de contestat.
// Refuzul rămâne totuși valabil pe toată durata vizitei, ca butonul „Nu" să
// aibă efect real, nu doar vizual.
export const CONSENT_TTL_DAYS = 180;

export type ConsentChoice = "granted" | "denied";

export type StoredConsent = {
  choice: ConsentChoice;
  decidedAt: string;
};

/**
 * Citește alegerea salvată. Întoarce null dacă nu există, e coruptă sau a expirat —
 * în toate cazurile bannerul trebuie afișat din nou.
 */
function parseConsent(raw: string | null, aplicaExpirarea: boolean): StoredConsent | null {
  if (!raw) return null;
  const parsed = JSON.parse(raw) as Partial<StoredConsent>;
  if (parsed.choice !== "granted" && parsed.choice !== "denied") return null;
  if (!parsed.decidedAt) return null;

  const decided = new Date(parsed.decidedAt).getTime();
  if (Number.isNaN(decided)) return null;
  if (aplicaExpirarea && Date.now() - decided > CONSENT_TTL_DAYS * 24 * 60 * 60 * 1000) {
    return null;
  }
  return { choice: parsed.choice, decidedAt: parsed.decidedAt };
}

export function readStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    // Acceptul are prioritate: dacă cineva a acceptat și apoi a refuzat în
    // aceeași sesiune, refuzul din sessionStorage e cel mai recent, deci îl
    // citim primul.
    const peSesiune = parseConsent(window.sessionStorage.getItem(CONSENT_STORAGE_KEY), false);
    if (peSesiune) return peSesiune;

    return parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY), true);
  } catch {
    // Stocarea poate fi blocată (mod privat, politici de browser). Fără ea nu
    // putem dovedi consimțământul, deci tratăm ca „nedecis" și nu încărcăm nimic.
    return null;
  }
}

export function storeConsent(choice: ConsentChoice): StoredConsent | null {
  const record: StoredConsent = { choice, decidedAt: new Date().toISOString() };
  const serializat = JSON.stringify(record);
  try {
    if (choice === "granted") {
      // Persistă între vizite, 6 luni.
      window.sessionStorage.removeItem(CONSENT_STORAGE_KEY);
      window.localStorage.setItem(CONSENT_STORAGE_KEY, serializat);
    } else {
      // Doar pe durata vizitei; la următoarea accesare bannerul reapare.
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
      window.sessionStorage.setItem(CONSENT_STORAGE_KEY, serializat);
    }
  } catch {
    return null;
  }
  return record;
}

/**
 * Șterge cookie-urile puse de GA. Necesar la retragerea consimțământului: oprirea
 * scriptului nu elimină `_ga` și `_ga_<container>` deja scrise.
 */
export function clearAnalyticsCookies() {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  // Pe salariile.ro cookie-ul e setat pe domeniul-părinte, deci îl expirăm și acolo.
  const domains = [host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !/^_ga/.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    }
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}
