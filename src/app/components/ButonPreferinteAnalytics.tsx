"use client";

import { CONSENT_OPEN_EVENT } from "@/lib/analytics";

export default function ButonPreferinteAnalytics() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
      className="text-xs text-stone-600 underline decoration-stone-400 underline-offset-2 hover:text-stone-900"
    >
      Setări cookies
    </button>
  );
}
