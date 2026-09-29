"use client";

// Widgetul Cloudflare Turnstile: verifică în fundal că formularul e completat de un om, fără
// imagini de ales. Numai pe raportarea anunțurilor: de la postare a fost scos pe 29 septembrie 2026,
// fiindcă oamenii nu reușeau să posteze.
import { useEffect, useRef } from "react";
import { TURNSTILE_SITEKEY } from "@/lib/anunturi/config";

declare global {
  interface Window { turnstile?: { render: (el: HTMLElement, o: { sitekey: string; callback: (t: string) => void; "expired-callback": () => void; language: string }) => string } }
}

export default function Turnstile({ onToken }: { onToken: (t: string) => void }) {
  const loc = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!TURNSTILE_SITEKEY || !loc.current) return;
    // Widgetul e înregistrat numai pentru salariile.ro; la probele locale, cheia de test publică a
    // Cloudflare, care trece mereu (Worker-ul local n-are secretul, deci nu verifică oricum).
    const cheie = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) ? "1x00000000000000000000AA" : TURNSTILE_SITEKEY;
    const randeaza = () => window.turnstile?.render(loc.current!, { sitekey: cheie, callback: onToken, "expired-callback": () => onToken(""), language: "ro" });
    if (window.turnstile) { randeaza(); return; }
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = randeaza;
    document.head.appendChild(s);
  }, [onToken]);
  return TURNSTILE_SITEKEY ? <div ref={loc} className="mt-4" /> : null;
}
