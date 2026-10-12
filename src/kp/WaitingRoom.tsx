/**
 * The hero, waiting-room version: the top ten holders sit on a row of numbered chairs, No. 1 on
 * the gold one. The seats follow the board in real time. A holder that overtakes another gets
 * up, walks over and punches it out of its chair; the loser lands a few chairs down. A holder
 * that sells is hit much harder: out through the window and gone, a twinkle in the sky.
 * Same rabbits and tween list as BunnyBrawl; only the set and the director differ.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, Vignette } from "@react-three/postprocessing";
import { Bunny, CARROT_GEO, Env, backOut, compact, gradTex, hash, inOut, lin, numberTex, out3, powTex, snap } from "./BunnyBrawl";
import type { BrawlRow, Parts } from "./BunnyBrawl";

const SLOTS = 10;
const SEAT = 0.6; // height of a chair seat above its floor
const WALL_Z = -1.75;
// wide screens: one row of ten. Tall screens: two rows of five, the back row on a riser.
const LAYOUT = { tall: false };
const cols = () => (LAYOUT.tall ? 5 : 10);
const pitch = () => (LAYOUT.tall ? 1.3 : 1.5);
const winY = () => (LAYOUT.tall ? [4.4, 7.2] : [3.0, 6.0]);
const colOf = (i: number) => Math.min(i, SLOTS - 1) % cols();
/** Floor point of chair i. */
const slotPos = (i: number) => {
  const k = Math.min(i, SLOTS - 1);
  if (!LAYOUT.tall) return { x: (k - 4.5) * 1.5, y: 0, z: 0 };
  return { x: ((k % 5) - 2) * 1.3, y: k >= 5 ? 1.1 : 0, z: k >= 5 ? -0.4 : 2.0 };
};
const seat = (i: number) => {
  const s = slotPos(i);
  return { x: s.x, y: s.y + SEAT, z: s.z };
};
const SCALE = (i: number) => 1.08 - Math.min(i, 9) * 0.02;
// ?slow=0.2 plays the room in slow motion (for checking a punch frame by frame)
const SLOW = Number(new URLSearchParams(location.search).get("slow")) || 1;

type Puppet = {
  id: string;
  x: number;
  y: number;
  z: number;
  hop: number;
  hopH: number;
  rotY: number;
  spin: number;
  lean: number;
  arm: number;
  fist: number;
  squash: number;
  yell: number;
  scale: number;
  sit: number; // 1 seated with the feet stuck out, 0 standing
  gone: boolean;
  leaving: boolean;
  seed: number;
};
type Key = "x" | "y" | "z" | "hop" | "rotY" | "spin" | "lean" | "arm" | "fist" | "squash" | "scale" | "yell" | "sit";
type Tween = { p: Puppet; k: Key; a: number | null; b: number; t0: number; d: number; e: (t: number) => number; start?: () => void; done?: () => void; on?: boolean };
type Fx = { smash: (col: number) => void };

function newPuppet(id: string, slot: number): Puppet {
  const s = seat(slot);
  return { id, x: s.x, y: s.y, z: s.z, hop: 0, hopH: 1, rotY: 0, spin: 0, lean: 0, arm: 0, fist: 1, squash: 0, yell: 0, scale: SCALE(slot), sit: 1, gone: false, leaving: false, seed: (hash(id) % 1000) / 1000 };
}

/* ───────── the room ───────── */

function tileTex() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  for (let y = 0; y < 2; y++)
    for (let x = 0; x < 2; x++) {
      g.fillStyle = (x + y) % 2 ? "#e9dfcc" : "#c9d6d2";
      g.fillRect(x * 128, y * 128, 128, 128);
      g.strokeStyle = "rgba(60,50,40,0.25)";
      g.lineWidth = 3;
      g.strokeRect(x * 128, y * 128, 128, 128);
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(40, 20);
  t.anisotropy = 8;
  return t;
}

function sparkTex() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.translate(64, 64);
  g.fillStyle = "#fff";
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 ? 7 : 62;
    const a = (i / 8) * Math.PI * 2;
    g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.closePath();
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const rnd = (() => {
  let s = 23;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
})();
const CLOUDS = Array.from({ length: 7 }, (_, i) => ({ x: -42 + i * 14 + rnd() * 5, y: 12 + rnd() * 8, z: -34 - rnd() * 18, s: 1.6 + rnd() * 1.6, v: 0.15 + rnd() * 0.2 }));
const HILLS: [number, number, number, string][] = [[-30, -38, 20, "#4fae45"], [-6, -46, 26, "#46a23f"], [22, -40, 19, "#58b84c"], [44, -48, 24, "#3f9a3a"], [-52, -50, 24, "#3f9a3a"]];
const SHARDS = 36;

function Chair({ i }: { i: number }) {
  const s = slotPos(i);
  const w = pitch() - 0.3;
  const first = i === 0;
  const shell = first ? <meshStandardMaterial color="#ffc93c" metalness={0.95} roughness={0.22} /> : <meshPhysicalMaterial color={i < 5 ? "#ff8a2b" : "#2a9d98"} roughness={0.38} clearcoat={0.7} clearcoatRoughness={0.3} />;
  const backH = first ? 1.55 : 1.0;
  return (
    <group position={[s.x, s.y, s.z]}>
      <RoundedBox args={[w, 0.12, 1.02]} radius={0.05} smoothness={4} position={[0, SEAT - 0.06, 0]} castShadow receiveShadow>
        {shell}
      </RoundedBox>
      <RoundedBox args={[w, backH, 0.12]} radius={0.05} smoothness={4} position={[0, SEAT + backH / 2 + 0.02, -0.57]} rotation={[-0.1, 0, 0]} castShadow receiveShadow>
        {shell}
      </RoundedBox>
      {first ? (
        <mesh position={[0, SEAT + 0.75, -0.49]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[w - 0.22, 1.1, 0.05]} />
          <meshStandardMaterial color="#b3202a" roughness={0.9} />
        </mesh>
      ) : null}
      <mesh position={[0, SEAT / 2 - 0.06, -0.05]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, SEAT - 0.12, 14]} />
        <meshStandardMaterial color="#aeb6bd" metalness={1} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.03, -0.05]} receiveShadow>
        <boxGeometry args={[w * 0.75, 0.06, 0.8]} />
        <meshStandardMaterial color="#8d959c" metalness={1} roughness={0.35} />
      </mesh>
    </group>
  );
}

function Room({ fx }: { fx: Fx }) {
  const n = cols();
  const W = n * pitch();
  const [y0, y1] = winY();
  const tiles = useMemo(tileTex, []);
  const nums = useMemo(() => Array.from({ length: SLOTS }, (_, i) => numberTex(i + 1)), []);
  const sky = useMemo(() => gradTex([[0, "#2f8fef"], [0.42, "#7cc4ff"], [0.5, "#d8f0ff"], [1, "#d8f0ff"]]), []);
  const clouds = useRef<THREE.Group>(null!);
  const panes = useRef<(THREE.Mesh | null)[]>([]);
  const mendAt = useRef<number[]>([]);
  const shards = useRef<THREE.InstancedMesh>(null!);
  const bits = useRef(Array.from({ length: SHARDS }, () => ({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, r: 0, vr: 0, s: 0, life: 0 })));
  const clock = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // the pane over a chair bursts when a seller goes through it; it is mended a few seconds later
  fx.smash = (col: number) => {
    const pane = panes.current[col];
    if (pane) pane.visible = false;
    mendAt.current[col] = clock.current + 6;
    const cx = (col - (n - 1) / 2) * pitch();
    bits.current.forEach((b) => {
      b.x = cx + (rnd() - 0.5) * (pitch() - 0.3);
      b.y = y0 + 0.2 + rnd() * (y1 - y0 - 0.4);
      b.z = WALL_Z;
      b.vx = (rnd() - 0.5) * 5;
      b.vy = 1 + rnd() * 5;
      b.vz = -2 - rnd() * 9 + (rnd() < 0.3 ? 8 : 0);
      b.r = rnd() * 6;
      b.vr = (rnd() - 0.5) * 20;
      b.s = 0.12 + rnd() * 0.3;
      b.life = 1.4;
    });
  };

  useFrame((_, dt) => {
    clock.current += dt;
    clouds.current.children.forEach((c, i) => {
      c.position.x += CLOUDS[i].v * dt;
      if (c.position.x > 60) c.position.x = -60;
    });
    mendAt.current.forEach((at, col) => {
      if (at && clock.current > at) {
        mendAt.current[col] = 0;
        const pane = panes.current[col];
        if (pane) pane.visible = true;
      }
    });
    bits.current.forEach((b, i) => {
      if (b.life > 0) {
        b.life -= dt;
        b.vy -= 14 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.z += b.vz * dt;
        b.r += b.vr * dt;
      }
      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.set(b.r, b.r * 0.7, b.r * 1.3);
      dummy.scale.setScalar(b.life > 0 ? b.s : 0);
      dummy.updateMatrix();
      shards.current.setMatrixAt(i, dummy.matrix);
    });
    shards.current.instanceMatrix.needsUpdate = true;
  });

  const wall = <meshStandardMaterial color="#f1e7d3" roughness={0.95} />;
  const side = 40 - W / 2;
  return (
    <group>
      {/* outside the window */}
      <mesh>
        <sphereGeometry args={[110, 32, 20]} />
        <meshBasicMaterial map={sky} side={THREE.BackSide} fog={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -40]}>
        <circleGeometry args={[70, 48]} />
        <meshStandardMaterial color="#5fb845" roughness={1} />
      </mesh>
      {HILLS.map(([x, z, r, c], i) => (
        <mesh key={i} position={[x, -r * 0.1, z - 14]} scale={[1.5, 0.3, 1]}>
          <sphereGeometry args={[r, 32, 20]} />
          <meshStandardMaterial color={c} roughness={1} />
        </mesh>
      ))}
      <group ref={clouds}>
        {CLOUDS.map((c, i) => (
          <group key={i} position={[c.x, c.y, c.z]} scale={c.s}>
            {[[0, 0, 0, 1.3], [1.3, -0.1, 0.2, 1], [-1.3, -0.15, 0.1, 0.95], [0.5, 0.55, -0.2, 0.9], [-0.6, 0.4, 0, 0.8]].map(([x, y, z, r], k) => (
              <mesh key={k} position={[x, y, z]} scale={[1, 0.75, 1]}>
                <sphereGeometry args={[r, 16, 12]} />
                <meshStandardMaterial color="#ffffff" roughness={1} emissive="#ffffff" emissiveIntensity={0.25} fog={false} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* floor and the back wall, built round the window opening */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, WALL_Z + 20]} receiveShadow>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial map={tiles} roughness={0.32} metalness={0.05} />
      </mesh>
      <mesh position={[0, y0 / 2, WALL_Z]} receiveShadow>
        <boxGeometry args={[80, y0, 0.3]} />
        <meshStandardMaterial color="#3f8f8a" roughness={0.8} />
      </mesh>
      <mesh position={[0, y1 + 4, WALL_Z]}>
        <boxGeometry args={[80, 8, 0.3]} />
        {wall}
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2 + side / 2), (y0 + y1) / 2, WALL_Z]} receiveShadow>
          <boxGeometry args={[side, y1 - y0, 0.3]} />
          {wall}
        </mesh>
      ))}
      <mesh position={[0, y0, WALL_Z + 0.05]} castShadow>
        <boxGeometry args={[80, 0.14, 0.46]} />
        <meshStandardMaterial color="#fbf6ea" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.14, WALL_Z + 0.18]}>
        <boxGeometry args={[80, 0.28, 0.06]} />
        <meshStandardMaterial color="#2c6662" roughness={0.7} />
      </mesh>
      {Array.from({ length: n + 1 }, (_, i) => (
        <mesh key={i} position={[(i - n / 2) * pitch(), (y0 + y1) / 2, WALL_Z]}>
          <boxGeometry args={[0.14, y1 - y0, 0.36]} />
          <meshStandardMaterial color="#fbf6ea" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, y1, WALL_Z]}>
        <boxGeometry args={[W + 0.14, 0.14, 0.36]} />
        <meshStandardMaterial color="#fbf6ea" roughness={0.6} />
      </mesh>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} ref={(m) => void (panes.current[i] = m)} position={[(i - (n - 1) / 2) * pitch(), (y0 + y1) / 2, WALL_Z]}>
          <planeGeometry args={[pitch() - 0.14, y1 - y0 - 0.14]} />
          <meshPhysicalMaterial color="#cfeeff" transparent opacity={0.22} roughness={0.02} metalness={0} envMapIntensity={2.5} depthWrite={false} />
        </mesh>
      ))}
      <instancedMesh ref={shards} args={[undefined, undefined, SHARDS]} frustumCulled={false}>
        <circleGeometry args={[1, 3]} />
        <meshPhysicalMaterial color="#dff4ff" transparent opacity={0.7} roughness={0.05} side={THREE.DoubleSide} envMapIntensity={3} />
      </instancedMesh>

      {LAYOUT.tall ? (
        <mesh position={[0, 0.55, -0.4]} castShadow receiveShadow>
          <boxGeometry args={[W + 1.4, 1.1, 2.3]} />
          <meshStandardMaterial color="#b98a5a" roughness={0.75} />
        </mesh>
      ) : null}
      {Array.from({ length: SLOTS }, (_, i) => {
        const s = slotPos(i);
        return (
          <group key={i}>
            <Chair i={i} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[s.x, s.y + 0.02, s.z + (LAYOUT.tall ? 0.92 : 1.75)]}>
              <circleGeometry args={[LAYOUT.tall ? 0.2 : 0.36, 28]} />
              <meshBasicMaterial map={nums[i]} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      <Carrot />

      {/* a water cooler at the head of the row, a plant at the tail */}
      <group position={[-(W / 2 + 1.25), 0, -0.85]}>
        <RoundedBox args={[0.8, 1.9, 0.8]} radius={0.06} smoothness={4} position={[0, 0.95, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color="#f4f6f8" roughness={0.3} clearcoat={0.6} />
        </RoundedBox>
        <mesh position={[0, 2.45, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.34, 1.0, 24]} />
          <meshPhysicalMaterial color="#7cc8ff" transparent opacity={0.55} roughness={0.05} envMapIntensity={2} />
        </mesh>
        {[-0.14, 0.14].map((x, k) => (
          <mesh key={x} position={[x, 1.35, 0.42]}>
            <boxGeometry args={[0.1, 0.12, 0.08]} />
            <meshStandardMaterial color={k ? "#e5262b" : "#1f6fe0"} roughness={0.4} />
          </mesh>
        ))}
      </group>
      <group position={[W / 2 + 1.25, 0, -0.85]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.46, 0.34, 0.8, 24]} />
          <meshStandardMaterial color="#c8643c" roughness={0.8} />
        </mesh>
        {[[0, 1.7, 0, 0], [0.3, 1.45, 0.1, 0.5], [-0.3, 1.5, -0.05, -0.5], [0.1, 1.4, 0.3, 0.2], [-0.12, 1.55, -0.28, -0.2]].map(([x, y, z, r], k) => (
          <mesh key={k} position={[x, y, z]} rotation={[z * 1.4, 0, -r]} scale={[0.34, 1, 0.12]} castShadow>
            <sphereGeometry args={[0.95, 14, 12]} />
            <meshStandardMaterial color={k % 2 ? "#2f8f3f" : "#3aa64a"} roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** The prize over the gold chair: a golden carrot. */
function Carrot() {
  const g = useRef<THREE.Group>(null!);
  const s = seat(0);
  useFrame(({ clock }) => {
    g.current.rotation.y = clock.elapsedTime * 1.2;
    g.current.position.y = s.y + 3.5 + Math.sin(clock.elapsedTime * 2) * 0.12;
  });
  return (
    <group ref={g} position={[s.x, s.y + 3.5, s.z]} rotation={[0, 0, 0.18]}>
      <mesh geometry={CARROT_GEO} castShadow>
        <meshStandardMaterial color="#ffb21a" metalness={1} roughness={0.16} emissive="#8a4b00" emissiveIntensity={0.35} />
      </mesh>
      {[-0.09, 0, 0.09].map((x) => (
        <mesh key={x} position={[x, 0.6, 0]} rotation={[0, 0, -x * 4]} scale={[1, 1, 0.5]}>
          <capsuleGeometry args={[0.05, 0.26, 4, 10]} />
          <meshPhysicalMaterial color="#35b04a" roughness={0.4} clearcoat={0.6} />
        </mesh>
      ))}
      <pointLight color="#ffd37a" intensity={6} distance={5} />
    </group>
  );
}

/* ───────── the director ───────── */

type DirProps = { rows: BrawlRow[]; sold: string[]; cast: string[]; setCast: (f: (c: string[]) => string[]) => void; fx: Fx };

function Director({ rows, sold, cast, setCast, fx }: DirProps) {
  // the numbers on the tags follow the room, not the incoming board: a rank changes when the punch lands
  const [ranks, setRanks] = useState<string[]>([]);
  const onOrder = (ids: string[]) => setRanks(ids);
  const parts = useRef(new Map<string, Parts>());
  const puppets = useRef(new Map<string, Puppet>());
  const tweens = useRef<Tween[]>([]);
  const timers = useRef<{ at: number; fn: () => void }[]>([]);
  const order = useRef<string[]>([]); // who sits where now
  const target = useRef<string[]>([]);
  const soldSet = useRef(new Set<string>());
  const busyUntil = useRef(0);
  const now = useRef(0);
  const shake = useRef(0);
  const real = useRef(0);
  const stopUntil = useRef(0);
  const pow = useRef<THREE.Mesh>(null!);
  const powAt = useRef(-10);
  const powMaps = useMemo(() => ({ pow: powTex(), sold: powTex("SOLD!", 60) }), []);
  const star = useRef<THREE.Mesh>(null!);
  const starAt = useRef(-10);
  const starMap = useMemo(sparkTex, []);
  const { camera, size } = useThree();

  target.current = rows.slice(0, SLOTS).map((r) => r.id);
  soldSet.current = new Set(sold);

  // first board: everyone is simply seated
  useEffect(() => {
    if (order.current.length || !target.current.length) return;
    order.current = [...target.current];
    order.current.forEach((id, i) => puppets.current.set(id, newPuppet(id, i)));
    setCast(() => [...order.current]);
    onOrder([...order.current]);
  });

  const tw = (p: Puppet, k: Key, b: number, delay: number, d: number, e = out3, done?: () => void) => tweens.current.push({ p, k, a: null, b, t0: now.current + delay, d, e, done });
  const after = (delay: number, fn: () => void) => timers.current.push({ at: now.current + delay, fn });
  const hopTo = (p: Puppet, x: number, y: number, z: number, delay: number, d: number, h = 0.9) => {
    tw(p, "x", x, delay, d, inOut);
    tw(p, "y", y, delay, d, inOut);
    tw(p, "z", z, delay, d, inOut);
    tweens.current.push({ p, k: "hop", a: 0, b: 1, t0: now.current + delay, d, e: lin, start: () => (p.hopH = h), done: () => (p.hop = 0) });
    tweens.current.push({ p, k: "squash", a: 0.28, b: 0, t0: now.current + delay + d, d: 0.22, e: backOut });
  };
  const remove = (p: Puppet) => {
    p.gone = true;
    puppets.current.delete(p.id);
    setCast((c) => c.filter((x) => x !== p.id));
  };
  /** Fell out of the ten without selling: bundled out of the room to the side. */
  const flyOff = (p: Puppet, delay: number, dir: number) => {
    p.leaving = true;
    tw(p, "x", p.x + dir * 14, delay, 0.9, lin);
    tw(p, "y", p.y + 5, delay, 0.9, out3);
    tw(p, "spin", p.spin + Math.PI * 6, delay, 0.9, lin, () => remove(p));
  };
  /** Sold: up through the window over its chair and out of sight, then a twinkle. */
  const launch = (p: Puppet, delay: number, col: number) => {
    const [y0, y1] = winY();
    p.leaving = true;
    tw(p, "y", (y0 + y1) / 2 - 0.8, delay, 0.16, lin);
    tw(p, "z", WALL_Z, delay, 0.16, lin);
    after(delay + 0.14, () => fx.smash(col));
    tw(p, "z", -82, delay + 0.16, 1.25, lin);
    tw(p, "y", 30, delay + 0.16, 1.25, out3);
    tw(p, "x", p.x * 1.9, delay + 0.16, 1.25, lin);
    tw(p, "scale", 0.3, delay + 0.16, 1.25, lin);
    tw(p, "spin", p.spin + Math.PI * 11, delay, 1.41, lin, () => {
      star.current.position.set(p.x, p.y + 1, p.z);
      starAt.current = now.current;
      remove(p);
    });
  };
  /** Gets up, lands in front of chair i and turns on whoever sits there. */
  const approach = (a: Puppet, i: number) => {
    const s = slotPos(i);
    tw(a, "sit", 0, 0, 0.15);
    hopTo(a, s.x + 0.95, s.y, s.z + 1.0, 0, 0.42, 1.2 + Math.abs(a.x - s.x) * 0.12);
    tw(a, "rotY", -0.8, 0, 0.3);
  };
  /** Wind-up and a leaping punch that lands 0.71 s in; `power` scales the glove, the shake and the freeze. */
  const punch = (a: Puppet, v: Puppet, i: number, power: number, burst: THREE.Texture) => {
    tw(a, "yell", 1, 0.38, 0.14);
    tw(a, "yell", 0, 1.0, 0.3);
    tw(v, "yell", 1, power > 1 ? 0.45 : 0.72, 0.06);
    if (!v.leaving) tw(v, "yell", 0, 1.5, 0.3);
    tw(a, "arm", 1.25 * power, 0.4, 0.07, snap);
    tw(a, "lean", -0.4, 0.4, 0.07, snap);
    tw(a, "squash", 0.3, 0.4, 0.07, snap);
    // the victim sits higher than the floor, so the punch is thrown at the top of a jump
    tweens.current.push({ p: a, k: "hop", a: 0, b: 1, t0: now.current + 0.56, d: 0.3, e: lin, start: () => (a.hopH = SEAT + 0.15), done: () => (a.hop = 0) });
    tw(a, "arm", -1.75, 0.66, 0.05, lin);
    tw(a, "lean", 0.5, 0.66, 0.05, lin);
    tw(a, "squash", -0.3, 0.66, 0.05, lin);
    tw(a, "squash", 0, 0.82, 0.25, backOut);
    tw(a, "fist", 2.6 * power, 0.66, 0.05, lin, () => {
      shake.current = power;
      stopUntil.current = real.current + 0.1 * power;
      // the whole row flinches and howls, rippling out from the hit
      order.current.forEach((qid, k) => {
        const q = puppets.current.get(qid);
        if (!q || q === a || q === v) return;
        const dl = 0.03 * Math.abs(k - i);
        tw(q, "yell", 0.85, dl, 0.06, snap);
        tw(q, "yell", 0, dl + 0.55, 0.25);
        tweens.current.push({ p: q, k: "squash", a: 0.38, b: 0, t0: now.current + dl, d: 0.35, e: backOut });
      });
      powAt.current = now.current;
      (pow.current.material as THREE.MeshBasicMaterial).map = burst;
      pow.current.position.set(v.x + 0.3, v.y + 1.25, v.z + 1.2);
      pow.current.userData.k = power;
    });
    tweens.current.push({ p: v, k: "squash", a: 0.65, b: -0.45, t0: now.current + 0.71, d: 0.1, e: snap });
    tweens.current.push({ p: v, k: "squash", a: -0.45, b: 0, t0: now.current + 0.81, d: 0.6, e: lin });
  };
  /** Drops the guard and hops into chair i. */
  const takeSeat = (a: Puppet, i: number, delay: number, cheer: boolean) => {
    const s = seat(i);
    tw(a, "fist", 1, delay - 0.1, 0.2);
    tw(a, "arm", 0, delay - 0.1, 0.25);
    tw(a, "lean", 0, delay - 0.1, 0.25);
    tw(a, "rotY", 0, delay, 0.3);
    hopTo(a, s.x, s.y, s.z, delay, 0.36, 0.9);
    if (cheer) hopTo(a, s.x, s.y, s.z, delay + 0.41, 0.34, 0.75);
    tw(a, "sit", 1, delay + 0.2, 0.2);
    tw(a, "scale", SCALE(i), delay, 0.4);
  };
  /** Everyone not in `skip` scoots to the chair the order gives them. */
  const settle = (delay: number, skip: Set<string>) =>
    order.current.forEach((id, k) => {
      if (skip.has(id)) return;
      const p = puppets.current.get(id);
      if (!p) return;
      const s = seat(k);
      if (Math.abs(p.x - s.x) + Math.abs(p.y - s.y) + Math.abs(p.z - s.z) > 0.03) hopTo(p, s.x, s.y, s.z, delay + (k % 4) * 0.06, 0.36, 0.6);
      tw(p, "scale", SCALE(k), delay, 0.4);
    });

  /** One event: a sale first if there is one, otherwise one overtake. */
  const step = () => {
    const cur = order.current;
    const want = target.current;
    const alive = (id?: string) => {
      const p = id ? puppets.current.get(id) : undefined;
      return p && !p.leaving ? p : undefined;
    };

    // a holder in the room has sold: whoever inherits the chair sends it through the window
    const si = cur.findIndex((id) => soldSet.current.has(id) && !want.includes(id) && alive(id));
    if (si !== -1) {
      const v = puppets.current.get(cur[si])!;
      const a = [want[si], cur[si + 1], cur[si - 1]].map((id) => (id !== v.id ? alive(id) : undefined)).find(Boolean);
      order.current = cur.filter((x) => x !== v.id);
      if (a) {
        approach(a, si);
        punch(a, v, si, 1.7, powMaps.sold);
        launch(v, 0.72, colOf(si));
        const ai = order.current.indexOf(a.id);
        if (ai !== -1) takeSeat(a, ai, 1.15, false);
      } else launch(v, 0.1, colOf(si));
      settle(1.1, new Set(a ? [a.id] : []));
      after(a ? 0.74 : 0.12, () => onOrder([...order.current]));
      busyUntil.current = now.current + 2.1;
      return true;
    }

    let i = 0;
    while (i < want.length && cur[i] === want[i]) i++;
    if (i >= want.length) {
      // the ten match; anyone left past the end is shooed out
      const extra = cur.slice(want.length);
      if (!extra.length) return false;
      extra.forEach((id, k) => {
        const p = puppets.current.get(id);
        if (p) flyOff(p, k * 0.1, 1);
      });
      order.current = cur.slice(0, want.length);
      onOrder([...order.current]);
      busyUntil.current = now.current + 0.6;
      return true;
    }
    const aId = want[i];
    const vId = cur[i];
    let a = puppets.current.get(aId);
    if (a?.leaving) {
      busyUntil.current = now.current + 0.2;
      return true;
    }
    if (!a) {
      // a new holder walks in from the door on the right
      a = newPuppet(aId, SLOTS - 1);
      const last = slotPos(SLOTS - 1);
      a.x = last.x + 5;
      a.y = last.y;
      a.z = last.z + 1;
      a.sit = 0;
      puppets.current.set(aId, a);
      setCast((c) => (c.includes(aId) ? c : [...c, aId]));
    }
    const next = cur.filter((x) => x !== aId);
    next.splice(i, 0, aId);
    const dropped = next.slice(SLOTS);
    order.current = next.slice(0, SLOTS);
    const v = vId ? alive(vId) : undefined;

    if (!v) {
      // an empty chair: just take it
      takeSeat(a, i, 0.05, false);
      settle(0.3, new Set([a.id]));
      busyUntil.current = now.current + 0.8;
      onOrder([...order.current]);
      return true;
    }
    approach(a, i);
    punch(a, v, i, 1, powMaps.pow);
    // the loser lands in its new chair, or leaves the room if it fell out of the ten
    const vi = order.current.indexOf(v.id);
    if (vi === -1) flyOff(v, 0.72, 1);
    else {
      const to = seat(vi);
      hopTo(v, to.x, to.y, to.z, 0.72, 0.75, 2.6);
      tw(v, "scale", SCALE(vi), 0.72, 0.4);
      tweens.current.push({ p: v, k: "spin", a: 0, b: -Math.PI * 4, t0: now.current + 0.72, d: 0.75, e: out3, done: () => (v.spin = 0) });
    }
    dropped.forEach((id, k) => {
      const p = puppets.current.get(id);
      if (p && p !== v) flyOff(p, 0.9 + k * 0.1, 1);
    });
    takeSeat(a, i, 0.95, true);
    settle(0.85, new Set([a.id, v.id]));
    after(0.74, () => onOrder([...order.current]));
    busyUntil.current = now.current + 1.9;
    return true;
  };

  useFrame(({ clock }, dt) => {
    real.current = clock.elapsedTime;
    const t = (now.current += Math.min(dt, 0.05) * SLOW * (real.current < stopUntil.current ? 0.04 : 1));
    if (t >= busyUntil.current && order.current.length) step();

    for (let n = timers.current.length - 1; n >= 0; n--) if (t >= timers.current[n].at) timers.current.splice(n, 1)[0].fn();
    const list = tweens.current;
    for (let n = list.length - 1; n >= 0; n--) {
      const w = list[n];
      if (t < w.t0) continue;
      if (!w.on) {
        w.on = true;
        w.start?.();
      }
      if (w.a === null) w.a = w.p[w.k];
      const u = w.d <= 0 ? 1 : Math.min(1, (t - w.t0) / w.d);
      w.p[w.k] = w.a + (w.b - w.a) * w.e(u);
      if (u >= 1) {
        list.splice(n, 1);
        w.done?.();
      }
    }

    // pose every rabbit
    const leader = order.current[0];
    const second = order.current[1];
    puppets.current.forEach((p, id) => {
      const m = parts.current.get(id);
      if (!m) return;
      const ph = t * 3.2 + p.seed * 20;
      m.root.visible = !p.gone;
      m.root.position.set(p.x, p.y + Math.sin(Math.PI * p.hop) * p.hopH, p.z);
      m.root.scale.setScalar(p.scale);
      // the row glares up the line at the gold chair; No. 2 leans in hardest
      const glare = id === leader ? 0.12 : id === second ? -0.34 : -0.14;
      m.root.rotation.set(0, p.rotY + glare * (p.leaving ? 0 : 1), 0);
      // seated: slumped back a little; the tumble turns about the belly, not the feet
      m.body.rotation.set(p.lean + p.spin - 0.1 * p.sit, 0, Math.sin(ph * 0.5) * 0.04);
      m.body.position.set(0, 0.75 - 0.75 * Math.cos(p.spin), -0.75 * Math.sin(p.spin));
      const sq = p.squash + Math.sin(ph * 0.6) * 0.025;
      m.body.scale.set(1 + sq * 0.5, 1 - sq * 0.55, 1 + sq * 0.5);
      // bored feet: stuck straight out and kicking in turn
      const kick = Math.sin(ph * 0.9) * 0.32 * p.sit;
      m.footL.position.z = m.footR.position.z = 0.12 + 0.26 * p.sit;
      m.footL.rotation.x = -1.0 * p.sit + kick;
      m.footR.rotation.x = -1.0 * p.sit - kick;
      const wob = Math.sin(ph * 1.3) * 0.12 + Math.sin(Math.PI * p.hop) * 0.5;
      m.earL.rotation.set(-wob * 0.8 - p.lean, 0, 0.16 + wob * 0.3);
      m.earR.rotation.set(-wob * 0.6 - p.lean, 0, -0.16 - wob * 0.3);
      const flop = Math.sin(ph * 1.3 - 0.9) * 0.2 + Math.sin(Math.PI * p.hop) * 0.9 + p.squash * 1.2;
      m.earL2.rotation.set(-flop - p.lean * 0.8, 0, flop * 0.25);
      m.earR2.rotation.set(-flop * 0.8 - p.lean * 0.8, 0, -flop * 0.25);
      m.armR.rotation.set(p.arm, 0, 0.35 * (1 - Math.min(1, Math.abs(p.arm))));
      // No. 2 shakes a fist at the gold chair while it waits
      m.armL.rotation.set(id === second && p.arm === 0 ? -1.2 + Math.sin(ph * 2) * 0.5 : Math.sin(ph) * 0.2, 0, -0.35);
      m.glove.scale.setScalar(p.fist);
      if (p.yell > 0.5) {
        m.root.position.x += Math.sin(t * 95 + p.seed * 9) * 0.03 * p.yell;
        m.body.rotation.z += Math.sin(t * 80 + p.seed * 5) * 0.06 * p.yell;
      }
      const pin = 1 - 0.6 * p.yell;
      m.pupL.scale.set(pin, pin, 1);
      m.pupR.scale.set(pin, pin, 1);
      const blink = (t * 0.7 + p.seed * 7) % 3.1 < 0.1 ? 1.15 : p.yell * -0.25;
      m.lidL.rotation.x = m.lidR.rotation.x = 0.2 + blink;
      const talk = id === second && p.yell === 0 ? 0.25 + Math.max(0, Math.sin(ph * 2.3)) * 0.35 : 0.12;
      const open = Math.max(talk, p.yell);
      m.mouth.scale.set(0.8 + open * 0.45, 0.22 + open * 1.25, 1);
      m.mouth.position.y = 1.03 - open * 0.07;
      m.crown.visible = id === leader;
    });

    // the comic burst, the twinkle and the camera
    const pa = t - powAt.current;
    pow.current.visible = pa >= 0 && pa < 0.5;
    if (pow.current.visible) {
      pow.current.scale.setScalar(backOut(Math.min(1, pa / 0.14)) * 1.9 * (pow.current.userData.k > 1 ? 1.5 : 1));
      (pow.current.material as THREE.MeshBasicMaterial).opacity = 1 - Math.max(0, (pa - 0.3) / 0.2);
      pow.current.quaternion.copy(camera.quaternion);
      pow.current.rotation.z += Math.sin(pa * 40) * 0.05;
    }
    const sa = t - starAt.current;
    star.current.visible = sa >= 0 && sa < 0.7;
    if (star.current.visible) {
      star.current.scale.setScalar(Math.sin((sa / 0.7) * Math.PI) * 9);
      star.current.quaternion.copy(camera.quaternion);
      star.current.rotation.z += sa * 2.5;
    }
    shake.current = Math.max(0, shake.current - dt * 4);
    const cam = camera as THREE.PerspectiveCamera;
    const s = shake.current * 0.12;
    const fov = LAYOUT.tall ? 46 : 32;
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    const span = LAYOUT.tall ? 8.2 : SLOTS * 1.5 + 4.2;
    const hf = 2 * Math.atan(Math.tan((fov * Math.PI) / 360) * (size.width / size.height));
    const dist = Math.max(11, span / 2 / Math.tan(hf / 2));
    if (LAYOUT.tall) {
      cam.position.set(Math.sin(t * 0.25) * 0.3 + Math.sin(t * 61) * s, 7.2 + Math.cos(t * 53) * s, dist + 3);
      cam.lookAt(0, 2.9, 0);
    } else {
      cam.position.set(Math.sin(t * 0.25) * 0.5 + Math.sin(t * 61) * s, 3.4 + dist * 0.1 + Math.cos(t * 53) * s, dist);
      cam.lookAt(0, 2.7, 0);
    }
  });

  const register = useMemo(() => (id: string, p: Parts | null) => void (p ? parts.current.set(id, p) : parts.current.delete(id)), []);
  const info = useRef(new Map<string, BrawlRow>());
  rows.forEach((r) => info.current.set(r.id, r));
  return (
    <>
      {cast.map((id) => {
        const r = ranks.indexOf(id);
        const row = info.current.get(id);
        return (
          <Bunny
            key={id}
            id={id}
            register={register}
            label={
              r === -1 ? null : (
                <div className={`brawl__tag${r === 0 ? " is-first" : ""}`}>
                  <b>#{r + 1}</b>
                  <span>{row?.name ?? id}</span>
                  <i>{row ? compact(row.balance) : ""}</i>
                </div>
              )
            }
          />
        );
      })}
      <mesh ref={pow} visible={false} renderOrder={10}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={powMaps.pow} transparent depthTest={false} />
      </mesh>
      <mesh ref={star} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={starMap} transparent fog={false} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </>
  );
}

/** Picks the layout from the canvas shape; the room and its cast are rebuilt when it flips. */
function Scene(props: Omit<DirProps, "fx">) {
  const tall = useThree((s) => s.size.width / s.size.height < 0.9);
  LAYOUT.tall = tall;
  const fx = useRef<Fx>({ smash: () => {} });
  return (
    <group key={tall ? "tall" : "wide"}>
      <Room fx={fx.current} />
      <Director {...props} fx={fx.current} />
    </group>
  );
}

/**
 * `rows` is the board (top ten, best first). `sold` lists holders that sold: one of them leaving
 * the board goes out through the window instead of down the row. `fx` turns the post effects off.
 */
export default function WaitingRoom({ rows, sold = [], fx = true }: { rows: BrawlRow[]; sold?: string[]; fx?: boolean }) {
  const [cast, setCast] = useState<string[]>([]);
  return (
    <Canvas shadows style={{ position: "absolute", inset: 0 }} dpr={[1, 1.75]} camera={{ fov: 32, near: 0.1, far: 240, position: [0, 4, 18] }} gl={{ antialias: !fx, toneMappingExposure: 0.92 }}>
      <color attach="background" args={["#d8f0ff"]} />
      <fog attach="fog" args={["#d8f0ff", 40, 100]} />
      <Env />
      <hemisphereLight args={["#fff6e6", "#b9c8c4", 0.7]} />
      {/* ceiling light from the front right, daylight through the window as a rim */}
      <directionalLight position={[7, 13, 9]} color="#fff1d6" intensity={2.1} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-13} shadow-camera-right={13} shadow-camera-top={11} shadow-camera-bottom={-5} shadow-bias={-0.0003} shadow-normalBias={0.03} shadow-radius={6} />
      <directionalLight position={[-6, 8, -12]} color="#cfe8ff" intensity={1.5} />
      <Scene rows={rows} sold={sold} cast={cast} setCast={setCast} />
      {fx ? (
        <EffectComposer multisampling={4}>
          <N8AO aoRadius={0.7} intensity={2.2} distanceFalloff={0.6} halfRes quality="performance" />
          <Bloom mipmapBlur luminanceThreshold={0.92} intensity={0.3} />
          <Vignette offset={0.25} darkness={0.45} />
        </EffectComposer>
      ) : null}
    </Canvas>
  );
}
