"use client";

// src/app/components/WidgetDemo.tsx
// Demo fidel al widgetului pe pagina /widget: iframe către /widget/frame care se
// auto-dimensionează prin postMessage — exact ce primește un site care embedează.
// Replică logica din widget.js (aici în React), ca demo-ul să nu depindă de script.

import { useEffect, useRef, useState } from "react";

const INITIAL_HEIGHT = 790;
const MIN_HEIGHT = 360;
const MAX_HEIGHT = 900;
const clampHeight = (height: number) => Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.ceil(height)));

export default function WidgetDemo() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(INITIAL_HEIGHT);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data;
      if (!d || d.type !== "salariile:height" || !d.height) return;
      if (ref.current && e.source === ref.current.contentWindow) {
        setHeight(clampHeight(d.height));
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return (
    <div>
      <iframe
        ref={ref}
        src="/widget/frame"
        title="Calculator salariu net 2026 (demo widget)"
        loading="lazy"
        scrolling="no"
        style={{
          width: "100%",
          maxWidth: 420,
          height,
          border: "1px solid #e7e5e4",
          borderRadius: 8,
          display: "block",
          boxSizing: "border-box",
        }}
      />
      <a
        href="https://salariile.ro?utm_source=widget"
        target="_blank"
        rel="noopener"
        style={{
          display: "block",
          maxWidth: 420,
          marginTop: 8,
          font: "14px/1.4 system-ui, sans-serif",
          color: "#57534e",
        }}
      >
        Calculator de salarii oferit de salariile.ro
      </a>
    </div>
  );
}
