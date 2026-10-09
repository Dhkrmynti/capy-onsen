/**
 * The one 3D object on the page: a toy King, toon-shaded with a hard ink outline, turning slowly
 * on its square. Drawn at most 30 times a second and not at all while it is off screen.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

const INK = "#170c29";

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

function Inked({ geometry, material, position, rotation, scale = 1, ink = 1.06 }: { geometry: THREE.BufferGeometry; material: THREE.Material; position?: [number, number, number]; rotation?: [number, number, number]; scale?: number; ink?: number }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geometry} material={material} />
      <mesh geometry={geometry} material={OUTLINE} scale={ink} />
    </group>
  );
}

function King({ still }: { still: boolean }) {
  const g = useRef<THREE.Group>(null);
  const parts = useMemo(() => {
    // the turned body, base to collar
    const body = new THREE.LatheGeometry(
      [
        [0, 0],
        [1.05, 0],
        [1.05, 0.22],
        [0.86, 0.3],
        [0.62, 0.42],
        [0.5, 0.9],
        [0.42, 1.55],
        [0.62, 1.68],
        [0.72, 1.8],
        [0.0, 1.8],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      48,
    );
    const crown = new THREE.LatheGeometry(
      [
        [0, 0],
        [0.6, 0],
        [0.82, 0.55],
        [0.6, 0.6],
        [0, 0.6],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      48,
    );
    const bar = new THREE.BoxGeometry(0.2, 0.62, 0.2);
    const arm = new THREE.BoxGeometry(0.52, 0.2, 0.2);
    const ring = new THREE.TorusGeometry(0.66, 0.08, 10, 48);
    return { body, crown, bar, arm, ring };
  }, []);
  const mats = useMemo(() => ({ body: toon("#ff7a1a"), cream: toon("#fff6e3") }), []);

  useFrame((s) => {
    if (!g.current || still) return;
    const t = s.clock.elapsedTime;
    g.current.rotation.y = t * 0.6;
    g.current.position.y = -1.25 + Math.sin(t * 1.4) * 0.06;
  });

  return (
    <group ref={g} position={[0, -1.25, 0]}>
      <Inked geometry={parts.body} material={mats.body} ink={1.045} />
      <Inked geometry={parts.ring} material={mats.cream} position={[0, 1.66, 0]} rotation={[Math.PI / 2, 0, 0]} ink={1.12} />
      <Inked geometry={parts.crown} material={mats.body} position={[0, 1.8, 0]} ink={1.07} />
      <Inked geometry={parts.bar} material={mats.cream} position={[0, 2.7, 0]} ink={1.25} />
      <Inked geometry={parts.arm} material={mats.cream} position={[0, 2.75, 0]} ink={1.22} />
    </group>
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

export default function King3D({ still = false }: { still?: boolean }) {
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
        camera={{ position: [3.6, 2.2, 5.2], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        onCreated={({ camera }) => camera.lookAt(0, 0.25, 0)}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} />
        <King still={still} />
        <Pace on={visible && !still} />
      </Canvas>
    </div>
  );
}
