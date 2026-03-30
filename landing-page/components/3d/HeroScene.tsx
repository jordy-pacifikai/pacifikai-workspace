"use client";

import { Suspense, useRef, useMemo, Component, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import Logo3D from "./Logo3D";

/* ============ ERROR BOUNDARY ============ */
class SceneErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/* ============ ORBITAL RINGS ============ */
function Rings() {
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (r1.current) {
      r1.current.rotation.x = t * 0.18;
      r1.current.rotation.z = t * 0.06;
    }
    if (r2.current) {
      r2.current.rotation.y = t * 0.12;
      r2.current.rotation.x = Math.PI / 3 + t * 0.08;
    }
  });

  return (
    <>
      <mesh ref={r1}>
        <torusGeometry args={[1.15, 0.006, 16, 100]} />
        <meshStandardMaterial
          color="#f97066"
          transparent
          opacity={0.25}
          emissive="#f97066"
          emissiveIntensity={0.4}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={r2}>
        <torusGeometry args={[1.45, 0.005, 16, 100]} />
        <meshStandardMaterial
          color="#14b8a6"
          transparent
          opacity={0.18}
          emissive="#14b8a6"
          emissiveIntensity={0.3}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

/* ============ PARTICLES ============ */
function Particles({ count = 120 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    const a = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < a.length; i++) {
      a[i] += (Math.random() - 0.5) * 0.002;
      if (a[i] > 6) a[i] = -6;
      if (a[i] < -6) a[i] = 6;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#f97066"
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ============ MAIN SCENE ============ */
export default function HeroScene() {
  return (
    <SceneErrorBoundary>
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} color="#c4d0e4" />
          <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
          <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#e0e7ff" />
          <pointLight position={[2, 1, 3]} intensity={0.4} color="#f97066" distance={10} />
          <pointLight position={[-2, -1, 2]} intensity={0.3} color="#14b8a6" distance={8} />
          <Environment preset="city" environmentIntensity={0.3} />

          {/* Scene */}
          <Logo3D />
          <Rings />
          <Particles />
        </Suspense>
      </Canvas>
    </div>
    </SceneErrorBoundary>
  );
}
