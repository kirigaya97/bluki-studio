"use client";

export default function Lights() {
  return (
    <>
      <ambientLight color="#C0D4E4" intensity={0.5} />
      <directionalLight color="#EDE6DC" intensity={1.2} position={[4, 8, 4]} />
      <directionalLight color="#A8C4DC" intensity={0.4} position={[-5, 2, -3]} />
      {/* Inner nucleus glow */}
      <pointLight color="#88CCFF" intensity={1.5} distance={6} decay={2} position={[0, 0, 0.5]} />
    </>
  );
}
