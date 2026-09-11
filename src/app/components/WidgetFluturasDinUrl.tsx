"use client";

// Citește parametrii iframe-ului în browser: pe găzduirea statică nu există server
// care să-i citească la cerere. Validarea e aceeași: doar 3–6 cifre pentru brut,
// orice altceva e ignorat, deci nu există suprafață de injecție.

import { useSearchParams } from "next/navigation";
import WidgetFluturasContinut from "@/app/components/WidgetFluturasContinut";

export default function WidgetFluturasDinUrl() {
  const params = useSearchParams();
  const brut = params.get("brut");
  const initialBrut = brut && /^[0-9]{3,6}$/.test(brut) ? brut : undefined;
  return <WidgetFluturasContinut initialBrut={initialBrut} />;
}
