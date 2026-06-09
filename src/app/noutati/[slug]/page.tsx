// app/noutati/[slug]/page.tsx
// Șablonul UNIC de pagină de articol. Conținutul vine din content/noutati/<slug>.md.
// Adaugi un articol nou = adaugi un fișier .md. Nicio pagină nu se hardcodează.

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticle, getAllSlugs, formatDateRo } from "@/lib/noutati";
import { personSchema } from "@/lib/person";
import { Prose } from "@/app/components/ui";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  const url = `https://salariile.ro/noutati/${a.slug}`;
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: a.title,
      description: a.description,
      url,
      publishedTime: a.date,
      modifiedTime: a.date,
      authors: ["https://salariile.ro/despre"],
      ...(a.hero ? { images: [a.hero] } : {}),
    },
  };
}

export default async function ArticolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();

  const url = `https://salariile.ro/noutati/${a.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
          { "@type": "ListItem", position: 2, name: "Noutăți", item: "https://salariile.ro/noutati" },
          { "@type": "ListItem", position: 3, name: a.title, item: url },
        ],
      },
      {
        "@type": "BlogPosting",
        headline: a.title,
        description: a.description,
        datePublished: a.date,
        dateModified: a.date,
        url,
        mainEntityOfPage: url,
        ...(a.hero ? { image: `https://salariile.ro${a.hero}` } : {}),
        author: personSchema,
        publisher: { "@type": "Organization", name: "salariile.ro", url: "https://salariile.ro" },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="bg-canvas">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Antet articol */}
          <nav className="mb-4 flex flex-wrap gap-2 text-xs text-stone-500" aria-label="Breadcrumb">
            <Link href="/noutati" className="hover:text-stone-700">Noutăți</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-stone-600">Articol</span>
          </nav>

          <div className="mb-3 text-xs uppercase tracking-wide text-stone-500">
            {formatDateRo(a.date)} · {a.readingMin} min citire
          </div>
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-stone-900 sm:text-4xl">{a.title}</h1>
          {a.description && (
            <p className="mt-3 max-w-prose text-lg leading-normal tracking-[-0.01em] text-stone-600">{a.description}</p>
          )}

          {/* Imagine principală */}
          <div className="relative mt-6 aspect-[3/2] w-full overflow-hidden rounded-md border border-stone-200 bg-stone-100">
            {a.hero ? (
              <Image src={a.hero} alt={a.heroAlt || a.title} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium uppercase tracking-wide text-stone-400">Imagine articol</span>
            )}
          </div>

          {/* Corp articol */}
          <Prose className="mt-8">
            <div dangerouslySetInnerHTML={{ __html: a.html }} />
          </Prose>

          {/* Subsol */}
          <div className="mt-10 border-t border-stone-200 pt-6">
            <p className="text-sm text-stone-600">
              Scris de <Link href="/despre" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600">Sorin</Link>.
              {" "}
              <Link href="/noutati" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600">← Toate articolele</Link>
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
