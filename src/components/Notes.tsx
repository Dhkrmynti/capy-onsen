import { forwardRef } from "react";

interface Props {
  className?: string;
  /** Draw the coin stack beside the notes. */
  pad?: boolean;
  title?: string;
}

const INK = "var(--nt-ink)";

/** Guilloche: the engraved rosette every old note carries, drawn as overlapping rings. */
function Rosette({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g fill="none" stroke="var(--nt-line)" strokeWidth="1.6">
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return <circle key={i} cx={cx + Math.cos(a) * r * 0.45} cy={cy + Math.sin(a) * r * 0.45} r={r * 0.55} />;
      })}
      <circle cx={cx} cy={cy} r={r} strokeWidth="3" stroke={INK} />
    </g>
  );
}

/** One engraved banknote, 300 × 150 before rotation. */
function Note({ x, y, rot, shade }: { x: number; y: number; rot: number; shade: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-150" y="-75" width="300" height="150" rx="6" fill={shade} stroke={INK} strokeWidth="5" />
      <rect x="-136" y="-61" width="272" height="122" rx="3" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="6 4" />
      <Rosette cx={-84} cy={0} r={40} />
      {/* the denomination, engraved */}
      <text x="60" y="-18" textAnchor="middle" fontFamily="Georgia, serif" fontSize="34" fill={INK}>
        ONE
      </text>
      <text x="60" y="16" textAnchor="middle" fontFamily="Arial Narrow, sans-serif" fontSize="30" letterSpacing="3" fill={INK}>
        INHERITANCE
      </text>
      <path d="M-10 36 H 130" stroke={INK} strokeWidth="2" />
      <text x="60" y="52" textAnchor="middle" fontFamily="Courier New, monospace" fontSize="12" fill={INK}>
        PAYABLE TO THE TEN HEIRS
      </text>
      <circle cx="-126" cy="-51" r="7" fill="none" stroke={INK} strokeWidth="2" />
      <circle cx="126" cy="51" r="7" fill="none" stroke={INK} strokeWidth="2" />
    </g>
  );
}

/**
 * The press photograph for a paper with no mascot: a stack of engraved notes tied with a
 * paper band, and a short pile of coins. Same 420 × 430 frame the halftone screen expects.
 */
export const Notes = forwardRef<SVGSVGElement, Props>(function Notes({ className, pad = true, title = "A stack of engraved banknotes tied with a paper band, beside a pile of gold coins" }, ref) {
  return (
    <svg ref={ref} className={className} viewBox="0 0 420 430" role="img" aria-label={title} style={{ overflow: "visible" }}>
      {/* the table */}
      <ellipse cx="210" cy="392" rx="196" ry="22" fill="var(--nt-shadow)" />
      <Note x={214} y={300} rot={-4} shade="var(--nt-note-dark)" />
      <Note x={206} y={272} rot={3} shade="var(--nt-note)" />
      <Note x={210} y={240} rot={-2} shade="var(--nt-note-light)" />
      {/* the paper band */}
      <rect x="166" y="160" width="40" height="164" transform="rotate(-2 186 242)" fill="var(--nt-band)" stroke={INK} strokeWidth="4" />
      <text x="186" y="248" transform="rotate(-92 186 248)" textAnchor="middle" fontFamily="Arial Narrow, sans-serif" fontSize="22" letterSpacing="2" fill={INK}>
        $10,000
      </text>
      {pad ? (
        <g stroke={INK} strokeWidth="4">
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <ellipse cx="350" cy={372 - i * 16} rx="44" ry="13" fill="var(--nt-coin-dark)" />
              <ellipse cx="350" cy={366 - i * 16} rx="44" ry="13" fill="var(--nt-coin)" />
            </g>
          ))}
          <ellipse cx="62" cy="372" rx="40" ry="12" fill="var(--nt-coin-dark)" />
          <ellipse cx="62" cy="366" rx="40" ry="12" fill="var(--nt-coin)" />
        </g>
      ) : null}
    </svg>
  );
});
