/**
 * The International Code of Signals, as far as Plunders flies it: letter flags for the sections,
 * numeral pennants for the ranks, a black swallowtail for the Captain. One geometry, drawn twice:
 * as SVG on the page and on canvas for the bunting on the 3D ship.
 */
export const SIG = { R: "#d7263d", Y: "#f9c80e", B: "#1b4dbf", K: "#16181d", W: "#f8f4ea" } as const;
type C = keyof typeof SIG;

export type FlagShape = "rect" | "swallow" | "pennant";
type Part = { c: C; p: [number, number][] } | { c: C; disc: [number, number, number] };
export type FlagDef = { shape: FlagShape; ratio: number; parts: Part[] };

const box = (x0: number, y0: number, x1: number, y1: number): [number, number][] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];
const fill = (c: C): Part => ({ c, p: box(0, 0, 1, 1) });
const rect = (...parts: Part[]): FlagDef => ({ shape: "rect", ratio: 1.5, parts });
const pennant = (...parts: Part[]): FlagDef => ({ shape: "pennant", ratio: 2.2, parts });

export const FLAGS = {
  // letters
  B: { shape: "swallow", ratio: 1.5, parts: [fill("R")] },
  C: rect(...(["B", "W", "R", "W", "B"] as C[]).map((c, i) => ({ c, p: box(0, i / 5, 1, (i + 1) / 5) }))),
  F: rect(fill("W"), { c: "R", p: [[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]] }),
  K: rect({ c: "Y", p: box(0, 0, 0.5, 1) }, { c: "B", p: box(0.5, 0, 1, 1) }),
  L: rect({ c: "Y", p: box(0, 0, 0.5, 0.5) }, { c: "K", p: box(0.5, 0, 1, 0.5) }, { c: "K", p: box(0, 0.5, 0.5, 1) }, { c: "Y", p: box(0.5, 0.5, 1, 1) }),
  O: rect({ c: "Y", p: [[0, 0], [0, 1], [1, 1]] }, { c: "R", p: [[0, 0], [1, 0], [1, 1]] }),
  P: rect(fill("B"), { c: "W", p: box(0.36, 0.3, 0.64, 0.7) }),
  S: rect(fill("W"), { c: "B", p: box(0.36, 0.3, 0.64, 0.7) }),
  T: rect({ c: "R", p: box(0, 0, 1 / 3, 1) }, { c: "W", p: box(1 / 3, 0, 2 / 3, 1) }, { c: "B", p: box(2 / 3, 0, 1, 1) }),
  // numeral pennants
  "1": pennant(fill("W"), { c: "R", disc: [0.26, 0.5, 0.2] }),
  "2": pennant(fill("B"), { c: "W", disc: [0.26, 0.5, 0.2] }),
  "3": pennant({ c: "R", p: box(0, 0, 0.3, 1) }, { c: "W", p: box(0.3, 0, 0.6, 1) }, { c: "B", p: box(0.6, 0, 1, 1) }),
  "4": pennant(fill("R"), { c: "W", p: box(0.2, 0, 0.32, 1) }, { c: "W", p: box(0, 0.4, 1, 0.6) }),
  "5": pennant({ c: "Y", p: box(0, 0, 0.42, 1) }, { c: "B", p: box(0.42, 0, 1, 1) }),
  "6": pennant({ c: "K", p: box(0, 0, 1, 0.5) }, { c: "W", p: box(0, 0.5, 1, 1) }),
  "7": pennant({ c: "Y", p: box(0, 0, 1, 0.5) }, { c: "R", p: box(0, 0.5, 1, 1) }),
  "8": pennant(fill("W"), { c: "R", p: box(0.2, 0, 0.32, 1) }, { c: "R", p: box(0, 0.4, 1, 0.6) }),
  "9": pennant({ c: "W", p: box(0, 0, 0.36, 0.5) }, { c: "K", p: box(0.36, 0, 1, 0.5) }, { c: "R", p: box(0, 0.5, 0.36, 1) }, { c: "Y", p: box(0.36, 0.5, 1, 1) }),
  "0": pennant({ c: "Y", p: box(0, 0, 0.3, 1) }, { c: "R", p: box(0.3, 0, 0.6, 1) }, { c: "Y", p: box(0.6, 0, 1, 1) }),
  // the Captain: the black swallowtail
  J: { shape: "swallow", ratio: 1.5, parts: [fill("K")] },
} satisfies Record<string, FlagDef>;
export type FlagCode = keyof typeof FLAGS;

/** The outline of a flag in its own 0..1 box. */
export function outline(shape: FlagShape): [number, number][] {
  if (shape === "swallow") return [[0, 0], [1, 0], [0.74, 0.5], [1, 1], [0, 1]];
  if (shape === "pennant") return [[0, 0], [1, 0.4], [1, 0.6], [0, 1]];
  return box(0, 0, 1, 1);
}

/** The numeral pennant for a rank: 1-9 fly their own digit, 10 flies the zero. */
export const pennantFor = (rank: number) => String(rank % 10) as FlagCode;

/** Bunting order for the ship: a run that never repeats a neighbour. */
export const BUNTING: FlagCode[] = ["L", "1", "O", "C", "O", "2", "T", "P", "3", "K", "5", "F", "7", "S", "B", "0", "9", "4", "6", "8"];

/** Draw a flag on a 2D canvas at x,y with width w (height from its ratio). */
export function drawFlag(g: CanvasRenderingContext2D, code: FlagCode, x: number, y: number, w: number) {
  const f: FlagDef = FLAGS[code];
  const h = w / f.ratio;
  const at = ([u, v]: [number, number]) => [x + u * w, y + v * h] as const;
  g.save();
  g.beginPath();
  outline(f.shape).forEach((pt, i) => (i ? g.lineTo(...at(pt)) : g.moveTo(...at(pt))));
  g.closePath();
  g.clip();
  for (const part of f.parts) {
    g.fillStyle = SIG[part.c];
    g.beginPath();
    if ("disc" in part) {
      const [u, v, r] = part.disc;
      g.arc(x + u * w, y + v * h, r * h, 0, Math.PI * 2);
    } else part.p.forEach((pt, i) => (i ? g.lineTo(...at(pt)) : g.moveTo(...at(pt))));
    g.fill();
  }
  g.restore();
  g.strokeStyle = SIG.K;
  g.lineWidth = Math.max(2, w * 0.03);
  g.beginPath();
  outline(f.shape).forEach((pt, i) => (i ? g.lineTo(...at(pt)) : g.moveTo(...at(pt))));
  g.closePath();
  g.stroke();
  return h;
}
