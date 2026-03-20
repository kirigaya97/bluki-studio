"use client";

import dynamic from "next/dynamic";

// Three.js must not run on the server
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function SceneClient() {
  return <Scene />;
}
