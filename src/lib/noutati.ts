// src/lib/noutati.ts
// Motorul „Noutăți": citește fișierele Markdown din content/noutati/,
// le parsează frontmatter-ul (titlu, dată, poză) și transformă textul în HTML.
// Rulează DOAR la build / pe server — nu ajunge nimic din astea în browser.
//
// Ca să adaugi un articol nou: pui un fișier nou content/noutati/<slug>.md.
// Atât. Lista și pagina se generează singure.

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const DIR = path.join(process.cwd(), "content", "noutati");

export type ArticleMeta = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO „yyyy-mm-dd"
  hero?: string; // cale în /public, ex: /noutati/cos-minim.jpg
  heroAlt?: string;
  readingMin: number;
};

export type Article = ArticleMeta & { html: string };

function toISO(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return typeof d === "string" ? d : "";
}

function readRaw(slug: string): string {
  return fs.readFileSync(path.join(DIR, `${slug}.md`), "utf8");
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

function metaFrom(slug: string, data: Record<string, unknown>, content: string): ArticleMeta {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return {
    slug,
    title: (data.title as string) ?? slug,
    description: (data.description as string) ?? "",
    date: toISO(data.date),
    hero: (data.hero as string) || undefined,
    heroAlt: (data.heroAlt as string) || undefined,
    readingMin: Math.max(1, Math.round(words / 200)),
  };
}

export function getAllArticles(): ArticleMeta[] {
  return getAllSlugs()
    .map((slug) => {
      const { data, content } = matter(readRaw(slug));
      return metaFrom(slug, data, content);
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getArticle(slug: string): Article | null {
  if (!getAllSlugs().includes(slug)) return null;
  const { data, content } = matter(readRaw(slug));
  // marked emite align="..." (atribut legacy) pe th/td. Îl convertim în stil
  // inline ca să bată CSS-ul din <Prose> (altfel header-ul aliniat e suprascris).
  const html = (marked.parse(content, { async: false }) as string)
    .replace(/ align="(left|center|right)"/g, ' style="text-align:$1"');
  return { ...metaFrom(slug, data, content), html };
}

const MONTHS = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
];

export function formatDateRo(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
