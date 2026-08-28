"use client";

// src/app/components/EmbedCode.tsx
// Bloc de cod cu buton „Copiază" pentru pagina /widget (codul de embed al widgetului).

import { useState } from "react";

export default function EmbedCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponibil (permisiuni) — utilizatorul poate selecta manual
    }
  };

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-md border border-stone-200 bg-stone-900 p-4 text-xs leading-relaxed text-stone-100">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute right-3 top-3 rounded-md bg-stone-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-600"
      >
        {copied ? "Copiat ✓" : "Copiază codul"}
      </button>
    </div>
  );
}
