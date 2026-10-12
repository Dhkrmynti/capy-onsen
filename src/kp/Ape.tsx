/**
 * A bored cartoon ape in the spirit of profile-picture collections: every holder id rolls its own
 * traits (fur, shirt, hat, eyewear, earring). An original design built from primitives; it hands
 * the director the same parts as the rabbit, so either can sit in the waiting room.
 */
import { useEffect, useMemo, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { hash } from "./BunnyBrawl";
import type { Parts } from "./BunnyBrawl";

const FURS = ["#8a5a3a", "#6b4428", "#b98a5a", "#d9b98a", "#55504f", "#2f2a28", "#e0b03a", "#7fb6d9", "#e99ab3", "#8fbf7a", "#c7c9cf", "#a35a3a"];
const SHIRTS = ["#e5262b", "#1f6fe0", "#16a34a", "#f59e0b", "#7c3aed", "#0ea5a4", "#111827", "#ec4899", "#f4f1e8", "#ff7a1a"];
const HATS = ["none", "beanie", "cap", "party", "none", "headband"] as const;
const EYEWEAR = ["none", "shades", "none", "specs", "none"] as const;
const LID_GEO = new THREE.SphereGeometry(0.117, 20, 12, 0, Math.PI * 2, 0, 1.1);
const TORSO_GEO = (() => {
  const pts: [number, number][] = [[0, 0], [0.3, 0.01], [0.48, 0.14], [0.55, 0.42], [0.52, 0.7], [0.42, 0.9], [0.26, 0.98], [0, 1.0]];
  const curve = new THREE.SplineCurve(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.LatheGeometry(curve.getPoints(40).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y)), 40);
  g.computeVertexNormals();
  return g;
})();

export function Ape({ id, register, label }: { id: string; register: (id: string, p: Parts | null) => void; label: ReactNode }) {
  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const earL = useRef<THREE.Group>(null!);
  const earR = useRef<THREE.Group>(null!);
  const earL2 = useRef<THREE.Group>(null!);
  const earR2 = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const glove = useRef<THREE.Group>(null!);
  const lidL = useRef<THREE.Mesh>(null!);
  const lidR = useRef<THREE.Mesh>(null!);
  const pupL = useRef<THREE.Group>(null!);
  const pupR = useRef<THREE.Group>(null!);
  const mouth = useRef<THREE.Group>(null!);
  const crown = useRef<THREE.Group>(null!);
  const footL = useRef<THREE.Group>(null!);
  const footR = useRef<THREE.Group>(null!);
  const hat = useRef<THREE.Group>(null!);
  useEffect(() => {
    register(id, { root: root.current, body: body.current, earL: earL.current, earR: earR.current, earL2: earL2.current, earR2: earR2.current, armR: armR.current, armL: armL.current, glove: glove.current, lidL: lidL.current, lidR: lidR.current, pupL: pupL.current, pupR: pupR.current, mouth: mouth.current, crown: crown.current, footL: footL.current, footR: footR.current });
    return () => register(id, null);
  }, [id, register]);
  // the crown replaces whatever hat the ape rolled
  useFrame(() => {
    hat.current.visible = !crown.current.visible;
  });

  const h = hash(id);
  const hatKind = HATS[(h >>> 9) % HATS.length];
  const eyewear = EYEWEAR[(h >>> 15) % EYEWEAR.length];
  const earring = (h >>> 20) % 3 === 0;
  const M = useMemo(() => {
    const fur = new THREE.Color(FURS[h % FURS.length]);
    const soft = (c: THREE.Color) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.66, sheen: 0.25, sheenRoughness: 0.6, sheenColor: c.clone().lerp(new THREE.Color("#ffffff"), 0.5) });
    return {
      fur: soft(fur),
      dark: soft(fur.clone().multiplyScalar(0.6)),
      skin: new THREE.MeshPhysicalMaterial({ color: fur.clone().lerp(new THREE.Color("#f3d6b3"), 0.72), roughness: 0.55, sheen: 0.2 }),
      shirt: new THREE.MeshPhysicalMaterial({ color: SHIRTS[(h >>> 5) % SHIRTS.length], roughness: 0.75, sheen: 0.4, sheenColor: new THREE.Color("#ffffff") }),
      trim: new THREE.MeshStandardMaterial({ color: SHIRTS[(h >>> 11) % SHIRTS.length], roughness: 0.7 }),
      glove: new THREE.MeshPhysicalMaterial({ color: "#d81e24", roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.18 }),
      eye: new THREE.MeshPhysicalMaterial({ color: "#fffdf7", roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03 }),
      black: new THREE.MeshPhysicalMaterial({ color: "#0c0806", roughness: 0.1, clearcoat: 1 }),
      cavity: new THREE.MeshStandardMaterial({ color: "#3d0a14", roughness: 0.7 }),
      tongue: new THREE.MeshPhysicalMaterial({ color: "#ff5d7a", roughness: 0.35, clearcoat: 0.5 }),
      tooth: new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.12, clearcoat: 1 }),
      white: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.6 }),
      gold: new THREE.MeshStandardMaterial({ color: "#ffc93c", metalness: 1, roughness: 0.18 }),
      lens: new THREE.MeshPhysicalMaterial({ color: "#0b0f14", roughness: 0.05, metalness: 0.6, clearcoat: 1 }),
    };
  }, [h]);

  const ear = (side: 1 | -1, ref: RefObject<THREE.Group>, tip: RefObject<THREE.Group>) => (
    <group ref={ref} position={[0.43 * side, 1.3, 0]}>
      <mesh scale={[0.45, 1, 0.9]} material={M.fur} castShadow>
        <sphereGeometry args={[0.17, 20, 16]} />
      </mesh>
      <mesh position={[0.03 * side, 0, 0.05]} scale={[0.35, 0.72, 0.6]} material={M.skin}>
        <sphereGeometry args={[0.17, 16, 12]} />
      </mesh>
      {/* the rabbit's ear tip hinge; an ape only hangs an earring here */}
      <group ref={tip} position={[0.04 * side, -0.16, 0.02]}>
        {earring && side === 1 ? (
          <mesh rotation={[0, Math.PI / 2, 0]} material={M.gold}>
            <torusGeometry args={[0.055, 0.016, 8, 20]} />
          </mesh>
        ) : null}
      </group>
    </group>
  );
  const eye = (side: 1 | -1, lid: RefObject<THREE.Mesh>, pup: RefObject<THREE.Group>) => (
    <group position={[0.15 * side, 1.37, 0.31]} scale={[1, 1.05, 0.8]}>
      <mesh material={M.eye}>
        <sphereGeometry args={[0.11, 24, 18]} />
      </mesh>
      <group ref={pup} position={[-0.012 * side, -0.035, 0.08]}>
        <mesh scale={[1, 1, 0.4]} material={M.black}>
          <sphereGeometry args={[0.05, 16, 12]} />
        </mesh>
      </group>
      <mesh position={[0.012, 0.02, 0.108]}>
        <sphereGeometry args={[0.014, 8, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* a heavy lid, half shut: the bored look. It drops further to blink. */}
      <mesh ref={lid} geometry={LID_GEO} material={M.skin} rotation={[0.2, 0, -0.12 * side]} />
    </group>
  );
  const arm = (side: 1 | -1, ref: RefObject<THREE.Group>, punch: boolean) => (
    <group ref={ref} position={[0.5 * side, 0.92, 0.04]} rotation={[0, 0, 0.35 * side]}>
      <mesh position={[0, -0.1, 0]} material={M.shirt} castShadow>
        <capsuleGeometry args={[0.115, 0.1, 6, 12]} />
      </mesh>
      <mesh position={[0, -0.28, 0]} material={M.fur} castShadow>
        <capsuleGeometry args={[0.09, 0.3, 6, 12]} />
      </mesh>
      <group ref={punch ? glove : undefined} position={[0, -0.56, 0]}>
        <mesh position={[0, 0.12, 0]} material={M.white}>
          <cylinderGeometry args={[0.105, 0.115, 0.1, 20]} />
        </mesh>
        <mesh scale={[1, 1.12, 1.05]} material={M.glove} castShadow>
          <sphereGeometry args={[0.17, 24, 18]} />
        </mesh>
        <mesh position={[-0.1 * side, 0.02, 0.09]} scale={[0.8, 1.1, 0.8]} material={M.glove}>
          <sphereGeometry args={[0.085, 16, 12]} />
        </mesh>
      </group>
    </group>
  );
  return (
    <group ref={root}>
      <group ref={body}>
        {/* torso in a T-shirt with a contrast hem and collar */}
        <mesh geometry={TORSO_GEO} material={M.shirt} scale={[1, 1, 0.92]} castShadow receiveShadow />
        <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.92, 1]} material={M.trim}>
          <torusGeometry args={[0.51, 0.035, 10, 40]} />
        </mesh>
        <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.trim}>
          <torusGeometry args={[0.28, 0.04, 10, 32]} />
        </mesh>
        <mesh position={[0, 0.1, 0]} scale={[1, 0.35, 0.92]} material={M.dark}>
          <sphereGeometry args={[0.47, 24, 12]} />
        </mesh>
        {/* head: fur skull, pale face, a big muzzle */}
        <mesh position={[0, 1.3, 0]} scale={[1, 0.98, 0.95]} material={M.fur} castShadow>
          <sphereGeometry args={[0.43, 32, 24]} />
        </mesh>
        <mesh position={[0, 1.35, 0.17]} scale={[0.84, 0.6, 0.62]} material={M.skin}>
          <sphereGeometry args={[0.4, 28, 20]} />
        </mesh>
        <mesh position={[0, 1.1, 0.26]} scale={[1.18, 0.86, 0.95]} material={M.skin} castShadow>
          <sphereGeometry args={[0.29, 28, 20]} />
        </mesh>
        {/* brow ridge and nostrils */}
        <mesh position={[0, 1.5, 0.3]} rotation={[0.25, 0, Math.PI / 2]} scale={[1, 1, 0.8]} material={M.dark}>
          <capsuleGeometry args={[0.055, 0.42, 6, 12]} />
        </mesh>
        {[-0.05, 0.05].map((x) => (
          <mesh key={x} position={[x, 1.2, 0.515]} scale={[1, 0.7, 0.5]} material={M.black}>
            <sphereGeometry args={[0.022, 10, 8]} />
          </mesh>
        ))}
        {ear(-1, earL, earL2)}
        {ear(1, earR, earR2)}
        {eye(-1, lidL, pupL)}
        {eye(1, lidR, pupR)}
        {/* a flat line when bored, wide open with teeth when it shouts */}
        <group ref={mouth} position={[0, 1.03, 0.47]}>
          <mesh scale={[1.5, 1, 0.5]} material={M.cavity}>
            <sphereGeometry args={[0.13, 20, 14]} />
          </mesh>
          <mesh position={[0, -0.05, 0.02]} scale={[1.1, 0.5, 0.5]} material={M.tongue}>
            <sphereGeometry args={[0.085, 16, 10]} />
          </mesh>
          <mesh position={[0, 0.085, 0.03]} scale={[1, 0.32, 0.3]} material={M.tooth}>
            <boxGeometry args={[0.24, 0.12, 0.1]} />
          </mesh>
        </group>
        {eyewear === "shades" ? (
          <group position={[0, 1.38, 0.41]}>
            {[-0.15, 0.15].map((x) => (
              <mesh key={x} position={[x, 0, 0]} scale={[1, 0.8, 0.3]} material={M.lens}>
                <sphereGeometry args={[0.135, 20, 14]} />
              </mesh>
            ))}
            <mesh material={M.lens}>
              <boxGeometry args={[0.12, 0.03, 0.03]} />
            </mesh>
            <mesh position={[0, 0.02, -0.2]} material={M.lens}>
              <boxGeometry args={[0.86, 0.03, 0.42]} />
            </mesh>
          </group>
        ) : null}
        {eyewear === "specs" ? (
          <group position={[0, 1.37, 0.415]}>
            {[-0.15, 0.15].map((x) => (
              <mesh key={x} position={[x, 0, 0]} material={M.gold}>
                <torusGeometry args={[0.12, 0.014, 8, 28]} />
              </mesh>
            ))}
            <mesh material={M.gold}>
              <boxGeometry args={[0.07, 0.016, 0.016]} />
            </mesh>
          </group>
        ) : null}
        <group ref={hat}>
          {hatKind === "beanie" ? (
            <group position={[0, 1.52, -0.02]}>
              <mesh scale={[1, 0.72, 0.98]} material={M.trim} castShadow>
                <sphereGeometry args={[0.43, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]} material={M.white}>
                <torusGeometry args={[0.42, 0.055, 10, 36]} />
              </mesh>
              <mesh position={[0, 0.33, 0]} material={M.white}>
                <sphereGeometry args={[0.08, 12, 10]} />
              </mesh>
            </group>
          ) : null}
          {hatKind === "cap" ? (
            <group position={[0, 1.53, 0]}>
              <mesh scale={[1, 0.62, 1]} material={M.trim} castShadow>
                <sphereGeometry args={[0.44, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              </mesh>
              <mesh position={[0, 0.02, 0.5]} scale={[1, 0.12, 0.8]} material={M.trim} castShadow>
                <sphereGeometry args={[0.32, 20, 12]} />
              </mesh>
            </group>
          ) : null}
          {hatKind === "party" ? (
            <group position={[0.1, 1.86, 0]} rotation={[0, 0, -0.2]}>
              <mesh material={M.trim} castShadow>
                <coneGeometry args={[0.2, 0.5, 20]} />
              </mesh>
              <mesh position={[0, 0.27, 0]} material={M.gold}>
                <sphereGeometry args={[0.055, 12, 10]} />
              </mesh>
            </group>
          ) : null}
          {hatKind === "headband" ? (
            <mesh position={[0, 1.55, 0]} rotation={[Math.PI / 2 - 0.12, 0, 0]} material={M.trim}>
              <torusGeometry args={[0.39, 0.05, 10, 36]} />
            </mesh>
          ) : null}
        </group>
        {/* feet, each on its own hinge so a seated ape can stick them out and kick */}
        {[-0.25, 0.25].map((x) => (
          <group key={x} ref={x < 0 ? footL : footR} position={[x, 0.1, 0.12]}>
            <mesh position={[0, -0.02, 0.08]} scale={[1.05, 0.5, 1.7]} material={M.fur} castShadow>
              <sphereGeometry args={[0.17, 20, 14]} />
            </mesh>
            <mesh position={[0, -0.075, 0.1]} scale={[0.85, 0.2, 1.45]} material={M.skin}>
              <sphereGeometry args={[0.17, 16, 10]} />
            </mesh>
          </group>
        ))}
        {arm(1, armR, true)}
        {arm(-1, armL, false)}
        {/* the crown, shown on whoever holds No. 1 */}
        <group ref={crown} position={[0, 1.76, 0]} visible={false}>
          <mesh material={M.gold} castShadow>
            <cylinderGeometry args={[0.27, 0.23, 0.15, 24, 1, true]} />
          </mesh>
          <mesh position={[0, -0.075, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.gold}>
            <torusGeometry args={[0.23, 0.025, 8, 24]} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <group key={i} position={[Math.sin(a) * 0.26, 0.14, Math.cos(a) * 0.26]}>
                <mesh material={M.gold}>
                  <coneGeometry args={[0.065, 0.18, 12]} />
                </mesh>
                <mesh position={[0, 0.11, 0]}>
                  <sphereGeometry args={[0.03, 10, 8]} />
                  <meshPhysicalMaterial color="#e5262b" roughness={0.1} clearcoat={1} />
                </mesh>
              </group>
            );
          })}
        </group>
      </group>
      <Html position={[0, -0.02, 0.75]} center zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        {label}
      </Html>
    </group>
  );
}
