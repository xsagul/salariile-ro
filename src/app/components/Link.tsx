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
//
// Excepție: paginile hubului de anunțuri le face Worker-ul, nu Next, deci n-au datele de
// pagină pe care routerul le cere la click. Măsurat pe 29 septembrie 2026: un click pe
// „Locuri de muncă” cerea /locuri-de-munca.txt, primea 404 (o invocare de Worker în plus)
// și abia apoi reîncărca pagina. Spre ele, un <a> simplu: navigare completă, din prima.

import NextLink from "next/link";
import type { ComponentProps } from "react";

const RUTE_WORKER = /^\/(locuri-de-munca|anunt-angajare-)/;
// Proprietățile routerului, pe care un <a> simplu nu le cunoaște.
const DOAR_ROUTER = ["as", "replace", "scroll", "shallow", "passHref", "locale", "legacyBehavior", "onNavigate", "unstable_dynamicOnHover", "transitionTypes"];

export default function Link({
  prefetch = false,
  ...props
}: ComponentProps<typeof NextLink>) {
  if (typeof props.href === "string" && RUTE_WORKER.test(props.href)) {
    const a: Record<string, unknown> = { ...props };
    for (const k of DOAR_ROUTER) delete a[k];
    return <a {...(a as ComponentProps<"a">)} />;
  }
  return <NextLink prefetch={prefetch} {...props} />;
}
