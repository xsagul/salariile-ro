"use client";

// Widgetul Cloudflare Turnstile: verifică în fundal că formularul e completat de un om, fără
// imagini de ales. Scriptul se încarcă numai pe paginile cu formular și numai cu cheie setată.
import { useEffect, useRef } from "react";
import { TURNSTILE_SITEKEY } from "@/lib/anunturi/config";

declare global {
  interface Window { turnstile?: { render: (el: HTMLElement, o: { sitekey: string; callback: (t: string) => void; "expired-callback": () => void; language: string }) => string } }
}

export default function Turnstile({ onToken }: { onToken: (t: string) => void }) {
  const loc = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!TURNSTILE_SITEKEY || !loc.current) return;
    const randeaza = () => window.turnstile?.render(loc.current!, { sitekey: TURNSTILE_SITEKEY, callback: onToken, "expired-callback": () => onToken(""), language: "ro" });
    if (window.turnstile) { randeaza(); return; }
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = randeaza;
    document.head.appendChild(s);
  }, [onToken]);
  return TURNSTILE_SITEKEY ? <div ref={loc} className="mt-4" /> : null;
}
