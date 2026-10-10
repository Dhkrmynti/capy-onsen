/** The Plunders mark: the black flag, skull and crossbones, square for favicons and headers. */
import { SIG } from "../lib/flags";

export function Mark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={`mark ${className}`} viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <rect x="1.5" y="1.5" width="45" height="45" fill={SIG.K} stroke={SIG.K} strokeWidth="3" />
      <path d="M10 36 L 38 12 M10 12 L 38 36" stroke={SIG.W} strokeWidth="5" strokeLinecap="round" />
      <path d="M14 21 C 14 13, 18.5 9.5, 24 9.5 C 29.5 9.5, 34 13, 34 21 C 34 25.5, 31.8 27.6, 29.5 28.2 V 32 H 18.5 V 28.2 C 16.2 27.6, 14 25.5, 14 21 Z" fill={SIG.W} />
      <circle cx="20" cy="20.5" r="3.1" fill={SIG.K} />
      <circle cx="28" cy="20.5" r="3.1" fill={SIG.K} />
    </svg>
  );
}
