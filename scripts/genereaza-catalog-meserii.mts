// Catalogul de meserii, scos din sursa de adevar `src/lib/meserii.ts` intr-un
// fisier pe care crawlerul il poate citi fara alias-urile TypeScript.
// Cu `--check` nu scrie nimic, doar cade daca fisierul a ramas in urma.
import fs from 'node:fs';
import { MESERII } from '../src/lib/meserii';

const cale = 'src/data/meserii-catalog.json';
const continut = JSON.stringify(
  { generatDin: 'src/lib/meserii.ts', meserii: MESERII.map(({ slug, nume }) => ({ slug, nume })) },
  null, 2) + '\n';

if (process.argv.includes('--check')) {
  const actual = fs.existsSync(cale) ? fs.readFileSync(cale, 'utf8') : '';
  if (actual !== continut) {
    throw new Error(`${cale} a ramas in urma fata de MESERII. Ruleaza: npx tsx scripts/genereaza-catalog-meserii.mts`);
  }
  console.log(`OK: catalogul crawlerului e sincron cu cele ${MESERII.length} de meserii.`);
} else {
  fs.writeFileSync(cale, continut);
  console.log(`scris ${cale}: ${MESERII.length} meserii`);
}
