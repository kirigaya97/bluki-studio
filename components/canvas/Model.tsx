"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scrollState";

const BRAND = {
  petalBase:        new THREE.Color("#B0C8DC"),
  nucleusGlow:      new THREE.Color("#DDF0FF"),
  emissiveNucleus:  new THREE.Color("#88BBDD"),
  emissivePetal:    new THREE.Color("#6090A8"),
};

useGLTF.preload("/models/abstract_core.glb");

export default function Model() {
  const groupRef    = useRef<THREE.Group>(null);
  const normRef     = useRef<THREE.Group>(null);
  // Prevent re-running in React 18 strict-mode double-mount
  const normalizedRef = useRef(false);

  const { scene } = useGLTF("/models/abstract_core.glb");

  // ── Auto-scale & center (runs once, applied to wrapper group) ────────────
  useLayoutEffect(() => {
    if (normalizedRef.current) return;
    normalizedRef.current = true;

    // Reset scene to identity so the Box3 always measures true geometry size,
    // not a previously-applied scale from a cached/remounted scene.
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    if (box.isEmpty()) return;

    const size   = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    if (normRef.current && size > 0) {
      const scale = 2.4 / size;
      normRef.current.scale.setScalar(scale);
      normRef.current.position.set(
        -center.x * scale,
        -center.y * scale,
        -center.z * scale
      );
    }
  }, [scene]);

  // ── Material remapping ───────────────────────────────────────────────────
  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const original = child.material as THREE.MeshStandardMaterial;
      if (!original?.isMeshStandardMaterial) return;

      const mat = original.clone();

      const isNucleus =
        mat.emissiveIntensity > 0.4 ||
        (mat.color.r < 0.35 && mat.color.b > 0.55);

      if (isNucleus) {
        mat.color             = BRAND.nucleusGlow.clone();
        mat.emissive          = BRAND.emissiveNucleus.clone();
        mat.emissiveIntensity = 0.6;
        mat.roughness         = 0.08;
        mat.metalness         = 0.1;   // low metalness = no HDRI blowout
      } else {
        mat.color             = BRAND.petalBase.clone();
        mat.emissive          = BRAND.emissivePetal.clone();
        mat.emissiveIntensity = 0.12;
        mat.roughness         = 0.3;
        mat.metalness         = 0.25;  // low metalness = predictable lighting
      }

      mat.needsUpdate = true;
      child.material  = mat;
    });
  }, [scene]);

  const lerpedProgress = useRef(0);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    lerpedProgress.current = THREE.MathUtils.lerp(
      lerpedProgress.current,
      scrollState.progress,
      Math.min(1, delta * 4)
    );

    const p = lerpedProgress.current;
    groupRef.current.rotation.y += delta * 0.18;
    groupRef.current.rotation.x  = p * 0.5;
    groupRef.current.position.y  = -p * 1.5;
    groupRef.current.scale.setScalar(1 - p * 0.25);
  });

  return (
    // groupRef   → animated by scroll/rotation
    // normRef    → static normalization (scale + center), set once in useLayoutEffect
    <group ref={groupRef}>
      <group ref={normRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
}
