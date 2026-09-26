import PaginaZileLucratoare, { metadataZileLucratoare } from "@/app/components/PaginaZileLucratoare";

// Șablonul comun al anilor, în src/app/components/PaginaZileLucratoare.tsx.
export const metadata = metadataZileLucratoare(2030);

export default function Page() {
  return <PaginaZileLucratoare an={2030} />;
}
