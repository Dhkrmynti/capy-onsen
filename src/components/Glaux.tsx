import { forwardRef } from "react";

interface Props {
  className?: string;
  /** Draw the drachma pile under him. */
  pad?: boolean;
  title?: string;
}

const INK = "var(--gx-ink)";

/**
 * Glaux: an original little owl, keeper of the Trapeza's table. He stands the way the owl
 * does on an Athenian drachma: square to the reader, big round eyes, an olive sprig beside him.
 */
export const Glaux = forwardRef<SVGSVGElement, Props>(function Glaux({ className, pad = true, title = "Glaux the owl, perched on a pile of drachmas beside an olive sprig" }, ref) {
  return (
    <svg ref={ref} className={className} viewBox="0 0 420 430" role="img" aria-label={title} style={{ overflow: "visible" }}>
      {pad ? (
        <g stroke={INK} strokeWidth="5">
          <ellipse cx="210" cy="400" rx="190" ry="26" fill="var(--gx-coin-dark)" />
          <ellipse cx="210" cy="388" rx="182" ry="24" fill="var(--gx-coin)" />
          <ellipse cx="118" cy="372" rx="58" ry="14" fill="var(--gx-coin)" />
          <ellipse cx="304" cy="374" rx="58" ry="14" fill="var(--gx-coin)" />
          {/* an owl struck on the top coin */}
          <ellipse cx="304" cy="374" rx="24" ry="6" fill="none" strokeWidth="3" />
        </g>
      ) : null}

      {/* olive sprig, as on the coin */}
      <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
        <path d="M70 360 C 62 300 70 236 98 178" fill="none" strokeLinecap="round" />
        <path d="M84 250 C 52 240 40 214 44 196 C 66 202 84 222 84 250 Z" fill="var(--gx-olive)" />
        <path d="M80 300 C 110 290 128 266 128 248 C 104 252 84 272 80 300 Z" fill="var(--gx-olive)" />
        <path d="M94 196 C 66 176 62 150 70 134 C 90 146 100 170 94 196 Z" fill="var(--gx-olive)" />
        <path d="M74 338 C 44 330 30 306 32 288 C 54 294 72 314 74 338 Z" fill="var(--gx-olive)" />
        <circle cx="112" cy="206" r="9" fill="var(--gx-olive-dark)" />
        <circle cx="58" cy="268" r="8" fill="var(--gx-olive-dark)" />
      </g>

      {/* body */}
      <path
        d="M118 236 C 104 300 120 352 150 368 C 178 382 242 382 270 368 C 300 352 316 300 302 236 C 294 196 262 176 210 176 C 158 176 126 196 118 236 Z"
        fill="var(--gx-feather)"
        stroke={INK}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* chest, with the chevron spots of a little owl */}
      <path d="M156 250 C 150 302 168 352 210 360 C 252 352 270 302 264 250 C 248 232 172 232 156 250 Z" fill="var(--gx-chest)" />
      <g fill="none" stroke="var(--gx-feather-dark)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M180 270 l 10 9 l 10 -9" />
        <path d="M220 270 l 10 9 l 10 -9" />
        <path d="M168 298 l 10 9 l 10 -9" />
        <path d="M200 302 l 10 9 l 10 -9" />
        <path d="M232 298 l 10 9 l 10 -9" />
        <path d="M184 330 l 10 9 l 10 -9" />
        <path d="M216 330 l 10 9 l 10 -9" />
      </g>
      {/* folded wings */}
      <path d="M124 238 C 104 280 110 330 142 360 C 150 320 152 280 150 244 C 142 234 132 232 124 238 Z" fill="var(--gx-feather-dark)" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d="M296 238 C 316 280 310 330 278 360 C 270 320 268 280 270 244 C 278 234 288 232 296 238 Z" fill="var(--gx-feather-dark)" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <g fill="var(--gx-chest)">
        <circle cx="132" cy="270" r="5" />
        <circle cx="136" cy="300" r="5" />
        <circle cx="288" cy="270" r="5" />
        <circle cx="284" cy="300" r="5" />
      </g>

      {/* talons on the coins */}
      <g fill="var(--gx-beak)" stroke={INK} strokeWidth="4" strokeLinejoin="round">
        <path d="M168 366 l -8 16 l 12 -6 l 6 10 l 6 -10 l 12 6 l -8 -16 Z" />
        <path d="M232 366 l -8 16 l 12 -6 l 6 10 l 6 -10 l 12 6 l -8 -16 Z" />
      </g>

      {/* head: wide and round, with short ear tufts */}
      <path
        d="M104 150 C 100 92 146 58 210 58 C 274 58 320 92 316 150 C 314 196 272 222 210 222 C 148 222 106 196 104 150 Z"
        fill="var(--gx-feather)"
        stroke={INK}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <g fill="var(--gx-feather-dark)" stroke={INK} strokeWidth="5" strokeLinejoin="round">
        <path d="M118 96 L 106 52 L 150 78 Z" />
        <path d="M302 96 L 314 52 L 270 78 Z" />
      </g>
      {/* brow and forehead flecks */}
      <path d="M150 104 C 176 88 196 92 210 110 C 224 92 244 88 270 104" fill="none" stroke="var(--gx-chest)" strokeWidth="9" strokeLinecap="round" />
      <g fill="var(--gx-chest)">
        <circle cx="186" cy="76" r="4" />
        <circle cx="210" cy="72" r="4" />
        <circle cx="234" cy="76" r="4" />
      </g>

      {/* facial discs */}
      <g fill="var(--gx-disc)" stroke={INK} strokeWidth="4">
        <circle cx="166" cy="146" r="46" />
        <circle cx="254" cy="146" r="46" />
      </g>
      {/* eyes: amber ring, black pupil, a catchlight */}
      <g stroke={INK} strokeWidth="4">
        <circle cx="166" cy="146" r="30" fill="var(--gx-eye)" />
        <circle cx="254" cy="146" r="30" fill="var(--gx-eye)" />
      </g>
      <g fill={INK}>
        <circle cx="168" cy="148" r="16" />
        <circle cx="252" cy="148" r="16" />
      </g>
      <g fill="#ffffff">
        <circle cx="174" cy="141" r="5.5" />
        <circle cx="258" cy="141" r="5.5" />
      </g>

      {/* beak */}
      <path d="M210 162 L 196 178 L 210 204 L 224 178 Z" fill="var(--gx-beak)" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
    </svg>
  );
});

/** One drachma: the fee every trade drops on the table. */
export function Drachma({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill="var(--gx-coin)" stroke="var(--gx-ink)" strokeWidth="3" />
      <circle cx="20" cy="20" r="11" fill="none" stroke="var(--gx-coin-dark)" strokeWidth="2" />
      <circle cx="16.5" cy="18" r="3" fill="none" stroke="var(--gx-ink)" strokeWidth="1.8" />
      <circle cx="23.5" cy="18" r="3" fill="none" stroke="var(--gx-ink)" strokeWidth="1.8" />
      <path d="M20 21 l -1.6 2.4 h 3.2 Z" fill="var(--gx-ink)" />
    </svg>
  );
}
