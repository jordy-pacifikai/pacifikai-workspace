"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Logo3D() {
  const { scene } = useGLTF("/models/logo-3d-hook-draco.glb");
  const groupRef = useRef<THREE.Group>(null);
  const floatRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current || !floatRef.current) return;
    const t = state.clock.elapsedTime;

    // Slow rotation
    groupRef.current.rotation.y = t * 0.15;

    // Mouse parallax
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -state.pointer.y * 0.1,
      0.03
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      state.pointer.x * 0.05,
      0.03
    );

    // Subtle float
    floatRef.current.position.y = Math.sin(t * 0.8) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <group ref={floatRef}>
        <primitive object={scene} scale={0.32} />
      </group>
    </group>
  );
}

useGLTF.preload("/models/logo-3d-hook-draco.glb");
