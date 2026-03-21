"use client";

import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Suspense, Component, ReactNode } from "react";
import * as THREE from "three";
import Lights from "./Lights";
import Model from "./Model";
import CameraRig from "./CameraRig";

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
    if (this.state.error) return null;
    return this.props.children;
  }
}

export default function Scene() {
  return (
    <CanvasErrorBoundary>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          // Tone mapping prevents light blow-out on Intel/ANGLE
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.9;
        }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          {/* No <Environment> — studio HDRI + metallic materials = white blowout */}
          <CameraRig />
          <Lights />
          <Model />
          <Preload all />
        </Suspense>
      </Canvas>
    </CanvasErrorBoundary>
  );
}
