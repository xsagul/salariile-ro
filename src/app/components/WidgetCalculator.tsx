"use client";

// src/app/components/WidgetCalculator.tsx
// Calculatorul compact embeddabil (rulează în <iframe> pe alte site-uri, la /widget/frame).
// Un singur input (brut), rezultatele esențiale, aceleași reguli fiscale din fiscal.ts
// (facilitatea la minim, deducerea personală, plafoanele). Fără dependențe de layout.

import { useState } from "react";
import { calculStandard, SALARIU_MINIM } from "@/lib/fiscal";

const fmt = (n: number) => n.toLocaleString("ro-RO");

export default function WidgetCalculator() {
  const [brut, setBrut] = useState(String(SALARIU_MINIM));

  const brutNum = parseFloat(brut) || 0;
  const r = brutNum > 0 ? calculStandard(brutNum) : null;
  const procentStat = r ? Math.round(((r.cas + r.cass + r.impozit) / brutNum) * 100) : 0;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-canvas px-4 py-4">
      <p className="text-sm font-bold tracking-[-0.01em] text-stone-900">
        Calculator salariu net 2026
      </p>

      <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-stone-500" htmlFor="w-brut">
        Salariu brut lunar (lei)
      </label>
      <input
        id="w-brut"
        type="number"
        inputMode="numeric"
        min={0}
        value={brut}
        onChange={(e) => setBrut(e.target.value)}
        className="mt-1 w-full rounded-md border border-stone-300 bg-surface px-3 py-2.5 text-lg font-semibold tabular-nums text-stone-900 outline-none focus:border-stone-500"
        placeholder={`ex. ${SALARIU_MINIM}`}
      />

      {r ? (
        <div className="mt-4">
          <div className="flex items-baseline justify-between border-b border-stone-300 pb-2">
            <span className="text-sm font-medium text-stone-700">Salariu net</span>
            <span className="text-2xl font-bold tabular-nums tracking-[-0.02em] text-stone-900">
              {fmt(r.net)} lei
            </span>
          </div>

          <dl className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-600">CAS (pensie, 25%)</dt>
              <dd className="tabular-nums text-stone-800">−{fmt(r.cas)} lei</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-600">CASS (sănătate, 10%)</dt>
              <dd className="tabular-nums text-stone-800">−{fmt(r.cass)} lei</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-600">Impozit pe venit (10%)</dt>
              <dd className="tabular-nums text-stone-800">−{fmt(r.impozit)} lei</dd>
            </div>
            {r.facilitate > 0 && (
              <div className="flex justify-between">
                <dt className="text-stone-600">Sumă netaxată (OUG 89/2025)</dt>
                <dd className="tabular-nums text-stone-800">{fmt(r.facilitate)} lei</dd>
              </div>
            )}
            {r.deducerePersonala > 0 && (
              <div className="flex justify-between">
                <dt className="text-stone-600">Deducere personală</dt>
                <dd className="tabular-nums text-stone-800">{fmt(r.deducerePersonala)} lei</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-stone-200 pt-1.5">
              <dt className="text-stone-600">Pleacă la stat</dt>
              <dd className="tabular-nums font-medium text-stone-900">
                {fmt(r.cas + r.cass + r.impozit)} lei ({procentStat}% din brut)
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-600">Cost total angajator (cu CAM)</dt>
              <dd className="tabular-nums text-stone-800">{fmt(r.costTotal)} lei</dd>
            </div>
          </dl>
        </div>
      ) : (
        <p className="mt-4 text-sm text-stone-500">Introdu salariul brut ca să vezi calculul.</p>
      )}

      <p className="mt-auto pt-4 text-xs text-stone-500">
        Actualizat cu legislația de la 1 iulie 2026 (HG 146/2026, OUG 89/2025) ·{" "}
        <a
          href="https://salariile.ro?utm_source=widget"
          target="_blank"
          rel="noopener"
          className="font-medium text-stone-700 underline underline-offset-2 hover:text-stone-900"
        >
          salariile.ro
        </a>
      </p>
    </div>
  );
}
