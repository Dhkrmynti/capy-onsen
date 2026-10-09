/**
 * The hero's one 3D object: a toy crown that drops onto the King's portrait and settles there,
 * turning slowly. When the King changes, it lifts off and drops again onto the new one.
 * Toon-shaded with a hard ink outline, at most 30 fps, nothing while off screen.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

const INK = "#170c29";

const STEPS = (() => {
  const t = new THREE.DataTexture(new Uint8Array([70, 70, 70, 255, 165, 165, 165, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();
const toon = (color: string) => new THREE.MeshToonMaterial({ color, gradientMap: STEPS });
const OUTLINE = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });

function Inked({ geometry, material, position, rotation, ink = 1.06 }: { geometry: THREE.BufferGeometry; material: THREE.Material; position?: [number, number, number]; rotation?: [number, number, number]; ink?: number }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry} material={material} />
      <mesh geometry={geometry} material={OUTLINE} scale={ink} />
    </group>
  );
}

/** Overshoot then settle, like a crown landing on a head. */
const land = (x: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  const k = Math.min(1, Math.max(0, x)) - 1;
  return 1 + c3 * k * k * k + c1 * k * k;
};

function Crown({ still, dropKey, empty }: { still: boolean; dropKey: string; empty: boolean }) {
  const g = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  const key = useRef(dropKey);
  const parts = useMemo(() => {
    const band = new THREE.CylinderGeometry(1, 1.05, 0.62, 48, 1, true);
    const rim = new THREE.TorusGeometry(1.04, 0.1, 10, 48);
    const point = new THREE.ConeGeometry(0.26, 0.86, 4);
    const ball = new THREE.SphereGeometry(0.14, 16, 12);
    const jewel = new THREE.OctahedronGeometry(0.17, 0);
    return { band, rim, point, ball, jewel };
  }, []);
  const mats = useMemo(() => ({ gold: toon("#ff9b2e"), deep: toon("#ff7a1a"), cream: toon("#fff6e3"), lime: toon("#c6f432"), violet: toon("#6c3bff") }), []);
  const points = 6;

  useFrame((s) => {
    if (!g.current) return;
    const t = s.clock.elapsedTime;
    if (key.current !== dropKey) {
      key.current = dropKey;
      start.current = t;
    }
    if (start.current === null) start.current = t;
    const k = still ? 1 : (t - start.current) / 1.15;
    const drop = land(k);
    // from above the frame to resting on the portrait (or hovering over an empty one)
    const rest = empty ? 0.35 + Math.sin(t * 1.6) * 0.12 : 0;
    g.current.position.y = 4.2 * (1 - drop) + rest;
    g.current.rotation.y = still ? 0.4 : t * 0.45 + (1 - Math.min(1, k)) * 3;
    g.current.rotation.z = Math.sin(t * 1.1) * 0.04 * Math.min(1, k);
  });

  return (
    <group ref={g} position={[0, 4.2, 0]} rotation={[0.12, 0, 0]}>
      <Inked geometry={parts.band} material={mats.gold} ink={1.04} />
      <mesh geometry={parts.band} material={mats.deep} scale={[0.96, 1, 0.96]} rotation={[0, 0, Math.PI]} />
      <Inked geometry={parts.rim} material={mats.cream} position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]} ink={1.12} />
      {Array.from({ length: points }, (_, i) => {
        const a = (i / points) * Math.PI * 2;
        const x = Math.cos(a) * 0.98;
        const z = Math.sin(a) * 0.98;
        return (
          <group key={i}>
            <Inked geometry={parts.point} material={mats.gold} position={[x, 0.7, z]} rotation={[0, -a + Math.PI / 4, 0]} ink={1.1} />
            <Inked geometry={parts.ball} material={mats.cream} position={[x, 1.17, z]} ink={1.25} />
            <Inked geometry={parts.jewel} material={i % 2 ? mats.lime : mats.violet} position={[Math.cos(a) * 1.07, 0, Math.sin(a) * 1.07]} rotation={[0, -a, 0]} ink={1.2} />
          </group>
        );
      })}
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

export default function Crown3D({ still = false, dropKey, empty = false }: { still?: boolean; dropKey: string; empty?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!box.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.01 });
    io.observe(box.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={box} className="crown3d">
      <Canvas dpr={[1, 1.5]} frameloop="demand" camera={{ position: [0, 1.6, 6.2], fov: 34 }} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} onCreated={({ camera }) => camera.lookAt(0, 0.3, 0)}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 5, 4]} intensity={2.3} />
        <Crown still={still} dropKey={dropKey} empty={empty} />
        <Pace on={visible && !still} />
      </Canvas>
    </div>
  );
}
