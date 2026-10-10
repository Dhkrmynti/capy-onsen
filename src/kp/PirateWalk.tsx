/**
 * Plunders: one cartoon cove, walked by scrolling. A pirate ship dressed overall in signal flags
 * rides at anchor off a sandy island; the ten Crew names hang on signposts along the beach, each
 * under its numeral pennant; a trail of gold carries the fees
 * ashore; the Pirate Code is nailed to a board; a chest holds your share; a cannon fires what is
 * bought back; and at the end the black flag goes up. Toon-shaded with ink outlines, at most
 * 30 fps, nothing while the tab is hidden.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import { BUNTING, FLAGS, drawFlag, pennantFor, type FlagCode } from "../lib/flags";

const INK = "#0b1420";
const ANCHORS = ["top", "ladder", "round", "rules", "card", "record", "closing"] as const;
const SHIP: [number, number, number] = [2, 0, -12.5];
const SHIP_YAW = -0.7;
const ISLE = { x: -1, z: 2, r: 13 };
const LAND = 0.2;

/* ───────── shared toon kit ───────── */
const STEPS = (() => {
  const t = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();
const toon = (color: string, extra: Partial<THREE.MeshToonMaterialParameters> = {}) => new THREE.MeshToonMaterial({ color, gradientMap: STEPS, ...extra });
const OUTLINE = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });

function Inked({ geometry, material, ink = 1.05, ...rest }: { geometry: THREE.BufferGeometry; material: THREE.Material; ink?: number } & ThreeElements["group"]) {
  return (
    <group {...rest}>
      <mesh geometry={geometry} material={material} />
      <mesh geometry={geometry} material={OUTLINE} scale={ink} />
    </group>
  );
}

const rand = (() => {
  let s = 11;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
})();

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Canvas text needs the web fonts in place before it is drawn. */
function useFonts() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let live = true;
    Promise.all(['900 64px "Big Shoulders Stencil Display"', '800 40px "Archivo"', '600 40px "Martian Mono"'].map((f) => document.fonts.load(f)))
      .catch(() => null)
      .then(() => live && setOk(true));
    return () => {
      live = false;
    };
  }, []);
  return ok;
}

/** An ellipse ring as a tube, for rails and stripes. */
function ringTube(rx: number, rz: number, y: number, r: number) {
  const pts = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * rx, y, Math.sin(a) * rz);
  });
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 96, r, 6, true);
}

/* ───────── camera stations, one per page section ───────── */
type Station = { pos: [number, number, number]; look: [number, number, number] };
function stations(narrow: boolean): Station[] {
  const n = narrow ? 1 : 0;
  const top: [number, number, number] = [SHIP[0], 6.4, SHIP[2]];
  return [
    { pos: [narrow ? 1 : -2.5, 4.4 + n, narrow ? 12 : 7], look: [narrow ? 2 : -4.5, 2.8, -10] }, // the ship at anchor
    { pos: [3, 2.6, 4], look: [-11, 2, 0] }, // the Crew's signposts along the beach
    { pos: [-2, 3.4, 2], look: [6.5, 0, 6] }, // the gold trail: fees coming ashore
    { pos: [-1.5, 2.8, 4], look: [12, 2.4, -7] }, // the Pirate Code board
    { pos: [-2.5, 3, 4.5], look: [-6, 0.6, 13] }, // your chest, on the X, to the right of the sheet
    { pos: [2.6, 2.6, 9.5], look: [6.8, 1.2, 2.7] }, // the cannon, to the right of the log
    { pos: narrow ? [3, 4.6, 0] : [4.5, 4.2, -1], look: narrow ? [top[0], top[1] - 0.4, top[2]] : [top[0] + 0.6, top[1] - 1.8, top[2]] }, // the black flag goes up
  ];
}

/* ───────── sky, sea and sun ───────── */
function Sky() {
  const tex = useMemo(
    () =>
      canvasTex(4, 256, (g) => {
        const grd = g.createLinearGradient(0, 0, 0, 256);
        grd.addColorStop(0, "#3fb4e6");
        grd.addColorStop(0.42, "#9fdcf0");
        grd.addColorStop(0.5, "#ffd9a8");
        grd.addColorStop(1, "#ffd9a8");
        g.fillStyle = grd;
        g.fillRect(0, 0, 4, 256);
      }),
    [],
  );
  const cloud = useMemo(() => toon("#ffffff"), []);
  const puff = useMemo(() => new THREE.SphereGeometry(1, 16, 12), []);
  const clouds = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const a = -Math.PI * 0.95 + (i / 6) * Math.PI * 0.9;
        return { p: [Math.cos(a) * 46, 13 + rand() * 7, Math.sin(a) * 46 - 4] as [number, number, number], s: 2.2 + rand() * 1.6, k: 3 + Math.floor(rand() * 3) };
      }),
    [],
  );
  return (
    <group>
      <mesh>
        <sphereGeometry args={[70, 24, 16]} />
        <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} depthWrite={false} />
      </mesh>
      {/* the low sun behind the ship */}
      <mesh position={[-24, 9, -60]}>
        <circleGeometry args={[6, 40]} />
        <meshBasicMaterial color="#fff1b8" fog={false} />
      </mesh>
      {clouds.map((c, i) => (
        <group key={i} position={c.p} scale={c.s}>
          {Array.from({ length: c.k }, (_, j) => (
            <mesh key={j} geometry={puff} material={cloud} position={[(j - (c.k - 1) / 2) * 1.3, j % 2 ? 0.3 : 0, 0]} scale={[1, 0.8 + (j % 2) * 0.3, 0.9]} />
          ))}
        </group>
      ))}
    </group>
  );
}

function Sea() {
  const tex = useMemo(() => {
    const t = canvasTex(256, 256, (g) => {
      g.fillStyle = "#19a3c4";
      g.fillRect(0, 0, 256, 256);
      g.lineCap = "round";
      for (let i = 0; i < 18; i++) {
        const x = rand() * 256;
        const y = rand() * 256;
        const w = 18 + rand() * 26;
        g.strokeStyle = i % 3 ? "rgba(140,230,245,0.75)" : "rgba(255,255,255,0.85)";
        g.lineWidth = 4;
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(x + w / 2, y + 7, x + w, y);
        g.stroke();
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(36, 36);
    return t;
  }, []);
  useFrame((_, dt) => {
    tex.offset.x += dt * 0.004;
    tex.offset.y += dt * 0.006;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[220, 220]} />
      <meshBasicMaterial map={tex} />
    </mesh>
  );
}

/* ───────── the island: sand, foam, rocks, palms ───────── */
function Palm({ at, lean = 0, s = 1 }: { at: [number, number]; lean?: number; s?: number }) {
  const g = useMemo(() => {
    const trunk = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.25, 1.6, 0), new THREE.Vector3(0.9, 3.2, 0), new THREE.Vector3(1.6, 4.4, 0)]), 24, 0.2, 8);
    const ls = new THREE.Shape();
    ls.moveTo(0, 0);
    ls.quadraticCurveTo(1.2, 0.55, 2.6, 0);
    ls.quadraticCurveTo(1.2, -0.55, 0, 0);
    const leaf = new THREE.ShapeGeometry(ls, 6);
    // droop the leaf along its length
    const p = leaf.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      p.setZ(i, -0.18 * x * x);
    }
    leaf.computeVertexNormals();
    return { trunk, leaf, nut: new THREE.SphereGeometry(0.2, 10, 8) };
  }, []);
  const m = useMemo(() => ({ trunk: toon("#9a6634"), leaf: toon("#37b24d", { side: THREE.DoubleSide }), nut: toon("#6b4423") }), []);
  return (
    <group position={[at[0], LAND, at[1]]} rotation={[0, lean, 0]} scale={s}>
      <Inked geometry={g.trunk} material={m.trunk} ink={1.06} />
      <group position={[1.6, 4.4, 0]}>
        {Array.from({ length: 7 }, (_, i) => (
          <group key={i} rotation={[0, (i / 7) * Math.PI * 2, 0]}>
            <mesh geometry={g.leaf} material={m.leaf} rotation={[Math.PI / 2 - 0.25, 0, 0]} />
          </group>
        ))}
        {[0, 2.1, 4.2].map((a, i) => (
          <mesh key={i} geometry={g.nut} material={m.nut} position={[Math.cos(a) * 0.22, -0.2, Math.sin(a) * 0.22]} />
        ))}
      </group>
    </group>
  );
}

function Island({ narrow }: { narrow: boolean }) {
  const sand = useMemo(() => toon("#f4d58d"), []);
  const shape = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0, LAND],
          [ISLE.r - 2.2, LAND],
          [ISLE.r - 0.8, LAND * 0.5],
          [ISLE.r + 0.6, -0.5],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        64,
      ),
    [],
  );
  const rocks = useMemo(() => {
    const n = narrow ? 10 : 18;
    const m = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), toon("#8a8f98"), n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = ISLE.r - 0.4 + rand() * 1.4;
      o.position.set(ISLE.x + Math.cos(a) * r, 0, ISLE.z + Math.sin(a) * r);
      o.rotation.set(rand() * 3, rand() * 3, rand() * 3);
      const s = 0.4 + rand() * 0.8;
      o.scale.set(s, s * 0.7, s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, [narrow]);
  return (
    <group>
      <group position={[ISLE.x, 0, ISLE.z]}>
        <mesh geometry={shape} material={sand} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[ISLE.r - 0.2, ISLE.r + 0.7, 72]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
        </mesh>
      </group>
      <primitive object={rocks} />
      <Palm at={[-6.5, -4.5]} lean={0.6} />
      <Palm at={[-10, 4.5]} lean={2.6} s={0.9} />
      <Palm at={[10.5, 7.5]} lean={-0.8} />
      <Palm at={[-3.5, 12.5]} lean={1.9} s={0.85} />
      {!narrow && <Palm at={[11.2, 1.6]} lean={-2.2} s={0.8} />}
    </group>
  );
}

/* ───────── the ship dressed overall: signal flags strung bow to stern ───────── */
function Bunting() {
  const mats = useMemo(() => {
    const m = new Map<FlagCode, THREE.MeshBasicMaterial>();
    for (const c of new Set(BUNTING)) {
      const f = FLAGS[c];
      const h = Math.round(120 / f.ratio);
      const t = canvasTex(128, h + 8, (g) => drawFlag(g, c, 4, 4, 120));
      m.set(c, new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, alphaTest: 0.5 }));
    }
    return m;
  }, []);
  const plane = useMemo(() => new THREE.PlaneGeometry(1, 1).translate(0.5, -0.5, 0), []);
  const line = useMemo(() => {
    const v = (x: number, y: number) => new THREE.Vector3(x, y, 0);
    return [v(5.7, 1.6), v(2.3, 6.6), v(0.2, 8.3), v(-3.9, 1.9)];
  }, []);
  const flags = useMemo(() => {
    const out: { p: THREE.Vector3; c: FlagCode; w: number; h: number }[] = [];
    let k = 0;
    for (let s = 0; s < line.length - 1; s++) {
      const a = line[s];
      const b = line[s + 1];
      const n = Math.max(3, Math.round(a.distanceTo(b) / 0.72));
      for (let i = 0; i < n; i++) {
        const c = BUNTING[k++ % BUNTING.length];
        const f = FLAGS[c];
        const w = f.shape === "pennant" ? 0.62 : 0.5;
        out.push({ p: a.clone().lerp(b, (i + 0.25) / n), c, w, h: w / f.ratio });
      }
    }
    return out;
  }, [line]);
  const rope = useMemo(() => new THREE.BufferGeometry().setFromPoints(line), [line]);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    refs.current.forEach((m, i) => m && (m.rotation.x = Math.sin(t * 2.2 + i * 0.7) * 0.35));
  });
  return (
    <group>
      <line>
        <primitive object={rope} attach="geometry" />
        <lineBasicMaterial color={INK} />
      </line>
      {flags.map((f, i) => (
        <group key={i} position={f.p} rotation={[0, Math.PI / 2, 0]}>
          <mesh ref={(el) => void (refs.current[i] = el)} geometry={plane} material={mats.get(f.c)} scale={[f.w, f.h, 1]} />
        </group>
      ))}
    </group>
  );
}

/* ───────── the ship: at anchor, the black flag at the top of the mainmast ───────── */
function Ship({ raise }: { raise: React.MutableRefObject<number> }) {
  const root = useRef<THREE.Group>(null);
  const flagG = useRef<THREE.Group>(null);
  const m = useMemo(
    () => ({
      hull: toon("#8a4626", { side: THREE.DoubleSide }),
      dark: toon("#5e2f18"),
      deck: toon("#d39a5a"),
      gold: toon("#ffc83d"),
      mast: toon("#6b3f1f"),
      sail: toon("#f8efd9", { side: THREE.DoubleSide }),
      iron: toon("#2a2f3a"),
      glow: new THREE.MeshBasicMaterial({ color: "#ffd86b" }),
      red: toon("#e2412d", { side: THREE.DoubleSide }),
    }),
    [],
  );
  const flagMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: canvasTex(256, 160, (g) => {
          g.fillStyle = "#151a22";
          g.fillRect(0, 0, 256, 160);
          g.save();
          g.translate(128, 84);
          g.strokeStyle = "#f6ecd6";
          g.lineCap = "round";
          g.lineWidth = 16;
          g.beginPath();
          g.moveTo(-52, 40);
          g.lineTo(52, -14);
          g.moveTo(-52, -14);
          g.lineTo(52, 40);
          g.stroke();
          g.fillStyle = "#f6ecd6";
          g.beginPath();
          g.ellipse(0, -10, 34, 32, 0, 0, Math.PI * 2);
          g.fill();
          g.fillRect(-18, 10, 36, 20);
          g.fillStyle = "#151a22";
          g.beginPath();
          g.arc(-13, -12, 9, 0, Math.PI * 2);
          g.arc(13, -12, 9, 0, Math.PI * 2);
          g.fill();
          g.fillRect(-2, 2, 4, 6);
          g.restore();
        }),
      }),
    [],
  );
  const g = useMemo(() => {
    const bowl = new THREE.SphereGeometry(1, 40, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const wall = new THREE.CylinderGeometry(1, 1, 0.6, 48, 1, true);
    const sail = (w: number, h: number) => {
      const s = new THREE.PlaneGeometry(w, h, 10, 6);
      const p = s.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        const u = (2 * p.getX(i)) / w;
        const v = (2 * p.getY(i)) / h;
        p.setZ(i, 0.42 * (1 - u * u) * (0.65 + 0.35 * (1 - v * v)));
      }
      s.computeVertexNormals();
      s.rotateY(Math.PI / 2); // across the ship, bellied toward the bow
      return s;
    };
    const flag = new THREE.PlaneGeometry(2, 1.25, 12, 4).translate(-1, 0, 0);
    return {
      bowl,
      wall,
      rail: ringTube(4.2, 1.55, 0.6, 0.07),
      stripe: ringTube(4.16, 1.53, -0.32, 0.07),
      deck: new THREE.CircleGeometry(1, 40),
      castle: new THREE.BoxGeometry(1.9, 1.3, 2.0),
      fore: new THREE.BoxGeometry(1.2, 0.7, 1.4),
      sprit: new THREE.CylinderGeometry(0.08, 0.12, 3.2, 8),
      mainMast: new THREE.CylinderGeometry(0.13, 0.18, 8.4, 10),
      foreMast: new THREE.CylinderGeometry(0.11, 0.15, 6.6, 10),
      yard: new THREE.CylinderGeometry(0.06, 0.06, 1, 6).rotateX(Math.PI / 2),
      nest: new THREE.CylinderGeometry(0.5, 0.42, 0.45, 14, 1, true),
      sails: { ml: sail(3.6, 2.3), mu: sail(3, 1.8), fl: sail(3, 1.9), fu: sail(2.4, 1.5) },
      flag,
      flagBase: (flag.getAttribute("position") as THREE.BufferAttribute).array.slice() as Float32Array,
      gun: new THREE.CylinderGeometry(0.09, 0.11, 0.6, 8).rotateX(Math.PI / 2),
      port: new THREE.BoxGeometry(0.34, 0.26, 0.05),
      lamp: new THREE.SphereGeometry(0.13, 10, 8),
      foam: new THREE.RingGeometry(1, 1.16, 48),
      pennant: new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.2, 0), new THREE.Vector3(1.3, 0, 0), new THREE.Vector3(0, -0.2, 0)]),
    };
  }, []);
  const ropes = useMemo(() => {
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const pts = [
      v(0.2, 8.2, 0), v(5.7, 1.6, 0),
      v(2.3, 6.5, 0), v(5.7, 1.6, 0),
      v(0.2, 8.2, 0), v(2.3, 6.5, 0),
      v(0.2, 8.2, 0), v(-3.6, 1.3, 0),
      v(0.2, 6.2, 0), v(0.6, 0.6, 1.5), v(0.2, 6.2, 0), v(-0.4, 0.6, 1.5),
      v(0.2, 6.2, 0), v(0.6, 0.6, -1.5), v(0.2, 6.2, 0), v(-0.4, 0.6, -1.5),
      v(2.3, 5, 0), v(2.6, 0.6, 1.3), v(2.3, 5, 0), v(2.6, 0.6, -1.3),
    ];
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  const wallZ = (x: number) => 1.55 * Math.sqrt(Math.max(0, 1 - (x / 4.2) ** 2));

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (root.current) {
      root.current.position.y = 1.15 + Math.sin(t * 1.1) * 0.07;
      root.current.rotation.x = Math.sin(t * 0.9) * 0.035;
      root.current.rotation.z = Math.sin(t * 0.7) * 0.02;
    }
    // the flag waves, and climbs the mast at the close
    const p = g.flag.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = g.flagBase[i * 3];
      p.setZ(i, Math.sin(x * 2.6 + t * 5) * 0.16 * (-x / 2));
    }
    p.needsUpdate = true;
    if (flagG.current) flagG.current.position.y = 5.2 + raise.current * 2.2;
  });

  return (
    <group position={SHIP} rotation={[0, SHIP_YAW, 0]}>
      {/* foam where the hull meets the water */}
      <mesh geometry={g.foam} rotation={[-Math.PI / 2, 0, 0]} scale={[3.25, 1.22, 1]} position={[0, 0.04, 0]}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      <group ref={root}>
        <Inked geometry={g.bowl} material={m.hull} scale={[4.2, 1.7, 1.55]} ink={1.03} />
        <mesh geometry={g.wall} material={m.hull} scale={[4.2, 1, 1.55]} position={[0, 0.3, 0]} />
        <mesh geometry={g.rail} material={m.gold} />
        <mesh geometry={g.stripe} material={m.gold} />
        <mesh geometry={g.deck} material={m.deck} rotation={[-Math.PI / 2, 0, 0]} scale={[4.12, 1.5, 1]} position={[0, 0.02, 0]} />
        {/* stern castle and forecastle */}
        <Inked geometry={g.castle} material={m.hull} position={[-3, 0.85, 0]} ink={1.03} />
        <mesh material={m.gold} position={[-3, 1.53, 0]}>
          <boxGeometry args={[2, 0.1, 2.1]} />
        </mesh>
        {[-0.45, 0.45].map((z) => (
          <mesh key={z} material={m.glow} position={[-3.96, 0.95, z]}>
            <boxGeometry args={[0.04, 0.4, 0.3]} />
          </mesh>
        ))}
        {[-3.4, -2.6].map((x) => (
          <mesh key={x} material={m.glow} position={[x, 0.95, 1.01]}>
            <boxGeometry args={[0.32, 0.36, 0.04]} />
          </mesh>
        ))}
        <mesh geometry={g.lamp} material={m.glow} position={[-4.05, 1.9, 0]} />
        <Inked geometry={g.fore} material={m.hull} position={[3, 0.5, 0]} ink={1.04} />
        <Inked geometry={g.sprit} material={m.mast} position={[4.6, 1.15, 0]} rotation={[0, 0, -1.15]} ink={1.12} />
        {/* gun ports both sides */}
        {[-1.6, -0.4, 0.8, 2].map((x) =>
          [1, -1].map((side) => (
            <group key={`${x}${side}`} position={[x, 0.3, side * (wallZ(x) + 0.01)]}>
              <mesh geometry={g.port} material={m.iron} />
              <mesh geometry={g.gun} material={m.iron} position={[0, 0, side * 0.25]} />
            </group>
          )),
        )}
        {/* masts, yards and sails */}
        <Inked geometry={g.mainMast} material={m.mast} position={[0.2, 4.2, 0]} ink={1.1} />
        <Inked geometry={g.foreMast} material={m.mast} position={[2.3, 3.3, 0]} ink={1.1} />
        <mesh geometry={g.nest} material={m.mast} position={[0.2, 6.3, 0]} />
        {(
          [
            [0.2, 2.75, 3.6, 2.3, g.sails.ml],
            [0.2, 5.05, 3, 1.8, g.sails.mu],
            [2.3, 2.6, 3, 1.9, g.sails.fl],
            [2.3, 4.55, 2.4, 1.5, g.sails.fu],
          ] as const
        ).map(([x, y, w, h, geo], i) => (
          <group key={i} position={[x, y, 0]}>
            <Inked geometry={geo} material={m.sail} position={[0.08, 0, 0]} ink={1.02} />
            <mesh geometry={g.yard} material={m.mast} position={[0.05, h / 2, 0]} scale={[1, 1, w + 0.5]} />
          </group>
        ))}
        <mesh geometry={g.pennant} material={m.red} position={[2.3, 6.55, 0]} />
        <lineSegments geometry={ropes}>
          <lineBasicMaterial color={INK} />
        </lineSegments>
        <Bunting />
        {/* the black flag, hoisted on the mainmast */}
        <group ref={flagG} position={[0.15, 5.2, 0]}>
          <mesh geometry={g.flag} material={flagMat} />
        </group>
      </group>
    </group>
  );
}

/* ───────── the Crew's signposts: ten boards along the beach ───────── */
function Signs({ names, fonts }: { names: string[]; fonts: boolean }) {
  const wood = useMemo(() => toon("#8a5a2b"), []);
  const black = useMemo(() => toon("#151a22", { side: THREE.DoubleSide }), []);
  const plates = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) =>
        new THREE.MeshBasicMaterial({
          map: canvasTex(512, 220, (g) => {
            const top = i < 5;
            g.fillStyle = top ? "#f9c80e" : "#f8f4ea";
            g.fillRect(0, 0, 512, 220);
            g.strokeStyle = "rgba(11,20,32,0.18)";
            g.lineWidth = 3;
            for (let y = 55; y < 220; y += 55) {
              g.beginPath();
              g.moveTo(0, y);
              g.lineTo(512, y);
              g.stroke();
            }
            g.strokeStyle = INK;
            g.lineWidth = 14;
            g.strokeRect(7, 7, 498, 206);
            drawFlag(g, pennantFor(i + 1), 28, 28, 150);
            g.fillStyle = INK;
            g.textAlign = "left";
            g.font = '900 70px "Big Shoulders Stencil Display", sans-serif';
            g.fillText(`NO. ${i + 1}`, 200, 92);
            g.font = '800 46px "Archivo", sans-serif';
            const n = names[i] || "open";
            g.textAlign = "center";
            g.fillText(n.length > 16 ? n.slice(0, 15) + "…" : n, 256, 178);
          }),
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [names, fonts],
  );
  const pennant = useMemo(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.25, 0), new THREE.Vector3(0.8, 0, 0), new THREE.Vector3(0, -0.25, 0)]), []);
  return (
    <group>
      {Array.from({ length: 10 }, (_, i) => {
        const a = Math.PI * 0.62 + (i / 9) * Math.PI * 0.46;
        const r = 10.6;
        const x = ISLE.x + Math.cos(a) * r;
        const z = ISLE.z + Math.sin(a) * r * 0.9;
        const h = i < 5 ? 2.9 : 1.8;
        return (
          <group key={i} position={[x, LAND, z]} rotation={[0, -a + Math.PI / 2 + Math.PI, 0]}>
            <mesh material={wood} position={[0, h / 2, -0.12]}>
              <cylinderGeometry args={[0.1, 0.12, h + 0.6, 8]} />
            </mesh>
            <mesh material={wood} position={[0, h, 0]}>
              <boxGeometry args={[2.2, 1.0, 0.16]} />
            </mesh>
            <mesh material={OUTLINE} position={[0, h, 0]} scale={[1.04, 1.08, 1.4]}>
              <boxGeometry args={[2.2, 1.0, 0.16]} />
            </mesh>
            <mesh material={plates[i]} position={[0, h, 0.09]}>
              <planeGeometry args={[2.05, 0.88]} />
            </mesh>
            {i < 5 ? <mesh geometry={pennant} material={black} position={[0, h + 1.05, -0.12]} /> : null}
          </group>
        );
      })}
    </group>
  );
}

/* ───────── the gold trail: the plunder coming ashore from the ship to the chest ───────── */
function GoldTrail() {
  const tex = useMemo(() => {
    const t = canvasTex(256, 512, (g) => {
      g.fillStyle = "#e9be6c";
      g.fillRect(0, 0, 256, 512);
      for (let i = 0; i < 30; i++) {
        const x = 30 + rand() * 196;
        const y = rand() * 512;
        g.fillStyle = "#b9862c";
        g.beginPath();
        g.ellipse(x, y + 4, 24, 12, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#ffc83d";
        g.beginPath();
        g.ellipse(x, y, 24, 12, 0, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = INK;
        g.lineWidth = 3;
        g.stroke();
        g.fillStyle = "#fff0bd";
        g.beginPath();
        g.ellipse(x - 6, y - 3, 7, 3, 0, 0, Math.PI * 2);
        g.fill();
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 6);
    return t;
  }, []);
  useFrame((_, dt) => (tex.offset.y -= dt * 0.18));
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(4.8, 0, -8.6), new THREE.Vector3(6, 0, -3), new THREE.Vector3(6.6, 0, 3), new THREE.Vector3(4.2, 0, 8.6), new THREE.Vector3(-1.5, 0, 11.4), new THREE.Vector3(-5.6, 0, 10.6)]),
    [],
  );
  const geo = useMemo(() => {
    const N = 90;
    const pts = curve.getSpacedPoints(N);
    const shape: THREE.Vector3[] = [];
    const uvs: number[] = [];
    const idx: number[] = [];
    pts.forEach((p, i) => {
      const tng = curve.getTangentAt(i / N);
      const side = new THREE.Vector3(-tng.z, 0, tng.x).multiplyScalar(0.75);
      const y = LAND + 0.03;
      shape.push(p.clone().add(side).setY(y), p.clone().sub(side).setY(y));
      uvs.push(0, i / N, 1, i / N);
      if (i < pts.length - 1) {
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    });
    const gg = new THREE.BufferGeometry().setFromPoints(shape);
    gg.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    gg.setIndex(idx);
    gg.computeVertexNormals();
    return gg;
  }, [curve]);
  const barrel = useMemo(() => new THREE.LatheGeometry([[0, 0], [0.42, 0], [0.5, 0.45], [0.42, 0.9], [0, 0.9]].map(([x, y]) => new THREE.Vector2(x, y)), 16), []);
  const wood = useMemo(() => toon("#a0652f"), []);
  const crate = useMemo(() => toon("#c08a4a"), []);
  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial map={tex} side={THREE.DoubleSide} />
      </mesh>
      {(
        [
          [8.2, 1.2],
          [8.9, 2.1],
          [3.2, 2.4],
        ] as const
      ).map(([x, z], i) => (
        <Inked key={i} geometry={barrel} material={wood} position={[x, LAND, z]} ink={1.06} />
      ))}
      <Inked geometry={useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])} material={crate} position={[7.4, LAND + 0.5, 2.6]} rotation={[0, 0.5, 0]} ink={1.05} />
    </group>
  );
}

/* ───────── the Pirate Code, nailed to a board ───────── */
function Code({ fonts }: { fonts: boolean }) {
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: canvasTex(1024, 680, (g) => {
          g.fillStyle = "#f8f4ea";
          g.fillRect(0, 0, 1024, 680);
          g.fillStyle = "#f9c80e";
          g.fillRect(0, 0, 512, 680);
          g.fillStyle = "#1b4dbf";
          g.fillRect(512, 0, 512, 680);
          g.fillStyle = "#16181d";
          g.textAlign = "center";
          g.font = '900 210px "Big Shoulders Stencil Display", sans-serif';
          g.lineWidth = 18;
          g.strokeStyle = "#16181d";
          g.fillStyle = "#f8f4ea";
          g.strokeText("THE CODE", 512, 330);
          g.fillText("THE CODE", 512, 330);
          g.font = '800 44px "Archivo", sans-serif';
          g.fillStyle = "#16181d";
          g.fillText("Sell once and you", 256, 500);
          g.fillText("walk the plank", 256, 570);
          g.fillStyle = "#f8f4ea";
          g.fillText("The top ten", 768, 500);
          g.fillText("split the Plunder", 768, 570);
        }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fonts],
  );
  const wood = useMemo(() => toon("#7a4a22"), []);
  return (
    <group position={[9.8, LAND, -2.6]} rotation={[0, -Math.PI / 2 + 0.5, 0]}>
      {[-2.3, 2.3].map((x) => (
        <mesh key={x} material={wood} position={[x, 1.6, -0.1]}>
          <cylinderGeometry args={[0.14, 0.16, 3.6, 8]} />
        </mesh>
      ))}
      <mesh material={wood} position={[0, 2.5, -0.05]}>
        <boxGeometry args={[5.4, 3.5, 0.18]} />
      </mesh>
      <mesh material={OUTLINE} position={[0, 2.5, -0.05]} scale={[1.02, 1.03, 1.5]}>
        <boxGeometry args={[5.4, 3.5, 0.18]} />
      </mesh>
      <mesh material={mat} position={[0, 2.5, 0.06]} rotation={[0, 0, 0.02]}>
        <planeGeometry args={[4.9, 3.2]} />
      </mesh>
    </group>
  );
}

/* ───────── the chest: your share, on the X ───────── */
function Chest({ open }: { open: React.MutableRefObject<number> }) {
  const lid = useRef<THREE.Group>(null);
  const wood = useMemo(() => toon("#8a4b2a"), []);
  const band = useMemo(() => toon("#ffc83d"), []);
  const glow = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ffd86b" }), []);
  const red = useMemo(() => new THREE.MeshBasicMaterial({ color: "#e2412d" }), []);
  const coin = useMemo(() => toon("#ffd86b"), []);
  useFrame(() => lid.current && (lid.current.rotation.x = -open.current * 1.6));
  return (
    <group position={[-7, LAND, 10]} rotation={[0, 0.9, 0]}>
      {/* X marks the spot */}
      {[0.7, -0.7].map((r) => (
        <mesh key={r} material={red} rotation={[-Math.PI / 2, 0, r]} position={[0, 0.02, 0]}>
          <planeGeometry args={[3.6, 0.36]} />
        </mesh>
      ))}
      <Inked geometry={useMemo(() => new THREE.BoxGeometry(2.2, 1.2, 1.4), [])} material={wood} position={[0, 0.6, 0]} ink={1.04} />
      <Inked geometry={useMemo(() => new THREE.BoxGeometry(0.22, 1.24, 1.44), [])} material={band} position={[-0.7, 0.6, 0]} ink={1.06} />
      <Inked geometry={useMemo(() => new THREE.BoxGeometry(0.22, 1.24, 1.44), [])} material={band} position={[0.7, 0.6, 0]} ink={1.06} />
      <mesh material={glow} position={[0, 1.18, 0]}>
        <boxGeometry args={[2, 0.06, 1.2]} />
      </mesh>
      <group ref={lid} position={[0, 1.2, -0.7]}>
        <Inked geometry={useMemo(() => new THREE.CylinderGeometry(0.7, 0.7, 2.2, 20, 1, false, 0, Math.PI).rotateZ(Math.PI / 2), [])} material={wood} position={[0, 0, 0.7]} ink={1.04} />
      </group>
      {[
        [1.6, 0.4],
        [1.9, -0.3],
        [-1.7, 0.6],
        [1.3, 1],
      ].map(([x, z], i) => (
        <mesh key={i} material={coin} position={[x, 0.05, z]}>
          <cylinderGeometry args={[0.24, 0.24, 0.06, 16]} />
        </mesh>
      ))}
    </group>
  );
}

/* ───────── the cannon: cannonfire burns what is bought back ───────── */
function Cannon({ narrow }: { narrow: boolean }) {
  const N = narrow ? 24 : 48;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    return g;
  }, [N]);
  const seeds = useMemo(() => Array.from({ length: N }, () => [rand(), rand(), rand()]), [N]);
  const sprite = useMemo(
    () =>
      canvasTex(64, 64, (g) => {
        const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        r.addColorStop(0, "rgba(255,255,255,1)");
        r.addColorStop(0.6, "rgba(235,240,245,0.85)");
        r.addColorStop(1, "rgba(235,240,245,0)");
        g.fillStyle = r;
        g.fillRect(0, 0, 64, 64);
      }),
    [],
  );
  const flash = useRef<THREE.Mesh>(null);
  const iron = useMemo(() => toon("#2a2f3a"), []);
  const wood = useMemo(() => toon("#8a5a2b"), []);
  const barrel = useMemo(() => new THREE.LatheGeometry([[0, -1.2], [0.42, -1.2], [0.46, -1.0], [0.36, -0.7], [0.26, 0.9], [0.34, 1], [0.32, 1.2], [0.2, 1.2], [0.2, 0.7], [0, 0.7]].map(([x, y]) => new THREE.Vector2(x, y)), 18), []);
  const wheel = useMemo(() => new THREE.CylinderGeometry(0.42, 0.42, 0.16, 16).rotateX(Math.PI / 2), []);
  const balls = useMemo(() => new THREE.SphereGeometry(0.22, 12, 10), []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const k = (t % 3.2) / 3.2; // one shot every few seconds
    if (flash.current) {
      const f = k < 0.06 ? 1 - k / 0.06 : 0;
      flash.current.scale.setScalar(0.01 + f * 1.2);
    }
    const p = geo.getAttribute("position") as THREE.BufferAttribute;
    seeds.forEach(([a, b, c], i) => {
      const life = (k + a * 0.25) % 1;
      const d = Math.sqrt(life) * (1.4 + c);
      p.setXYZ(i, 1.4 + d * 1.2, 1.0 + d * 0.5 + life * 0.9, (b - 0.5) * d * 0.8);
    });
    p.needsUpdate = true;
  });
  return (
    <group position={[9.6, LAND, 5.2]} rotation={[0, 0.5, 0]}>
      {/* carriage */}
      <Inked geometry={useMemo(() => new THREE.BoxGeometry(1.8, 0.4, 1), [])} material={wood} position={[0, 0.45, 0]} ink={1.05} />
      {[-0.55, 0.55].map((z) =>
        [-0.55, 0.55].map((x) => <Inked key={`${x}${z}`} geometry={wheel} material={wood} position={[x, 0.42, z]} ink={1.08} />),
      )}
      <group position={[0.1, 0.95, 0]} rotation={[0, 0, -Math.PI / 2 + 0.22]}>
        <Inked geometry={barrel} material={iron} ink={1.06} />
      </group>
      <mesh ref={flash} position={[1.4, 1.25, 0]}>
        <sphereGeometry args={[0.5, 12, 10]} />
        <meshBasicMaterial color="#ffb84a" toneMapped={false} />
      </mesh>
      <points geometry={geo}>
        <pointsMaterial map={sprite} size={0.9} transparent depthWrite={false} />
      </points>
      {[
        [-0.6, 1.2],
        [-0.2, 1.3],
        [-0.4, 1.65],
      ].map(([x, z], i) => (
        <mesh key={i} geometry={balls} material={iron} position={[x, 0.22, z]} />
      ))}
    </group>
  );
}

/* ───────── gulls, circling the masts ───────── */
function Gulls() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const wing = useMemo(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0.12), new THREE.Vector3(0.9, 0.1, 0), new THREE.Vector3(0, 0, -0.12)]), []);
  const white = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ffffff", side: THREE.DoubleSide }), []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      const a = t * (0.25 + i * 0.04) + i * 2.1;
      g.position.set(SHIP[0] + Math.cos(a) * (6 + i), 9 + i * 0.8 + Math.sin(t + i) * 0.3, SHIP[2] + Math.sin(a) * (4 + i));
      g.rotation.y = -a;
      const f = Math.sin(t * 6 + i) * 0.5;
      (g.children[0] as THREE.Object3D).rotation.x = f;
      (g.children[1] as THREE.Object3D).rotation.x = -f;
    });
  });
  return (
    <>
      {[0, 1, 2].map((i) => (
        <group key={i} ref={(el) => void (refs.current[i] = el)}>
          <mesh geometry={wing} material={white} rotation={[0, Math.PI / 2, 0]} />
          <mesh geometry={wing} material={white} rotation={[0, -Math.PI / 2, 0]} />
        </group>
      ))}
    </>
  );
}

/* ───────── the walk: scroll drives the camera along the stations ───────── */
function Walk({ narrow, names, still }: { narrow: boolean; names: string[]; still: boolean }) {
  const { camera } = useThree();
  const fonts = useFonts();
  const st = useMemo(() => stations(narrow), [narrow]);
  const pos = useMemo(() => new THREE.CatmullRomCurve3(st.map((s) => new THREE.Vector3(...s.pos)), false, "centripetal"), [st]);
  const look = useMemo(() => new THREE.CatmullRomCurve3(st.map((s) => new THREE.Vector3(...s.look)), false, "centripetal"), [st]);
  const u = useRef(0);
  const raise = useRef(0);
  const chest = useRef(0);
  const sway = useRef({ x: 0, y: 0 });
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const on = (e: PointerEvent) => {
      sway.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      sway.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", on);
    return () => window.removeEventListener("pointermove", on);
  }, []);

  /** Where the page is, as a position along the stations (0 … stations-1). */
  const target = () => {
    const y = window.scrollY + window.innerHeight * 0.35;
    const tops = ANCHORS.map((id) => {
      const el = document.getElementById(id);
      return el ? el.getBoundingClientRect().top + window.scrollY : 0;
    });
    for (let i = tops.length - 1; i >= 0; i--) {
      if (y >= tops[i]) {
        const next = tops[i + 1] ?? tops[i] + window.innerHeight;
        const raw = Math.min(1, (y - tops[i]) / Math.max(1, next - tops[i]));
        // hold on each station, then move: the panel gets read before the camera leaves
        const t = raw < 0.45 ? 0 : (raw - 0.45) / 0.55;
        return Math.min(ANCHORS.length - 1, i + t * t * (3 - 2 * t));
      }
    }
    return 0;
  };

  useFrame((_, dt) => {
    const goal = target();
    u.current = THREE.MathUtils.damp(u.current, goal, 2.6, dt);
    const k = u.current / (ANCHORS.length - 1);
    pos.getPoint(k, camera.position);
    look.getPoint(k, tmp);
    if (!still) {
      camera.position.x += sway.current.x * 0.25;
      camera.position.y -= sway.current.y * 0.12;
    }
    camera.lookAt(tmp);
    raise.current = THREE.MathUtils.damp(raise.current, u.current < 0.5 || u.current > ANCHORS.length - 1.6 ? 1 : 0, 1.6, dt);
    chest.current = THREE.MathUtils.damp(chest.current, Math.abs(u.current - 4) < 0.6 ? 1 : 0, 3, dt);
  });

  return (
    <>
      <Sky />
      <Sea />
      <Island narrow={narrow} />
      <Ship raise={raise} />
      <Signs names={names} fonts={fonts} />
      <GoldTrail />
      <Code fonts={fonts} />
      <Chest open={chest} />
      <Cannon narrow={narrow} />
      <Gulls />
    </>
  );
}

function Pace() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
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
  }, [invalidate]);
  return null;
}

export default function PirateWalk({ names, still = false }: { names: string[]; still?: boolean }) {
  const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;
  const [dpr, setDpr] = useState(narrow ? 1 : 1.25);
  useEffect(() => {
    // a slow device gets a lighter picture: watch the first seconds of frames
    let n = 0;
    const t0 = performance.now();
    let id = 0;
    const tick = () => {
      n++;
      if (performance.now() - t0 > 3000) {
        if (n / 3 < 22) setDpr(0.75);
        return;
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <Canvas
      className="walk__canvas"
      dpr={dpr}
      frameloop="demand"
      camera={{ position: [0, 3.4, 13], fov: narrow ? 60 : 46, near: 0.1, far: 160 }}
      gl={{ antialias: !narrow, alpha: false, powerPreference: "default" }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#ffd9a8");
        scene.fog = new THREE.Fog("#ffd9a8", 34, 90);
      }}
    >
      <Pace />
      <hemisphereLight args={["#cdeeff", "#f4d58d", 1.1]} />
      <directionalLight position={[-10, 14, 9]} intensity={1.5} color="#fff2d6" />
      <Walk narrow={narrow} names={names} still={still} />
    </Canvas>
  );
}
