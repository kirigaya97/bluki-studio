# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Bluki Studio** — Creative digital agency portfolio built with 3D web development techniques. The full technical context for this project lives in `CLAUDE_CODE_CONTEXT.md` (read it at the start of every session). A Spanish-language learning guide is in `GUIA_CREATIVE_DEVELOPER.md`.

## Canonical Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js App Router | 15+ |
| Language | TypeScript | latest |
| 3D Engine | Three.js | r183+ |
| React binding | React Three Fiber (R3F) | v9 |
| R3F helpers | @react-three/drei | latest |
| Post-processing | @react-three/postprocessing | latest |
| Animation | GSAP + ScrollTrigger, SplitText, Flip, MorphSVGPlugin | 3.13+ (all free) |
| Smooth scroll | Lenis | 1.x |
| GPU shaders | GLSL | — |
| Styles | Tailwind CSS | latest |

## Bootstrap Commands

```bash
# Scaffold
npx create-next-app@latest . --typescript --tailwind --app

# Core stack
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
npm install gsap @gsap/react
npm install lenis
npm install -D @types/three raw-loader

# Performance tooling
npm install r3f-perf stats.js
npm install -D gltf-pipeline

# Compress a 3D model
npx gltf-pipeline -i model.glb -o model-draco.glb --draco.compressionLevel 10
```

## Project Architecture

Two rendering layers stacked on top of each other communicate via React state (Zustand or Context):

```
┌───────────────────────────────────────┐
│  DOM layer  (position: relative, z:1) │  ← HTML, text, nav, buttons
├───────────────────────────────────────┤
│  Canvas layer (position: fixed, z:-1) │  ← Three.js / R3F scene
└───────────────────────────────────────┘
```

```tsx
// layout.tsx — canonical pattern
<div style={{ position: 'fixed', top: 0, width: '100%', height: '100vh' }}>
  <Canvas><Scene /></Canvas>
</div>
<main style={{ position: 'relative', zIndex: 1 }}>{children}</main>
```

### Directory Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — mounts Lenis provider
│   └── page.tsx
├── components/
│   ├── canvas/             # Everything inside <Canvas>
│   │   ├── Scene.tsx       # Canvas root
│   │   ├── Model.tsx       # Loaded 3D models
│   │   └── Effects.tsx     # EffectComposer / post-processing
│   ├── dom/                # HTML overlay (nav, text, buttons)
│   └── shared/
├── shaders/
│   ├── vertex.glsl
│   └── fragment.glsl
├── hooks/
│   ├── useScrollProgress.ts
│   └── useGSAP.ts
├── lib/
│   └── lenis.ts            # Lenis + GSAP ticker sync (mandatory)
└── public/
    └── models/             # .glb assets (Draco compressed)
```

## Critical Configuration

### next.config.ts — GLSL import support
```ts
const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    })
    return config
  },
}
```

### Lenis + GSAP sync (lib/lenis.ts) — mandatory
```ts
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => { lenis.raf(time * 1000) })
gsap.ticker.lagSmoothing(0)  // CRITICAL — prevents animation delays
```

### Canvas setup
```tsx
<Canvas
  camera={{ position: [0, 0, 5], fov: 75 }}
  gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
  dpr={[1, 2]}  // cap pixel ratio at 2x
>
```

### Three.js components must avoid SSR
```tsx
const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })
```

### GSAP must run client-side only
```tsx
import { useGSAP } from '@gsap/react'
useGSAP(() => { gsap.to('.box', { x: 100 }) }, { scope: containerRef })
```

## Performance Rules

| Metric | Target |
|---|---|
| Draw calls (`renderer.info.render.calls`) | < 100 |
| FPS | 60 constant |
| Pixel ratio | max 2x (`dpr={[1, 2]}`) |
| Texture dimensions | Power-of-two only (512, 1024, 2048…) |
| Model size | < 5 MB total, Draco-compressed GLB |

- Use `InstancedMesh` for repeated geometry (1 draw call instead of N).
- Never call `scene.remove(light)` — set `light.visible = false` or `light.intensity = 0` instead (removing lights forces full shader recompilation).
- Monitor GPU memory: `renderer.info.memory` — rising values = leak.

## Memory Management

Three.js does **not** auto-garbage-collect GPU memory. Always dispose on unmount:

```ts
geometry.dispose()
material.dispose()
texture.dispose()
scene.remove(mesh)
```

In R3F, put disposal in a `useEffect` cleanup function.

## Post-Processing Antialiasing

The renderer's built-in AA does not work with EffectComposer — use SMAA instead:

```tsx
<EffectComposer multisampling={0}>
  <SMAA />
</EffectComposer>
```

## Shader Pattern

```tsx
const WaveMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color() },
  vertexShader,    // imported via raw-loader
  fragmentShader
)
extend({ WaveMaterial })

// Update uniform every frame
useFrame(({ clock }) => {
  meshRef.current.material.uTime = clock.getElapsedTime()
})
```

## Asset Pipeline

- **Models**: GLB format only (not OBJ/FBX), Draco-compressed, < 50k polygons
- **Textures**: WebP or KTX2, power-of-two dimensions, one 4K texture = 64MB+ VRAM
- **Sources**: Sketchfab, Poly Pizza, Quaternius (models) · Polyhaven, AmbientCG (textures/HDRIs)
- **Workflow**: Blender → Decimate modifier → export GLB → `gltf-pipeline` compress

## WebGPU (2025/2026)

Three.js r171+ ships `WebGPURenderer` with automatic WebGL 2 fallback. R3F v10 (alpha) supports WebGPU natively. For most creative projects, standard WebGL 2 is sufficient.

## Profiling Tools

- `r3f-perf` — real-time R3F stats overlay
- `stats.js` — FPS counter
- `spector.js` — Chrome/Firefox WebGL frame inspector
- `renderer.info` — draw calls and memory counts
