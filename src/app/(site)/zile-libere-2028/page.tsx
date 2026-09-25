import PaginaZileLibere, { metadataZileLibere } from "@/app/components/PaginaZileLibere";

// Șablonul comun al anilor, în src/app/components/PaginaZileLibere.tsx.
export const metadata = metadataZileLibere(2028);

export default function Page() {
  return <PaginaZileLibere an={2028} />;
}
