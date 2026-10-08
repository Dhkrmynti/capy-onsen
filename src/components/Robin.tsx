import { forwardRef } from "react";

interface Props {
  className?: string;
  /** Draw the coin pile under him. */
  pad?: boolean;
  title?: string;
}

const INK = "var(--rb-ink)";

/**
 * Robin: an original raccoon who robs the paper hands and stashes it for the crew.
 * The bandit mask is his own fur; bowler hat, bow tie and monocle are the disguise.
 *
 * Animatable parts carry classes: .sw-pupils (look), .sw-lid (blink),
 * .sw-tongue (the grabbing arm, scaleX 0 → 1 from the shoulder), .sw-diamond (monocle glint).
 */
export const Robin = forwardRef<SVGSVGElement, Props>(function Robin({ className, pad = true, title = "Robin the raccoon, sitting on his loot" }, ref) {
  return (
    <svg ref={ref} className={className} viewBox="0 0 420 430" role="img" aria-label={title} style={{ overflow: "visible" }}>
      {pad ? (
        <g className="sw-pad" stroke={INK} strokeWidth="5">
          <ellipse cx="210" cy="400" rx="190" ry="26" fill="var(--rb-coin-dark)" />
          <ellipse cx="210" cy="388" rx="182" ry="24" fill="var(--rb-coin)" />
          <ellipse cx="120" cy="372" rx="60" ry="14" fill="var(--rb-coin)" />
          <ellipse cx="300" cy="374" rx="60" ry="14" fill="var(--rb-coin)" />
        </g>
      ) : null}

      {/* money sack */}
      <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
        <path d="M44 372 C 30 330 46 292 78 284 C 70 274 72 262 84 262 C 96 262 98 274 90 284 C 122 292 138 330 124 372 Z" fill="var(--rb-sack)" />
        <path d="M76 282 L 92 282" />
      </g>
      <text x="84" y="350" textAnchor="middle" fontFamily="var(--f-sign)" fontSize="40" fill={INK}>
        $
      </text>

      {/* ringed tail */}
      <path d="M280 330 C 360 330 400 280 392 220 C 388 190 360 180 350 200 C 345 215 360 230 352 260 C 344 290 310 300 280 300 Z" fill="var(--rb-fur)" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <g fill="var(--rb-mask)">
        <path d="M388 214 C 380 196 362 190 352 202 L 362 214 C 370 206 382 208 388 214 Z" />
        <path d="M354 262 C 362 248 364 236 360 226 L 380 230 C 382 244 378 258 368 270 Z" />
        <path d="M318 296 C 330 292 342 284 350 274 L 366 286 C 356 300 340 310 324 314 Z" />
      </g>

      {/* body, waistcoat */}
      <path d="M132 220 C 112 256 110 318 134 352 C 156 380 264 380 286 352 C 310 318 308 256 288 220 Z" fill="var(--rb-fur)" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <path d="M164 262 C 154 300 164 346 210 352 C 256 346 266 300 256 262 C 236 250 184 250 164 262 Z" fill="var(--rb-fur-light)" />
      <path d="M158 258 L 210 324 L 262 258 L 268 300 C 262 330 246 346 210 350 C 174 346 158 330 152 300 Z" fill="var(--rb-coat)" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <circle cx="210" cy="336" r="5" fill="var(--rb-brass)" />

      {/* arms and paws */}
      <g strokeLinecap="round" fill="none">
        <path d="M142 268 C 122 296 116 320 124 340" stroke={INK} strokeWidth="6" />
        <path d="M278 268 C 298 296 304 320 296 340" stroke={INK} strokeWidth="6" />
        <path d="M142 268 C 122 296 116 320 124 340" stroke="var(--rb-fur)" strokeWidth="12" />
        <path d="M278 268 C 298 296 304 320 296 340" stroke="var(--rb-fur)" strokeWidth="12" />
      </g>
      <g fill="var(--rb-mask)" stroke={INK} strokeWidth="4">
        <ellipse cx="124" cy="346" rx="20" ry="13" />
        <ellipse cx="296" cy="346" rx="20" ry="13" />
      </g>

      {/* the grabbing arm, hidden until a heist */}
      <g className="sw-tongue" style={{ transformOrigin: "280px 270px", transform: "scaleX(0)" }}>
        <path d="M280 270 L 452 160" stroke={INK} strokeWidth="20" strokeLinecap="round" />
        <path d="M280 270 L 452 160" stroke="var(--rb-fur)" strokeWidth="12" strokeLinecap="round" />
        <circle cx="462" cy="154" r="18" fill="var(--rb-mask)" stroke={INK} strokeWidth="4" />
      </g>

      {/* ears */}
      <g stroke={INK} strokeWidth="6" strokeLinejoin="round">
        <path d="M108 150 L 98 82 L 160 118 Z" fill="var(--rb-fur)" />
        <path d="M312 150 L 322 82 L 260 118 Z" fill="var(--rb-fur)" />
      </g>
      <path d="M116 132 L 110 98 L 142 118 Z" fill="var(--rb-mask)" />
      <path d="M304 132 L 310 98 L 278 118 Z" fill="var(--rb-mask)" />

      {/* head with cheek tufts */}
      <path
        d="M90 190 C 88 140 136 112 210 112 C 284 112 332 140 330 190 L 352 210 L 326 218 C 312 244 268 258 210 258 C 152 258 108 244 94 218 L 68 210 Z"
        fill="var(--rb-fur)"
        stroke={INK}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M210 118 C 200 140 200 160 210 176 C 220 160 220 140 210 118 Z" fill="var(--rb-fur-dark)" />
      {/* the bandit mask: his own fur */}
      <path
        d="M96 176 C 120 152 170 150 200 170 C 206 174 214 174 220 170 C 250 150 300 152 324 176 C 320 206 296 218 270 212 C 248 208 232 196 210 196 C 188 196 172 208 150 212 C 124 218 100 206 96 176 Z"
        fill="var(--rb-mask)"
      />
      <path d="M150 226 C 160 200 260 200 270 226 C 270 248 244 258 210 258 C 176 258 150 248 150 226 Z" fill="var(--rb-fur-light)" stroke={INK} strokeWidth="5" />
      <ellipse cx="210" cy="214" rx="15" ry="10" fill={INK} />
      <path d="M184 236 C 196 246 222 248 240 232" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M236 228 C 241 231 244 235 245 240" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />

      {/* bow tie, below the chin */}
      <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
        <path d="M210 270 L 178 256 L 178 286 Z" fill="var(--rb-tie)" />
        <path d="M210 270 L 242 256 L 242 286 Z" fill="var(--rb-tie)" />
        <circle cx="210" cy="270" r="9" fill="var(--rb-tie)" />
      </g>

      {/* eyes */}
      <g fill="#ffffff" stroke={INK} strokeWidth="4">
        <circle cx="164" cy="182" r="22" />
        <circle cx="256" cy="182" r="22" />
      </g>
      <g className="sw-pupils" fill={INK}>
        <circle cx="167" cy="184" r="11" />
        <circle cx="253" cy="184" r="11" />
        <circle cx="171" cy="179" r="4" fill="#ffffff" />
        <circle cx="257" cy="179" r="4" fill="#ffffff" />
      </g>
      <g fill="var(--rb-mask)">
        <circle className="sw-lid" cx="164" cy="182" r="23" style={{ transformOrigin: "164px 159px", transform: "scaleY(0)" }} />
        <circle className="sw-lid" cx="256" cy="182" r="23" style={{ transformOrigin: "256px 159px", transform: "scaleY(0)" }} />
      </g>

      {/* monocle */}
      <g className="sw-diamond">
        <circle cx="256" cy="182" r="29" fill="none" stroke="var(--rb-brass)" strokeWidth="7" />
        <path d="M282 196 C 300 220 300 250 286 268" fill="none" stroke="var(--rb-brass)" strokeWidth="3" strokeDasharray="5 4" />
      </g>

      {/* bowler hat */}
      <g stroke={INK} strokeWidth="6" strokeLinejoin="round">
        <path d="M146 124 C 146 70 174 46 210 46 C 246 46 274 70 274 124 Z" fill="var(--rb-hat)" />
        <ellipse cx="210" cy="126" rx="104" ry="16" fill="var(--rb-hat)" />
      </g>
      <path d="M148 110 L 272 110 L 273 122 L 147 122 Z" fill="var(--rb-brass)" />
      <path d="M172 70 C 180 58 192 52 204 52" fill="none" stroke="var(--rb-hat-shine)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
});

/** Loot: one gold coin, the creator fee in the lore. */
export function Loot({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill="var(--rb-coin)" stroke="var(--rb-ink)" strokeWidth="3" />
      <circle cx="20" cy="20" r="11" fill="none" stroke="var(--rb-coin-dark)" strokeWidth="2" />
      <text x="20" y="26" textAnchor="middle" fontFamily="var(--f-sign)" fontSize="17" fill="var(--rb-ink)">
        $
      </text>
    </svg>
  );
}
