/**
 * Orbiters: one cartoon planet, walked by scrolling. A rocket stands on its pad at the top of a
 * tiny world; the ten crew ride pods in orbit with their names on them; a fuel line feeds the
 * rocket the fees; the flight rules stand on a billboard; a landed capsule holds your seat; a
 * radar dish keeps the log; and at the end the rocket lifts off. Physically lit with procedural
 * textures (no image downloads), one shadow-casting sun on desktop, at most 30 fps, nothing while
 * the tab is hidden.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { gasGiant, milkyWay, regolith, ribs, ringBands, solarCells, stageSkin } from "./spaceTex";

const INK = "#161616";
const C = { red: "#d6372b", cream: "#f1e4c8", blue: "#1f2f8a", night: "#0e1433", burn: "#ff7a1a", ground: "#e6d3ad", crater: "#cdb78e" };
const ANCHORS = ["top", "ladder", "round", "rules", "card", "record", "closing"] as const;
const R = 12;
const CENTER = new THREE.Vector3(0, -R, 0);

/* ───────── shared material kit ───────── */
const paint = (color: string, extra: THREE.MeshPhysicalMaterialParameters = {}) =>
  new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, metalness: 0.05, clearcoat: 0.6, clearcoatRoughness: 0.25, ...extra });
const steel = (color = "#9aa0ab", roughness = 0.38) => new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness });

/** One lit part that casts and takes shadows (the old ink outline is gone). */
function Inked({ geometry, material, ink: _ink, ...rest }: { geometry: THREE.BufferGeometry; material: THREE.Material; ink?: number } & ThreeElements["group"]) {
  void _ink;
  return (
    <group {...rest}>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
    </group>
  );
}

const rand = (() => {
  let s = 7;
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
    Promise.all(['900 64px "Unbounded"', '800 40px "Golos Text"', '600 40px "Spline Sans Mono"'].map((f) => document.fonts.load(f)))
      .catch(() => null)
      .then(() => live && setOk(true));
    return () => {
      live = false;
    };
  }, []);
  return ok;
}

/** A point on the planet's surface (degrees), lifted h above it, and the rotation that stands a thing upright there. */
function surf(lon: number, lat: number, h = 0) {
  const lo = THREE.MathUtils.degToRad(lon);
  const la = THREE.MathUtils.degToRad(lat);
  const n = new THREE.Vector3(Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo));
  const p = CENTER.clone().addScaledVector(n, R + h);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
  // turn the thing about its own up so its front faces away from the rocket, toward open space
  const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), lo);
  return { p, q: q.multiply(yaw), n };
}

const SPOT = {
  tanks: surf(70, 64),
  board: surf(-118, 63),
  capsule: surf(125, 62),
  radar: surf(-152, 63),
};
/** The crew pods ride an arc over the far side of the planet, out of the opening's view. */
const POD_LON = (i: number) => 146 + i * 7.5;

/* ───────── camera stations, one per page section ───────── */
type V3 = [number, number, number];
type Station = { pos: V3; look: V3 };
function stations(narrow: boolean): Station[] {
  const n = narrow ? 1 : 0;
  // a subject at p seen from outside (its outward direction), set off to one side of the frame
  const aside = (p: THREE.Vector3, lon: number, dist: number, up: number, side: number): Station => {
    const lo = THREE.MathUtils.degToRad(lon);
    const out = new THREE.Vector3(Math.sin(lo), 0, Math.cos(lo));
    const right = new THREE.Vector3(out.z, 0, -out.x); // the camera's right, looking back along -out
    const pos = p.clone().addScaledVector(out, dist).add(new THREE.Vector3(0, up, 0));
    const look = p.clone().addScaledVector(right, -side * 0.68 * dist).add(new THREE.Vector3(0, up * 0.35, 0));
    return { pos: [pos.x, pos.y, pos.z], look: [look.x, look.y, look.z] };
  };
  const pods = new THREE.Vector3(Math.sin(THREE.MathUtils.degToRad(180)) * 10, 4.4, Math.cos(THREE.MathUtils.degToRad(180)) * 10);
  return [
    { pos: [narrow ? 0.4 : -3.2, 3.4 + n, narrow ? 17 : 14], look: [narrow ? 0.6 : -4.6, 2.6 + n * 0.6, 0] }, // the rocket on its pad
    aside(pods, 180, 17, 2.5, narrow ? 0 : -0.42), // the crew pods, left of the roster
    aside(SPOT.tanks.p, 70, 10, 4, 0), // the fuel line
    aside(SPOT.board.p.clone().add(new THREE.Vector3(0, 2.4, 0)), -118, 14, 2, narrow ? 0 : 0.52), // the rules board, right of the red field
    aside(SPOT.capsule.p.clone().add(new THREE.Vector3(0, 1.2, 0)), 125, 9, 2, narrow ? 0 : 0.5), // the capsule, right of the sheet
    aside(SPOT.radar.p.clone().add(new THREE.Vector3(0, 1.8, 0)), -152, 9, 2, narrow ? 0 : 0.5), // the radar, right of the log
    { pos: [narrow ? 3 : 4, 2.6, narrow ? 15 : 13], look: [0, 6.5 + n, 0] }, // liftoff
  ];
}

/* ───────── space: sky, stars, a red planet and a moon ───────── */
function Space({ narrow }: { narrow: boolean }) {
  const sky = useMemo(() => milkyWay(narrow), [narrow]);
  const stars = useMemo(() => {
    const N = narrow ? 260 : 520;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const u = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const d = 90 + rand() * 20;
      pos.set([Math.cos(a) * s * d, u * d, Math.sin(a) * s * d], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [narrow]);
  const dot = useMemo(
    () =>
      canvasTex(32, 32, (g) => {
        const r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
        r.addColorStop(0, "rgba(255,255,255,1)");
        r.addColorStop(0.25, "rgba(230,236,255,0.9)");
        r.addColorStop(1, "rgba(200,210,255,0)");
        g.fillStyle = r;
        g.fillRect(0, 0, 32, 32);
      }),
    [],
  );
  const red = useMemo(() => new THREE.MeshStandardMaterial({ map: gasGiant(), roughness: 0.9 }), []);
  const cream = useMemo(() => {
    const t = regolith(512, 256, "#c9c2b4", "#7d776d", "#ebe6dc", 70);
    return new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bump, bumpScale: 2, roughness: 1 });
  }, []);
  const ring = useMemo(() => new THREE.MeshBasicMaterial({ map: ringBands(19 / 23, 1), transparent: true, side: THREE.DoubleSide, depthWrite: false }), []);
  const ball = useMemo(() => new THREE.SphereGeometry(1, 48, 32), []);
  // a thin atmosphere: brighter where the surface turns away from the eye
  const halo = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        uniforms: { tint: { value: new THREE.Color("#ff8a66") } },
        vertexShader: "varying vec3 n; varying vec3 v; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); n = normalize(normalMatrix * normal); v = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
        fragmentShader: "uniform vec3 tint; varying vec3 n; varying vec3 v; void main(){ float f = pow(1.0 - abs(dot(n, v)), 2.5); gl_FragColor = vec4(tint * f * 0.9, f); }",
      }),
    [],
  );
  return (
    <group>
      <mesh>
        <sphereGeometry args={[130, 24, 16]} />
        <meshBasicMaterial map={sky} side={THREE.BackSide} depthWrite={false} fog={false} />
      </mesh>
      <points geometry={stars}>
        <pointsMaterial map={dot} size={narrow ? 0.9 : 0.7} transparent opacity={0.9} depthWrite={false} fog={false} />
      </points>
      {/* the red planet with its ring, the poster's big circle */}
      <group position={[-46, 16, -78]} rotation={[0.3, 0, 0.35]}>
        <Inked geometry={ball} material={red} scale={15} />
        <mesh geometry={ball} material={halo} scale={15.9} />
        <mesh rotation={[Math.PI / 2 - 0.25, 0, 0]} material={ring}>
          <ringGeometry args={[19, 23, 72]} />
        </mesh>
      </group>
      <group position={[38, 26, -70]}>
        <Inked geometry={ball} material={cream} scale={6} ink={1.02} />
      </group>
    </group>
  );
}

/* ───────── the little planet: ground, craters, rocks ───────── */
function Planet({ narrow }: { narrow: boolean }) {
  const ground = useMemo(() => {
    const t = regolith(narrow ? 1024 : 2048, narrow ? 512 : 1024, "#a89e8c", "#625a4f", "#d6cdbd", narrow ? 260 : 520);
    return new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bump, bumpScale: 3, roughness: 0.97 });
  }, [narrow]);
  const sphere = useMemo(() => new THREE.SphereGeometry(R, 72, 48), []);
  const rocks = useMemo(() => {
    const n = narrow ? 26 : 64;
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const pp = geo.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pp.count; i++) {
      const k = 0.72 + rand() * 0.45; // jagged, not round
      pp.setXYZ(i, pp.getX(i) * k, pp.getY(i) * k * 0.8, pp.getZ(i) * k);
    }
    geo.computeVertexNormals();
    const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: "#837a6c", roughness: 1, flatShading: true }), n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const s = surf(rand() * 360, 26 + rand() * 58, 0.05);
      o.position.copy(s.p);
      o.rotation.set(rand() * 3, rand() * 3, rand() * 3);
      const k = 0.12 + Math.pow(rand(), 2) * 0.55;
      o.scale.set(k, k * 0.7, k);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }, [narrow]);
  return (
    <group>
      {/* turned on its side so the texture's pinched pole sits away from the launch pad */}
      <mesh geometry={sphere} material={ground} position={CENTER} rotation={[Math.PI / 2, 0, 0]} receiveShadow />
      <primitive object={rocks} />
    </group>
  );
}

/* ───────── the launch vehicle on its pad; lifts off at the close ───────── */
const ROCKET_SCALE = 0.55;

/** A steel lattice tower: posts, rings and cross-bracing as one instanced mesh. */
function Tower() {
  const truss = useMemo(() => {
    const H = 7.4;
    const bay = 0.62;
    const w = 0.9;
    const bars: { p: THREE.Vector3; s: THREE.Vector3; r: THREE.Euler }[] = [];
    const t = 0.06;
    for (const x of [-w / 2, w / 2]) for (const z of [-w / 2, w / 2]) bars.push({ p: new THREE.Vector3(x, H / 2, z), s: new THREE.Vector3(t * 1.6, H, t * 1.6), r: new THREE.Euler() });
    const diag = Math.hypot(w, bay);
    const ang = Math.atan2(bay, w);
    for (let y = 0; y < H - 0.01; y += bay) {
      for (const sd of [-1, 1]) {
        bars.push({ p: new THREE.Vector3(0, y, sd * w / 2), s: new THREE.Vector3(w, t, t), r: new THREE.Euler() });
        bars.push({ p: new THREE.Vector3(sd * w / 2, y, 0), s: new THREE.Vector3(t, t, w), r: new THREE.Euler() });
        bars.push({ p: new THREE.Vector3(0, y + bay / 2, sd * w / 2), s: new THREE.Vector3(diag, t, t), r: new THREE.Euler(0, 0, sd * ang) });
        bars.push({ p: new THREE.Vector3(sd * w / 2, y + bay / 2, 0), s: new THREE.Vector3(t, t, diag), r: new THREE.Euler(sd * ang, 0, 0) });
      }
    }
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), paint("#b4302a", { metalness: 0.45, roughness: 0.5, clearcoat: 0.15 }), bars.length);
    const o = new THREE.Object3D();
    bars.forEach((b, i) => {
      o.position.copy(b.p);
      o.scale.copy(b.s);
      o.rotation.copy(b.r);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }, []);
  const arm = useMemo(() => steel("#c3c6cc", 0.5), []);
  const lamp = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ff4a3a" }), []);
  return (
    <group position={[-2.1, 0.35, -0.3]}>
      <primitive object={truss} />
      {/* swing arms reaching the vehicle */}
      {[3.2, 5.0].map((y) => (
        <mesh key={y} material={arm} position={[0.95, y, 0.12]} rotation={[0, -0.12, 0]} castShadow>
          <boxGeometry args={[1.5, 0.16, 0.34]} />
        </mesh>
      ))}
      <mesh material={arm} position={[0, 7.9, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 1, 6]} />
      </mesh>
      <mesh material={lamp} position={[0, 8.45, 0]}>
        <sphereGeometry args={[0.07, 8, 6]} />
      </mesh>
    </group>
  );
}

function Rocket({ lift, fonts }: { lift: React.MutableRefObject<number>; fonts: boolean }) {
  const body = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Group>(null);
  const smoke = useRef<THREE.Points>(null);
  const fire = useRef<THREE.PointLight>(null);
  // the exhaust plume: hot at the nozzle, thinning to nothing, softer at its edges
  const plume = useMemo(() => {
    const t = canvasTex(64, 256, (gg) => {
      const v = gg.createLinearGradient(0, 0, 0, 256);
      v.addColorStop(0, "#ffffff");
      v.addColorStop(0.35, "#9a9a9a");
      v.addColorStop(1, "#000000");
      gg.fillStyle = v;
      gg.fillRect(0, 0, 64, 256);
      const h = gg.createLinearGradient(0, 0, 64, 0);
      h.addColorStop(0, "rgba(0,0,0,0.85)");
      h.addColorStop(0.5, "rgba(0,0,0,0)");
      h.addColorStop(1, "rgba(0,0,0,0.85)");
      gg.globalCompositeOperation = "multiply";
      gg.fillStyle = h;
      gg.fillRect(0, 0, 64, 256);
    });
    t.colorSpace = THREE.NoColorSpace;
    return t;
  }, []);
  const m = useMemo(
    () => ({
      s1: paint("#ffffff", { map: stageSkin("ORBITERS", true), roughness: 0.4 }),
      s2: paint("#ffffff", { map: stageSkin(null, false), roughness: 0.4 }),
      ribs: new THREE.MeshStandardMaterial({ map: ribs(), metalness: 0.5, roughness: 0.55 }),
      red: paint("#c8332a"),
      dark: steel("#2f3238", 0.5),
      bell: steel("#5b5f68", 0.32),
      silver: steel("#d4d7dd", 0.22),
      pad: new THREE.MeshStandardMaterial({ color: "#8b8c8f", roughness: 0.95 }),
      trench: new THREE.MeshStandardMaterial({ color: "#2b2b2e", roughness: 1 }),
      pole: steel("#9aa0ab", 0.45),
      light: new THREE.MeshBasicMaterial({ color: "#fff4d6" }),
      glow: new THREE.MeshBasicMaterial({ color: "#fff1c2", alphaMap: plume, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
      burn: new THREE.MeshBasicMaterial({ color: "#ff8a2a", alphaMap: plume, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fonts, plume],
  );
  const g = useMemo(() => {
    const lathe = (pts: number[][], seg = 32) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
    const fin = new THREE.Shape();
    fin.moveTo(0.78, 0.1);
    fin.lineTo(1.25, -0.25);
    fin.lineTo(1.25, 0.35);
    fin.lineTo(0.78, 1.0);
    const cyl = (rt: number, rb: number, h: number) => new THREE.CylinderGeometry(rt, rb, h, 40, 1, true);
    return {
      bell: lathe([[0.1, 0], [0.16, -0.06], [0.26, -0.3], [0.36, -0.62], [0.34, -0.63], [0.24, -0.32], [0.14, -0.08], [0.08, 0]], 24),
      thrust: new THREE.CylinderGeometry(0.8, 0.72, 0.55, 40),
      fin: new THREE.ExtrudeGeometry(fin, { depth: 0.08, bevelEnabled: false }).translate(0, 0, -0.04),
      s1: cyl(0.8, 0.8, 4.4),
      inter: cyl(0.8, 0.8, 0.45),
      s2: cyl(0.7, 0.7, 2.6),
      taper: cyl(0.52, 0.7, 0.4),
      s3: cyl(0.52, 0.52, 1.4),
      adapter: cyl(0.42, 0.52, 0.5),
      capsule: new THREE.ConeGeometry(0.42, 0.72, 40),
      les: new THREE.CylinderGeometry(0.04, 0.06, 1.0, 8),
      motor: new THREE.CylinderGeometry(0.1, 0.1, 0.5, 12),
      tip: new THREE.ConeGeometry(0.1, 0.26, 12),
      flame: new THREE.ConeGeometry(0.9, 3.4, 20, 1, true).rotateX(Math.PI).translate(0, -1.9, 0),
      core: new THREE.ConeGeometry(0.55, 2.2, 16, 1, true).rotateX(Math.PI).translate(0, -1.3, 0),
      pad: new THREE.CylinderGeometry(2.6, 2.9, 0.35, 48),
    };
  }, []);
  const N = 70;
  const puff = useMemo(() => {
    const gg = new THREE.BufferGeometry();
    gg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    return gg;
  }, []);
  const seeds = useMemo(() => Array.from({ length: N }, () => [rand(), rand() * Math.PI * 2, rand()]), []);
  const cloud = useMemo(
    () =>
      canvasTex(64, 64, (gg) => {
        const r = gg.createRadialGradient(32, 32, 0, 32, 32, 32);
        r.addColorStop(0, "rgba(250,247,240,0.55)");
        r.addColorStop(0.45, "rgba(232,228,220,0.3)");
        r.addColorStop(1, "rgba(232,228,220,0)");
        gg.fillStyle = r;
        gg.fillRect(0, 0, 64, 64);
      }),
    [],
  );
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const k = lift.current;
    if (body.current) {
      body.current.position.y = 0.35 + k * k * 7;
      body.current.rotation.z = Math.sin(t * 30) * 0.003 * k;
    }
    if (flame.current) {
      const f = 0.05 + k * 1.1 + Math.sin(t * 40) * 0.05 * (0.2 + k);
      flame.current.scale.set(0.5 + k * 0.6, f, 0.5 + k * 0.6);
    }
    const p = puff.getAttribute("position") as THREE.BufferAttribute;
    seeds.forEach(([a, b, c], i) => {
      const life = (t * (0.35 + a * 0.3) + a) % 1;
      const r = (0.6 + life * 4.2 * (0.25 + k)) * (0.6 + c * 0.6);
      p.setXYZ(i, Math.cos(b) * r, 0.25 + life * (0.6 + k * 1.6), Math.sin(b) * r);
    });
    p.needsUpdate = true;
    if (smoke.current) (smoke.current.material as THREE.PointsMaterial).opacity = 0.18 + k * 0.8;
    if (fire.current) fire.current.intensity = k * (60 + Math.sin(t * 40) * 8);
  });
  const bells: V3[] = [
    [0, 0, 0],
    [0.42, 0, 0],
    [-0.42, 0, 0],
    [0, 0, 0.42],
    [0, 0, -0.42],
  ];
  return (
    <group>
      {/* the pad: concrete, a flame trench, floodlights */}
      <Inked geometry={g.pad} material={m.pad} position={[0, 0.17, 0]} />
      <mesh material={m.trench} position={[0, 0.355, 0.9]} receiveShadow>
        <boxGeometry args={[1.3, 0.02, 3.6]} />
      </mesh>
      {[0.6, 2.4, 4.2].map((a) => (
        <group key={a} position={[Math.cos(a) * 2.55, 0.35, Math.sin(a) * 2.55]}>
          <mesh material={m.pole} position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.045, 2.2, 6]} />
          </mesh>
          <mesh material={m.light} position={[0, 2.25, 0]}>
            <boxGeometry args={[0.28, 0.14, 0.1]} />
          </mesh>
        </group>
      ))}
      <Tower />
      <group ref={body} position={[0, 0.35, 0]}>
        <group scale={ROCKET_SCALE}>
          {/* engines and thrust structure */}
          {bells.map((b, i) => (
            <mesh key={i} geometry={g.bell} material={m.bell} position={[b[0], 0.62, b[2]]} castShadow />
          ))}
          <Inked geometry={g.thrust} material={m.dark} position={[0, 0.9, 0]} />
          {[0, 1, 2, 3].map((i) => (
            <group key={i} rotation={[0, (i * Math.PI) / 2 + Math.PI / 4, 0]}>
              <Inked geometry={g.fin} material={m.s2} position={[0, 0.7, 0]} />
            </group>
          ))}
          {/* three stages, the capsule and its escape tower */}
          <Inked geometry={g.s1} material={m.s1} position={[0, 3.37, 0]} />
          <Inked geometry={g.inter} material={m.ribs} position={[0, 5.8, 0]} />
          <Inked geometry={g.s2} material={m.s2} position={[0, 7.32, 0]} />
          <Inked geometry={g.taper} material={m.ribs} position={[0, 8.82, 0]} />
          <Inked geometry={g.s3} material={m.s2} position={[0, 9.72, 0]} />
          <Inked geometry={g.adapter} material={m.silver} position={[0, 10.67, 0]} />
          <Inked geometry={g.capsule} material={m.silver} position={[0, 11.28, 0]} />
          <Inked geometry={g.les} material={m.dark} position={[0, 12.1, 0]} />
          <Inked geometry={g.motor} material={m.red} position={[0, 12.82, 0]} />
          <Inked geometry={g.tip} material={m.red} position={[0, 13.2, 0]} />
          <group ref={flame} position={[0, 0, 0]}>
            <mesh geometry={g.flame} material={m.burn} />
            <mesh geometry={g.core} material={m.glow} />
          </group>
        </group>
        <pointLight ref={fire} color="#ff9a3c" intensity={0} distance={18} decay={1.6} position={[0, -0.8, 0]} />
      </group>
      <points ref={smoke} geometry={puff}>
        <pointsMaterial map={cloud} size={2.6} transparent depthWrite={false} opacity={0.2} />
      </points>
    </group>
  );
}

/* ───────── the crew pods: ten in orbit, names on the side ───────── */
function Pods({ names, fonts }: { names: string[]; fonts: boolean }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const m = useMemo(
    () => ({
      cream: paint("#eceae4", { roughness: 0.42 }),
      silver: steel("#cfd3da", 0.25),
      dark: steel("#3a3d44", 0.5),
      red: paint("#c8332a"),
      panel: new THREE.MeshStandardMaterial({ map: solarCells(), metalness: 0.55, roughness: 0.3 }),
    }),
    [],
  );
  const g = useMemo(
    () => ({
      pod: new THREE.CylinderGeometry(0.32, 0.6, 0.7, 32),
      shield: new THREE.CylinderGeometry(0.62, 0.62, 0.08, 32),
      service: new THREE.CylinderGeometry(0.58, 0.58, 0.85, 32),
      wing: new THREE.BoxGeometry(1.6, 0.03, 0.55),
      band: new THREE.CylinderGeometry(0.59, 0.59, 0.16, 32, 1, true),
      nozzle: new THREE.CylinderGeometry(0.16, 0.3, 0.3, 20, 1, true),
    }),
    [],
  );
  const plates = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) =>
        new THREE.MeshBasicMaterial({
          map: canvasTex(512, 200, (gg) => {
            const top = i < 5;
            gg.fillStyle = top ? C.red : C.cream;
            gg.fillRect(0, 0, 512, 200);
            gg.strokeStyle = INK;
            gg.lineWidth = 12;
            gg.strokeRect(6, 6, 500, 188);
            gg.fillStyle = top ? C.cream : INK;
            gg.font = '900 74px "Unbounded", sans-serif';
            gg.textAlign = "left";
            gg.fillText(String(i + 1).padStart(2, "0"), 26, 90);
            gg.font = '800 46px "Golos Text", sans-serif';
            const n = names[i] || "open seat";
            gg.fillText(n.length > 16 ? n.slice(0, 15) + "…" : n, 26, 160);
          }),
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [names, fonts],
  );
  const spots = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const a = THREE.MathUtils.degToRad(POD_LON(i));
        const r = 9.5 + (i % 2) * 0.8;
        return new THREE.Vector3(Math.sin(a) * r, (i < 5 ? 5.4 : 3.4) + (i % 2) * 0.5, Math.cos(a) * r);
      }),
    [],
  );
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    refs.current.forEach((p, i) => {
      if (!p) return;
      p.position.y = spots[i].y + Math.sin(t * 0.8 + i) * 0.15;
      p.rotation.z = Math.sin(t * 0.5 + i * 2) * 0.05;
    });
  });
  return (
    <group>
      {spots.map((p, i) => (
        <group key={i} ref={(el) => void (refs.current[i] = el)} position={p}>
          {/* each pod turns its nameplate outward, toward the roster's camera */}
          <group rotation={[0, Math.PI, 0]}>
            {/* crew capsule on its service module, solar wings out */}
            <Inked geometry={g.pod} material={m.silver} position={[0, 0.45, 0]} />
            <mesh geometry={g.shield} material={m.dark} position={[0, 0.07, 0]} />
            <Inked geometry={g.service} material={m.cream} position={[0, -0.4, 0]} />
            <mesh geometry={g.band} material={i < 5 ? m.red : m.dark} position={[0, -0.15, 0]} />
            <mesh geometry={g.nozzle} material={m.dark} position={[0, -0.97, 0]} />
            {[-1.45, 1.45].map((x) => (
              <mesh key={x} geometry={g.wing} material={m.panel} position={[x, -0.4, 0]} castShadow />
            ))}
            <mesh material={plates[i]} position={[0, 1.25, 0]}>
              <planeGeometry args={[1.9, 0.74]} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

/* ───────── the fuel line: tanks to the pad, the fees flowing ───────── */
function FuelLine() {
  const s = SPOT.tanks;
  const tex = useMemo(() => {
    const t = canvasTex(256, 64, (g) => {
      g.fillStyle = "#2a2f45";
      g.fillRect(0, 0, 256, 64);
      for (let x = 0; x < 256; x += 64) {
        g.fillStyle = C.burn;
        g.fillRect(x, 0, 34, 64);
        g.fillStyle = "#ffd36b";
        g.fillRect(x + 10, 0, 8, 64);
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(14, 1);
    return t;
  }, []);
  useFrame((_, dt) => (tex.offset.x -= dt * 0.6));
  const pipe = useMemo(() => {
    const pts = [0, 0.25, 0.5, 0.75, 1].map((k) => surf(72 * (1 - k) + 8 * k, 64 * (1 - k) + 86 * k, 0.32).p);
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.16, 10, false);
  }, []);
  const m = useMemo(() => ({ cream: paint("#ecebe6", { roughness: 0.4 }), red: paint("#c8332a"), steel: steel() }), []);
  const tank = useMemo(() => new THREE.CapsuleGeometry(0.9, 2.2, 8, 24).rotateZ(Math.PI / 2), []);
  const band = useMemo(() => new THREE.CylinderGeometry(0.92, 0.92, 0.3, 24, 1, true).rotateZ(Math.PI / 2), []);
  return (
    <group>
      <mesh geometry={pipe} castShadow>
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.9} metalness={0.6} roughness={0.35} />
      </mesh>
      <group position={s.p} quaternion={s.q}>
        {[-0.95, 0.95].map((z) => (
          <group key={z} position={[0, 0.95, z]}>
            <Inked geometry={tank} material={m.cream} ink={1.04} />
            {[-0.8, 0.8].map((x) => (
              <mesh key={x} geometry={band} material={m.red} position={[x, 0, 0]} />
            ))}
          </group>
        ))}
        {[-1.2, 1.2].map((x) => (
          <mesh key={x} material={m.steel} position={[x, 0.25, 0]}>
            <boxGeometry args={[0.3, 0.5, 3]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ───────── the flight rules billboard ───────── */
function Board({ fonts }: { fonts: boolean }) {
  const s = SPOT.board;
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: canvasTex(1024, 640, (g) => {
          g.fillStyle = C.cream;
          g.fillRect(0, 0, 1024, 640);
          g.fillStyle = C.red;
          g.beginPath();
          g.moveTo(0, 0);
          g.lineTo(1024, 0);
          g.lineTo(1024, 250);
          g.lineTo(0, 400);
          g.closePath();
          g.fill();
          g.fillStyle = C.blue;
          g.beginPath();
          g.arc(860, 470, 120, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = C.cream;
          g.font = '900 120px "Unbounded", sans-serif';
          g.textAlign = "left";
          g.fillText("FLIGHT", 60, 160);
          g.fillText("RULES", 60, 290);
          g.fillStyle = INK;
          g.font = '800 50px "Golos Text", sans-serif';
          g.fillText("Hold to keep your seat.", 60, 480);
          g.fillText("Sell once: ejected.", 60, 560);
        }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fonts],
  );
  const leg = useMemo(() => paint("#b4302a", { metalness: 0.3, roughness: 0.5 }), []);
  const back = useMemo(() => steel("#8e939c", 0.5), []);
  return (
    <group position={s.p} quaternion={s.q}>
      <group>
        {[-2.2, 2.2].map((x) => (
          <mesh key={x} material={leg} position={[x, 1.7, -0.1]}>
            <boxGeometry args={[0.24, 3.4, 0.24]} />
          </mesh>
        ))}
        {/* a steel backing with braces, as a real billboard is built */}
        <mesh material={back} position={[0, 2.9, -0.06]} castShadow>
          <boxGeometry args={[5.4, 3.4, 0.14]} />
        </mesh>
        {[1.9, 3.9].map((y) => (
          <mesh key={y} material={back} position={[0, y, -0.2]}>
            <boxGeometry args={[5.2, 0.12, 0.14]} />
          </mesh>
        ))}
        <mesh material={mat} position={[0, 2.9, 0.03]}>
          <planeGeometry args={[5.2, 3.25]} />
        </mesh>
      </group>
    </group>
  );
}

/* ───────── the landed capsule: your seat; the hatch opens on arrival ───────── */
function Capsule({ open }: { open: React.MutableRefObject<number> }) {
  const s = SPOT.capsule;
  const hatch = useRef<THREE.Group>(null);
  const m = useMemo(
    () => ({
      cream: steel("#cfd2d8", 0.32),
      red: paint("#c8332a"),
      dark: new THREE.MeshStandardMaterial({ color: "#3a2c24", roughness: 1 }),
      glow: new THREE.MeshBasicMaterial({ color: "#ffd36b" }),
    }),
    [],
  );
  const g = useMemo(
    () => ({ shell: new THREE.CylinderGeometry(0.55, 1.45, 1.9, 32), shield: new THREE.CylinderGeometry(1.5, 1.4, 0.3, 32), top: new THREE.CylinderGeometry(0.35, 0.55, 0.45, 24) }),
    [],
  );
  useFrame(() => hatch.current && (hatch.current.rotation.y = -open.current * 1.9));
  return (
    <group position={s.p} quaternion={s.q}>
      <group>
        <Inked geometry={g.shield} material={m.dark} position={[0, 0.15, 0]} ink={1.03} />
        <Inked geometry={g.shell} material={m.cream} position={[0, 1.25, 0]} ink={1.03} />
        <Inked geometry={g.top} material={m.red} position={[0, 2.42, 0]} ink={1.05} />
        <mesh material={m.glow} position={[0, 1.2, 1.02]} rotation={[0.47, 0, 0]}>
          <planeGeometry args={[0.7, 0.9]} />
        </mesh>
        <group ref={hatch} position={[-0.36, 1.2, 1.04]}>
          <mesh material={m.red} position={[0.36, 0, 0.02]} rotation={[0.47, 0, 0]}>
            <boxGeometry args={[0.76, 0.96, 0.06]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ───────── the radar dish: the mission log listens ───────── */
function Radar() {
  const s = SPOT.radar;
  const dish = useRef<THREE.Group>(null);
  const lamp = useRef<THREE.MeshBasicMaterial>(null);
  const m = useMemo(() => ({ cream: paint("#efeee9", { side: THREE.DoubleSide, roughness: 0.5 }), red: paint("#c8332a"), steel: steel() }), []);
  const g = useMemo(
    () => ({ bowl: new THREE.SphereGeometry(1.6, 32, 12, 0, Math.PI * 2, 0, 0.9), mast: new THREE.CylinderGeometry(0.16, 0.3, 2.2, 12), feed: new THREE.CylinderGeometry(0.05, 0.05, 1.3, 6) }),
    [],
  );
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    if (dish.current) dish.current.rotation.y = t * 0.4;
    lamp.current?.color.set(Math.sin(t * 4) > 0 ? C.burn : "#5a2a10");
  });
  return (
    <group position={s.p} quaternion={s.q}>
      <Inked geometry={g.mast} material={m.steel} position={[0, 1.1, 0]} ink={1.08} />
      <group ref={dish} position={[0, 2.3, 0]}>
        <group rotation={[-0.9, 0, 0]}>
          <Inked geometry={g.bowl} material={m.cream} rotation={[Math.PI, 0, 0]} ink={1.03} />
          <mesh geometry={g.feed} material={m.red} position={[0, 0.65, 0]} />
          <mesh position={[0, 1.32, 0]}>
            <sphereGeometry args={[0.12, 10, 8]} />
            <meshBasicMaterial ref={lamp} color={C.burn} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ───────── astronauts drifting around the pad in their suits ───────── */
type Drift = { at: THREE.Vector3; scale: number; phase: number; wave: number };
/**
 * Placed by where they should land in the opening's frame (sx, sy in -1..1, depth d), so they
 * float beside and above the rocket and never behind the headline.
 */
function inView(pos: V3, look: V3, fov: number, aspect: number, spots: [number, number, number, number][]): Drift[] {
  const p = new THREE.Vector3(...pos);
  const f = new THREE.Vector3(...look).sub(p).normalize();
  const right = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(right, f);
  const tv = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  return spots.map(([sx, sy, d, scale], i) => ({
    at: p.clone().addScaledVector(f, d).addScaledVector(right, sx * tv * aspect * d).addScaledVector(up, sy * tv * d),
    scale,
    phase: i * 1.37,
    wave: i % 2 ? -1 : 1,
  }));
}

function Astronauts({ narrow }: { narrow: boolean }) {
  const list = useMemo(() => {
    const st = stations(narrow)[0];
    return narrow
      ? inView(st.pos, st.look, 60, 0.46, [
          [-0.55, 0.74, 10, 0.62],
          [0.5, 0.58, 9, 0.6],
          [0.02, 0.88, 13, 0.56],
          [0.72, 0.86, 14, 0.5],
          [-0.3, 0.42, 8, 0.5],
        ])
      : inView(st.pos, st.look, 46, 1.6, [
          [0.12, 0.6, 10, 0.72],
          [0.4, 0.42, 9, 0.66],
          [0.8, 0.32, 11, 0.6],
          [0.62, -0.36, 8, 0.56],
          [0.94, -0.12, 13, 0.6],
          [-0.32, 0.82, 12, 0.56],
          [-0.78, 0.8, 14, 0.52],
          [0.26, -0.68, 7, 0.46],
          [0.7, 0.76, 7, 0.5],
        ]);
  }, [narrow]);
  const refs = useRef<(THREE.Group | null)[]>([]);
  const arms = useRef<(THREE.Group | null)[]>([]);
  const fore = useRef<(THREE.Group | null)[]>([]);
  // physically lit, unlike the toon world around them: matte suit fabric, a glossy shell, a gold visor
  const m = useMemo(
    () => ({
      suit: new THREE.MeshStandardMaterial({ color: "#eeebe4", roughness: 0.85, metalness: 0 }),
      fold: new THREE.MeshStandardMaterial({ color: "#d4d0c7", roughness: 0.9 }),
      shell: new THREE.MeshPhysicalMaterial({ color: "#f7f6f2", roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.15 }),
      visor: new THREE.MeshPhysicalMaterial({ color: "#d9a441", metalness: 1, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 }),
      metal: new THREE.MeshStandardMaterial({ color: "#9aa0ab", metalness: 0.85, roughness: 0.35 }),
      box: new THREE.MeshStandardMaterial({ color: "#c9c6bf", roughness: 0.6 }),
      dark: new THREE.MeshStandardMaterial({ color: "#3b3f4a", roughness: 0.7 }),
      red: new THREE.MeshStandardMaterial({ color: C.red, roughness: 0.6 }),
      blue: new THREE.MeshStandardMaterial({ color: C.blue, roughness: 0.6 }),
      lamp: new THREE.MeshBasicMaterial({ color: "#fff6d8" }),
    }),
    [],
  );
  const g = useMemo(
    () => ({
      shell: new THREE.SphereGeometry(0.34, 32, 24),
      visor: new THREE.SphereGeometry(0.352, 32, 20, -Math.PI * 0.4, Math.PI * 0.8, Math.PI * 0.22, Math.PI * 0.44),
      collar: new THREE.TorusGeometry(0.25, 0.055, 12, 32).rotateX(Math.PI / 2),
      light: new RoundedBoxGeometry(0.09, 0.07, 0.12, 2, 0.02),
      torso: new RoundedBoxGeometry(0.62, 0.66, 0.4, 4, 0.15),
      waist: new THREE.CylinderGeometry(0.26, 0.24, 0.12, 24),
      hips: new RoundedBoxGeometry(0.54, 0.3, 0.36, 4, 0.12),
      plss: new RoundedBoxGeometry(0.64, 0.8, 0.3, 4, 0.07),
      dcm: new RoundedBoxGeometry(0.34, 0.16, 0.12, 2, 0.03),
      knob: new THREE.CylinderGeometry(0.025, 0.025, 0.03, 10).rotateX(Math.PI / 2),
      upper: new THREE.CapsuleGeometry(0.095, 0.22, 6, 14),
      lower: new THREE.CapsuleGeometry(0.085, 0.2, 6, 14),
      ring: new THREE.TorusGeometry(0.1, 0.025, 8, 20).rotateX(Math.PI / 2),
      glove: new THREE.CapsuleGeometry(0.075, 0.08, 6, 12),
      thigh: new THREE.CapsuleGeometry(0.12, 0.26, 6, 14),
      shin: new THREE.CapsuleGeometry(0.105, 0.24, 6, 14),
      boot: new RoundedBoxGeometry(0.2, 0.14, 0.3, 3, 0.05),
      patch: new THREE.CircleGeometry(0.055, 18),
      stripe: new THREE.CylinderGeometry(0.124, 0.124, 0.05, 18, 1, true),
    }),
    [],
  );
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    list.forEach((d, i) => {
      const a = refs.current[i];
      if (a) {
        const k = t * 0.3 + d.phase;
        // weightless: a slow loop, a lazy turn, mostly facing the camera
        a.position.set(d.at.x + Math.sin(k) * 0.45, d.at.y + Math.sin(k * 1.3 + 1) * 0.35, d.at.z + Math.cos(k * 0.8) * 0.3);
        a.rotation.set(Math.sin(t * 0.35 + d.phase) * 0.3, Math.sin(t * 0.22 + d.phase) * 0.55, Math.sin(t * 0.3 + d.phase) * 0.35 + d.wave * 0.2);
      }
      const w = arms.current[i];
      if (w) w.rotation.z = d.wave * (2.3 + Math.sin(t * 1.8 + d.phase) * 0.25); // a slow wave
      const f = fore.current[i];
      if (f) f.rotation.z = d.wave * (0.5 + Math.sin(t * 1.8 + d.phase + 0.6) * 0.3);
    });
  });
  const limb = (side: number, i: number, waving: boolean) => (
    <group
      ref={waving ? (el) => void (arms.current[i] = el) : undefined}
      position={[side * 0.36, 0.42, 0]}
      rotation={waving ? undefined : [0.25, 0, side * 0.45]}
    >
      <mesh geometry={g.upper} material={m.suit} position={[0, -0.2, 0]} />
      <mesh geometry={g.patch} material={side > 0 ? m.red : m.blue} position={[0, -0.08, 0.1]} />
      <group ref={waving ? (el) => void (fore.current[i] = el) : undefined} position={[0, -0.42, 0]} rotation={waving ? undefined : [0, 0, side * 0.35]}>
        <mesh geometry={g.ring} material={m.fold} />
        <mesh geometry={g.lower} material={m.suit} position={[0, -0.19, 0]} />
        <mesh geometry={g.ring} material={m.metal} position={[0, -0.38, 0]} scale={0.85} />
        <mesh geometry={g.glove} material={m.suit} position={[0, -0.5, 0]} />
      </group>
    </group>
  );
  return (
    <group>
      {list.map((d, i) => (
        <group key={i} ref={(el) => void (refs.current[i] = el)} scale={d.scale * 1.15}>
          {/* helmet: glossy shell, gold visor, lights, collar */}
          <mesh geometry={g.shell} material={m.shell} position={[0, 1.02, 0]} />
          <mesh geometry={g.visor} material={m.visor} position={[0, 1.0, 0.03]} />
          {[-1, 1].map((sd) => (
            <group key={sd} position={[sd * 0.3, 1.1, 0.12]}>
              <mesh geometry={g.light} material={m.box} />
              <mesh material={m.lamp} position={[0, 0, 0.065]}>
                <circleGeometry args={[0.025, 10]} />
              </mesh>
            </group>
          ))}
          <mesh geometry={g.collar} material={m.metal} position={[0, 0.72, 0]} />
          {/* hard upper torso, waist bearing, hips, life-support pack */}
          <mesh geometry={g.torso} material={m.suit} position={[0, 0.38, 0]} />
          <mesh geometry={g.plss} material={m.box} position={[0, 0.42, -0.34]} />
          <mesh geometry={g.dcm} material={m.box} position={[0, 0.3, 0.25]} />
          {[-0.08, 0, 0.08].map((x, j) => (
            <mesh key={x} geometry={g.knob} material={j === 1 ? m.red : m.dark} position={[x, 0.3, 0.32]} />
          ))}
          <mesh geometry={g.waist} material={m.metal} position={[0, 0.0, 0]} />
          <mesh geometry={g.hips} material={m.suit} position={[0, -0.16, 0]} />
          {/* arms: the left one waves */}
          {limb(-1, i, true)}
          {limb(1, i, false)}
          {/* legs, knees loose like floating; the commander's red stripes */}
          {[-1, 1].map((sd) => (
            <group key={sd} position={[sd * 0.15, -0.3, 0]} rotation={[sd * 0.18 - 0.15, 0, sd * 0.12]}>
              <mesh geometry={g.thigh} material={m.suit} position={[0, -0.22, 0]} />
              <mesh geometry={g.stripe} material={m.red} position={[0, -0.2, 0]} />
              <group position={[0, -0.46, 0]} rotation={[0.45, 0, 0]}>
                <mesh geometry={g.ring} material={m.fold} scale={1.15} />
                <mesh geometry={g.shin} material={m.suit} position={[0, -0.22, 0]} />
                <mesh geometry={g.boot} material={m.fold} position={[0, -0.46, 0.04]} />
              </group>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ───────── a satellite crossing the sky ───────── */
function Satellite() {
  const ref = useRef<THREE.Group>(null);
  const m = useMemo(() => ({ body: steel("#c99a3a", 0.35), panel: new THREE.MeshStandardMaterial({ map: solarCells(), metalness: 0.55, roughness: 0.3 }) }), []);
  useFrame((s) => {
    const t = s.clock.elapsedTime * 0.06;
    if (!ref.current) return;
    ref.current.position.set(Math.cos(t) * 22, 12 + Math.sin(t * 2) * 2, Math.sin(t) * 22 - 4);
    ref.current.rotation.y = -t;
  });
  return (
    <group ref={ref}>
      <mesh material={m.body}>
        <boxGeometry args={[0.6, 0.6, 0.9]} />
      </mesh>
      {[-1.1, 1.1].map((x) => (
        <mesh key={x} material={m.panel} position={[x, 0, 0]}>
          <boxGeometry args={[1.4, 0.04, 0.6]} />
        </mesh>
      ))}
    </group>
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
  const lift = useRef(0);
  const hatch = useRef(0);
  const sway = useRef({ x: 0, y: 0 });
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const tops = useRef<number[]>([]);

  useEffect(() => {
    const on = (e: PointerEvent) => {
      sway.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      sway.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    // section tops are measured when the layout changes, never per frame
    const measure = () => {
      tops.current = ANCHORS.map((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : 0;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("pointermove", on);
    return () => {
      ro.disconnect();
      window.removeEventListener("pointermove", on);
    };
  }, []);

  /** Where the page is, as a position along the stations (0 … stations-1). */
  const target = () => {
    const y = window.scrollY + window.innerHeight * 0.35;
    const t0 = tops.current;
    for (let i = t0.length - 1; i >= 0; i--) {
      if (y >= t0[i]) {
        const next = t0[i + 1] ?? t0[i] + window.innerHeight;
        const raw = Math.min(1, (y - t0[i]) / Math.max(1, next - t0[i]));
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
    lift.current = THREE.MathUtils.damp(lift.current, u.current > ANCHORS.length - 1.5 ? 1 : 0, 1.3, dt);
    hatch.current = THREE.MathUtils.damp(hatch.current, Math.abs(u.current - 4) < 0.6 ? 1 : 0, 3, dt);
  });

  return (
    <>
      <Space narrow={narrow} />
      <Planet narrow={narrow} />
      <Rocket lift={lift} fonts={fonts} />
      <Pods names={names} fonts={fonts} />
      <FuelLine />
      <Board fonts={fonts} />
      <Capsule open={hatch} />
      <Radar />
      <Satellite />
      <Astronauts narrow={narrow} />
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

export default function SpaceWalk({ names, still = false }: { names: string[]; still?: boolean }) {
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
      shadows={!narrow}
      camera={{ position: [0, 3.4, 15], fov: narrow ? 60 : 46, near: 0.1, far: 300 }}
      gl={{ antialias: !narrow, alpha: false, powerPreference: "default" }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(C.night);
        // a soft studio reflection for the astronauts' visors and shells; toon materials ignore it
        const pmrem = new THREE.PMREMGenerator(gl);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environmentIntensity = 0.35;
        pmrem.dispose();
        scene.fog = new THREE.Fog("#1a2878", 60, 160);
      }}
    >
      <Pace />
      <hemisphereLight args={["#8fa0ff", "#14182c", 0.22]} />
      {/* the sun: one hard key light, shadows on desktop only, its shadow box held tight around the pad */}
      <directionalLight
        position={[13, 9, 9]}
        intensity={3.4}
        color="#fff3e2"
        castShadow={!narrow}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={1}
        shadow-camera-far={45}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[-12, 5, -14]} intensity={0.55} color="#7d93ff" />
      <Walk narrow={narrow} names={names} still={still} />
    </Canvas>
  );
}
