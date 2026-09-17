// Google Analytics 4 — configurare și starea consimțământului.
//
// Measurement ID-ul este public prin definiție: apare în cererile browserului.
// Îl ținem în cod ca deployul să nu depindă de o variabilă din dashboard.
export const GA_MEASUREMENT_ID = "G-2L1J64H5H9";

export const CONSENT_STORAGE_KEY = "salariile-consimtamant-analytics";
export const CONSENT_OPEN_EVENT = "salariile:deschide-consimtamant-analytics";
export const CONSENT_TTL_DAYS = 180;

export type ConsentChoice = "granted" | "denied";

type StoredConsent = {
  choice: ConsentChoice;
  decidedAt: string;
};

declare global {
  interface Window {
    gtag?: (command: string, target: string, params?: Record<string, unknown>) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

/**
 * Întoarce null pentru o alegere absentă, coruptă sau mai veche de șase luni.
 * Fără o dovadă locală validă nu încărcăm GA4 și întrebăm din nou.
 */
export function readStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (parsed.choice !== "granted" && parsed.choice !== "denied") return null;
    if (!parsed.decidedAt) return null;

    const decidedAt = new Date(parsed.decidedAt).getTime();
    if (Number.isNaN(decidedAt)) return null;
    if (Date.now() - decidedAt > CONSENT_TTL_DAYS * 24 * 60 * 60 * 1000) return null;

    return { choice: parsed.choice, decidedAt: parsed.decidedAt };
  } catch {
    // Unele browsere blochează storage-ul. În acel caz nu putem demonstra
    // consimțământul, deci GA4 rămâne oprit.
    return null;
  }
}

export function storeConsent(choice: ConsentChoice): StoredConsent | null {
  const record: StoredConsent = { choice, decidedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    return record;
  } catch {
    return null;
  }
}

/** Oprește colectarea și elimină identificatorii GA4 deja scriși. */
export function disableAnalytics() {
  if (typeof window === "undefined") return;

  window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  window.gtag?.("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  const host = window.location.hostname;
  const parent = host.split(".").slice(-2).join(".");
  const domains = new Set([host, `.${host}`, parent ? `.${parent}` : ""]);

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !/^_ga/.test(name)) continue;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    for (const domain of domains) {
      if (domain) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
      }
    }
  }
}

/** Reactivează colectarea când vizitatorul își schimbă alegerea în „Da”. */
export function enableAnalytics() {
  if (typeof window === "undefined") return;

  window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
  window.gtag?.("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}
