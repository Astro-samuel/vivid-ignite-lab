import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Ring({ progress, color, radius = 1 }: { progress: number; color: string; radius?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const arc = useMemo(() => Math.max(0.01, (progress / 100) * Math.PI * 2), [progress]);
  const geo = useMemo(() => new THREE.TorusGeometry(radius, 0.08, 8, 64, arc), [radius, arc]);
  const bgGeo = useMemo(() => new THREE.TorusGeometry(radius, 0.04, 8, 64), [radius]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = -Math.PI / 2 + Math.sin(clock.getElapsedTime() * 0.3) * 0.05;
    }
  });

  return (
    <group>
      <mesh geometry={bgGeo}>
        <meshStandardMaterial color="hsl(232, 40%, 18%)" transparent opacity={0.5} />
      </mesh>
      <mesh ref={meshRef} geometry={geo} rotation={[0, 0, -Math.PI / 2]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

interface ProgressRing3DProps {
  progress: number;
  color?: string;
  label?: string;
  value?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ProgressRing3D({
  progress,
  color = "hsl(182, 45%, 45%)",
  label,
  value,
  className,
  style,
}: ProgressRing3DProps) {
  return (
    <div className={`relative ${className || ""}`} style={{ width: 120, height: 120, ...style }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 35 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[2, 2, 3]} intensity={0.5} />
        <Ring progress={progress} color={color} />
      </Canvas>
      {(label || value) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {value && (
            <span className="text-lg font-bold font-orbitron" style={{ color }}>
              {value}
            </span>
          )}
          {label && (
            <span className="text-xs" style={{ color: "hsl(228, 20%, 55%)" }}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
