/**
 * Prototype: a small open town the holders walk around in, third person. You are one holder;
 * the rest are bots. WASD to move, Shift to run, Space to jump, F to get in or out of a car,
 * drag to look, Enter to chat. Leave the keys alone and an agent takes your character over
 * (the tag above the head flips from HUMAN to AI) until you touch a key again. The ten biggest
 * holders wear a crown, a chain and a gold TOP tag. Everything here is local demo data: no
 * server, no wallets, no real chat yet.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Critter, hash, type CritterParts, type Kind } from "./Critter";

/* ───────── the map: a 5 × 5 grid of blocks on an island ───────── */

const N = 5;
const BLOCK = 24;
const ROAD = 12;
const PITCH = BLOCK + ROAD;
const HALF = (N * BLOCK + (N + 1) * ROAD) / 2; // 96
const WALK = 2; // pavement width inside each block
const roadAt = (i: number) => -HALF + ROAD / 2 + i * PITCH; // centre line of road i (0..N)
const blockAt = (i: number) => -HALF + ROAD + i * PITCH; // near edge of block i (0..N-1)

const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

type Box = { x0: number; x1: number; z0: number; z1: number; h: number; tint: string; win: number };
const BUILDINGS: Box[] = (() => {
  const r = rng(7);
  const tints = ["#d9c7a8", "#b8c4d6", "#c9a79a", "#a9b8a4", "#d6d3cc", "#9aa7bd", "#c7b08c", "#b59f9f"];
  const out: Box[] = [];
  for (let bx = 0; bx < N; bx++)
    for (let bz = 0; bz < N; bz++) {
      if (bx === 2 && bz === 2) continue; // the park
      const x = blockAt(bx) + WALK;
      const z = blockAt(bz) + WALK;
      const size = BLOCK - WALK * 2;
      const cut = r();
      const lots: [number, number, number, number][] = cut < 0.3 ? [[0, 0, size, size]] : cut < 0.65 ? [[0, 0, size / 2 - 0.6, size], [size / 2 + 0.6, 0, size / 2 - 0.6, size]] : [[0, 0, size / 2 - 0.6, size / 2 - 0.6], [size / 2 + 0.6, 0, size / 2 - 0.6, size / 2 - 0.6], [0, size / 2 + 0.6, size / 2 - 0.6, size / 2 - 0.6], [size / 2 + 0.6, size / 2 + 0.6, size / 2 - 0.6, size / 2 - 0.6]];
      const centre = 1 - (Math.abs(bx - 2) + Math.abs(bz - 2)) / 4;
      lots.forEach(([lx, lz, w, d]) => out.push({ x0: x + lx, x1: x + lx + w, z0: z + lz, z1: z + lz + d, h: 6 + r() * 10 + centre * r() * 26, tint: tints[Math.floor(r() * tints.length)], win: Math.floor(r() * 3) }));
    }
  return out;
})();

/** Pavement corners: where the bots (and your agent) walk. Corner = road crossing (ix, iz) and which side of each road. */
type Corner = { ix: number; iz: number; sx: 1 | -1; sz: 1 | -1 };
const cornerPos = (c: Corner) => ({ x: roadAt(c.ix) + c.sx * (ROAD / 2 + WALK / 2), z: roadAt(c.iz) + c.sz * (ROAD / 2 + WALK / 2) });
const validCorner = (c: Corner) => {
  const okx = (c.ix > 0 || c.sx === 1) && (c.ix < N || c.sx === -1);
  const okz = (c.iz > 0 || c.sz === 1) && (c.iz < N || c.sz === -1);
  return c.ix >= 0 && c.ix <= N && c.iz >= 0 && c.iz <= N && okx && okz;
};
/** The corners one straight pavement walk (or one zebra crossing) away. */
function nextCorners(c: Corner): Corner[] {
  const alongX: Corner = c.sx === 1 ? { ...c, ix: c.ix + 1, sx: -1 } : { ...c, ix: c.ix - 1, sx: 1 };
  const alongZ: Corner = c.sz === 1 ? { ...c, iz: c.iz + 1, sz: -1 } : { ...c, iz: c.iz - 1, sz: 1 };
  const crossX: Corner = { ...c, sx: -c.sx as 1 | -1 };
  const crossZ: Corner = { ...c, sz: -c.sz as 1 | -1 };
  return [alongX, alongZ, crossX, crossZ].filter(validCorner);
}
function nearestCorner(x: number, z: number): Corner {
  let best: Corner = { ix: 0, iz: 0, sx: 1, sz: 1 };
  let bd = Infinity;
  for (let ix = 0; ix <= N; ix++)
    for (let iz = 0; iz <= N; iz++)
      for (const sx of [1, -1] as const)
        for (const sz of [1, -1] as const) {
          const c = { ix, iz, sx, sz };
          if (!validCorner(c)) continue;
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

export type Actor = {
  id: string;
  name: string;
  kind: Kind;
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
  say: string;
  sayUntil: number;
  car: number; // index of the car being driven, -1 on foot
  down: number; // seconds left lying knocked over
};
type Car = { x: number; z: number; rot: number; speed: number; color: string; driver: string | null };

const NAMES = ["carrotking", "0x1a2b…3c4d", "@thumper", "apezilla", "0x5e6f…7a8b", "snapjaw", "0x9c0d…1e2f", "@lettuce", "bananaman", "0x3a4b…5c6d", "gatorade", "hopium", "0x7e8f…9a0b", "@clover", "kongfu", "swampfren", "0xab12…cd34", "burrow", "@chomp", "silverback", "0xfe98…dc76", "bigears", "mudlord", "@vine"];
const KINDS: Kind[] = ["rabbit", "ape", "croc"];
const LINES = ["gm", "wen top 10?", "holding since block one", "who sold?", "nice hoodie ser", "scoop scoop", "touch grass", "lfg", "never selling", "this town is small", "beep beep", "gm gm"];
const REPLIES = ["gm ser", "lol", "based", "wagmi", "say less", "true", "no way", "who are you again?"];

function makeCast(): Actor[] {
  const r = rng(99);
  const list = [{ id: "you", name: "you", you: true }, ...NAMES.map((name, i) => ({ id: `b${i}`, name, you: false }))].map((a, i) => {
    const c: Corner = a.you ? { ix: 2, iz: 3, sx: 1, sz: -1 } : nearestCorner((r() - 0.5) * 170, (r() - 0.5) * 170);
    const p = cornerPos(c);
    return { ...a, kind: a.you ? ("rabbit" as Kind) : KINDS[(hash(a.id) >>> 3) % 3], balance: a.you ? 1_450_000 : Math.round(9_400_000 * Math.pow(0.84, i) + r() * 40_000), rank: 0, ai: !a.you, x: p.x + (a.you ? 0 : (r() - 0.5) * 1.2), y: 0, z: p.z + (a.you ? 0 : (r() - 0.5) * 1.2), vy: 0, rot: r() * 6, speed: 0, phase: r() * 6, corner: c, wait: r() * 4, say: "", sayUntil: 0, car: -1, down: 0 };
  });
  [...list].sort((a, b) => b.balance - a.balance).forEach((a, i) => (a.rank = i + 1));
  return list;
}
const makeCars = (): Car[] =>
  [[2, 3, "#e5262b"], [1, 1, "#1f6fe0"], [3, 2, "#f59e0b"], [4, 4, "#111827"], [0, 2, "#16a34a"], [3, 0, "#f4f4f0"]].map(([ix, iz, color], i) => ({ x: roadAt(ix as number) + (i % 2 ? -3.4 : 3.4), z: roadAt(iz as number) - 10 - i * 2, rot: i % 2 ? Math.PI : 0, speed: 0, color: color as string, driver: null }));

/* ───────── textures ───────── */

function groundTex() {
  const S = 2048;
  const k = S / (HALF * 2);
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const R = (x: number, z: number, w: number, d: number) => g.fillRect((x + HALF) * k, (z + HALF) * k, w * k, d * k);
  g.fillStyle = "#3b3e44";
  g.fillRect(0, 0, S, S);
  // speckle the asphalt
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = i % 2 ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.06)";
    g.fillRect(Math.random() * S, Math.random() * S, 2, 2);
  }
  // centre lines and zebra crossings
  for (let i = 0; i <= N; i++) {
    const c0 = roadAt(i);
    g.fillStyle = "#e9c84a";
    for (let j = 0; j < N; j++) {
      const a = blockAt(j);
      for (let d = 1; d < BLOCK - 2; d += 4) {
        R(c0 - 0.12, a + d, 0.24, 2.2);
        R(a + d, c0 - 0.12, 2.2, 0.24);
      }
    }
    g.fillStyle = "#e8e8e2";
    for (let j = 0; j < N; j++) {
      const a = blockAt(j);
      for (let s = -5; s <= 5; s += 1.25) {
        R(c0 + s - 0.3, a + 0.2, 0.6, 1.5);
        R(c0 + s - 0.3, a + BLOCK - 1.7, 0.6, 1.5);
        R(a + 0.2, c0 + s - 0.3, 1.5, 0.6);
        R(a + BLOCK - 1.7, c0 + s - 0.3, 1.5, 0.6);
      }
    }
  }
  // blocks: pavement, then the lot
  for (let bx = 0; bx < N; bx++)
    for (let bz = 0; bz < N; bz++) {
      const x = blockAt(bx);
      const z = blockAt(bz);
      g.fillStyle = "#c4bfb3";
      R(x, z, BLOCK, BLOCK);
      g.strokeStyle = "rgba(0,0,0,0.12)";
      g.lineWidth = 1;
      for (let t = 0; t <= BLOCK; t += 2) {
        g.strokeRect((x + t + HALF) * k, (z + HALF) * k, 0.5, WALK * k);
        g.strokeRect((x + t + HALF) * k, (z + BLOCK - WALK + HALF) * k, 0.5, WALK * k);
        g.strokeRect((x + HALF) * k, (z + t + HALF) * k, WALK * k, 0.5);
        g.strokeRect((x + BLOCK - WALK + HALF) * k, (z + t + HALF) * k, WALK * k, 0.5);
      }
      g.fillStyle = bx === 2 && bz === 2 ? "#5fb84a" : "#8d9288";
      R(x + WALK, z + WALK, BLOCK - WALK * 2, BLOCK - WALK * 2);
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function windowTex(v: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 64, 64);
  const r = rng(31 + v * 17);
  const cols = v === 0 ? 2 : v === 1 ? 3 : 4;
  const w = 64 / cols;
  for (let x = 0; x < cols; x++)
    for (let y = 0; y < 2; y++) {
      g.fillStyle = r() < 0.25 ? "#ffe9a8" : r() < 0.5 ? "#3d5a78" : "#5f7f9f";
      g.fillRect(x * w + w * 0.18, y * 32 + 7, w * 0.64, 19);
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/* ───────── the town ───────── */

function Town() {
  const ground = useMemo(groundTex, []);
  const wins = useMemo(() => [0, 1, 2].map(windowTex), []);
  const mats = useMemo(
    () =>
      BUILDINGS.map((b) => {
        const w = Math.max(b.x1 - b.x0, b.z1 - b.z0);
        const side = wins[b.win].clone();
        side.repeat.set(Math.max(1, Math.round(w / 4)), Math.max(1, Math.round(b.h / 3.2)));
        side.needsUpdate = true;
        const wall = new THREE.MeshStandardMaterial({ map: side, color: b.tint, roughness: 0.85 });
        const roof = new THREE.MeshStandardMaterial({ color: new THREE.Color(b.tint).multiplyScalar(0.55), roughness: 1 });
        return [wall, wall, roof, roof, wall, wall];
      }),
    [wins],
  );
  const sky = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 256;
    const g = c.getContext("2d")!;
    const gr = g.createLinearGradient(0, 0, 0, 256);
    [[0, "#2f8fef"], [0.45, "#8fcbff"], [0.5, "#e6f4ff"], [1, "#e6f4ff"]].forEach(([o, col]) => gr.addColorStop(o as number, col as string));
    g.fillStyle = gr;
    g.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const park = { x: blockAt(2) + BLOCK / 2, z: blockAt(2) + BLOCK / 2 };
  return (
    <group>
      <mesh>
        <sphereGeometry args={[420, 24, 16]} />
        <meshBasicMaterial map={sky} side={THREE.BackSide} fog={false} />
      </mesh>
      {/* the sea, then the island */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
        <circleGeometry args={[420, 48]} />
        <meshStandardMaterial color="#2f8fb8" roughness={0.25} metalness={0.2} />
      </mesh>
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <boxGeometry args={[HALF * 2 + 6, 1.2, HALF * 2 + 6]} />
        <meshStandardMaterial color="#d9cfae" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[HALF * 2, HALF * 2]} />
        <meshStandardMaterial map={ground} roughness={0.95} />
      </mesh>
      {BUILDINGS.map((b, i) => (
        <mesh key={i} position={[(b.x0 + b.x1) / 2, b.h / 2, (b.z0 + b.z1) / 2]} material={mats[i]} castShadow receiveShadow>
          <boxGeometry args={[b.x1 - b.x0, b.h, b.z1 - b.z0]} />
        </mesh>
      ))}
      {/* the park: trees and a plinth for whoever is No. 1 */}
      {[[-6, -6], [6, -5], [-5, 6], [7, 7], [0, -8], [-8, 0]].map(([dx, dz], i) => (
        <group key={i} position={[park.x + dx, 0, park.z + dz]} scale={0.8 + (i % 3) * 0.15}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.26, 2.4, 8]} />
            <meshStandardMaterial color="#6b4428" roughness={1} />
          </mesh>
          <mesh position={[0, 3.2, 0]} castShadow>
            <sphereGeometry args={[1.5, 14, 12]} />
            <meshStandardMaterial color={i % 2 ? "#3e9a3c" : "#2f8636"} roughness={1} />
          </mesh>
        </group>
      ))}
      <mesh position={[park.x, 0.5, park.z]} castShadow receiveShadow>
        <cylinderGeometry args={[1.6, 1.9, 1, 24]} />
        <meshStandardMaterial color="#ffc93c" metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  );
}

function CarMesh({ color, reg }: { color: string; reg: (g: THREE.Group | null) => void }) {
  return (
    <group ref={reg}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.9, 0.6, 4.2]} />
        <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={1} clearcoatRoughness={0.15} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.08, -0.2]} castShadow>
        <boxGeometry args={[1.65, 0.55, 2.1]} />
        <meshPhysicalMaterial color="#1c2733" roughness={0.1} clearcoat={1} />
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1.35, 1.35].map((z) => (
          <mesh key={`${sx}${z}`} position={[0.95 * sx, 0.36, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.26, 16]} />
            <meshStandardMaterial color="#17181a" roughness={0.9} />
          </mesh>
        )),
      )}
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.62, 2.11]}>
          <boxGeometry args={[0.4, 0.2, 0.04]} />
          <meshBasicMaterial color="#fff6c8" />
        </mesh>
      ))}
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.62, -2.11]}>
          <boxGeometry args={[0.4, 0.18, 0.04]} />
          <meshBasicMaterial color="#ff2a2a" />
        </mesh>
      ))}
    </group>
  );
}

/* ───────── the game ───────── */

export type Hud = { near: boolean; driving: boolean; ai: boolean; rank: number; speed: number };
export type ChatLine = { who: string; text: string; ai: boolean; at: number };
export type CityApi = { say: (text: string) => void };
type Label = { id: string; name: string; rank: number; ai: boolean; say: string };
type Tags = { els: RefObject<Map<string, HTMLDivElement>>; set: (l: Label[]) => void };

const AFK_AFTER = 12; // seconds without input before the agent takes over

function World({ onHud, onChat, map, api, tags }: { onHud: (h: Hud) => void; onChat: (l: ChatLine) => void; map: RefObject<HTMLCanvasElement | null>; api: RefObject<CityApi | null>; tags: Tags }) {
  const cast = useMemo(makeCast, []);
  const cars = useMemo(makeCars, []);
  const parts = useRef(new Map<string, CritterParts>());
  const carRefs = useRef<(THREE.Group | null)[]>([]);
  const keys = useRef(new Set<string>());
  const cam = useRef({ yaw: 0.6, pitch: 0.32, dist: 9, drag: false, px: 0, py: 0 });
  const idle = useRef(0);
  const clock = useRef(0);
  const hudAt = useRef(0);
  const sun = useRef<THREE.DirectionalLight>(null!);
  const { camera, gl, size } = useThree();
  const you = cast[0];
  // the name tags are plain DOM over the canvas: React owns their text, the frame loop their position
  const bump = useCallback(() => tags.set(cast.map((a) => ({ id: a.id, name: a.name, rank: a.rank, ai: a.ai, say: a.say }))), [cast, tags]);
  useEffect(bump, [bump]);
  const v3 = useMemo(() => new THREE.Vector3(), []);

  const speak = useCallback(
    (a: Actor, text: string) => {
      a.say = text;
      a.sayUntil = clock.current + 4.5;
      onChat({ who: a.name, text, ai: a.ai, at: Date.now() });
      bump();
    },
    [onChat, bump],
  );

  useEffect(() => {
    api.current = {
      say: (text) => {
        idle.current = 0;
        if (you.ai) (you.ai = false), bump();
        speak(you, text);
        // whoever is closest answers
        const near = cast.filter((a) => !a.you && Math.hypot(a.x - you.x, a.z - you.z) < 14).sort((a, b) => Math.hypot(a.x - you.x, a.z - you.z) - Math.hypot(b.x - you.x, b.z - you.z))[0];
        if (near) setTimeout(() => speak(near, REPLIES[Math.floor(Math.random() * REPLIES.length)]), 900);
      },
    };
  }, [api, cast, speak, you, bump]);

  // input: keys, drag to look, wheel to zoom
  useEffect(() => {
    const typing = () => document.activeElement?.tagName === "INPUT";
    const down = (e: KeyboardEvent) => {
      if (typing()) return;
      keys.current.add(e.code);
      idle.current = 0;
      if (e.code === "Space") e.preventDefault();
      if (e.code === "KeyF") toggleCar();
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const el = gl.domElement;
    const pd = (e: PointerEvent) => ((idle.current = 0), (cam.current.drag = true), (cam.current.px = e.clientX), (cam.current.py = e.clientY), el.setPointerCapture(e.pointerId));
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
    let bd = 3.6;
    cars.forEach((c, i) => {
      const d = Math.hypot(c.x - you.x, c.z - you.z);
      if (d < bd && !c.driver) (bd = d), (best = i);
    });
    return best;
  };
  const toggleCar = () => {
    if (you.car >= 0) {
      const c = cars[you.car];
      c.driver = null;
      c.speed = 0;
      you.x = c.x + Math.cos(c.rot) * 1.8;
      you.z = c.z - Math.sin(c.rot) * 1.8;
      collide(you, 0.45);
      you.car = -1;
      return;
    }
    const i = nearestCar();
    if (i < 0) return;
    cars[i].driver = you.id;
    you.car = i;
  };

  /** Walk a pavement route: head for the current corner, then pick one a straight line away. */
  const wander = (a: Actor, dt: number, pace: number) => {
    if (a.wait > 0) {
      a.wait -= dt;
      a.speed = 0;
      return;
    }
    const p = cornerPos(a.corner);
    const dx = p.x - a.x;
    const dz = p.z - a.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.6) {
      const opts = nextCorners(a.corner);
      a.corner = opts[Math.floor(Math.random() * opts.length)];
      if (Math.random() < 0.3) a.wait = 1 + Math.random() * 3;
      return;
    }
    a.speed = pace;
    a.rot = Math.atan2(dx, dz);
    a.x += (dx / d) * pace * dt;
    a.z += (dz / d) * pace * dt;
  };

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const t = (clock.current += dt);
    const K = keys.current;
    const c = cam.current;
    const ax = (K.has("KeyD") || K.has("ArrowRight") ? 1 : 0) - (K.has("KeyA") || K.has("ArrowLeft") ? 1 : 0);
    const az = (K.has("KeyW") || K.has("ArrowUp") ? 1 : 0) - (K.has("KeyS") || K.has("ArrowDown") ? 1 : 0);

    // away from the keys for a while: the agent takes the character over
    idle.current += dt;
    const afk = idle.current > AFK_AFTER && you.car < 0;
    if (afk !== you.ai) {
      you.ai = afk;
      if (afk) (you.corner = nearestCorner(you.x, you.z)), (you.wait = 0);
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
          a.y = 0.05;
          speak(a, "hey!!");
        });
    } else if (you.ai) wander(you, dt, 3.2);
    else {
      const run = K.has("ShiftLeft") || K.has("ShiftRight");
      const fx = -Math.sin(c.yaw), fz = -Math.cos(c.yaw);
      const mx = fx * az + Math.cos(c.yaw) * ax;
      const mz = fz * az - Math.sin(c.yaw) * ax;
      const m = Math.hypot(mx, mz);
      const pace = m ? (run ? 8.5 : 4.5) : 0;
      you.speed += (pace - you.speed) * Math.min(1, dt * 10);
      if (m) {
        const want = Math.atan2(mx, mz);
        you.rot += Math.atan2(Math.sin(want - you.rot), Math.cos(want - you.rot)) * Math.min(1, dt * 12);
        you.x += (mx / m) * you.speed * dt;
        you.z += (mz / m) * you.speed * dt;
      }
      if (K.has("Space") && you.y === 0) you.vy = 7.5;
    }

    // the bots
    cast.forEach((a) => {
      if (a.you) return;
      if (a.down > 0) {
        a.down -= dt;
        a.speed = 0;
      } else {
        wander(a, dt, 2.4 + (hash(a.id) % 10) * 0.12);
        if (!a.say && Math.random() < dt * 0.012) speak(a, LINES[Math.floor(Math.random() * LINES.length)]);
      }
    });

    // gravity, walls, pose
    cast.forEach((a) => {
      if (a.y > 0 || a.vy > 0) {
        a.vy -= 20 * dt;
        a.y = Math.max(0, a.y + a.vy * dt);
        if (a.y === 0) a.vy = 0;
      }
      if (a.car < 0) collide(a, 0.45);
      if (a.say && t > a.sayUntil) (a.say = ""), bump();
      const m = parts.current.get(a.id);
      if (!m) return;
      m.root.visible = a.car < 0;
      m.root.position.set(a.x, a.y, a.z);
      m.root.rotation.y = a.rot;
      a.phase += a.speed * dt * 1.9;
      const amp = Math.min(1, a.speed / 4) * 0.75;
      const sw = Math.sin(a.phase) * amp;
      const lying = a.down > 0 && a.y === 0 ? Math.min(1, (2.6 - a.down) * 4) * Math.min(1, a.down * 3) : 0;
      m.rig.rotation.x = -lying * 1.5 + (a.y > 0 && a.down > 0 ? t * 9 : 0);
      m.rig.position.y = Math.abs(Math.cos(a.phase)) * amp * 0.06 + lying * 0.25;
      m.legL.rotation.x = sw;
      m.legR.rotation.x = -sw;
      m.armL.rotation.x = -sw * 0.9 - (a.y > 0 ? 2.4 : 0);
      m.armR.rotation.x = sw * 0.9 - (a.y > 0 ? 2.4 : 0);
      m.head.rotation.y = Math.sin(t * 0.6 + a.phase * 0.05) * 0.25 * (1 - amp);
      if (m.tail) m.tail.rotation.y = Math.sin(a.phase * 0.5 + t * 2) * 0.35;
    });
    cars.forEach((car, i) => {
      const g = carRefs.current[i];
      if (g) g.position.set(car.x, 0, car.z), (g.rotation.y = car.rot);
    });

    // third-person camera and the sun's shadow box, both centred on you
    const driving = you.car >= 0;
    const dist = c.dist * (driving ? 1.5 : 1);
    const tx = you.x, ty = you.y + (driving ? 1.4 : 1.5), tz = you.z;
    const cx = tx + Math.sin(c.yaw) * Math.cos(c.pitch) * dist;
    const cy = ty + Math.sin(c.pitch) * dist;
    const cz = tz + Math.cos(c.yaw) * Math.cos(c.pitch) * dist;
    camera.position.lerp(new THREE.Vector3(cx, cy, cz), Math.min(1, dt * 9));
    camera.lookAt(tx, ty, tz);
    sun.current.position.set(tx + 30, 48, tz + 22);
    sun.current.target.position.set(tx, 0, tz);
    sun.current.target.updateMatrixWorld();

    // pin each tag over its head; shrink with distance, hide when far or behind the camera
    camera.updateMatrixWorld();
    cast.forEach((a) => {
      const el = tags.els.current.get(a.id);
      if (!el) return;
      const d = Math.hypot(a.x - camera.position.x, a.z - camera.position.z);
      v3.set(a.x, a.y + 2.45, a.z).project(camera);
      if (a.car >= 0 || v3.z > 1 || d > 70 || Math.abs(v3.x) > 1.2 || Math.abs(v3.y) > 1.2) return void (el.style.display = "none");
      const k = Math.max(0.45, Math.min(1.15, 11 / d));
      el.style.display = "";
      el.style.transform = `translate(-50%, -100%) translate(${((v3.x + 1) / 2) * size.width}px, ${((1 - v3.y) / 2) * size.height}px) scale(${k})`;
      el.style.zIndex = String(1000 - Math.round(d));
    });

    // HUD and minimap, a few times a second
    if (t - hudAt.current > 0.12) {
      hudAt.current = t;
      onHud({ near: !driving && nearestCar() >= 0, driving, ai: you.ai, rank: you.rank, speed: driving ? Math.abs(cars[you.car].speed) : you.speed });
      const cv = map.current;
      const g = cv?.getContext("2d");
      if (cv && g) {
        const S = cv.width;
        const k = S / (HALF * 2);
        g.fillStyle = "#2a2d33";
        g.fillRect(0, 0, S, S);
        for (let bx = 0; bx < N; bx++)
          for (let bz = 0; bz < N; bz++) {
            g.fillStyle = bx === 2 && bz === 2 ? "#3f8f3a" : "#6f7480";
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
          g.arc((a.x + HALF) * k, (a.z + HALF) * k, a.rank <= 10 ? 2.6 : 1.8, 0, 7);
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
      <directionalLight ref={sun} color="#fff1d6" intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-45} shadow-camera-right={45} shadow-camera-top={45} shadow-camera-bottom={-45} shadow-camera-far={140} shadow-bias={-0.0004} shadow-normalBias={0.04} />
      <Town />
      {cars.map((car, i) => (
        <CarMesh key={i} color={car.color} reg={(g) => (carRefs.current[i] = g)} />
      ))}
      {cast.map((a) => (
        <Critter key={a.id} id={a.id} kind={a.kind} gold={a.rank <= 10} register={register} />
      ))}
    </>
  );
}

export default function City({ onHud, onChat, map, api }: { onHud: (h: Hud) => void; onChat: (l: ChatLine) => void; map: RefObject<HTMLCanvasElement | null>; api: RefObject<CityApi | null> }) {
  const [labels, setLabels] = useState<Label[]>([]);
  const els = useRef(new Map<string, HTMLDivElement>());
  const tags = useMemo<Tags>(() => ({ els, set: setLabels }), []);
  return (
    <>
      <Canvas shadows style={{ position: "absolute", inset: 0 }} dpr={[1, 1.5]} camera={{ fov: 55, near: 0.2, far: 900, position: [20, 10, 60] }}>
        <color attach="background" args={["#e6f4ff"]} />
        <fog attach="fog" args={["#e6f4ff", 90, 330]} />
        <hemisphereLight args={["#dff1ff", "#8a8f86", 0.95]} />
        <World onHud={onHud} onChat={onChat} map={map} api={api} tags={tags} />
      </Canvas>
      <div className="city__tags">
        {labels.map((a) => (
          <div key={a.id} className="city__tag" style={{ display: "none" }} ref={(el) => void (el ? els.current.set(a.id, el) : els.current.delete(a.id))}>
            {a.say ? <div className="city__say">{a.say}</div> : null}
            <div className="city__name">
              {a.rank <= 10 ? <b className="city__top">TOP {a.rank}</b> : null}
              <span>{a.name}</span>
              <i className={a.ai ? "is-ai" : "is-human"}>{a.ai ? "AI" : "HUMAN"}</i>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
