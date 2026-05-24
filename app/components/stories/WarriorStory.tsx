"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
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
// Narrative — 4 sections. Each panel sits at top = idx * 100vh and is
// fully visible at p = idx / 3.
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
    kicker: "ВОИН",
    title: "Хранитель порога",
    body: "Воин Средневековья на Кавказе — не профессиональный солдат, а защитник рода. Он рос с клинком и землёй: умел пахать, строить башню, искать след в скалах. Война приходила сама — когда сосед терял разум или враг переходил перевал.",
  },
  {
    id: "code",
    kicker: "КОДЕКС",
    title: "Нохчалла — слово, кость и тень",
    body: "Адат связывал воина крепче доспеха. Не предать гостя, не ударить безоружного, не оставить кровь без ответа. Каждое движение клинка имело имя в роду; каждый шрам — историю, которую расскажут внуки.",
  },
  {
    id: "steel",
    kicker: "СТАЛЬ",
    title: "Шашка, кинжал, длинноствол",
    body: "Кавказская сталь не знала позолоты. Шашка била без замаха, кинжал решал спор в шаге. Длинноствольный мушкет — гость с Запада — встал рядом со старым оружием, не заменив его. Воин учился всем трём с детства.",
  },
  {
    id: "memory",
    kicker: "ПАМЯТЬ",
    title: "Имя, которое не стирают ветра",
    body: "Воин умирал, но его имя оставалось вписанным в кладку башни и в песню. Род помнил каждого — кто пал на перевале, кто отвёл удар, кто молча отдал последнюю воду брату. Их сила — не в железе, а в памяти народа.",
  },
];

const TOTAL_PAGES = SECTIONS.length;

useGLTF.preload("/models/warrior.glb");

// ──────────────────────────────────────────────
// TIMELINE — single keyframe table drives camera + rotation.
// Anchors at p = idx / 3 (0, 0.333, 0.667, 1.0).
// ──────────────────────────────────────────────

type Keyframe = {
  p: number;
  camX: number;
  camY: number;
  camZ: number;
  lookX: number;
  lookY: number;
  rotationY: number;
};

const KEYFRAMES: Keyframe[] = [
  // Sec 1 — INTRO (p=0). Full body, slight angle, contemplative.
  {
    p: 0.0,
    camX: 0, camY: 2.3, camZ: 5.0,
    lookX: 0, lookY: 2.0,
    rotationY: -Math.PI / 8,
  },
  // Drift in — keep frame steady, model rotates slowly.
  {
    p: 0.2,
    camX: 0, camY: 2.3, camZ: 5.0,
    lookX: 0, lookY: 2.0,
    rotationY: 0,
  },
  // Sec 2 — CODE (p=0.333). Camera lifts and pulls closer to face/torso.
  {
    p: 0.333,
    camX: 0, camY: 2.7, camZ: 3.5,
    lookX: 0, lookY: 2.7,
    rotationY: Math.PI / 6,
  },
  // Sec 3 — STEEL (p=0.667). Drop to torso/hands, view weapons.
  {
    p: 0.667,
    camX: 0, camY: 2.0, camZ: 3.0,
    lookX: 0, lookY: 1.9,
    rotationY: -Math.PI / 4,
  },
  // Mid — slow turn.
  {
    p: 0.85,
    camX: 0, camY: 2.0, camZ: 3.5,
    lookX: 0, lookY: 2.0,
    rotationY: -Math.PI / 3,
  },
  // Sec 4 — MEMORY (p=1.0). Pull back to wide silhouette, finalpose.
  {
    p: 1.0,
    camX: 0, camY: 2.2, camZ: 6.0,
    lookX: 0, lookY: 2.0,
    rotationY: 0,
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
// MODEL PREP — centre geometry via the canonical BufferGeometry.center()
// so rotations pivot through the visual centre with no horizontal swing.
// Then scale to a fixed display height and place feet at Y=0.
// ──────────────────────────────────────────────

function prepareWarrior(scene: THREE.Group): THREE.Group {
  const cloned = scene.clone(true);

  cloned.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.geometry.center();
  });

  const bbox = new THREE.Box3().setFromObject(cloned);
  const size = bbox.getSize(new THREE.Vector3());
  cloned.position.y = -bbox.min.y;

  const wrapper = new THREE.Group();
  wrapper.add(cloned);
  // Target on-screen height ≈ 3.5 scene units.
  wrapper.scale.setScalar(3.5 / size.y);
  return wrapper;
}

function Warrior() {
  const { scene } = useGLTF("/models/warrior.glb");
  const ref = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const processed = useMemo(() => prepareWarrior(scene), [scene]);

  useFrame(() => {
    if (!ref.current) return;
    const p = scroll.offset;
    ref.current.rotation.y = sampleTrack(p, "rotationY");
  });

  return (
    <group ref={ref}>
      <primitive object={processed} />
    </group>
  );
}

function CameraRig() {
  const scroll = useScroll();
  useFrame((state) => {
    const p = scroll.offset;
    state.camera.position.set(
      sampleTrack(p, "camX"),
      sampleTrack(p, "camY"),
      sampleTrack(p, "camZ")
    );
    state.camera.lookAt(
      sampleTrack(p, "lookX"),
      sampleTrack(p, "lookY"),
      0
    );
  });
  return null;
}

function Backdrop() {
  return (
    <mesh position={[0, 2.2, -7]}>
      <planeGeometry args={[40, 18]} />
      <meshBasicMaterial
        color="#0c0805"
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#0c0805"]} />
      <fog attach="fog" args={["#0c0805", 8, 22]} />

      <ambientLight intensity={0.18} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={5}
        shadow-camera-bottom={-1}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-5, 3, -4]} intensity={0.45} color="#b08866" />
      <directionalLight position={[0, -1, 4]} intensity={0.12} />

      <Suspense fallback={null}>
        <Warrior />
        <Backdrop />
        <Environment preset="dawn" environmentIntensity={0.35} />
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.6}
          scale={4}
          blur={2.4}
          far={2.5}
        />
      </Suspense>

      <CameraRig />

      <EffectComposer multisampling={0} enableNormalPass>
        <N8AO
          aoRadius={0.3}
          distanceFalloff={0.4}
          intensity={4}
          quality="medium"
          color="black"
        />
      </EffectComposer>
    </>
  );
}

function StoryHtml() {
  return (
    <Scroll html style={{ width: "100%" }}>
      {/* Back button positioned BELOW the global sticky header so it
          isn't hidden behind it. */}
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
            className="pointer-events-none flex items-end justify-center px-5 pb-20 md:items-center md:px-4 md:pb-0"
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
                "pointer-events-auto relative w-full max-w-md md:max-w-lg",
                isRight
                  ? "md:ml-auto md:mr-12 lg:mr-24"
                  : "md:mr-auto md:ml-12 lg:ml-24",
              ].join(" ")}
            >
              <div className="text-amber-50 [text-shadow:0_2px_18px_rgba(0,0,0,0.85),0_0_4px_rgba(0,0,0,0.6)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-300 md:text-sm">
                  {section.kicker}
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:mt-4 md:text-5xl">
                  {section.title}
                </h2>
                <p className="mt-4 text-base leading-[1.65] text-amber-50/95 md:mt-6 md:text-xl md:leading-[1.7]">
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

export function WarriorStory() {
  return (
    <div className="fixed inset-0 h-[100svh] w-full overflow-hidden bg-[#0c0805]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2.3, 5], fov: 32, near: 0.1, far: 100 }}
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
        dataInterpolation={(p) => `Загрузка воина… ${p.toFixed(0)}%`}
      />
    </div>
  );
}
