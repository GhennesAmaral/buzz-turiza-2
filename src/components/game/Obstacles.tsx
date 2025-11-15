import { useMemo } from 'react';
import * as THREE from 'three';
import { Obstacle, ObstacleType } from '../../types/game';
import { Text } from '@react-three/drei';

interface ObstaclesProps {
  obstacles: Obstacle[];
  progress: number;
}

export function Obstacles({ obstacles, progress }: ObstaclesProps) {
  // Filtra obstáculos visíveis (próximos ao jogador)
  const visibleObstacles = useMemo(() => {
    return obstacles.filter(obstacle => {
      const obstacleProgress = obstacle.position * 100;
      const distance = Math.abs(obstacleProgress - progress);
      return distance < 10; // Mostra obstáculos a 10% de distância
    });
  }, [obstacles, progress]);

  const getObstacleModel = (type: ObstacleType, position: THREE.Vector3, active: boolean) => {
    const opacity = active ? 1 : 0.7;

    switch (type) {
      case 'sharp_curve':
        return (
          <group position={position}>
            {/* Placa de curva */}
            <mesh position={[3, 1, 0]}>
              <boxGeometry args={[0.1, 1.5, 1.5]} />
              <meshStandardMaterial color="#FFD700" />
            </mesh>
            <mesh position={[3, 1, 0]}>
              <planeGeometry args={[1.2, 1.2]} />
              <meshStandardMaterial color="#000000" transparent opacity={opacity} />
            </mesh>
            <Text
              position={[3.1, 1, 0]}
              fontSize={0.5}
              color="#FFD700"
              anchorX="center"
              anchorY="middle"
            >
              ⚠
            </Text>
          </group>
        );

      case 'steep_hill':
        return (
          <group position={position}>
            {/* Rampa visual */}
            <mesh rotation={[-Math.PI / 6, 0, 0]}>
              <boxGeometry args={[8, 0.5, 15]} />
              <meshStandardMaterial color="#3a3a3a" transparent opacity={opacity} />
            </mesh>
            <Text
              position={[0, 2, 0]}
              fontSize={0.8}
              color="#FF6B00"
              anchorX="center"
              anchorY="middle"
            >
              SUBIDA
            </Text>
          </group>
        );

      case 'traffic_jam':
        return (
          <group position={position}>
            {/* Carros parados */}
            {[-2, 0, 2].map((x, i) => (
              <mesh key={i} position={[x, 0.5, i * 3]}>
                <boxGeometry args={[1.5, 1, 3]} />
                <meshStandardMaterial 
                  color={['#FF0000', '#0000FF', '#00FF00'][i]} 
                  transparent 
                  opacity={opacity}
                />
              </mesh>
            ))}
            <Text
              position={[0, 3, 0]}
              fontSize={0.8}
              color="#FF0000"
              anchorX="center"
              anchorY="middle"
            >
              CONGESTIONAMENTO
            </Text>
          </group>
        );

      case 'accident':
        return (
          <group position={position}>
            {/* Carro acidentado */}
            <mesh position={[2, 0.5, 0]} rotation={[0, Math.PI / 4, Math.PI / 6]}>
              <boxGeometry args={[1.5, 1, 3]} />
              <meshStandardMaterial color="#8B0000" transparent opacity={opacity} />
            </mesh>
            {/* Cones de sinalização */}
            {[-1, 0, 1].map((x, i) => (
              <mesh key={i} position={[x, 0.3, -2]}>
                <coneGeometry args={[0.3, 0.6, 8]} />
                <meshStandardMaterial color="#FF6B00" />
              </mesh>
            ))}
            <Text
              position={[0, 3, 0]}
              fontSize={0.8}
              color="#FF0000"
              anchorX="center"
              anchorY="middle"
            >
              ACIDENTE!
            </Text>
          </group>
        );

      case 'pothole':
        return (
          <group position={position}>
            {/* Buraco na pista */}
            <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.5, 32]} />
              <meshStandardMaterial color="#1a1a1a" transparent opacity={opacity} />
            </mesh>
            <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.5, 1.8, 32]} />
              <meshStandardMaterial color="#FFD700" />
            </mesh>
          </group>
        );

      case 'rain':
        return (
          <group position={position}>
            {/* Efeito de chuva */}
            {Array.from({ length: 50 }).map((_, i) => (
              <mesh 
                key={i} 
                position={[
                  (Math.random() - 0.5) * 10,
                  Math.random() * 5,
                  (Math.random() - 0.5) * 10
                ]}
              >
                <cylinderGeometry args={[0.02, 0.02, 0.5, 4]} />
                <meshStandardMaterial 
                  color="#87CEEB" 
                  transparent 
                  opacity={0.3 * opacity}
                />
              </mesh>
            ))}
            <Text
              position={[0, 4, 0]}
              fontSize={0.8}
              color="#87CEEB"
              anchorX="center"
              anchorY="middle"
            >
              CHUVA
            </Text>
          </group>
        );

      case 'fog':
        return (
          <group position={position}>
            {/* Névoa visual */}
            {Array.from({ length: 20 }).map((_, i) => (
              <mesh 
                key={i} 
                position={[
                  (Math.random() - 0.5) * 15,
                  Math.random() * 3,
                  (Math.random() - 0.5) * 15
                ]}
              >
                <sphereGeometry args={[1 + Math.random(), 8, 8]} />
                <meshStandardMaterial 
                  color="#CCCCCC" 
                  transparent 
                  opacity={0.2 * opacity}
                />
              </mesh>
            ))}
            <Text
              position={[0, 4, 0]}
              fontSize={0.8}
              color="#CCCCCC"
              anchorX="center"
              anchorY="middle"
            >
              NEBLINA
            </Text>
          </group>
        );

      default:
        return null;
    }
  };

  return (
    <group>
      {visibleObstacles.map((obstacle) => {
        // Calcula posição Z baseado no progresso
        const obstacleProgress = obstacle.position * 100;
        const relativeDistance = (obstacleProgress - progress) / 100;
        const zPosition = relativeDistance * 500; // Escala para visualização

        const position = new THREE.Vector3(0, 0, zPosition);

        return (
          <group key={obstacle.id}>
            {getObstacleModel(obstacle.type, position, obstacle.active)}
          </group>
        );
      })}
    </group>
  );
}
