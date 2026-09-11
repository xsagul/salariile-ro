// scripts/genereaza-imagini.mts
//
// Generează variantele WebP pe care le cere next/image (vezi src/lib/image-loader.ts).
// Rulează înainte de `next build`. Ieșirea, public/_img, nu se comite: se
// reface din sursele din public/ la fiecare build și sare peste ce e deja la zi.

import sharp from "sharp";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { LATIMI_IMAGINI, caleVarianta } from "../src/lib/image-loader";

const PUBLIC = path.join(process.cwd(), "public");
const RASTER = [".png", ".jpg", ".jpeg", ".webp"];
const eRaster = (fisier: string) => RASTER.some((ext) => fisier.toLowerCase().endsWith(ext));

// Singurele surse folosite de <Image>: hero-urile paginilor pilon și imaginile
// articolelor din /noutati (câmpul `hero` din frontmatter).
const surse = [
  ...readdirSync(PUBLIC).filter((f) => f.startsWith("hero-") && eRaster(f)).map((f) => `/${f}`),
  ...readdirSync(path.join(PUBLIC, "noutati")).filter(eRaster).map((f) => `/noutati/${f}`),
];

let generate = 0;
let laZi = 0;
for (const src of surse) {
  const sursa = path.join(PUBLIC, src);
  for (const latime of LATIMI_IMAGINI) {
    const tinta = path.join(PUBLIC, caleVarianta(src, latime));
    if (existsSync(tinta) && statSync(tinta).mtimeMs >= statSync(sursa).mtimeMs) {
      laZi += 1;
      continue;
    }
    mkdirSync(path.dirname(tinta), { recursive: true });
    await sharp(sursa).resize({ width: latime, withoutEnlargement: true }).webp({ quality: 75 }).toFile(tinta);
    generate += 1;
  }
}

console.log(`Imagini: ${surse.length} surse, ${generate} variante generate, ${laZi} deja la zi.`);
