// app/widget/frame/page.tsx
// Conținutul iframe-ului embeddabil. Implicit redă widgetul minimalist; varianta
// allowlisted `?variant=complet` reutilizează grila completă a calculatorului de
// pe homepage. Layout-ul root ascunde Header/Footer pe această rută, iar proxy-ul
// permite frame-ancestors *.
// noindex: pagina trăiește în iframe pe alte site-uri, nu în rezultatele Google —
// pagina indexabilă care o prezintă e /widget.
// Pe găzduirea statică HTML-ul e același pentru orice query; `?brut=` se aplică
// în browser, prin WidgetFrameDinUrl. Fallback-ul e widgetul fără parametri.

import type { Metadata } from "next";
import { Suspense } from "react";
import WidgetFrameContinut from "@/app/components/WidgetFrameContinut";
import WidgetFrameDinUrl from "@/app/components/WidgetFrameDinUrl";

export const metadata: Metadata = {
  title: "Calculator salariu net (widget)",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://salariile.ro/widget" },
};

export default function Page() {
  return (
    <Suspense fallback={<WidgetFrameContinut isComplete={false} />}>
      <WidgetFrameDinUrl />
    </Suspense>
  );
}
