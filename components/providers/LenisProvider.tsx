"use client";

import { useEffect } from "react";
import { initLenis } from "@/lib/lenis";
import type { Lenis } from "lenis";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenis: Lenis | null = null;

    // Small delay to ensure DOM is ready
    const id = requestAnimationFrame(() => {
      lenis = initLenis();
    });

    return () => {
      cancelAnimationFrame(id);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
