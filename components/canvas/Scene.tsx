"use client";

import { Canvas } from "@react-three/fiber";
import { Preload, Environment } from "@react-three/drei";
import { Suspense, Component, ReactNode } from "react";
import * as THREE from "three";
import Lights from "./Lights";
import Model from "./Model";

// ── Error boundary — catches render errors inside Canvas ──────────────────────
class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error("[Canvas]", error);
  }
  render() {
    if (this.state.error) return null; // canvas fails silently; DOM content still shows
    return this.props.children;
  }
}

export default function Scene() {
  return (
    <CanvasErrorBoundary>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        gl={{
          antialias: false, // disabled — SMAA post-processing ready for later
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          {/*
            Environment provides HDRI-based ambient lighting — ensures the model
            is always visible regardless of custom light positions/intensities.
          */}
          <Environment preset="studio" />
          <Lights />
          <Model />
          <Preload all />
        </Suspense>
      </Canvas>
    </CanvasErrorBoundary>
  );
}
