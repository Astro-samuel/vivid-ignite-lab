import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const COMPONENT_SHAPES: Record<string, { geometry: () => THREE.BufferGeometry; color: string }> = {
  Microcontroller: {
    geometry: () => new THREE.BoxGeometry(1.2, 0.2, 0.8),
    color: "hsl(182, 45%, 45%)",
  },
  Sensor: {
    geometry: () => new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8),
    color: "hsl(150, 40%, 45%)",
  },
  Actuator: {
    geometry: () => new THREE.CylinderGeometry(0.4, 0.4, 0.6, 16),
    color: "hsl(45, 40%, 50%)",
  },
  Display: {
    geometry: () => new THREE.BoxGeometry(1, 0.6, 0.1),
    color: "hsl(284, 35%, 55%)",
  },
  LED: {
    geometry: () => new THREE.SphereGeometry(0.3, 16, 16),
    color: "hsl(0, 70%, 50%)",
  },
  Motor: {
    geometry: () => new THREE.TorusGeometry(0.35, 0.15, 8, 16),
    color: "hsl(45, 40%, 50%)",
  },
  Default: {
    geometry: () => new THREE.IcosahedronGeometry(0.5, 0),
    color: "hsl(182, 45%, 45%)",
  },
};

function ComponentModel({ type }: { type: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const config = COMPONENT_SHAPES[type] || COMPONENT_SHAPES.Default;
  const geo = useMemo(() => config.geometry(), [config]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
  });

  return (
    <mesh ref={meshRef} geometry={geo}>
      <meshStandardMaterial
        color={config.color}
        metalness={0.4}
        roughness={0.3}
        emissive={config.color}
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

interface Component3DViewerProps {
  type: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Component3DViewer({ type, className, style }: Component3DViewerProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", ...style }}>
      <Canvas
        camera={{ position: [0, 0.5, 2.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 3, 3]} intensity={0.8} color="hsl(182, 45%, 60%)" />
        <pointLight position={[-3, -1, 2]} intensity={0.4} color="hsl(284, 35%, 55%)" />
        <Suspense fallback={null}>
          <ComponentModel type={type} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
