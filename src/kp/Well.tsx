/**
 * The page is a gravity well: a faint coordinate grid behind everything that bends toward one
 * point and deepens as you scroll, like the rubber-sheet figure in every physics book.
 */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../lib/motion";

gsap.registerPlugin(ScrollTrigger);

const W = 1440;
const H = 900;
const LINES = 22;
const STEPS = 48;

export function Well() {
  const root = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = root.current;
    if (!svg) return;
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>(".well__line"));
    const cx = W * 0.68;
    const cy = H * 0.5;
    // pull every grid point toward the well's centre by a 1/r falloff; depth grows with the scroll
    const draw = (depth: number) => {
      const k = 18000 + depth * 90000;
      paths.forEach((p, i) => {
        const vertical = i >= LINES;
        const j = vertical ? i - LINES : i;
        let d = "";
        for (let s = 0; s <= STEPS; s++) {
          let x = vertical ? (j / (LINES - 1)) * W : (s / STEPS) * W;
          let y = vertical ? (s / STEPS) * H : (j / (LINES - 1)) * H;
          const dx = cx - x;
          const dy = cy - y;
          const r = Math.hypot(dx, dy) + 1;
          const pull = Math.min(0.92, k / (r * r + 9000));
          x += dx * pull;
          y += dy * pull;
          d += `${s ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        p.setAttribute("d", d);
      });
    };
    const st = { d: 0 };
    draw(0);
    if (prefersReducedMotion()) return;
    const trig = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (s) => gsap.to(st, { d: s.progress, duration: 0.6, ease: "power2.out", overwrite: true, onUpdate: () => draw(st.d) }),
    });
    return () => trig.kill();
  }, []);
  return (
    <svg className="well" ref={root} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {Array.from({ length: LINES * 2 }, (_, i) => (
        <path key={i} className="well__line" />
      ))}
    </svg>
  );
}
