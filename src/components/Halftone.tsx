import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Notes } from "./Notes";
import { prefersReducedMotion } from "../lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Props {
  className?: string;
  /** Alt text for the photograph. */
  label: string;
  /** "load" resolves once on mount (above the fold); "scroll" resolves as the photo crosses the viewport. */
  develop?: "load" | "scroll";
  /** Draw the coin pile beside the notes. */
  pad?: boolean;
}

const COARSE = 18;
const FINE = 3.2;
/** How much of the clean line art shows through once developed: the dots stay the photograph. */
const PLATE_MIX = 0.16;

/** True when a CSS hex colour is a light ink (night final). */
function isLight(hex: string) {
  const m = hex.replace("#", "");
  const n = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5;
}

/**
 * A press photograph of the notes, printed as a halftone. The screen starts coarse and
 * tightens to a fine screen as the story arrives; the printed dots are the resting state.
 * The dots are computed from the notes' own SVG, so the "photo" is always the real mascot.
 */
export function Halftone({ className = "", label, develop = "scroll", pad = true }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const lum = useRef<{ dark: Float32Array; light: Float32Array; w: number; h: number } | null>(null);
  const state = useRef({ cell: COARSE, sharp: 0 });

  const draw = () => {
    const c = canvas.current;
    const src = lum.current;
    if (!c || !src) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--ink").trim() || "#161514";
    // Night final prints light ink on black stock: the dots must then carry the image's light, not its dark.
    const map = isLight(ink) ? src.light : src.dark;
    const { width: W, height: H } = c;
    const scale = W / src.w;
    const cell = state.current.cell * (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = ink;
    // Classic 45-degree screen: offset every other row by half a cell.
    let row = 0;
    for (let y = cell / 2; y < H; y += cell * 0.87, row++) {
      const shift = row % 2 ? cell / 2 : 0;
      for (let x = cell / 2 + shift; x < W; x += cell) {
        const sx = Math.min(src.w - 1, Math.floor(x / scale));
        const sy = Math.min(src.h - 1, Math.floor(y / scale));
        const tone = map[sy * src.w + sx];
        if (tone < 0.04) continue;
        const r = (cell / 2) * Math.sqrt(tone) * 1.08;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (art.current) art.current.style.opacity = String(state.current.sharp * PLATE_MIX);
  };

  // Rasterise the notes' SVG once into a darkness map, resolving the CSS colour tokens first.
  useEffect(() => {
    const host = art.current?.querySelector("svg");
    const c = canvas.current;
    if (!host || !c) return;
    const css = getComputedStyle(document.documentElement);
    const markup = new XMLSerializer()
      .serializeToString(host)
      .replace(/var\((--[a-z0-9-]+)\)/gi, (_, name) => css.getPropertyValue(name).trim() || "#000");
    const img = new Image();
    // React already writes the SVG namespace; add it only if missing, and give the image a real size.
    const sized = markup
      .replace(/^<svg(?![^>]*xmlns=)/, '<svg xmlns="http://www.w3.org/2000/svg"')
      .replace(/^<svg/, '<svg width="420" height="430"');
    const url = URL.createObjectURL(new Blob([sized], { type: "image/svg+xml" }));
    img.onload = () => {
      const w = 210;
      const h = Math.round((w * 430) / 420);
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      octx.drawImage(img, 0, 0, w, h);
      const px = octx.getImageData(0, 0, w, h).data;
      const dark = new Float32Array(w * h);
      const light = new Float32Array(w * h);
      for (let i = 0; i < w * h; i++) {
        const a = px[i * 4 + 3] / 255;
        const l = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
        dark[i] = a * (1 - l) * 0.94 + a * 0.06;
        light[i] = a * l * 0.94 + a * 0.06;
      }
      lum.current = { dark, light, w, h };
      URL.revokeObjectURL(url);
      const box = c.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      c.width = Math.round(box.width * dpr);
      c.height = Math.round(box.height * dpr);
      if (prefersReducedMotion()) state.current = { cell: FINE, sharp: 1 };
      draw();
      ScrollTrigger.refresh();
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const s = state.current;
      if (develop === "load") {
        gsap
          .timeline({ delay: 0.35 })
          .to(s, { cell: FINE, duration: 1.6, ease: "power3.out", onUpdate: draw })
          .to(s, { sharp: 1, duration: 0.6, ease: "power2.out", onUpdate: draw }, "-=0.35");
        return;
      }
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top 85%", end: "center 50%", scrub: 0.6 } })
        .to(s, { cell: FINE, ease: "none", duration: 1, onUpdate: draw })
        .to(s, { sharp: 1, ease: "none", duration: 0.35, onUpdate: draw });
    },
    { scope: root },
  );

  return (
    <div className={`halftone ${className}`} ref={root} role="img" aria-label={label}>
      <canvas ref={canvas} className="halftone__screen" aria-hidden="true" />
      <div ref={art} className="halftone__plate" aria-hidden="true" style={{ opacity: 0 }}>
        <Notes pad={pad} />
      </div>
    </div>
  );
}
