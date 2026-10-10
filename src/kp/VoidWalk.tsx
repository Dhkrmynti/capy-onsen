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
const SKY_TINT = "#7b7f8f";
const RP = 6; // the lens covers this many horizon radii; beyond it light runs straight
/** The lensed hole's own horizon radius: its shadow shows at about 2.6 times this, as in nature. */
const RS_L = 0.95;

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
    narrow ? { pos: [0, 1.4, 22], look: [0, -6.8, 0] } : aim([0, 1.4, 15.5], o, 0.42), // the black hole, right of the headline
    narrow ? { pos: [0, 30, 14], look: [0, 0, 0] } : aim([0, 24, 12], o, -0.5), // the orbits from above, left of the table
    { pos: [15, 3.5, 13], look: [0, 0, 0] }, // the disk up close
    narrow ? { pos: [0, -7, 26], look: [0, -3, 0] } : aim([4, -7, 24], [0, -4, 0], 0.5), // the well from below, right of the laws
    narrow ? { pos: [PROBE.x - 3, PROBE.y + 2, PROBE.z + 8], look: pr } : aim([PROBE.x - 6, PROBE.y + 1.5, PROBE.z + 9], pr, 0.5), // the probe, right of your orbit
    narrow ? { pos: [-11, 3, 10], look: [0, 0, 0] } : aim([-12, 3, 11], o, 0.48), // matter falling in, right of the log
    { pos: [0, 0.22, 2.7], look: [0, 0, 0] }, // crossing the horizon
  ];
}

/* ───────── shaders ───────── */
const NOISE = /* glsl */ `
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ v += a*n(p); p *= 2.03; a *= 0.5; } return v; }
`;
/**
 * The lens: for every pixel near the hole, trace the light ray back through Schwarzschild space
 * (the photon-orbit equation a = -1.5 h² x / r⁵, in units of the horizon radius). Where it crosses
 * the disk plane it picks up disk light (temperature by radius, sheared turbulence, Doppler
 * beaming); if it falls below the horizon it is black; if it escapes it samples the sky in the
 * bent direction. That gives the real Gargantua picture: the far side of the disk arched over and
 * under the shadow, a thin photon ring, and the stars behind smeared round it.
 */
const LENS_VERT = /* glsl */ `
  varying vec3 vWorld;
  void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
`;
const LENS_FRAG = (steps: number) => /* glsl */ `
  uniform vec3 camPos; uniform mat3 toFrame; uniform mat3 fromFrame; uniform float time; uniform float rs; uniform float rp;
  uniform sampler2D sky; uniform vec3 skyTint;
  varying vec3 vWorld;
  ${NOISE}
  const float IN = 1.6; const float OUT = 5.4;
  vec3 skyCol(vec3 d){
    float theta = acos(clamp(d.y, -1.0, 1.0));
    float u = fract(atan(d.z, -d.x) / 6.2831853);
    return texture2D(sky, vec2(u, 1.0 - theta / 3.14159265)).rgb * skyTint;
  }
  vec4 disk(vec3 xi, vec3 dir){
    float r = length(xi.xz);
    if (r < IN || r > OUT) return vec4(0.0);
    float k = (r - IN) / (OUT - IN);
    float a = atan(xi.z, xi.x);
    float shear = time * 0.8 / pow(r, 1.5);
    float s = fbm(vec2(a * 6.0 + shear * 7.0, r * 3.0)) * 0.65 + fbm(vec2(a * 18.0 + shear * 11.0, r * 9.0)) * 0.5;
    // relativistic beaming: the side moving toward the eye is far brighter
    vec3 tang = normalize(vec3(-xi.z, 0.0, xi.x));
    float beta = 0.62 / sqrt(r);
    float dop = pow(max(0.15, 1.0 + beta * dot(tang, -dir)), 3.5);
    // temperature falls with radius: white-hot at the inner edge, deep red outside
    float T = pow(IN / r, 0.75);
    vec3 col = mix(vec3(0.62, 0.12, 0.04), vec3(1.0, 0.55, 0.2), smoothstep(0.3, 0.7, T));
    col = mix(col, vec3(1.0, 0.94, 0.86), smoothstep(0.75, 1.0, T));
    float edge = smoothstep(0.0, 0.04, k) * (1.0 - smoothstep(0.7, 1.0, k));
    float lum = (0.25 + s) * edge * (0.35 + T * 1.3) * dop;
    return vec4(col * lum * 1.35, clamp(lum * 0.85, 0.0, 1.0));
  }
  void main(){
    vec3 ro = toFrame * camPos / rs;
    vec3 rd = normalize(toFrame * (vWorld - camPos));
    float b = dot(ro, rd);
    float c = dot(ro, ro) - rp * rp;
    if (c > 0.0) {
      float disc = b * b - c;
      if (disc < 0.0) discard;
      float t0 = -b - sqrt(disc);
      if (t0 > 0.0) ro += rd * t0;
    }
    vec3 x = ro; vec3 v = rd;
    vec3 hv = cross(x, v); float h2 = dot(hv, hv);
    vec3 col = vec3(0.0); float acc = 0.0; bool hole = false;
    for (int i = 0; i < ${steps}; i++) {
      float r2 = dot(x, x);
      float dt = clamp(0.045 * r2, 0.012, 0.45);
      v += -1.5 * h2 * x / (r2 * r2 * sqrt(r2)) * dt;
      vec3 xn = x + v * dt;
      if (x.y * xn.y < 0.0) {
        vec3 xi = mix(x, xn, x.y / (x.y - xn.y));
        vec4 d = disk(xi, normalize(v));
        col += (1.0 - acc) * d.rgb;
        acc += (1.0 - acc) * d.a;
      }
      x = xn;
      if (dot(x, x) < 1.0) { hole = true; break; }
      if (dot(x, x) > rp * rp * 1.04 && dot(x, v) > 0.0) break;
    }
    vec3 bg = vec3(0.0);
    if (!hole) {
      // ease the bend to nothing at the proxy's rim so the lens meets the plain sky without a seam
      float imp = length(cross(ro, rd));
      vec3 dF = normalize(mix(normalize(v), rd, smoothstep(rp * 0.72, rp * 0.98, imp)));
      bg = skyCol(fromFrame * dF);
    }
    gl_FragColor = vec4(col + bg * (1.0 - acc), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/* ───────── space: a quiet sky and a few bright stars ───────── */
function Sky({ narrow, sky }: { narrow: boolean; sky: THREE.Texture }) {
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
      <mesh renderOrder={-3}>
        <sphereGeometry args={[140, 24, 16]} />
        <meshBasicMaterial map={sky} color={SKY_TINT} side={THREE.BackSide} depthWrite={false} fog={false} />
      </mesh>
      <points geometry={stars}>
        <pointsMaterial map={dot} size={narrow ? 0.9 : 0.75} transparent opacity={0.9} depthWrite={false} fog={false} />
      </points>
    </group>
  );
}

/* ───────── the black hole: one ray-traced lens, a depth-only shadow, a faint bloom ───────── */
function BlackHole({ sky, narrow }: { sky: THREE.Texture; narrow: boolean }) {
  const bloom = useRef<THREE.Mesh>(null);
  const lens = useMemo(() => {
    const to = new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationX(-TILT));
    const from = new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationX(TILT));
    return new THREE.ShaderMaterial({
      uniforms: {
        camPos: { value: new THREE.Vector3() },
        toFrame: { value: to },
        fromFrame: { value: from },
        time: { value: 0 },
        rs: { value: RS_L },
        rp: { value: RP },
        sky: { value: sky },
        skyTint: { value: new THREE.Color(SKY_TINT) },
      },
      vertexShader: LENS_VERT,
      fragmentShader: LENS_FRAG(narrow ? 44 : 72),
      side: THREE.BackSide,
      depthTest: false,
      depthWrite: false,
    });
  }, [sky, narrow]);
  const glow = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: canvasTex(256, 256, (g) => {
          const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
          r.addColorStop(0, "rgba(255,150,70,0)");
          r.addColorStop(0.3, "rgba(255,150,70,0.10)");
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
    lens.uniforms.time.value = s.clock.elapsedTime;
    lens.uniforms.camPos.value.copy(s.camera.position);
    bloom.current?.quaternion.copy(s.camera.quaternion);
  });
  return (
    <group>
      {/* the lens paints everything within RP horizon radii, before anything else is drawn */}
      <mesh material={lens} renderOrder={-2} frustumCulled={false}>
        <sphereGeometry args={[RS_L * RP, 48, 32]} />
      </mesh>
      {/* a depth-only shadow so bodies and stars behind the hole are hidden */}
      <mesh renderOrder={-1}>
        <sphereGeometry args={[RS_L * 2.3, 32, 24]} />
        <meshBasicMaterial colorWrite={false} />
      </mesh>
      <mesh ref={bloom} material={glow} scale={RS_L * 12}>
        <planeGeometry args={[2, 2]} />
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
      <pointsMaterial map={spark} size={narrow ? 0.18 : 0.13} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
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
  const skyTex = useMemo(() => milkyWay(narrow), [narrow]);
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
      <Sky narrow={narrow} sky={skyTex} />
      <Well narrow={narrow} />
      <BlackHole sky={skyTex} narrow={narrow} />
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
