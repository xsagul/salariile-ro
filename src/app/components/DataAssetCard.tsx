type DataAssetCardProps = {
  href: string;
  title: string;
  description: string;
  updated: string;
};

export default function DataAssetCard({ href, title, description, updated }: DataAssetCardProps) {
  return (
    <aside className="mt-8 max-w-3xl rounded-md border border-stone-300 bg-surface p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-600">Set de date reutilizabil</p>
      <h2 className="mt-2 text-lg font-bold tracking-[-0.02em] text-stone-900">{title}</h2>
      <p className="mt-2 text-sm leading-normal text-stone-700">{description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={href}
          download
          type="text/csv"
          className="inline-flex min-h-11 items-center rounded border border-stone-900 bg-stone-900 px-4 text-sm font-medium text-white no-underline transition-colors hover:bg-stone-700"
        >
          Descarcă CSV
        </a>
        <a
          href={href}
          className="inline-flex min-h-11 items-center rounded border border-stone-300 bg-white px-4 text-sm font-medium text-stone-900 no-underline transition-colors hover:bg-stone-100"
        >
          Deschide linkul direct
        </a>
      </div>
      <p className="mt-3 text-xs leading-normal text-stone-600">
        Actualizat {updated}. Conține informații publice în baza Licenței pentru Guvernare Deschisă v1.0; indică INS
        și Salariile.ro când îl reutilizezi.
      </p>
    </aside>
  );
}
