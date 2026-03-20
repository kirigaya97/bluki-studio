/**
 * Global mutable scroll state — readable inside useFrame without causing re-renders.
 * Updated in the layout scroll listener and in the Lenis callback.
 */
export const scrollState = {
  /** Raw scrollY in pixels */
  scrollY: 0,
  /** Normalized 0→1 over total scrollable height */
  progress: 0,
};
