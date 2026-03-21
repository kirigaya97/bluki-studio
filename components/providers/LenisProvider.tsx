"use client";

import { useEffect } from "react";
import { initLenis } from "@/lib/lenis";
import Lenis from "lenis";

// Suppress THREE.Clock deprecation warning — R3F 9.x internal, not our code.
// Remove when @react-three/fiber upgrades to THREE.Timer internally.
if (typeof window !== "undefined") {
  const _warn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("THREE.Clock")) return;
    _warn(...args);
  };
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenis: Lenis | null = null;
    // Init after first paint so the scroll container height is settled
    lenis = initLenis();
    return () => {
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
