"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ScrollControls,
  Scroll,
  useScroll,
  Environment,
  ContactShadows,
  useGLTF,
  Loader,
} from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import * as THREE from "three";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";

// ──────────────────────────────────────────────
// Narrative — 6 sections. Each text panel sits at top = idx * 100vh and
// is fully centred in the viewport at scroll progress p = idx / 5.
// ──────────────────────────────────────────────

type Section = {
  id: string;
  kicker?: string;
  title: string;
  body: string;
};

const SECTIONS: Section[] = [
  {
    id: "intro",
    kicker: "ИСТОРИЯ",
    title: "Башня — договор рода с горой",
    body: "В горах Чечено-Ингушетии стоят каменные башни — символ вайнахской цивилизации. Они одновременно были домом, крепостью и святилищем.",
  },
  {
    id: "construction",
    kicker: "КОНСТРУКЦИЯ",
    title: "Кладка насухо и машикули",
    body: "Высота боевой башни достигала 25–28 метров, соотношение 10:1. Камень укладывался без раствора. Машикули — нависающие парапеты — позволяли поражать врага у подножия.",
  },
  {
    id: "interior",
    kicker: "МАСТЕРА",
    title: "Без раствора и лесов",
    body: "Башни строили без наружных лесов — всё клали с настилов изнутри. Крупные камни подвозили быки на санях, тёсли бергом и варзапом. Стены идут с уклоном внутрь и сужаются к вершине. Последний камень кровли укладывал сам мастер — самое почётное и самое опасное место работы.",
  },
  {
    id: "fireplace",
    kicker: "ВНУТРИ",
    title: "Этажи памяти",
    body: "Башня раскрывается — внутренние ярусы становятся видны. Четыре этажа: внизу очаг, выше — жилые и оборонительные пространства с арочными окнами.",
  },
  {
    id: "defense",
    kicker: "ОБОРОНА",
    title: "Когда враги наступали",
    body: "На верхнем ярусе башни — в боевой вышке — зажигали факел. Пламя било из бойниц, дым поднимался столбом. Сигнал был виден соседним родам за десятки вёрст: тревога, зов о помощи.",
  },
  {
    id: "epilogue",
    kicker: "ПАМЯТЬ",
    title: "Договор продолжает действовать",
    body: "Башни сохранились в скалах Аргунского ущелья. Каждая помнит имя рода. Не дом, не крепость — договор между человеком и горой.",
  },
];

const TOTAL_PAGES = SECTIONS.length;

useGLTF.preload("/models/tower.glb");
useGLTF.preload("/models/tower-section.glb");

// ──────────────────────────────────────────────
// ANIMATION TIMELINE
//
// One keyframe table drives every animated value in the scene: camera
// position & target, model opacities, tower A's Y-rotation, and the two
// fire intensities. `sampleTrack(p, channel)` returns the smoothstep-eased
// value at scroll position p ∈ [0, 1].
//
// Anchor keyframes sit at p = idx / 5 (the scroll position where each
// text section is centred). Intermediate keyframes shape transitions.
//
// This single source of truth replaces a previous if/else chain in
// CameraRig plus scattered opacity/fire functions. To re-time the story,
// edit the table below — nothing else needs to change.
// ──────────────────────────────────────────────

const INTRO_ANGLE = Math.PI / 6; // ~30° corner-on pose at story start

type Keyframe = {
  p: number;
  camX: number;
  camY: number;
  camZ: number;
  lookX: number;
  lookY: number;
  opacityA: number;
  opacityB: number;
  rotationA: number;
  hearthFire: number;
  signalFire: number;
};

// Rotation anchor at p=0.20 — placed on the linear rotation path between
// HOLD_END (0.05) and FULL_END (0.40) so interpolation stays uniform.
const ROT_AT_SEC2 =
  INTRO_ANGLE + (2 * Math.PI - INTRO_ANGLE) * ((0.2 - 0.05) / (0.4 - 0.05));

const KEYFRAMES: Keyframe[] = [
  // ── Section 1 — INTRO (p=0.00) ────────────────────────────────────
  // Angled tower, centred, far framing. Held still for the first 5%.
  {
    p: 0.0,
    camX: 0, camY: 2.8, camZ: 7.8,
    lookX: 0, lookY: 2.8,
    opacityA: 1, opacityB: 0,
    rotationA: INTRO_ANGLE,
    hearthFire: 0, signalFire: 0,
  },
  {
    p: 0.05,
    camX: 0, camY: 2.8, camZ: 7.8,
    lookX: 0, lookY: 2.8,
    opacityA: 1, opacityB: 0,
    rotationA: INTRO_ANGLE,
    hearthFire: 0, signalFire: 0,
  },
  // ── Section 2 — CONSTRUCTION (p=0.20) ─────────────────────────────
  // Camera holds intro framing. Tower keeps rotating; this keyframe's
  // rotation value lies on the linear path so the spin reads as uniform.
  {
    p: 0.2,
    camX: 0, camY: 2.8, camZ: 7.8,
    lookX: 0, lookY: 2.8,
    opacityA: 1, opacityB: 0,
    rotationA: ROT_AT_SEC2,
    hearthFire: 0, signalFire: 0,
  },
  // ── Section 3 — INTERIOR (p=0.40) ─────────────────────────────────
  // Rotation completes. Camera approaches A — another 5% closer than
  // before so the wall texture and recessed windows read clearly.
  {
    p: 0.4,
    camX: 0, camY: 3.15, camZ: 5.13,
    lookX: 0, lookY: 3.15,
    opacityA: 1, opacityB: 0,
    rotationA: 2 * Math.PI,
    hearthFire: 0, signalFire: 0,
  },
  // Mid sec 3 — slide DOWN to middle framing AND push camera much closer.
  // At this tight distance the camera sees mostly wall texture rather
  // than the tower silhouette, which hides the size mismatch between A
  // (whole tower, narrow) and B (cross-section, wider) during the swap.
  {
    p: 0.5,
    camX: 0, camY: 2.16, camZ: 3.4,
    lookX: 0, lookY: 1.8,
    opacityA: 1, opacityB: 0,
    rotationA: 2 * Math.PI,
    hearthFire: 0, signalFire: 0,
  },
  // Hold A's full opacity until just before the swap — keeps the fade
  // window short (0.55 → 0.58 = 3% of scroll) so we don't linger in the
  // 50/50 double-silhouette zone that looks unprofessional.
  {
    p: 0.55,
    camX: 0, camY: 2.16, camZ: 3.4,
    lookX: 0, lookY: 1.8,
    opacityA: 1, opacityB: 0,
    rotationA: 2 * Math.PI,
    hearthFire: 0, signalFire: 0,
  },
  // Sec 3 end — A→B swap completes; B fully visible just before sec 4.
  {
    p: 0.58,
    camX: 0, camY: 2.16, camZ: 3.4,
    lookX: 0, lookY: 1.8,
    opacityA: 0, opacityB: 1,
    rotationA: 2 * Math.PI,
    hearthFire: 0, signalFire: 0,
  },
  // ── Section 4 — HEARTH (p=0.60) ───────────────────────────────────
  // Cross-section in frame. Camera stays at the SAME close distance as
  // the swap (camZ = 3.4) so B reads at the same size A was — no abrupt
  // pull-back that would make B appear smaller right after appearing.
  {
    p: 0.6,
    camX: 0, camY: 2.0, camZ: 3.4,
    lookX: 0, lookY: 1.7,
    opacityA: 0, opacityB: 1,
    rotationA: 2 * Math.PI,
    hearthFire: 0, signalFire: 0,
  },
  // Sec 4 mid — tighter framing on the middle floors (stairs + interior).
  // Visible Y at this framing ≈ [0.44 .. 2.56] (base hidden).
  {
    p: 0.7,
    camX: 0, camY: 1.8, camZ: 3.7,
    lookX: 0, lookY: 1.5,
    opacityA: 0, opacityB: 1,
    rotationA: 2 * Math.PI,
    hearthFire: 0, signalFire: 0,
  },
  // Hold B fully visible until just before the B→A swap — same close
  // framing, so the swap happens at stable camera with no pull-back
  // chaos during the cross-fade.
  {
    p: 0.76,
    camX: 0, camY: 1.8, camZ: 3.7,
    lookX: 0, lookY: 1.5,
    opacityA: 0, opacityB: 1,
    rotationA: 2 * Math.PI,
    hearthFire: 0, signalFire: 0,
  },
  // B→A swap completes — fade window is only 0.76 → 0.78 (2% of scroll),
  // and the camera is still at the same close framing so the silhouettes
  // are stable. The pull-back to defence happens AFTER the swap.
  {
    p: 0.78,
    camX: 0, camY: 1.8, camZ: 3.7,
    lookX: 0, lookY: 1.5,
    opacityA: 1, opacityB: 0,
    rotationA: 2 * Math.PI,
    hearthFire: 0, signalFire: 0.15,
  },
  // ── Section 5 — DEFENCE (p=0.80) ──────────────────────────────────
  // A at full height, signal fire blazing from the upper window.
  {
    p: 0.8,
    camX: 0, camY: 2.5, camZ: 10,
    lookX: 0, lookY: 2.2,
    opacityA: 1, opacityB: 0,
    rotationA: 2 * Math.PI,
    hearthFire: 0, signalFire: 1,
  },
  // Between sec 5 and sec 6 — signal fades, camera drifts back.
  {
    p: 0.92,
    camX: 0, camY: 2.5, camZ: 11,
    lookX: 0, lookY: 2.2,
    opacityA: 1, opacityB: 0,
    rotationA: 2 * Math.PI,
    hearthFire: 0, signalFire: 0.4,
  },
  // ── Section 6 — EPILOGUE (p=1.00) ─────────────────────────────────
  // Final pull-back, signal extinguished.
  {
    p: 1.0,
    camX: 0, camY: 2.5, camZ: 13,
    lookX: 0, lookY: 2.2,
    opacityA: 1, opacityB: 0,
    rotationA: 2 * Math.PI,
    hearthFire: 0, signalFire: 0,
  },
];

function smoothStep(t: number): number {
  const c = THREE.MathUtils.clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

type Channel = Exclude<keyof Keyframe, "p">;

/**
 * Interpolate one channel of the keyframe table at scroll position `p`.
 * Smoothstep easing is applied between adjacent keyframes so motion
 * starts and ends gently.
 */
function sampleTrack(p: number, channel: Channel): number {
  let i = 0;
  for (let k = 0; k < KEYFRAMES.length - 1; k++) {
    if (KEYFRAMES[k + 1].p <= p) i = k + 1;
    else break;
  }
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[Math.min(i + 1, KEYFRAMES.length - 1)];
  if (a === b || a.p === b.p) return a[channel];
  const t = (p - a.p) / (b.p - a.p);
  return THREE.MathUtils.lerp(a[channel], b[channel], smoothStep(t));
}

// ──────────────────────────────────────────────
// MODEL HELPERS
// ──────────────────────────────────────────────

// Target world dimensions of tower A (after fitHeight scaling). Tower B
// is then non-uniformly scaled to occupy the *exact same* bounding box
// in world space — so the A→B cross-fade reads as one model morphing into
// its cut-away version in place, not as a swap to a smaller/wider object.
//
// Without this match, the two GLB files differ in aspect ratio (A is
// taller-narrower locally, B is shorter-wider) and the swap moment shows
// a visible jump in silhouette + position.
const TARGET_HEIGHT = 4.5;
// B's bbox includes the empty "cut" zone, so visible solid material is
// optically narrower than A's. Compensate by giving B a wider bbox so the
// perceived width matches A during the swap.
const TARGET_WIDTH = 1.25;

/**
 * Prepare a loaded GLB scene for use in the story.
 *
 * Steps:
 *   1. Deep-clone so each instance owns its materials.
 *   2. For every mesh, call `geometry.center()` — translates vertices so
 *      the bounding box centre lands at local (0,0,0). Rotations pivot
 *      through the visual centre.
 *   3. Enable transparency on standard materials so opacity-fades work.
 *   4. Place the base at world Y=0.
 *   5. Scale:
 *      • `matchA = false` (default): uniform fitHeight — used for tower A.
 *      • `matchA = true`: non-uniform scale that fits BOTH width and
 *        height to A's world dimensions. The cross-section gets stretched
 *        slightly in Y because its local aspect differs from A — the
 *        trade-off is that the silhouettes align perfectly.
 */
function prepareModel(scene: THREE.Group, matchA = false): THREE.Group {
  const cloned = scene.clone(true);

  cloned.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const applyMat = (mat: THREE.Material) => {
      const std = mat as THREE.MeshStandardMaterial;
      if (std.isMeshStandardMaterial) {
        std.transparent = true;
        std.side = THREE.DoubleSide;
        std.depthWrite = true;
        std.needsUpdate = true;
      }
    };
    if (Array.isArray(mesh.material)) {
      (mesh.material as THREE.Material[]).forEach(applyMat);
    } else if (mesh.material) {
      applyMat(mesh.material as THREE.Material);
    }

    mesh.geometry.center();
  });

  const bbox = new THREE.Box3().setFromObject(cloned);
  const size = bbox.getSize(new THREE.Vector3());
  cloned.position.y = -bbox.min.y;

  const wrapper = new THREE.Group();
  wrapper.add(cloned);

  if (matchA) {
    // Non-uniform scale: width AND height land exactly on A's world size.
    const sx = TARGET_WIDTH / size.x;
    const sy = TARGET_HEIGHT / size.y;
    // Scale depth (Z) with the height factor so the interior keeps a
    // natural depth proportion rather than getting flattened.
    wrapper.scale.set(sx, sy, sy);
  } else {
    wrapper.scale.setScalar(TARGET_HEIGHT / size.y);
  }
  return wrapper;
}

function setGroupOpacity(group: THREE.Group, opacity: number) {
  group.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const m = obj as THREE.Mesh;
    const apply = (mat: THREE.Material) => {
      const std = mat as THREE.MeshStandardMaterial;
      if (std.isMeshStandardMaterial) std.opacity = opacity;
    };
    if (Array.isArray(m.material)) {
      (m.material as THREE.Material[]).forEach(apply);
    } else if (m.material) {
      apply(m.material as THREE.Material);
    }
  });
}

// ──────────────────────────────────────────────
// TOWERS — both centred at world (0, 0, 0), animated by sampleTrack.
// ──────────────────────────────────────────────

function TowerA() {
  const { scene } = useGLTF("/models/tower.glb");
  const ref = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const processed = useMemo(() => prepareModel(scene), [scene]);

  useFrame(() => {
    if (!ref.current) return;
    const p = scroll.offset;
    const opacity = sampleTrack(p, "opacityA");
    setGroupOpacity(ref.current, opacity);
    ref.current.visible = opacity > 0.02;
    ref.current.rotation.y = sampleTrack(p, "rotationA");
  });

  return (
    <group ref={ref}>
      <primitive object={processed} />
    </group>
  );
}

function TowerB() {
  const { scene } = useGLTF("/models/tower-section.glb");
  const ref = useRef<THREE.Group>(null);
  const scroll = useScroll();
  // Match A's exact world dimensions (width AND height) via non-uniform
  // scaling. This makes the A→B cross-fade look like the same tower
  // transforming into its cut-away version — same silhouette, same
  // position, same base & top heights.
  const processed = useMemo(() => prepareModel(scene, true), [scene]);

  useFrame(() => {
    if (!ref.current) return;
    const p = scroll.offset;
    const opacity = sampleTrack(p, "opacityB");
    setGroupOpacity(ref.current, opacity);
    ref.current.visible = opacity > 0.02;
    // B does not rotate — its head-on pose matches A's final rotation
    // of 2π (≡ 0 visually), so the cross-fade reads as A morphing into B.
  });

  return (
    <group ref={ref}>
      <primitive object={processed} />
    </group>
  );
}

// ──────────────────────────────────────────────
// CAMERA RIG — every frame, sample the keyframe table and apply it.
// ──────────────────────────────────────────────

function CameraRig() {
  const scroll = useScroll();
  const { size } = useThree();
  useFrame((state) => {
    const p = scroll.offset;
    const aspect = size.width / Math.max(size.height, 1);
    const isPortrait = aspect < 0.85;

    // On portrait viewports (mobile) the horizontal field of view shrinks
    // dramatically. Two adjustments keep the scene readable:
    //   • Pull camera back proportionally so the tower fits horizontally.
    //   • Shift the look target right (= tower drifts LEFT on screen) so
    //     the text panel below has room to breathe.
    const distanceFactor = isPortrait ? Math.min(1 / aspect, 1.8) : 1;
    const lookShift = isPortrait ? 0.55 : 0;

    state.camera.position.set(
      sampleTrack(p, "camX") + lookShift,
      sampleTrack(p, "camY"),
      sampleTrack(p, "camZ") * distanceFactor
    );
    state.camera.lookAt(
      sampleTrack(p, "lookX") + lookShift,
      sampleTrack(p, "lookY"),
      0
    );
  });
  return null;
}

// ──────────────────────────────────────────────
// FIRES — hearth (inside cross-section) and signal (upper window of A).
// Base intensity from the keyframe table; per-frame flicker adds life.
// ──────────────────────────────────────────────

function HearthFire() {
  const lightRef = useRef<THREE.PointLight>(null);
  const flameA = useRef<THREE.Mesh>(null);
  const flameB = useRef<THREE.Mesh>(null);
  const emberRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame((state) => {
    const p = scroll.offset;
    const t = state.clock.elapsedTime;
    const vis = sampleTrack(p, "hearthFire");
    const flicker =
      0.82 + Math.sin(t * 11) * 0.1 + Math.sin(t * 7.3 + 1.2) * 0.06;

    if (lightRef.current) lightRef.current.intensity = vis * 1.8 * flicker;
    if (emberRef.current) emberRef.current.scale.setScalar(vis * flicker);
    if (flameA.current) {
      const sc = (1 + Math.sin(t * 9) * 0.18) * vis * flicker;
      flameA.current.scale.set(sc * 0.6, sc * 1, sc * 0.6);
    }
    if (flameB.current) {
      const sc = (1 + Math.sin(t * 11 + 1.4) * 0.22) * vis * flicker;
      flameB.current.scale.set(sc * 0.4, sc * 0.8, sc * 0.4);
    }
  });

  return (
    <group position={[0, 0.2, 0]}>
      <mesh ref={emberRef} position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.1, 14, 14]} />
        <meshStandardMaterial
          color="#ff7a30"
          emissive="#ff5510"
          emissiveIntensity={3.5}
          transparent
          opacity={0.95}
        />
      </mesh>
      <mesh ref={flameA} position={[0, 0.3, 0]}>
        <coneGeometry args={[0.14, 0.32, 8]} />
        <meshStandardMaterial
          color="#ff9040"
          emissive="#ff6020"
          emissiveIntensity={4}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={flameB} position={[0, 0.42, 0]}>
        <coneGeometry args={[0.09, 0.24, 8]} />
        <meshStandardMaterial
          color="#ffd080"
          emissive="#ffb050"
          emissiveIntensity={5}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 0.3, 0]}
        color="#ff8c44"
        distance={3}
        intensity={0}
      />
    </group>
  );
}

// Window of A is roughly at this position (scene units, post-fit scale).
const WINDOW_Y = 3.7;
const WINDOW_Z = 0.48;
const WINDOW_X = 0;

function SignalFire() {
  const torchLight = useRef<THREE.PointLight>(null);
  const torchGlow = useRef<THREE.Mesh>(null);
  const torchTongue = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame((state) => {
    const p = scroll.offset;
    const t = state.clock.elapsedTime;
    const vis = sampleTrack(p, "signalFire");
    const flicker =
      0.7 +
      Math.sin(t * 13) * 0.18 +
      Math.sin(t * 9.2 + 0.7) * 0.1 +
      Math.sin(t * 22.3 + 1.9) * 0.05;

    if (torchLight.current) {
      torchLight.current.intensity = vis * 3.2 * flicker;
    }
    if (torchGlow.current) {
      const sc = vis * (0.7 + flicker * 0.35);
      torchGlow.current.scale.set(sc * 0.5, sc, sc * 0.5);
    }
    if (torchTongue.current) {
      const sc = vis * (0.6 + flicker * 0.4);
      torchTongue.current.scale.set(sc * 0.35, sc * 0.7, sc * 0.35);
      torchTongue.current.position.y =
        WINDOW_Y + 0.06 + Math.sin(t * 7) * 0.015;
    }
  });

  return (
    <group>
      <mesh ref={torchGlow} position={[WINDOW_X, WINDOW_Y, WINDOW_Z]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial
          color="#fff0c0"
          emissive="#ff7a20"
          emissiveIntensity={8}
          transparent
          opacity={0.95}
        />
      </mesh>
      <mesh ref={torchTongue} position={[WINDOW_X, WINDOW_Y + 0.06, WINDOW_Z]}>
        <coneGeometry args={[0.05, 0.1, 8]} />
        <meshStandardMaterial
          color="#ffd070"
          emissive="#ffa040"
          emissiveIntensity={9}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>
      <pointLight
        ref={torchLight}
        position={[WINDOW_X, WINDOW_Y, WINDOW_Z - 0.1]}
        color="#ff8c44"
        distance={3}
        decay={1.5}
        intensity={0}
      />
    </group>
  );
}

// ──────────────────────────────────────────────
// SCENE + HTML + EXPORT
// ──────────────────────────────────────────────

function Mist() {
  return (
    <mesh position={[0, 2.2, -7]}>
      <planeGeometry args={[40, 18]} />
      <meshBasicMaterial
        color="#0c0805"
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#0c0805"]} />
      <fog attach="fog" args={["#0c0805", 10, 24]} />

      {/* Lighting tuned for VOLUMETRIC window depth — low ambient + low
          fill so the recessed slits in the walls fall into deep shadow.
          The main directional is stronger to keep the lit faces readable. */}
      <ambientLight intensity={0.15} />
      <directionalLight
        position={[5, 7, 4]}
        intensity={2.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={7}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0002}
      />
      {/* Warm rim light from the back-left — gives windows on the far
          side a soft edge instead of going pitch-black. */}
      <directionalLight position={[-6, 4, -5]} intensity={0.35} color="#b08866" />
      {/* Tiny bounce from below to keep the base from going totally flat. */}
      <directionalLight position={[0, -1, 4]} intensity={0.12} />

      <Suspense fallback={null}>
        <TowerA />
        <TowerB />
        <SignalFire />
        <Mist />
        {/* Dimmer HDR fill — lets the directional light shape the windows
            properly instead of washing the recesses with even ambient. */}
        <Environment preset="dawn" environmentIntensity={0.4} />
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.55}
          scale={6}
          blur={2.8}
          far={3}
        />
      </Suspense>

      <CameraRig />

      {/* SSAO via N8AO — darkens crevices and recessed window slits so
          the wall reads as truly 3D rather than a flat painted texture.
          • aoRadius — how far to search for occluders (≈ window depth)
          • intensity — strength of the darkening
          • distanceFalloff — how quickly AO fades with distance
          • quality "medium" balances visuals and frame-rate */}
      <EffectComposer multisampling={0} enableNormalPass>
        <N8AO
          aoRadius={0.4}
          distanceFalloff={0.5}
          intensity={4}
          quality="medium"
          color="black"
          halfRes={false}
        />
      </EffectComposer>
    </>
  );
}

function StoryHtml() {
  return (
    <Scroll html style={{ width: "100%" }}>
      {/* Back button positioned BELOW the global sticky header (~60-70px
          tall) so it isn't hidden behind it on either mobile or desktop. */}
      <div className="fixed left-4 top-20 z-50 md:left-8 md:top-24">
        <LocalizedLink
          href="/istorii"
          className="inline-flex items-center gap-2 rounded-full border border-amber-100/15 bg-amber-950/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-amber-100/80 backdrop-blur transition hover:border-amber-100/40 hover:bg-amber-950 hover:text-white"
        >
          ← Назад
        </LocalizedLink>
      </div>

      {SECTIONS.map((section, idx) => {
        const isRight = idx % 2 === 1;
        return (
          <section
            key={section.id}
            className="pointer-events-none flex items-end justify-start px-4 pb-16 md:items-center md:justify-center md:px-4 md:pb-0"
            style={{
              position: "absolute",
              top: `${idx * 100}vh`,
              left: 0,
              right: 0,
              height: "100vh",
            }}
          >
            {/* Bottom gradient on mobile only — adds contrast for the
                text panel without obscuring the 3D scene above. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0c0805] via-[#0c0805]/70 to-transparent md:hidden"
            />
            <div
              className={[
                "pointer-events-auto relative w-full max-w-[92vw] md:max-w-lg",
                isRight
                  ? "md:ml-auto md:mr-12 lg:mr-24"
                  : "md:mr-auto md:ml-12 lg:ml-24",
              ].join(" ")}
            >
              <div className="text-amber-50 [text-shadow:0_2px_18px_rgba(0,0,0,0.85),0_0_4px_rgba(0,0,0,0.6)]">
                {section.kicker ? (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-300 sm:text-[11px] md:text-sm md:tracking-[0.3em]">
                    {section.kicker}
                  </p>
                ) : null}
                <h2 className="mt-2 font-display text-[22px] font-semibold leading-[1.15] tracking-tight sm:mt-3 sm:text-3xl md:mt-4 md:text-5xl md:leading-tight">
                  {section.title}
                </h2>
                <p className="mt-3 text-[14px] leading-[1.55] text-amber-50/95 sm:mt-4 sm:text-base sm:leading-[1.65] md:mt-6 md:text-xl md:leading-[1.7]">
                  {section.body}
                </p>
              </div>
            </div>
          </section>
        );
      })}

      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-widest text-amber-100/50"
        style={{ top: "92vh" }}
      >
        ↓ Скролл
      </div>
    </Scroll>
  );
}

export function TowerStory() {
  return (
    <div className="fixed inset-0 h-[100svh] w-full overflow-hidden bg-[#0c0805]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2.5, 11], fov: 32, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
      >
        <ScrollControls pages={TOTAL_PAGES} damping={0.25} distance={1}>
          <Scene />
          <StoryHtml />
        </ScrollControls>
      </Canvas>

      <Loader
        containerStyles={{ background: "rgba(12, 8, 5, 0.92)" }}
        innerStyles={{ background: "#783f04" }}
        barStyles={{ background: "#f3ead4" }}
        dataStyles={{
          color: "#f3ead4",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: 500,
          letterSpacing: "0.05em",
        }}
        dataInterpolation={(p) => `Загрузка башни… ${p.toFixed(0)}%`}
      />
    </div>
  );
}
