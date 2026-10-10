/** The escrow as a figure: a hairline dial, the filled arc in accretion orange. */
import { V, VF } from "./HZTheme";

export function Gauge({ fill, target, size = 420, label = "ESCROW" }: { fill: number; target: number; size?: number; label?: string }) {
  const k = Math.min(1, Math.max(0, fill));
  const ticks = Array.from({ length: 25 }, (_, i) => -120 + i * 10);
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} viewBox="-110 -110 220 220">
        <circle r={100} fill="none" stroke={V.paper} strokeOpacity={0.22} strokeWidth={0.8} />
        <path d={arc(84, -120, 120)} fill="none" stroke={V.paper} strokeOpacity={0.18} strokeWidth={6} />
        {k > 0.002 ? <path d={arc(84, -120, -120 + 240 * k)} fill="none" stroke={V.orange} strokeWidth={6} /> : null}
        {ticks.map((t, i) => {
          const r = (t - 90) * (Math.PI / 180);
          const long = i % 6 === 0;
          return <line key={t} x1={Math.cos(r) * 96} y1={Math.sin(r) * 96} x2={Math.cos(r) * (long ? 90 : 93)} y2={Math.sin(r) * (long ? 90 : 93)} stroke={V.paper} strokeOpacity={0.6} strokeWidth={long ? 1.2 : 0.6} />;
        })}
        <circle r={30} fill="#000" stroke="#fff1dc" strokeWidth={1.2} />
        <text y={52} textAnchor="middle" fontFamily={VF.mono} fontSize={10} letterSpacing={2.4} fill={V.muted}>
          {label}
        </text>
        <text y={70} textAnchor="middle" fontFamily={VF.mono} fontSize={13} fill={V.paper}>
          {(k * target).toFixed(target < 0.02 ? 4 : 3)} / {target} ETH
        </text>
        <g transform={`rotate(${-120 + 240 * k})`}>
          <line x1={0} y1={-34} x2={0} y2={-80} stroke={V.orange} strokeWidth={1.6} />
          <circle cy={-84} r={3.2} fill={V.orange} />
        </g>
      </svg>
    </div>
  );
}

function arc(r: number, a0: number, a1: number) {
  const p = (a: number) => [Math.cos(((a - 90) * Math.PI) / 180) * r, Math.sin(((a - 90) * Math.PI) / 180) * r];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}
