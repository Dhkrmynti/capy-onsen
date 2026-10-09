/**
 * The engraver's kit for the Family Vault: guilloche rosettes and bands like the ones on
 * old banknotes and share certificates, the H monogram, and the Certificate of Holding.
 * All drawn in currentColor so each surface decides its own ink.
 */
import type { CSSProperties } from "react";

/** A spirograph rosette: one closed hypotrochoid, the classic note-printer's pattern. */
export function Rosette({ size = 200, petals = 24, className = "", style }: { size?: number; petals?: number; className?: string; style?: CSSProperties }) {
  const R = 46;
  const r = R / petals;
  const d = 30;
  const pts: string[] = [];
  const steps = 1400;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = 50 + ((R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t)) * 0.62;
    const y = 50 + ((R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t)) * 0.62;
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <polyline points={pts.join(" ")} fill="none" stroke="currentColor" strokeWidth="0.22" />
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.4" />
      <circle cx="50" cy="50" r="46.6" fill="none" stroke="currentColor" strokeWidth="0.2" />
    </svg>
  );
}

/** A guilloche band: interleaved sine waves, for borders and section rules. */
export function Band({ className = "", lines = 7, height = 18 }: { className?: string; lines?: number; height?: number }) {
  const paths = Array.from({ length: lines }, (_, k) => {
    const phase = (k / lines) * Math.PI * 2;
    let d = "";
    for (let x = 0; x <= 400; x += 2) {
      const y = 9 + Math.sin(x / 9 + phase) * 6 * Math.cos(x / 61);
      d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(2)} `;
    }
    return <path key={k} d={d} fill="none" stroke="currentColor" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />;
  });
  return (
    <svg className={`band ${className}`} viewBox="0 0 400 18" preserveAspectRatio="none" height={height} aria-hidden="true">
      {paths}
    </svg>
  );
}

/** The house monogram: the H inside a double ring. */
export function Monogram({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="32" cy="32" r="26.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <text x="32" y="41" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="23" fontWeight="700" fill="currentColor" letterSpacing="0">
        H
      </text>
    </svg>
  );
}

/** The Certificate of Holding the hero is built around. */
export function Certificate({ no }: { no: number }) {
  return (
    <div className="cert" role="img" aria-label="Certificate of Holding: the bearer receives the inheritance as long as the holding is never sold">
      <div className="cert__frame">
        <Rosette className="cert__rosette is-left" size={150} petals={22} />
        <Rosette className="cert__rosette is-right" size={150} petals={30} />
        <p className="cert__no tabular">No. {String(no).padStart(6, "0")}</p>
        <p className="cert__house">Heirloom</p>
        <p className="cert__kind">Certificate of Holding</p>
        <p className="cert__text">
          This certifies that the bearer of this wallet is entitled to a part of <em>the Inheritance</em>, paid in ETH to the ten largest holders, for as long as the holding is <em>never sold</em>.
        </p>
        <div className="cert__foot">
          <span className="cert__sign">
            <i>The Executors</i>
            <b>Signed on chain</b>
          </span>
          <span className="cert__seal" aria-hidden="true">
            <Monogram size={64} />
          </span>
          <span className="cert__sign">
            <i>$HEIR</i>
            <b>Robinhood Chain</b>
          </span>
        </div>
      </div>
      <span className="cert__sheen" aria-hidden="true" />
    </div>
  );
}
