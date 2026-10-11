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
import { Html, RoundedBox } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, Vignette } from "@react-three/postprocessing";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

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
  yell: number; // 0 mouth shut, 1 wide open
  scale: number;
  gone: boolean;
  leaving: boolean;
  seed: number;
};
type Key = "x" | "y" | "z" | "hop" | "rotY" | "spin" | "lean" | "arm" | "fist" | "squash" | "scale" | "yell";
type Tween = { p: Puppet; k: Key; a: number | null; b: number; t0: number; d: number; e: (t: number) => number; start?: () => void; done?: () => void; on?: boolean };

const out3 = (t: number) => 1 - Math.pow(1 - t, 3);
const inOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lin = (t: number) => t;
const backOut = (t: number) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);

function newPuppet(id: string, slot: number): Puppet {
  const s = slotPos(slot);
  return { id, x: s.x, y: s.y, z: s.z, hop: 0, hopH: 1, rotY: 0, spin: 0, lean: 0, arm: 0, fist: 1, squash: 0, yell: 0, scale: SCALE(slot), gone: false, leaving: false, seed: (hash(id) % 1000) / 1000 };
}

/* ───────── one rabbit ───────── */

type Parts = {
  root: THREE.Group;
  body: THREE.Group;
  earL: THREE.Group;
  earR: THREE.Group;
  earL2: THREE.Group;
  earR2: THREE.Group;
  armR: THREE.Group;
  armL: THREE.Group;
  glove: THREE.Group;
  lidL: THREE.Mesh;
  lidR: THREE.Mesh;
  mouth: THREE.Group;
  crown: THREE.Group;
};

/** Torso and head in one skin: a pear turned on a lathe, so there is no seam at the neck. */
const BODY_GEO = (() => {
  const pts: [number, number][] = [[0, 0], [0.28, 0.01], [0.46, 0.14], [0.54, 0.42], [0.5, 0.72], [0.43, 0.95], [0.42, 1.12], [0.44, 1.3], [0.4, 1.48], [0.28, 1.6], [0, 1.65]];
  const curve = new THREE.SplineCurve(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.LatheGeometry(curve.getPoints(56).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y)), 44);
  g.computeVertexNormals();
  return g;
})();
const LID_GEO = new THREE.SphereGeometry(0.162, 20, 12, 0, Math.PI * 2, 0, 1.2);
const FURS = ["#f3e6d2", "#f0c79c", "#cfa67e", "#c3cad2", "#f6b6c6", "#b5d6f2", "#cbb8f0", "#ffdb8c", "#a9e2bb", "#8f6c56", "#55504f", "#ffb38a"];
const IRIS = ["#7a4a1e", "#3f7d3a", "#c98a1a", "#5a3a8a", "#a33a2a"];
const TRUNKS = ["#e5262b", "#1f6fe0", "#16a34a", "#f59e0b", "#7c3aed", "#0ea5a4", "#111827", "#ec4899"];

function Bunny({ id, register, label }: { id: string; register: (id: string, p: Parts | null) => void; label: ReactNode }) {
  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const earL = useRef<THREE.Group>(null!);
  const earR = useRef<THREE.Group>(null!);
  const earL2 = useRef<THREE.Group>(null!);
  const earR2 = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const glove = useRef<THREE.Group>(null!);
  const lidL = useRef<THREE.Mesh>(null!);
  const lidR = useRef<THREE.Mesh>(null!);
  const mouth = useRef<THREE.Group>(null!);
  const crown = useRef<THREE.Group>(null!);
  useEffect(() => {
    register(id, { root: root.current, body: body.current, earL: earL.current, earR: earR.current, earL2: earL2.current, earR2: earR2.current, armR: armR.current, armL: armL.current, glove: glove.current, lidL: lidL.current, lidR: lidR.current, mouth: mouth.current, crown: crown.current });
    return () => register(id, null);
  }, [id, register]);

  const h = hash(id);
  // short velvet fur: a soft sheen at grazing angles instead of a plastic highlight
  const M = useMemo(() => {
    const fur = new THREE.Color(FURS[h % FURS.length]);
    const soft = (c: THREE.Color) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.82, sheen: 0.55, sheenRoughness: 0.5, sheenColor: c.clone().lerp(new THREE.Color("#ffffff"), 0.6) });
    return {
      fur: soft(fur),
      pale: soft(fur.clone().lerp(new THREE.Color("#fffaf0"), 0.7)),
      dark: soft(fur.clone().multiplyScalar(0.45)),
      inner: new THREE.MeshPhysicalMaterial({ color: "#ff9db5", roughness: 0.7, sheen: 0.6, sheenColor: new THREE.Color("#ffffff") }),
      trunks: new THREE.MeshPhysicalMaterial({ color: TRUNKS[(h >>> 6) % TRUNKS.length], roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.4 }),
      glove: new THREE.MeshPhysicalMaterial({ color: "#d81e24", roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.18 }),
      eye: new THREE.MeshPhysicalMaterial({ color: "#fffdf7", roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03 }),
      iris: new THREE.MeshPhysicalMaterial({ color: IRIS[(h >>> 12) % IRIS.length], roughness: 0.15, clearcoat: 1 }),
      black: new THREE.MeshPhysicalMaterial({ color: "#0c0806", roughness: 0.1, clearcoat: 1 }),
      nose: new THREE.MeshPhysicalMaterial({ color: "#ff6f91", roughness: 0.22, clearcoat: 0.9 }),
      cavity: new THREE.MeshStandardMaterial({ color: "#3d0a14", roughness: 0.7 }),
      tongue: new THREE.MeshPhysicalMaterial({ color: "#ff5d7a", roughness: 0.35, clearcoat: 0.5 }),
      tooth: new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.12, clearcoat: 1 }),
      white: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.6 }),
      gold: new THREE.MeshStandardMaterial({ color: "#ffc93c", metalness: 1, roughness: 0.18 }),
    };
  }, [h]);

  const ear = (side: 1 | -1, lower: RefObject<THREE.Group>, upper: RefObject<THREE.Group>) => (
    <group ref={lower} position={[0.19 * side, 1.52, -0.02]} rotation={[0, 0, -0.16 * side]}>
      <mesh position={[0, 0.3, 0]} scale={[1, 1, 0.6]} material={M.fur} castShadow>
        <capsuleGeometry args={[0.105, 0.42, 8, 16]} />
      </mesh>
      <mesh position={[0, 0.3, 0.045]} scale={[0.6, 0.9, 0.3]} material={M.inner}>
        <capsuleGeometry args={[0.1, 0.4, 6, 12]} />
      </mesh>
      {/* the top half hangs on its own hinge so the tip flops a beat late */}
      <group ref={upper} position={[0, 0.56, 0]}>
        <mesh position={[0, 0.26, 0]} scale={[0.95, 1, 0.55]} material={M.fur} castShadow>
          <capsuleGeometry args={[0.1, 0.4, 8, 16]} />
        </mesh>
        <mesh position={[0, 0.26, 0.04]} scale={[0.55, 0.88, 0.28]} material={M.inner}>
          <capsuleGeometry args={[0.095, 0.38, 6, 12]} />
        </mesh>
      </group>
    </group>
  );
  const eye = (side: 1 | -1, lid: RefObject<THREE.Mesh>) => (
    <group position={[0.165 * side, 1.34, 0.29]} scale={[1, 1.1, 0.82]}>
      <mesh material={M.eye}>
        <sphereGeometry args={[0.155, 28, 20]} />
      </mesh>
      <mesh position={[-0.025 * side, -0.01, 0.105]} scale={[1, 1, 0.42]} material={M.iris}>
        <sphereGeometry args={[0.085, 20, 14]} />
      </mesh>
      <mesh position={[-0.028 * side, -0.01, 0.13]} scale={[1, 1, 0.4]} material={M.black}>
        <sphereGeometry args={[0.048, 16, 12]} />
      </mesh>
      <mesh position={[0.012, 0.04, 0.152]}>
        <sphereGeometry args={[0.02, 10, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* a heavy upper lid, slanted in: the scowl. It swings down to blink. */}
      <mesh ref={lid} geometry={LID_GEO} material={M.fur} rotation={[0.2, 0, -0.5 * side]} />
    </group>
  );
  const arm = (side: 1 | -1, ref: RefObject<THREE.Group>, punch: boolean) => (
    <group ref={ref} position={[0.47 * side, 0.9, 0.04]} rotation={[0, 0, 0.35 * side]}>
      <mesh position={[0, -0.2, 0]} material={M.fur} castShadow>
        <capsuleGeometry args={[0.085, 0.26, 6, 12]} />
      </mesh>
      <group ref={punch ? glove : undefined} position={[0, -0.46, 0]}>
        <mesh position={[0, 0.12, 0]} material={M.white}>
          <cylinderGeometry args={[0.105, 0.115, 0.1, 20]} />
        </mesh>
        <mesh scale={[1, 1.12, 1.05]} material={M.glove} castShadow>
          <sphereGeometry args={[0.17, 24, 18]} />
        </mesh>
        <mesh position={[-0.1 * side, 0.02, 0.09]} scale={[0.8, 1.1, 0.8]} material={M.glove}>
          <sphereGeometry args={[0.085, 16, 12]} />
        </mesh>
      </group>
    </group>
  );
  return (
    <group ref={root}>
      <group ref={body}>
        <mesh geometry={BODY_GEO} material={M.fur} scale={[1, 1, 0.94]} castShadow receiveShadow />
        {/* belly, muzzle pads, tail */}
        <mesh position={[0, 0.56, 0.27]} scale={[0.72, 0.9, 0.52]} material={M.pale}>
          <sphereGeometry args={[0.46, 28, 20]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.085 * s, 1.14, 0.34]} scale={[1, 0.8, 0.75]} material={M.pale}>
            <sphereGeometry args={[0.125, 20, 14]} />
          </mesh>
        ))}
        <mesh position={[0, 0.42, -0.5]} material={M.pale} castShadow>
          <sphereGeometry args={[0.15, 16, 12]} />
        </mesh>
        {/* trunks with a white waistband */}
        <mesh position={[0, 0.3, 0]} scale={[1.035, 0.44, 0.975]} material={M.trunks}>
          <sphereGeometry args={[0.54, 32, 16]} />
        </mesh>
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.94, 1]} material={M.white}>
          <torusGeometry args={[0.515, 0.035, 10, 40]} />
        </mesh>
        {ear(-1, earL, earL2)}
        {ear(1, earR, earR2)}
        {eye(-1, lidL)}
        {eye(1, lidR)}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.17 * s, 1.535, 0.33]} rotation={[0.3, 0, Math.PI / 2 + 0.5 * s]} material={M.dark}>
            <capsuleGeometry args={[0.03, 0.17, 4, 10]} />
          </mesh>
        ))}
        <mesh position={[0, 1.215, 0.435]} scale={[1.3, 0.9, 0.8]} material={M.nose}>
          <sphereGeometry args={[0.055, 16, 12]} />
        </mesh>
        {/* the mouth opens to shout; two buck teeth stay put above it */}
        <group ref={mouth} position={[0, 1.03, 0.37]}>
          <mesh scale={[1.25, 1, 0.55]} material={M.cavity}>
            <sphereGeometry args={[0.13, 20, 14]} />
          </mesh>
          <mesh position={[0, -0.05, 0.03]} scale={[1, 0.5, 0.6]} material={M.tongue}>
            <sphereGeometry args={[0.085, 16, 10]} />
          </mesh>
        </group>
        {[-0.042, 0.042].map((x) => (
          <mesh key={x} position={[x, 1.085, 0.445]} scale={[1, 1.5, 0.5]} material={M.tooth}>
            <sphereGeometry args={[0.04, 12, 10]} />
          </mesh>
        ))}
        {/* feet */}
        {[-0.25, 0.25].map((x) => (
          <mesh key={x} position={[x, 0.08, 0.2]} scale={[1, 0.5, 1.75]} material={M.fur} castShadow>
            <sphereGeometry args={[0.17, 20, 14]} />
          </mesh>
        ))}
        {/* arms with boxing gloves; the one on +x punches (it faces the camera when the rabbit turns left) */}
        {arm(1, armR, true)}
        {arm(-1, armL, false)}
        {/* the crown, shown on whoever holds No. 1 */}
        <group ref={crown} position={[0, 1.7, 0]} visible={false}>
          <mesh material={M.gold} castShadow>
            <cylinderGeometry args={[0.25, 0.21, 0.15, 24, 1, true]} />
          </mesh>
          <mesh position={[0, -0.075, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.gold}>
            <torusGeometry args={[0.21, 0.025, 8, 24]} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <group key={i} position={[Math.sin(a) * 0.24, 0.14, Math.cos(a) * 0.24]}>
                <mesh material={M.gold}>
                  <coneGeometry args={[0.065, 0.18, 12]} />
                </mesh>
                <mesh position={[0, 0.11, 0]}>
                  <sphereGeometry args={[0.03, 10, 8]} />
                  <meshPhysicalMaterial color="#e5262b" roughness={0.1} clearcoat={1} />
                </mesh>
              </group>
            );
          })}
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

function gradTex(stops: [number, string][], radial = false) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const gr = radial ? g.createRadialGradient(128, 128, 0, 128, 128, 128) : g.createLinearGradient(0, 0, 0, 256);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Soft studio reflections for the glossy eyes, gloves and gold, built in memory (no download). */
function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const rt = pm.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = rt.texture;
    scene.environmentIntensity = 0.4;
    return () => {
      scene.environment = null;
      rt.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
}

const rnd = (() => {
  let s = 11;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
})();
const CLOUDS = Array.from({ length: 7 }, (_, i) => ({ x: -42 + i * 14 + rnd() * 5, y: 11 + rnd() * 7, z: -30 - rnd() * 18, s: 1.6 + rnd() * 1.6, v: 0.15 + rnd() * 0.2 }));
const HILLS: [number, number, number, string][] = [[-30, -34, 20, "#4fae45"], [-6, -42, 26, "#46a23f"], [22, -36, 19, "#58b84c"], [44, -44, 24, "#3f9a3a"], [-52, -46, 24, "#3f9a3a"]];
const TUFTS = Array.from({ length: 260 }, () => {
  const a = rnd() * Math.PI * 2;
  const r = 2 + rnd() * 22;
  return { x: Math.cos(a) * r * 1.5, z: Math.sin(a) * r - 2, s: 0.5 + rnd() * 0.9, c: rnd() };
}).filter((t) => Math.abs(t.z) > 1.4 || Math.abs(t.x) > 9);

function Stage() {
  const tex = useMemo(() => Array.from({ length: SLOTS }, (_, i) => numberTex(i + 1)), []);
  const sky = useMemo(() => gradTex([[0, "#2f8fef"], [0.42, "#7cc4ff"], [0.5, "#d8f0ff"], [1, "#d8f0ff"]]), []);
  const lawn = useMemo(() => gradTex([[0, "#7ccf55"], [0.25, "#5fb845"], [1, "#3f9638"]], true), []);
  const clouds = useRef<THREE.Group>(null!);
  const tufts = useRef<THREE.InstancedMesh>(null!);
  useEffect(() => {
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    TUFTS.forEach((t, i) => {
      o.position.set(t.x, 0.11 * t.s, t.z);
      o.scale.set(t.s, t.s, t.s);
      o.rotation.set(0, t.c * 6, (t.c - 0.5) * 0.4);
      o.updateMatrix();
      tufts.current.setMatrixAt(i, o.matrix);
      tufts.current.setColorAt(i, col.setHSL(0.28 + t.c * 0.06, 0.6, 0.36 + t.c * 0.16));
    });
    tufts.current.instanceMatrix.needsUpdate = true;
    if (tufts.current.instanceColor) tufts.current.instanceColor.needsUpdate = true;
  }, []);
  useFrame((_, dt) => {
    clouds.current.children.forEach((c, i) => {
      c.position.x += CLOUDS[i].v * dt;
      if (c.position.x > 60) c.position.x = -60;
    });
  });
  return (
    <group>
      <mesh>
        <sphereGeometry args={[95, 32, 20]} />
        <meshBasicMaterial map={sky} side={THREE.BackSide} fog={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[70, 64]} />
        <meshStandardMaterial map={lawn} roughness={1} />
      </mesh>
      {HILLS.map(([x, z, r, c], i) => (
        <mesh key={i} position={[x, -r * 0.14, z]} scale={[1.5, 0.42, 1]}>
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
      <instancedMesh ref={tufts} args={[undefined, undefined, TUFTS.length]} receiveShadow>
        <coneGeometry args={[0.06, 0.24, 5]} />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
      {STEP_H.map((h, i) => {
        const s = slotPos(i);
        const d = LAYOUT.tall ? 1.1 : 1.5;
        return (
          <group key={i} position={[s.x, h / 2, s.z]}>
            <RoundedBox args={[GAP - 0.07, h, d]} radius={Math.min(0.07, h * 0.45)} smoothness={4} receiveShadow castShadow>
              {i === 0 ? <meshStandardMaterial color="#ffc93c" metalness={0.9} roughness={0.25} /> : <meshPhysicalMaterial color={i < 5 ? "#ff8a2b" : "#7352c9"} roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.25} />}
            </RoundedBox>
            <mesh position={[0, 0, d / 2 + 0.006]}>
              <planeGeometry args={[Math.min(0.7, Math.max(0.3, h * 0.8)), Math.min(0.7, Math.max(0.03, h * 0.8))]} />
              <meshBasicMaterial map={tex[i]} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      {/* the prize over the No. 1 podium: a golden carrot */}
      <Carrot />
    </group>
  );
}

const CARROT_GEO = new THREE.LatheGeometry([[0, -0.5], [0.05, -0.42], [0.13, -0.1], [0.2, 0.2], [0.22, 0.34], [0.17, 0.42], [0, 0.44]].map(([x, y]) => new THREE.Vector2(x, y)), 24);

function Carrot() {
  const g = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    g.current.rotation.y = clock.elapsedTime * 1.2;
    g.current.position.y = STEP_H[0] + 2.9 + Math.sin(clock.elapsedTime * 2) * 0.12;
  });
  return (
    <group ref={g} position={[slotPos(0).x, 5, slotPos(0).z]} rotation={[0, 0, 0.18]}>
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
    tw(a, "yell", 1, 0.38, 0.14);
    tw(a, "yell", 0, 1.0, 0.3);
    tw(v, "yell", 1, 0.72, 0.06);
    tw(v, "yell", 0, 1.5, 0.3);
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
      // the tips follow a beat behind
      const flop = Math.sin(ph * 1.3 - 0.9) * 0.2 + Math.sin(Math.PI * p.hop) * 0.9 + sq * 1.2;
      m.earL2.rotation.set(-flop - p.lean * 0.8, 0, flop * 0.25);
      m.earR2.rotation.set(-flop * 0.8 - p.lean * 0.8, 0, -flop * 0.25);
      m.armR.rotation.set(p.arm, 0, 0.35 * (1 - Math.min(1, Math.abs(p.arm))));
      // No. 2 shakes a fist at the podium while it waits
      m.armL.rotation.set(id === second && p.arm === 0 ? -1.2 + Math.sin(ph * 2) * 0.5 : Math.sin(ph) * 0.2, 0, -0.35);
      m.glove.scale.setScalar(p.fist);
      const blink = (t * 0.7 + p.seed * 7) % 3.1 < 0.1 ? 1.15 : p.yell * -0.25;
      m.lidL.rotation.x = m.lidR.rotation.x = 0.2 + blink;
      // No. 2 mutters at the podium; a punch thrown or taken opens the mouth wide
      const talk = id === second && p.yell === 0 ? 0.25 + Math.max(0, Math.sin(ph * 2.3)) * 0.35 : 0.12;
      const open = Math.max(talk, p.yell);
      m.mouth.scale.set(0.8 + open * 0.45, 0.22 + open * 1.25, 1);
      m.mouth.position.y = 1.03 - open * 0.07;
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

/** `fx` turns the ambient occlusion, bloom and vignette pass off (slow machines, tests). */
export default function BunnyBrawl({ rows, fx = true }: { rows: BrawlRow[]; fx?: boolean }) {
  const [cast, setCast] = useState<string[]>([]);
  return (
    <Canvas shadows="soft" style={{ position: "absolute", inset: 0 }} dpr={[1, 1.75]} camera={{ fov: 32, near: 0.1, far: 220, position: [0, 4, 16] }} gl={{ antialias: !fx, toneMappingExposure: 0.92 }}>
      <color attach="background" args={["#d8f0ff"]} />
      <fog attach="fog" args={["#d8f0ff", 34, 95]} />
      <Env />
      <hemisphereLight args={["#dff1ff", "#6fb04f", 0.55]} />
      {/* a warm sun from the front right, a cool rim from behind to lift the silhouettes off the grass */}
      <directionalLight position={[7, 13, 9]} color="#fff1d6" intensity={2.3} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-13} shadow-camera-right={13} shadow-camera-top={11} shadow-camera-bottom={-5} shadow-bias={-0.0003} shadow-normalBias={0.03} shadow-radius={6} />
      <directionalLight position={[-8, 7, -10]} color="#bfe0ff" intensity={1.3} />
      <Scene rows={rows} cast={cast} setCast={setCast} />
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
