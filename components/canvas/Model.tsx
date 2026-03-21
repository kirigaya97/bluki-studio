"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scrollState";

// Targeted by material name — confirmed from model structure
const MAT = {
  // Big_* + Small_* petals — dark matte blue-grey
  Base: {
    color:             new THREE.Color("#1A2A36"),
    emissive:          new THREE.Color("#000000"),
    emissiveIntensity: 0,
    roughness:         0.78,
    metalness:         0.08,
  },
  // Sphere_Core_0 — soft glowing light blue
  Core: {
    color:             new THREE.Color("#5AAED4"),
    emissive:          new THREE.Color("#2E7BAA"),
    emissiveIntensity: 0.9,
    roughness:         0.15,
    metalness:         0.0,
  },
};

useGLTF.preload("/models/abstract_core.glb");

export default function Model() {
  const groupRef      = useRef<THREE.Group>(null);
  const normRef       = useRef<THREE.Group>(null);
  const normalizedRef = useRef(false);

  const { scene } = useGLTF("/models/abstract_core.glb");

  // ── Auto-scale & center ──────────────────────────────────────────────────
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

  // ── Material remapping — targeted by material name ───────────────────────
  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const orig = child.material as THREE.MeshStandardMaterial;
      if (!orig?.isMeshStandardMaterial) return;

      const src = MAT[orig.name as keyof typeof MAT];
      if (!src) return; // skip any unmapped material

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

  // ── Scroll tracking ──────────────────────────────────────────────────────
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
