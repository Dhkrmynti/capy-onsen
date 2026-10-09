/**
 * The hero's one 3D scene: the toy King on his square, and a Rook that slides down the rank and
 * puts him in check. The King shakes, hops clear, the Rook backs off, and it starts again.
 * Toon-shaded with a hard ink outline, drawn at most 30 times a second and not while off screen.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

const INK = "#170c29";
export type CheckPhase = "calm" | "slide" | "check" | "dodge";
/** One loop of the scene, in seconds. */
export const LOOP = 7;
const phaseAt = (t: number): CheckPhase => {
  const k = t % LOOP;
  if (k < 2.2) return "slide";
  if (k < 4.6) return "check";
  if (k < 5.4) return "dodge";
  return "calm";
};

/** Three flat light bands: shade, mid, lit. */
const STEPS = (() => {
  const t = new THREE.DataTexture(new Uint8Array([70, 70, 70, 255, 165, 165, 165, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();

const toon = (color: string) => new THREE.MeshToonMaterial({ color, gradientMap: STEPS });
/** The cartoon outline: the same shape, a touch larger, ink on its back faces. */
const OUTLINE = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });

function Inked({ geometry, material, position, rotation, ink = 1.06 }: { geometry: THREE.BufferGeometry; material: THREE.Material; position?: [number, number, number]; rotation?: [number, number, number]; ink?: number }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry} material={material} />
      <mesh geometry={geometry} material={OUTLINE} scale={ink} />
    </group>
  );
}

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

function Scene({ still, onPhase }: { still: boolean; onPhase?: (p: CheckPhase) => void }) {
  const king = useRef<THREE.Group>(null);
  const rook = useRef<THREE.Group>(null);
  const last = useRef<CheckPhase | null>(null);
  const parts = useMemo(() => {
    const v = (pts: number[][]) => pts.map(([x, y]) => new THREE.Vector2(x, y));
    return {
      body: new THREE.LatheGeometry(v([[0, 0], [1.05, 0], [1.05, 0.22], [0.86, 0.3], [0.62, 0.42], [0.5, 0.9], [0.42, 1.55], [0.62, 1.68], [0.72, 1.8], [0, 1.8]]), 48),
      crown: new THREE.LatheGeometry(v([[0, 0], [0.6, 0], [0.82, 0.55], [0.6, 0.6], [0, 0.6]]), 48),
      bar: new THREE.BoxGeometry(0.2, 0.9, 0.2),
      arm: new THREE.BoxGeometry(0.66, 0.2, 0.2),
      ring: new THREE.TorusGeometry(0.66, 0.08, 10, 48),
      // the Rook: a turned tower and four battlements
      tower: new THREE.LatheGeometry(v([[0, 0], [0.86, 0], [0.86, 0.2], [0.7, 0.28], [0.56, 0.42], [0.5, 1.15], [0.66, 1.24], [0.66, 1.42], [0, 1.42]]), 40),
      merlon: new THREE.BoxGeometry(0.3, 0.3, 0.3),
    };
  }, []);
  const mats = useMemo(
    () => ({
      body: toon("#ff7a1a"),
      cream: toon("#fff6e3"),
      rook: toon("#fff6e3"),
    }),
    [],
  );

  useFrame((s) => {
    if (!king.current || !rook.current) return;
    // reduced motion: hold the check, nothing moves
    const t = still ? 3.4 : s.clock.elapsedTime;
    const k = t % LOOP;
    const phase = phaseAt(t);
    if (phase !== last.current) {
      last.current = phase;
      onPhase?.(phase);
    }
    const K = king.current;
    const R = rook.current;
    // the King turns slowly; in check he shakes, then hops clear of the line
    K.rotation.y = still ? 0.5 : t * 0.5;
    K.rotation.z = phase === "check" ? Math.sin(t * 38) * 0.035 : 0;
    const d = phase === "dodge" ? (k - 4.6) / 0.8 : 0;
    const hop = phase === "dodge" ? Math.sin(d * Math.PI) * 0.7 : 0;
    K.position.set(phase === "dodge" ? ease(d) * 0.9 : phase === "calm" ? 0.9 * (1 - ease((k - 5.4) / 1.2)) : 0, -1.25 + hop, 0);
    // the Rook glides in along the rank, stops two squares off the King, then backs away
    const xIn = -5 + ease(k / 2.2) * 2.4;
    const xOut = -2.6 - ease((k - 5.4) / 1.4) * 2.4;
    R.position.set(phase === "slide" ? xIn : phase === "calm" ? xOut : -2.6, -1.25 + (phase === "slide" ? Math.abs(Math.sin(k * 6)) * 0.06 : 0), 0.35);
    R.rotation.y = phase === "slide" ? -0.25 : 0;
  });

  return (
    <>
      <group ref={king} position={[0, -1.25, 0]}>
        <Inked geometry={parts.body} material={mats.body} ink={1.045} />
        <Inked geometry={parts.ring} material={mats.cream} position={[0, 1.66, 0]} rotation={[Math.PI / 2, 0, 0]} ink={1.12} />
        <Inked geometry={parts.crown} material={mats.body} position={[0, 1.8, 0]} ink={1.07} />
        <Inked geometry={parts.bar} material={mats.cream} position={[0, 2.82, 0]} ink={1.22} />
        <Inked geometry={parts.arm} material={mats.cream} position={[0, 2.95, 0]} ink={1.2} />
      </group>
      <group ref={rook} position={[-4.6, -1.25, 0.35]}>
        <Inked geometry={parts.tower} material={mats.rook} ink={1.05} />
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          return <Inked key={i} geometry={parts.merlon} material={mats.rook} position={[Math.cos(a) * 0.44, 1.54, Math.sin(a) * 0.44]} rotation={[0, -a, 0]} ink={1.16} />;
        })}
      </group>
    </>
  );
}

/** 30 frames a second while visible; nothing while hidden or off screen. */
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

export default function King3D({ still = false, onPhase }: { still?: boolean; onPhase?: (p: CheckPhase) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!box.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.01 });
    io.observe(box.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={box} className="king3d">
      <Canvas
        dpr={[1, 1.5]}
        frameloop="demand"
        camera={{ position: [2.2, 2.1, 6.6], fov: 36 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        onCreated={({ camera }) => camera.lookAt(-1.1, 0.2, 0)}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} />
        <Scene still={still} onPhase={onPhase} />
        <Pace on={visible && !still} />
      </Canvas>
    </div>
  );
}
