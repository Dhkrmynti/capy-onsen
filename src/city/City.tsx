/**
 * Prototype: a small open town the holders walk around in, third person. You are one holder;
 * the rest are bots. WASD to move, Shift to run, Space to jump, F to get in or out of a car,
 * drag to look, Enter to chat. Leave the keys alone and an agent takes your character over
 * (the tag above the head flips from HUMAN to AI) until you touch a key again.
 *
 * Rank shows on the character: No. 1 wears the crown, No. 2 to 10 a gold chain, all ten a TOP
 * tag. Only No. 1 can open a speech on the park stage; while it is live No. 1 speaks from the
 * lectern and No. 2 to 5 from the assistants' table, and what they say goes up on the screen.
 * If No. 1 never opens one, there is no event. Everything here is local demo data: no server,
 * no wallets, no real chat yet.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Sky } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, Vignette } from "@react-three/postprocessing";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Critter, hash, type CritterParts, type Kind, type Outfit } from "./Critter";

/* ───────── the map: a 5 × 5 grid of blocks on an island, a park in the middle ───────── */

const N = 5;
const BLOCK = 24;
const ROAD = 12;
const PITCH = BLOCK + ROAD;
const HALF = (N * BLOCK + (N + 1) * ROAD) / 2; // 96
const WALK = 3; // pavement width inside each block
const roadAt = (i: number) => -HALF + ROAD / 2 + i * PITCH; // centre line of road i (0..N)
const blockAt = (i: number) => -HALF + ROAD + i * PITCH; // near edge of block i (0..N-1)
const SUN: [number, number, number] = [30, 48, 22];

const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

type Box = { x0: number; x1: number; z0: number; z1: number; h: number; tint: string; glass: boolean; shop: string };
const BUILDINGS: Box[] = (() => {
  const r = rng(7);
  const tints = ["#d8c9ae", "#c2c8d2", "#c9aa9c", "#b3bfae", "#d9d6cf", "#a8b2c2", "#c9b592", "#b9a5a5", "#e3ddd0"];
  const shops = ["#b3261e", "#1f5fae", "#1c7c4a", "#c98a12", "#5b3a8a", "#22303f"];
  const out: Box[] = [];
  for (let bx = 0; bx < N; bx++)
    for (let bz = 0; bz < N; bz++) {
      if (bx === 2 && bz === 2) continue; // the park
      const x = blockAt(bx) + WALK;
      const z = blockAt(bz) + WALK;
      const size = BLOCK - WALK * 2;
      const cut = r();
      const g = 0.5;
      const half = size / 2 - g;
      const lots: [number, number, number, number][] = cut < 0.3 ? [[0, 0, size, size]] : cut < 0.65 ? [[0, 0, half, size], [size / 2 + g, 0, half, size]] : [[0, 0, half, half], [size / 2 + g, 0, half, half], [0, size / 2 + g, half, half], [size / 2 + g, size / 2 + g, half, half]];
      const centre = 1 - (Math.abs(bx - 2) + Math.abs(bz - 2)) / 4;
      lots.forEach(([lx, lz, w, d]) => {
        const h = Math.round((7 + r() * 9 + centre * r() * 30) / 3.2) * 3.2 + 3.6;
        out.push({ x0: x + lx, x1: x + lx + w, z0: z + lz, z1: z + lz + d, h, tint: tints[Math.floor(r() * tints.length)], glass: h > 26 && r() < 0.7, shop: shops[Math.floor(r() * shops.length)] });
      });
    }
  return out;
})();

/* the stage on the north side of the park (the park is centred on the origin) */
const STAGE = { x0: -6, x1: 6, z0: -9.4, z1: -4, h: 0.6 };
const LECTERN = { x: 0, z: -5.9 };
const SEATS = [-4.4, -2.4, 2.4, 4.4].map((x) => ({ x, z: -6.4 })); // No. 2, 3, 4, 5
const CROWD = Array.from({ length: 32 }, (_, i) => ({ x: -7 + (i % 8) * 2 + (Math.floor(i / 8) % 2) * 0.8, z: 1.5 + Math.floor(i / 8) * 1.8 }));
const floorAt = (x: number, z: number) => (x > STAGE.x0 && x < STAGE.x1 && z > STAGE.z0 && z < STAGE.z1 ? STAGE.h : 0);

/** Pavement corners: where the bots (and your agent) walk. Corner = road crossing (ix, iz) and which side of each road. */
type Corner = { ix: number; iz: number; sx: 1 | -1; sz: 1 | -1 };
const cornerPos = (c: Corner) => ({ x: roadAt(c.ix) + c.sx * (ROAD / 2 + WALK / 2), z: roadAt(c.iz) + c.sz * (ROAD / 2 + WALK / 2) });
const validCorner = (c: Corner) => c.ix >= 0 && c.ix <= N && c.iz >= 0 && c.iz <= N && (c.ix > 0 || c.sx === 1) && (c.ix < N || c.sx === -1) && (c.iz > 0 || c.sz === 1) && (c.iz < N || c.sz === -1);
/** The corners one straight pavement walk (or one zebra crossing) away. */
function nextCorners(c: Corner): Corner[] {
  const alongX: Corner = c.sx === 1 ? { ...c, ix: c.ix + 1, sx: -1 } : { ...c, ix: c.ix - 1, sx: 1 };
  const alongZ: Corner = c.sz === 1 ? { ...c, iz: c.iz + 1, sz: -1 } : { ...c, iz: c.iz - 1, sz: 1 };
  return [alongX, alongZ, { ...c, sx: -c.sx as 1 | -1 }, { ...c, sz: -c.sz as 1 | -1 }].filter(validCorner);
}
const CORNERS: Corner[] = (() => {
  const out: Corner[] = [];
  for (let ix = 0; ix <= N; ix++) for (let iz = 0; iz <= N; iz++) for (const sx of [1, -1] as const) for (const sz of [1, -1] as const) if (validCorner({ ix, iz, sx, sz })) out.push({ ix, iz, sx, sz });
  return out;
})();
function nearestCorner(x: number, z: number): Corner {
  let best = CORNERS[0];
  let bd = Infinity;
  for (const c of CORNERS) {
    const p = cornerPos(c);
    const d = (p.x - x) ** 2 + (p.z - z) ** 2;
    if (d < bd) (bd = d), (best = c);
  }
  return best;
}

/** Push a circle out of every building it overlaps. Returns true if it touched one. */
function collide(o: { x: number; z: number }, rad: number) {
  let hit = false;
  for (const b of BUILDINGS) {
    const cx = Math.max(b.x0, Math.min(o.x, b.x1));
    const cz = Math.max(b.z0, Math.min(o.z, b.z1));
    const dx = o.x - cx;
    const dz = o.z - cz;
    const d2 = dx * dx + dz * dz;
    if (d2 >= rad * rad) continue;
    hit = true;
    if (d2 > 1e-6) {
      const d = Math.sqrt(d2);
      o.x = cx + (dx / d) * rad;
      o.z = cz + (dz / d) * rad;
    } else {
      // centre is inside the box: leave by the nearest wall
      const l = o.x - b.x0, r = b.x1 - o.x, n = o.z - b.z0, f = b.z1 - o.z;
      const m = Math.min(l, r, n, f);
      if (m === l) o.x = b.x0 - rad;
      else if (m === r) o.x = b.x1 + rad;
      else if (m === n) o.z = b.z0 - rad;
      else o.z = b.z1 + rad;
    }
  }
  const lim = HALF - 1;
  if (Math.abs(o.x) > lim) (o.x = Math.sign(o.x) * lim), (hit = true);
  if (Math.abs(o.z) > lim) (o.z = Math.sign(o.z) * lim), (hit = true);
  return hit;
}

/* ───────── the cast ───────── */

type Goal = { x: number; z: number; face: number } | null;
export type Actor = {
  id: string;
  name: string;
  kind: Kind;
  outfit: Outfit;
  color: string | undefined;
  balance: number;
  rank: number; // 1-based among everyone in town
  you: boolean;
  ai: boolean; // an agent is driving this character right now
  x: number;
  y: number;
  z: number;
  vy: number;
  rot: number;
  speed: number;
  phase: number;
  corner: Corner;
  wait: number;
  goal: Goal; // a place to be during the speech
  say: string;
  sayUntil: number;
  next: number; // when this bot may speak again during the speech
  car: number; // index of the car being driven, -1 on foot
  down: number; // seconds left lying knocked over
};
type Car = { x: number; z: number; rot: number; speed: number; color: string; driver: string | null };

const NAMES = ["carrotking", "0x1a2b…3c4d", "@thumper", "apezilla", "0x5e6f…7a8b", "snapjaw", "0x9c0d…1e2f", "@lettuce", "bananaman", "0x3a4b…5c6d", "gatorade", "hopium", "0x7e8f…9a0b", "@clover", "kongfu", "swampfren", "0xab12…cd34", "burrow", "@chomp", "silverback", "0xfe98…dc76", "bigears", "mudlord", "@vine"];
const KINDS: Kind[] = ["rabbit", "ape", "croc"];
const LINES = ["gm", "wen top 10?", "holding since block one", "who sold?", "nice hoodie ser", "scoop scoop", "touch grass", "lfg", "never selling", "this town is small", "beep beep", "gm gm"];
const REPLIES = ["gm ser", "lol", "based", "wagmi", "say less", "true", "no way", "who are you again?"];
const SPEECH = ["Holders, thank you for coming.", "I hold the most, so today I hold the microphone.", "The rule is simple: the ten biggest share every reward.", "Sell once and you are off the board for good.", "My assistants will take it from here.", "That is all. Go touch grass."];
const ASSIST = ["Well said, boss.", "The numbers agree.", "Next reward is charging.", "Questions go to the chat.", "Seconded."];
const CHEERS = ["👏", "lfg", "speech!", "👑", "louder!"];

function rerank(list: Actor[]) {
  [...list].sort((a, b) => b.balance - a.balance).forEach((a, i) => (a.rank = i + 1));
  // bots dress for their rank; you choose your own, and lose an outfit you no longer rank for
  list.forEach((a) => {
    if (!a.you) a.outfit = a.rank === 1 ? "cape" : a.rank <= 10 && hash(a.id) % 2 ? "suit" : "hoodie";
    else if ((a.outfit === "cape" && a.rank > 1) || (a.outfit === "suit" && a.rank > 10)) a.outfit = "hoodie";
  });
}
function makeCast(): Actor[] {
  const r = rng(99);
  const list: Actor[] = [{ id: "you", name: "you", you: true }, ...NAMES.map((name, i) => ({ id: `b${i}`, name, you: false }))].map((a, i) => {
    const c: Corner = a.you ? { ix: 2, iz: 3, sx: 1, sz: -1 } : CORNERS[Math.floor(r() * CORNERS.length)];
    const p = cornerPos(c);
    return { ...a, kind: a.you ? "rabbit" : KINDS[(hash(a.id) >>> 3) % 3], outfit: "hoodie", color: undefined, balance: a.you ? 1_450_000 : Math.round(9_400_000 * Math.pow(0.84, i) + r() * 40_000), rank: 0, ai: !a.you, x: p.x + (a.you ? 0 : (r() - 0.5) * 1.6), y: 0, z: p.z + (a.you ? 0 : (r() - 0.5) * 1.6), vy: 0, rot: r() * 6, speed: 0, phase: r() * 6, corner: c, wait: r() * 4, goal: null, say: "", sayUntil: 0, next: 0, car: -1, down: 0 };
  });
  rerank(list);
  return list;
}
const makeCars = (): Car[] =>
  [[2, 3, "#b3151b"], [1, 1, "#1b4fa8"], [3, 2, "#d98a0a"], [4, 4, "#16181c"], [0, 2, "#1c7c4a"], [3, 0, "#e9e9e4"]].map(([ix, iz, color], i) => ({ x: roadAt(ix as number) + (i % 2 ? -3.6 : 3.6), z: roadAt(iz as number) - 10 - i * 2, rot: i % 2 ? Math.PI : 0, speed: 0, color: color as string, driver: null }));

/* ───────── textures ───────── */

function tex(c: HTMLCanvasElement, repeat = false) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function groundTex() {
  const S = 4096;
  const k = S / (HALF * 2);
  const [c, g] = canvas(S, S);
  const R = (x: number, z: number, w: number, d: number) => g.fillRect((x + HALF) * k, (z + HALF) * k, w * k, d * k);
  g.fillStyle = "#34373c";
  g.fillRect(0, 0, S, S);
  const r = rng(3);
  for (let i = 0; i < 60000; i++) {
    g.fillStyle = i % 2 ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.09)";
    g.fillRect(r() * S, r() * S, 1 + r() * 2, 1 + r() * 2);
  }
  // worn patches
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(0,0,0,${0.03 + r() * 0.05})`;
    g.fillRect(r() * S, r() * S, 20 + r() * 160, 20 + r() * 160);
  }
  for (let i = 0; i <= N; i++) {
    const c0 = roadAt(i);
    for (let j = 0; j < N; j++) {
      const a = blockAt(j);
      // double yellow centre line, white edge lines, lane dashes
      g.fillStyle = "#d9b53a";
      for (const o of [-0.16, 0.16]) {
        R(c0 + o - 0.06, a + 2.4, 0.12, BLOCK - 4.8);
        R(a + 2.4, c0 + o - 0.06, BLOCK - 4.8, 0.12);
      }
      g.fillStyle = "rgba(235,235,228,0.85)";
      for (const o of [-ROAD / 2 + 0.5, ROAD / 2 - 0.62]) {
        R(c0 + o, a + 2.4, 0.12, BLOCK - 4.8);
        R(a + 2.4, c0 + o, BLOCK - 4.8, 0.12);
      }
      for (const o of [-3, 3])
        for (let d = 3; d < BLOCK - 4; d += 5) {
          R(c0 + o - 0.06, a + d, 0.12, 2.2);
          R(a + d, c0 + o - 0.06, 2.2, 0.12);
        }
      // zebra crossings
      g.fillStyle = "#e6e6e0";
      for (let s = -5.2; s <= 4.7; s += 1.1) {
        R(c0 + s, a + 0.3, 0.6, 1.7);
        R(c0 + s, a + BLOCK - 2, 0.6, 1.7);
        R(a + 0.3, c0 + s, 1.7, 0.6);
        R(a + BLOCK - 2, c0 + s, 1.7, 0.6);
      }
    }
  }
  for (let bx = 0; bx < N; bx++)
    for (let bz = 0; bz < N; bz++) {
      const x = blockAt(bx);
      const z = blockAt(bz);
      const park = bx === 2 && bz === 2;
      // paving slabs, then the kerb
      for (let u = 0; u < BLOCK; u += 1)
        for (let v = 0; v < BLOCK; v += 1) {
          if (!park && u >= WALK && u < BLOCK - WALK && v >= WALK && v < BLOCK - WALK) continue;
          const s = 178 + Math.floor(r() * 22);
          g.fillStyle = `rgb(${s},${s - 3},${s - 10})`;
          R(x + u + 0.02, z + v + 0.02, 0.96, 0.96);
        }
      g.fillStyle = "#8f8a7d";
      R(x, z, BLOCK, 0.22);
      R(x, z + BLOCK - 0.22, BLOCK, 0.22);
      R(x, z, 0.22, BLOCK);
      R(x + BLOCK - 0.22, z, 0.22, BLOCK);
      if (!park) {
        g.fillStyle = "#6f736c";
        R(x + WALK, z + WALK, BLOCK - WALK * 2, BLOCK - WALK * 2);
        continue;
      }
      // the park: a lawn with mown stripes, a paved plaza in front of the stage
      for (let u = 1.5; u < BLOCK - 1.5; u += 1.5) {
        g.fillStyle = Math.round(u / 1.5) % 2 ? "#4f9f3f" : "#5aad47";
        R(x + 1.5, z + u, BLOCK - 3, 1.5);
      }
      for (let i = 0; i < 2600; i++) {
        g.fillStyle = r() < 0.5 ? "rgba(30,90,30,0.25)" : "rgba(170,220,120,0.2)";
        R(x + 1.5 + r() * (BLOCK - 3), z + 1.5 + r() * (BLOCK - 3), 0.08, 0.14);
      }
      g.fillStyle = "#b9b3a6";
      R(-8.5, -3.6, 17, 12.6);
      g.fillStyle = "rgba(0,0,0,0.14)";
      for (let u = -8.5; u <= 8.5; u += 1.7) R(u, -3.6, 0.04, 12.6);
      for (let v = -3.6; v <= 9; v += 1.8) R(-8.5, v, 17, 0.04);
    }
  return tex(c);
}

/** One bay of one floor: masonry, a recessed window with frame and sill, the glass catching sky. */
function facadeTex(v: number) {
  const [c, g] = canvas(128, 128);
  const r = rng(40 + v * 13);
  g.fillStyle = "#f2f0ea";
  g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(0,0,0,${r() * 0.05})`;
    g.fillRect(r() * 128, r() * 128, 2 + r() * 6, 1 + r() * 2);
  }
  g.fillStyle = "rgba(0,0,0,0.16)";
  g.fillRect(0, 118, 128, 4); // floor band
  const cols = v === 0 ? 1 : 2;
  const w = 128 / cols;
  for (let i = 0; i < cols; i++) {
    const x = i * w + w * 0.2;
    const ww = w * 0.6;
    g.fillStyle = "rgba(0,0,0,0.35)";
    g.fillRect(x - 3, 21, ww + 6, 78);
    const gl = g.createLinearGradient(0, 24, 0, 96);
    gl.addColorStop(0, "#9fc2e0");
    gl.addColorStop(0.5, "#4f6f8f");
    gl.addColorStop(1, "#24364a");
    g.fillStyle = gl;
    g.fillRect(x, 24, ww, 72);
    g.fillStyle = "rgba(255,255,255,0.22)";
    g.beginPath();
    g.moveTo(x, 24);
    g.lineTo(x + ww * 0.55, 24);
    g.lineTo(x + ww * 0.15, 96);
    g.lineTo(x, 96);
    g.fill();
    g.fillStyle = "#e9e6dd";
    g.fillRect(x + ww / 2 - 1.5, 24, 3, 72);
    g.fillRect(x, 56, ww, 3);
    g.fillStyle = "#d8d4c8";
    g.fillRect(x - 6, 97, ww + 12, 5);
  }
  return tex(c, true);
}
/** Curtain wall for the towers: mullions over tinted glass. */
function curtainTex() {
  const [c, g] = canvas(64, 64);
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = "#3c4854";
  g.fillRect(0, 0, 64, 3);
  g.fillRect(0, 0, 3, 64);
  g.fillStyle = "rgba(0,0,0,0.12)";
  g.fillRect(3, 44, 61, 20);
  return tex(c, true);
}
function shopTex(color: string, v: number) {
  const [c, g] = canvas(256, 128);
  g.fillStyle = "#2a2d31";
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = color;
  g.fillRect(0, 0, 256, 30);
  g.fillStyle = "rgba(255,255,255,0.9)";
  g.font = "900 20px system-ui, sans-serif";
  g.textBaseline = "middle";
  g.fillText(["CARROT MART", "HODL CAFE", "TOP TEN BARBER", "BURROW HOTEL", "SWAMP GYM", "BANANA BAR"][v % 6], 12, 16);
  for (let i = 0; i < 3; i++) {
    const gl = g.createLinearGradient(0, 36, 0, 120);
    gl.addColorStop(0, "#b7d2e6");
    gl.addColorStop(1, "#2e4256");
    g.fillStyle = gl;
    g.fillRect(8 + i * 84, 38, 72, 82);
    g.fillStyle = "rgba(255,255,255,0.18)";
    g.fillRect(8 + i * 84, 38, 24, 82);
  }
  g.fillStyle = "#16181b";
  g.fillRect(120, 52, 4, 68);
  return tex(c, true);
}

/** Soft reflections for glass, paint and gold, built in memory (no download). */
function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const rt = pm.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = rt.texture;
    scene.environmentIntensity = 0.5;
    return () => {
      scene.environment = null;
      rt.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
}

/* ───────── the town ───────── */

type Spot = [number, number, number, number, number]; // x, y, z, scale, turn
function Instances({ at, children, color }: { at: Spot[]; children: ReactNode; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useEffect(() => {
    const o = new THREE.Object3D();
    at.forEach(([x, y, z, s, ry], i) => {
      o.position.set(x, y, z);
      o.scale.setScalar(s);
      o.rotation.set(0, ry, 0);
      o.updateMatrix();
      ref.current.setMatrixAt(i, o.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [at]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, at.length]} castShadow receiveShadow>
      {children}
      <meshStandardMaterial color={color} roughness={0.9} />
    </instancedMesh>
  );
}

const STREET = (() => {
  const r = rng(21);
  const lamps: Spot[] = [];
  const trees: Spot[] = [];
  for (let bx = 0; bx < N; bx++)
    for (let bz = 0; bz < N; bz++) {
      const x = blockAt(bx), z = blockAt(bz), e = 0.55;
      // a lamp at each pavement corner, trees along the kerb
      lamps.push([x + e, 0, z + e, 1, Math.PI * 0.25], [x + BLOCK - e, 0, z + e, 1, -Math.PI * 0.25], [x + e, 0, z + BLOCK - e, 1, Math.PI * 0.75], [x + BLOCK - e, 0, z + BLOCK - e, 1, -Math.PI * 0.75]);
      for (const t of [6, 12, 18]) {
        const s = () => 0.8 + r() * 0.5;
        trees.push([x + t, 0, z + e, s(), r() * 6], [x + t, 0, z + BLOCK - e, s(), r() * 6], [x + e, 0, z + t, s(), r() * 6], [x + BLOCK - e, 0, z + t, s(), r() * 6]);
      }
    }
  [[-10, -10], [10, -10], [-10, 10], [10, 10], [-10.5, 0], [10.5, 0], [0, 10.5], [-5, 10.6], [5, 10.6]].forEach(([x, z]) => trees.push([x, 0, z, 1.5 + r() * 0.5, r() * 6]));
  const at = (list: Spot[], f: (s: Spot) => Spot) => list.map(f);
  return {
    trunks: at(trees, ([x, , z, s, t]) => [x, 1.3 * s, z, s, t]),
    crowns: at(trees, ([x, , z, s, t]) => [x, 3.3 * s, z, s, t]),
    tops: at(trees, ([x, , z, s, t]) => [x + 0.5 * s, 3.9 * s, z + 0.3 * s, s * 0.7, t]),
    poles: at(lamps, ([x, , z]) => [x, 2.6, z, 1, 0]),
    heads: at(lamps, ([x, , z, , t]) => [x + Math.sin(t) * 0.5, 5.2, z + Math.cos(t) * 0.5, 1, t]),
  };
})();

function Town({ screen }: { screen: THREE.Texture }) {
  const ground = useMemo(groundTex, []);
  const mats = useMemo(() => {
    const fac = [0, 1, 2].map(facadeTex);
    const cur = curtainTex();
    return BUILDINGS.map((b, i) => {
      const w = Math.max(b.x1 - b.x0, b.z1 - b.z0);
      const floors = Math.round((b.h - 3.6) / 3.2);
      const side = (b.glass ? cur : fac[i % 3]).clone();
      side.repeat.set(Math.max(1, Math.round(w / (b.glass ? 1.6 : 3.4))), floors * (b.glass ? 2 : 1));
      side.needsUpdate = true;
      const wall = b.glass ? new THREE.MeshPhysicalMaterial({ map: side, color: ["#6f93b3", "#5f8a86", "#7c8fb0"][i % 3], roughness: 0.12, metalness: 0.75, envMapIntensity: 1.6 }) : new THREE.MeshStandardMaterial({ map: side, color: b.tint, roughness: 0.88 });
      const sh = shopTex(b.shop, i);
      sh.repeat.set(Math.max(1, Math.round(w / 7)), 1);
      return { wall, shop: new THREE.MeshStandardMaterial({ map: sh, roughness: 0.4, metalness: 0.1 }), cap: new THREE.MeshStandardMaterial({ color: new THREE.Color(b.glass ? "#3b4652" : b.tint).multiplyScalar(0.6), roughness: 1 }) };
    });
  }, []);
  const roof = useMemo(() => {
    const r = rng(77);
    return BUILDINGS.flatMap((b) => Array.from({ length: 1 + Math.floor(r() * 3) }, (): Spot => [b.x0 + 1.5 + r() * (b.x1 - b.x0 - 3), b.h + 0.75, b.z0 + 1.5 + r() * (b.z1 - b.z0 - 3), 0.7 + r() * 0.8, r() < 0.5 ? 0 : Math.PI / 2]));
  }, []);
  const wood = <meshStandardMaterial color="#3a2616" roughness={0.45} />;
  return (
    <group>
      <Sky sunPosition={SUN} turbidity={5} rayleigh={0.9} mieCoefficient={0.004} mieDirectionalG={0.85} distance={3000} />
      {/* the sea, then the island */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
        <circleGeometry args={[1400, 64]} />
        <meshPhysicalMaterial color="#1f6f9a" roughness={0.08} metalness={0.4} envMapIntensity={1.8} />
      </mesh>
      <mesh position={[0, -0.66, 0]} receiveShadow>
        <boxGeometry args={[HALF * 2 + 10, 1.3, HALF * 2 + 10]} />
        <meshStandardMaterial color="#cfc4a2" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[HALF * 2, HALF * 2]} />
        <meshStandardMaterial map={ground} roughness={0.92} />
      </mesh>
      {BUILDINGS.map((b, i) => {
        const w = b.x1 - b.x0, d = b.z1 - b.z0, cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2;
        return (
          <group key={i}>
            <mesh position={[cx, 3.6 + (b.h - 3.6) / 2, cz]} material={mats[i].wall} castShadow receiveShadow>
              <boxGeometry args={[w, b.h - 3.6, d]} />
            </mesh>
            <mesh position={[cx, 1.8, cz]} material={mats[i].shop} castShadow receiveShadow>
              <boxGeometry args={[w - 0.1, 3.6, d - 0.1]} />
            </mesh>
            {/* cornice over the shopfronts, parapet round the roof */}
            <mesh position={[cx, 3.7, cz]} material={mats[i].cap} castShadow>
              <boxGeometry args={[w + 0.5, 0.22, d + 0.5]} />
            </mesh>
            <mesh position={[cx, b.h + 0.25, cz]} material={mats[i].cap} castShadow>
              <boxGeometry args={[w + 0.3, 0.5, d + 0.3]} />
            </mesh>
          </group>
        );
      })}
      <Instances at={roof} color="#8b9197">
        <boxGeometry args={[1.6, 1, 1.1]} />
      </Instances>
      {/* kerbside trees and street lamps */}
      <Instances at={STREET.trunks} color="#5a3d25">
        <cylinderGeometry args={[0.1, 0.16, 2.6, 8]} />
      </Instances>
      <Instances at={STREET.crowns} color="#3b8f3a">
        <icosahedronGeometry args={[1.25, 1]} />
      </Instances>
      <Instances at={STREET.tops} color="#4aa544">
        <icosahedronGeometry args={[1.1, 1]} />
      </Instances>
      <Instances at={STREET.poles} color="#2b2f33">
        <cylinderGeometry args={[0.06, 0.09, 5.2, 8]} />
      </Instances>
      <Instances at={STREET.heads} color="#e9e4d2">
        <boxGeometry args={[0.26, 0.12, 1.1]} />
      </Instances>

      {/* the stage: deck, steps, carpet, lectern, the assistants' tables, the screen */}
      <mesh position={[0, STAGE.h / 2, (STAGE.z0 + STAGE.z1) / 2]} castShadow receiveShadow>
        <boxGeometry args={[STAGE.x1 - STAGE.x0, STAGE.h, STAGE.z1 - STAGE.z0]} />
        <meshStandardMaterial color="#6b4a2f" roughness={0.65} />
      </mesh>
      {[0.2, 0.4].map((y, i) => (
        <mesh key={y} position={[0, y / 2, STAGE.z1 + 0.25 + (1 - i) * 0.5]} receiveShadow castShadow>
          <boxGeometry args={[5, y, 0.5]} />
          <meshStandardMaterial color="#5a3d26" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, STAGE.h + 0.02, (STAGE.z0 + STAGE.z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4, 4.6]} />
        <meshStandardMaterial color="#9b1c22" roughness={0.95} />
      </mesh>
      <group position={[LECTERN.x, STAGE.h, LECTERN.z + 0.75]}>
        <RoundedBox args={[0.9, 1.15, 0.5]} radius={0.05} position={[0, 0.575, 0]} castShadow>
          {wood}
        </RoundedBox>
        <mesh position={[0, 1.2, -0.05]} rotation={[0.35, 0, 0]} castShadow>
          <boxGeometry args={[1, 0.06, 0.6]} />
          <meshStandardMaterial color="#2a1a0e" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.7, 0.26]}>
          <circleGeometry args={[0.24, 24]} />
          <meshStandardMaterial color="#ffc93c" metalness={1} roughness={0.2} />
        </mesh>
        {[-0.18, 0.18].map((x) => (
          <mesh key={x} position={[x, 1.42, 0.02]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.42, 6]} />
            <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>
      {[-3.4, 3.4].map((x) => (
        <group key={x} position={[x, STAGE.h, SEATS[0].z + 0.75]}>
          <RoundedBox args={[3.4, 0.08, 0.8]} radius={0.03} position={[0, 0.92, 0]} castShadow>
            {wood}
          </RoundedBox>
          <mesh position={[0, 0.46, 0.36]} castShadow>
            <boxGeometry args={[3.4, 0.92, 0.06]} />
            <meshStandardMaterial color="#1b2333" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {[-5.6, 5.6].map((x) => (
        <mesh key={x} position={[x, 3.2, STAGE.z0 + 0.5]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 5.4, 10]} />
          <meshStandardMaterial color="#2b2f33" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 4.1, STAGE.z0 + 0.5]} castShadow>
        <boxGeometry args={[11.6, 3.7, 0.25]} />
        <meshStandardMaterial color="#15171a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.1, STAGE.z0 + 0.64]}>
        <planeGeometry args={[11.1, 3.3]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
    </group>
  );
}

function CarMesh({ color, reg }: { color: string; reg: (g: THREE.Group | null) => void }) {
  const paint = <meshPhysicalMaterial color={color} roughness={0.22} metalness={0.55} clearcoat={1} clearcoatRoughness={0.06} envMapIntensity={1.5} />;
  return (
    <group ref={reg}>
      <RoundedBox args={[1.92, 0.5, 4.4]} radius={0.18} smoothness={4} position={[0, 0.6, 0]} castShadow>
        {paint}
      </RoundedBox>
      <RoundedBox args={[1.86, 0.3, 4.3]} radius={0.12} smoothness={3} position={[0, 0.36, 0]} castShadow>
        <meshStandardMaterial color="#17181a" roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[1.66, 0.58, 2.3]} radius={0.22} smoothness={4} position={[0, 1.08, -0.25]} castShadow>
        <meshPhysicalMaterial color="#0f171f" roughness={0.04} metalness={0.9} envMapIntensity={2} />
      </RoundedBox>
      <RoundedBox args={[1.7, 0.1, 1.5]} radius={0.04} position={[0, 1.36, -0.25]}>
        {paint}
      </RoundedBox>
      {[-1, 1].flatMap((sx) =>
        [-1.38, 1.4].map((z) => (
          <group key={`${sx}${z}`} position={[0.9 * sx, 0.36, z]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.36, 0.36, 0.28, 20]} />
              <meshStandardMaterial color="#141516" roughness={0.95} />
            </mesh>
            <mesh position={[0, -0.15 * sx, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.02, 16]} />
              <meshStandardMaterial color="#c9ccd1" metalness={1} roughness={0.25} />
            </mesh>
          </group>
        )),
      )}
      {[-0.62, 0.62].map((x) => (
        <mesh key={x} position={[x, 0.66, 2.2]}>
          <boxGeometry args={[0.44, 0.16, 0.04]} />
          <meshStandardMaterial color="#fff6c8" emissive="#fff0b0" emissiveIntensity={1.4} />
        </mesh>
      ))}
      {[-0.62, 0.62].map((x) => (
        <mesh key={x} position={[x, 0.68, -2.2]}>
          <boxGeometry args={[0.44, 0.14, 0.04]} />
          <meshStandardMaterial color="#ff2a2a" emissive="#ff1010" emissiveIntensity={1.2} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[1.0 * s, 0.98, 0.72]}>
          <boxGeometry args={[0.14, 0.1, 0.18]} />
          {paint}
        </mesh>
      ))}
    </group>
  );
}

/* ───────── the game ───────── */

export type Hud = { near: boolean; driving: boolean; ai: boolean; rank: number; speed: number; live: boolean; onStage: boolean; kind: Kind; outfit: Outfit; color: string };
export type ChatLine = { who: string; text: string; ai: boolean; at: number; role?: "speech" | "assistant" };
export type CityApi = {
  say: (text: string) => void;
  /** Only No. 1 can open or close the speech. */
  startSpeech: () => void;
  endSpeech: () => void;
  /** No. 2 to 5, while a speech is live: go to your place at the assistants' table. */
  takeSeat: () => void;
  setAvatar: (a: { kind?: Kind; outfit?: Outfit; color?: string }) => void;
  /** Demo: put yourself at a rank to try what it unlocks. */
  playAs: (rank: number) => void;
  /** Demo: let the bot that holds No. 1 open (or close) a speech. */
  botSpeech: () => void;
};
type Label = { id: string; name: string; rank: number; ai: boolean; say: string; role: string };
type Tags = { els: RefObject<Map<string, HTMLDivElement>>; set: (l: Label[]) => void };

const AFK_AFTER = 12; // seconds without input before the agent takes over

function World({ onHud, onChat, map, api, tags }: { onHud: (h: Hud) => void; onChat: (l: ChatLine) => void; map: RefObject<HTMLCanvasElement | null>; api: RefObject<CityApi | null>; tags: Tags }) {
  const cast = useMemo(makeCast, []);
  const cars = useMemo(makeCars, []);
  const parts = useRef(new Map<string, CritterParts>());
  const carRefs = useRef<(THREE.Group | null)[]>([]);
  const keys = useRef(new Set<string>());
  const cam = useRef({ yaw: 0.6, pitch: 0.3, dist: 8.5, drag: false, px: 0, py: 0 });
  const idle = useRef(0);
  const clock = useRef(0);
  const hudAt = useRef(0);
  const live = useRef(false);
  const sun = useRef<THREE.DirectionalLight>(null!);
  const [, redraw] = useState(0);
  const { camera, gl, size } = useThree();
  const you = cast[0];
  const v3 = useMemo(() => new THREE.Vector3(), []);

  // the screen behind the stage
  const screen = useMemo(() => tex(canvas(1110, 330)[0]), []);
  const show = useCallback(
    (who: string, role: string, text: string) => {
      const g = (screen.image as HTMLCanvasElement).getContext("2d")!;
      g.fillStyle = live.current ? "#0d1420" : "#101214";
      g.fillRect(0, 0, 1110, 330);
      g.textBaseline = "top";
      if (!live.current) {
        g.fillStyle = "#6b7280";
        g.font = "900 54px system-ui, sans-serif";
        g.fillText("NO EVENT RIGHT NOW", 50, 96);
        g.font = "600 30px system-ui, sans-serif";
        g.fillText("Only the No. 1 holder can open a speech.", 50, 176);
      } else {
        g.fillStyle = "#e5262b";
        g.fillRect(40, 34, 150, 46);
        g.fillStyle = "#ffffff";
        g.font = "900 32px system-ui, sans-serif";
        g.fillText("● LIVE", 54, 40);
        g.fillStyle = "#ffc93c";
        g.fillText(who ? `${role} · ${who}` : role, 214, 40);
        g.fillStyle = "#ffffff";
        g.font = "700 50px system-ui, sans-serif";
        let line = "";
        let y = 112;
        for (const w of text.split(" ")) {
          if (line && g.measureText(`${line} ${w}`).width > 1020) {
            g.fillText(line, 44, y);
            y += 62;
            line = w;
          } else line = line ? `${line} ${w}` : w;
          if (y > 250) break;
        }
        if (y <= 250) g.fillText(line, 44, y);
      }
      screen.needsUpdate = true;
    },
    [screen],
  );
  useEffect(() => show("", "", ""), [show]);

  // name tags are plain DOM over the canvas: React owns their text, the frame loop their position
  const bump = useCallback(() => tags.set(cast.map((a) => ({ id: a.id, name: a.name, rank: a.rank, ai: a.ai, say: a.say, role: live.current ? (a.rank === 1 ? "SPEAKER" : a.rank <= 5 ? "ASSISTANT" : "") : "" }))), [cast, tags]);
  useEffect(bump, [bump]);

  const onStage = (a: Actor) => floorAt(a.x, a.z) > 0;
  const speak = useCallback(
    (a: Actor, text: string, stage = false) => {
      a.say = text;
      a.sayUntil = clock.current + (stage ? 6 : 4.5);
      if (stage) show(a.name, a.rank === 1 ? "TOP 1" : `ASSISTANT · TOP ${a.rank}`, text);
      onChat({ who: a.name, text, ai: a.ai, at: Date.now(), role: stage ? (a.rank === 1 ? "speech" : "assistant") : undefined });
      bump();
    },
    [onChat, bump, show],
  );

  const openSpeech = useCallback(() => {
    live.current = true;
    let n = 0;
    cast.forEach((a) => {
      a.next = clock.current + 2 + (hash(a.id) % 5);
      if (a.you) return;
      a.wait = 0;
      a.goal = a.rank === 1 ? { ...LECTERN, face: 0 } : a.rank <= 5 ? { ...SEATS[a.rank - 2], face: 0 } : { ...CROWD[(n++ * 5) % CROWD.length], face: Math.PI };
    });
    show("", "TOP 1 SPEECH", "The speech is starting…");
    bump();
  }, [cast, bump, show]);
  const closeSpeech = useCallback(() => {
    live.current = false;
    cast.forEach((a) => {
      if (!a.goal) return;
      a.corner = nearestCorner(a.x, a.z);
      a.goal = null;
    });
    show("", "", "");
    bump();
  }, [cast, bump, show]);
  const place = (a: Actor, p: { x: number; z: number }) => {
    a.x = p.x;
    a.z = p.z;
    a.y = STAGE.h;
    a.rot = 0;
    cam.current.yaw = 0.3;
  };

  useEffect(() => {
    api.current = {
      say: (text) => {
        idle.current = 0;
        you.ai = false;
        const stage = live.current && you.rank <= 5 && onStage(you);
        speak(you, text, stage);
        if (stage) return;
        // whoever is closest answers
        const near = cast.filter((a) => !a.you && !a.goal && Math.hypot(a.x - you.x, a.z - you.z) < 14).sort((a, b) => Math.hypot(a.x - you.x, a.z - you.z) - Math.hypot(b.x - you.x, b.z - you.z))[0];
        if (near) setTimeout(() => speak(near, REPLIES[Math.floor(Math.random() * REPLIES.length)]), 900);
      },
      startSpeech: () => {
        if (you.rank !== 1 || live.current) return;
        if (you.car >= 0) toggleCar();
        idle.current = 0;
        openSpeech();
        place(you, LECTERN);
      },
      endSpeech: () => {
        if (you.rank === 1 && live.current) closeSpeech();
      },
      takeSeat: () => {
        if (!live.current || you.rank < 2 || you.rank > 5) return;
        if (you.car >= 0) toggleCar();
        idle.current = 0;
        place(you, SEATS[you.rank - 2]);
      },
      setAvatar: (a) => {
        if (a.kind) you.kind = a.kind;
        if (a.color) you.color = a.color;
        if (a.outfit && (a.outfit === "hoodie" || (a.outfit === "suit" && you.rank <= 10) || (a.outfit === "cape" && you.rank === 1))) you.outfit = a.outfit;
        redraw((n) => n + 1);
      },
      playAs: (rank) => {
        if (live.current) closeSpeech();
        const others = cast.filter((a) => !a.you).sort((a, b) => b.balance - a.balance);
        you.balance = rank <= 1 ? others[0].balance + 500_000 : Math.round((others[rank - 2].balance + others[rank - 1].balance) / 2);
        rerank(cast);
        bump();
        redraw((n) => n + 1);
      },
      botSpeech: () => {
        if (you.rank === 1) return;
        if (live.current) closeSpeech();
        else openSpeech();
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, cast, speak, you, bump, openSpeech, closeSpeech]);

  // input: keys, drag to look, wheel to zoom
  useEffect(() => {
    const typing = () => document.activeElement?.tagName === "INPUT";
    const down = (e: KeyboardEvent) => {
      if (typing()) return;
      keys.current.add(e.code);
      idle.current = 0;
      if (e.code === "Space") e.preventDefault();
      if (e.code === "KeyF") toggleCar();
      if (e.code === "KeyG") api.current?.takeSeat();
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const el = gl.domElement;
    const pd = (e: PointerEvent) => {
      idle.current = 0;
      cam.current.drag = true;
      cam.current.px = e.clientX;
      cam.current.py = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const pm = (e: PointerEvent) => {
      if (!cam.current.drag) return;
      cam.current.yaw -= (e.clientX - cam.current.px) * 0.006;
      cam.current.pitch = Math.max(0.05, Math.min(1.25, cam.current.pitch + (e.clientY - cam.current.py) * 0.004));
      cam.current.px = e.clientX;
      cam.current.py = e.clientY;
    };
    const pu = () => (cam.current.drag = false);
    const wheel = (e: WheelEvent) => (cam.current.dist = Math.max(4, Math.min(26, cam.current.dist + e.deltaY * 0.01)));
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    el.addEventListener("pointerdown", pd);
    el.addEventListener("pointermove", pm);
    el.addEventListener("pointerup", pu);
    el.addEventListener("wheel", wheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      el.removeEventListener("pointerdown", pd);
      el.removeEventListener("pointermove", pm);
      el.removeEventListener("pointerup", pu);
      el.removeEventListener("wheel", wheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl]);

  const nearestCar = () => {
    let best = -1;
    let bd = 3.8;
    cars.forEach((c, i) => {
      const d = Math.hypot(c.x - you.x, c.z - you.z);
      if (d < bd && !c.driver) (bd = d), (best = i);
    });
    return best;
  };
  function toggleCar() {
    if (you.car >= 0) {
      const c = cars[you.car];
      c.driver = null;
      c.speed = 0;
      you.x = c.x + Math.cos(c.rot) * 1.9;
      you.z = c.z - Math.sin(c.rot) * 1.9;
      collide(you, 0.45);
      you.car = -1;
      return;
    }
    const i = nearestCar();
    if (i < 0) return;
    cars[i].driver = you.id;
    you.car = i;
  }

  /** One step toward a point. True once it is there. */
  const stepTo = (a: Actor, x: number, z: number, pace: number, dt: number) => {
    const dx = x - a.x, dz = z - a.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.5) return true;
    a.speed = pace;
    a.rot = Math.atan2(dx, dz);
    a.x += (dx / d) * pace * dt;
    a.z += (dz / d) * pace * dt;
    return false;
  };
  /** Walk the pavements: head for the current corner, then pick one a straight line away. */
  const wander = (a: Actor, dt: number, pace: number) => {
    if (a.wait > 0) {
      a.wait -= dt;
      a.speed = 0;
      return;
    }
    const p = cornerPos(a.corner);
    if (!stepTo(a, p.x, p.z, pace, dt)) return;
    const opts = nextCorners(a.corner);
    a.corner = opts[Math.floor(Math.random() * opts.length)];
    if (Math.random() < 0.3) a.wait = 1 + Math.random() * 3;
  };
  /** Go somewhere in the park: by the pavements until it is close, then straight across. */
  const travel = (a: Actor, dt: number, g: NonNullable<Goal>) => {
    if (Math.hypot(g.x - a.x, g.z - a.z) < 24) {
      if (!stepTo(a, g.x, g.z, 3.4, dt)) return;
      a.speed = 0;
      a.rot += Math.atan2(Math.sin(g.face - a.rot), Math.cos(g.face - a.rot)) * Math.min(1, dt * 6);
      return;
    }
    const p = cornerPos(a.corner);
    if (!stepTo(a, p.x, p.z, 4.6, dt)) return;
    const far = (c: Corner) => Math.hypot(cornerPos(c).x - g.x, cornerPos(c).z - g.z);
    a.corner = nextCorners(a.corner).sort((m, n) => far(m) - far(n))[0];
  };

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const t = (clock.current += dt);
    const K = keys.current;
    const c = cam.current;
    const ax = (K.has("KeyD") || K.has("ArrowRight") ? 1 : 0) - (K.has("KeyA") || K.has("ArrowLeft") ? 1 : 0);
    const az = (K.has("KeyW") || K.has("ArrowUp") ? 1 : 0) - (K.has("KeyS") || K.has("ArrowDown") ? 1 : 0);

    // away from the keys for a while: the agent takes the character over (not while you hold the stage)
    idle.current += dt;
    const afk = idle.current > AFK_AFTER && you.car < 0 && !(live.current && onStage(you));
    if (afk !== you.ai) {
      you.ai = afk;
      if (afk) {
        you.corner = nearestCorner(you.x, you.z);
        you.wait = 0;
      }
      bump();
    }

    // you, on foot or at the wheel
    if (you.car >= 0) {
      const car = cars[you.car];
      car.speed += az * (az > 0 ? 16 : 22) * dt;
      car.speed *= 1 - (az === 0 ? 1.2 : 0.25) * dt;
      car.speed = Math.max(-9, Math.min(30, car.speed));
      car.rot -= ax * dt * 2 * Math.max(-1, Math.min(1, car.speed / 7));
      car.x += Math.sin(car.rot) * car.speed * dt;
      car.z += Math.cos(car.rot) * car.speed * dt;
      if (collide(car, 1.5)) car.speed *= -0.25;
      you.x = car.x;
      you.z = car.z;
      you.speed = 0;
      // the camera swings round behind the car
      if (!c.drag && Math.abs(car.speed) > 1) {
        const want = car.rot + Math.PI;
        c.yaw += Math.atan2(Math.sin(want - c.yaw), Math.cos(want - c.yaw)) * Math.min(1, dt * 2.5);
      }
      // pedestrians in the way go flying (and get up again)
      if (Math.abs(car.speed) > 6)
        cast.forEach((a) => {
          if (a.you || a.down > 0 || Math.hypot(a.x - car.x, a.z - car.z) > 1.9) return;
          a.down = 2.6;
          a.vy = 7;
          speak(a, "hey!!");
        });
    } else if (you.ai) wander(you, dt, 3.2);
    else {
      const run = K.has("ShiftLeft") || K.has("ShiftRight");
      const mx = -Math.sin(c.yaw) * az + Math.cos(c.yaw) * ax;
      const mz = -Math.cos(c.yaw) * az - Math.sin(c.yaw) * ax;
      const m = Math.hypot(mx, mz);
      const pace = m ? (run ? 8.5 : 4.5) : 0;
      you.speed += (pace - you.speed) * Math.min(1, dt * 10);
      if (m) {
        const want = Math.atan2(mx, mz);
        you.rot += Math.atan2(Math.sin(want - you.rot), Math.cos(want - you.rot)) * Math.min(1, dt * 12);
        you.x += (mx / m) * you.speed * dt;
        you.z += (mz / m) * you.speed * dt;
      }
      if (K.has("Space") && you.vy === 0 && you.y <= floorAt(you.x, you.z) + 0.01) you.vy = 7.5;
    }

    // the bots
    cast.forEach((a) => {
      if (a.you) return;
      if (a.down > 0) {
        a.down -= dt;
        a.speed = 0;
        return;
      }
      if (!a.goal) {
        wander(a, dt, 2.4 + (hash(a.id) % 10) * 0.12);
        if (!a.say && Math.random() < dt * 0.012) speak(a, LINES[Math.floor(Math.random() * LINES.length)]);
        return;
      }
      travel(a, dt, a.goal);
      if (a.speed > 0 || t < a.next) return;
      // in place: the speaker works through the speech, assistants chip in, the crowd cheers
      if (a.rank === 1) {
        speak(a, SPEECH[Math.floor(t / 6) % SPEECH.length], true);
        a.next = t + 6;
      } else if (a.rank <= 5) {
        if (Math.random() < 0.5) speak(a, ASSIST[Math.floor(Math.random() * ASSIST.length)], true);
        a.next = t + 9 + Math.random() * 8;
      } else {
        if (Math.random() < 0.35) speak(a, CHEERS[Math.floor(Math.random() * CHEERS.length)]);
        a.next = t + 6 + Math.random() * 14;
      }
    });

    // gravity, walls, pose
    cast.forEach((a) => {
      const fl = a.car < 0 ? floorAt(a.x, a.z) : 0;
      if (a.y > fl || a.vy > 0) {
        a.vy -= 20 * dt;
        a.y = Math.max(fl, a.y + a.vy * dt);
        if (a.y === fl) a.vy = 0;
      } else a.y += (fl - a.y) * Math.min(1, dt * 14);
      if (a.car < 0) collide(a, 0.45);
      if (a.say && t > a.sayUntil) {
        a.say = "";
        bump();
      }
      const m = parts.current.get(a.id);
      if (!m) return;
      const air = a.y > fl + 0.02;
      m.root.visible = a.car < 0;
      m.root.position.set(a.x, a.y, a.z);
      m.root.rotation.y = a.rot;
      a.phase += a.speed * dt * 1.9;
      const amp = Math.min(1, a.speed / 4) * 0.75;
      const sw = Math.sin(a.phase) * amp;
      const lying = a.down > 0 && !air ? Math.min(1, (2.6 - a.down) * 4) * Math.min(1, a.down * 3) : 0;
      m.rig.rotation.x = -lying * 1.5 + (air && a.down > 0 ? t * 9 : 0);
      m.rig.position.y = Math.abs(Math.cos(a.phase)) * amp * 0.06 + lying * 0.25;
      m.legL.rotation.x = sw;
      m.legR.rotation.x = -sw;
      // on stage, whoever is speaking talks with the hands
      const talk = a.say && onStage(a) ? Math.sin(t * 7) * 0.35 - 0.7 : 0;
      m.armL.rotation.x = -sw * 0.9 - (air ? 2.4 : 0) + talk;
      m.armR.rotation.x = sw * 0.9 - (air ? 2.4 : 0) + talk * 0.4;
      m.head.rotation.y = Math.sin(t * 0.6 + a.phase * 0.05) * 0.25 * (1 - amp);
      if (m.tail) m.tail.rotation.y = Math.sin(a.phase * 0.5 + t * 2) * 0.35;
    });
    cars.forEach((car, i) => {
      const g = carRefs.current[i];
      if (!g) return;
      g.position.set(car.x, 0, car.z);
      g.rotation.y = car.rot;
    });

    // third-person camera and the sun's shadow box, both centred on you
    const driving = you.car >= 0;
    const dist = c.dist * (driving ? 1.5 : 1);
    const tx = you.x, ty = you.y + (driving ? 1.4 : 1.5), tz = you.z;
    v3.set(tx + Math.sin(c.yaw) * Math.cos(c.pitch) * dist, ty + Math.sin(c.pitch) * dist, tz + Math.cos(c.yaw) * Math.cos(c.pitch) * dist);
    camera.position.lerp(v3, Math.min(1, dt * 9));
    camera.lookAt(tx, ty, tz);
    sun.current.position.set(tx + SUN[0], SUN[1], tz + SUN[2]);
    sun.current.target.position.set(tx, 0, tz);
    sun.current.target.updateMatrixWorld();

    // pin each tag over its head; shrink with distance, hide when far or behind the camera
    camera.updateMatrixWorld();
    cast.forEach((a) => {
      const el = tags.els.current.get(a.id);
      if (!el) return;
      const d = Math.hypot(a.x - camera.position.x, a.z - camera.position.z);
      v3.set(a.x, a.y + 2.5, a.z).project(camera);
      if (a.car >= 0 || v3.z > 1 || d > 70 || Math.abs(v3.x) > 1.2 || Math.abs(v3.y) > 1.2) {
        el.style.display = "none";
        return;
      }
      el.style.display = "";
      el.style.transform = `translate(-50%, -100%) translate(${((v3.x + 1) / 2) * size.width}px, ${((1 - v3.y) / 2) * size.height}px) scale(${Math.max(0.45, Math.min(1.15, 11 / d))})`;
      el.style.zIndex = String(1000 - Math.round(d));
    });

    // HUD and minimap, a few times a second
    if (t - hudAt.current > 0.12) {
      hudAt.current = t;
      onHud({ near: !driving && nearestCar() >= 0, driving, ai: you.ai, rank: you.rank, speed: driving ? Math.abs(cars[you.car].speed) : you.speed, live: live.current, onStage: onStage(you), kind: you.kind, outfit: you.outfit, color: you.color ?? "" });
      const cv = map.current;
      const g = cv?.getContext("2d");
      if (cv && g) {
        const S = cv.width;
        const k = S / (HALF * 2);
        g.fillStyle = "#2a2d33";
        g.fillRect(0, 0, S, S);
        for (let bx = 0; bx < N; bx++)
          for (let bz = 0; bz < N; bz++) {
            // the park blinks red while a speech is live
            g.fillStyle = bx === 2 && bz === 2 ? (live.current && Math.floor(t * 2) % 2 ? "#e5262b" : "#3f8f3a") : "#6f7480";
            g.fillRect((blockAt(bx) + HALF) * k, (blockAt(bz) + HALF) * k, BLOCK * k, BLOCK * k);
          }
        cars.forEach((car) => {
          g.fillStyle = car.color;
          g.fillRect((car.x + HALF) * k - 2, (car.z + HALF) * k - 2, 4, 4);
        });
        cast.forEach((a) => {
          if (a.you) return;
          g.fillStyle = a.rank <= 10 ? "#ffc93c" : "#e8e8e8";
          g.beginPath();
          g.arc((a.x + HALF) * k, (a.z + HALF) * k, a.rank === 1 ? 3.6 : a.rank <= 10 ? 2.6 : 1.8, 0, 7);
          g.fill();
        });
        g.save();
        g.translate((you.x + HALF) * k, (you.z + HALF) * k);
        g.rotate(-(driving ? cars[you.car].rot : you.rot));
        g.fillStyle = "#4ad0ff";
        g.beginPath();
        g.moveTo(0, 6);
        g.lineTo(4, -4);
        g.lineTo(-4, -4);
        g.closePath();
        g.fill();
        g.restore();
      }
    }
  });

  const register = useMemo(() => (id: string, p: CritterParts | null) => void (p ? parts.current.set(id, p) : parts.current.delete(id)), []);
  return (
    <>
      <directionalLight ref={sun} color="#fff0d8" intensity={3} castShadow shadow-mapSize={[4096, 4096]} shadow-camera-left={-55} shadow-camera-right={55} shadow-camera-top={55} shadow-camera-bottom={-55} shadow-camera-far={160} shadow-bias={-0.0003} shadow-normalBias={0.05} />
      <Town screen={screen} />
      {cars.map((car, i) => (
        <CarMesh key={i} color={car.color} reg={(g) => (carRefs.current[i] = g)} />
      ))}
      {cast.map((a) => (
        <Critter key={`${a.id}:${a.kind}`} id={a.id} kind={a.kind} outfit={a.outfit} color={a.color} mark={a.rank === 1 ? "crown" : a.rank <= 10 ? "chain" : null} register={register} />
      ))}
    </>
  );
}

export default function City({ onHud, onChat, map, api, fx = true }: { onHud: (h: Hud) => void; onChat: (l: ChatLine) => void; map: RefObject<HTMLCanvasElement | null>; api: RefObject<CityApi | null>; fx?: boolean }) {
  const [labels, setLabels] = useState<Label[]>([]);
  const els = useRef(new Map<string, HTMLDivElement>());
  const tags = useMemo<Tags>(() => ({ els, set: setLabels }), []);
  return (
    <>
      <Canvas shadows style={{ position: "absolute", inset: 0 }} dpr={[1, 1.5]} camera={{ fov: 50, near: 0.2, far: 4000, position: [20, 10, 60] }} gl={{ antialias: !fx, toneMappingExposure: 0.62 }}>
        <fog attach="fog" args={["#c9dcec", 120, 520]} />
        <Env />
        <hemisphereLight args={["#cfe4ff", "#8a8577", 0.55]} />
        <World onHud={onHud} onChat={onChat} map={map} api={api} tags={tags} />
        {fx ? (
          <EffectComposer multisampling={4}>
            <N8AO aoRadius={1.6} intensity={2.4} distanceFalloff={1} halfRes quality="performance" />
            <Bloom mipmapBlur luminanceThreshold={1} intensity={0.25} />
            <Vignette offset={0.3} darkness={0.4} />
          </EffectComposer>
        ) : null}
      </Canvas>
      <div className="city__tags">
        {labels.map((a) => (
          <div key={a.id} className="city__tag" style={{ display: "none" }} ref={(el) => void (el ? els.current.set(a.id, el) : els.current.delete(a.id))}>
            {a.say ? <div className={`city__say${a.role ? " is-stage" : ""}`}>{a.say}</div> : null}
            {a.role ? <div className="city__role">{a.role}</div> : null}
            <div className="city__name">
              {a.rank <= 10 ? <b className={`city__top${a.rank === 1 ? " is-one" : ""}`}>{a.rank === 1 ? "👑 TOP 1" : `TOP ${a.rank}`}</b> : null}
              <span>{a.name}</span>
              <i className={a.ai ? "is-ai" : "is-human"}>{a.ai ? "AI" : "HUMAN"}</i>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
