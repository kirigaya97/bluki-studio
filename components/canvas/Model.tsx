"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scrollState";

// Brand color palette (linear-space values — Three.js colors are linear)
const BRAND = {
  petalBase: new THREE.Color("#9BAFC0"),
  nucleusGlow: new THREE.Color("#D8EAF2"),
  emissiveNucleus: new THREE.Color("#8AB4CC"),
  emissivePetal: new THREE.Color("#6A8DA0"),
};

// Preload so the model is ready before the component mounts
useGLTF.preload("/models/abstract_core.glb");

export default function Model() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/abstract_core.glb");

  // ── Auto-scale & center ────────────────────────────────────────────────────
  // GLB scale is unknown at export time — normalize to a ~2-unit bounding sphere
  // so the model always fits in the camera frustum regardless of export units.
  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    if (size > 0) {
      const scale = 2.0 / size;
      scene.scale.setScalar(scale);
      scene.position.set(
        -center.x * scale,
        -center.y * scale,
        -center.z * scale
      );
    }
  }, [scene]);

  // ── Brand color remapping ─────────────────────────────────────────────────
  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      const original = child.material as THREE.MeshStandardMaterial;
      if (!original?.isMeshStandardMaterial) return;

      const mat = original.clone();

      // Heuristic: "nucleus" = originally high-emissive or saturated cool-blue
      const isNucleus =
        mat.emissiveIntensity > 0.4 ||
        (mat.color.r < 0.35 && mat.color.b > 0.55);

      if (isNucleus) {
        mat.color = BRAND.nucleusGlow.clone();
        mat.emissive = BRAND.emissiveNucleus.clone();
        mat.emissiveIntensity = 0.3;
        mat.roughness = 0.08;
        mat.metalness = 0.2;
      } else {
        mat.color = BRAND.petalBase.clone();
        mat.emissive = BRAND.emissivePetal.clone();
        mat.emissiveIntensity = 0.06;
        mat.roughness = 0.3;
        mat.metalness = 0.55;
      }

      mat.needsUpdate = true;
      child.material = mat;
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
    groupRef.current.rotation.x = p * 0.5;
    groupRef.current.position.y = -p * 1.5;
    groupRef.current.scale.setScalar(1 - p * 0.25);
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}
