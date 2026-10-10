/** The Horizon mark: a black disc inside its glowing accretion ring, the ring tilted like the disk. */
export const VD = { void: "#050506", paper: "#f3f3ef", line: "#8a8a86", hot: "#ff6b1a" } as const;

export function Mark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={`mark ${className}`} viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <ellipse cx="24" cy="24" rx="22" ry="7" fill="none" stroke={VD.hot} strokeWidth="3" transform="rotate(-14 24 24)" />
      <circle cx="24" cy="24" r="11.5" fill={VD.void} stroke={VD.paper} strokeWidth="1.6" />
      <path d="M5 26.5 C 14 30, 34 30, 43 21.5" fill="none" stroke={VD.hot} strokeWidth="3" strokeLinecap="round" transform="rotate(-14 24 24)" />
    </svg>
  );
}
