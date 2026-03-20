"use client";

import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Suspense } from "react";
import Lights from "./Lights";
import Model from "./Model";

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 50 }}
      gl={{
        antialias: false,           // Disabled — using SMAA via postprocessing
        alpha: true,
        powerPreference: "high-performance",
        outputColorSpace: "srgb",
      }}
      dpr={[1, 2]}                  // Cap pixel ratio at 2x
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Lights />
        <Model />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
