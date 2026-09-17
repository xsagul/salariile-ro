"use client";

// GA4 nu se descarcă deloc înainte de accept. Nu folosim Consent Mode în
// varianta „denied”, care ar trimite pinguri fără cookies înainte de alegere.

import Script from "next/script";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  CONSENT_OPEN_EVENT,
  GA_MEASUREMENT_ID,
  disableAnalytics,
  enableAnalytics,
  readStoredConsent,
  storeConsent,
  type ConsentChoice,
} from "@/lib/analytics";

type Stare = ConsentChoice | "nedecis" | "ssr";

const abonati = new Set<() => void>();

function notificaAbonatii() {
  for (const asculta of abonati) asculta();
}

function aboneaza(asculta: () => void) {
  abonati.add(asculta);
  window.addEventListener("storage", asculta);
  return () => {
    abonati.delete(asculta);
    window.removeEventListener("storage", asculta);
  };
}

function citesteStare(): Stare {
  return readStoredConsent()?.choice ?? "nedecis";
}

const stareLaServer = (): Stare => "ssr";

export default function ConsimtamantAnalytics() {
  const stare = useSyncExternalStore(aboneaza, citesteStare, stareLaServer);
  const [preferinteDeschise, setPreferinteDeschise] = useState(false);

  useEffect(() => {
    const deschide = () => setPreferinteDeschise(true);
    window.addEventListener(CONSENT_OPEN_EVENT, deschide);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, deschide);
  }, []);

  const decide = useCallback((alegere: ConsentChoice) => {
    storeConsent(alegere);
    if (alegere === "granted") enableAnalytics();
    else disableAnalytics();
    setPreferinteDeschise(false);
    notificaAbonatii();
  }, []);

  const afiseazaBannerul = stare === "nedecis" || preferinteDeschise;

  return (
    <>
      {stare === "granted" && (
        <>
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
window['ga-disable-${GA_MEASUREMENT_ID}']=false;
gtag('js',new Date());
gtag('consent','default',{'analytics_storage':'granted','ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied'});
gtag('set','ads_data_redaction',true);
gtag('config','${GA_MEASUREMENT_ID}',{'anonymize_ip':true,'allow_google_signals':false,'allow_ad_personalization_signals':false});`}
          </Script>
          <Script
            id="ga-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          />
        </>
      )}

      {afiseazaBannerul && (
        <div
          role="region"
          aria-labelledby="consimtamant-analytics-titlu"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-300 bg-surface/95 px-4 py-3 shadow-soft backdrop-blur sm:py-4"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
            <div className="max-w-prose text-sm leading-normal text-stone-700">
              <p id="consimtamant-analytics-titlu" className="font-semibold text-stone-900">
                Ne dai voie să măsurăm traficul cu Google Analytics?
              </p>
              <p className="mt-1">
                Cloudflare rămâne cookieless. GA4 se încarcă numai dacă alegi „Da” și nu
                activează reclame sau personalizare. Site-ul funcționează identic dacă alegi „Nu”.{" "}
                <a href="/cookies" className="font-medium text-stone-900 underline underline-offset-2">
                  Detalii
                </a>
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => decide("denied")}
                className="min-w-[88px] rounded-md border border-stone-700 bg-surface px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-100"
              >
                Nu
              </button>
              <button
                type="button"
                onClick={() => decide("granted")}
                className="min-w-[88px] rounded-md border border-stone-900 bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
              >
                Da
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
