import dynamic from "next/dynamic";

// Three.js must not run on the server
const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      {/* Fixed 3D canvas layer — behind everything */}
      <div className="canvas-layer">
        <Scene />
      </div>

      {/* Scrollable DOM layer */}
      <div className="dom-layer">
        {/* Hero — viewport height, transparent so canvas shows through */}
        <section
          style={{ height: "100vh" }}
          className="flex flex-col justify-between px-8 py-10 pointer-events-none select-none"
        >
          {/* Top wordmark */}
          <div className="flex justify-between items-start w-full">
            <span
              style={{
                color: "var(--fg)",
                fontWeight: 300,
                fontSize: "clamp(13px, 1.5vw, 16px)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                opacity: 0.9,
              }}
            >
              Bluki Studio
            </span>
            <span
              style={{
                color: "var(--muted)",
                fontWeight: 300,
                fontSize: "clamp(11px, 1.2vw, 13px)",
                letterSpacing: "0.1em",
              }}
            >
              ©&nbsp;2025
            </span>
          </div>

          {/* Bottom tagline */}
          <div className="w-full">
            <p
              style={{
                color: "var(--muted)",
                fontWeight: 300,
                fontSize: "clamp(11px, 1.2vw, 13px)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Scroll to explore
            </p>
          </div>
        </section>

        {/* Scroll space for 3D animation to play out */}
        <section style={{ height: "200vh" }} aria-hidden="true" />
      </div>
    </>
  );
}
