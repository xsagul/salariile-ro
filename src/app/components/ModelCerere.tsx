"use client";

import { useState } from "react";

export default function ModelCerere({ titlu, text }: { titlu: string; text: string }) {
  const [copiat, setCopiat] = useState(false);

  const copiaza = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiat(true);
      setTimeout(() => setCopiat(false), 2000);
    } catch {
      // Fallback: utilizatorul poate selecta textul din casetă.
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-md border border-stone-200 bg-surface shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-canvas px-4 py-2">
        <span className="text-xs font-medium text-stone-700">{titlu}</span>
        <button
          type="button"
          onClick={copiaza}
          className="min-h-11 rounded border border-stone-300 bg-surface px-3 text-xs font-medium text-stone-900 transition-colors hover:bg-canvas sm:min-h-8"
        >
          {copiat ? "Copiat" : "Copiază modelul"}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap p-4 text-sm text-stone-800">{text}</pre>
    </div>
  );
}
