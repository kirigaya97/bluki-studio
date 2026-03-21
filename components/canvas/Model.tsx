"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scrollState";

const DEG15 = Math.PI / 12;   // 0.26 rad
const DEG45 = Math.PI / 4;    // 0.785 rad
const DEG90 = Math.PI / 2;    // 1.571 rad

/** Lerp across 3 keyframes: a at t=0, b at t=0.5, c at t=1 */
function lerp3(a: number, b: number, c: number, t: number): number {
  if (t <= 0.5) return THREE.MathUtils.lerp(a, b, t * 2);
  return THREE.MathUtils.lerp(b, c, (t - 0.5) * 2);
}

const MAT = {
  // 25 petal meshes (Big_* + Small_*) — dark matte blue-grey
  Base: {
    color:             new THREE.Color("#1A2A36"),
    emissive:          new THREE.Color("#000000"),
    emissiveIntensity: 0,
    roughness:         0.78,
    metalness:         0.06,
  },
  // Sphere_Core_0 — glowing light blue, roughness raised to kill specular spot
  Core: {
    color:             new THREE.Color("#5AAED4"),
    emissive:          new THREE.Color("#2E7BAA"),
    emissiveIntensity: 0.85,
    roughness:         0.55,   // was 0.15 — raised to eliminate hot-spot
    metalness:         0.0,
  },
};

useGLTF.preload("/models/abstract_core.glb");

export default function Model() {
  const groupRef      = useRef<THREE.Group>(null);
  const normRef       = useRef<THREE.Group>(null);
  const normalizedRef = useRef(false);

  const { scene } = useGLTF("/models/abstract_core.glb");

  // ── Auto-scale & center (once) ───────────────────────────────────────────
  useLayoutEffect(() => {
    if (normalizedRef.current) return;
    normalizedRef.current = true;

    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    if (box.isEmpty()) return;

    const size   = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    if (normRef.current && size > 0) {
      const s = 3.0 / size;   // larger than before (was 2.4)
      normRef.current.scale.setScalar(s);
      normRef.current.position.set(-center.x * s, -center.y * s, -center.z * s);
    }
  }, [scene]);

  // ── Material remapping — by material name ────────────────────────────────
  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const orig = child.material as THREE.MeshStandardMaterial;
      if (!orig?.isMeshStandardMaterial) return;

      const src = MAT[orig.name as keyof typeof MAT];
      if (!src) return;

      const mat = orig.clone();
      mat.color             = src.color.clone();
      mat.emissive          = src.emissive.clone();
      mat.emissiveIntensity = src.emissiveIntensity;
      mat.roughness         = src.roughness;
      mat.metalness         = src.metalness;
      mat.needsUpdate       = true;
      child.material        = mat;
    });
  }, [scene]);

  // ── Scroll tracking (native fallback) ───────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        scrollState.scrollY  = window.scrollY;
        scrollState.progress = window.scrollY / total;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const smoothP = useRef(0);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    // Smooth scroll progress with slightly different lag than camera
    smoothP.current = THREE.MathUtils.lerp(
      smoothP.current,
      scrollState.progress,
      Math.min(1, delta * 3)
    );

    const p       = smoothP.current;
    const elapsed = _state.clock.getElapsedTime();

    // ── Scroll-driven Y rotation ───────────────────────────────────────────
    // 3 full rotations across the full scroll — stops when scrolling stops
    groupRef.current.rotation.y = p * Math.PI * 6;

    // ── Vertical oscillation (time-based, independent of scroll) ──────────
    groupRef.current.position.y = Math.sin(elapsed * 0.7) * 0.15;

    // ── Section-based positions / tilt ────────────────────────────────────
    groupRef.current.position.x = lerp3(0, 0.8, -0.8, p);
    groupRef.current.rotation.z = lerp3(DEG15, DEG45, DEG90, p);
    groupRef.current.scale.setScalar(lerp3(1.0, 0.88, 0.78, p));
  });

  return (
    <group ref={groupRef}>
      <group ref={normRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
}
