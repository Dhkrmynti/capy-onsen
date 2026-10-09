/**
 * The Hoard: one cartoon cave, walked by scrolling. A dragon sleeps on a mound of gold; the ten
 * Keepers' names glow in alcoves on the left wall; a lava river carries the fees; runes carry the
 * rules; a chest holds your share; a fire pit burns what is bought back; and at the end the dragon
 * opens an eye. Toon-shaded with ink outlines, at most 30 fps, nothing while the tab is hidden.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeElements } from "@react-three/fiber";

const INK = "#1a0f0d";
const ANCHORS = ["top", "ladder", "round", "rules", "card", "record", "closing"] as const;

/* ───────── shared toon kit ───────── */
const STEPS = (() => {
  const t = new THREE.DataTexture(new Uint8Array([70, 70, 70, 255, 160, 160, 160, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
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

/* ───────── camera stations, one per page section ───────── */
type Station = { pos: [number, number, number]; look: [number, number, number] };
function stations(narrow: boolean): Station[] {
  const n = narrow ? 1 : 0;
  return [
    { pos: [narrow ? 0.5 : -2.5, 4.6 + n, narrow ? 12 : 6.5], look: [narrow ? 2 : -4.2, 2.6, -8] }, // the dragon asleep on the hoard
    { pos: [3, 2.6, 3], look: [-11, 2.2, -1] }, // the Keepers' alcoves, left wall
    { pos: [-2, 3.2, 3], look: [6.5, 0, 6] }, // the lava river: fees flowing
    { pos: [-1, 2.8, 1], look: [11.5, 3.2, -9] }, // the rune wall, to the right of the panel
    { pos: [-1.6, 2.4, 5], look: [-7, 0.8, 11.5] }, // your chest
    { pos: [2.4, 2.2, 5.6], look: [7, 1, 1] }, // the fire pit
    { pos: [narrow ? 2.8 : 5, 4 + n * 0.5 + (narrow ? 0 : 0.6), narrow ? 1 : 2], look: narrow ? [3.1, 3.6, -6] : [2.4, 2.6, -5.5] }, // the dragon wakes, eye to eye
  ];
}

/* ───────── the cave ───────── */
function Cave({ narrow }: { narrow: boolean }) {
  const rock = useMemo(() => toon("#3a2a3f"), []);
  const rockDark = useMemo(() => toon("#271a2b"), []);
  const floor = useMemo(() => toon("#2c1f2c"), []);
  const spikes = useMemo(() => {
    const n = narrow ? 40 : 80;
    const m = new THREE.InstancedMesh(new THREE.ConeGeometry(0.5, 2.6, 6), toon("#4a3650"), n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = 4 + rand() * 11;
      o.position.set(Math.cos(a) * r, 11.5 - rand() * 0.5, Math.sin(a) * r - 1);
      o.rotation.set(Math.PI, 0, 0);
      const s = 0.6 + rand() * 1.4;
      o.scale.set(s, s * (0.8 + rand()), s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, [narrow]);
  const boulders = useMemo(() => {
    const n = narrow ? 18 : 34;
    const m = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), rock, n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = 12 + rand() * 2.5;
      o.position.set(Math.cos(a) * r, rand() * 1.2, Math.sin(a) * r - 1);
      o.rotation.set(rand() * 3, rand() * 3, rand() * 3);
      const s = 0.8 + rand() * 1.8;
      o.scale.set(s, s * 0.8, s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, [narrow, rock]);
  return (
    <group>
      {/* the room: a rough dome */}
      <mesh material={rockDark}>
        <sphereGeometry args={[16, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshToonMaterial color="#271a2b" gradientMap={STEPS} side={THREE.BackSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={floor}>
        <circleGeometry args={[16, 40]} />
      </mesh>
      <primitive object={spikes} />
      <primitive object={boulders} />
    </group>
  );
}

/* ───────── the hoard: a mound of gold and scattered coins ───────── */
function Hoard({ narrow }: { narrow: boolean }) {
  const gold = useMemo(() => toon("#ffc83d"), []);
  const mound = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0, 3.1],
          [1.6, 2.8],
          [3.4, 1.9],
          [5.2, 0.8],
          [6.6, 0.15],
          [7.2, 0],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        40,
      ),
    [],
  );
  const coins = useMemo(() => {
    const n = narrow ? 160 : 360;
    const m = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.28, 0.28, 0.07, 18), toon("#ffd86b"), n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 7.4;
      const h = Math.max(0, 3.1 * (1 - Math.pow(r / 7.2, 1.3)));
      o.position.set(Math.cos(a) * r, h + 0.05, Math.sin(a) * r);
      o.rotation.set(rand() * 1.2 - 0.6, rand() * 6, rand() * 1.2 - 0.6);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, [narrow]);
  const gems = useMemo(() => {
    const n = narrow ? 14 : 26;
    const m = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.22, 0), toon("#ffffff"), n);
    const o = new THREE.Object3D();
    const cols = ["#2fd18a", "#e2341d", "#7c5cff", "#38c7ff"].map((c) => new THREE.Color(c));
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = 1 + rand() * 5.6;
      const h = Math.max(0, 3.1 * (1 - Math.pow(r / 7.2, 1.3)));
      o.position.set(Math.cos(a) * r, h + 0.15, Math.sin(a) * r);
      o.rotation.set(rand() * 3, rand() * 3, rand() * 3);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, cols[i % cols.length]);
    }
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, [narrow]);
  return (
    <group position={[0, 0, -8]}>
      <Inked geometry={mound} material={gold} ink={1.01} />
      <primitive object={coins} />
      <primitive object={gems} />
      <pointLight color="#ffb347" intensity={26} distance={16} decay={1.6} position={[0, 5, 4]} />
    </group>
  );
}

/* ───────── the dragon: asleep on the gold, wakes at the end ───────── */
function Dragon({ wake }: { wake: React.MutableRefObject<number> }) {
  const root = useRef<THREE.Group>(null);
  const neck = useRef<THREE.Group>(null);
  const lidL = useRef<THREE.Mesh>(null);
  const lidR = useRef<THREE.Mesh>(null);
  const tail = useRef<THREE.Group>(null);
  const m = useMemo(() => ({ hide: toon("#2fbf71"), belly: toon("#f6d58a"), horn: toon("#f3e9d2"), wing: toon("#1f8f55", { side: THREE.DoubleSide }), eye: toon("#ffcf3a"), pupil: new THREE.MeshBasicMaterial({ color: INK }) }), []);
  const g = useMemo(() => {
    const body = new THREE.SphereGeometry(1, 28, 20).scale(2.6, 1.25, 1.6);
    const neckGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.4, 0.6, 1.1), new THREE.Vector3(0.2, 0.4, 2.2)]), 20, 0.48, 12);
    const head = new THREE.SphereGeometry(1, 24, 18).scale(0.9, 0.62, 1.1);
    const snout = new THREE.SphereGeometry(1, 20, 14).scale(0.62, 0.42, 0.7);
    const horn = new THREE.ConeGeometry(0.14, 0.75, 10);
    const spike = new THREE.ConeGeometry(0.2, 0.6, 6);
    const ws = new THREE.Shape();
    ws.moveTo(0, 0);
    ws.lineTo(2.8, 1.6);
    ws.lineTo(2.2, 0.6);
    ws.lineTo(3.2, 0.2);
    ws.lineTo(2.2, -0.2);
    ws.lineTo(2.8, -1);
    ws.lineTo(0, -0.4);
    const wing = new THREE.ShapeGeometry(ws);
    const tailGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-1.6, -0.6, -1.2), new THREE.Vector3(-3.4, -1.2, -0.6), new THREE.Vector3(-4.2, -1.8, 1.4), new THREE.Vector3(-3.2, -2.1, 2.8)]), 40, 0.34, 10, false);
    const eye = new THREE.SphereGeometry(0.17, 14, 10);
    const lid = new THREE.SphereGeometry(0.19, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    return { body, neckGeo, head, snout, horn, spike, wing, tailGeo, eye, lid };
  }, []);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const w = wake.current;
    if (root.current) root.current.scale.y = 1 + Math.sin(t * 1.3) * 0.025 * (1 - w); // breathing
    if (neck.current) {
      neck.current.rotation.x = -w * 0.35;
      neck.current.position.y = 0.2 + w * 0.6;
    }
    // lids drop away as it wakes, and it blinks once in a while
    const blink = w > 0.5 && (t % 4.2) < 0.15 ? 1 : 0;
    const open = Math.max(0, w * 1.2 - blink);
    [lidL.current, lidR.current].forEach((l) => l && (l.rotation.x = -Math.PI / 2 - open * 1.4));
    if (tail.current) tail.current.rotation.y = Math.sin(t * 0.6) * 0.08 + w * 0.15;
  });

  return (
    <group position={[0, 3.05, -8.6]} rotation={[0, -0.25, 0]}>
      <group ref={root}>
        <Inked geometry={g.body} material={m.hide} ink={1.035} />
        <mesh geometry={g.body} material={m.belly} scale={[0.95, 0.8, 0.98]} position={[0, -0.32, 0]} />
        {[-1.6, -0.8, 0, 0.8, 1.6].map((x, i) => (
          <Inked key={i} geometry={g.spike} material={m.horn} position={[x, 1.25 - Math.abs(x) * 0.08, 0]} ink={1.2} />
        ))}
        {/* wings folded on the back */}
        <Inked geometry={g.wing} material={m.wing} position={[0.2, 0.9, 0.55]} rotation={[-1.1, 0.2, 0.35]} ink={1.03} />
        <Inked geometry={g.wing} material={m.wing} position={[0.2, 0.9, -0.55]} rotation={[1.1, -0.2, 0.35]} ink={1.03} />
      </group>
      <group ref={tail} position={[-2.2, 0, 0]}>
        <Inked geometry={g.tailGeo} material={m.hide} ink={1.08} />
      </group>
      {/* neck and head, resting toward the visitor */}
      <group ref={neck} position={[1.6, 0.2, 0.4]} rotation={[0, 0.7, 0]}>
        <Inked geometry={g.neckGeo} material={m.hide} ink={1.06} />
        <group position={[0.2, 0.42, 2.7]}>
          <Inked geometry={g.head} material={m.hide} ink={1.04} />
          <Inked geometry={g.snout} material={m.hide} position={[0, -0.16, 0.85]} ink={1.05} />
          <mesh geometry={g.snout} material={m.belly} position={[0, -0.3, 0.86]} scale={[0.9, 0.6, 0.96]} />
          <Inked geometry={g.horn} material={m.horn} position={[0.42, 0.62, -0.35]} rotation={[-0.7, 0, -0.35]} ink={1.15} />
          <Inked geometry={g.horn} material={m.horn} position={[-0.42, 0.62, -0.35]} rotation={[-0.7, 0, 0.35]} ink={1.15} />
          {[1, -1].map((side) => (
            <group key={side} position={[side * 0.42, 0.22, 0.55]}>
              <mesh geometry={g.eye} material={m.eye} />
              <mesh geometry={g.eye} material={m.pupil} scale={[0.35, 0.85, 0.35]} position={[0, 0, 0.12]} />
              <mesh ref={side > 0 ? lidL : lidR} geometry={g.lid} material={m.hide} rotation={[-Math.PI / 2, 0, 0]} />
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}

/* ───────── the Keepers' alcoves: ten niches, the top ten names ───────── */
function Alcoves({ names }: { names: string[] }) {
  const stone = useMemo(() => toon("#4b3653"), []);
  const plates = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) =>
        new THREE.MeshBasicMaterial({
          map: canvasTex(512, 200, (g) => {
            const top = i < 5;
            g.fillStyle = top ? "#ffc83d" : "#e9dcc0";
            g.fillRect(0, 0, 512, 200);
            g.strokeStyle = INK;
            g.lineWidth = 14;
            g.strokeRect(7, 7, 498, 186);
            g.fillStyle = INK;
            g.textAlign = "center";
            g.font = '700 46px "Martian Mono", monospace';
            g.fillText(`No. ${i + 1}`, 256, 70);
            g.font = '800 54px "Manrope", sans-serif';
            const n = names[i] || "open";
            g.fillText(n.length > 14 ? n.slice(0, 13) + "…" : n, 256, 150);
          }),
        }),
      ),
    [names],
  );
  return (
    <group>
      {Array.from({ length: 10 }, (_, i) => {
        const a = Math.PI * 0.62 + (i / 9) * Math.PI * 0.5;
        const r = 12.6;
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r * 0.9 - 2;
        const y = i < 5 ? 3.4 : 1.4;
        return (
          <group key={i} position={[x, y, z]} rotation={[0, -a + Math.PI, 0]}>
            <mesh material={stone}>
              <boxGeometry args={[2.1, 1.7, 0.5]} />
            </mesh>
            <mesh material={OUTLINE} scale={[1.04, 1.05, 1.1]}>
              <boxGeometry args={[2.1, 1.7, 0.5]} />
            </mesh>
            <mesh material={plates[i]} position={[0, 0, 0.27]}>
              <planeGeometry args={[1.8, 0.7]} />
            </mesh>
            {i < 5 ? <pointLight color="#ffc83d" intensity={3.5} distance={3.5} decay={1.6} position={[0, 0.4, 1]} /> : null}
          </group>
        );
      })}
    </group>
  );
}

/* ───────── the lava river: a glowing band that flows ───────── */
function Lava() {
  const tex = useMemo(() => {
    const t = canvasTex(256, 256, (g) => {
      const grd = g.createLinearGradient(0, 0, 256, 0);
      grd.addColorStop(0, "#ff3a12");
      grd.addColorStop(0.5, "#ffb21c");
      grd.addColorStop(1, "#ff3a12");
      g.fillStyle = grd;
      g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 26; i++) {
        g.fillStyle = `rgba(255,240,170,${0.4 + rand() * 0.4})`;
        g.beginPath();
        g.ellipse(rand() * 256, rand() * 256, 6 + rand() * 18, 3 + rand() * 6, 0, 0, Math.PI * 2);
        g.fill();
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 4);
    return t;
  }, []);
  useFrame((_, dt) => (tex.offset.y -= dt * 0.12));
  const curve = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(3, 0.04, 16), new THREE.Vector3(5.2, 0.04, 9), new THREE.Vector3(7.8, 0.04, 3), new THREE.Vector3(12, 0.04, -1)]), []);
  const geo = useMemo(() => {
    const pts = curve.getPoints(60);
    const shape: THREE.Vector3[] = [];
    const uvs: number[] = [];
    const idx: number[] = [];
    pts.forEach((p, i) => {
      const tng = curve.getTangent(i / 60);
      const side = new THREE.Vector3(-tng.z, 0, tng.x).multiplyScalar(1.3);
      shape.push(p.clone().add(side), p.clone().sub(side));
      uvs.push(0, i / 60, 1, i / 60);
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
  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial map={tex} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <pointLight color="#ff6a1f" intensity={20} distance={12} decay={1.6} position={[6.5, 1.2, 6]} />
    </group>
  );
}

/* ───────── the rune wall: the rules, carved ───────── */
function Runes() {
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: canvasTex(1024, 640, (g) => {
          g.fillStyle = "#3d2c45";
          g.fillRect(0, 0, 1024, 640);
          g.strokeStyle = "#ffc83d";
          g.lineWidth = 10;
          g.strokeRect(30, 30, 964, 580);
          g.fillStyle = "#ffc83d";
          g.textAlign = "center";
          g.font = '700 74px "Grenze Gotisch", serif';
          g.fillText("The Law of the Hoard", 512, 140);
          g.font = '700 46px "Manrope", sans-serif';
          ["Hold 100,000 $HOARD to stand watch", "The ten biggest share every haul", "One sale and you're burned", "The founder keeps watch, never paid"].forEach((l, i) => g.fillText(l, 512, 250 + i * 92));
        }),
      }),
    [],
  );
  return (
    <group position={[11.4, 3.2, -4.4]} rotation={[0, -Math.PI / 2 + 0.25, 0]}>
      <mesh material={mat}>
        <planeGeometry args={[6.4, 4]} />
      </mesh>
      <pointLight color="#ffc83d" intensity={6} distance={7} decay={1.6} position={[0, 0, 2]} />
    </group>
  );
}

/* ───────── the chest: your share ───────── */
function Chest({ open }: { open: React.MutableRefObject<number> }) {
  const lid = useRef<THREE.Group>(null);
  const wood = useMemo(() => toon("#8a4b2a"), []);
  const band = useMemo(() => toon("#ffc83d"), []);
  const glow = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ffd86b" }), []);
  useFrame(() => lid.current && (lid.current.rotation.x = -open.current * 1.6));
  return (
    <group position={[-7, 0, 10]} rotation={[0, 0.9, 0]}>
      <Inked geometry={useMemo(() => new THREE.BoxGeometry(2.2, 1.2, 1.4), [])} material={wood} position={[0, 0.6, 0]} ink={1.04} />
      <Inked geometry={useMemo(() => new THREE.BoxGeometry(0.22, 1.24, 1.44), [])} material={band} position={[-0.7, 0.6, 0]} ink={1.06} />
      <Inked geometry={useMemo(() => new THREE.BoxGeometry(0.22, 1.24, 1.44), [])} material={band} position={[0.7, 0.6, 0]} ink={1.06} />
      <mesh material={glow} position={[0, 1.18, 0]}>
        <boxGeometry args={[2, 0.06, 1.2]} />
      </mesh>
      <group ref={lid} position={[0, 1.2, -0.7]}>
        <Inked geometry={useMemo(() => new THREE.CylinderGeometry(0.7, 0.7, 2.2, 20, 1, false, 0, Math.PI).rotateZ(Math.PI / 2), [])} material={wood} position={[0, 0, 0.7]} ink={1.04} />
      </group>
      <pointLight color="#ffd86b" intensity={6} distance={4} decay={1.6} position={[0, 2, 0]} />
    </group>
  );
}

/* ───────── the fire pit: dragonfire burns what is bought back ───────── */
function FirePit({ narrow }: { narrow: boolean }) {
  const pts = useRef<THREE.Points>(null);
  const N = narrow ? 50 : 110;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    return g;
  }, [N]);
  const seeds = useMemo(() => Array.from({ length: N }, () => [rand(), rand() * Math.PI * 2, rand()]), [N]);
  const sprite = useMemo(
    () =>
      canvasTex(64, 64, (g) => {
        const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        r.addColorStop(0, "rgba(255,250,210,1)");
        r.addColorStop(0.4, "rgba(255,160,40,0.9)");
        r.addColorStop(1, "rgba(226,52,29,0)");
        g.fillStyle = r;
        g.fillRect(0, 0, 64, 64);
      }),
    [],
  );
  const bowl = useMemo(() => new THREE.LatheGeometry([[0.3, 0], [1.1, 0.1], [1.4, 0.7], [1.3, 0.8], [0.9, 0.3], [0.3, 0.2]].map(([x, y]) => new THREE.Vector2(x, y)), 28), []);
  const stone = useMemo(() => toon("#5a4060"), []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const p = geo.getAttribute("position") as THREE.BufferAttribute;
    seeds.forEach(([a, b, c], i) => {
      const k = (t * (0.6 + a * 0.6) + a) % 1;
      const r = (1 - k) * 0.7 * c;
      p.setXYZ(i, Math.cos(b + t * 2) * r, 0.7 + k * 2.4, Math.sin(b + t * 2) * r);
    });
    p.needsUpdate = true;
  });
  return (
    <group position={[7, 0, 1]}>
      <Inked geometry={bowl} material={stone} ink={1.04} />
      <points ref={pts} geometry={geo}>
        <pointsMaterial map={sprite} size={0.9} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </points>
      <pointLight color="#ff7a2a" intensity={16} distance={9} decay={1.6} position={[0, 2, 0]} />
    </group>
  );
}

/* ───────── the walk: scroll drives the camera along the stations ───────── */
function Walk({ narrow, names, still }: { narrow: boolean; names: string[]; still: boolean }) {
  const { camera } = useThree();
  const st = useMemo(() => stations(narrow), [narrow]);
  const pos = useMemo(() => new THREE.CatmullRomCurve3(st.map((s) => new THREE.Vector3(...s.pos)), false, "centripetal"), [st]);
  const look = useMemo(() => new THREE.CatmullRomCurve3(st.map((s) => new THREE.Vector3(...s.look)), false, "centripetal"), [st]);
  const u = useRef(0);
  const wake = useRef(0);
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
        // hold on each station, then move: the plaque gets read before the camera leaves
        const t = raw < 0.45 ? 0 : (raw - 0.45) / 0.55;
        return Math.min(ANCHORS.length - 1, i + t * t * (3 - 2 * t));
      }
    }
    return 0;
  };

  useFrame((s, dt) => {
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
    wake.current = THREE.MathUtils.damp(wake.current, u.current > ANCHORS.length - 1.6 ? 1 : 0, 2, dt);
    chest.current = THREE.MathUtils.damp(chest.current, Math.abs(u.current - 4) < 0.6 ? 1 : 0, 3, dt);
    void s;
  });

  return (
    <>
      <Cave narrow={narrow} />
      <Hoard narrow={narrow} />
      <Dragon wake={wake} />
      <Alcoves names={names} />
      <Lava />
      <Runes />
      <Chest open={chest} />
      <FirePit narrow={narrow} />
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

export default function HoardWalk({ names, still = false }: { names: string[]; still?: boolean }) {
  const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;
  const [dpr, setDpr] = useState(narrow ? 1 : 1.25);
  useEffect(() => {
    // a slow device gets a lighter picture: watch the first seconds of frames
    let n = 0;
    let t0 = performance.now();
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
      camera={{ position: [0, 3.4, 13], fov: narrow ? 60 : 46, near: 0.1, far: 60 }}
      gl={{ antialias: !narrow, alpha: false, powerPreference: "default" }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#140c14");
        scene.fog = new THREE.Fog("#140c14", 14, 34);
      }}
    >
      <Pace />
      <hemisphereLight args={["#b98cff", "#2a1408", 0.9]} />
      <directionalLight position={[-6, 12, 10]} intensity={0.9} color="#ffe2c0" />
      <Walk narrow={narrow} names={names} still={still} />
    </Canvas>
  );
}
