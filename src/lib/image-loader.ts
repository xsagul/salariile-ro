// src/lib/image-loader.ts
//
// Loader pentru next/image pe găzduire statică.
//
// Exportul static nu are optimizer de imagini, iar Cloudflare nu redimensionează
// la cerere pe planul gratuit. Variantele WebP se generează la build de
// scripts/genereaza-imagini.mts, în public/_img, exact pentru lățimile de aici;
// next.config.ts le citește tot de aici, ca să nu existe două liste.
//
// Fără pasul ăsta, hero-ul de 838 KB de pe /salariu-minim (pe Vercel servit
// optimizat la 640 px) ar fi plecat întreg, iar LCP-ul pe mobil ar fi căzut.

export const LATIMI_IMAGINI = [96, 640, 828, 1200] as const;

export function caleVarianta(src: string, width: number): string {
  const punct = src.lastIndexOf(".");
  const baza = punct > src.lastIndexOf("/") ? src.slice(0, punct) : src;
  return `/_img${baza}-${width}.webp`;
}

// Imaginea de share a articolelor (og:image), în JPG: Facebook, LinkedIn și WhatsApp
// nu afișează sigur WebP-ul în previzualizarea linkului. Verificat pe 6 noiembrie
// 2026: postarea pe Facebook cu linkul spre un articol a ieșit fără imagine.
export const SHARE_LATIME = 1200;
export const SHARE_INALTIME = 675;

export function caleShare(src: string): string {
  const punct = src.lastIndexOf(".");
  const baza = punct > src.lastIndexOf("/") ? src.slice(0, punct) : src;
  return `/_img${baza}-share.jpg`;
}

export default function imageLoader({ src, width }: { src: string; width: number }): string {
  return src.startsWith("/") ? caleVarianta(src, width) : src;
}
