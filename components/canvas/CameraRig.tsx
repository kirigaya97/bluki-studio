"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scrollState";

/** Lerp across 3 keyframes: a at t=0, b at t=0.5, c at t=1 */
function lerp3(a: number, b: number, c: number, t: number): number {
  if (t <= 0.5) return THREE.MathUtils.lerp(a, b, t * 2);
  return THREE.MathUtils.lerp(b, c, (t - 0.5) * 2);
}

/**
 * Animates the camera X position based on scroll progress.
 * Camera pans opposite to the object so both contribute to the
 * "object moving to the side" effect.
 *
 * Section 1 (p≈0.0): cam.x = 0   (centred)
 * Section 2 (p≈0.5): cam.x = -0.7 (pans left → object appears on right)
 * Section 3 (p≈1.0): cam.x = +0.7 (pans right → object appears on left)
 */
export default function CameraRig() {
  const { camera } = useThree();
  const smoothP = useRef(0);

  useFrame((_state, delta) => {
    smoothP.current = THREE.MathUtils.lerp(
      smoothP.current,
      scrollState.progress,
      Math.min(1, delta * 2.5)
    );

    const targetX = lerp3(0, -0.7, 0.7, smoothP.current);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, delta * 3);
  });

  return null;
}
