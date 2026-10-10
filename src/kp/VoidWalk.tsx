/**
 * Horizon: one black hole, walked by scrolling. A turbulent accretion disk with its lensed halo
 * bending over and under the event horizon, a photon ring, the gravity well drawn as a grid
 * funnel below, the ten closest holders as rocky bodies in Keplerian orbit with their names,
 * matter spiralling in, and at the end the camera crosses the horizon. Shaders and procedural
 * textures only (no image downloads), at most 30 fps, nothing while the tab is hidden.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { milkyWay, regolith, solarCells } from "./spaceTex";

const ANCHORS = ["top", "ladder", "round", "rules", "card", "record", "closing"] as const;
const RS = 2.2; // the event horizon's radius
const TILT = 0.12; // the disk leans slightly toward the opening's camera
const PROBE = new THREE.Vector3(11, 2.6, 7);

const rand = (() => {
  let s = 5;
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
    Promise.all(['500 40px "Geist Mono"', 'italic 400 40px "STIX Two Text"'].map((f) => document.fonts.load(f)))
      .catch(() => null)
      .then(() => live && setOk(true));
    return () => {
      live = false;
    };
  }, []);
  return ok;
}

/* ───────── camera stations, one per page section ───────── */
type V3 = [number, number, number];
type Station = { pos: V3; look: V3 };
/** Look so that the subject lands at screen x = side (-1..1) from this position. */
function aim(pos: V3, subject: V3, side: number): Station {
  const p = new THREE.Vector3(...pos);
  const s = new THREE.Vector3(...subject);
  const f = s.clone().sub(p);
  const d = f.length();
  f.normalize();
  const right = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize();
  const look = s.clone().addScaledVector(right, -side * 0.68 * d);
  return { pos, look: [look.x, look.y, look.z] };
}
function stations(narrow: boolean): Station[] {
  const o: V3 = [0, 0, 0];
  const pr: V3 = [PROBE.x, PROBE.y, PROBE.z];
  return [
    narrow ? { pos: [0, 1.6, 30], look: [0, -9.5, 0] } : aim([0, 1.8, 22], o, 0.42), // the black hole, right of the headline
    narrow ? { pos: [0, 30, 14], look: [0, 0, 0] } : aim([0, 24, 12], o, -0.5), // the orbits from above, left of the table
    { pos: [15, 3.5, 13], look: [0, 0, 0] }, // the disk up close
    narrow ? { pos: [0, -7, 26], look: [0, -3, 0] } : aim([4, -7, 24], [0, -4, 0], 0.5), // the well from below, right of the laws
    narrow ? { pos: [PROBE.x - 3, PROBE.y + 2, PROBE.z + 8], look: pr } : aim([PROBE.x - 6, PROBE.y + 1.5, PROBE.z + 9], pr, 0.5), // the probe, right of your orbit
    narrow ? { pos: [-11, 3, 10], look: [0, 0, 0] } : aim([-12, 3, 11], o, 0.48), // matter falling in, right of the log
    { pos: [0, 0.35, 3.9], look: [0, 0, 0] }, // crossing the horizon
  ];
}

/* ───────── shaders ───────── */
const NOISE = /* glsl */ `
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ v += a*n(p); p *= 2.03; a *= 0.5; } return v; }
`;
/** Hot inner edge, cooler outer edge, streaks sheared by orbital speed, one side Doppler-bright. */
const DISK_FRAG = /* glsl */ `
  uniform float time; uniform float inner; uniform float outer; uniform float halo;
  varying vec2 vp;
  ${NOISE}
  void main(){
    float r = length(vp);
    float k = clamp((r - inner) / (outer - inner), 0.0, 1.0);
    float a = atan(vp.y, vp.x);
    float shear = time * 0.9 / pow(max(r, 0.5), 1.5);
    float s = fbm(vec2(a * 5.0 + shear * 6.0, r * 2.2)) * 0.7 + fbm(vec2(a * 14.0 + shear * 9.0, r * 6.0)) * 0.45;
    vec3 hot = vec3(1.0, 0.93, 0.8), mid = vec3(1.0, 0.52, 0.16), cool = vec3(0.55, 0.12, 0.05);
    vec3 col = mix(hot, mid, smoothstep(0.0, 0.35, k));
    col = mix(col, cool, smoothstep(0.35, 1.0, k));
    float doppler = 0.55 + 0.75 * (0.5 + 0.5 * cos(a + 0.6));
    float edge = smoothstep(0.0, 0.06, k) * (1.0 - smoothstep(0.7, 1.0, k));
    float lum = (0.35 + s) * edge * doppler * (1.25 - k);
    if (halo > 0.5) lum *= 0.85;
    gl_FragColor = vec4(col * lum * 1.6, clamp(lum, 0.0, 1.0));
  }
`;
const PLANE_VERT = /* glsl */ `
  varying vec2 vp;
  void main(){ vp = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

/* ───────── space: a quiet sky and a few bright stars ───────── */
function Sky({ narrow }: { narrow: boolean }) {
  const sky = useMemo(() => milkyWay(narrow), [narrow]);
  const stars = useMemo(() => {
    const N = narrow ? 260 : 600;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const u = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const d = 95 + rand() * 20;
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
        r.addColorStop(0.25, "rgba(230,232,240,0.85)");
        r.addColorStop(1, "rgba(200,205,220,0)");
        g.fillStyle = r;
        g.fillRect(0, 0, 32, 32);
      }),
    [],
  );
  return (
    <group>
      <mesh>
        <sphereGeometry args={[140, 24, 16]} />
        <meshBasicMaterial map={sky} color="#7b7f8f" side={THREE.BackSide} depthWrite={false} fog={false} />
      </mesh>
      <points geometry={stars}>
        <pointsMaterial map={dot} size={narrow ? 0.9 : 0.75} transparent opacity={0.9} depthWrite={false} fog={false} />
      </points>
    </group>
  );
}

/* ───────── the black hole: horizon, photon ring, disk, lensed halo ───────── */
function BlackHole() {
  const halo = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const disk = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, inner: { value: RS * 1.3 }, outer: { value: RS * 4.4 }, halo: { value: 0 } },
        vertexShader: PLANE_VERT,
        fragmentShader: DISK_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const lens = useMemo(() => {
    const m = disk.clone();
    m.uniforms = { time: disk.uniforms.time, inner: { value: RS * 1.08 }, outer: { value: RS * 2.1 }, halo: { value: 1 } };
    return m;
  }, [disk]);
  const glow = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: canvasTex(256, 256, (g) => {
          const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
          r.addColorStop(0, "rgba(0,0,0,0)");
          r.addColorStop(0.83, "rgba(0,0,0,0)");
          r.addColorStop(0.86, "rgba(255,236,205,1)");
          r.addColorStop(0.9, "rgba(255,170,90,0.45)");
          r.addColorStop(1, "rgba(255,120,40,0)");
          g.fillStyle = r;
          g.fillRect(0, 0, 256, 256);
        }),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  useFrame((s) => {
    disk.uniforms.time.value = s.clock.elapsedTime;
    // the halo and the photon ring always face the eye, as light bent round the horizon does
    halo.current?.quaternion.copy(s.camera.quaternion);
    ring.current?.quaternion.copy(s.camera.quaternion);
  });
  return (
    <group>
      <mesh ref={halo} material={lens}>
        <ringGeometry args={[RS * 1.0, RS * 2.2, 160, 6]} />
      </mesh>
      <mesh ref={ring} material={glow} scale={RS * 1.19}>
        <planeGeometry args={[2, 2]} />
      </mesh>
      <mesh>
        <sphereGeometry args={[RS, 64, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh material={disk} rotation={[-Math.PI / 2 + TILT, 0, 0]}>
        <ringGeometry args={[RS * 1.25, RS * 4.5, 200, 8]} />
      </mesh>
      {/* the disk lights what orbits it */}
      <pointLight color="#ffb377" intensity={70} distance={40} decay={1.4} />
    </group>
  );
}

/* ───────── the gravity well: the rubber-sheet funnel as a grid of lines ───────── */
function Well({ narrow }: { narrow: boolean }) {
  const geo = useMemo(() => {
    const depth = (r: number) => -2.4 - 46 / (r + 1.2) + 46 / 34;
    const pts: number[] = [];
    const rings = narrow ? 12 : 18;
    const spokes = narrow ? 24 : 40;
    const r0 = RS * 1.4;
    const r1 = 32;
    const rr = (i: number) => r0 + Math.pow(i / rings, 1.6) * (r1 - r0);
    for (let i = 0; i <= rings; i++) {
      const r = rr(i);
      for (let j = 0; j < 96; j++) {
        const a0 = (j / 96) * Math.PI * 2;
        const a1 = ((j + 1) / 96) * Math.PI * 2;
        pts.push(Math.cos(a0) * r, depth(r), Math.sin(a0) * r, Math.cos(a1) * r, depth(r), Math.sin(a1) * r);
      }
    }
    for (let j = 0; j < spokes; j++) {
      const a = (j / spokes) * Math.PI * 2;
      for (let i = 0; i < 40; i++) {
        const ra = r0 + Math.pow(i / 40, 1.6) * (r1 - r0);
        const rb = r0 + Math.pow((i + 1) / 40, 1.6) * (r1 - r0);
        pts.push(Math.cos(a) * ra, depth(ra), Math.sin(a) * ra, Math.cos(a) * rb, depth(rb), Math.sin(a) * rb);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [narrow]);
  return (
    <lineSegments geometry={geo} rotation={[TILT, 0, 0]}>
      <lineBasicMaterial color="#d8d8d2" transparent opacity={0.13} depthWrite={false} />
    </lineSegments>
  );
}

/* ───────── the ten closest: rocky bodies in Keplerian orbit, names floating beside them ───────── */
function Bodies({ names, fonts, show }: { names: string[]; fonts: boolean; show: React.MutableRefObject<number> }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const rock = useMemo(() => {
    const t = regolith(512, 256, "#8f8a82", "#4d4943", "#c9c4ba", 60);
    return new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bump, bumpScale: 1.5, roughness: 1 });
  }, []);
  const ball = useMemo(() => new THREE.SphereGeometry(1, 32, 24), []);
  const plates = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) =>
        new THREE.SpriteMaterial({
          transparent: true,
          depthWrite: false,
          map: canvasTex(512, 128, (g) => {
            g.strokeStyle = i === 0 ? "#ff6b1a" : "rgba(243,243,239,0.8)";
            g.lineWidth = 3;
            g.beginPath();
            g.moveTo(0, 120);
            g.lineTo(40, 70);
            g.lineTo(500, 70);
            g.stroke();
            g.fillStyle = i === 0 ? "#ff6b1a" : "#f3f3ef";
            g.font = '500 40px "Geist Mono", monospace';
            const n = names[i] || "open orbit";
            g.fillText(`${String(i + 1).padStart(2, "0")} ${n.length > 15 ? n.slice(0, 14) + "…" : n}`, 50, 56);
          }),
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [names, fonts],
  );
  const orbits = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ r: RS * 2.2 + i * 1.35, phase: i * 2.17, size: 0.42 - i * 0.022 })), []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    orbits.forEach((o, i) => {
      const b = refs.current[i];
      if (!b) return;
      const w = 2.2 / Math.pow(o.r, 1.5); // closer orbits run faster
      const a = o.phase + t * w * 0.5;
      b.position.set(Math.cos(a) * o.r, 0.25 + Math.sin(a * 2 + i) * 0.08, Math.sin(a) * o.r);
      b.rotation.y = t * 0.3 + i;
    });
    // names read clearly over the orbit figure and stay faint everywhere else
    plates.forEach((m) => (m.opacity = show.current));
  });
  return (
    <group rotation={[TILT, 0, 0]}>
      {orbits.map((o, i) => (
        <group key={i} ref={(el) => void (refs.current[i] = el)}>
          <mesh geometry={ball} material={rock} scale={o.size} />
          <sprite material={plates[i]} position={[1.7, 0.75, 0]} scale={[3.4, 0.85, 1]} />
        </group>
      ))}
    </group>
  );
}

/* ───────── matter spiralling in ───────── */
function Infall({ narrow }: { narrow: boolean }) {
  const N = narrow ? 260 : 600;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    return g;
  }, [N]);
  const seeds = useMemo(() => Array.from({ length: N }, () => [rand(), rand(), rand()]), [N]);
  const spark = useMemo(
    () =>
      canvasTex(32, 32, (g) => {
        const r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
        r.addColorStop(0, "rgba(255,220,180,1)");
        r.addColorStop(0.4, "rgba(255,130,50,0.6)");
        r.addColorStop(1, "rgba(255,90,20,0)");
        g.fillStyle = r;
        g.fillRect(0, 0, 32, 32);
      }),
    [],
  );
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const p = geo.getAttribute("position") as THREE.BufferAttribute;
    seeds.forEach(([a, b, c], i) => {
      const life = (t * (0.04 + a * 0.03) + b) % 1; // 0 far out, 1 at the horizon
      const r = RS * 1.05 + (1 - life) * (5 + c * 8);
      const ang = c * 6.28 + life * 9 + t * 0.15;
      p.setXYZ(i, Math.cos(ang) * r, (1 - life) * (a - 0.5) * 0.7, Math.sin(ang) * r);
    });
    p.needsUpdate = true;
  });
  return (
    <points geometry={geo} rotation={[TILT, 0, 0]}>
      <pointsMaterial map={spark} size={narrow ? 0.28 : 0.2} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </points>
  );
}

/* ───────── the probe: a small observer craft, your orbit ───────── */
function Probe() {
  const ref = useRef<THREE.Group>(null);
  const m = useMemo(
    () => ({
      foil: new THREE.MeshStandardMaterial({ color: "#c99a3a", metalness: 1, roughness: 0.35 }),
      panel: new THREE.MeshStandardMaterial({ map: solarCells(), metalness: 0.55, roughness: 0.3 }),
      dish: new THREE.MeshStandardMaterial({ color: "#e9e8e4", roughness: 0.4, metalness: 0.2, side: THREE.DoubleSide }),
      steel: new THREE.MeshStandardMaterial({ color: "#9aa0ab", metalness: 0.85, roughness: 0.38 }),
      lamp: new THREE.MeshBasicMaterial({ color: "#ff6b1a" }),
    }),
    [],
  );
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (!ref.current) return;
    ref.current.position.set(PROBE.x + Math.sin(t * 0.3) * 0.3, PROBE.y + Math.sin(t * 0.4) * 0.2, PROBE.z);
    ref.current.rotation.set(Math.sin(t * 0.2) * 0.1, -0.9 + Math.sin(t * 0.15) * 0.2, 0.15);
  });
  return (
    <group ref={ref} scale={0.8}>
      <mesh material={m.foil}>
        <boxGeometry args={[0.9, 0.9, 1.2]} />
      </mesh>
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} material={m.panel} position={[x, 0, 0]}>
          <boxGeometry args={[1.9, 0.04, 0.8]} />
        </mesh>
      ))}
      <mesh material={m.steel} position={[0, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
      </mesh>
      <mesh material={m.dish} position={[0, 0, 1.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.75, 28, 10, 0, Math.PI * 2, 0, 0.75]} />
      </mesh>
      <mesh material={m.lamp} position={[0, 0.5, -0.5]}>
        <sphereGeometry args={[0.06, 8, 6]} />
      </mesh>
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
  const labels = useRef(0.15);
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
        // hold on each station, then move: the figure gets read before the camera leaves
        const t = raw < 0.45 ? 0 : (raw - 0.45) / 0.55;
        return Math.min(ANCHORS.length - 1, i + t * t * (3 - 2 * t));
      }
    }
    return 0;
  };

  useFrame((_, dt) => {
    const goal = target();
    u.current = THREE.MathUtils.damp(u.current, goal, 2.4, dt);
    const k = u.current / (ANCHORS.length - 1);
    pos.getPoint(k, camera.position);
    look.getPoint(k, tmp);
    if (!still) {
      camera.position.x += sway.current.x * 0.3;
      camera.position.y -= sway.current.y * 0.15;
    }
    camera.lookAt(tmp);
    labels.current = THREE.MathUtils.damp(labels.current, Math.abs(u.current - 1) < 0.6 ? 1 : 0.12, 3, dt);
  });

  return (
    <>
      <Sky narrow={narrow} />
      <Well narrow={narrow} />
      <BlackHole />
      <Bodies names={names} fonts={fonts} show={labels} />
      <Infall narrow={narrow} />
      <Probe />
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

export default function VoidWalk({ names, still = false }: { names: string[]; still?: boolean }) {
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
      camera={{ position: [0, 1.8, 22], fov: narrow ? 60 : 46, near: 0.05, far: 300 }}
      gl={{ antialias: !narrow, alpha: false, powerPreference: "default" }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#020203");
        const pmrem = new THREE.PMREMGenerator(gl);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environmentIntensity = 0.15;
        pmrem.dispose();
      }}
    >
      <Pace />
      <hemisphereLight args={["#8a8fa8", "#0b0b10", 0.12]} />
      <directionalLight position={[-14, 6, 10]} intensity={0.5} color="#c9d0ff" />
      <Walk narrow={narrow} names={names} still={still} />
    </Canvas>
  );
}
