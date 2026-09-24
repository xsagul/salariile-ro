/**
 * Iconița de calculator de pe butoanele „Calculează": plus, minus, ori și egal
 * într-un pătrat rotunjit. Una singură pentru toate calculatoarele, ca butonul să
 * arate la fel peste tot. Decorativă: cititorul de ecran citește doar textul.
 * Culoarea vine din text (`currentColor`), deci e albă pe butonul negru.
 */
export default function IconCalculeaza({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
    >
      <rect x="3" y="3" width="18" height="18" rx="3.5" />
      <path d="M7 8.5h4M9 6.5v4M13 8.5h4M7.4 14.4l3.2 3.2M10.6 14.4l-3.2 3.2M13 14.8h4M13 17.4h4" />
    </svg>
  );
}
