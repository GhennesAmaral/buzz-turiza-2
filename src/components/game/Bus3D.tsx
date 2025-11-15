import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Bus3DProps {
  speed: number;
  position: number; // 0-1 (progresso na rota)
  lanePosition: number; // -1 (esquerda), 0 (centro), 1 (direita)
  onPositionChange?: (position: number) => void;
}

export function Bus3D({ speed, position, lanePosition }: Bus3DProps) {
  const busRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);

  useFrame((state, delta) => {
    if (!busRef.current) return;

    // Rotaciona as rodas baseado na velocidade
    const rotationSpeed = (speed / 80) * delta * 10;
    wheelsRef.current.forEach(wheel => {
      if (wheel) {
        wheel.rotation.x += rotationSpeed;
      }
    });

    // Animação de balanço suave
    busRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    busRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.05;

    // Suaviza movimento lateral
    const targetX = lanePosition * 1.5;
    busRef.current.position.x = THREE.MathUtils.lerp(
      busRef.current.position.x,
      targetX,
      delta * 5
    );

    // Inclina o ônibus ao virar
    busRef.current.rotation.z = -lanePosition * 0.1;
  });

  return (
    <group ref={busRef} position={[0, 0.5, 0]}>
      {/* Corpo do ônibus */}
      <mesh castShadow>
        <boxGeometry args={[2, 1.5, 5]} />
        <meshStandardMaterial color="#0066CC" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Teto */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[2, 0.2, 5]} />
        <meshStandardMaterial color="#004499" />
      </mesh>

      {/* Janelas laterais */}
      {[-0.9, 0.9].map((x, i) => (
        <group key={i} position={[x, 0.3, 0]}>
          {[-1.5, -0.5, 0.5, 1.5].map((z, j) => (
            <mesh key={j} position={[0, 0, z]}>
              <boxGeometry args={[0.1, 0.6, 0.7]} />
              <meshStandardMaterial 
                color="#87CEEB" 
                transparent 
                opacity={0.6}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Para-brisa frontal */}
      <mesh position={[0, 0.3, 2.6]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[1.8, 0.8, 0.1]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Rodas */}
      {[
        [-0.8, -0.6, 1.8],
        [0.8, -0.6, 1.8],
        [-0.8, -0.6, -1.8],
        [0.8, -0.6, -1.8]
      ].map((pos, i) => (
        <group 
          key={i} 
          position={pos as [number, number, number]}
          ref={(el) => {
            if (el) wheelsRef.current[i] = el;
          }}
        >
          {/* Pneu */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          {/* Roda */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.35, 16]} />
            <meshStandardMaterial color="#666666" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Faróis */}
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 0, 2.6]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial 
            color="#FFFF00" 
            emissive="#FFFF00"
            emissiveIntensity={0.5}
          />
          <pointLight color="#FFFF00" intensity={0.5} distance={10} />
        </mesh>
      ))}

      {/* Lanternas traseiras */}
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 0, -2.6]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial 
            color="#FF0000" 
            emissive="#FF0000"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {/* Logo Turiza */}
      <mesh position={[0, 0.5, 2.55]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1, 0.3]} />
        <meshStandardMaterial color="#FF6B00" />
      </mesh>
    </group>
  );
}
