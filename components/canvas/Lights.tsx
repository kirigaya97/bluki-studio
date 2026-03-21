"use client";

export default function Lights() {
  return (
    <>
      {/* Base ambient — enough to read petal geometry without washing it out */}
      <ambientLight color="#C0D4E4" intensity={0.55} />

      {/* Key light — warm, raking across petals to show depth */}
      <directionalLight color="#EDE6DC" intensity={1.3} position={[4, 8, 4]} />

      {/* Cool fill — opposite side, keeps shadows from going pure black */}
      <directionalLight color="#A8C4DC" intensity={0.4} position={[-5, 2, -3]} />

      {/* Nucleus glow — matches Core emissive color, low distance so petals aren't affected */}
      <pointLight color="#4AAAD0" intensity={1.2} distance={3} decay={2} position={[0, 0, 0]} />
    </>
  );
}
