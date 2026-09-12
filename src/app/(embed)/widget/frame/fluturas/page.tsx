// app/widget/frame/fluturas/page.tsx
// Pagină dedicată iframe-ului pentru generatorul de fluturaș. Reutilizează
// aceeași componentă ca /fluturas-salariu, fără hero, Header, Footer sau conținut
// editorial. Ruta este noindex și poate fi încadrată extern prin CSP.
// Pe găzduirea statică HTML-ul e același pentru orice query; `?brut=` se aplică
// în browser, prin WidgetFluturasDinUrl. Fallback-ul e widgetul fără parametri.

import type { Metadata } from "next";
import { Suspense } from "react";
import WidgetFluturasContinut from "@/app/components/WidgetFluturasContinut";
import WidgetFluturasDinUrl from "@/app/components/WidgetFluturasDinUrl";

export const metadata: Metadata = {
  title: "Generator fluturaș de salariu (widget)",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://salariile.ro/fluturas-salariu" },
};

export default function Page() {
  return (
    <Suspense fallback={<WidgetFluturasContinut />}>
      <WidgetFluturasDinUrl />
    </Suspense>
  );
}
