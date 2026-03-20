"use client";

/**
 * Scene lighting — kept as a stable component to avoid shader recompilation.
 * Never add/remove lights dynamically; toggle visibility or intensity instead.
 */
export default function Lights() {
  return (
    <>
      {/* Soft ambient fill */}
      <ambientLight color="#C8D4DC" intensity={0.6} />

      {/* Key light — slightly warm, from above-right */}
      <directionalLight
        color="#EAE4DC"
        intensity={1.2}
        position={[4, 6, 3]}
      />

      {/* Fill light — cool, from left */}
      <directionalLight
        color="#A8C0D4"
        intensity={0.4}
        position={[-4, 2, -2]}
      />

      {/* Nucleus glow simulation — soft point light from center */}
      <pointLight
        color="#D4E8F0"
        intensity={2.0}
        distance={8}
        decay={2}
        position={[0, 0, 0.5]}
      />
    </>
  );
}
