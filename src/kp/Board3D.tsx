/**
 * The hero board in 3D: the opening position, 32 toy pieces standing on their squares, each one
 * turning slowly. Toon-shaded with a hard ink outline. Geometry and materials are shared, the board
 * is one instanced mesh, and it draws at most 30 frames a second, nothing while off screen.
 * `progress` (0→1, from the hero's scroll) swings the camera from the tilted view to straight down.
 */
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

const INK = "#170c29";
type Kind = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
const BACK: Kind[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];

const STEPS = (() => {
  const t = new THREE.DataTexture(new Uint8Array([80, 80, 80, 255, 170, 170, 170, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();
const toon = (color: string) => new THREE.MeshToonMaterial({ color, gradientMap: STEPS });
const OUTLINE = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });

const lathe = (pts: number[][], seg = 28) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
const merge = (parts: THREE.BufferGeometry[]) => {
  // a light merge: every part non-indexed, attributes concatenated (position + normal)
  const geos = parts.map((g) => (g.index ? g.toNonIndexed() : g));
  const total = geos.reduce((n, g) => n + g.getAttribute("position").count, 0);
  const pos = new Float32Array(total * 3);
  const nor = new Float32Array(total * 3);
  let o = 0;
  geos.forEach((g) => {
    if (!g.getAttribute("normal")) g.computeVertexNormals();
    pos.set(g.getAttribute("position").array as Float32Array, o * 3);
    nor.set(g.getAttribute("normal").array as Float32Array, o * 3);
    o += g.getAttribute("position").count;
  });
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  return out;
};
const at = (g: THREE.BufferGeometry, x: number, y: number, z: number, ry = 0) => g.rotateY(ry).translate(x, y, z);

/** One geometry per kind, built once. Heights: pawn 0.72 … king 1.32 (a square is 1). */
function pieceGeometries(): Record<Kind, THREE.BufferGeometry> {
  const base = [[0, 0], [0.38, 0], [0.38, 0.08], [0.31, 0.12], [0.25, 0.19]];
  const pawn = merge([lathe([...base, [0.15, 0.42], [0.23, 0.47], [0.12, 0.5], [0, 0.5]]), at(new THREE.SphereGeometry(0.17, 20, 14), 0, 0.64, 0)]);
  const merlons = [0, 1, 2, 3].map((i) => {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    return at(new THREE.BoxGeometry(0.13, 0.12, 0.13), Math.cos(a) * 0.2, 0.88, Math.sin(a) * 0.2, -a);
  });
  const rook = merge([lathe([...base, [0.22, 0.24], [0.21, 0.62], [0.3, 0.66], [0.3, 0.82], [0, 0.82]]), ...merlons]);
  const bishop = merge([
    lathe([...base, [0.15, 0.55], [0.22, 0.6], [0.12, 0.64], [0, 0.64]]),
    at(new THREE.SphereGeometry(0.2, 20, 14).scale(1, 1.4, 1), 0, 0.84, 0),
    at(new THREE.SphereGeometry(0.06, 12, 8), 0, 1.13, 0),
  ]);
  const queenBalls = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return at(new THREE.SphereGeometry(0.055, 10, 8), Math.cos(a) * 0.24, 0.97, Math.sin(a) * 0.24);
  });
  const queen = merge([
    lathe([...base, [0.15, 0.62], [0.26, 0.74], [0.27, 0.92], [0.18, 0.98], [0, 1.0]]),
    ...queenBalls,
    at(new THREE.SphereGeometry(0.08, 12, 8), 0, 1.06, 0),
  ]);
  const king = merge([
    lathe([...base, [0.16, 0.66], [0.27, 0.78], [0.28, 0.98], [0, 0.98]]),
    at(new THREE.BoxGeometry(0.09, 0.3, 0.09), 0, 1.13, 0),
    at(new THREE.BoxGeometry(0.24, 0.08, 0.09), 0, 1.17, 0),
  ]);
  // the knight's head: a horse silhouette given thickness, on a short turned base
  const s = new THREE.Shape();
  const head = [[-0.22, 0.2], [-0.2, 0.48], [-0.29, 0.6], [-0.31, 0.72], [-0.2, 0.86], [-0.02, 0.96], [0.12, 0.93], [0.25, 0.8], [0.31, 0.67], [0.24, 0.6], [0.09, 0.66], [0.03, 0.58], [0.17, 0.42], [0.22, 0.2]];
  head.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  const neck = new THREE.ExtrudeGeometry(s, { depth: 0.24, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 }).translate(0, 0, -0.12);
  const knight = merge([lathe([...base, [0.22, 0.24], [0, 0.24]]), neck]);
  return { pawn, rook, knight, bishop, queen, king };
}

function Board({ progress, narrow, still }: { progress: MutableRefObject<number>; narrow: boolean; still: boolean }) {
  const pieces = useRef<THREE.Group>(null);
  const geo = useMemo(pieceGeometries, []);
  const mats = useMemo(() => ({ light: toon("#fff6e3"), dark: toon("#3a2466"), crown: toon("#ff7a1a"), frame: new THREE.MeshBasicMaterial({ color: INK }) }), []);
  const squares = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.2, 1), new THREE.MeshToonMaterial({ gradientMap: STEPS }), 64);
    const o = new THREE.Object3D();
    const lime = new THREE.Color("#c6f432");
    const violet = new THREE.Color("#4b1fd8");
    for (let i = 0; i < 64; i++) {
      const r = Math.floor(i / 8);
      const c = i % 8;
      o.position.set(c - 3.5, -0.1, r - 3.5);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, (r + c) % 2 ? violet : lime);
    }
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, []);
  const set = useMemo(() => {
    const out: { kind: Kind; light: boolean; x: number; z: number; phase: number }[] = [];
    for (let c = 0; c < 8; c++) {
      out.push({ kind: BACK[c], light: false, x: c - 3.5, z: -3.5, phase: c * 0.7 });
      out.push({ kind: "pawn", light: false, x: c - 3.5, z: -2.5, phase: c * 0.5 + 1 });
      out.push({ kind: "pawn", light: true, x: c - 3.5, z: 2.5, phase: c * 0.6 + 2 });
      out.push({ kind: BACK[c], light: true, x: c - 3.5, z: 3.5, phase: c * 0.8 + 3 });
    }
    return out;
  }, []);
  const cam = useThree((s) => s.camera);
  const tilted = useMemo(() => (narrow ? new THREE.Vector3(0, 9.2, 10.6) : new THREE.Vector3(0, 9.5, 12.5)), [narrow]);
  const above = useMemo(() => (narrow ? new THREE.Vector3(0, 20, 0.01) : new THREE.Vector3(0, 15, 0.01)), [narrow]);
  const look = useMemo(() => new THREE.Vector3(0, 0, narrow ? -4.6 : -3.4), [narrow]);

  useFrame((s) => {
    const p = Math.min(1, Math.max(0, progress.current));
    cam.position.lerpVectors(tilted, above, p);
    cam.lookAt(look.x * (1 - p), 0, look.z * (1 - p));
    if (still || !pieces.current) return;
    const t = s.clock.elapsedTime;
    pieces.current.children.forEach((g, i) => {
      g.rotation.y = t * 0.9 + set[i].phase;
    });
  });

  return (
    <group position={[narrow ? 0 : 0.6, 0, 0]}>
      <mesh position={[0, -0.32, 0]} material={mats.frame}>
        <boxGeometry args={[8.5, 0.24, 8.5]} />
      </mesh>
      <primitive object={squares} />
      <group ref={pieces}>
        {set.map((p, i) => {
          const m = p.light ? (p.kind === "king" ? mats.crown : mats.light) : mats.dark;
          return (
            <group key={i} position={[p.x, 0, p.z]} rotation={[0, p.phase, 0]}>
              <mesh geometry={geo[p.kind]} material={m} />
              <mesh geometry={geo[p.kind]} material={OUTLINE} scale={1.07} />
            </group>
          );
        })}
      </group>
    </group>
  );
}

function Pace({ on }: { on: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!on) return;
    let id = 0;
    let last = 0;
    const step = (t: number) => {
      id = requestAnimationFrame(step);
      if (document.hidden || t - last < 31) return;
      last = t;
      invalidate();
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [on, invalidate]);
  return null;
}

export default function Board3D({ progress, still = false }: { progress: MutableRefObject<number>; still?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;
  useEffect(() => {
    if (!box.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.01 });
    io.observe(box.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={box} className="board3dgl">
      <Canvas dpr={[1, 1.5]} frameloop="demand" camera={{ fov: narrow ? 46 : 34, near: 0.1, far: 60 }} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[-4, 9, 6]} intensity={2.2} />
        <Board progress={progress} narrow={narrow} still={still} />
        <Pace on={visible} />
      </Canvas>
    </div>
  );
}
