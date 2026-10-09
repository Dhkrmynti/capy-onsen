/**
 * The house coin in 3D: a struck gold piece with the H monogram on the obverse and $HEIR on
 * the reverse, a reeded edge, lit by a soft studio of light panels (no HDR download).
 * The relief is a bump map drawn on a canvas, so there are no model or image files to load.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

const GOLD = new THREE.Color("#e2b45a");
// Stood on its edge, a cylinder shows its caps a quarter turn off; turning the art back a
// quarter sets both faces upright (checked face-on with ?coin=front and ?coin=back).
const FACE_TURN = Math.PI / 2;
// ?coin=front or ?coin=back holds the coin square to the camera (for checking the engraving).
const POSE = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("coin");

/** Draws one face of the coin as a height map: white is raised, black is sunk. */
export function faceTexture(side: "obverse" | "reverse") {
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const mid = S / 2;
  g.fillStyle = "#5a5a5a";
  g.fillRect(0, 0, S, S);


  // raised rim and a beaded inner ring, like a struck coin
  g.strokeStyle = "#ffffff";
  g.lineWidth = 46;
  g.beginPath();
  g.arc(mid, mid, 478, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#e6e6e6";
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    g.beginPath();
    g.arc(mid + Math.cos(a) * 418, mid + Math.sin(a) * 418, 7, 0, Math.PI * 2);
    g.fill();
  }

  // the legend around the edge, set in the house capitals
  const legend = side === "obverse" ? "HEIRLOOM · THE FAMILY VAULT · EST. BLOCK ONE · " : "THE INHERITANCE · PAID TO THE TEN HEIRS · ";
  g.font = '600 46px "Cinzel", Georgia, serif';
  g.fillStyle = "#d8d8d8";
  g.textAlign = "center";
  g.textBaseline = "middle";
  const chars = legend.split("");
  chars.forEach((ch, i) => {
    const a = (i / chars.length) * Math.PI * 2 - Math.PI / 2;
    g.save();
    g.translate(mid + Math.cos(a) * 356, mid + Math.sin(a) * 356);
    g.rotate(a + Math.PI / 2);
    g.fillText(ch, 0, 0);
    g.restore();
  });

  // the field: a fine guilloche, then the device in high relief
  g.strokeStyle = "rgba(255,255,255,0.35)";
  g.lineWidth = 2;
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2;
    g.beginPath();
    g.arc(mid + Math.cos(a) * 70, mid + Math.sin(a) * 70, 210, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = "#4a4a4a";
  g.beginPath();
  g.arc(mid, mid, 236, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#f0f0f0";
  g.lineWidth = 10;
  g.beginPath();
  g.arc(mid, mid, 236, 0, Math.PI * 2);
  g.stroke();

  g.fillStyle = "#ffffff";
  if (side === "obverse") {
    g.font = '700 250px "Cinzel", Georgia, serif';
    g.fillText("H", mid, mid + 18);
  } else {
    g.font = '700 120px "Cinzel", Georgia, serif';
    g.fillText("$HEIR", mid, mid - 20);
    g.font = '600 52px "Cinzel", Georgia, serif';
    g.fillText("NEVER SOLD", mid, mid + 92);
  }

  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8;
  // The cylinder is stood on its edge, which turns its caps a quarter; turn the art back upright.
  t.center.set(0.5, 0.5);
  t.rotation = FACE_TURN;
  t.needsUpdate = true;
  return t;
}

/** Vertical reeding for the edge. */
export function edgeTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 8;
  const g = c.getContext("2d")!;
  for (let x = 0; x < 512; x++) {
    const v = 128 + Math.round(Math.sin((x / 512) * Math.PI * 2 * 96) * 110);
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(x, 0, 1, 8);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

function Coin({ still, spin }: { still: boolean; spin: { current: number } }) {
  const ref = useRef<THREE.Group>(null);
  const [maps, setMaps] = useState<{ ob: THREE.Texture; re: THREE.Texture; edge: THREE.Texture } | null>(null);

  // Draw the faces once the house font is ready, so the legend is set in Cinzel.
  useEffect(() => {
    let alive = true;
    const make = () => alive && setMaps({ ob: faceTexture("obverse"), re: faceTexture("reverse"), edge: edgeTexture() });
    document.fonts?.load('700 100px "Cinzel"').then(make, make);
    return () => {
      alive = false;
    };
  }, []);

  const mats = useMemo(() => {
    if (!maps) return null;
    const base = { color: GOLD, metalness: 1, roughness: 0.28 };
    return [
      new THREE.MeshStandardMaterial({ ...base, bumpMap: maps.edge, bumpScale: 3, roughness: 0.34 }),
      new THREE.MeshStandardMaterial({ ...base, bumpMap: maps.ob, bumpScale: 6 }),
      new THREE.MeshStandardMaterial({ ...base, bumpMap: maps.re, bumpScale: 6 }),
    ];
  }, [maps]);

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    if (still) {
      g.rotation.set(0.35, -0.5, 0);
      return;
    }
    if (POSE) {
      g.rotation.set(0, POSE === "back" ? Math.PI : 0, 0);
      return;
    }
    // A slow turn, quickened by scrolling, tilted toward the pointer, breathing up and down.
    g.rotation.y += dt * (0.45 + spin.current * 6);
    spin.current *= 0.92;
    const p = state.pointer;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0.25 + p.y * 0.25, 0.06);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -p.x * 0.12, 0.06);
    g.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.08;
  });

  if (!mats) return null;
  return (
    <group ref={ref}>
      {/* stood on its edge, facing the reader */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={mats}>
        <cylinderGeometry args={[1.5, 1.5, 0.2, 128, 1]} />
      </mesh>
    </group>
  );
}

export default function Coin3D({ still = false }: { still?: boolean }) {
  const spin = useRef(0);

  // Scrolling gives the coin a flick; it settles back to its idle turn.
  useEffect(() => {
    if (still) return;
    let last = window.scrollY;
    const on = () => {
      const d = window.scrollY - last;
      last = window.scrollY;
      spin.current = Math.min(1.2, spin.current + Math.abs(d) / 600);
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [still]);

  return (
    <Canvas
      className="coin3d__canvas"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5.4], fov: 35 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      frameloop={still ? "demand" : "always"}
      aria-hidden="true"
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#fff3d6" />
      <directionalLight position={[-4, -2, 2]} intensity={0.6} color="#a8bfe6" />
      <Coin still={still} spin={spin} />
      {/* a small studio of soft light panels: gold reads as gold only with something to reflect */}
      <Environment resolution={256}>
        <Lightformer intensity={3} position={[0, 4, 4]} scale={[8, 2, 1]} color="#fff1cf" />
        <Lightformer intensity={1.6} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#2b4a80" />
        <Lightformer intensity={2} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} color="#ffe2a8" />
        <Lightformer intensity={0.8} position={[0, -4, 2]} rotation-x={-Math.PI / 2} scale={[8, 4, 1]} color="#ffffff" />
        {/* a soft panel behind the camera so a coin seen face-on still glows */}
        <Lightformer intensity={1.4} position={[0, 0.5, 7]} scale={[5, 5, 1]} color="#ffe9bd" />
      </Environment>
    </Canvas>
  );
}
