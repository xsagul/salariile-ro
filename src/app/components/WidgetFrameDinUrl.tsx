"use client";

// Citește parametrii iframe-ului în browser: pe găzduirea statică nu există server
// care să-i citească la cerere. Validarea e aceeași: doar 3–6 cifre pentru brut,
// orice altceva e ignorat, deci nu există suprafață de injecție.

import { useSearchParams } from "next/navigation";
import WidgetFrameContinut from "@/app/components/WidgetFrameContinut";

export default function WidgetFrameDinUrl() {
  const params = useSearchParams();
  const brut = params.get("brut");
  const initialBrut = brut && /^[0-9]{3,6}$/.test(brut) ? brut : undefined;
  return <WidgetFrameContinut initialBrut={initialBrut} isComplete={params.get("variant") === "complet"} />;
}
