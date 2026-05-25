"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, type RootState } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────
// Constellation backdrop for the /istorii banner.
//
// Metaphor: each particle is a fragment of history; the lines that
// flicker between nearby fragments are the threads of memory that
// hold them together — род, поколение, адат.
//
// Why CPU motion instead of a vertex shader: lines need to be drawn
// between MOVING endpoints. Doing the motion on the CPU lets us read
// the displaced positions back when building the line segment buffer
// each frame. With only ~110 particles this is essentially free.
//
// Both points AND lines share the same fragment-side fades:
//   • edge fade   — feathered against the canvas borders
//   • clearZone   — radial elliptical hole around the centre so the
//                   title stays crisp (aspect-corrected)
// ─────────────────────────────────────────────────────────────────

const PARTICLE_COUNT = 110;
const CONNECT_DISTANCE = 1.85; // world units
const BOUND_X = 7.5;
const BOUND_Y = 4.5;
const BOUND_Z = 3.0;
// Worst-case = N*(N-1)/2 pairs. We preallocate the line buffer to that.
const MAX_LINES = (PARTICLE_COUNT * (PARTICLE_COUNT - 1)) / 2;

function Constellation() {
  // Persistent per-particle state.
  const data = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const scales = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);
    const colorBlends = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * BOUND_X * 1.8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * BOUND_Y * 1.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * BOUND_Z * 1.6;

      velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.35;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.25;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.15;

      scales[i] = 0.45 + Math.random() * 1.05;
      phases[i] = Math.random() * Math.PI * 2;
      colorBlends[i] = Math.random();
    }
    return { positions, velocities, scales, phases, colorBlends };
  }, []);

  // Points geometry — references the same positions Float32Array so
  // mutating it in useFrame is reflected on the GPU after needsUpdate.
  const pointsGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(data.positions, 3).setUsage(
        THREE.DynamicDrawUsage
      )
    );
    g.setAttribute("aScale", new THREE.BufferAttribute(data.scales, 1));
    g.setAttribute(
      "aColorBlend",
      new THREE.BufferAttribute(data.colorBlends, 1)
    );
    return g;
  }, [data]);

  // Lines geometry — overprovisioned buffer; we set the draw range
  // each frame to however many pairs are within CONNECT_DISTANCE.
  const linesGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(MAX_LINES * 6); // 2 × xyz
    const alphas = new Float32Array(MAX_LINES * 2); // per-vertex
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3).setUsage(
        THREE.DynamicDrawUsage
      )
    );
    g.setAttribute(
      "aAlpha",
      new THREE.BufferAttribute(alphas, 1).setUsage(THREE.DynamicDrawUsage)
    );
    g.setDrawRange(0, 0);
    return g;
  }, []);

  const pointsMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uColorWarm: { value: new THREE.Color("#f3ead4") },
          uColor: { value: new THREE.Color("#fbbf24") },
          uColorDeep: { value: new THREE.Color("#b45309") },
        },
        vertexShader: POINTS_VERT,
        fragmentShader: POINTS_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const linesMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uResolution: { value: new THREE.Vector2(1, 1) },
          uColor: { value: new THREE.Color("#fbbf24") },
          uOpacity: { value: 0.28 },
        },
        vertexShader: LINES_VERT,
        fragmentShader: LINES_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  // We do most heavy work in this single useFrame: drift particles,
  // bounce off the bounding box, rebuild the line segments buffer.
  useFrame((state: RootState, deltaRaw: number) => {
    const dt = Math.min(deltaRaw, 0.05);
    const t = state.clock.elapsedTime;
    const { positions, velocities, phases } = data;

    // ── Step particles ────────────────────────────────────────────
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;

      positions[ix + 0]! += velocities[ix + 0]! * dt;
      positions[ix + 1]! += velocities[ix + 1]! * dt;
      positions[ix + 2]! += velocities[ix + 2]! * dt;

      // Add a soft sinusoidal perturbation so motion isn't purely
      // linear — feels alive without going chaotic.
      positions[ix + 0]! += Math.cos(t * 0.35 + phases[i]!) * 0.0015;
      positions[ix + 1]! += Math.sin(t * 0.45 + phases[i]!) * 0.0015;

      // Bounce at the bounding box.
      if (Math.abs(positions[ix + 0]!) > BOUND_X) {
        velocities[ix + 0]! *= -1;
        positions[ix + 0]! = Math.sign(positions[ix + 0]!) * BOUND_X;
      }
      if (Math.abs(positions[ix + 1]!) > BOUND_Y) {
        velocities[ix + 1]! *= -1;
        positions[ix + 1]! = Math.sign(positions[ix + 1]!) * BOUND_Y;
      }
      if (Math.abs(positions[ix + 2]!) > BOUND_Z) {
        velocities[ix + 2]! *= -1;
        positions[ix + 2]! = Math.sign(positions[ix + 2]!) * BOUND_Z;
      }
    }
    (pointsGeo.attributes.position as THREE.BufferAttribute).needsUpdate =
      true;

    // ── Build line segments between nearby pairs ─────────────────
    const lineAttr = linesGeo.attributes.position as THREE.BufferAttribute;
    const lineAlphaAttr = linesGeo.attributes.aAlpha as THREE.BufferAttribute;
    const lp = lineAttr.array as Float32Array;
    const la = lineAlphaAttr.array as Float32Array;
    let lineCount = 0;
    const D = CONNECT_DISTANCE;
    const D2 = D * D;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ax = positions[i * 3 + 0]!;
      const ay = positions[i * 3 + 1]!;
      const az = positions[i * 3 + 2]!;
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const bx = positions[j * 3 + 0]!;
        const by = positions[j * 3 + 1]!;
        const bz = positions[j * 3 + 2]!;
        const dx = bx - ax;
        const dy = by - ay;
        const dz = bz - az;
        const dist2 = dx * dx + dy * dy + dz * dz;
        if (dist2 < D2) {
          const alpha = 1 - Math.sqrt(dist2) / D;
          // Squared falloff — connections fade fast at the threshold
          // so the weakest links are barely visible. Feels less busy.
          const a = alpha * alpha;
          const off = lineCount * 6;
          lp[off + 0] = ax;
          lp[off + 1] = ay;
          lp[off + 2] = az;
          lp[off + 3] = bx;
          lp[off + 4] = by;
          lp[off + 5] = bz;
          la[lineCount * 2 + 0] = a;
          la[lineCount * 2 + 1] = a;
          lineCount++;
        }
      }
    }
    lineAttr.needsUpdate = true;
    lineAlphaAttr.needsUpdate = true;
    linesGeo.setDrawRange(0, lineCount * 2);

    // ── Uniforms ─────────────────────────────────────────────────
    pointsMat.uniforms.uTime!.value = t;
    pointsMat.uniforms.uResolution!.value.set(
      state.size.width * state.viewport.dpr,
      state.size.height * state.viewport.dpr
    );
    linesMat.uniforms.uResolution!.value.copy(
      pointsMat.uniforms.uResolution!.value
    );

    // ── Camera parallax + slow idle drift ────────────────────────
    const cam = state.camera;
    const idleX = Math.sin(t * 0.10) * 0.16;
    const idleY = Math.cos(t * 0.07) * 0.09;
    const tx = state.pointer.x * 0.3 + idleX;
    const ty = state.pointer.y * 0.18 + idleY;
    cam.position.x += (tx - cam.position.x) * 0.04;
    cam.position.y += (ty - cam.position.y) * 0.04;
    cam.lookAt(0, 0, 0);
  });

  return (
    <>
      <lineSegments geometry={linesGeo} material={linesMat} />
      <points geometry={pointsGeo} material={pointsMat} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// MEMORY ORBS — larger sprites in the foreground that briefly show a
// historical photograph (tower, dagger, warrior, guardian), then fade
// out and respawn elsewhere with a different image. They never spawn
// over the title — positions are picked on a ring around the centre.
// ─────────────────────────────────────────────────────────────────

const ORB_TEXTURE_PATHS = [
  "/images/dwellings/tower.jpg",
  "/images/weapons/kinzhal.jpg",
  "/images/warriors/voin.jpg",
  "/images/warriors/khranitel-poroga.jpg",
];

// Preload at module evaluation time — the network fetch + decode kick
// off the moment this module is imported (i.e. as soon as the dynamic
// chunk for the banner canvas lands), not when <MemoryOrbs /> mounts.
// useTexture inside the component will then resolve from cache, so
// Suspense barely flickers.
useTexture.preload(ORB_TEXTURE_PATHS);

// Per-texture tints — each category gets its own warm/cool bias so
// the orbs don't all look like the same amber bubble. The colour is
// applied as a tint over the (greyer) photograph in the shader.
const ORB_TINTS = [
  "#e6b878", // tower      — sandy warm earth
  "#b8c8d8", // kinzhal    — cool steel
  "#dc8c5a", // voin       — copper
  "#c8865a", // khranitel  — bronze
];

// Three slots with deliberately uneven sizes + lifetimes → balance:
// one anchors the scene (big & long), one mid, one small accent.
const ORB_SLOTS = [
  { scale: 2.0, lifetime: 18 }, // hero
  { scale: 1.3, lifetime: 14 }, // mid
  { scale: 0.9, lifetime: 11 }, // accent
];

const ORB_FADE = 1.8; // smoothstep window for fadeIn/fadeOut
const ORB_CONNECT_DISTANCE = 5.5; // world units — orbs spread further
const MAX_ORB_LINES = (ORB_SLOTS.length * (ORB_SLOTS.length - 1)) / 2;

type OrbSlot = {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  birthTime: number;
  textureIdx: number;
  scale: number;
  lifetime: number;
  opacity: number; // updated each frame so line builder can read it
};

function MemoryOrbs() {
  const textures = useTexture(ORB_TEXTURE_PATHS);

  // Side-effect: enforce sRGB + better anisotropy. Also build the
  // matching THREE.Color tints once.
  const tintColors = useMemo(() => {
    for (const tex of textures) {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
    }
    return ORB_TINTS.map((c) => new THREE.Color(c));
  }, [textures]);

  // Per-slot state. Each slot is pre-positioned on the orbital ring
  // (same logic as respawn) so it's visible on the very first frame.
  // Negative-staggered birth times put later slots already mid-life,
  // which combined with proper positions means the scene is full from
  // the moment the canvas paints — no awkward "centre fade-in" gap.
  const slots = useMemo<OrbSlot[]>(() => {
    return ORB_SLOTS.map((cfg, i) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 4.2 + Math.random() * 1.6;
      return {
        pos: new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.55,
          1.0 + Math.random() * 1.2
        ),
        vel: new THREE.Vector3(
          -Math.sin(angle) * 0.08,
          Math.cos(angle) * 0.06,
          0
        ),
        birthTime: -i * (cfg.lifetime / ORB_SLOTS.length) * 1.25,
        textureIdx: i % textures.length,
        scale: cfg.scale,
        lifetime: cfg.lifetime,
        opacity: 0,
      };
    });
  }, [textures.length]);

  // One ShaderMaterial per slot — uniforms mutated each frame.
  const materials = useMemo(
    () =>
      slots.map(
        (s) =>
          new THREE.ShaderMaterial({
            uniforms: {
              uMap: { value: textures[s.textureIdx]! },
              uOpacity: { value: 0 },
              uResolution: { value: new THREE.Vector2(1, 1) },
              uTint: { value: tintColors[s.textureIdx]!.clone() },
            },
            vertexShader: ORB_VERT,
            fragmentShader: ORB_FRAG,
            transparent: true,
            depthWrite: false,
          })
      ),
    [slots, textures, tintColors]
  );

  // ── Orb-to-orb threads — separate LineSegments so we can tune
  //    them independently from the constellation particle lines.
  const orbLinesGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(MAX_ORB_LINES * 6);
    const alphas = new Float32Array(MAX_ORB_LINES * 2);
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3).setUsage(
        THREE.DynamicDrawUsage
      )
    );
    g.setAttribute(
      "aAlpha",
      new THREE.BufferAttribute(alphas, 1).setUsage(THREE.DynamicDrawUsage)
    );
    g.setDrawRange(0, 0);
    return g;
  }, []);

  const orbLinesMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uResolution: { value: new THREE.Vector2(1, 1) },
          uColor: { value: new THREE.Color("#fde2a8") },
          uOpacity: { value: 0.5 },
        },
        vertexShader: LINES_VERT,
        fragmentShader: LINES_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const meshes = useRef<THREE.Mesh[]>([]);

  function respawn(slot: OrbSlot, t: number, mat: THREE.ShaderMaterial) {
    // Spawn on a ring around the centre (vertically squashed to fit a
    // wide banner). Drift perpendicular to the radius — orbital feel.
    const angle = Math.random() * Math.PI * 2;
    const radius = 4.2 + Math.random() * 1.6;
    slot.pos.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.55,
      1.0 + Math.random() * 1.2
    );
    slot.vel.set(-Math.sin(angle) * 0.08, Math.cos(angle) * 0.06, 0);
    slot.birthTime = t;

    // Different texture than current. Also re-tint the material to
    // match the new texture's category colour.
    let next = Math.floor(Math.random() * textures.length);
    if (next === slot.textureIdx) {
      next = (next + 1) % textures.length;
    }
    slot.textureIdx = next;
    mat.uniforms.uTint!.value.copy(tintColors[next]!);
  }

  useFrame((state: RootState, deltaRaw: number) => {
    const dt = Math.min(deltaRaw, 0.05);
    const t = state.clock.elapsedTime;
    const cam = state.camera;
    const resX = state.size.width * state.viewport.dpr;
    const resY = state.size.height * state.viewport.dpr;

    // ── Step each orb, update its visuals + record opacity ──────
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]!;
      const mesh = meshes.current[i];
      const mat = materials[i]!;
      if (!mesh) continue;

      let age = t - slot.birthTime;
      if (age > slot.lifetime) {
        respawn(slot, t, mat);
        age = 0;
      }

      slot.pos.x += slot.vel.x * dt;
      slot.pos.y += slot.vel.y * dt;

      const fadeIn = THREE.MathUtils.smoothstep(age, 0, ORB_FADE);
      const fadeOut = THREE.MathUtils.smoothstep(
        slot.lifetime - age,
        0,
        ORB_FADE
      );
      slot.opacity = Math.min(fadeIn, fadeOut) * 0.92;

      mesh.position.copy(slot.pos);
      mesh.lookAt(cam.position);

      const u = mat.uniforms;
      u.uOpacity!.value = slot.opacity;
      u.uMap!.value = textures[slot.textureIdx]!;
      u.uResolution!.value.set(resX, resY);
    }

    // ── Build orb-to-orb threads ────────────────────────────────
    const linePos = orbLinesGeo.attributes.position as THREE.BufferAttribute;
    const lineAlpha = orbLinesGeo.attributes.aAlpha as THREE.BufferAttribute;
    const lp = linePos.array as Float32Array;
    const la = lineAlpha.array as Float32Array;
    let lineCount = 0;
    const D = ORB_CONNECT_DISTANCE;
    const D2 = D * D;

    for (let i = 0; i < slots.length; i++) {
      const sA = slots[i]!;
      for (let j = i + 1; j < slots.length; j++) {
        const sB = slots[j]!;
        const dx = sB.pos.x - sA.pos.x;
        const dy = sB.pos.y - sA.pos.y;
        const dz = sB.pos.z - sA.pos.z;
        const dist2 = dx * dx + dy * dy + dz * dz;
        if (dist2 < D2) {
          const distAlpha = 1 - Math.sqrt(dist2) / D;
          // Multiply by min orb opacity — thread fades with whichever
          // orb is dimmer, so it never hangs in the air after one tears
          // down.
          const a = distAlpha * Math.min(sA.opacity, sB.opacity);
          const off = lineCount * 6;
          lp[off + 0] = sA.pos.x;
          lp[off + 1] = sA.pos.y;
          lp[off + 2] = sA.pos.z;
          lp[off + 3] = sB.pos.x;
          lp[off + 4] = sB.pos.y;
          lp[off + 5] = sB.pos.z;
          la[lineCount * 2 + 0] = a;
          la[lineCount * 2 + 1] = a;
          lineCount++;
        }
      }
    }
    linePos.needsUpdate = true;
    lineAlpha.needsUpdate = true;
    orbLinesGeo.setDrawRange(0, lineCount * 2);
    orbLinesMat.uniforms.uResolution!.value.set(resX, resY);
  });

  return (
    <>
      <lineSegments geometry={orbLinesGeo} material={orbLinesMat} />
      {slots.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) meshes.current[i] = el;
          }}
          scale={[s.scale, s.scale, 1]}
        >
          <planeGeometry args={[1, 1]} />
          <primitive object={materials[i]!} attach="material" />
        </mesh>
      ))}
    </>
  );
}

export function StoriesBannerCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 55 }}
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
    >
      <Constellation />
      <Suspense fallback={null}>
        <MemoryOrbs />
      </Suspense>
      <EffectComposer>
        <Bloom
          intensity={0.65}
          luminanceThreshold={0.06}
          luminanceSmoothing={0.55}
          mipmapBlur
        />
        <Vignette
          eskil={false}
          offset={0.3}
          darkness={0.55}
          blendFunction={BlendFunction.NORMAL}
        />
        <Noise opacity={0.025} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    </Canvas>
  );
}

// ─────────────────────────────────────────────────────────────────
// GLSL — shared fade snippet for both points and lines
// ─────────────────────────────────────────────────────────────────

const SHARED_FADE = /* glsl */ `
  // Edge fade — feather away from canvas borders.
  // Clear-zone fade — elliptical hole around the centre (aspect-aware).
  float computeMaskFade(vec2 fragCoord, vec2 res) {
    vec2 screen = fragCoord / res;
    float edge =
        smoothstep(0.00, 0.18, screen.x) *
        smoothstep(1.00, 0.82, screen.x) *
        smoothstep(0.00, 0.16, screen.y) *
        smoothstep(1.00, 0.84, screen.y);
    vec2 c = screen - 0.5;
    c.x *= res.x / res.y;
    float clearZone = smoothstep(0.18, 0.55, length(c));
    return edge * clearZone;
  }
`;

const POINTS_VERT = /* glsl */ `
  attribute float aScale;
  attribute float aColorBlend;

  varying float vColorBlend;
  varying float vViewDistance;

  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDistance = -mvPos.z;
    gl_Position  = projectionMatrix * mvPos;
    gl_PointSize = aScale * (130.0 / max(vViewDistance, 0.001));
    vColorBlend  = aColorBlend;
  }
`;

const POINTS_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uColorWarm;
  uniform vec3 uColor;
  uniform vec3 uColorDeep;
  uniform vec2 uResolution;
  varying float vColorBlend;
  varying float vViewDistance;

  ${SHARED_FADE}

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    float alpha = pow(smoothstep(0.5, 0.0, d), 1.6);

    float mask = computeMaskFade(gl_FragCoord.xy, uResolution);
    float depthFade =
        smoothstep(1.0, 3.5,  vViewDistance) *
        smoothstep(20.0, 8.0, vViewDistance);

    vec3 col;
    if (vColorBlend < 0.5) {
      col = mix(uColorWarm, uColor,     vColorBlend * 2.0);
    } else {
      col = mix(uColor,     uColorDeep, (vColorBlend - 0.5) * 2.0);
    }

    gl_FragColor = vec4(col, alpha * mask * depthFade);
  }
`;

const LINES_VERT = /* glsl */ `
  attribute float aAlpha;
  varying float vAlpha;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vAlpha = aAlpha;
  }
`;

const LINES_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3  uColor;
  uniform vec2  uResolution;
  uniform float uOpacity;
  varying float vAlpha;

  ${SHARED_FADE}

  void main() {
    float mask = computeMaskFade(gl_FragCoord.xy, uResolution);
    gl_FragColor = vec4(uColor, vAlpha * mask * uOpacity);
  }
`;

const ORB_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ORB_FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uMap;
  uniform float     uOpacity;
  uniform vec2      uResolution;
  uniform vec3      uTint;

  varying vec2 vUv;

  ${SHARED_FADE}

  void main() {
    vec4 tex = texture2D(uMap, vUv);

    // Round soft-edged "memory bubble" mask.
    vec2  c = vUv - 0.5;
    float r = length(c);
    float disc = smoothstep(0.50, 0.36, r);
    // Inner vignette so the centre is bright and edges sink to dark.
    float vignette = mix(0.55, 1.0, smoothstep(0.50, 0.10, r));

    // Slight amber bias to harmonise with the rest of the scene.
    vec3 col = mix(tex.rgb, tex.rgb * uTint, 0.35);
    col *= vignette;

    // Add a faint amber rim where the disc fades out — feels like the
    // bubble is lit from within.
    float rim = smoothstep(0.36, 0.46, r) * (1.0 - smoothstep(0.46, 0.50, r));
    col += uTint * rim * 0.6;

    // Respect the global edge / clear-zone fades so orbs don't crash
    // through the title text either.
    float screenMask = computeMaskFade(gl_FragCoord.xy, uResolution);

    gl_FragColor = vec4(col, disc * uOpacity * screenMask);
  }
`;
