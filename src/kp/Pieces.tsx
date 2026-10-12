/** The mark: a gold tile with a waiting-room chair on it. */
export function Mark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={`mark ${className}`} viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="10" fill="#ffc93c" stroke="#1a1206" strokeWidth="3" />
      <rect x="12" y="8" width="16" height="14" rx="3.5" fill="#1a1206" />
      <rect x="9" y="21.5" width="22" height="5.5" rx="2.5" fill="#1a1206" />
      <rect x="18.5" y="27" width="3" height="5" fill="#1a1206" />
      <rect x="13" y="31" width="14" height="3" rx="1.5" fill="#1a1206" />
    </svg>
  );
}
