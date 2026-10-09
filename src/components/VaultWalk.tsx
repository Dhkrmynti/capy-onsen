/**
 * The walk into the house vault: one WebGL scene fixed behind the whole page. Scroll is the
 * visitor's feet. Each page section is an anchor; the camera rests at a station, then glides
 * to the next on a Catmull-Rom path while the scene acts out the mechanism: the door unlocks
 * and swings, three pedestals show where the fee goes, the deposit-box wall lights the
 * Preferred Ten, your own box slides out, the teller's desk holds the statement, and the door
 * closes behind you.
 *
 * Realism comes from physically based materials and light, not from downloads: a procedural
 * room environment for reflections, AgX tone mapping, brushed and scratched metals, polished
 * marble that reflects, soft shadows, ambient occlusion, bloom on the lamps and the fire.
 * Every texture is drawn on a canvas; there are no model or image files.
 */
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { edgeTexture, faceTexture } from "./Coin3D";

/* ───────────────────────── layout of the vault ───────────────────────── */

const X0 = 2.4; // the vault's axis; the door sits right of centre so the plaque has room
const W = 5; // half-width of the corridor
const HT = 3.6; // half-height of the corridor
const DOOR_R = 3;
const DEPTH = 46;
const BOX_COLS = 9;
const BOX_ROWS = 6;
const BOX_Z0 = -21;
const BOX_DZ = 1.35;
const BOX_DY = 1.05;
const TEN_ROW = 3; // eye level: the Preferred Ten live here
const MY_BOX = { col: 5, row: 2 };
const PED_Z = -9;
const DESK_Z = -40;

const ANCHORS = ["top", "payout", "rules", "register", "card", "blotter", "closing"] as const;

interface Station {
  pos: [number, number, number];
  look: [number, number, number];
}

const boxAt = (col: number, row: number) => new THREE.Vector3(X0 + W - 0.32, -HT + 0.85 + row * BOX_DY, BOX_Z0 - col * BOX_DZ);

function stations(narrow: boolean): Station[] {
  const side = narrow ? 0 : 1; // on a phone each object is framed dead centre
  const my = boxAt(MY_BOX.col, MY_BOX.row);
  return [
    { pos: [X0 - 3.4 * side, 0.2, 10.5 + 2.5 * (1 - side)], look: [X0 - 1.2 * side, 0, 0] }, // the sealed door
    { pos: [X0, 0.3, 2.4], look: [X0, -0.2, -6] }, // through the doorway
    { pos: [X0 - 1.0 * side, 0.5, -3.4], look: [X0 + 1.0 * side, -1.15, PED_Z] }, // the three pedestals
    { pos: [X0 + 1.6 * side, 0.3, -12.5], look: [X0 - W, 0.3, -16.5] }, // the conditions plate
    { pos: [X0 - 2.4 * side, 0.2, -23.5], look: [X0 + W, 0, -26.5] }, // the deposit-box wall
    { pos: [X0 + 0.4 * side, 0.55, my.z + 1.9], look: [my.x - 2.3, my.y - 0.35, my.z] }, // your box, drawn out
    { pos: [X0, 1.6, DESK_Z + 5.2], look: [X0, -0.8, DESK_Z] }, // the teller's desk
    { pos: [X0 + 0.7, 0.35, -5.6], look: [X0, 0, 0] }, // turned round: the door shuts behind you
  ];
}

/* ───────────────────────── procedural textures ───────────────────────── */

const rand = (() => {
  let s = 7;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
})();

function canvas(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, opts: { repeat?: [number, number]; color?: boolean } = {}) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8;
  if (opts.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...opts.repeat);
  }
  if (opts.color) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Brushed metal: fine streaks, a few deeper scratches. Used as roughness and bump. */
function brushed(repeat: [number, number] = [1, 1], scratches = 40) {
  return canvas(
    512,
    512,
    (g) => {
      g.fillStyle = "#8a8a8a";
      g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 2600; i++) {
        const v = 110 + Math.floor(rand() * 60);
        g.strokeStyle = `rgba(${v},${v},${v},${0.18 + rand() * 0.25})`;
        g.lineWidth = rand() * 1.4;
        const y = rand() * 512;
        const x = rand() * 512;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + 40 + rand() * 260, y + (rand() - 0.5) * 2);
        g.stroke();
      }
      for (let i = 0; i < scratches; i++) {
        g.strokeStyle = `rgba(230,230,230,${0.2 + rand() * 0.3})`;
        g.lineWidth = 0.6 + rand();
        const x = rand() * 512;
        const y = rand() * 512;
        const a = rand() * Math.PI;
        const l = 10 + rand() * 60;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        g.stroke();
      }
    },
    { repeat },
  );
}

/** Lathe marks for round turned parts: concentric rings. */
function turned() {
  return canvas(1024, 1024, (g) => {
    g.fillStyle = "#808080";
    g.fillRect(0, 0, 1024, 1024);
    for (let r = 4; r < 520; r += 2.2) {
      const v = 112 + Math.floor(rand() * 40);
      g.strokeStyle = `rgba(${v},${v},${v},0.55)`;
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(512, 512, r, 0, Math.PI * 2);
      g.stroke();
    }
  });
}

/** Riveted wall plates with seams and grime toward the floor. */
function plates(repeat: [number, number]) {
  return canvas(
    512,
    512,
    (g) => {
      const grd = g.createLinearGradient(0, 0, 0, 512);
      grd.addColorStop(0, "#9a9a9a");
      grd.addColorStop(1, "#6e6e6e");
      g.fillStyle = grd;
      g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 900; i++) {
        const v = 120 + Math.floor(rand() * 50);
        g.fillStyle = `rgba(${v},${v},${v},0.08)`;
        g.fillRect(rand() * 512, rand() * 512, 2 + rand() * 30, 1);
      }
      g.strokeStyle = "#3a3a3a";
      g.lineWidth = 5;
      g.strokeRect(2, 2, 508, 508);
      g.fillStyle = "#d0d0d0";
      for (let k = 0; k < 4; k++)
        for (let j = 0; j < 4; j++) {
          if (k > 0 && k < 3 && j > 0 && j < 3) continue;
          g.beginPath();
          g.arc(24 + k * 154.6, 24 + j * 154.6, 7, 0, Math.PI * 2);
          g.fill();
        }
    },
    { repeat },
  );
}

/** Dark polished marble with fine gold-grey veins. */
function marble(repeat: [number, number]) {
  return canvas(
    1024,
    1024,
    (g) => {
      g.fillStyle = "#121a2a";
      g.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 3000; i++) {
        g.fillStyle = `rgba(${30 + rand() * 30},${40 + rand() * 30},${60 + rand() * 30},0.25)`;
        g.fillRect(rand() * 1024, rand() * 1024, 3 + rand() * 9, 3 + rand() * 9);
      }
      for (let v = 0; v < 14; v++) {
        g.strokeStyle = `rgba(${170 + rand() * 60},${150 + rand() * 50},${110 + rand() * 40},${0.08 + rand() * 0.18})`;
        g.lineWidth = 0.6 + rand() * 2.4;
        g.beginPath();
        let x = rand() * 1024;
        let y = 0;
        g.moveTo(x, y);
        while (y < 1024) {
          x += (rand() - 0.5) * 70;
          y += 20 + rand() * 50;
          g.lineTo(x, y);
        }
        g.stroke();
      }
    },
    { repeat, color: true },
  );
}

/** Walnut grain. */
function walnut() {
  return canvas(
    1024,
    256,
    (g) => {
      g.fillStyle = "#3a2417";
      g.fillRect(0, 0, 1024, 256);
      for (let i = 0; i < 160; i++) {
        g.strokeStyle = `rgba(${20 + rand() * 30},${10 + rand() * 15},${5 + rand() * 8},${0.25 + rand() * 0.35})`;
        g.lineWidth = 0.5 + rand() * 2.5;
        const y = rand() * 256;
        g.beginPath();
        g.moveTo(0, y);
        for (let x = 0; x <= 1024; x += 32) g.lineTo(x, y + Math.sin(x / 90 + i) * 4 + (rand() - 0.5) * 2);
        g.stroke();
      }
    },
    { color: true },
  );
}

/** An engraved brass nameplate. */
function nameplate(name: string, top: string) {
  return canvas(
    512,
    128,
    (g) => {
      const grd = g.createLinearGradient(0, 0, 512, 128);
      grd.addColorStop(0, "#e9cd8a");
      grd.addColorStop(0.5, "#c9a25a");
      grd.addColorStop(1, "#a9823d");
      g.fillStyle = grd;
      g.fillRect(0, 0, 512, 128);
      for (let i = 0; i < 500; i++) {
        g.strokeStyle = `rgba(255,240,200,${rand() * 0.12})`;
        g.beginPath();
        const y = rand() * 128;
        g.moveTo(0, y);
        g.lineTo(512, y);
        g.stroke();
      }
      g.strokeStyle = "rgba(60,40,10,0.8)";
      g.lineWidth = 4;
      g.strokeRect(8, 8, 496, 112);
      g.textAlign = "center";
      g.textBaseline = "middle";
      const engrave = (text: string, font: string, y: number) => {
        g.font = font;
        g.fillStyle = "rgba(255,245,215,0.55)";
        g.fillText(text, 257, y + 1.5);
        g.fillStyle = "#2b1d08";
        g.fillText(text, 256, y);
      };
      engrave(top, '700 26px "Cinzel", Georgia, serif', 38);
      engrave(name.length > 18 ? name.slice(0, 17) + "…" : name, '600 40px "Bodoni Moda", Georgia, serif', 84);
    },
    { color: true },
  );
}

/** The gauge dial on the door frame: an ivory face with ticks. */
function gaugeFace() {
  return canvas(
    512,
    512,
    (g) => {
      g.fillStyle = "#efe6cf";
      g.beginPath();
      g.arc(256, 256, 256, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#1c1913";
      g.textAlign = "center";
      g.textBaseline = "middle";
      for (let i = 0; i <= 40; i++) {
        const a = ((-225 + (270 * i) / 40) * Math.PI) / 180;
        const long = i % 10 === 0;
        g.lineWidth = long ? 6 : 2.5;
        g.beginPath();
        g.moveTo(256 + Math.cos(a) * 220, 256 + Math.sin(a) * 220);
        g.lineTo(256 + Math.cos(a) * (long ? 178 : 198), 256 + Math.sin(a) * (long ? 178 : 198));
        g.stroke();
      }
      g.fillStyle = "#8c2430";
      g.beginPath();
      g.arc(256, 256, 214, (-45 * Math.PI) / 180 - 0.42, (-45 * Math.PI) / 180);
      g.arc(256, 256, 200, (-45 * Math.PI) / 180, (-45 * Math.PI) / 180 - 0.42, true);
      g.fill();
      g.fillStyle = "#1c1913";
      g.font = '700 34px "Cinzel", Georgia, serif';
      g.fillText("ESCROW", 256, 330);
      g.font = '600 26px "Cinzel", Georgia, serif';
      g.fillText("OLD MONEY", 256, 372);
    },
    { color: true },
  );
}

function flameSprite() {
  return canvas(128, 128, (g) => {
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,250,220,1)");
    grd.addColorStop(0.25, "rgba(255,200,90,0.9)");
    grd.addColorStop(0.6, "rgba(230,90,20,0.35)");
    grd.addColorStop(1, "rgba(120,20,0,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
  });
}

function slipTexture() {
  return canvas(
    512,
    700,
    (g) => {
      g.fillStyle = "#ece3cb";
      g.fillRect(0, 0, 512, 700);
      g.fillStyle = "#24427a";
      g.font = '700 40px "Cinzel", Georgia, serif';
      g.textAlign = "center";
      g.fillText("OLD MONEY", 256, 70);
      g.font = '600 22px "Cinzel", Georgia, serif';
      g.fillText("STATEMENT OF THE HOUSE", 256, 108);
      g.strokeStyle = "rgba(28,25,19,0.35)";
      for (let y = 160; y < 640; y += 38) {
        g.beginPath();
        g.moveTo(40, y);
        g.lineTo(472, y);
        g.stroke();
        g.fillStyle = "rgba(28,25,19,0.55)";
        g.fillRect(48, y - 22, 120 + rand() * 140, 8);
        g.fillRect(392, y - 22, 70, 8);
      }
    },
    { color: true },
  );
}

/* ───────────────────────── materials ───────────────────────── */

function useMats(narrow: boolean) {
  return useMemo(() => {
    const brush = brushed([2, 2]);
    const fine = brushed([1, 1], 120);
    const lathe = turned();
    const wallL = plates([DEPTH / 2.4, (HT * 2) / 2.4]);
    const wallR = plates([DEPTH / 2.4, (HT * 2) / 2.4]);
    const steel = (color: string, rough: number) =>
      new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness: rough, roughnessMap: brush, bumpMap: brush, bumpScale: 0.35 });
    return {
      wallFront: new THREE.MeshStandardMaterial({ color: "#1a2438", metalness: 0.75, roughness: 0.62, roughnessMap: wallL, bumpMap: wallL, bumpScale: 0.6 }),
      wallL: new THREE.MeshStandardMaterial({ color: "#2a3650", metalness: 0.85, roughness: 0.55, roughnessMap: wallL, bumpMap: wallL, bumpScale: 0.8 }),
      wallR: new THREE.MeshStandardMaterial({ color: "#2a3650", metalness: 0.85, roughness: 0.55, roughnessMap: wallR, bumpMap: wallR, bumpScale: 0.8 }),
      ceiling: new THREE.MeshStandardMaterial({ color: "#0e1525", metalness: 0.4, roughness: 0.85 }),
      marbleMap: marble([3, 14]),
      pedestalMarble: new THREE.MeshPhysicalMaterial({ map: marble([1, 1]), roughness: 0.18, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.1 }),
      doorSteel: new THREE.MeshPhysicalMaterial({ color: "#8a93a5", metalness: 1, roughness: 0.32, roughnessMap: lathe, bumpMap: lathe, bumpScale: 0.25 }),
      frame: steel("#4a5468", 0.45),
      bolt: new THREE.MeshPhysicalMaterial({ color: "#d4dae4", metalness: 1, roughness: 0.16, roughnessMap: fine }),
      brass: new THREE.MeshPhysicalMaterial({ color: "#c9a25a", metalness: 1, roughness: 0.24, roughnessMap: fine, clearcoat: 0.45, clearcoatRoughness: 0.2 }),
      box: steel("#6b7386", 0.36),
      boxLit: new THREE.MeshPhysicalMaterial({ color: "#c49c52", metalness: 1, roughness: 0.22, roughnessMap: fine, clearcoat: 0.5, clearcoatRoughness: 0.15 }),
      wax: new THREE.MeshPhysicalMaterial({ color: "#7c1d27", roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.25 }),
      paper: new THREE.MeshStandardMaterial({ color: "#e9e0c8", roughness: 0.95 }),
      slip: new THREE.MeshStandardMaterial({ map: slipTexture(), roughness: 0.9 }),
      walnut: new THREE.MeshPhysicalMaterial({ map: walnut(), roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
      leather: new THREE.MeshStandardMaterial({ color: "#163626", roughness: 0.72 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#1d6b47", roughness: 0.15, clearcoat: 1, emissive: new THREE.Color("#0e3a24"), emissiveIntensity: 0.6, side: THREE.DoubleSide }),
      lamp: new THREE.MeshStandardMaterial({ color: "#fff1d0", emissive: new THREE.Color("#ffe2a8"), emissiveIntensity: 3.2, toneMapped: false }),
      narrow,
    };
  }, [narrow]);
}
type Mats = ReturnType<typeof useMats>;

const COIN_GOLD = { color: "#e2b04f", metalness: 1, roughness: 0.2 };
function useCoinMats() {
  return useMemo(
    () => [
      new THREE.MeshPhysicalMaterial({ ...COIN_GOLD, bumpMap: edgeTexture(), bumpScale: 3, roughness: 0.3 }),
      new THREE.MeshPhysicalMaterial({ ...COIN_GOLD, bumpMap: faceTexture("obverse"), bumpScale: 6, clearcoat: 0.4 }),
      new THREE.MeshPhysicalMaterial({ ...COIN_GOLD, bumpMap: faceTexture("reverse"), bumpScale: 6, clearcoat: 0.4 }),
    ],
    [],
  );
}

/* ───────────────────────── geometry helpers ───────────────────────── */

/** A turned profile (radius, height) spun round the y axis. */
const lathe = (pts: [number, number][], seg = 96) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

const rounded = (w: number, h: number, d: number, r = 0.04) => new RoundedBoxGeometry(w, h, d, 3, r);

/* ───────────────────────── the scene parts ───────────────────────── */

function Shell({ mats, narrow }: { mats: Mats; narrow: boolean }) {
  const frontWall = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-26, -14);
    s.lineTo(26, -14);
    s.lineTo(26, 14);
    s.lineTo(-26, 14);
    s.lineTo(-26, -14);
    const hole = new THREE.Path();
    hole.absarc(X0, 0, DOOR_R + 0.3, 0, Math.PI * 2, true);
    s.holes.push(hole);
    return new THREE.ShapeGeometry(s, 96);
  }, []);
  // the heavy frame ring: a stepped turned profile, like a machined vault frame
  const frameGeo = useMemo(
    () =>
      lathe([
        [DOOR_R + 0.28, 0.6],
        [DOOR_R + 0.36, 0.72],
        [DOOR_R + 0.7, 0.72],
        [DOOR_R + 0.78, 0.6],
        [DOOR_R + 0.86, 0.6],
        [DOOR_R + 0.92, 0.48],
        [DOOR_R + 1.1, 0.48],
        [DOOR_R + 1.16, 0.0],
        [DOOR_R + 0.28, -0.4],
      ]),
    [],
  );
  return (
    <group>
      <mesh geometry={frontWall} material={mats.wallFront} position={[0, 0, 0.01]} receiveShadow />
      <mesh geometry={frameGeo} material={mats.frame} position={[X0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow />
      {/* floor: polished marble that reflects the lamps and the gold */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[X0, -HT, -DEPTH / 2]} receiveShadow>
        <planeGeometry args={[W * 2, DEPTH]} />
        {narrow ? (
          <meshPhysicalMaterial map={mats.marbleMap} roughness={0.22} metalness={0.1} clearcoat={0.8} clearcoatRoughness={0.12} />
        ) : (
          <MeshReflectorMaterial map={mats.marbleMap} blur={[400, 120]} resolution={512} mixBlur={1} mixStrength={2.2} roughness={0.85} depthScale={0.8} minDepthThreshold={0.4} maxDepthThreshold={1.3} color="#9aa6c2" metalness={0.35} mirror={0.55} />
        )}
      </mesh>
      <mesh material={mats.ceiling} rotation={[Math.PI / 2, 0, 0]} position={[X0, HT, -DEPTH / 2]}>
        <planeGeometry args={[W * 2, DEPTH]} />
      </mesh>
      <mesh material={mats.wallL} rotation={[0, Math.PI / 2, 0]} position={[X0 - W, 0, -DEPTH / 2]} receiveShadow>
        <planeGeometry args={[DEPTH, HT * 2]} />
      </mesh>
      <mesh material={mats.wallR} rotation={[0, -Math.PI / 2, 0]} position={[X0 + W, 0, -DEPTH / 2]} receiveShadow>
        <planeGeometry args={[DEPTH, HT * 2]} />
      </mesh>
      <mesh material={mats.wallFront} position={[X0, 0, -DEPTH]}>
        <planeGeometry args={[W * 2, HT * 2]} />
      </mesh>
      {/* a marble skirting on both walls */}
      {[-1, 1].map((s) => (
        <mesh key={s} material={mats.pedestalMarble} position={[X0 + s * (W - 0.06), -HT + 0.25, -DEPTH / 2]}>
          <boxGeometry args={[0.14, 0.5, DEPTH]} />
        </mesh>
      ))}
      <CeilingLights mats={mats} narrow={narrow} />
    </group>
  );
}

/** Ceiling fixtures: a housing, a glowing diffuser, a pool of light, a faint shaft of it. */
function CeilingLights({ mats, narrow }: { mats: Mats; narrow: boolean }) {
  const zs = [-4.5, -12, -19, -26, -33, -39.5];
  const shaft = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ffd9a0", transparent: true, opacity: 0.045, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
    [],
  );
  return (
    <group>
      {zs.map((z, i) => (
        <group key={z} position={[X0, HT, z]}>
          <mesh material={mats.frame} position={[0, -0.06, 0]}>
            <primitive object={rounded(2.9, 0.12, 0.5, 0.03)} attach="geometry" />
          </mesh>
          <mesh material={mats.lamp} position={[0, -0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.6, 0.32]} />
          </mesh>
          <mesh material={shaft} position={[0, -HT + 0.4, 0]}>
            <cylinderGeometry args={[0.4, 2.2, HT * 2 - 0.8, 32, 1, true]} />
          </mesh>
          <spotLight
            position={[0, -0.25, 0]}
            angle={0.75}
            penumbra={0.85}
            intensity={narrow ? 26 : 34}
            distance={16}
            decay={1.6}
            color="#ffe0ad"
            castShadow={!narrow && i < 4}
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0004}
          >
            <object3D attach="target" position={[0, -HT * 2, 0]} />
          </spotLight>
        </group>
      ))}
    </group>
  );
}

/** The round vault door: a stepped steel face, locking bolts, a brass wheel. */
function Door({ mats, wheelRef, boltsRef, hingeRef }: { mats: Mats; wheelRef: React.RefObject<THREE.Group | null>; boltsRef: React.RefObject<THREE.Group | null>; hingeRef: React.RefObject<THREE.Group | null> }) {
  const face = useMemo(
    () =>
      lathe(
        [
          [0, 0.42],
          [0.38, 0.42],
          [0.44, 0.36],
          [1.0, 0.36],
          [1.04, 0.4],
          [1.5, 0.4],
          [1.56, 0.32],
          [2.32, 0.32],
          [2.38, 0.38],
          [2.78, 0.38],
          [2.92, 0.22],
          [DOOR_R, -0.36],
          [0, -0.36],
        ],
        160,
      ),
    [],
  );
  const hub = useMemo(
    () =>
      lathe([
        [0, 0.34],
        [0.18, 0.34],
        [0.3, 0.26],
        [0.36, 0.06],
        [0.36, 0],
        [0, 0],
      ]),
    [],
  );
  return (
    <group position={[X0 - DOOR_R, 0, 0.05]}>
      {/* the hinge barrels */}
      {[1.5, -1.5].map((y) => (
        <mesh key={y} material={mats.frame} position={[-0.3, y, 0.25]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 1.0, 32]} />
        </mesh>
      ))}
      <group ref={hingeRef}>
        <group position={[DOOR_R, 0, 0]}>
          <mesh geometry={face} material={mats.doorSteel} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow />
          <group ref={boltsRef}>
            {Array.from({ length: 14 }, (_, i) => {
              const a = (i / 14) * Math.PI * 2;
              return (
                <mesh key={i} material={mats.bolt} rotation={[0, 0, a - Math.PI / 2]} position={[Math.cos(a) * (DOOR_R + 0.3), Math.sin(a) * (DOOR_R + 0.3), 0]} castShadow>
                  <capsuleGeometry args={[0.12, 0.55, 8, 20]} />
                </mesh>
              );
            })}
          </group>
          <group ref={wheelRef} position={[0, 0, 0.48]}>
            <mesh material={mats.brass} castShadow>
              <torusGeometry args={[1.18, 0.075, 32, 160]} />
            </mesh>
            {Array.from({ length: 5 }, (_, i) => (
              <mesh key={i} material={mats.brass} rotation={[0, 0, (i / 5) * Math.PI * 2]} castShadow>
                <capsuleGeometry args={[0.05, 2.2, 8, 16]} />
              </mesh>
            ))}
            {Array.from({ length: 5 }, (_, i) => {
              const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
              return (
                <mesh key={`g${i}`} material={mats.brass} position={[Math.cos(a) * 1.18, Math.sin(a) * 1.18, 0.16]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <capsuleGeometry args={[0.07, 0.24, 8, 16]} />
                </mesh>
              );
            })}
            <mesh geometry={hub} material={mats.brass} rotation={[Math.PI / 2, 0, 0]} castShadow />
          </group>
          {/* the combination dial above the wheel */}
          <mesh material={mats.bolt} position={[0, 1.95, 0.42]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.36, 0.38, 0.12, 64]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/** The escrow gauge, fixed to the frame: the needle climbs toward the next payment. */
function Gauge({ mats, pct }: { mats: Mats; pct: number }) {
  const needle = useRef<THREE.Group>(null);
  const face = useMemo(() => new THREE.MeshStandardMaterial({ map: gaugeFace(), roughness: 0.6 }), []);
  const cur = useRef(0);
  useFrame((_, dt) => {
    cur.current = THREE.MathUtils.damp(cur.current, pct, 2, dt);
    const deg = -225 + 270 * cur.current;
    // canvas angles run clockwise from +x; the needle rotates about z the other way
    if (needle.current) needle.current.rotation.z = -((deg + 90) * Math.PI) / 180;
  });
  return (
    <group position={[X0 - DOOR_R - 0.25, DOOR_R - 0.15, 0.62]}>
      <mesh material={mats.brass} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.66, 0.16, 64]} />
      </mesh>
      <mesh material={face} position={[0, 0, 0.085]}>
        <circleGeometry args={[0.54, 64]} />
      </mesh>
      <group ref={needle} position={[0, 0, 0.1]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.03, 0.44, 0.01]} />
          <meshStandardMaterial color="#7c1d27" roughness={0.4} />
        </mesh>
      </group>
      <mesh material={mats.brass} position={[0, 0, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 24]} />
      </mesh>
      {/* the glass: a clear coat that only shows in the highlights */}
      <mesh position={[0, 0, 0.12]}>
        <circleGeometry args={[0.56, 64]} />
        <meshPhysicalMaterial transparent opacity={0.12} roughness={0.02} clearcoat={1} color="#ffffff" />
      </mesh>
    </group>
  );
}

/** Station two: three marble pedestals, one for each place the fee goes. */
function Pedestals({ mats, coin, narrow }: { mats: Mats; coin: THREE.Material[]; narrow: boolean }) {
  const top = useRef<THREE.Mesh>(null);
  const fire = useRef<THREE.Points>(null);
  const notes = useRef<THREE.Group>(null);
  const N = narrow ? 40 : 90;
  const column = useMemo(
    () =>
      lathe([
        [0, 0],
        [1.05, 0],
        [1.05, 0.18],
        [0.92, 0.24],
        [0.78, 0.36],
        [0.72, 1.7],
        [0.84, 1.82],
        [0.98, 1.9],
        [0.98, 2.08],
        [0, 2.08],
      ]),
    [],
  );
  const bowl = useMemo(
    () =>
      lathe([
        [0.18, 0],
        [0.55, 0.05],
        [0.74, 0.32],
        [0.78, 0.42],
        [0.72, 0.42],
        [0.5, 0.12],
        [0.18, 0.08],
      ]),
    [],
  );
  const fireGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(N * 3);
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [N]);
  const fireMat = useMemo(() => new THREE.PointsMaterial({ map: flameSprite(), size: 0.55, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: "#ffb35c", toneMapped: false }), []);
  const seeds = useMemo(() => Array.from({ length: N }, () => [Math.random(), Math.random() * Math.PI * 2, Math.random()]), [N]);

  useFrame((st) => {
    const t = st.clock.elapsedTime;
    if (top.current) top.current.rotation.y = t * 0.5;
    const pos = fireGeo.getAttribute("position") as THREE.BufferAttribute;
    seeds.forEach(([s, a, r], i) => {
      const k = (t * (0.7 + s * 0.6) + s) % 1;
      const rad = (1 - k) * 0.32 * r;
      pos.setXYZ(i, Math.cos(a + t * 2) * rad, 0.42 + k * 1.15, Math.sin(a + t * 2) * rad);
    });
    pos.needsUpdate = true;
    if (fire.current) (fire.current.material as THREE.PointsMaterial).size = 0.5 + Math.sin(t * 13) * 0.04;
    notes.current?.children.forEach((n, i) => {
      const k = (t * 0.28 + i / 3) % 1;
      n.position.set(Math.sin(t + i) * 0.2, 0.5 + k * 1.3, Math.cos(t * 0.7 + i) * 0.12);
      n.rotation.set(0.3 + k, t + i, Math.sin(t + i) * 0.6 + k * 2);
      const m = (n as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.opacity = 1 - k;
      m.emissiveIntensity = k * 1.8;
    });
  });
  const noteMats = useMemo(() => [0, 1, 2].map(() => new THREE.MeshStandardMaterial({ color: "#e6dcc0", roughness: 0.9, transparent: true, emissive: new THREE.Color("#ff7a2a"), side: THREE.DoubleSide })), []);

  return (
    <group>
      {[-2.8, 0, 2.8].map((dx) => (
        <mesh key={dx} geometry={column} material={mats.pedestalMarble} position={[X0 + dx, -HT, PED_Z]} castShadow receiveShadow />
      ))}
      {/* the dividend: a stack of struck coins, the top one turning */}
      <group position={[X0 - 2.8, -HT + 2.08, PED_Z]}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} material={coin} position={[Math.sin(i * 1.7) * 0.025, 0.06 + i * 0.12, Math.cos(i * 1.3) * 0.025]} rotation={[0, i * 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.55, 0.11, 96]} />
          </mesh>
        ))}
        <mesh ref={top} material={coin} position={[0, 1.65, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.1, 96]} />
        </mesh>
      </group>
      {/* the reserve: a steel strongbox, banded in brass */}
      <group position={[X0, -HT + 2.08, PED_Z]}>
        <mesh material={mats.box} position={[0, 0.5, 0]} castShadow receiveShadow>
          <primitive object={rounded(1.3, 0.95, 0.9, 0.06)} attach="geometry" />
        </mesh>
        {[-0.45, 0.45].map((x) => (
          <mesh key={x} material={mats.brass} position={[x, 0.5, 0]} castShadow>
            <primitive object={rounded(0.1, 0.99, 0.94, 0.02)} attach="geometry" />
          </mesh>
        ))}
        <mesh material={mats.bolt} position={[0, 0.55, 0.46]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.14, 0.05, 48]} />
        </mesh>
      </group>
      {/* retired notes: a brass brazier, the notes rise into the fire and burn away */}
      <group position={[X0 + 2.8, -HT + 2.08, PED_Z]}>
        <mesh geometry={bowl} material={mats.brass} castShadow />
        <points ref={fire} geometry={fireGeo} material={fireMat} />
        <group ref={notes}>
          {noteMats.map((m, i) => (
            <mesh key={i} material={m}>
              <planeGeometry args={[0.42, 0.22]} />
            </mesh>
          ))}
        </group>
        <pointLight color="#ff9a4a" intensity={9} distance={7} decay={1.7} position={[0, 0.9, 0.2]} />
      </group>
    </group>
  );
}

/** Station four: the deposit-box wall. The Preferred Ten are lit at eye level, by name. */
function DepositWall({ mats, names, closed, drawer }: { mats: Mats; names: string[]; closed: number; drawer: React.RefObject<THREE.Group | null> }) {
  const boxes = useRef<THREE.InstancedMesh>(null);
  const locks = useRef<THREE.InstancedMesh>(null);
  const boxGeo = useMemo(() => rounded(1.24, 0.94, 0.5, 0.035), []);
  const lockGeo = useMemo(() => rounded(0.16, 0.22, 0.04, 0.012), []);
  const ten = useMemo(() => Array.from({ length: 10 }, (_, i) => (i < BOX_COLS ? { col: i, row: TEN_ROW } : { col: i - BOX_COLS, row: TEN_ROW + 1 })), []);
  const isTen = (c: number, r: number) => ten.some((s) => s.col === c && s.row === r);
  const cells = useMemo(() => {
    const out: { col: number; row: number }[] = [];
    for (let c = 0; c < BOX_COLS; c++) for (let r = 0; r < BOX_ROWS; r++) if (!(c === MY_BOX.col && r === MY_BOX.row) && !isTen(c, r)) out.push({ col: c, row: r });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const plates = useMemo(() => ten.map((_, i) => nameplate(names[i] ?? "Vacant", `No. ${i + 1}`)), [names, ten]);
  const myPlate = useMemo(() => nameplate("Your box", "Private client"), []);
  const sealed = useMemo(() => {
    const n = Math.min(closed, 14);
    return cells.filter((_, i) => i % 3 === 1).slice(0, n);
  }, [closed, cells]);

  useEffect(() => {
    const m = boxes.current;
    const l = locks.current;
    if (!m || !l) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    cells.forEach((cell, i) => {
      o.position.copy(boxAt(cell.col, cell.row));
      o.rotation.set(0, -Math.PI / 2, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      // no two boxes were polished the same
      c.setHSL(0.6, 0.08 + rand() * 0.06, 0.38 + rand() * 0.1);
      m.setColorAt(i, c);
      o.position.x -= 0.27;
      o.position.y -= 0.1;
      o.updateMatrix();
      l.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    l.instanceMatrix.needsUpdate = true;
  }, [cells]);

  const my = boxAt(MY_BOX.col, MY_BOX.row);
  return (
    <group>
      <instancedMesh ref={boxes} args={[boxGeo, mats.box, cells.length]} castShadow receiveShadow />
      <instancedMesh ref={locks} args={[lockGeo, mats.brass, cells.length]} />
      {ten.map((s, i) => {
        const p = boxAt(s.col, s.row);
        return (
          <group key={i} position={p.toArray()} rotation={[0, -Math.PI / 2, 0]}>
            <mesh geometry={boxGeo} material={mats.boxLit} castShadow receiveShadow />
            <mesh position={[0, 0.12, 0.26]}>
              <planeGeometry args={[0.98, 0.245]} />
              <meshStandardMaterial map={plates[i]} metalness={0.6} roughness={0.35} />
            </mesh>
            <mesh geometry={lockGeo} material={mats.bolt} position={[0, -0.22, 0.26]} />
          </group>
        );
      })}
      {sealed.map((s, i) => {
        const p = boxAt(s.col, s.row);
        return (
          <mesh key={i} material={mats.wax} position={[p.x - 0.27, p.y - 0.1, p.z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.17, 0.18, 0.05, 32]} />
          </mesh>
        );
      })}
      {/* your box: a long drawer that slides out of the wall, open to show what it holds */}
      <group ref={drawer} position={my.toArray()} rotation={[0, -Math.PI / 2, 0]}>
        <mesh material={mats.box} position={[0, -0.37, -0.95]} castShadow receiveShadow>
          <boxGeometry args={[1.18, 0.06, 2.4]} />
        </mesh>
        {[-0.56, 0.56].map((x) => (
          <mesh key={x} material={mats.box} position={[x, -0.1, -0.95]} castShadow>
            <boxGeometry args={[0.06, 0.6, 2.4]} />
          </mesh>
        ))}
        <mesh material={mats.box} position={[0, -0.1, -2.12]}>
          <boxGeometry args={[1.18, 0.6, 0.06]} />
        </mesh>
        <mesh geometry={boxGeo} material={mats.boxLit} position={[0, 0, 0.0]} scale={[1, 1, 0.12]} castShadow />
        <mesh position={[0, 0.12, 0.05]}>
          <planeGeometry args={[0.98, 0.245]} />
          <meshStandardMaterial map={myPlate} metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh material={mats.brass} position={[0, -0.2, 0.09]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.035, 0.42, 6, 12]} />
        </mesh>
        {/* inside: a few coins and the account papers */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[-0.25 + (i % 2) * 0.12, -0.3 + i * 0.05, -0.7 - (i % 3) * 0.08]} rotation={[0, i, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 48]} />
            <meshPhysicalMaterial {...COIN_GOLD} />
          </mesh>
        ))}
        <mesh material={mats.slip} position={[0.22, -0.32, -1.25]} rotation={[-Math.PI / 2, 0, 0.25]}>
          <planeGeometry args={[0.5, 0.7]} />
        </mesh>
        <pointLight color="#ffd890" intensity={4} distance={2.5} decay={1.8} position={[0, 0.15, -0.9]} />
      </group>
      <pointLight color="#ffd890" intensity={9} distance={9} decay={1.6} position={[X0 + 1.5, 0.6, -26]} />
    </group>
  );
}

/** Station six: the teller's desk in walnut and leather, a banker's lamp, the slip, the coin. */
function Desk({ mats, coin }: { mats: Mats; coin: THREE.Material[] }) {
  const c = useRef<THREE.Mesh>(null);
  useFrame((st) => {
    if (c.current) c.current.rotation.y = st.clock.elapsedTime * 0.35;
  });
  const shade = useMemo(() => new THREE.CylinderGeometry(0.2, 0.2, 0.95, 32, 1, true, 0, Math.PI), []);
  return (
    <group position={[X0, -HT, DESK_Z]}>
      <mesh material={mats.walnut} position={[0, 1.45, 0]} castShadow receiveShadow>
        <primitive object={rounded(5.4, 0.14, 2.3, 0.05)} attach="geometry" />
      </mesh>
      <mesh material={mats.leather} position={[0, 1.525, 0.05]} receiveShadow>
        <boxGeometry args={[4.2, 0.02, 1.6]} />
      </mesh>
      <mesh material={mats.walnut} position={[0, 0.7, -0.55]} castShadow receiveShadow>
        <primitive object={rounded(5.2, 1.4, 1.0, 0.05)} attach="geometry" />
      </mesh>
      <mesh material={mats.slip} position={[-0.7, 1.54, 0.25]} rotation={[-Math.PI / 2, 0, 0.1]} receiveShadow>
        <planeGeometry args={[1.25, 1.7]} />
      </mesh>
      <mesh ref={c} material={coin} position={[1.15, 1.6, 0.35]} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.07, 96]} />
      </mesh>
      {/* the banker's lamp: brass stem, green glass shade, a warm bulb */}
      <mesh material={mats.brass} position={[1.9, 1.56, -0.45]} castShadow>
        <cylinderGeometry args={[0.24, 0.28, 0.06, 32]} />
      </mesh>
      <mesh material={mats.brass} position={[1.9, 1.9, -0.45]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 12]} />
      </mesh>
      <mesh geometry={shade} material={mats.glass} position={[1.72, 2.24, -0.25]} rotation={[0.35, 0, Math.PI / 2]} castShadow />
      <pointLight color="#ffd9a0" intensity={11} distance={7} decay={1.7} position={[1.6, 2.05, -0.05]} castShadow={false} />
    </group>
  );
}

/** The conditions plate on the left wall: a brushed brass plate on four standoffs. */
function ConditionsPlate({ mats }: { mats: Mats }) {
  return (
    <group position={[X0 - W + 0.08, 0.35, -16.5]} rotation={[0, Math.PI / 2, 0]}>
      <mesh material={mats.brass} castShadow>
        <primitive object={rounded(4.2, 2.8, 0.06, 0.02)} attach="geometry" />
      </mesh>
      {[
        [-1.95, 1.25],
        [1.95, 1.25],
        [-1.95, -1.25],
        [1.95, -1.25],
      ].map(([x, y]) => (
        <mesh key={`${x}${y}`} material={mats.bolt} position={[x, y, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
        </mesh>
      ))}
    </group>
  );
}

/* ───────────────────────── the walk ───────────────────────── */

function Walk({ narrow, still, names, closed, pct }: { narrow: boolean; still: boolean; names: string[]; closed: number; pct: number }) {
  const mats = useMats(narrow);
  const coin = useCoinMats();
  const wheel = useRef<THREE.Group>(null);
  const bolts = useRef<THREE.Group>(null);
  const hinge = useRef<THREE.Group>(null);
  const drawer = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);
  const u = useRef(0);
  const anchors = useRef<number[]>([]);
  const { camera, gl, scene, size } = useThree();

  // A procedural room as the environment: metals get something real to reflect.
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.32;
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  // On a phone the plaque sits low, so the picture is framed in the top half of the screen.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (narrow) cam.setViewOffset(size.width, size.height, 0, size.height * 0.2, size.width, size.height);
    else cam.clearViewOffset();
    cam.updateProjectionMatrix();
  }, [camera, narrow, size]);

  const curves = useMemo(() => {
    const st = stations(narrow);
    return {
      pos: new THREE.CatmullRomCurve3(st.map((s) => new THREE.Vector3(...s.pos)), false, "centripetal"),
      look: new THREE.CatmullRomCurve3(st.map((s) => new THREE.Vector3(...s.look)), false, "centripetal"),
      n: st.length,
    };
  }, [narrow]);

  useEffect(() => {
    const measure = () => {
      anchors.current = ANCHORS.map((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : 0;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("load", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", measure);
    };
  }, []);

  /** Scroll position → path parameter. The camera rests at each station, then moves on. */
  const target = () => {
    if (still) return 0;
    const a = anchors.current;
    if (!a.length) return 0;
    const y = window.scrollY + window.innerHeight * 0.1;
    const stops = [0, 2, 3, 4, 5, 6, 7];
    for (let i = 0; i < a.length - 1; i++) {
      if (y < a[i + 1]) {
        const raw = THREE.MathUtils.clamp((y - a[i]) / Math.max(1, a[i + 1] - a[i]), 0, 1);
        // the first leg passes through the doorway station without resting; the others dwell
        const t = i === 0 ? raw : THREE.MathUtils.smoothstep(raw, 0.3, 1);
        return (stops[i] + (stops[i + 1] - stops[i]) * t) / (curves.n - 1);
      }
    }
    return 1;
  };

  const p = useMemo(() => new THREE.Vector3(), []);
  const l = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, dt) => {
    u.current = THREE.MathUtils.damp(u.current, target(), 2.4, dt);
    const k = u.current;
    const seg = 1 / (curves.n - 1);
    // getPoint (not getPointAt): parameter k = i/(n-1) lands exactly on station i
    curves.pos.getPoint(k, p);
    curves.look.getPoint(k, l);
    p.x += state.pointer.x * 0.22;
    p.y += state.pointer.y * 0.12;
    camera.position.copy(p);
    camera.lookAt(l);

    const unlock = THREE.MathUtils.smoothstep(k, 0, seg * 0.55);
    const open = THREE.MathUtils.smoothstep(k, seg * 0.3, seg * 1.0);
    const shut = THREE.MathUtils.smoothstep(k, seg * 6.35, seg * 6.95);
    if (wheel.current) wheel.current.rotation.z = -unlock * Math.PI * 2.5 + shut * Math.PI * 2.5;
    bolts.current?.children.forEach((b, i) => {
      const a = (i / 14) * Math.PI * 2;
      const r = DOOR_R + 0.3 - 0.2 * Math.max(0, unlock - shut);
      b.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
    });
    if (hinge.current) hinge.current.rotation.y = -Math.max(0, open - shut) * 1.62;
    if (glow.current) glow.current.intensity = 6 + Math.max(0, open - shut) * 30;

    const out = THREE.MathUtils.smoothstep(k, seg * 4.15, seg * 4.85) - THREE.MathUtils.smoothstep(k, seg * 5.35, seg * 5.95);
    if (drawer.current) drawer.current.position.x = X0 + W - 0.32 - out * 2.3;
  });

  return (
    <group>
      <Shell mats={mats} narrow={narrow} />
      <Door mats={mats} wheelRef={wheel} boltsRef={bolts} hingeRef={hinge} />
      <Gauge mats={mats} pct={pct} />
      <pointLight ref={glow} color="#ffcf7a" intensity={6} distance={16} decay={1.5} position={[X0, 0.5, -2.5]} />
      <Pedestals mats={mats} coin={coin} narrow={narrow} />
      <ConditionsPlate mats={mats} />
      <DepositWall mats={mats} names={names} closed={closed} drawer={drawer} />
      <Desk mats={mats} coin={coin} />
    </group>
  );
}

export default function VaultWalk({ names, closed, pct = 0, still = false }: { names: string[]; closed: number; pct?: number; still?: boolean }) {
  const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;
  return (
    <Canvas
      className="walk__canvas"
      shadows={narrow ? false : "soft"}
      dpr={narrow ? [1, 1.25] : [1, 1.5]}
      camera={{ position: [X0 - 3.4, 0.2, 10.5], fov: narrow ? 56 : 42, near: 0.1, far: 80 }}
      gl={{ antialias: false, alpha: false, toneMapping: THREE.AgXToneMapping, toneMappingExposure: 1.15, powerPreference: "high-performance" }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#0b1424");
        scene.fog = new THREE.FogExp2("#0b1424", 0.028);
      }}
      frameloop={still ? "demand" : "always"}
      aria-hidden="true"
    >
      <hemisphereLight args={["#6b80ad", "#1c1408", 0.35]} />
      <directionalLight position={[-6, 6, 12]} intensity={0.9} color="#dfe6f5" />
      <Walk narrow={narrow} still={still} names={names} closed={closed} pct={pct} />
      {narrow ? (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.55} luminanceThreshold={0.85} mipmapBlur />
          <Vignette darkness={0.5} offset={0.3} />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={0}>
          <N8AO aoRadius={1.1} intensity={2.4} distanceFalloff={1.2} quality="medium" halfRes />
          <Bloom intensity={0.6} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur />
          <Vignette darkness={0.55} offset={0.28} />
          <Noise opacity={0.035} premultiply />
        </EffectComposer>
      )}
    </Canvas>
  );
}
