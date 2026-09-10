// src/app/components/Link.tsx
//
// Singurul `Link` al site-ului. Identic cu `next/link`, cu o diferență:
// pre-încărcarea e OPRITĂ implicit.
//
// De ce: `next/link` pre-încarcă automat, în producție, fiecare rută statică
// al cărei link intră în ecran — iar Next 16 cere fiecare segment separat.
// Măsurat pe 11 septembrie 2026, vizitator nou pe mobil, cu scroll până jos:
// homepage 143 de cereri, din care 113 pre-încărcări; /salariu-minim 139 / 108.
// Fiecare pre-încărcare e o Edge Request și o citire ISR pe planul Hobby, care
// are plafon de 1M și pune site-ul pe pauză (503) la depășire susținută. Iar
// 85% din vizite sunt de o singură pagină: pre-încărcarea lucra pentru pagini
// pe care vizitatorul nu le deschidea niciodată.
//
// Navigarea rămâne client-side; doar datele paginii următoare se cer la click,
// nu în avans. Pentru un link anume se poate reactiva explicit cu `prefetch`.
// Nu importa `next/link` direct: `scripts/test-ui-contracts.mts` o interzice.

import NextLink from "next/link";
import type { ComponentProps } from "react";

export default function Link({
  prefetch = false,
  ...props
}: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={prefetch} {...props} />;
}
