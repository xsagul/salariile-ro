"use client";

// src/app/components/WidgetCalculator.tsx
// Calculatorul compact embeddabil (rulează în <iframe> pe alte site-uri, la /widget/frame).
// Stil compact pentru embed: direcție de calcul, input cu unitate inline, opțiuni
// fiscale avansate într-un <details> și rezultat în card separat. Fără PDF/fluturaș:
// acelea rămân în calculatorul complet.

import { useState, useEffect, useRef, useCallback } from "react";
import {
  calculStandard,
  calculeaza,
  calculeazaBrutDinNet,
  SALARIU_MINIM,
  type InputState,
} from "@/lib/fiscal";

const fmt = (n: number) => n.toLocaleString("ro-RO");
const doarCifre = (s: string) => s.replace(/\D/g, "");
const grupeazaMii = (raw: string) => {
  const n = Number(raw);
  return raw && Number.isFinite(n) ? new Intl.NumberFormat("ro-RO").format(n) : "";
};

const EX_BRUT = SALARIU_MINIM;
const EX_NET = calculStandard(SALARIU_MINIM)?.net ?? 2699;
const initialValue = (initialBrut?: string) => initialBrut || "";
const ADV_DEFAULTS: Omit<InputState, "brut"> = {
  tichete: "",
  functieDeBAza: true,
  persoanePretretinere: 0,
  varstaSub26: false,
  copiiScolarizati: 0,
  scutitImpozit: false,
};

export default function WidgetCalculator({ initialBrut }: { initialBrut?: string }) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const advancedPanelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [mod, setMod] = useState<"brut" | "net">("brut");
  const [valoare, setValoare] = useState(initialValue(initialBrut));
  const [emptyWarn, setEmptyWarn] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);
  const [scrollbar, setScrollbar] = useState({ visible: false, top: 0, height: 0 });
  const [scrollbarMounted, setScrollbarMounted] = useState(false);
  const [scrollbarShown, setScrollbarShown] = useState(false);
  const [advanced, setAdvanced] = useState(ADV_DEFAULTS);
  const [resultVisible, setResultVisible] = useState(Boolean(initialBrut));
  const [brutCalculat, setBrutCalculat] = useState(parseFloat(initialValue(initialBrut)) || 0);
  const [rez, setRez] = useState<ReturnType<typeof calculStandard>>(
    initialBrut ? calculeaza({ ...ADV_DEFAULTS, brut: initialValue(initialBrut) }) : null
  );

  const calcDinBrut = (brut: number) => calculeaza({ ...advanced, brut: String(brut) });
  const brutDinNet = (net: number) => calculeazaBrutDinNet(net, advanced);

  const closeAdvanced = useCallback(() => {
    setAdvancedOpen(false);
    setScrollbarShown(false);

    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setLockedHeight(null);
      setScrollbarMounted(false);
      setScrollbar({ visible: false, top: 0, height: 0 });
      closeTimerRef.current = null;
    }, 340);
  }, []);

  const handleCalculeaza = () => {
    const v = parseFloat(valoare) || 0;
    if (v <= 0) {
      setEmptyWarn(true);
      return;
    }
    setEmptyWarn(false);
    const brutNum = mod === "brut" ? v : brutDinNet(v);
    const nextRez = calcDinBrut(brutNum);
    setResultVisible(false);
    window.setTimeout(() => {
      setBrutCalculat(brutNum);
      setRez(nextRez);
      window.setTimeout(() => setResultVisible(true), 40);
    }, rez ? 120 : 40);
    closeAdvanced();
  };

  const toggleAdvanced = () => {
    if (advancedOpen) {
      closeAdvanced();
      return;
    }
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    const height = widgetRef.current ? Math.ceil(widgetRef.current.getBoundingClientRect().height) : 660;
    const expandedExtra = advancedPanelRef.current?.scrollHeight || 0;
    const estimatedScrollHeight = height + expandedExtra;
    const estimatedThumbHeight = Math.max(28, Math.round((height / estimatedScrollHeight) * height));
    setLockedHeight(height);
    setScrollbar({ visible: expandedExtra > 1, top: 0, height: estimatedThumbHeight });
    setScrollbarMounted(expandedExtra > 1);
    setScrollbarShown(false);
    setAdvancedOpen(true);
    window.requestAnimationFrame(() => setScrollbarShown(expandedExtra > 1));
  };

  const updateAdvanced = <K extends keyof typeof advanced>(key: K, value: (typeof advanced)[K]) => {
    setAdvanced((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "persoanePretretinere" && prev.copiiScolarizati > Number(value)
        ? { copiiScolarizati: Number(value) }
        : {}),
    }));
  };

  const updateScrollbar = useCallback(() => {
    const el = widgetRef.current;
    if (!advancedOpen || !el) {
      setScrollbar({ visible: false, top: 0, height: 0 });
      return;
    }

    const scrollable = el.scrollHeight - el.clientHeight;
    if (scrollable <= 1) {
      setScrollbar({ visible: false, top: 0, height: 0 });
      return;
    }

    const trackHeight = el.clientHeight;
    const proportionalHeight = Math.round((el.clientHeight / el.scrollHeight) * trackHeight);
    const thumbHeight = Math.max(28, proportionalHeight);
    const thumbTop = Math.round((el.scrollTop / scrollable) * (trackHeight - thumbHeight));
    setScrollbar({ visible: true, top: thumbTop, height: thumbHeight });
  }, [advancedOpen]);

  const totalTaxe = rez ? rez.cas + rez.cass + rez.impozit : 0;
  const totalDistributie = rez ? rez.net + totalTaxe + rez.cam : 0;
  const procentAngajat = rez && totalDistributie > 0 ? Math.round((rez.net / totalDistributie) * 100) : 0;
  const procentStat = rez ? 100 - procentAngajat : 0;

  // Auto-resize: trimite înălțimea reală a conținutului către pagina-gazdă, ca
  // iframe-ul să se dimensioneze singur (fără height fix). ResizeObserver prinde
  // orice schimbare de conținut (ex. rândurile apar/dispar la recalcul).
  useEffect(() => {
    const send = () => {
      const target = widgetRef.current || document.body;
      const height = Math.ceil(target.getBoundingClientRect().height);
      window.parent?.postMessage({ type: "salariile:height", height }, "*");
    };
    send();
    const raf = window.requestAnimationFrame(send);
    const timer = window.setTimeout(send, 250);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(send) : null;
    if (widgetRef.current) ro?.observe(widgetRef.current);
    window.addEventListener("load", send);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      ro?.disconnect();
      window.removeEventListener("load", send);
    };
  }, [mod, rez, emptyWarn, advancedOpen, lockedHeight]);

  useEffect(() => {
    if (!advancedOpen) return;
    const timer = window.setTimeout(updateScrollbar, 320);
    return () => {
      window.clearTimeout(timer);
    };
  }, [advancedOpen, lockedHeight, rez, updateScrollbar]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[420px]">
    <div
      ref={widgetRef}
      style={lockedHeight ? { height: lockedHeight } : undefined}
      onScroll={updateScrollbar}
      className={`flex w-full flex-col gap-4 bg-canvas px-4 py-4 text-stone-900 ${
        lockedHeight
          ? advancedOpen
            ? "overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "overflow-hidden"
          : ""
      }`}
    >
      {/* ── Card „Date salariale" — identic ca stil cu homepage-ul ── */}
      <div className="rounded-md border border-stone-200 bg-surface p-4 shadow-soft">
        <h2 className="mb-4 border-b border-stone-200 pb-2 text-base font-medium text-stone-900">
          Date salariale
        </h2>

        <div className="mb-5">
          <span className="mb-2 block text-xs font-medium text-stone-500">Direcție de calcul</span>
          <div className="flex w-full overflow-hidden rounded border border-stone-300">
            <button
              type="button"
              className={`flex-1 inline-flex min-h-9 items-center justify-center px-3 text-xs font-medium transition-colors ${mod === "brut" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-canvas"}`}
              onClick={() => {
                if (mod === "net") {
                  const netVal = parseFloat(valoare);
                  if (netVal > 0) {
                    const brutNum = brutDinNet(netVal);
                    setValoare(String(brutNum));
                    setBrutCalculat(brutNum);
                    setRez(calcDinBrut(brutNum));
                  }
                }
                setMod("brut");
              }}
            >
              Din brut în net
            </button>
            <button
              type="button"
              className={`border-l border-stone-300 flex-1 inline-flex min-h-9 items-center justify-center px-3 text-xs font-medium transition-colors ${mod === "net" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-canvas"}`}
              onClick={() => {
                if (mod === "brut") {
                  const brutVal = parseFloat(valoare);
                  if (brutVal > 0) {
                    const r = calcDinBrut(brutVal);
                    if (r) setValoare(String(r.net));
                    setBrutCalculat(brutVal);
                    setRez(r);
                  }
                }
                setMod("net");
              }}
            >
              Din net în brut
            </button>
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="w-brut" className="mb-2 block text-xs font-medium text-stone-500">
            {mod === "brut" ? "Salariu brut" : "Salariu net"}
          </label>
          <div
            className={`flex w-full overflow-hidden rounded border transition focus-within:border-stone-400 focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)] ${emptyWarn ? "border-stone-500" : "border-stone-300"}`}
          >
            <input
              id="w-brut"
              name="w-brut"
              type="text"
              inputMode="numeric"
              value={grupeazaMii(valoare)}
              onChange={(e) => { setValoare(doarCifre(e.target.value)); if (emptyWarn) setEmptyWarn(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCalculeaza(); } }}
              placeholder={mod === "brut" ? `ex: ${grupeazaMii(String(EX_BRUT))}` : `ex: ${grupeazaMii(String(EX_NET))}`}
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base text-stone-900 outline-none"
            />
            <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-500">
              lei / lună
            </span>
          </div>
          {emptyWarn && (
            <span role="alert" className="mt-2 block text-xs font-medium text-stone-900">
              Introdu un salariu mai întâi.
            </span>
          )}
        </div>

        <div className="mb-5 rounded border border-dashed border-stone-300 bg-surface">
          <button
            type="button"
            className="flex min-h-10 w-full items-center justify-center px-3 text-xs font-medium text-stone-500 transition-colors hover:text-stone-700"
            onClick={toggleAdvanced}
            aria-expanded={advancedOpen}
          >
            {advancedOpen ? "▲ Ascunde opțiuni avansate" : "▼ Opțiuni avansate"}
          </button>

          <div
            className={`grid border-t border-dashed transition-[grid-template-rows,opacity,border-color] duration-300 ease-out ${
              advancedOpen
                ? "grid-rows-[1fr] border-stone-300 opacity-100"
                : "pointer-events-none grid-rows-[0fr] border-transparent opacity-0"
            }`}
            aria-hidden={!advancedOpen}
          >
            <div ref={advancedPanelRef} className="min-h-0 overflow-hidden">
              <div className="p-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-medium text-stone-500">
                    Persoane în întreținere
                    <select
                      value={advanced.persoanePretretinere}
                      onChange={(e) => updateAdvanced("persoanePretretinere", Number(e.target.value))}
                      className="mt-1 h-9 w-full rounded border border-stone-300 bg-white px-2 text-sm text-stone-900 outline-none focus:border-stone-400"
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n === 0 ? "Niciuna" : n}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-xs font-medium text-stone-500">
                    Copii școlari
                    <select
                      value={advanced.copiiScolarizati}
                      disabled={advanced.persoanePretretinere === 0}
                      onChange={(e) => updateAdvanced("copiiScolarizati", Number(e.target.value))}
                      className="mt-1 h-9 w-full rounded border border-stone-300 bg-white px-2 text-sm text-stone-900 outline-none disabled:bg-canvas disabled:text-stone-400 focus:border-stone-400"
                    >
                      {Array.from({ length: advanced.persoanePretretinere + 1 }, (_, n) => (
                        <option key={n} value={n}>{n === 0 ? "Niciunul" : n}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-3 divide-y divide-stone-200 rounded border border-stone-200 bg-canvas">
                  <label className="flex min-h-9 items-center justify-between gap-3 px-3 text-xs text-stone-600">
                    Funcție de bază
                    <input
                      type="checkbox"
                      checked={advanced.functieDeBAza}
                      onChange={(e) => updateAdvanced("functieDeBAza", e.target.checked)}
                      className="h-4 w-4 accent-stone-900"
                    />
                  </label>
                  <label className="flex min-h-9 items-center justify-between gap-3 px-3 text-xs text-stone-600">
                    Vârstă sub 26 ani
                    <input
                      type="checkbox"
                      checked={advanced.varstaSub26}
                      onChange={(e) => updateAdvanced("varstaSub26", e.target.checked)}
                      className="h-4 w-4 accent-stone-900"
                    />
                  </label>
                  <label className="flex min-h-9 items-center justify-between gap-3 px-3 text-xs text-stone-600">
                    Scutit de impozit
                    <input
                      type="checkbox"
                      checked={advanced.scutitImpozit}
                      onChange={(e) => updateAdvanced("scutitImpozit", e.target.checked)}
                      className="h-4 w-4 accent-stone-900"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="block min-h-11 w-full rounded bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-800 active:translate-y-px"
          onClick={handleCalculeaza}
        >
          Calculează
        </button>
      </div>

      {/* ── Rezultat ── */}
      {rez ? (
        <div className={`rounded-md border border-stone-200 bg-surface p-4 shadow-soft transition-[opacity,transform] duration-300 ease-out ${
          resultVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}>
          <div className="flex items-baseline justify-between gap-3 border-b border-stone-200 pb-3">
            <span className="text-sm font-medium text-stone-700">Salariu net</span>
            <span className="text-right text-2xl font-bold tabular-nums tracking-[-0.02em] text-stone-900">
              {fmt(rez.net)} lei
            </span>
          </div>

          <dl className="mt-3 space-y-1.5 text-sm">
            {mod === "net" && (
              <div className="flex items-start justify-between gap-3">
                <dt className="text-stone-600">Brut estimat</dt>
                <dd className="shrink-0 tabular-nums text-stone-800">{fmt(brutCalculat)} lei</dd>
              </div>
            )}
            <div className="flex items-start justify-between gap-3">
              <dt className="text-stone-600">CAS (pensie, 25%)</dt>
              <dd className="shrink-0 tabular-nums text-stone-800">−{fmt(rez.cas)} lei</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-stone-600">CASS (sănătate, 10%)</dt>
              <dd className="shrink-0 tabular-nums text-stone-800">−{fmt(rez.cass)} lei</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-stone-600">Impozit pe venit (10%)</dt>
              <dd className="shrink-0 tabular-nums text-stone-800">−{fmt(rez.impozit)} lei</dd>
            </div>
            {rez.facilitate > 0 && (
              <div className="flex items-start justify-between gap-3">
                <dt className="text-stone-600">Sumă netaxată (OUG 89/2025)</dt>
                <dd className="shrink-0 tabular-nums text-stone-800">{fmt(rez.facilitate)} lei</dd>
              </div>
            )}
            {rez.deducerePersonala > 0 && (
              <div className="flex items-start justify-between gap-3">
                <dt className="text-stone-600">Deducere personală</dt>
                <dd className="shrink-0 tabular-nums text-stone-800">{fmt(rez.deducerePersonala)} lei</dd>
              </div>
            )}
            <div className="flex items-start justify-between gap-3 border-t border-stone-200 pt-1.5">
              <dt className="text-stone-600">Cost total angajator (cu CAM)</dt>
              <dd className="shrink-0 tabular-nums text-stone-800">{fmt(rez.costTotal)} lei</dd>
            </div>
          </dl>

          <div className="mt-4">
            <div
              className="flex h-9 w-full overflow-hidden rounded border border-dashed border-stone-300 text-xs font-medium"
              role="img"
              aria-label={`Din costul total al firmei, ${procentAngajat}% ajunge la angajat și ${procentStat}% la stat.`}
            >
              <div
                className="flex min-w-0 items-center justify-start overflow-hidden whitespace-nowrap bg-stone-900 px-3 text-white"
                style={{ flexGrow: procentAngajat, flexBasis: 0 }}
              >
                Angajat {procentAngajat}%
              </div>
              <div
                className="flex min-w-0 items-center justify-end overflow-hidden whitespace-nowrap border-l border-dashed border-stone-300 bg-canvas px-3 text-stone-700"
                style={{ flexGrow: procentStat, flexBasis: 0 }}
              >
                Stat {procentStat}%
              </div>
            </div>
            <p className="mt-2 text-xs text-stone-500">
              Din costul total al firmei: netul tău vs taxe și contribuții ({fmt(totalTaxe + rez.cam)} lei).
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-stone-200 bg-surface p-4 shadow-soft">
          <div className="flex min-h-[306px] flex-col items-center justify-center rounded border border-dashed border-stone-300 bg-canvas p-4 text-center">
            <span
              className="mb-3 flex h-10 w-10 items-center justify-center rounded border border-stone-300 bg-transparent text-stone-700"
              aria-hidden="true"
            >
              <span className="flex h-5 w-5 flex-col justify-between">
                <span className="h-0.5 w-full rounded-sm bg-stone-700" />
                <span className="h-0.5 w-4 rounded-sm bg-stone-500" />
                <span className="grid grid-cols-3 gap-0.5">
                  <span className="h-1.5 rounded-sm bg-stone-400" />
                  <span className="h-1.5 rounded-sm bg-stone-400" />
                  <span className="h-1.5 rounded-sm bg-stone-700" />
                </span>
              </span>
            </span>
            <p className="max-w-52 text-sm text-stone-500">Introdu salariul și apasă Calculează.</p>
          </div>
        </div>
      )}

      <p className="text-xs text-stone-500">
        Actualizat conform legislației în vigoare ·{" "}
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
    {scrollbarMounted && (
      <div
        className={`pointer-events-none absolute bottom-0 right-0 top-0 w-2 bg-stone-200/70 transition-opacity duration-200 ease-out ${
          scrollbarShown && scrollbar.visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="absolute right-0 w-2 rounded-sm bg-stone-900"
          style={{ top: scrollbar.top, height: scrollbar.height }}
        />
      </div>
    )}
    </div>
  );
}
