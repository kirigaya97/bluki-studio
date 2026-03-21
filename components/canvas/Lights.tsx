"use client";

/**
 * Scene lighting — never add/remove lights at runtime (causes shader recompile).
 * Tune intensity/color only.
 */
export default function Lights() {
  return (
    <>
      {/* Strong ambient so the whole model is readable */}
      <ambientLight color="#C8D8E8" intensity={2.5} />

      {/* Primary key — warm, high angle */}
      <directionalLight color="#EDE8E0" intensity={4.0} position={[4, 8, 4]} />

      {/* Rim light — cool, from behind-left */}
      <directionalLight color="#A8C4DC" intensity={1.5} position={[-5, 2, -3]} />

      {/* Nucleus point light — simulates inner glow */}
      <pointLight
        color="#C8E8FF"
        intensity={8}
        distance={10}
        decay={2}
        position={[0, 0, 0.8]}
      />
    </>
  );
}
