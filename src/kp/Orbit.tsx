/**
 * The trajectory: one long orbit arc across the whole page, drawn as you scroll, with the rocket
 * riding its head. It is the page's single governing curve; every section sits somewhere on it.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const D = "M -80 820 C 260 560, 520 120, 900 80 S 1500 380, 1540 -60";

export function Orbit() {
  const root = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      const path = root.current?.querySelector<SVGPathElement>(".orbit__path");
      const ship = root.current?.querySelector<SVGGElement>(".orbit__ship");
      if (!path || !ship) return;
      const len = path.getTotalLength();
      const place = (p: number) => {
        const at = path.getPointAtLength(p * len);
        const ahead = path.getPointAtLength(Math.min(len, p * len + 2));
        const deg = (Math.atan2(ahead.y - at.y, ahead.x - at.x) * 180) / Math.PI;
        ship.setAttribute("transform", `translate(${at.x} ${at.y}) rotate(${deg + 90})`);
        path.style.strokeDashoffset = String(len * (1 - p));
      };
      path.style.strokeDasharray = String(len);
      if (prefersReducedMotion()) return place(1);
      place(0.04);
      const st = { p: 0.04 };
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (s) => gsap.to(st, { p: 0.04 + s.progress * 0.96, duration: 0.5, ease: "power2.out", overwrite: true, onUpdate: () => place(st.p) }),
      });
    },
    { scope: root },
  );
  return (
    <svg className="orbit" ref={root} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path className="orbit__ghost" d={D} />
      <path className="orbit__path" d={D} />
      <g className="orbit__ship">
        <path d="M0 -22 C 7 -15, 8 -6, 7 8 H -7 C -8 -6, -7 -15, 0 -22 Z" />
        <path d="M-7 2 L -13 12 L -7 11 Z M7 2 L 13 12 L 7 11 Z" />
        <path className="orbit__flame" d="M-4 9 L 0 20 L 4 9 Z" />
      </g>
    </svg>
  );
}
