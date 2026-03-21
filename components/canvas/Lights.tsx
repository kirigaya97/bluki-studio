"use client";

export default function Lights() {
  return (
    <>
      <ambientLight color="#D0E0EC" intensity={0.6} />
      <directionalLight color="#EDE6DC" intensity={1.4} position={[4, 8, 4]} />
      <directionalLight color="#A8C4DC" intensity={0.5} position={[-5, 2, -3]} />
      {/* Point light removed — was creating white hot spot on the geometry */}
    </>
  );
}
