"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Center,
  useGLTF,
  Loader,
} from "@react-three/drei";
import * as THREE from "three";

type Props = {
  /** URL to .glb file. If provided, loaded via GLTFLoader. */
  modelUrl?: string;
  /** Auto-rotate model when user hasn't interacted yet. */
  autoRotate?: boolean;
};

// ──────────────────────────────────────────────
// GLTF (.glb) model loader — used when user uploads a Meshy/Tripo3D model.
// Model is automatically centered and scaled to fit the viewport.
// ──────────────────────────────────────────────

function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);

  // Clone scene so re-renders don't mutate the cached one
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    if (!ref.current) return;
    // Make sure shadows are cast/received on every mesh
    ref.current.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.castShadow = true;
        m.receiveShadow = true;
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat?.isMeshStandardMaterial) {
          // Slight metallic tint typical for ancient silver/copper coins
          mat.envMapIntensity = 1.1;
        }
      }
    });

    // Auto-fit: center & scale so the longest side is ~2.4 units
    const box = new THREE.Box3().setFromObject(ref.current);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.4 / maxDim;
    ref.current.scale.setScalar(scale);
  }, [cloned]);

  return (
    <Center>
      <group ref={ref}>
        <primitive object={cloned} />
      </group>
    </Center>
  );
}

// ──────────────────────────────────────────────
// Fallback: a plain silver coin when no .glb is uploaded yet.
// ──────────────────────────────────────────────

const COIN_RADIUS = 1.25;
const COIN_THICKNESS = 0.16;

function PlainCoin() {
  const bodyGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, COIN_RADIUS, 0, Math.PI * 2, false);
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: COIN_THICKNESS,
      bevelEnabled: true,
      bevelSegments: 8,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      curveSegments: 128,
    });
    geom.translate(0, 0, -COIN_THICKNESS / 2);
    geom.computeVertexNormals();
    return geom;
  }, []);

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#c8c4ba"
          metalness={0.92}
          roughness={0.32}
        />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────────
// Slow auto-rotation that stops once the user interacts.
// ──────────────────────────────────────────────

function AutoRotator({
  enabled,
  target,
}: {
  enabled: boolean;
  target: React.RefObject<THREE.Group | null>;
}) {
  useFrame((_, delta) => {
    if (!enabled || !target.current) return;
    target.current.rotation.y += delta * 0.22;
  });
  return null;
}

// ──────────────────────────────────────────────
// Main viewer
// ──────────────────────────────────────────────

export function CoinViewer({ modelUrl, autoRotate = true }: Props) {
  const [interacted, setInteracted] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.6, 4.5], fov: 30, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        onPointerDown={() => setInteracted(true)}
      >
        <color attach="background" args={["#100804"]} />

        <ambientLight intensity={0.22} />
        <directionalLight
          position={[3.2, 4.5, 3.5]}
          intensity={1.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={3}
          shadow-camera-bottom={-3}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-4, 2.5, -3]} intensity={0.5} />
        <directionalLight position={[0, -2, 2]} intensity={0.2} />
        <pointLight position={[0, 0.5, 3]} intensity={0.4} distance={6} />

        <Suspense fallback={null}>
          <group ref={groupRef}>
            {modelUrl ? <GLTFModel url={modelUrl} /> : <PlainCoin />}
          </group>

          <Environment preset="studio" environmentIntensity={0.9} />

          <ContactShadows
            position={[0, -1.4, 0]}
            opacity={0.55}
            scale={6}
            blur={2.4}
            far={3}
          />
        </Suspense>

        <AutoRotator enabled={autoRotate && !interacted} target={groupRef} />

        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={2.2}
          maxDistance={10}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.7}
        />
      </Canvas>

      <Loader
        containerStyles={{ background: "rgba(16, 8, 4, 0.85)" }}
        innerStyles={{ background: "#783f04" }}
        barStyles={{ background: "#f3ead4" }}
        dataStyles={{
          color: "#f3ead4",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: 500,
          letterSpacing: "0.05em",
        }}
        dataInterpolation={(p) => `Загрузка модели… ${p.toFixed(0)}%`}
      />
    </div>
  );
}
