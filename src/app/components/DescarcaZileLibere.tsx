"use client";
// Descărcările de pe paginile de zile libere (proprietar, 6 noiembrie 2026: „ca la zile
// lucrătoare”). Aceleași fișiere desenate în browser ca acolo (DescarcaZileLucratoare.tsx):
// tabelul sărbătorilor în PDF, calendarul în PDF și PNG, cu zilele libere în colțul lunii.
// Interogările paginii cer calendarul („calendar 2027 zile libere”, „calendar cu sărbători legale”).

import { useState } from "react";
import { trimiteEveniment } from "@/lib/analytics";
import type { LunaCalendar } from "@/app/components/CalendarAn";
import { deseneazaPdfCalendar, deseneazaPdfSarbatori, type RandSarbatoare } from "@/lib/pdf-zile-lucratoare";
import { BUTON, documentNou, pngCalendar } from "@/app/components/DescarcaZileLucratoare";

type Props = { an: number; luni: LunaCalendar[]; lista: RandSarbatoare[] };
type Tip = "pdf-tabel" | "pdf-calendar" | "png-calendar";

async function descarca(tip: Tip, { an, luni, lista }: Props) {
  if (tip === "png-calendar") return pngCalendar({ an, luni }, "libere", `calendar-zile-libere-${an}.png`);
  const doc = await documentNou("portrait");
  if (tip === "pdf-tabel") {
    deseneazaPdfSarbatori(doc, { an, lista });
    doc.save(`zile-libere-${an}.pdf`);
  } else {
    deseneazaPdfCalendar(doc, { an, luni }, "libere");
    doc.save(`calendar-zile-libere-${an}.pdf`);
  }
}

export default function DescarcaZileLibere(props: Props & { ce: "tabel" | "calendar" }) {
  const [lucreaza, setLucreaza] = useState<Tip | null>(null);
  const [eroare, setEroare] = useState(false);
  const porneste = async (tip: Tip) => {
    setLucreaza(tip);
    setEroare(false);
    try {
      await descarca(tip, props);
      trimiteEveniment("file_download", {
        file_extension: tip.startsWith("png") ? "png" : "pdf",
        file_name: `${tip}-${props.an}`,
        link_text: tip,
        instrument: "zile_libere",
      });
    } catch {
      setEroare(true);
    } finally {
      setLucreaza(null);
    }
  };
  const buton = (tip: Tip, text: string) => (
    <button type="button" className={BUTON} disabled={lucreaza !== null} onClick={() => porneste(tip)}>
      {lucreaza === tip ? "Se pregătește…" : text}
    </button>
  );
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      {props.ce === "tabel"
        ? buton("pdf-tabel", "Descarcă lista (PDF)")
        : (<>{buton("pdf-calendar", "Descarcă calendarul (PDF)")}{buton("png-calendar", "Descarcă calendarul (imagine)")}</>)}
      {eroare ? <span className="text-sm text-stone-600">Nu s-a putut descărca. Încearcă din nou.</span> : null}
    </div>
  );
}
