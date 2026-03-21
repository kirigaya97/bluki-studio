"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scrollState";

// Explicit target palette — dark body, light-blue nucleus
const MAT = {
  petal: {
    color:             new THREE.Color("#1E2E3A"), // dark blue-grey
    emissive:          new THREE.Color("#0A1520"),
    emissiveIntensity: 0.05,
    roughness:         0.75,
    metalness:         0.05,
  },
  nucleus: {
    color:             new THREE.Color("#6AAED0"), // light blue
    emissive:          new THREE.Color("#3A80AA"),
    emissiveIntensity: 0.55,
    roughness:         0.1,
    metalness:         0.05,
  },
};

useGLTF.preload("/models/abstract_core.glb");

export default function Model() {
  const groupRef      = useRef<THREE.Group>(null);
  const normRef       = useRef<THREE.Group>(null);
  const normalizedRef = useRef(false);

  const { scene } = useGLTF("/models/abstract_core.glb");

  // ── Auto-scale & center (once, on a wrapper group) ──────────────────────
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
      const s = 2.4 / size;
      normRef.current.scale.setScalar(s);
      normRef.current.position.set(-center.x * s, -center.y * s, -center.z * s);
    }
  }, [scene]);

  // ── Material remapping ───────────────────────────────────────────────────
  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const orig = child.material as THREE.MeshStandardMaterial;
      if (!orig?.isMeshStandardMaterial) return;

      const mat = orig.clone();

      // Nucleus heuristic: originally emissive or cool-blue saturated
      const isNucleus =
        orig.emissiveIntensity > 0.3 ||
        (orig.color.b > orig.color.r + 0.25 && orig.color.b > 0.4);

      const src = isNucleus ? MAT.nucleus : MAT.petal;
      mat.color             = src.color.clone();
      mat.emissive          = src.emissive.clone();
      mat.emissiveIntensity = src.emissiveIntensity;
      mat.roughness         = src.roughness;
      mat.metalness         = src.metalness;
      mat.needsUpdate       = true;
      child.material        = mat;
    });
  }, [scene]);

  // ── Scroll tracking fallback (native, in case Lenis event doesn't fire) ─
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
      <group ref={normRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
}
