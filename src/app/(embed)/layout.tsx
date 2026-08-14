// src/app/(embed)/layout.tsx
// Layout pentru rutele care rulează în <iframe> pe site-uri terțe.
//
// Fără Header, fără Footer, fără analytics — deliberat. Widgetul e conținut
// încorporat pe site-ul altcuiva: navigația noastră n-are ce căuta acolo, iar
// afișările lui nu sunt vizitele noastre și nu trebuie să ne polueze datele.
//
// Rutele din grupul ăsta sunt singurele care primesc input de la utilizator
// (`?brut=`), deci sunt și singurele cu suprafață de injecție. De aceea
// rămân dinamice și primesc CSP-ul strict, cu nonce și `strict-dynamic`
// (vezi src/proxy.ts). Input-ul e validat separat în fiecare pagină.

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
