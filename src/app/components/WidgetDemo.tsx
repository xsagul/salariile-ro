"use client";

// Demo fidel pentru cele trei iframe-uri prezentate pe /widget.
// Rezervă de la început spațiul stării calculate, astfel încât rezultatul să nu
// împingă conținutul paginii. postMessage poate doar mări peste rezerva normală.

import { useEffect, useRef, useState } from "react";

const MINIMAL_HEIGHT = 790;
const COMPLETE_DESKTOP_HEIGHT = 900;
const COMPLETE_MOBILE_HEIGHT = 1450;
const PAYSLIP_DESKTOP_HEIGHT = 1200;
const PAYSLIP_MOBILE_HEIGHT = 2000;

type WidgetDemoProps = {
  variant?: "minimal" | "complet" | "fluturas";
};

export default function WidgetDemo({ variant = "minimal" }: WidgetDemoProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const reportedHeightRef = useRef(0);
  const isMinimal = variant === "minimal";
  const isComplete = variant === "complet";
  const isPayslip = variant === "fluturas";

  const desktopHeight = isPayslip
    ? PAYSLIP_DESKTOP_HEIGHT
    : isComplete
      ? COMPLETE_DESKTOP_HEIGHT
      : MINIMAL_HEIGHT;
  const mobileHeight = isPayslip
    ? PAYSLIP_MOBILE_HEIGHT
    : isComplete
      ? COMPLETE_MOBILE_HEIGHT
      : MINIMAL_HEIGHT;

  const [height, setHeight] = useState(desktopHeight);

  useEffect(() => {
    const reservedHeight = () =>
      window.matchMedia("(max-width: 767px)").matches ? mobileHeight : desktopHeight;

    const applyHeight = () => {
      setHeight(Math.max(reservedHeight(), reportedHeightRef.current));
    };

    const onMsg = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.type !== "salariile:height" || !data.height) return;
      if (ref.current && event.source === ref.current.contentWindow) {
        reportedHeightRef.current = Math.ceil(Number(data.height)) || 0;
        applyHeight();
      }
    };

    applyHeight();
    window.addEventListener("message", onMsg);
    window.addEventListener("resize", applyHeight);
    return () => {
      window.removeEventListener("message", onMsg);
      window.removeEventListener("resize", applyHeight);
    };
  }, [desktopHeight, mobileHeight]);

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
