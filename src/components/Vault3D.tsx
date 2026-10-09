/**
 * The vault door behind the hero: a round steel door with locking bolts, a brass wheel and a
 * dial, built from primitives (no model files). As the page scrolls past the hero the wheel
 * turns, the bolts draw back and the door swings open on its hinge; gold light spills out.
 */
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

const STEEL = new THREE.Color("#7f8aa0");
const STEEL_DARK = new THREE.Color("#3b4558");
const BRASS = new THREE.Color("#d7b268");
const R = 3; // door radius
const BOLTS = 12;

/** Concentric machining and rivets for the door's face, as a bump map. */
function doorFace() {
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const m = S / 2;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, S, S);
  // fine lathe rings
  for (let r = 20; r < 500; r += 6) {
    const v = 120 + ((r / 6) % 2 ? 14 : -14);
    g.strokeStyle = `rgb(${v},${v},${v})`;
    g.lineWidth = 3;
    g.beginPath();
    g.arc(m, m, r, 0, Math.PI * 2);
    g.stroke();
  }
  // two raised bands and a sunk channel
  const band = (r: number, w: number, v: number) => {
    g.strokeStyle = `rgb(${v},${v},${v})`;
    g.lineWidth = w;
    g.beginPath();
    g.arc(m, m, r, 0, Math.PI * 2);
    g.stroke();
  };
  band(470, 30, 230);
  band(330, 18, 30);
  band(300, 22, 220);
  // rivets
  g.fillStyle = "#ffffff";
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    g.beginPath();
    g.arc(m + Math.cos(a) * 410, m + Math.sin(a) * 410, 11, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8;
  return t;
}

/** Tick marks for the combination dial. */
function dialFace() {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const m = S / 2;
  g.fillStyle = "#7a7a7a";
  g.fillRect(0, 0, S, S);
  g.strokeStyle = "#ffffff";
  for (let i = 0; i < 100; i++) {
    const a = (i / 100) * Math.PI * 2;
    const long = i % 10 === 0;
    g.lineWidth = long ? 6 : 3;
    g.beginPath();
    g.moveTo(m + Math.cos(a) * 236, m + Math.sin(a) * 236);
    g.lineTo(m + Math.cos(a) * (long ? 196 : 214), m + Math.sin(a) * (long ? 196 : 214));
    g.stroke();
  }
  g.fillStyle = "#2a2a2a";
  g.beginPath();
  g.arc(m, m, 150, 0, Math.PI * 2);
  g.fill();
  return new THREE.CanvasTexture(c);
}

function Door({ progress }: { progress: { current: number } }) {
  const hinge = useRef<THREE.Group>(null);
  const wheel = useRef<THREE.Group>(null);
  const dial = useRef<THREE.Mesh>(null);
  const bolts = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);
  const spill = useRef<THREE.MeshBasicMaterial>(null);
  const eased = useRef(0);

  const mats = useMemo(() => {
    const face = doorFace();
    const dialMap = dialFace();
    const steel = { color: STEEL, metalness: 0.92, roughness: 0.38 };
    return {
      door: [
        new THREE.MeshStandardMaterial({ ...steel, color: STEEL_DARK, roughness: 0.5 }),
        new THREE.MeshStandardMaterial({ ...steel, bumpMap: face, bumpScale: 4 }),
        new THREE.MeshStandardMaterial({ ...steel, color: STEEL_DARK }),
      ],
      frame: new THREE.MeshStandardMaterial({ color: STEEL_DARK, metalness: 0.9, roughness: 0.45 }),
      bolt: new THREE.MeshStandardMaterial({ color: "#c4ccd8", metalness: 1, roughness: 0.22 }),
      brass: new THREE.MeshStandardMaterial({ color: BRASS, metalness: 1, roughness: 0.26 }),
      dial: new THREE.MeshStandardMaterial({ color: "#cfd5de", metalness: 0.95, roughness: 0.3, bumpMap: dialMap, bumpScale: 3 }),
    };
  }, []);

  useFrame((state, dt) => {
    // Ease toward the scroll position so the door moves like something heavy.
    eased.current = THREE.MathUtils.damp(eased.current, progress.current, 3.2, dt);
    const p = eased.current;
    const unlock = THREE.MathUtils.smoothstep(p, 0, 0.35);
    const swing = THREE.MathUtils.smoothstep(p, 0.25, 0.9);
    if (wheel.current) wheel.current.rotation.z = -unlock * Math.PI * 2.5;
    if (dial.current) dial.current.rotation.z = state.clock.elapsedTime * 0.25 + unlock * 6;
    if (bolts.current) bolts.current.children.forEach((b) => (b.userData.slide = 1 - unlock * 0.55));
    bolts.current?.children.forEach((b, i) => {
      const a = (i / BOLTS) * Math.PI * 2;
      const r = R + 0.32 * b.userData.slide;
      b.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
    });
    if (hinge.current) hinge.current.rotation.y = -swing * 1.55;
    if (glow.current) glow.current.intensity = 2 + swing * 90;
    if (spill.current) spill.current.opacity = 0.15 + swing * 0.85;
    // a slow drift with the pointer
    const pt = state.pointer;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, pt.x * 0.5, 0.03);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, pt.y * 0.3, 0.03);
    state.camera.lookAt(1.2, 0, 0);
  });

  return (
    <group position={[2.6, 0.1, 0]} rotation={[0, -0.32, 0]}>
      {/* the frame in the wall */}
      <mesh material={mats.frame}>
        <torusGeometry args={[R + 0.55, 0.42, 24, 128]} />
      </mesh>
      {/* inside the vault: warm gold light, seen as the door opens */}
      <mesh position={[0, 0, -0.6]}>
        <circleGeometry args={[R + 0.2, 96]} />
        <meshBasicMaterial ref={spill} color="#e8be6a" transparent opacity={0.15} />
      </mesh>
      <pointLight ref={glow} position={[0, 0, -0.2]} color="#ffcf7a" intensity={2} distance={14} decay={1.6} />

      {/* the door hangs on a hinge at its left edge */}
      <group position={[-R, 0, 0.05]}>
        <mesh material={mats.frame} position={[-0.25, 1.4, 0.2]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.9, 24]} />
        </mesh>
        <mesh material={mats.frame} position={[-0.25, -1.4, 0.2]}>
          <cylinderGeometry args={[0.22, 0.22, 0.9, 24]} />
        </mesh>
        <group ref={hinge}>
          <group position={[R, 0, 0]}>
            <mesh material={mats.door} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[R, R, 0.7, 128, 1]} />
            </mesh>
            {/* locking bolts round the rim */}
            <group ref={bolts}>
              {Array.from({ length: BOLTS }, (_, i) => {
                const a = (i / BOLTS) * Math.PI * 2;
                return (
                  <mesh key={i} material={mats.bolt} rotation={[0, 0, a - Math.PI / 2]} userData={{ slide: 1 }}>
                    <cylinderGeometry args={[0.13, 0.13, 0.7, 20]} />
                  </mesh>
                );
              })}
            </group>
            {/* the brass wheel: rim, five spokes, a hub */}
            <group ref={wheel} position={[0, 0, 0.62]}>
              <mesh material={mats.brass}>
                <torusGeometry args={[1.15, 0.08, 20, 96]} />
              </mesh>
              {Array.from({ length: 5 }, (_, i) => (
                <mesh key={i} material={mats.brass} rotation={[0, 0, (i / 5) * Math.PI * 2]} position={[0, 0, 0]}>
                  <boxGeometry args={[0.09, 2.3, 0.09]} />
                </mesh>
              ))}
              {Array.from({ length: 5 }, (_, i) => {
                const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
                return (
                  <mesh key={`k${i}`} material={mats.brass} position={[Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0.08]}>
                    <sphereGeometry args={[0.13, 20, 16]} />
                  </mesh>
                );
              })}
              <mesh material={mats.brass} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.32, 0.36, 0.22, 48]} />
              </mesh>
            </group>
            {/* the combination dial above the wheel */}
            <mesh ref={dial} material={mats.dial} position={[0, 1.95, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.42, 0.42, 0.14, 64]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

export default function Vault3D({ still = false }: { still?: boolean }) {
  const progress = useRef(0);
  const host = useRef<HTMLDivElement>(null);

  // Scroll through the hero drives the door; it is fully open as the hero leaves the screen.
  useEffect(() => {
    const on = () => {
      const h = window.innerHeight || 1;
      progress.current = still ? 0 : Math.min(1, Math.max(0, window.scrollY / (h * 0.55)));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [still]);

  return (
    <div ref={host} className="vault3d__host">
      <Canvas
        className="vault3d__canvas"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 10], fov: 40 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        frameloop={still ? "demand" : "always"}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        aria-hidden="true"
      >
        <Pause host={host} still={still} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[-6, 6, 8]} intensity={1.6} color="#dfe6f5" />
        <directionalLight position={[8, -3, 4]} intensity={0.7} color="#ffd9a0" />
        <Door progress={progress} />
        <Environment resolution={256}>
          <Lightformer intensity={2.2} position={[0, 5, 4]} scale={[10, 2, 1]} color="#e9eefa" />
          <Lightformer intensity={1.4} position={[-6, 0, 3]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} color="#2b4a80" />
          <Lightformer intensity={1.6} position={[6, -1, 3]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} color="#ffdca0" />
        </Environment>
      </Canvas>
    </div>
  );
}

/** Stops drawing while the hero is scrolled away, and starts again when it comes back. */
function Pause({ host, still }: { host: { current: HTMLDivElement | null }; still: boolean }) {
  const setFrameloop = useThree((st) => st.setFrameloop);
  useEffect(() => {
    const el = host.current;
    if (!el || still) return;
    const io = new IntersectionObserver(([e]) => setFrameloop(e.isIntersecting ? "always" : "never"));
    io.observe(el);
    return () => io.disconnect();
  }, [host, still, setFrameloop]);
  return null;
}
