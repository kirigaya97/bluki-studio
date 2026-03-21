import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState } from "./scrollState";

gsap.registerPlugin(ScrollTrigger);

export function initLenis(): Lenis {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  // Lenis 1.x scroll event — the callback receives the Lenis instance itself
  // (not a plain object), so read properties off it directly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lenis.on("scroll", (e: any) => {
    scrollState.scrollY  = e.scroll    ?? e.scrollY ?? 0;
    scrollState.progress = e.progress  ?? 0;
    ScrollTrigger.update();
  });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenis;
}
