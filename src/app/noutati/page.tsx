// app/noutati/page.tsx
// Hub „Noutăți" — lista articolelor (blog personal). Din aici intri în fiecare articol.
// Stil aliniat cu restul site-ului (stone monocrom), dar format de listă ca pe site-urile de știri.

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllArticles, formatDateRo } from "@/lib/noutati";
import { personSchema } from "@/lib/person";

export const metadata: Metadata = {
  title: "Noutăți: articole despre salarii, taxe și bani în România",
  description:
    "Articole scrise pe înțelesul tuturor despre salarii, taxe, costul vieții și curiozități fiscale din România.",
  alternates: { canonical: "https://salariile.ro/noutati" },
  openGraph: {
    title: "Noutăți · salariile.ro",
    description:
      "Articole pe înțelesul tuturor despre salarii, taxe și costul vieții în România.",
    url: "https://salariile.ro/noutati",
  },
};

export default function NoutatiPage() {
  const articles = getAllArticles();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
          { "@type": "ListItem", position: 2, name: "Noutăți", item: "https://salariile.ro/noutati" },
        ],
      },
      {
        "@type": "Blog",
        name: "Noutăți · salariile.ro",
        url: "https://salariile.ro/noutati",
        author: personSchema,
        blogPost: articles.map((a) => ({
          "@type": "BlogPosting",
          headline: a.title,
          datePublished: a.date,
          url: `https://salariile.ro/noutati/${a.slug}`,
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        {/* HERO */}
        <section className="border-b border-stone-200 bg-canvas">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
            <h1 className="mb-3 text-3xl font-bold tracking-[-0.02em] text-stone-900 sm:text-4xl">Noutăți</h1>
            <p className="max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600">
              Articole scrise pe înțelesul tuturor despre salarii, taxe, costul vieții și alte curiozități despre banii din România – pe măsură ce le descopăr și le înțeleg.
            </p>
          </div>
        </section>

        {/* LISTĂ */}
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {articles.length === 0 ? (
              <p className="text-base text-stone-600">Încă nu am publicat niciun articol. Revino curând.</p>
            ) : (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/noutati/${a.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-md border border-stone-200 bg-surface shadow-soft transition-colors hover:border-stone-300"
                    >
                      <div className="relative aspect-[3/2] w-full overflow-hidden bg-stone-100">
                        {a.hero ? (
                          <Image src={a.hero} alt={a.heroAlt || a.title} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium uppercase tracking-wide text-stone-400">Imagine articol</span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-2 text-xs text-stone-500">{formatDateRo(a.date)} · {a.readingMin} min citire</div>
                        <h2 className="mb-2 text-lg font-bold leading-snug tracking-[-0.01em] text-stone-900 group-hover:text-stone-700">{a.title}</h2>
                        <p className="text-sm leading-normal text-stone-600">{a.description}</p>
                        <span className="mt-4 text-sm font-medium text-stone-900 underline underline-offset-2">Citește →</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
