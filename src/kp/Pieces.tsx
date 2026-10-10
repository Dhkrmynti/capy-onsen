/** The Orbiters mark: a cream rocket climbing across a red planet, one orbit ring around it. */
export const SR = { red: "#d6372b", cream: "#f1e4c8", blue: "#1f2f8a", night: "#0e1433", ink: "#161616", burn: "#ff7a1a" } as const;

export function Mark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={`mark ${className}`} viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <circle cx="24" cy="24" r="17" fill={SR.red} />
      <ellipse cx="24" cy="24" rx="23" ry="8" fill="none" stroke={SR.cream} strokeWidth="2.6" transform="rotate(-24 24 24)" />
      <g transform="rotate(38 24 24)">
        <path d="M24 7 C 28.5 11, 29.5 17, 29 27 H 19 C 18.5 17, 19.5 11, 24 7 Z" fill={SR.cream} />
        <path d="M19 22 L 14.5 29 L 19 28 Z M29 22 L 33.5 29 L 29 28 Z" fill={SR.cream} />
        <circle cx="24" cy="16.5" r="2.4" fill={SR.blue} />
        <path d="M21 28.5 L 24 35 L 27 28.5 Z" fill={SR.burn} />
      </g>
    </svg>
  );
}
