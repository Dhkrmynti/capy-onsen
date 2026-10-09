/**
 * The walk into the house vault: one WebGL scene fixed behind the whole page. Scroll is the
 * visitor's feet. Each page section is an anchor; the camera glides between stations on a
 * Catmull-Rom path while the scene acts out the mechanism: the door unlocks and swings,
 * three pedestals show where the fee goes, the deposit-box wall lights the Preferred Ten,
 * your own box slides out, the teller's desk holds the statement, and the door closes behind.
 * Everything is built from primitives and canvas textures: no model or image downloads.
 */
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { edgeTexture, faceTexture } from "./Coin3D";

/* ───────────────────────── layout of the vault ───────────────────────── */

const X0 = 2.4; // the vault's axis; the door sits right of centre so the plaque has room
const W = 5; // half-width of the corridor
const HT = 3.6; // half-height of the corridor
const DOOR_R = 3;
const DEPTH = 46;
const BOX_COLS = 9;
const BOX_ROWS = 6;
const BOX_Z0 = -21; // first column of deposit boxes along the right wall
const BOX_DZ = 1.35;
const BOX_DY = 1.05;
const TEN_ROW = 3; // eye level: the Preferred Ten live here
const MY_BOX = { col: 5, row: 2 };

const NAVY_STEEL = new THREE.Color("#2a3a58");
const STEEL = new THREE.Color("#7d889e");
const BRASS = new THREE.Color("#d6b067");
const GOLD = new THREE.Color("#e2b45a");

/** Section ids the camera arrives at, in page order, with the station it stops at. */
const ANCHORS = ["top", "payout", "rules", "register", "card", "blotter", "closing"] as const;

interface Station {
  pos: [number, number, number];
  look: [number, number, number];
}

function stations(narrow: boolean): Station[] {
  // On a phone the copy runs full width, so the camera frames each object dead centre.
  const side = narrow ? 0 : 1;
  return [
    { pos: [X0 - 3.4 * side, 0.2, 10.5 + 2 * (1 - side)], look: [X0 - 1.2 * side, 0, 0] }, // the sealed door
    { pos: [X0, 0.3, 2.6], look: [X0, 0, -6] }, // through the doorway
    { pos: [X0 - 1.2 * side, 0.2, -3.2], look: [X0 + 1.1 * side, -1.0, -9] }, // three pedestals
    { pos: [X0 + 1.6 * side, 0.3, -12.5], look: [X0 - W, 0.3, -16.5] }, // the conditions plate, left wall
    { pos: [X0 - 2.4 * side, 0.2, -23.5], look: [X0 + W, 0, -26.5] }, // the deposit-box wall, right
    { pos: [X0 + 1.6 * side, 0.1, -26.4], look: [X0 + W, 0.1 - (TEN_ROW - MY_BOX.row) * 0.1, BOX_Z0 - MY_BOX.col * BOX_DZ] }, // your box
    { pos: [X0, 1.7, -34.5], look: [X0, -0.7, -40] }, // the teller's desk
    { pos: [X0, 0.5, -30], look: [X0, 0, 0] }, // look back: the door closes behind you
  ];
}

/* ───────────────────────── canvas textures ───────────────────────── */

function doorFace() {
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const m = S / 2;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, S, S);
  for (let r = 20; r < 500; r += 6) {
    const v = 120 + ((r / 6) % 2 ? 14 : -14);
    g.strokeStyle = `rgb(${v},${v},${v})`;
    g.lineWidth = 3;
    g.beginPath();
    g.arc(m, m, r, 0, Math.PI * 2);
    g.stroke();
  }
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

/** Riveted steel plate for walls, tiled. */
function plateTexture() {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = "#7c7c7c";
  g.fillRect(0, 0, S, S);
  g.strokeStyle = "#444";
  g.lineWidth = 4;
  g.strokeRect(2, 2, S - 4, S - 4);
  g.fillStyle = "#c8c8c8";
  for (const [x, y] of [
    [16, 16],
    [S - 16, 16],
    [16, S - 16],
    [S - 16, S - 16],
  ]) {
    g.beginPath();
    g.arc(x, y, 6, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** An engraved brass nameplate with a holder's name. */
function nameplate(name: string, rank: number) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 0, 128);
  grd.addColorStop(0, "#f0d796");
  grd.addColorStop(1, "#b58b3e");
  g.fillStyle = grd;
  g.fillRect(0, 0, 512, 128);
  g.strokeStyle = "#5a4116";
  g.lineWidth = 6;
  g.strokeRect(6, 6, 500, 116);
  g.fillStyle = "#2a1d08";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = '700 30px "Cinzel", Georgia, serif';
  g.fillText(`No. ${rank}`, 256, 38);
  g.font = '600 40px "Bodoni Moda", Georgia, serif';
  const short = name.length > 18 ? name.slice(0, 17) + "…" : name;
  g.fillText(short, 256, 86);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  return t;
}

/* ───────────────────────── the scene parts ───────────────────────── */

function Shell({ mats }: { mats: Mats }) {
  // The front wall, with a round opening for the door.
  const frontWall = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-26, -14);
    s.lineTo(26, -14);
    s.lineTo(26, 14);
    s.lineTo(-26, 14);
    s.lineTo(-26, -14);
    const hole = new THREE.Path();
    hole.absarc(X0, 0, DOOR_R + 0.35, 0, Math.PI * 2, true);
    s.holes.push(hole);
    return new THREE.ShapeGeometry(s, 64);
  }, []);
  return (
    <group>
      <mesh geometry={frontWall} material={mats.wall} position={[0, 0, 0.01]} />
      {/* the corridor: floor, ceiling and two walls of riveted plate */}
      <mesh material={mats.floor} rotation={[-Math.PI / 2, 0, 0]} position={[X0, -HT, -DEPTH / 2]}>
        <planeGeometry args={[W * 2, DEPTH]} />
      </mesh>
      <mesh material={mats.ceiling} rotation={[Math.PI / 2, 0, 0]} position={[X0, HT, -DEPTH / 2]}>
        <planeGeometry args={[W * 2, DEPTH]} />
      </mesh>
      <mesh material={mats.plateL} rotation={[0, Math.PI / 2, 0]} position={[X0 - W, 0, -DEPTH / 2]}>
        <planeGeometry args={[DEPTH, HT * 2]} />
      </mesh>
      <mesh material={mats.plateR} rotation={[0, -Math.PI / 2, 0]} position={[X0 + W, 0, -DEPTH / 2]}>
        <planeGeometry args={[DEPTH, HT * 2]} />
      </mesh>
      <mesh material={mats.wall} position={[X0, 0, -DEPTH]}>
        <planeGeometry args={[W * 2, HT * 2]} />
      </mesh>
      {/* ceiling light strips, each with its own warm pool on the floor */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} material={mats.lamp} position={[X0, HT - 0.02, -4 - i * 6]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.6, 0.22]} />
        </mesh>
      ))}
      {[-6, -14, -22, -31, -38].map((z) => (
        <pointLight key={z} color="#ffe2b0" intensity={14} distance={13} decay={1.4} position={[X0, HT - 0.4, z]} />
      ))}
      {/* the door frame */}
      <mesh material={mats.frame} position={[X0, 0, 0]}>
        <torusGeometry args={[DOOR_R + 0.5, 0.4, 24, 128]} />
      </mesh>
    </group>
  );
}

interface Mats {
  wall: THREE.Material;
  floor: THREE.Material;
  ceiling: THREE.Material;
  plateL: THREE.Material;
  plateR: THREE.Material;
  lamp: THREE.Material;
  frame: THREE.Material;
  door: THREE.Material[];
  bolt: THREE.Material;
  brass: THREE.Material;
  gold: THREE.Material;
  box: THREE.Material;
  boxLit: THREE.Material;
  wax: THREE.Material;
  paper: THREE.Material;
  wood: THREE.Material;
}

function useMats(): Mats {
  return useMemo(() => {
    const plate = plateTexture();
    const pl = plate.clone();
    pl.repeat.set(DEPTH / 2.2, (HT * 2) / 2.2);
    pl.needsUpdate = true;
    const pr = plate.clone();
    pr.repeat.set(DEPTH / 2.2, (HT * 2) / 2.2);
    pr.needsUpdate = true;
    const face = doorFace();
    const steel = { metalness: 0.9, roughness: 0.42 };
    return {
      wall: new THREE.MeshStandardMaterial({ color: "#121c30", metalness: 0.6, roughness: 0.7 }),
      floor: new THREE.MeshStandardMaterial({ color: "#0f1829", metalness: 0.7, roughness: 0.32 }),
      ceiling: new THREE.MeshStandardMaterial({ color: "#0c1424", metalness: 0.5, roughness: 0.8 }),
      plateL: new THREE.MeshStandardMaterial({ color: NAVY_STEEL, ...steel, bumpMap: pl, bumpScale: 1.5 }),
      plateR: new THREE.MeshStandardMaterial({ color: NAVY_STEEL, ...steel, bumpMap: pr, bumpScale: 1.5 }),
      lamp: new THREE.MeshBasicMaterial({ color: "#ffe2a6" }),
      frame: new THREE.MeshStandardMaterial({ color: "#3b4558", metalness: 0.9, roughness: 0.45 }),
      door: [
        new THREE.MeshStandardMaterial({ color: "#3b4558", ...steel, roughness: 0.5 }),
        new THREE.MeshStandardMaterial({ color: STEEL, ...steel, bumpMap: face, bumpScale: 4 }),
        new THREE.MeshStandardMaterial({ color: "#3b4558", ...steel }),
      ],
      bolt: new THREE.MeshStandardMaterial({ color: "#c4ccd8", metalness: 1, roughness: 0.22 }),
      brass: new THREE.MeshStandardMaterial({ color: BRASS, metalness: 1, roughness: 0.26 }),
      gold: new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.22 }),
      box: new THREE.MeshStandardMaterial({ color: "#5c677d", metalness: 0.92, roughness: 0.38 }),
      boxLit: new THREE.MeshStandardMaterial({ color: "#c9a45c", metalness: 1, roughness: 0.24, emissive: new THREE.Color("#3a2a0a"), emissiveIntensity: 0.6 }),
      wax: new THREE.MeshStandardMaterial({ color: "#8c2430", metalness: 0.1, roughness: 0.55 }),
      paper: new THREE.MeshStandardMaterial({ color: "#efe6cf", metalness: 0, roughness: 0.9 }),
      wood: new THREE.MeshStandardMaterial({ color: "#2b1c13", metalness: 0.1, roughness: 0.6 }),
    };
  }, []);
}

/** The round vault door: hinged at its left edge, wheel and bolts on the front. */
function Door({ mats, wheelRef, boltsRef, hingeRef }: { mats: Mats; wheelRef: React.RefObject<THREE.Group | null>; boltsRef: React.RefObject<THREE.Group | null>; hingeRef: React.RefObject<THREE.Group | null> }) {
  return (
    <group position={[X0 - DOOR_R, 0, 0.05]}>
      <mesh material={mats.frame} position={[-0.25, 1.4, 0.2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.9, 24]} />
      </mesh>
      <mesh material={mats.frame} position={[-0.25, -1.4, 0.2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.9, 24]} />
      </mesh>
      <group ref={hingeRef}>
        <group position={[DOOR_R, 0, 0]}>
          <mesh material={mats.door} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[DOOR_R, DOOR_R, 0.7, 128, 1]} />
          </mesh>
          <group ref={boltsRef}>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <mesh key={i} material={mats.bolt} rotation={[0, 0, a - Math.PI / 2]} position={[Math.cos(a) * (DOOR_R + 0.32), Math.sin(a) * (DOOR_R + 0.32), 0]}>
                  <cylinderGeometry args={[0.13, 0.13, 0.7, 20]} />
                </mesh>
              );
            })}
          </group>
          <group ref={wheelRef} position={[0, 0, 0.62]}>
            <mesh material={mats.brass}>
              <torusGeometry args={[1.15, 0.08, 20, 96]} />
            </mesh>
            {Array.from({ length: 5 }, (_, i) => (
              <mesh key={i} material={mats.brass} rotation={[0, 0, (i / 5) * Math.PI * 2]}>
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
        </group>
      </group>
    </group>
  );
}

/** The struck OM coin, used on the dividend pedestal and on the teller's desk. */
function useCoinMats() {
  return useMemo(() => {
    const base = { color: GOLD, metalness: 1, roughness: 0.26 };
    return [
      new THREE.MeshStandardMaterial({ ...base, bumpMap: edgeTexture(), bumpScale: 3, roughness: 0.34 }),
      new THREE.MeshStandardMaterial({ ...base, bumpMap: faceTexture("obverse"), bumpScale: 6 }),
      new THREE.MeshStandardMaterial({ ...base, bumpMap: faceTexture("reverse"), bumpScale: 6 }),
    ];
  }, []);
}

/** Station two: three pedestals, one for each place the fee goes. */
function Pedestals({ mats, coin }: { mats: Mats; coin: THREE.Material[] }) {
  const top = useRef<THREE.Mesh>(null);
  const flames = useRef<THREE.Group>(null);
  const notes = useRef<THREE.Group>(null);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    if (top.current) top.current.rotation.y = t * 0.6;
    flames.current?.children.forEach((f, i) => {
      const s = 0.8 + Math.sin(t * 9 + i * 1.7) * 0.18;
      f.scale.set(s, 0.9 + Math.sin(t * 7 + i) * 0.25, s);
    });
    notes.current?.children.forEach((n, i) => {
      const k = (t * 0.35 + i / 4) % 1;
      n.position.y = 0.6 + k * 1.6;
      n.rotation.z = Math.sin(t + i) * 0.6 + k * 2;
      (n as THREE.Mesh).scale.setScalar(1 - k);
    });
  });
  const Z = -9;
  return (
    <group>
      {[-2.8, 0, 2.8].map((dx) => (
        <mesh key={dx} material={mats.frame} position={[X0 + dx, -HT + 1.1, Z]}>
          <cylinderGeometry args={[0.9, 1.05, 2.2, 48]} />
        </mesh>
      ))}
      {/* the dividend: a stack of struck coins, the top one turning */}
      <group position={[X0 - 2.8, -HT + 2.2, Z]}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} material={coin} position={[Math.sin(i) * 0.03, 0.06 + i * 0.13, Math.cos(i) * 0.03]}>
            <cylinderGeometry args={[0.6, 0.6, 0.12, 64]} />
          </mesh>
        ))}
        <mesh ref={top} material={coin} position={[0, 1.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.62, 0.62, 0.1, 64]} />
        </mesh>
      </group>
      {/* the reserve: a strongbox, banded in brass */}
      <group position={[X0, -HT + 2.2, Z]}>
        <mesh material={mats.box} position={[0, 0.5, 0]}>
          <boxGeometry args={[1.3, 0.95, 0.9]} />
        </mesh>
        <mesh material={mats.brass} position={[0, 0.5, 0]}>
          <boxGeometry args={[1.34, 0.12, 0.94]} />
        </mesh>
        <mesh material={mats.brass} position={[0, 0.62, 0.46]}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 24]} />
        </mesh>
      </group>
      {/* retired notes: a brazier, notes rising and burning away */}
      <group position={[X0 + 2.8, -HT + 2.2, Z]}>
        <mesh material={mats.brass} position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.7, 0.45, 0.4, 32, 1, true]} />
        </mesh>
        <group ref={flames} position={[0, 0.45, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[(i - 1) * 0.18, 0.25, 0]}>
              <coneGeometry args={[0.22, 0.75, 16]} />
              <meshBasicMaterial color={i === 1 ? "#ffd27a" : "#e8813a"} transparent opacity={0.85} />
            </mesh>
          ))}
        </group>
        <group ref={notes}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} material={mats.paper} position={[(i - 1.5) * 0.15, 0.8, 0]}>
              <planeGeometry args={[0.42, 0.22]} />
            </mesh>
          ))}
        </group>
        <pointLight color="#ff9a4a" intensity={6} distance={6} decay={1.8} position={[0, 1, 0.4]} />
      </group>
    </group>
  );
}

/** Station four: the deposit-box wall. The Preferred Ten are lit at eye level. */
function DepositWall({ mats, names, closed, drawer }: { mats: Mats; names: string[]; closed: number; drawer: React.RefObject<THREE.Group | null> }) {
  const boxes = useRef<THREE.InstancedMesh>(null);
  const plates = useMemo(() => names.slice(0, 10).map((n, i) => nameplate(n, i + 1)), [names]);
  const cells = useMemo(() => {
    const out: { col: number; row: number }[] = [];
    for (let c = 0; c < BOX_COLS; c++) for (let r = 0; r < BOX_ROWS; r++) if (!(c === MY_BOX.col && r === MY_BOX.row)) out.push({ col: c, row: r });
    return out;
  }, []);
  // The Ten fill eye-level cells left to right; sealed boxes are scattered on the lower rows.
  const ten = useMemo(() => {
    const seats: { col: number; row: number }[] = [];
    for (let c = 0; c < BOX_COLS && seats.length < 10; c++) seats.push({ col: c, row: TEN_ROW });
    if (seats.length < 10) seats.push({ col: 0, row: TEN_ROW + 1 });
    return seats;
  }, []);
  const sealed = useMemo(() => {
    const n = Math.min(closed, 14);
    const out: { col: number; row: number }[] = [];
    for (let i = 0; i < n; i++) out.push({ col: (i * 4 + 1) % BOX_COLS, row: i % 2 });
    return out;
  }, [closed]);
  const at = (col: number, row: number) => new THREE.Vector3(X0 + W - 0.32, -HT + 0.85 + row * BOX_DY, BOX_Z0 - col * BOX_DZ);

  useEffect(() => {
    const m = boxes.current;
    if (!m) return;
    const o = new THREE.Object3D();
    cells.forEach((cell, i) => {
      o.position.copy(at(cell.col, cell.row));
      o.rotation.set(0, -Math.PI / 2, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [cells]);

  return (
    <group>
      <instancedMesh ref={boxes} args={[undefined, undefined, cells.length]} material={mats.box}>
        <boxGeometry args={[1.22, 0.92, 0.5]} />
      </instancedMesh>
      {/* the Ten: a gilt front and an engraved nameplate each */}
      {ten.map((s, i) => {
        const p = at(s.col, s.row);
        return (
          <group key={i} position={[p.x - 0.27, p.y, p.z]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh material={mats.boxLit}>
              <boxGeometry args={[1.18, 0.88, 0.04]} />
            </mesh>
            {plates[i] ? (
              <mesh position={[0, 0.1, 0.03]}>
                <planeGeometry args={[0.92, 0.23]} />
                <meshBasicMaterial map={plates[i]} toneMapped={false} />
              </mesh>
            ) : null}
            <mesh material={mats.brass} position={[0, -0.24, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.06, 16]} />
            </mesh>
          </group>
        );
      })}
      {/* closed accounts: a red wax seal across the keyhole */}
      {sealed.map((s, i) => {
        const p = at(s.col, s.row);
        return (
          <mesh key={i} material={mats.wax} position={[p.x - 0.27, p.y - 0.05, p.z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.05, 24]} />
          </mesh>
        );
      })}
      {/* your box: it slides out of the wall at station five */}
      <group ref={drawer} position={at(MY_BOX.col, MY_BOX.row).toArray()} rotation={[0, -Math.PI / 2, 0]}>
        <mesh material={mats.box}>
          <boxGeometry args={[1.22, 0.92, 2.4]} />
        </mesh>
        <mesh material={mats.brass} position={[0, 0, 1.21]}>
          <boxGeometry args={[1.0, 0.7, 0.03]} />
        </mesh>
        <mesh material={mats.brass} position={[0, -0.18, 1.26]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 12]} />
        </mesh>
      </group>
      <pointLight color="#ffd890" intensity={10} distance={9} decay={1.6} position={[X0 + 1.5, 0.6, -26]} />
    </group>
  );
}

/** Station six: the teller's desk, a lamp, the statement slip and the house coin. */
function Desk({ mats, coin }: { mats: Mats; coin: THREE.Material[] }) {
  const c = useRef<THREE.Mesh>(null);
  useFrame((st) => {
    if (c.current) c.current.rotation.y = st.clock.elapsedTime * 0.4;
  });
  const Z = -40;
  return (
    <group position={[X0, -HT, Z]}>
      <mesh material={mats.wood} position={[0, 1.4, 0]}>
        <boxGeometry args={[5.2, 0.16, 2.2]} />
      </mesh>
      <mesh material={mats.wood} position={[0, 0.7, -0.6]}>
        <boxGeometry args={[5, 1.4, 0.9]} />
      </mesh>
      <mesh material={mats.paper} position={[-0.6, 1.49, 0.3]} rotation={[-Math.PI / 2, 0, 0.12]}>
        <planeGeometry args={[1.4, 1.9]} />
      </mesh>
      <mesh ref={c} material={coin} position={[1.2, 1.56, 0.3]}>
        <cylinderGeometry args={[0.38, 0.38, 0.08, 64]} />
      </mesh>
      {/* the banker's lamp */}
      <mesh material={mats.brass} position={[1.9, 1.75, -0.4]}>
        <cylinderGeometry args={[0.04, 0.04, 0.7, 12]} />
      </mesh>
      <mesh position={[1.7, 2.12, -0.2]} rotation={[0.4, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.9, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#1f5a3c" metalness={0.3} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color="#ffd9a0" intensity={9} distance={7} decay={1.7} position={[1.4, 2, 0.2]} />
    </group>
  );
}

/* ───────────────────────── the walk ───────────────────────── */

function Walk({ narrow, still, names, closed }: { narrow: boolean; still: boolean; names: string[]; closed: number }) {
  const mats = useMats();
  const coin = useCoinMats();
  const wheel = useRef<THREE.Group>(null);
  const bolts = useRef<THREE.Group>(null);
  const hinge = useRef<THREE.Group>(null);
  const drawer = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);
  const u = useRef(0);
  const anchors = useRef<number[]>([]);
  const { camera } = useThree();

  const curves = useMemo(() => {
    const st = stations(narrow);
    return {
      pos: new THREE.CatmullRomCurve3(st.map((s) => new THREE.Vector3(...s.pos)), false, "centripetal"),
      look: new THREE.CatmullRomCurve3(st.map((s) => new THREE.Vector3(...s.look)), false, "centripetal"),
      n: st.length,
    };
  }, [narrow]);

  // Where each section starts on the page, measured on load and on resize.
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

  /** Scroll position → path parameter. The door station (index 1) sits midway into the first leg. */
  const target = () => {
    if (still) return 0;
    const a = anchors.current;
    const y = window.scrollY + window.innerHeight * 0.18;
    if (!a.length) return 0;
    // Map anchors to path stops: top→0, payout→2, rules→3, register→4, card→5, blotter→6, closing→7.
    const stops = [0, 2, 3, 4, 5, 6, 7];
    for (let i = 0; i < a.length - 1; i++) {
      if (y < a[i + 1]) {
        const t = THREE.MathUtils.clamp((y - a[i]) / Math.max(1, a[i + 1] - a[i]), 0, 1);
        return (stops[i] + (stops[i + 1] - stops[i]) * t) / (curves.n - 1);
      }
    }
    return 1;
  };

  const p = new THREE.Vector3();
  const l = new THREE.Vector3();
  useFrame((state, dt) => {
    u.current = THREE.MathUtils.damp(u.current, target(), 2.6, dt);
    const k = u.current;
    const seg = 1 / (curves.n - 1);
    curves.pos.getPointAt(k, p);
    curves.look.getPointAt(k, l);
    // a little sway from the pointer, never enough to lose the subject
    p.x += state.pointer.x * 0.25;
    p.y += state.pointer.y * 0.15;
    camera.position.copy(p);
    camera.lookAt(l);

    // the door: unlock, swing open on the way in; swing shut at the very end
    const unlock = THREE.MathUtils.smoothstep(k, 0, seg * 0.55);
    const open = THREE.MathUtils.smoothstep(k, seg * 0.35, seg * 1.05);
    const shut = THREE.MathUtils.smoothstep(k, seg * 6.2, seg * 6.95);
    if (wheel.current) wheel.current.rotation.z = -unlock * Math.PI * 2.5 + shut * Math.PI * 2.5;
    bolts.current?.children.forEach((b, i) => {
      const a = (i / 12) * Math.PI * 2;
      const r = DOOR_R + 0.32 - 0.18 * Math.max(0, unlock - shut);
      b.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
    });
    if (hinge.current) hinge.current.rotation.y = -Math.max(0, open - shut) * 1.6;
    if (glow.current) glow.current.intensity = 4 + Math.max(0, open - shut) * 40;

    // your box slides out for the account station, then back home
    const out = THREE.MathUtils.smoothstep(k, seg * 4.2, seg * 4.9) - THREE.MathUtils.smoothstep(k, seg * 5.3, seg * 5.9);
    if (drawer.current) drawer.current.position.x = X0 + W - 0.32 - out * 1.7;
  });

  return (
    <group>
      <Shell mats={mats} />
      <Door mats={mats} wheelRef={wheel} boltsRef={bolts} hingeRef={hinge} />
      <pointLight ref={glow} color="#ffcf7a" intensity={4} distance={16} decay={1.5} position={[X0, 0.5, -2.5]} />
      <Pedestals mats={mats} coin={coin} />
      {/* the conditions plate on the left wall */}
      <mesh material={mats.brass} position={[X0 - W + 0.05, 0.3, -16.5]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[4.2, 2.8, 0.06]} />
      </mesh>
      <pointLight color="#ffe1a8" intensity={6} distance={7} decay={1.7} position={[X0 - 2, 1.8, -15.5]} />
      <DepositWall mats={mats} names={names} closed={closed} drawer={drawer} />
      <Desk mats={mats} coin={coin} />
    </group>
  );
}

export default function VaultWalk({ names, closed, still = false }: { names: string[]; closed: number; still?: boolean }) {
  const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;
  return (
    <Canvas
      className="walk__canvas"
      dpr={narrow ? [1, 1.25] : [1, 1.6]}
      camera={{ position: [X0 - 3.4, 0.2, 10.5], fov: narrow ? 58 : 44, near: 0.1, far: 80 }}
      gl={{ antialias: !narrow, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: "high-performance" }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#0b1424");
        scene.fog = new THREE.Fog("#0b1424", 18, 52);
      }}
      frameloop={still ? "demand" : "always"}
      aria-hidden="true"
    >
      <ambientLight intensity={0.55} color="#9fb0d6" />
      <hemisphereLight args={["#7d93c4", "#2a1c0c", 0.9]} />
      <directionalLight position={[-6, 6, 12]} intensity={1.5} color="#dfe6f5" />
      <Walk narrow={narrow} still={still} names={names} closed={closed} />
      <Environment resolution={128}>
        <Lightformer intensity={2.2} position={[0, 5, 4]} scale={[10, 2, 1]} color="#e9eefa" />
        <Lightformer intensity={1.4} position={[-6, 0, 3]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} color="#2b4a80" />
        <Lightformer intensity={1.8} position={[6, -1, 3]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} color="#ffdca0" />
      </Environment>
    </Canvas>
  );
}
