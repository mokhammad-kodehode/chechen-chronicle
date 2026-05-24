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
import {
  EffectComposer,
  N8AO,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";

// ──────────────────────────────────────────────
// Narrative — 4 sections on the Caucasian watchtower (сторожевая башня).
// Anchored at p = idx / 3 (0, 0.333, 0.667, 1.0).
// ──────────────────────────────────────────────

type Section = {
  id: string;
  kicker: string;
  title: string;
  body: string;
};

const SECTIONS: Section[] = [
  {
    id: "intro",
    kicker: "КРОВЛЯ",
    title: "Башня без шатра",
    body: "Не у всех башен была шатровая крыша. Эта — с плоской боевой площадкой наверху: открытая ровная плита, обнесённая зубцами, с которой видно горизонт во все стороны. Камень тёсан вручную, кладка с уклоном внутрь, без раствора.",
  },
  {
    id: "machicolations",
    kicker: "МАШИКУЛИ",
    title: "Двойной венец",
    body: "Под боевой площадкой — два яруса машикулей: нависающих парапетов с прорезями вниз. Если враг подходил к стене, его поражали сверху прямо в подножие. Двойной ряд закрывал каждую сторону и каждый угол башни.",
  },
  {
    id: "watch",
    kicker: "ДОЗОР",
    title: "Будка наблюдателя",
    body: "На самой вершине — небольшая каменная будка. В ней укрывался дозорный: смотрел на тропы и перевалы, вёл счёт всадникам, читал столбы дыма у соседних башен. Огонь и зеркало превращали взгляд в сигнал — далеко за пределы голоса.",
  },
  {
    id: "memory",
    kicker: "ПАМЯТЬ",
    title: "Камень, который смотрит",
    body: "Башни такого склада ставили на отрогах и в седловинах — там, где открыт обзор и куда ведут тропы. Сторожевая работа давно закончилась, а кладка осталась. И сегодня снизу видно: камни сложены так, что взгляд изнутри ещё цел.",
  },
];

const TOTAL_PAGES = SECTIONS.length;

useGLTF.preload("/models/watchtower.glb");

// ──────────────────────────────────────────────
// TIMELINE — single keyframe table drives camera + tower rotation +
// signal-fire intensity. Same single-source-of-truth pattern as the
// tower / dagger stories.
// ──────────────────────────────────────────────

type Keyframe = {
  p: number;
  camX: number;
  camY: number;
  camZ: number;
  lookX: number;
  lookY: number;
  rigYaw: number;       // Y rotation of the tower rig
  signalFire: number;   // 0..1 — torch at the top
};

const KEYFRAMES: Keyframe[] = [
  // Sec 1 — INTRO (p=0): wide hero, tower at gentle 3/4 angle.
  {
    p: 0.0,
    camX: 0, camY: 2.5, camZ: 9.0,
    lookX: 0, lookY: 2.2,
    rigYaw: -Math.PI / 9,
    signalFire: 0,
  },
  // Drift in — slow approach, model rotates a hair.
  {
    p: 0.22,
    camX: 0, camY: 2.5, camZ: 7.5,
    lookX: 0, lookY: 2.2,
    rigYaw: -Math.PI / 16,
    signalFire: 0,
  },
  // Sec 2 — SIGNAL (p=0.333): camera rises to the top, fire ignites.
  {
    p: 0.333,
    camX: 0, camY: 4.0, camZ: 4.5,
    lookX: 0, lookY: 4.2,
    rigYaw: 0,
    signalFire: 1,
  },
  // Sec 3 — PASS (p=0.667): camera drops to mid-level, model rotates
  // to show the wall and the slits.
  {
    p: 0.667,
    camX: 0, camY: 2.2, camZ: 5.0,
    lookX: 0, lookY: 2.2,
    rigYaw: Math.PI / 6,
    signalFire: 0.6,
  },
  // Sec 4 — MEMORY (p=1.0): pull back to full silhouette, fire fades.
  {
    p: 1.0,
    camX: 0, camY: 2.7, camZ: 10.0,
    lookX: 0, lookY: 2.4,
    rigYaw: -Math.PI / 12,
    signalFire: 0.15,
  },
];

function smoothStep(t: number): number {
  const c = THREE.MathUtils.clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

type Channel = Exclude<keyof Keyframe, "p">;

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
// MODEL PREP
//
// The Meshy export is already vertical (longest axis = Y), so we only
// need to centre the geometry and scale to a target height.
// ──────────────────────────────────────────────

const TARGET_HEIGHT = 4.5;

function prepareWatchtower(scene: THREE.Group): THREE.Group {
  const cloned = scene.clone(true);

  cloned.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const applyMat = (mat: THREE.Material) => {
      const std = mat as THREE.MeshStandardMaterial;
      if (std.isMeshStandardMaterial) {
        std.side = THREE.DoubleSide;
        std.envMapIntensity = 0.6; // stone, not metal — subtle reflection
        std.needsUpdate = true;
      }
    };
    if (Array.isArray(mesh.material)) {
      (mesh.material as THREE.Material[]).forEach(applyMat);
    } else if (mesh.material) {
      applyMat(mesh.material as THREE.Material);
    }

    // Centre vertices so rotations pivot through the visual centre.
    mesh.geometry.center();
  });

  const bbox = new THREE.Box3().setFromObject(cloned);
  const size = bbox.getSize(new THREE.Vector3());
  cloned.position.y = -bbox.min.y; // base at Y=0

  const wrapper = new THREE.Group();
  wrapper.add(cloned);
  wrapper.scale.setScalar(TARGET_HEIGHT / size.y);
  return wrapper;
}

// ──────────────────────────────────────────────
// TOWER RIG — model in a rotatable parent. Yaw driven by keyframes.
// ──────────────────────────────────────────────

function WatchtowerRig() {
  const { scene } = useGLTF("/models/watchtower.glb");
  const rigRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const prepared = useMemo(() => prepareWatchtower(scene), [scene]);

  useFrame(() => {
    if (!rigRef.current) return;
    const p = scroll.offset;
    rigRef.current.rotation.y = sampleTrack(p, "rigYaw");
  });

  return (
    <group ref={rigRef}>
      <primitive object={prepared} />
    </group>
  );
}

// ──────────────────────────────────────────────
// SIGNAL FIRE — small torch at the top of the tower. Visibility envelope
// driven by the keyframe table; per-frame flicker adds life.
// ──────────────────────────────────────────────

// Approximate position of the top window/platform (tune if needed).
const FIRE_X = 0;
const FIRE_Y = 4.2;
const FIRE_Z = 0.35;

function SignalFire() {
  const light = useRef<THREE.PointLight>(null);
  const core = useRef<THREE.Mesh>(null);
  const tongue = useRef<THREE.Mesh>(null);
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

    if (light.current) light.current.intensity = vis * 4.0 * flicker;
    if (core.current) {
      const sc = vis * (0.8 + flicker * 0.3);
      core.current.scale.set(sc, sc, sc);
    }
    if (tongue.current) {
      const sc = vis * (0.7 + flicker * 0.4);
      tongue.current.scale.set(sc * 0.5, sc, sc * 0.5);
      tongue.current.position.y = FIRE_Y + 0.15 + Math.sin(t * 7) * 0.02;
    }
  });

  return (
    <group>
      <mesh ref={core} position={[FIRE_X, FIRE_Y, FIRE_Z]}>
        <sphereGeometry args={[0.08, 14, 14]} />
        <meshStandardMaterial
          color="#fff0c0"
          emissive="#ff8030"
          emissiveIntensity={9}
          transparent
          opacity={0.95}
        />
      </mesh>
      <mesh ref={tongue} position={[FIRE_X, FIRE_Y + 0.15, FIRE_Z]}>
        <coneGeometry args={[0.07, 0.18, 10]} />
        <meshStandardMaterial
          color="#ffd070"
          emissive="#ffa040"
          emissiveIntensity={10}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>
      <pointLight
        ref={light}
        position={[FIRE_X, FIRE_Y, FIRE_Z]}
        color="#ff9a44"
        distance={4}
        decay={1.4}
        intensity={0}
      />
    </group>
  );
}

// ──────────────────────────────────────────────
// CAMERA RIG
// ──────────────────────────────────────────────

function CameraRig() {
  const scroll = useScroll();
  const { size } = useThree();
  useFrame((state) => {
    const p = scroll.offset;
    const aspect = size.width / Math.max(size.height, 1);
    const isPortrait = aspect < 0.85;
    const distanceFactor = isPortrait ? Math.min(1 / aspect, 1.8) : 1;

    state.camera.position.set(
      sampleTrack(p, "camX"),
      sampleTrack(p, "camY"),
      sampleTrack(p, "camZ") * distanceFactor
    );
    state.camera.lookAt(
      sampleTrack(p, "lookX"),
      sampleTrack(p, "lookY"),
      0
    );
  });
  return null;
}

function Mist() {
  return (
    <mesh position={[0, 2.4, -7]}>
      <planeGeometry args={[40, 20]} />
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
      <fog attach="fog" args={["#0c0805", 10, 26]} />

      <ambientLight intensity={0.15} />
      <directionalLight
        position={[5, 7, 4]}
        intensity={2.0}
        color="#fff1d8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={7}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-6, 4, -5]} intensity={0.4} color="#8aa9c7" />
      <directionalLight position={[0, -1, 4]} intensity={0.12} />

      <Suspense fallback={null}>
        <WatchtowerRig />
        <Mist />
        <Environment preset="dawn" environmentIntensity={0.35} />
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.6}
          scale={6}
          blur={2.8}
          far={3}
        />
      </Suspense>

      <CameraRig />

      <EffectComposer multisampling={0} enableNormalPass>
        <N8AO
          aoRadius={0.35}
          distanceFalloff={0.5}
          intensity={3.5}
          quality="medium"
          color="black"
        />
        <Bloom
          intensity={0.45}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.32} darkness={0.6} />
      </EffectComposer>
    </>
  );
}

function StoryHtml() {
  return (
    <Scroll html style={{ width: "100%" }}>
      <div className="fixed left-4 top-20 z-50 md:left-8 md:top-24">
        <LocalizedLink
          href="/istorii/dwellings"
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
              top: `${idx * 100}svh`,
              left: 0,
              right: 0,
              height: "100svh",
            }}
          >
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-300 sm:text-[11px] md:text-sm md:tracking-[0.3em]">
                  {section.kicker}
                </p>
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
        style={{ top: "92svh" }}
      >
        ↓ Скролл
      </div>
    </Scroll>
  );
}

export function WatchtowerStory() {
  return (
    <div className="fixed inset-0 h-[100svh] w-full overflow-hidden bg-[#0c0805]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2.5, 9.0], fov: 32, near: 0.1, far: 100 }}
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
