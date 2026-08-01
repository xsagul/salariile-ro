// Google Analytics 4 — configurare și starea consimțământului.
//
// Measurement ID-ul nu este secret: apare oricum în HTML-ul livrat. Îl ținem aici,
// nu în variabilă de mediu, ca deployul să nu depindă de o setare din dashboard.
export const GA_MEASUREMENT_ID = "G-2L1J64H5H9";

// Cheia din localStorage în care reținem alegerea vizitatorului.
export const CONSENT_STORAGE_KEY = "salariile-consimtamant-analytics";

// Re-întrebăm după 6 luni, ca alegerea să nu fie „pe viață".
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
export function readStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (parsed.choice !== "granted" && parsed.choice !== "denied") return null;
    if (!parsed.decidedAt) return null;

    const decided = new Date(parsed.decidedAt).getTime();
    if (Number.isNaN(decided)) return null;
    const expired = Date.now() - decided > CONSENT_TTL_DAYS * 24 * 60 * 60 * 1000;
    if (expired) return null;

    return { choice: parsed.choice, decidedAt: parsed.decidedAt };
  } catch {
    // localStorage poate fi blocat (mod privat, politici de browser). Fără stocare
    // nu putem dovedi consimțământul, deci tratăm ca „nedecis" și nu încărcăm nimic.
    return null;
  }
}

export function storeConsent(choice: ConsentChoice): StoredConsent | null {
  const record: StoredConsent = { choice, decidedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
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
