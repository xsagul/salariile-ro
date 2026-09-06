import fs from 'node:fs';
import * as cheerio from 'cheerio';

const url = 'https://cariera.ejobs.ro/salarii-romania-ghidul-salarial-ejobs-2026/';
const response = await fetch(url);
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const dom = cheerio.load(await response.text());
const rows = [];
dom('table').each((i, table) => dom(table).find('tr').each((j, row) => {
  const cells = dom(row).find('td,th').map((k, cell) => dom(cell).text().trim()).get();
  if (cells.length) rows.push(cells);
}));
fs.mkdirSync('research/surse-salarii', { recursive: true });
fs.writeFileSync('research/surse-salarii/ejobs-2026-tabele.json', JSON.stringify({url, checkedAt: '2026-09-07', rows}, null, 2) + '\n');
console.log(rows.map(r => r.slice(0, 2).join(' | ')).join('\n'));
