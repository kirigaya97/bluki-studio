"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scrollState";

// Brand color palette
const BRAND = {
  petalBase: new THREE.Color("#9BAFC0"),     // muted steel-blue
  petalSheen: new THREE.Color("#C4D4E0"),    // soft highlight
  nucleusGlow: new THREE.Color("#D8EAF2"),   // pale ice-blue
  emissiveNucleus: new THREE.Color("#8AB4CC"), // soft cool glow
  emissivePetal: new THREE.Color("#6A8DA0"), // very subtle petal emission
};

// Draco-compressed model — preload for instant first render
useGLTF.preload("/models/abstract_core.glb");

export default function Model() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/abstract_core.glb");

  // Remap materials to brand palette on mount
  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      const original = child.material as THREE.MeshStandardMaterial;
      if (!original?.isMeshStandardMaterial) return;

      const mat = original.clone();

      // Detect "nucleus" meshes by high emissive or very bright/saturated color
      const isNucleus =
        mat.emissiveIntensity > 0.5 ||
        (mat.color.r < 0.4 && mat.color.b > 0.6); // electric blue hue

      if (isNucleus) {
        mat.color = BRAND.nucleusGlow.clone();
        mat.emissive = BRAND.emissiveNucleus.clone();
        mat.emissiveIntensity = 0.25;      // was likely 1+; now a soft glow
        mat.roughness = 0.1;
        mat.metalness = 0.3;
      } else {
        // Outer petal / shell geometry
        mat.color = BRAND.petalBase.clone();
        mat.emissive = BRAND.emissivePetal.clone();
        mat.emissiveIntensity = 0.05;
        mat.roughness = 0.35;
        mat.metalness = 0.5;
      }

      child.material = mat;
    });
  }, [scene]);

  // Lerp targets for smooth interpolation
  const lerpedProgress = useRef(0);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    // Smooth out scroll progress
    lerpedProgress.current = THREE.MathUtils.lerp(
      lerpedProgress.current,
      scrollState.progress,
      Math.min(1, delta * 4)
    );

    const p = lerpedProgress.current;

    // Constant slow rotation around Y axis
    groupRef.current.rotation.y += delta * 0.18;

    // Scroll-driven: gentle X tilt + Y drift + scale
    groupRef.current.rotation.x = p * 0.5;          // tilt forward as you scroll
    groupRef.current.position.y = -p * 1.5;         // drift down slightly
    groupRef.current.scale.setScalar(1 - p * 0.25); // subtle scale-down 1→0.75
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}
