"use client";

/**
 * Soft multi-directional lighting — no single dominant source = no hard spots.
 * HemisphereLight provides smooth sky/ground gradient as the ambient base.
 */
export default function Lights() {
  return (
    <>
      {/* Sky-to-ground gradient — eliminates harsh terminator lines */}
      <hemisphereLight args={["#B8D0E8", "#0E1820", 1.1]} />

      {/* Soft key — warm, high angle, low enough intensity to avoid specular */}
      <directionalLight color="#EDE8E0" intensity={0.65} position={[3, 6, 4]} />

      {/* Cool fill — opposite side */}
      <directionalLight color="#A8C4DC" intensity={0.35} position={[-4, 1, -2]} />

      {/* Subtle bottom fill — prevents pure black on underside */}
      <directionalLight color="#C8D8E8" intensity={0.2} position={[0, -4, 2]} />
    </>
  );
}
