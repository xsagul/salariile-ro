"use client";

declare global {
  interface Window {
    googlefc?: {
      callbackQueue?: Array<Record<string, () => void>>;
      showRevocationMessage?: () => void;
    };
  }
}

export default function ButonPreferinteGoogle() {
  const deschidePreferintele = () => {
    window.googlefc = window.googlefc || {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    window.googlefc.callbackQueue.push({
      CONSENT_API_READY: () => window.googlefc?.showRevocationMessage?.(),
    });
  };

  return (
    <button
      type="button"
      onClick={deschidePreferintele}
      className="text-xs text-stone-600 underline decoration-stone-400 underline-offset-2 hover:text-stone-900"
    >
      Setări cookies
    </button>
  );
}
