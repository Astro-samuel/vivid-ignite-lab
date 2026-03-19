import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function FloatingShape({ geometry, position, color, speed, rotationAxis }: {
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  color: string;
  speed: number;
  rotationAxis: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();
  const initialPos = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed;
    meshRef.current.rotation.x += rotationAxis[0] * 0.003;
    meshRef.current.rotation.y += rotationAxis[1] * 0.003;
    meshRef.current.rotation.z += rotationAxis[2] * 0.003;
    // Float motion
    meshRef.current.position.y = initialPos.y + Math.sin(t) * 0.3;
    meshRef.current.position.x = initialPos.x + Math.cos(t * 0.7) * 0.15;
    // Mouse parallax
    meshRef.current.position.x += pointer.x * 0.4;
    meshRef.current.position.y += pointer.y * 0.2;
  });

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.15}
        wireframe
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function Shapes() {
  const icosa = useMemo(() => new THREE.IcosahedronGeometry(0.6, 0), []);
  const octa = useMemo(() => new THREE.OctahedronGeometry(0.5, 0), []);
  const dodeca = useMemo(() => new THREE.DodecahedronGeometry(0.4, 0), []);
  const icosa2 = useMemo(() => new THREE.IcosahedronGeometry(0.35, 1), []);
  const tetra = useMemo(() => new THREE.TetrahedronGeometry(0.45, 0), []);

  const shapes = useMemo(() => [
    { geometry: icosa, position: [-3, 1.5, -2] as [number, number, number], color: "hsl(182, 45%, 45%)", speed: 0.4, rotationAxis: [1, 0.5, 0] as [number, number, number] },
    { geometry: octa, position: [3, -1, -3] as [number, number, number], color: "hsl(284, 35%, 55%)", speed: 0.6, rotationAxis: [0, 1, 0.5] as [number, number, number] },
    { geometry: dodeca, position: [-1.5, -2, -1.5] as [number, number, number], color: "hsl(45, 40%, 50%)", speed: 0.5, rotationAxis: [0.5, 0, 1] as [number, number, number] },
    { geometry: icosa2, position: [2, 2, -2.5] as [number, number, number], color: "hsl(150, 40%, 45%)", speed: 0.35, rotationAxis: [1, 1, 0] as [number, number, number] },
    { geometry: tetra, position: [0, 0, -4] as [number, number, number], color: "hsl(328, 40%, 50%)", speed: 0.45, rotationAxis: [0, 0.5, 1] as [number, number, number] },
    { geometry: octa, position: [-4, 0, -3.5] as [number, number, number], color: "hsl(182, 45%, 35%)", speed: 0.3, rotationAxis: [1, 0, 0.5] as [number, number, number] },
    { geometry: dodeca, position: [4, 1, -4] as [number, number, number], color: "hsl(284, 25%, 45%)", speed: 0.55, rotationAxis: [0.5, 1, 0.5] as [number, number, number] },
  ], [icosa, octa, dodeca, icosa2, tetra]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="hsl(182, 45%, 50%)" />
      <pointLight position={[-5, -3, 3]} intensity={0.3} color="hsl(284, 35%, 55%)" />
      {shapes.map((s, i) => (
        <FloatingShape key={i} {...s} />
      ))}
    </>
  );
}

export default function Scene3DBackground({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className || ""}`} style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Shapes />
      </Canvas>
    </div>
  );
}
