/**
 * The townsfolk: one small biped rig (legs, arms, torso, head) dressed as a rabbit, an ape or a
 * croc. Original designs from primitives; fur and hoodie colours come from the holder's id. The
 * world poses the limbs every frame through the registered parts.
 */
import { useEffect, useMemo, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import * as THREE from "three";

export type Kind = "rabbit" | "ape" | "croc";
export type CritterParts = { root: THREE.Group; rig: THREE.Group; legL: THREE.Group; legR: THREE.Group; armL: THREE.Group; armR: THREE.Group; head: THREE.Group; tail: THREE.Group | null };

export const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

const FUR: Record<Kind, string[]> = {
  rabbit: ["#f3e6d2", "#f6b6c6", "#b5d6f2", "#cbb8f0", "#ffdb8c", "#c3cad2"],
  ape: ["#7a5236", "#5e4130", "#a0744c", "#3d3230", "#b98b5e", "#8a8f98"],
  croc: ["#4f9e4a", "#3f8a5a", "#7fb23f", "#2f7d6b", "#93a83a", "#5aa88a"],
};
const HOODIE = ["#e5262b", "#1f6fe0", "#f59e0b", "#7c3aed", "#0ea5a4", "#111827", "#ec4899", "#f4f4f0", "#16a34a"];

export function Critter({ id, kind, gold, register, children }: { id: string; kind: Kind; gold: boolean; register: (id: string, p: CritterParts | null) => void; children?: ReactNode }) {
  const root = useRef<THREE.Group>(null!);
  const rig = useRef<THREE.Group>(null!);
  const legL = useRef<THREE.Group>(null!);
  const legR = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const tail = useRef<THREE.Group>(null);
  useEffect(() => {
    register(id, { root: root.current, rig: rig.current, legL: legL.current, legR: legR.current, armL: armL.current, armR: armR.current, head: head.current, tail: tail.current });
    return () => register(id, null);
  }, [id, register]);

  const h = hash(id);
  const M = useMemo(() => {
    const fur = new THREE.Color(FUR[kind][h % FUR[kind].length]);
    const std = (c: THREE.ColorRepresentation, r = 0.7) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
    return {
      fur: std(fur),
      pale: std(fur.clone().lerp(new THREE.Color("#fff6e6"), 0.6)),
      dark: std(fur.clone().multiplyScalar(0.5)),
      hoodie: std(HOODIE[(h >>> 5) % HOODIE.length], 0.85),
      pants: std(["#22303f", "#3b3b3b", "#5b4632", "#1e3a5f"][(h >>> 9) % 4], 0.9),
      shoe: std("#f4f4f0", 0.5),
      eye: new THREE.MeshStandardMaterial({ color: "#fffdf7", roughness: 0.1 }),
      black: new THREE.MeshStandardMaterial({ color: "#0c0806", roughness: 0.2 }),
      pink: std("#ff8fa8", 0.5),
      tooth: std("#ffffff", 0.3),
      gold: new THREE.MeshStandardMaterial({ color: "#ffc93c", metalness: 1, roughness: 0.2 }),
    };
  }, [h, kind]);

  const leg = (side: 1 | -1, ref: RefObject<THREE.Group>) => (
    <group ref={ref} position={[0.15 * side, 0.56, 0]}>
      <mesh position={[0, -0.24, 0]} material={M.pants} castShadow>
        <capsuleGeometry args={[0.11, 0.26, 4, 10]} />
      </mesh>
      <mesh position={[0, -0.5, 0.06]} scale={[1, 0.6, 1.6]} material={M.shoe} castShadow>
        <sphereGeometry args={[0.12, 12, 10]} />
      </mesh>
    </group>
  );
  const arm = (side: 1 | -1, ref: RefObject<THREE.Group>) => (
    <group ref={ref} position={[0.36 * side, 1.16, 0]} rotation={[0, 0, 0.12 * side]}>
      <mesh position={[0, -0.22, 0]} material={M.hoodie} castShadow>
        <capsuleGeometry args={[0.09, 0.3, 4, 10]} />
      </mesh>
      <mesh position={[0, -0.48, 0]} material={M.fur}>
        <sphereGeometry args={[0.1, 12, 10]} />
      </mesh>
    </group>
  );
  const eyes = (y: number, z: number, gap: number, r = 0.085) =>
    [-1, 1].map((s) => (
      <group key={s} position={[gap * s, y, z]}>
        <mesh material={M.eye}>
          <sphereGeometry args={[r, 14, 12]} />
        </mesh>
        <mesh position={[0, 0, r * 0.75]} material={M.black}>
          <sphereGeometry args={[r * 0.45, 10, 8]} />
        </mesh>
      </group>
    ));

  return (
    <group ref={root}>
      <group ref={rig}>
        {leg(-1, legL)}
        {leg(1, legR)}
        {/* hoodie */}
        <mesh position={[0, 0.92, 0]} scale={[1, 1, 0.8]} material={M.hoodie} castShadow>
          <capsuleGeometry args={[0.3, 0.3, 6, 16]} />
        </mesh>
        <mesh position={[0, 1.27, -0.12]} scale={[1, 0.7, 0.8]} material={M.hoodie}>
          <sphereGeometry args={[0.24, 12, 10]} />
        </mesh>
        {arm(-1, armL)}
        {arm(1, armR)}
        {gold ? (
          <mesh position={[0, 1.2, 0.08]} rotation={[1.15, 0, 0]} material={M.gold}>
            <torusGeometry args={[0.2, 0.03, 8, 24]} />
          </mesh>
        ) : null}
        {kind === "croc" ? (
          <group ref={tail} position={[0, 0.72, -0.24]}>
            <mesh position={[0, -0.05, -0.36]} rotation={[-1.75, 0, 0]} material={M.fur} castShadow>
              <coneGeometry args={[0.2, 0.9, 10]} />
            </mesh>
          </group>
        ) : kind === "rabbit" ? (
          <mesh position={[0, 0.74, -0.3]} material={M.pale}>
            <sphereGeometry args={[0.11, 10, 8]} />
          </mesh>
        ) : null}

        <group ref={head} position={[0, 1.58, 0.02]}>
          {kind === "rabbit" ? (
            <>
              <mesh material={M.fur} castShadow>
                <sphereGeometry args={[0.33, 20, 16]} />
              </mesh>
              {[-1, 1].map((s) => (
                <group key={s} position={[0.14 * s, 0.26, -0.03]} rotation={[-0.08, 0, -0.14 * s]}>
                  <mesh position={[0, 0.3, 0]} scale={[1, 1, 0.55]} material={M.fur} castShadow>
                    <capsuleGeometry args={[0.085, 0.46, 4, 10]} />
                  </mesh>
                  <mesh position={[0, 0.3, 0.04]} scale={[0.55, 0.85, 0.3]} material={M.pink}>
                    <capsuleGeometry args={[0.08, 0.42, 4, 8]} />
                  </mesh>
                </group>
              ))}
              {eyes(0.06, 0.26, 0.13, 0.095)}
              <mesh position={[0, -0.05, 0.32]} material={M.pink}>
                <sphereGeometry args={[0.04, 10, 8]} />
              </mesh>
              {[-0.035, 0.035].map((x) => (
                <mesh key={x} position={[x, -0.15, 0.3]} material={M.tooth}>
                  <boxGeometry args={[0.055, 0.09, 0.03]} />
                </mesh>
              ))}
            </>
          ) : kind === "ape" ? (
            <>
              <mesh material={M.fur} castShadow>
                <sphereGeometry args={[0.33, 20, 16]} />
              </mesh>
              {[-1, 1].map((s) => (
                <group key={s} position={[0.33 * s, 0.02, 0]}>
                  <mesh scale={[0.5, 1, 1]} material={M.fur}>
                    <sphereGeometry args={[0.12, 12, 10]} />
                  </mesh>
                  <mesh position={[0.02 * s, 0, 0.02]} scale={[0.4, 0.7, 0.7]} material={M.pale}>
                    <sphereGeometry args={[0.1, 10, 8]} />
                  </mesh>
                </group>
              ))}
              {/* face plate and muzzle */}
              <mesh position={[0, 0.05, 0.2]} scale={[1, 0.8, 0.6]} material={M.pale}>
                <sphereGeometry args={[0.24, 16, 12]} />
              </mesh>
              <mesh position={[0, -0.12, 0.25]} scale={[1.1, 0.75, 0.8]} material={M.pale}>
                <sphereGeometry args={[0.19, 16, 12]} />
              </mesh>
              <mesh position={[0, 0.17, 0.27]} scale={[1, 0.3, 0.5]} material={M.dark}>
                <sphereGeometry args={[0.22, 12, 8]} />
              </mesh>
              {eyes(0.07, 0.3, 0.1, 0.06)}
              {[-0.03, 0.03].map((x) => (
                <mesh key={x} position={[x, -0.08, 0.41]} material={M.black}>
                  <sphereGeometry args={[0.015, 6, 6]} />
                </mesh>
              ))}
              <mesh position={[0, -0.18, 0.39]} scale={[1, 0.2, 0.3]} material={M.black}>
                <sphereGeometry args={[0.09, 10, 6]} />
              </mesh>
            </>
          ) : (
            <>
              <mesh scale={[1, 0.85, 1]} material={M.fur} castShadow>
                <sphereGeometry args={[0.3, 20, 16]} />
              </mesh>
              {/* long snout, lower jaw, teeth */}
              <mesh position={[0, -0.02, 0.38]} scale={[0.8, 0.42, 1.5]} material={M.fur} castShadow>
                <sphereGeometry args={[0.25, 16, 12]} />
              </mesh>
              <mesh position={[0, -0.13, 0.36]} scale={[0.72, 0.3, 1.4]} material={M.pale}>
                <sphereGeometry args={[0.24, 14, 10]} />
              </mesh>
              {[-1, 1].flatMap((s) =>
                [0.28, 0.42, 0.56, 0.68].map((z) => (
                  <mesh key={`${s}${z}`} position={[0.15 * s * (1 - (z - 0.28) * 0.5), -0.1, z]} rotation={[Math.PI, 0, 0]} material={M.tooth}>
                    <coneGeometry args={[0.022, 0.07, 6]} />
                  </mesh>
                )),
              )}
              {[-1, 1].map((s) => (
                <mesh key={s} position={[0.07 * s, 0.06, 0.72]} material={M.black}>
                  <sphereGeometry args={[0.02, 6, 6]} />
                </mesh>
              ))}
              {/* eyes ride on top of the head */}
              {[-1, 1].map((s) => (
                <mesh key={s} position={[0.14 * s, 0.23, 0.12]} material={M.fur}>
                  <sphereGeometry args={[0.11, 12, 10]} />
                </mesh>
              ))}
              {eyes(0.25, 0.17, 0.14, 0.075)}
              {[0.05, -0.12, -0.26].map((z, i) => (
                <mesh key={z} position={[0, 0.27 - i * 0.05, z]} rotation={[-0.3, 0, 0]} material={M.dark}>
                  <coneGeometry args={[0.05, 0.12, 4]} />
                </mesh>
              ))}
            </>
          )}
          {gold ? (
            <group position={[0, kind === "croc" ? 0.36 : 0.36, kind === "rabbit" ? 0.06 : 0]}>
              <mesh material={M.gold}>
                <cylinderGeometry args={[0.17, 0.15, 0.1, 16, 1, true]} />
              </mesh>
              {[0, 1, 2, 3, 4].map((i) => (
                <mesh key={i} position={[Math.sin((i / 5) * Math.PI * 2) * 0.16, 0.1, Math.cos((i / 5) * Math.PI * 2) * 0.16]} material={M.gold}>
                  <coneGeometry args={[0.045, 0.12, 8]} />
                </mesh>
              ))}
            </group>
          ) : null}
        </group>
      </group>
      {children}
    </group>
  );
}
