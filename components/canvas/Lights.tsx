"use client";

export default function Lights() {
  return (
    <>
      {/* Soft ambient base — enough to see everything without blowing out */}
      <ambientLight color="#C0D4E4" intensity={1.2} />

      {/* Key light — warm, from upper right */}
      <directionalLight color="#EDE6DC" intensity={2.0} position={[4, 8, 4]} />

      {/* Rim/fill — cool, opposite side */}
      <directionalLight color="#A8C4DC" intensity={0.8} position={[-5, 2, -3]} />

      {/* Nucleus inner glow — point light, moderate distance */}
      <pointLight color="#B8DEFF" intensity={3} distance={8} decay={2} position={[0, 0, 0.8]} />
    </>
  );
}
