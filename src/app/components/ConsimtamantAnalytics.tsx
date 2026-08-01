"use client";

// Banner de consimțământ + încărcarea Google Analytics 4.
//
// Alegere deliberată: GA NU se încarcă deloc înainte de accept. Nu folosim
// Consent Mode cu „denied", care descarcă gtag.js și trimite oricum pinguri
// cookieless. Pentru un site care își asumă public că nu are reclame și nu cere
// cont, varianta strictă e și mai ușor de explicat în politica de cookies.

import Script from "next/script";
import { useCallback, useSyncExternalStore } from "react";
import {
  GA_MEASUREMENT_ID,
  clearAnalyticsCookies,
  readStoredConsent,
  storeConsent,
  type ConsentChoice,
} from "@/lib/analytics";

// "ssr" = randare pe server, unde nu putem ști ce a ales vizitatorul. Nu afișăm
// nimic în acel moment; useSyncExternalStore re-randează după hidratare, fără
// nepotrivire de hidratare și fără ca bannerul să clipească la cei care au ales deja.
type Stare = ConsentChoice | "nedecis" | "ssr";

const abonati = new Set<() => void>();

function notificaAbonatii() {
  for (const asculta of abonati) asculta();
}

function aboneaza(asculta: () => void) {
  abonati.add(asculta);
  // Sincronizează și între taburi: dacă vizitatorul decide în alt tab.
  window.addEventListener("storage", asculta);
  return () => {
    abonati.delete(asculta);
    window.removeEventListener("storage", asculta);
  };
}

// Întoarce un string primitiv, deci comparabil prin valoare — React nu intră
// în buclă de re-randare așa cum ar face cu un obiect nou la fiecare apel.
function citesteStare(): Stare {
  const salvat = readStoredConsent();
  return salvat ? salvat.choice : "nedecis";
}

const stareLaServer = (): Stare => "ssr";

export default function ConsimtamantAnalytics({ nonce }: { nonce?: string }) {
  const stare = useSyncExternalStore(aboneaza, citesteStare, stareLaServer);

  const decide = useCallback((alegere: ConsentChoice) => {
    storeConsent(alegere);
    if (alegere === "denied") clearAnalyticsCookies();
    notificaAbonatii();
  }, []);

  return (
    <>
      {stare === "granted" && (
        <>
          <Script
            id="ga-loader"
            nonce={nonce}
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          />
          <Script id="ga-init" nonce={nonce} strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'granted'});
gtag('config','${GA_MEASUREMENT_ID}',{'anonymize_ip':true});`}
          </Script>
        </>
      )}

      {stare === "nedecis" && (
        <div
          role="region"
          aria-labelledby="consimtamant-titlu"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-300 bg-surface p-4 shadow-soft sm:p-5"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-prose text-sm leading-normal text-stone-700">
              <p id="consimtamant-titlu" className="font-semibold text-stone-900">
                Ne dai voie să măsurăm traficul?
              </p>
              <p className="mt-1">
                Folosim Google Analytics ca să vedem ce pagini sunt utile. Pune cookies pe
                dispozitivul tău. Calculatoarele și tot conținutul funcționează identic dacă refuzi.{" "}
                <a
                  href="/cookies"
                  className="font-medium text-stone-900 underline underline-offset-2"
                >
                  Detalii în politica de cookies
                </a>
                .
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => decide("denied")}
                className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
              >
                Refuz
              </button>
              <button
                type="button"
                onClick={() => decide("granted")}
                className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
