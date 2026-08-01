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
  VERSIUNE_SITE,
  clearAnalyticsCookies,
  discardEventQueue,
  flushEventQueue,
  intervalViewport,
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
    if (alegere === "denied") {
      clearAnalyticsCookies();
      // Evenimentele adunate cât timp nu se decisese nu pleacă nicăieri.
      discardEventQueue();
    }
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
            // gtag.js definește funcția globală; abia acum se poate goli coada
            // cu evenimentele produse înainte de consimțământ (tipic: vitals).
            onLoad={() => flushEventQueue()}
          />
          {/* `gtag('set')` înainte de `config`: parametrii devin globali și se
              atașează la FIECARE eveniment, inclusiv la cele native GA4
              (page_view, scroll, user_engagement). Doar așa poți segmenta rata
              de respingere sau timpul pe pagină după versiunea de cod. */}
          <Script id="ga-init" nonce={nonce} strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'granted'});
gtag('set',{'versiune_site':'${VERSIUNE_SITE}','interval_viewport':${JSON.stringify(intervalViewport(typeof window === "undefined" ? 1280 : window.innerWidth))}});
gtag('config','${GA_MEASUREMENT_ID}',{'anonymize_ip':true});`}
          </Script>
        </>
      )}

      {stare === "nedecis" && (
        // Bandă compactă jos: plasarea bottom-center are cea mai bună rată de
        // interacțiune, iar înălțimea mică lasă conținutul vizibil.
        <div
          role="region"
          aria-label="Consimțământ pentru măsurarea traficului"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-300 bg-surface/95 px-4 py-2.5 backdrop-blur sm:py-3"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="text-[13px] leading-snug text-stone-700">
              Măsurăm ce pagini sunt căutate, ca să știm ce să actualizăm întâi. Google Analytics
              pune cookies.{" "}
              <a href="/cookies" className="font-medium text-stone-900 underline underline-offset-2">
                Detalii
              </a>
            </p>
            {/* Accept plin, refuz conturat — decizie asumată a proprietarului.
                EDPB (raportul Cookie Banner Taskforce, 2023) cere refuzului
                aceeași proeminență, iar CNIL a amendat Google cu 150 mil. EUR
                pentru asimetrie. Riscul e redus, nu eliminat, prin: aceeași
                dimensiune, aceeași poziție, un singur click pentru refuz pe
                primul strat, text stone-900 pe bordură stone-500 (contrast peste
                pragul WCAG AA), fără culoare care să sugereze că refuzul e
                dezactivat. Dacă apare o notificare ANSPDCP, prima schimbare de
                făcut este să readuci butoanele la stil identic. */}
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => decide("denied")}
                className="min-w-[76px] rounded-md border border-stone-500 px-4 py-1.5 text-sm font-medium text-stone-900 hover:bg-stone-100"
              >
                Nu
              </button>
              <button
                type="button"
                onClick={() => decide("granted")}
                className="min-w-[76px] rounded-md border border-stone-900 bg-stone-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-stone-700"
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
