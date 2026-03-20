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

  lenis.on("scroll", ({ scroll, progress }: { scroll: number; progress: number }) => {
    scrollState.scrollY = scroll;
    scrollState.progress = progress;
    ScrollTrigger.update();
  });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // Critical: disable lag smoothing to prevent animation delays
  gsap.ticker.lagSmoothing(0);

  return lenis;
}
