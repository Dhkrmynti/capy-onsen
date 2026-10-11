/**
 * The hero: the top ten holders as a queue of cartoon rabbits fighting for the No. 1 podium.
 * The queue follows the board in real time. When a holder overtakes another, its rabbit hops
 * over, winds up and punches the one it replaces; that one is sent flying to its new place and
 * the rest shuffle along. A holder that drops out of the ten is punched off the stage, a new
 * one runs in. Original characters built from primitives (no models, no downloads), driven by a
 * small tween list in one useFrame.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";

export type BrawlRow = { id: string; name: string; balance: number };

const SLOTS = 10;
const GAP = 1.5;
const STEP_H = [1.5, 1.0, 0.7, 0.45, 0.36, 0.28, 0.2, 0.14, 0.08, 0.04];
// wide screens: a line across the stage. Tall screens: a zigzag running back into the picture, No. 1 nearest.
const LAYOUT = { tall: false };
const slotPos = (i: number) => {
  const k = Math.min(i, SLOTS - 1);
  return LAYOUT.tall ? { x: k === 0 ? 0 : k % 2 ? -1.25 : 1.25, y: STEP_H[k], z: 3.6 - k * 1.15 } : { x: (k - (SLOTS - 1) / 2) * GAP, y: STEP_H[k], z: 0 };
};
const SCALE = (i: number) => 1.12 - Math.min(i, 9) * 0.03;

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
const compact = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(Math.round(n)));

/* ───────── the puppet state and its tweens ───────── */

type Puppet = {
  id: string;
  x: number;
  y: number;
  z: number;
  hop: number; // 0..1 along a jump; height = sin(pi * hop) * hopH
  hopH: number;
  rotY: number;
  spin: number; // tumble when punched
  lean: number;
  arm: number; // punching arm: 0 down, + back, - forward
  fist: number; // glove scale
  squash: number; // 0 none, 1 flat
  scale: number;
  gone: boolean;
  leaving: boolean;
  seed: number;
};
type Key = "x" | "y" | "z" | "hop" | "rotY" | "spin" | "lean" | "arm" | "fist" | "squash" | "scale";
type Tween = { p: Puppet; k: Key; a: number | null; b: number; t0: number; d: number; e: (t: number) => number; start?: () => void; done?: () => void; on?: boolean };

const out3 = (t: number) => 1 - Math.pow(1 - t, 3);
const inOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lin = (t: number) => t;
const backOut = (t: number) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);

function newPuppet(id: string, slot: number): Puppet {
  const s = slotPos(slot);
  return { id, x: s.x, y: s.y, z: s.z, hop: 0, hopH: 1, rotY: 0, spin: 0, lean: 0, arm: 0, fist: 1, squash: 0, scale: SCALE(slot), gone: false, leaving: false, seed: (hash(id) % 1000) / 1000 };
}

/* ───────── one rabbit ───────── */

type Parts = { root: THREE.Group; body: THREE.Group; earL: THREE.Group; earR: THREE.Group; armR: THREE.Group; armL: THREE.Group; glove: THREE.Mesh; lids: THREE.Group; crown: THREE.Group };

function Bunny({ id, register, label }: { id: string; register: (id: string, p: Parts | null) => void; label: ReactNode }) {
  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const earL = useRef<THREE.Group>(null!);
  const earR = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const glove = useRef<THREE.Mesh>(null!);
  const lids = useRef<THREE.Group>(null!);
  const crown = useRef<THREE.Group>(null!);
  useEffect(() => {
    register(id, { root: root.current, body: body.current, earL: earL.current, earR: earR.current, armR: armR.current, armL: armL.current, glove: glove.current, lids: lids.current, crown: crown.current });
    return () => register(id, null);
  }, [id, register]);

  const h = hash(id);
  const fur = useMemo(() => new THREE.Color().setHSL((h % 360) / 360, 0.75, 0.8), [h]);
  const trunks = useMemo(() => new THREE.Color().setHSL(((h >> 8) % 360) / 360, 0.8, 0.5), [h]);
  const furM = <meshStandardMaterial color={fur} roughness={0.85} />;
  const ear = (side: 1 | -1, ref: RefObject<THREE.Group>) => (
    <group ref={ref} position={[0.2 * side, 1.5, 0]} rotation={[0, 0, -0.16 * side]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.105, 0.62, 6, 12]} />
        {furM}
      </mesh>
      <mesh position={[0, 0.42, 0.07]} scale={[0.55, 0.9, 0.5]}>
        <capsuleGeometry args={[0.1, 0.55, 4, 10]} />
        <meshStandardMaterial color="#ff8fb0" roughness={0.9} />
      </mesh>
    </group>
  );
  const eye = (side: 1 | -1) => (
    <group position={[0.17 * side, 1.3, 0.33]}>
      <mesh scale={[1, 1.2, 0.6]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color="#fffdf5" roughness={0.3} />
      </mesh>
      <mesh position={[-0.02 * side, -0.01, 0.07]} scale={[1, 1.15, 0.5]}>
        <sphereGeometry args={[0.06, 12, 10]} />
        <meshStandardMaterial color="#1a1206" roughness={0.2} />
      </mesh>
      {/* an angry brow */}
      <mesh position={[0, 0.17, 0.06]} rotation={[0, 0, 0.42 * side]}>
        <boxGeometry args={[0.24, 0.055, 0.08]} />
        <meshStandardMaterial color="#3a2a18" />
      </mesh>
    </group>
  );
  return (
    <group ref={root}>
      <group ref={body}>
        {/* torso and head, one bean */}
        <mesh position={[0, 0.62, 0]} scale={[1, 1.12, 0.92]} castShadow>
          <sphereGeometry args={[0.5, 24, 18]} />
          {furM}
        </mesh>
        <mesh position={[0, 1.22, 0.02]} scale={[1.04, 0.92, 0.96]} castShadow>
          <sphereGeometry args={[0.42, 24, 18]} />
          {furM}
        </mesh>
        {/* belly */}
        <mesh position={[0, 0.6, 0.3]} scale={[0.7, 0.85, 0.42]}>
          <sphereGeometry args={[0.42, 16, 12]} />
          <meshStandardMaterial color="#fffaf0" roughness={0.9} />
        </mesh>
        {/* trunks */}
        <mesh position={[0, 0.3, 0]} scale={[1.02, 0.5, 0.95]}>
          <sphereGeometry args={[0.47, 20, 12]} />
          <meshStandardMaterial color={trunks} roughness={0.7} />
        </mesh>
        {ear(-1, earL)}
        {ear(1, earR)}
        {eye(-1)}
        {eye(1)}
        <group ref={lids} scale={[1, 0.01, 1]} position={[0, 1.42, 0.36]}>
          <mesh position={[0, -0.12, 0]}>
            <boxGeometry args={[0.66, 0.24, 0.12]} />
            {furM}
          </mesh>
        </group>
        {/* nose, shouting mouth, two teeth */}
        <mesh position={[0, 1.17, 0.43]} scale={[1.2, 0.8, 0.8]}>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshStandardMaterial color="#ff6f91" />
        </mesh>
        <mesh position={[0, 1.03, 0.38]} scale={[1.25, 0.8, 0.5]}>
          <sphereGeometry args={[0.12, 14, 10]} />
          <meshStandardMaterial color="#5a1420" roughness={0.6} />
        </mesh>
        {[-0.04, 0.04].map((x) => (
          <mesh key={x} position={[x, 1.07, 0.44]}>
            <boxGeometry args={[0.065, 0.1, 0.03]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
        {/* feet */}
        {[-0.24, 0.24].map((x) => (
          <mesh key={x} position={[x, 0.08, 0.16]} scale={[1, 0.5, 1.7]} castShadow>
            <sphereGeometry args={[0.16, 12, 10]} />
            {furM}
          </mesh>
        ))}
        {/* tail */}
        <mesh position={[0, 0.42, -0.46]}>
          <sphereGeometry args={[0.13, 10, 8]} />
          <meshStandardMaterial color="#fffaf0" roughness={1} />
        </mesh>
        {/* arms with boxing gloves; the one on +x punches (it faces the camera when the rabbit turns left) */}
        <group ref={armR} position={[0.5, 0.86, 0.05]} rotation={[0, 0, 0.35]}>
          <mesh position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.075, 0.26, 4, 8]} />
            {furM}
          </mesh>
          <mesh ref={glove} position={[0, -0.44, 0]} castShadow>
            <sphereGeometry args={[0.15, 14, 10]} />
            <meshStandardMaterial color="#e5262b" roughness={0.45} />
          </mesh>
        </group>
        <group ref={armL} position={[-0.5, 0.86, 0.05]} rotation={[0, 0, -0.35]}>
          <mesh position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.075, 0.26, 4, 8]} />
            {furM}
          </mesh>
          <mesh position={[0, -0.44, 0]} castShadow>
            <sphereGeometry args={[0.15, 14, 10]} />
            <meshStandardMaterial color="#e5262b" roughness={0.45} />
          </mesh>
        </group>
        {/* the crown, shown on whoever holds No. 1 */}
        <group ref={crown} position={[0, 1.66, 0.02]} visible={false}>
          <mesh>
            <cylinderGeometry args={[0.24, 0.2, 0.16, 5, 1, true]} />
            <meshStandardMaterial color="#ffc93c" metalness={0.7} roughness={0.25} side={THREE.DoubleSide} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[Math.sin((i / 5) * Math.PI * 2) * 0.23, 0.14, Math.cos((i / 5) * Math.PI * 2) * 0.23]}>
              <coneGeometry args={[0.06, 0.16, 4]} />
              <meshStandardMaterial color="#ffc93c" metalness={0.7} roughness={0.25} />
            </mesh>
          ))}
        </group>
      </group>
      <Html position={[0, -0.02, 0.75]} center zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        {label}
      </Html>
    </group>
  );
}

/* ───────── the stage ───────── */

function numberTex(n: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = n === 1 ? "#ffc93c" : n <= 5 ? "#ff7a1a" : "#3d2a66";
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = n === 1 ? "#2a1a00" : "#fff";
  g.font = "900 84px system-ui, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(String(n), 64, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function powTex() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.translate(128, 128);
  g.beginPath();
  for (let i = 0; i < 24; i++) {
    const r = i % 2 ? 62 : 120;
    const a = (i / 24) * Math.PI * 2;
    g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.closePath();
  g.fillStyle = "#ffe14a";
  g.fill();
  g.lineWidth = 10;
  g.strokeStyle = "#1a1206";
  g.stroke();
  g.fillStyle = "#e5262b";
  g.font = "900 70px system-ui, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.rotate(-0.15);
  g.fillText("POW!", 0, 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Stage() {
  const tex = useMemo(() => Array.from({ length: SLOTS }, (_, i) => numberTex(i + 1)), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[60, 48]} />
        <meshStandardMaterial color="#5fbf4a" roughness={1} />
      </mesh>
      {STEP_H.map((h, i) => {
        const s = slotPos(i);
        return (
          <group key={i} position={[s.x, h / 2, s.z]}>
            <mesh receiveShadow castShadow>
              <boxGeometry args={[GAP - 0.08, h, LAYOUT.tall ? 1.1 : 1.5]} />
              <meshStandardMaterial color={i === 0 ? "#ffc93c" : i < 5 ? "#ff9a3c" : "#7a5cc7"} roughness={0.6} />
            </mesh>
            <mesh position={[0, 0, LAYOUT.tall ? 0.56 : 0.76]}>
              <planeGeometry args={[Math.min(0.7, Math.max(0.3, h * 0.8)), Math.min(0.7, Math.max(0.03, h * 0.8))]} />
              <meshBasicMaterial map={tex[i]} />
            </mesh>
          </group>
        );
      })}
      {/* the prize over the No. 1 podium: a golden carrot */}
      <Carrot />
    </group>
  );
}

function Carrot() {
  const g = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    g.current.rotation.y = clock.elapsedTime * 1.2;
    g.current.position.y = STEP_H[0] + 2.75 + Math.sin(clock.elapsedTime * 2) * 0.12;
  });
  return (
    <group ref={g} position={[slotPos(0).x, 5, slotPos(0).z]}>
      <mesh rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.22, 0.8, 12]} />
        <meshStandardMaterial color="#ffb400" metalness={0.75} roughness={0.2} emissive="#7a4a00" emissiveIntensity={0.5} />
      </mesh>
      {[-0.1, 0, 0.1].map((x) => (
        <mesh key={x} position={[x, 0.52, 0]} rotation={[0, 0, -x * 4]}>
          <coneGeometry args={[0.06, 0.34, 6]} />
          <meshStandardMaterial color="#3fae3f" />
        </mesh>
      ))}
    </group>
  );
}

/* ───────── the fight director ───────── */

function Director({ rows, cast, setCast }: { rows: BrawlRow[]; cast: string[]; setCast: (f: (c: string[]) => string[]) => void }) {
  // the numbers on the tags follow the stage, not the incoming board: a rank changes when the punch lands
  const [ranks, setRanks] = useState<string[]>([]);
  const onOrder = (ids: string[]) => setRanks(ids);
  const parts = useRef(new Map<string, Parts>());
  const puppets = useRef(new Map<string, Puppet>());
  const tweens = useRef<Tween[]>([]);
  const timers = useRef<{ at: number; fn: () => void }[]>([]);
  const order = useRef<string[]>([]); // what the stage shows now
  const target = useRef<string[]>([]);
  const busyUntil = useRef(0);
  const now = useRef(0);
  const shake = useRef(0);
  const pow = useRef<THREE.Mesh>(null!);
  const powAt = useRef(-10);
  const powMap = useMemo(powTex, []);
  const { camera, size } = useThree();

  target.current = rows.slice(0, SLOTS).map((r) => r.id);

  // first board: everyone simply stands in place
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
  const flyOff = (p: Puppet, delay: number, dir: number) => {
    p.leaving = true;
    tw(p, "x", p.x + dir * 9, delay, 0.9, lin);
    tw(p, "y", p.y + 9, delay, 0.9, out3);
    tw(p, "spin", p.spin + Math.PI * 6, delay, 0.9, lin, () => {
      p.gone = true;
      puppets.current.delete(p.id);
      setCast((c) => c.filter((x) => x !== p.id));
    });
  };

  /** One overtake: the rabbit that belongs at slot i punches whoever stands there. */
  const step = () => {
    const cur = order.current;
    const want = target.current;
    let i = 0;
    while (i < want.length && cur[i] === want[i]) i++;
    if (i >= want.length) {
      // the ten match; anyone left standing past the end is shooed off
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
      // still tumbling off the stage from an earlier punch: let it land first
      busyUntil.current = now.current + 0.2;
      return true;
    }
    if (!a) {
      // a new challenger runs in from the right
      a = newPuppet(aId, SLOTS - 1);
      a.x = slotPos(SLOTS - 1).x + 4.5;
      a.z = slotPos(SLOTS - 1).z;
      a.y = 0;
      puppets.current.set(aId, a);
      setCast((c) => (c.includes(aId) ? c : [...c, aId]));
    }
    const next = cur.filter((x) => x !== aId);
    next.splice(i, 0, aId);
    const dropped = next.slice(SLOTS);
    order.current = next.slice(0, SLOTS);
    const here = slotPos(i);
    const v = vId ? puppets.current.get(vId) : undefined;

    if (!v) {
      hopTo(a, here.x, here.y, here.z, 0, 0.5, 1.4);
      busyUntil.current = now.current + 0.7;
      onOrder([...order.current]);
      return true;
    }
    // walk up beside the victim, in front of the queue
    hopTo(a, here.x + 0.95, slotPos(Math.min(i + 1, SLOTS - 1)).y, here.z + 0.85, 0, 0.42, 1.2 + Math.abs(a.x - here.x) * 0.12);
    tw(a, "rotY", -0.8, 0, 0.3);
    // wind up, then throw
    tw(a, "arm", 1.1, 0.42, 0.2);
    tw(a, "lean", -0.3, 0.42, 0.2);
    tw(a, "arm", -1.75, 0.64, 0.08, lin);
    tw(a, "lean", 0.45, 0.64, 0.08, lin);
    tw(a, "fist", 2.3, 0.64, 0.08, lin, () => {
      shake.current = 1;
      powAt.current = now.current;
      pow.current.position.set(v.x + 0.3, v.y + 1.25, v.z + 1.2);
    });
    tweens.current.push({ p: v, k: "squash", a: 0.5, b: 0, t0: now.current + 0.72, d: 0.3, e: backOut });
    // the victim is sent to its new place, or off the stage if it fell out of the ten
    const vi = order.current.indexOf(v.id);
    if (vi === -1) flyOff(v, 0.72, -1);
    else {
      const to = slotPos(vi);
      hopTo(v, to.x, to.y, to.z, 0.72, 0.75, 2.6);
      tweens.current.push({ p: v, k: "spin", a: 0, b: -Math.PI * 4, t0: now.current + 0.72, d: 0.75, e: out3, done: () => (v.spin = 0) });
    }
    dropped.forEach((id, k) => {
      const p = puppets.current.get(id);
      if (p && p !== v) flyOff(p, 0.9 + k * 0.1, 1);
    });
    // the attacker takes the slot and celebrates; everyone else shuffles down
    tw(a, "fist", 1, 0.86, 0.2);
    tw(a, "arm", 0, 0.86, 0.25);
    tw(a, "lean", 0, 0.86, 0.25);
    tw(a, "rotY", 0, 0.95, 0.3);
    hopTo(a, here.x, here.y, here.z, 0.95, 0.36, 0.9);
    hopTo(a, here.x, here.y, here.z, 1.36, 0.34, 0.75);
    tw(a, "scale", SCALE(i), 0.95, 0.4);
    const moved = new Set([a.id, v.id]);
    order.current.forEach((id, k) => {
      if (moved.has(id)) return;
      const p = puppets.current.get(id);
      if (!p) return;
      const s = slotPos(k);
      if (Math.abs(p.x - s.x) > 0.02) hopTo(p, s.x, s.y, s.z, 0.85 + (k % 4) * 0.06, 0.36, 0.7);
      tw(p, "scale", SCALE(k), 0.85, 0.4);
    });
    after(0.74, () => onOrder([...order.current]));
    busyUntil.current = now.current + 1.8;
    return true;
  };

  useFrame(({ clock }, dt) => {
    const t = (now.current = clock.elapsedTime);
    if (t >= busyUntil.current && order.current.length) step();

    for (let n = timers.current.length - 1; n >= 0; n--) if (t >= timers.current[n].at) timers.current.splice(n, 1)[0].fn();
    // tweens
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
      const idle = p.hop === 0 ? Math.abs(Math.sin(ph)) * 0.06 : 0;
      m.root.visible = !p.gone;
      m.root.position.set(p.x, p.y + Math.sin(Math.PI * p.hop) * p.hopH + idle, p.z);
      m.root.scale.setScalar(p.scale);
      // the queue glares up the line at No. 1; No. 2 leans in hardest
      const glare = id === leader ? 0.1 : id === second ? -0.38 : -0.16;
      m.root.rotation.set(0, p.rotY + glare, 0);
      // the tumble turns about the belly, not the feet
      m.body.rotation.set(p.lean + p.spin, 0, Math.sin(ph * 0.5) * 0.04);
      m.body.position.set(0, 0.75 - 0.75 * Math.cos(p.spin), -0.75 * Math.sin(p.spin));
      const sq = p.squash;
      m.body.scale.set(1 + sq * 0.5, 1 - sq * 0.55, 1 + sq * 0.5);
      const wob = Math.sin(ph * 1.3) * 0.12 + Math.sin(Math.PI * p.hop) * 0.5;
      m.earL.rotation.set(-wob * 0.8 - p.lean, 0, 0.16 + wob * 0.3);
      m.earR.rotation.set(-wob * 0.6 - p.lean, 0, -0.16 - wob * 0.3);
      m.armR.rotation.set(p.arm, 0, 0.35 * (1 - Math.min(1, Math.abs(p.arm))));
      // No. 2 shakes a fist at the podium while it waits
      m.armL.rotation.set(id === second && p.arm === 0 ? -1.2 + Math.sin(ph * 2) * 0.5 : Math.sin(ph) * 0.2, 0, -0.35);
      m.glove.scale.setScalar(p.fist);
      m.lids.scale.y = (t * 0.7 + p.seed * 7) % 3.1 < 0.12 ? 1 : 0.01;
      m.crown.visible = id === leader;
    });

    // the comic burst and the camera
    const pa = t - powAt.current;
    pow.current.visible = pa >= 0 && pa < 0.45;
    if (pow.current.visible) {
      pow.current.scale.setScalar(backOut(Math.min(1, pa / 0.14)) * 1.9);
      (pow.current.material as THREE.MeshBasicMaterial).opacity = 1 - Math.max(0, (pa - 0.25) / 0.2);
      pow.current.quaternion.copy(camera.quaternion);
      pow.current.rotation.z += Math.sin(pa * 40) * 0.05;
    }
    shake.current = Math.max(0, shake.current - dt * 4);
    const cam = camera as THREE.PerspectiveCamera;
    const s = shake.current * 0.12;
    const fov = LAYOUT.tall ? 46 : 32;
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    const span = LAYOUT.tall ? 5.2 : SLOTS * GAP + 2.6;
    const hf = 2 * Math.atan(Math.tan((fov * Math.PI) / 360) * (size.width / size.height));
    const dist = Math.max(11, span / 2 / Math.tan(hf / 2));
    if (LAYOUT.tall) {
      cam.position.set(Math.sin(t * 0.25) * 0.3 + Math.sin(t * 61) * s, 8 + Math.cos(t * 53) * s, dist + 3.6);
      cam.lookAt(0, 1.2, -2.2);
    } else {
      cam.position.set(Math.sin(t * 0.25) * 0.5 + Math.sin(t * 61) * s, 3.2 + dist * 0.1 + Math.cos(t * 53) * s, dist);
      cam.lookAt(0, 2.3, 0);
    }
  });

  const register = useMemo(() => (id: string, p: Parts | null) => void (p ? parts.current.set(id, p) : parts.current.delete(id)), []);
  const info = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);
  return (
    <>
      {cast.map((id) => {
        const r = ranks.indexOf(id);
        const row = info.get(id);
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
        <meshBasicMaterial map={powMap} transparent depthTest={false} />
      </mesh>
    </>
  );
}

/** Picks the layout from the canvas shape; the stage and its cast are rebuilt when it flips. */
function Scene({ rows, cast, setCast }: { rows: BrawlRow[]; cast: string[]; setCast: (f: (c: string[]) => string[]) => void }) {
  const tall = useThree((s) => s.size.width / s.size.height < 0.9);
  LAYOUT.tall = tall;
  return (
    <group key={tall ? "tall" : "wide"}>
      <Stage />
      <Director rows={rows} cast={cast} setCast={setCast} />
    </group>
  );
}

export default function BunnyBrawl({ rows }: { rows: BrawlRow[] }) {
  const [cast, setCast] = useState<string[]>([]);
  return (
    <Canvas shadows style={{ position: "absolute", inset: 0 }} dpr={[1, 1.75]} camera={{ fov: 32, near: 0.1, far: 120, position: [0, 4, 16] }} gl={{ antialias: true }}>
      <color attach="background" args={["#8fd3ff"]} />
      <fog attach="fog" args={["#8fd3ff", 30, 75]} />
      <hemisphereLight args={["#ffffff", "#6fae5a", 1.25]} />
      <directionalLight position={[6, 12, 8]} intensity={2.1} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={10} shadow-camera-bottom={-4} shadow-bias={-0.0004} />
      <Scene rows={rows} cast={cast} setCast={setCast} />
    </Canvas>
  );
}
