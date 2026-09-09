"use client";

// Demo fidel pentru cele trei iframe-uri prezentate pe /widget.
// Iframe-ul pornește cu o înălțime fallback și apoi urmărește înălțimea reală
// raportată de conținut prin postMessage, fără scroll interior.

import { useEffect, useRef, useState } from "react";

const MINIMAL_HEIGHT = 790;
const COMPLETE_HEIGHT = 900;
const PAYSLIP_HEIGHT = 1000;
const MIN_HEIGHT = 320;
const MAX_HEIGHT = 3200;

type WidgetDemoProps = {
  variant?: "minimal" | "complet" | "fluturas";
};

export default function WidgetDemo({ variant = "minimal" }: WidgetDemoProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const isMinimal = variant === "minimal";
  const isComplete = variant === "complet";
  const isPayslip = variant === "fluturas";

  const initialHeight = isPayslip
    ? PAYSLIP_HEIGHT
    : isComplete
      ? COMPLETE_HEIGHT
      : MINIMAL_HEIGHT;

  const [height, setHeight] = useState(initialHeight);

  // Varianta e fixată la montare pe /widget, dar dacă s-ar schimba, înălțimea de
  // pornire trebuie să o urmeze. Ajustarea se face în timpul randării, nu într-un
  // efect: un setState în efect declanșează o a doua randare, în cascadă.
  const [variantaRandata, setVariantaRandata] = useState(initialHeight);
  if (variantaRandata !== initialHeight) {
    setVariantaRandata(initialHeight);
    setHeight(initialHeight);
  }

  useEffect(() => {
    const onMsg = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.type !== "salariile:height" || !data.height) return;
      if (!ref.current || event.source !== ref.current.contentWindow) return;

      const reported = Math.ceil(Number(data.height));
      if (!Number.isFinite(reported)) return;
      const nextHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, reported));
      setHeight((current) => Math.abs(nextHeight - current) >= 8 ? nextHeight : current);
    };

    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const maxWidth = isMinimal ? 420 : 1152;
  const src = isPayslip
    ? "/widget/frame/fluturas"
    : isComplete
      ? "/widget/frame?variant=complet"
      : "/widget/frame";
  const title = isPayslip
    ? "Generator fluturaș de salariu 2026 (demo widget)"
    : isComplete
      ? "Calculator complet de salarii 2026 (demo widget)"
      : "Calculator salariu net 2026 (demo widget)";
  const href = isPayslip
    ? "https://salariile.ro/fluturas-salariu?utm_source=widget-fluturas"
    : isComplete
      ? "https://salariile.ro?utm_source=widget-complet"
      : "https://salariile.ro?utm_source=widget";
  const credit = isPayslip
    ? "Generator de fluturaș de salariu oferit de salariile.ro"
    : isComplete
      ? "Calculator complet de salarii oferit de salariile.ro"
      : "Calculator de salarii oferit de salariile.ro";

  return (
    <div>
      <iframe
        ref={ref}
        src={src}
        title={title}
        loading="lazy"
        scrolling="no"
        style={{
          width: "100%",
          maxWidth,
          height,
          margin: "0 auto",
          border: "1px solid #e7e5e4",
          borderRadius: 8,
          display: "block",
          boxSizing: "border-box",
        }}
      />
      <a
        href={href}
        target="_blank"
        rel="noopener"
        style={{
          display: "block",
          maxWidth,
          margin: "8px auto 0",
          font: "14px/1.4 system-ui, sans-serif",
          color: "#57534e",
        }}
      >
        {credit}
      </a>
    </div>
  );
}
