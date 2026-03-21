"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scrollState";

const BRAND = {
  petalBase:       new THREE.Color("#B8CCDA"),   // lighter steel-blue
  nucleusGlow:     new THREE.Color("#E8F4FF"),   // near-white with blue tint
  emissiveNucleus: new THREE.Color("#A0CCEE"),   // visible cool glow
  emissivePetal:   new THREE.Color("#7A9DB8"),   // subtle petal emission
};

useGLTF.preload("/models/abstract_core.glb");

export default function Model() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/abstract_core.glb");

  // ── Auto-scale & center ───────────────────────────────────────────────────
  useLayoutEffect(() => {
    // Must call before Box3 — matrices may not have updated before first render
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    if (box.isEmpty()) return;

    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    const scale = 2.4 / size;
    scene.scale.setScalar(scale);
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    scene.updateMatrixWorld(true);
  }, [scene]);

  // ── Material remapping ────────────────────────────────────────────────────
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
        mat.color            = BRAND.nucleusGlow.clone();
        mat.emissive         = BRAND.emissiveNucleus.clone();
        mat.emissiveIntensity = 1.2;    // strong enough to see on dark bg
        mat.roughness        = 0.05;
        mat.metalness        = 0.15;
      } else {
        mat.color            = BRAND.petalBase.clone();
        mat.emissive         = BRAND.emissivePetal.clone();
        mat.emissiveIntensity = 0.35;   // visible but not blown out
        mat.roughness        = 0.25;
        mat.metalness        = 0.6;
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
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}
