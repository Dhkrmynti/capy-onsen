/**
 * The Hawking mascot: an original cartoon hawk in an astronaut helmet ("Hawk-ing"), in the
 * facility's safety yellow and black. Drawn flat in SVG on a 200×200 field.
 */
import { V } from "./HKTheme";

const INK = "#121212";
const line = { stroke: INK, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const STARS: [number, number, number][] = [
  [28, 40, 1.4], [170, 34, 1.1], [182, 92, 1.6], [16, 104, 1], [40, 150, 1.2], [160, 150, 1], [120, 18, 1], [70, 22, 1.2], [150, 64, 0.9], [52, 70, 0.8],
];

/** `bare` drops the round field (sky, glow, ring) to stand the hawk in a scene; `talk` (0-1) opens the beak. */
export function Mascot({ size = 1080, ring = true, bare = false, talk = 0 }: { size?: number; ring?: boolean; bare?: boolean; talk?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <defs>
        <radialGradient id="mbg" cx="0.5" cy="0.42" r="0.62">
          <stop offset="0" stopColor="#2a2205" />
          <stop offset="0.55" stopColor="#0f0e0a" />
          <stop offset="1" stopColor="#0b0b0c" />
        </radialGradient>
        <radialGradient id="mglow" r="0.5">
          <stop offset="0.5" stopColor={V.glow} stopOpacity="0" />
          <stop offset="0.62" stopColor="#ffe9a8" stopOpacity="0.85" />
          <stop offset="0.75" stopColor={V.glow} stopOpacity="0.35" />
          <stop offset="1" stopColor={V.glow} stopOpacity="0" />
        </radialGradient>
        <clipPath id="mvisor">
          <ellipse cx="100" cy="92" rx="38" ry="34" />
        </clipPath>
        <clipPath id="mcirc">
          <circle cx="100" cy="100" r="100" />
        </clipPath>
      </defs>
      <g clipPath={bare ? undefined : "url(#mcirc)"}>
        {bare ? null : (
          <>
            <rect width="200" height="200" fill="url(#mbg)" />
            {STARS.map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} fill="#fff" fillOpacity="0.8" />
            ))}
            {/* the contained black hole behind the helmet */}
            <circle cx="100" cy="90" r="86" fill="url(#mglow)" />
            <ellipse cx="100" cy="92" rx="96" ry="18" fill="none" stroke={V.glow} strokeOpacity="0.55" strokeWidth="6" transform="rotate(-10 100 92)" />
          </>
        )}

        {/* suit: shoulders, neck ring, chest unit, hazard patch */}
        <path d="M18 206 C 20 172, 44 152, 72 146 L 128 146 C 156 152, 180 172, 182 206 Z" fill={V.paper} {...line} />
        <path d="M46 172 C 42 182, 40 192, 40 206 M154 172 C 158 182, 160 192, 160 206" fill="none" stroke={INK} strokeOpacity="0.22" strokeWidth="3" />
        <rect x="84" y="160" width="32" height="22" rx="3" fill="#3a3e44" {...line} strokeWidth={3} />
        <circle cx="92" cy="171" r="3.4" fill={V.red} />
        <circle cx="101" cy="171" r="3.4" fill={V.orange} />
        <rect x="107" y="167.5" width="6" height="7" fill="#9cc3f0" />
        <clipPath id="mpatch">
          <rect x="48" y="164" width="22" height="22" />
        </clipPath>
        <g clipPath="url(#mpatch)">
          <rect x="48" y="164" width="22" height="22" fill={V.orange} />
          {[0, 9, 18, 27].map((o) => (
            <path key={o} d={`M${40 + o} 186 L ${52 + o} 164`} stroke={INK} strokeWidth="4.5" />
          ))}
        </g>
        <rect x="48" y="164" width="22" height="22" fill="none" {...line} strokeWidth={3} />
        <path d="M134 168 L 150 168 L 150 178 L 134 178 Z" fill={V.red} {...line} strokeWidth={3} />
        <path d="M60 146 C 74 158, 126 158, 140 146 L 136 136 C 122 146, 78 146, 64 136 Z" fill="#a3a6ab" {...line} strokeWidth={3.5} />

        {/* antenna */}
        <path d="M134 50 L 142 36" {...line} fill="none" />
        <circle cx="143" cy="34" r="5" fill={V.red} {...line} strokeWidth={3} />

        {/* helmet */}
        <circle cx="100" cy="90" r="54" fill={V.paper} {...line} />
        <path d="M58 64 C 64 52, 76 42, 90 38" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        <circle cx="47" cy="96" r="8" fill="#a3a6ab" {...line} strokeWidth={3.5} />
        <circle cx="153" cy="96" r="8" fill="#a3a6ab" {...line} strokeWidth={3.5} />
        {/* a strip of hazard tape across the brow of the helmet */}
        <clipPath id="mtape">
          <path d="M60 58 C 78 46, 122 46, 140 58 L 136 66 C 120 56, 80 56, 64 66 Z" />
        </clipPath>
        <g clipPath="url(#mtape)">
          <rect x="56" y="40" width="90" height="30" fill={V.orange} />
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d={`M${50 + i * 8} 72 L ${62 + i * 8} 42`} stroke={INK} strokeWidth="3.6" />
          ))}
        </g>
        <path d="M60 58 C 78 46, 122 46, 140 58 L 136 66 C 120 56, 80 56, 64 66 Z" fill="none" {...line} strokeWidth={3} />

        {/* visor and the hawk behind it */}
        <ellipse cx="100" cy="92" rx="38" ry="34" fill="#1f2a38" />
        <g clipPath="url(#mvisor)">
          {/* head feathers */}
          <path d="M58 132 C 54 96, 66 64, 100 62 C 134 64, 146 96, 142 132 Z" fill="#7a4a22" />
          <path d="M70 70 L 76 60 L 82 70 M88 64 L 94 54 L 100 64" fill="#5a3518" stroke="#5a3518" strokeWidth="2" />
          {/* pale face patch and the dark malar stripes */}
          <path d="M70 82 C 72 74, 84 70, 100 72 C 116 70, 128 74, 130 82 C 132 98, 122 116, 100 120 C 78 116, 68 98, 70 82 Z" fill="#f2e2c0" />
          <path d="M74 92 C 72 102, 76 110, 82 114 L 84 104 Z" fill="#5a3518" />
          <path d="M126 92 C 128 102, 124 110, 118 114 L 116 104 Z" fill="#5a3518" />
          {/* eyes: yellow ring, dark iris, a glint */}
          <circle cx="86" cy="88" r="9.5" fill={V.orange} stroke={INK} strokeWidth="2.6" />
          <circle cx="114" cy="88" r="9.5" fill={V.orange} stroke={INK} strokeWidth="2.6" />
          <circle cx="87" cy="89" r="5.6" fill={INK} />
          <circle cx="113" cy="89" r="5.6" fill={INK} />
          <circle cx="89" cy="86.5" r="1.9" fill="#fff" />
          <circle cx="115" cy="86.5" r="1.9" fill="#fff" />
          {/* stern brows: a hawk never looks friendly */}
          <path d="M74 78 L 96 82 L 95 77 L 76 73 Z" fill="#3d2410" stroke={INK} strokeWidth="1.6" />
          <path d="M126 78 L 104 82 L 105 77 L 124 73 Z" fill="#3d2410" stroke={INK} strokeWidth="1.6" />
          {/* an open mouth under the beak while it talks */}
          {talk > 0.05 ? <ellipse cx="100" cy={110 + talk * 3} rx={5 + talk * 3} ry={talk * 6} fill="#3a1408" stroke={INK} strokeWidth="1.6" /> : null}
          {/* the hooked beak */}
          <path d="M92 96 C 94 92, 106 92, 108 96 C 110 102, 106 110, 100 118 C 99 112, 96 106, 92 100 Z" fill={V.orange} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M100 118 C 99 114, 98 111, 96.5 108.5" fill="none" stroke={INK} strokeWidth="2" />
          <path d="M100 118 C 102 114, 104 112, 106 106 L 103 112 Z" fill="#3a3e44" />
          <circle cx="96" cy="96.5" r="1.2" fill={INK} />
          <circle cx="104" cy="96.5" r="1.2" fill={INK} />
          {/* glass: a tint and a highlight */}
          <ellipse cx="100" cy="92" rx="38" ry="34" fill="#9cc3f0" fillOpacity="0.1" />
          <path d="M70 76 C 74 66, 84 61, 94 60" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round" />
          <circle cx="126" cy="70" r="2.6" fill="#fff" fillOpacity="0.6" />
        </g>
        <ellipse cx="100" cy="92" rx="38" ry="34" fill="none" {...line} />

        {/* the containment ring, inside X's round crop */}
        {ring && !bare ? (
          <>
            <circle cx="100" cy="100" r="93" fill="none" stroke={INK} strokeWidth="9" />
            <circle cx="100" cy="100" r="93" fill="none" stroke={V.orange} strokeWidth="9" strokeDasharray="7.3 7.3" />
          </>
        ) : null}
      </g>
    </svg>
  );
}
