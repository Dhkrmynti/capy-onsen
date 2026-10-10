/** The Hawking mark: the black-hole pictogram inside a yellow warning triangle. */
import { HZ, Pictogram } from "./Signs";

export function Mark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={`mark ${className}`} viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <path d="M60 6 L 115 108 H 5 Z" fill={HZ.yellow} stroke={HZ.black} strokeWidth="9" strokeLinejoin="round" />
      <g transform="translate(30 46) scale(0.6)">
        <Pictogram kind="hole" />
      </g>
    </svg>
  );
}
