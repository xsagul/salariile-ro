// src/app/(embed)/layout.tsx
// Layout pentru rutele care rulează în <iframe> pe site-uri terțe.
//
// Fără Header, fără Footer, fără analytics — deliberat. Widgetul e conținut
// încorporat pe site-ul altcuiva: navigația noastră n-are ce căuta acolo, iar
// afișările lui nu sunt vizitele noastre și nu trebuie să ne polueze datele.
//
// Rutele din grupul ăsta sunt singurele care primesc input de la utilizator
// (`?brut=`). Pe găzduirea statică inputul se citește în browser și e acceptat
// doar ca 3–6 cifre (WidgetFrameDinUrl, WidgetFluturasDinUrl). CSP-ul lor,
// încadrabil pe orice site, e CSP_WIDGET din src/lib/csp.ts.

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
