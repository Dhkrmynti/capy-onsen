import { H, HF } from "./KPCompat";

export function Gauge({ fill, target, size = 420, label = "ESCROW" }: { fill: number; target: number; size?: number; label?: string }) {
  const a = -120 + Math.min(1, fill) * 240;
  const ticks = Array.from({ length: 25 }, (_, i) => -120 + i * 10);
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} viewBox="-110 -110 220 220">
        <defs>
          <radialGradient id="gface" cx="45%" cy="40%" r="70%">
            <stop offset="0" stopColor="#f3ecd8" />
            <stop offset="1" stopColor="#cfc4a6" />
          </radialGradient>
          <linearGradient id="gbezel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f1d58e" />
            <stop offset="0.5" stopColor="#9c7428" />
            <stop offset="1" stopColor="#e2bd6c" />
          </linearGradient>
        </defs>
        <circle r={104} fill="url(#gbezel)" />
        <circle r={94} fill="url(#gface)" />
        <path d={arc(78, -120, -120 + 240 * Math.min(1, fill))} fill="none" stroke={H.wax} strokeWidth={8} strokeLinecap="round" />
        {ticks.map((t, i) => {
          const r = (t - 90) * (Math.PI / 180);
          const long = i % 6 === 0;
          return <line key={t} x1={Math.cos(r) * 88} y1={Math.sin(r) * 88} x2={Math.cos(r) * (long ? 72 : 80)} y2={Math.sin(r) * (long ? 72 : 80)} stroke={H.ink} strokeWidth={long ? 2.4 : 1.1} />;
        })}
        <text y={40} textAnchor="middle" fontFamily={HF.caps} fontWeight={700} fontSize={14} letterSpacing={2} fill={H.ink}>{label}</text>
        <text y={60} textAnchor="middle" fontFamily={HF.data} fontWeight={600} fontSize={15} fill={H.ink2}>{(Math.min(1, fill) * target).toFixed(target < 0.02 ? 4 : 3)} / {target} ETH</text>
        <g transform={`rotate(${a})`}>
          <path d="M -3 10 L 0 -84 L 3 10 Z" fill={H.wax} />
        </g>
        <circle r={9} fill="#3a2a0e" />
        <circle r={4} fill="#d9b25e" />
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
