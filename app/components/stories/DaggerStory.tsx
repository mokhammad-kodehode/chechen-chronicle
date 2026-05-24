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
// Narrative — 4 sections of product-photography-style story.
// Each section anchors a different camera angle / macro-focus on the
// hand-crafted dagger.
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
    kicker: "КИНЖАЛ",
    title: "Сердце мужчины",
    body: "Кама — прямой обоюдоострый кинжал. На Кавказе его форма устоялась к XVII веку и осталась почти неизменной до начала XX. Горец получал кинжал ещё ребёнком и носил не снимая — знак мужчины, воина и хозяина.",
  },
  {
    id: "blade",
    kicker: "СТАЛЬ",
    title: "Прямой клинок",
    body: "Длина 30-50 см. Симметричный, обоюдоострый, с продольным ребром или долом. Не для размашистого удара — для прямого толчка и точной работы. Сталь делали кузнецы рода, имя клинка наследовалось через поколения.",
  },
  {
    id: "hilt",
    kicker: "ЧЕСТЬ",
    title: "Серебро с чернью",
    body: "Чужому кинжал не дарили. Полностью «одетый» — рукоять и ножны в серебре с чернью, с золотой всечкой — он стоил дороже хорошего коня. Чеченские мастера перенимали кабардинские узоры и выработали свой стиль.",
  },
  {
    id: "memory",
    kicker: "СЛОВО",
    title: "Помнили как друга",
    body: "Кинжал упоминали в песнях, пословицах, преданиях. Его не описывали словом «оружие» — называли по имени, как живого. Унаследованный клинок передавал не только сталь, но и память об отце, деде, прадеде, чьи руки держали ту же рукоять.",
  },
];

const TOTAL_PAGES = SECTIONS.length;

// Single hero model — the more detailed of the two Meshy exports.
useGLTF.preload("/models/dagger-2.glb");

// ──────────────────────────────────────────────
// TIMELINE — cinematic camera moves around a single hero dagger.
// Slow drifts + macro close-ups, like product photography on rails.
//
// `rigYaw`/`rigPitch` rotate the whole dagger so the camera doesn't
// need to circle it — the model presents itself to the lens. This is
// the 2025 trend (Apple Vision, Vercel ship pages): subject rotates,
// camera mostly stays still, only depth and look-at shift.
// ──────────────────────────────────────────────

type Keyframe = {
  p: number;
  camX: number;
  camY: number;
  camZ: number;
  lookX: number;
  lookY: number;
  rigYaw: number;   // Y rotation of the dagger
  rigPitch: number; // X rotation of the dagger (subtle tilt)
};

const KEYFRAMES: Keyframe[] = [
  // Sec 1 — INTRO (p=0): wide hero shot, dagger held at gentle 3/4 angle
  // with plenty of breathing room around the blade.
  {
    p: 0.0,
    camX: 0, camY: 0.2, camZ: 7.5,
    lookX: 0, lookY: 0,
    rigYaw: -Math.PI / 6,
    rigPitch: 0.08,
  },
  // Drift in — slow approach, dagger barely turns. Still wide enough
  // that the whole blade reads.
  {
    p: 0.22,
    camX: 0, camY: 0.2, camZ: 6.0,
    lookX: 0, lookY: 0,
    rigYaw: -Math.PI / 8,
    rigPitch: 0.05,
  },
  // Sec 2 — BLADE (p=0.333): macro on the blade. Camera slides down,
  // dagger rotates to present its edge.
  {
    p: 0.333,
    camX: 0, camY: -0.8, camZ: 2.4,
    lookX: 0, lookY: -0.8,
    rigYaw: Math.PI / 12,
    rigPitch: -0.1,
  },
  // Travel up the blade — camera pans up, dagger rotates further.
  {
    p: 0.5,
    camX: 0, camY: 0.3, camZ: 2.2,
    lookX: 0, lookY: 0.3,
    rigYaw: Math.PI / 6,
    rigPitch: 0,
  },
  // Sec 3 — HILT (p=0.667): macro on the silver hilt + engravings.
  {
    p: 0.667,
    camX: 0, camY: 1.4, camZ: 2.0,
    lookX: 0, lookY: 1.4,
    rigYaw: Math.PI / 4,
    rigPitch: 0.05,
  },
  // Rotate around the hilt to catch the pommel.
  {
    p: 0.83,
    camX: 0, camY: 1.6, camZ: 2.2,
    lookX: 0, lookY: 1.5,
    rigYaw: -Math.PI / 3,
    rigPitch: 0.1,
  },
  // Sec 4 — MEMORY (p=1.0): pull back to a wide, settled hero shot.
  {
    p: 1.0,
    camX: 0, camY: 0.4, camZ: 8.0,
    lookX: 0, lookY: 0.2,
    rigYaw: -Math.PI / 8,
    rigPitch: 0.06,
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
// Meshy's hero export is horizontal (long axis = X) and not perfectly
// centred. We:
//   1. Centre geometry (via BufferGeometry.center()).
//   2. Rotate so the dagger presents diagonally at default — looks like
//      it's been laid on a table for inspection.
//   3. Scale to a target on-screen size.
//
// The result lives inside a rotatable "rig" group whose yaw/pitch is
// driven by the keyframe table.
// ──────────────────────────────────────────────

function prepareDagger(scene: THREE.Group): THREE.Group {
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
        // Crank metallic where the AI exporter under-set it. The bloom
        // pass then catches the silver inlay nicely.
        std.envMapIntensity = 1.2;
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

  // Recompute bbox after centring; scale to ~3 units on its longest axis.
  const bbox = new THREE.Box3().setFromObject(cloned);
  const size = bbox.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z);

  const wrapper = new THREE.Group();
  wrapper.add(cloned);
  wrapper.scale.setScalar(3.0 / longest);
  return wrapper;
}

function DaggerRig() {
  const { scene } = useGLTF("/models/dagger-2.glb");
  const rigRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const prepared = useMemo(() => prepareDagger(scene), [scene]);

  useFrame(() => {
    if (!rigRef.current) return;
    const p = scroll.offset;
    rigRef.current.rotation.y = sampleTrack(p, "rigYaw");
    rigRef.current.rotation.x = sampleTrack(p, "rigPitch");
  });

  return (
    <group ref={rigRef}>
      <primitive object={prepared} />
    </group>
  );
}

function CameraRig() {
  const scroll = useScroll();
  const { size } = useThree();
  useFrame((state) => {
    const p = scroll.offset;
    const aspect = size.width / Math.max(size.height, 1);
    const isPortrait = aspect < 0.85;
    // On portrait mobile pull back so the dagger fits the frame.
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

// ──────────────────────────────────────────────
// SCENE
//
// Lighting tuned for a metal hero shot:
//   • Low ambient so blacks stay deep.
//   • Strong warm key light (top-right) — catches the silver inlay.
//   • Cool back-rim (top-left, slightly blueish) — separates the blade
//     from the dark background.
//   • Soft bounce from below — keeps the underside readable.
// Postprocessing: AO for crevices + bloom for metallic highlights +
// vignette for cinematic edge falloff.
// ──────────────────────────────────────────────

function Scene() {
  return (
    <>
      <color attach="background" args={["#08060a"]} />
      <fog attach="fog" args={["#08060a", 6, 18]} />

      <ambientLight intensity={0.12} />
      {/* Warm key — top-right, throws shadows */}
      <directionalLight
        position={[3, 5, 3]}
        intensity={2.8}
        color="#fff1d8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0002}
      />
      {/* Cool rim — back-left, defines silhouette */}
      <directionalLight
        position={[-4, 2, -3]}
        intensity={1.1}
        color="#8aa9c7"
      />
      {/* Subtle bounce — base fill */}
      <directionalLight position={[0, -2, 3]} intensity={0.25} color="#b08866" />

      <Suspense fallback={null}>
        <DaggerRig />
        <Environment preset="warehouse" environmentIntensity={0.55} />
        <ContactShadows
          position={[0, -1.8, 0]}
          opacity={0.65}
          scale={6}
          blur={2.6}
          far={3}
        />
      </Suspense>

      <CameraRig />

      <EffectComposer multisampling={0} enableNormalPass>
        <N8AO
          aoRadius={0.18}
          distanceFalloff={0.4}
          intensity={3}
          quality="medium"
          color="black"
        />
        <Bloom
          intensity={0.55}
          luminanceThreshold={0.78}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.3} darkness={0.65} />
      </EffectComposer>
    </>
  );
}

// ──────────────────────────────────────────────
// HTML overlay — same pattern as the tower/warrior stories: floating
// text panels positioned per section, with a bottom gradient on mobile
// for readability.
// ──────────────────────────────────────────────

function StoryHtml() {
  return (
    <Scroll html style={{ width: "100%" }}>
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
              top: `${idx * 100}svh`,
              left: 0,
              right: 0,
              height: "100svh",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#08060a] via-[#08060a]/70 to-transparent md:hidden"
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

export function DaggerStory() {
  return (
    <div className="fixed inset-0 h-[100svh] w-full overflow-hidden bg-[#08060a]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.2, 7.5], fov: 32, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
      >
        <ScrollControls pages={TOTAL_PAGES} damping={0.25} distance={1}>
          <Scene />
          <StoryHtml />
        </ScrollControls>
      </Canvas>

      <Loader
        containerStyles={{ background: "rgba(8, 6, 10, 0.92)" }}
        innerStyles={{ background: "#783f04" }}
        barStyles={{ background: "#f3ead4" }}
        dataStyles={{
          color: "#f3ead4",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: 500,
          letterSpacing: "0.05em",
        }}
        dataInterpolation={(p) => `Загрузка кинжала… ${p.toFixed(0)}%`}
      />
    </div>
  );
}
