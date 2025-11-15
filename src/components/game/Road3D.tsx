import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Road3DProps {
  progress: number;
  terrain: 'flat' | 'hills' | 'mountains' | 'urban' | 'highway';
  onPositionChange?: (position: { x: number }) => void;
}

export function Road3D({ progress, terrain, onPositionChange }: Road3DProps) {
  const roadRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.Group>(null);
  const curveOffsetRef = useRef(0);
  const obstaclesRef = useRef<Array<{ x: number; z: number; direction: number }>>([]);
  const timeItemsRef = useRef<Array<{ x: number; z: number; collected: boolean }>>([]);

  // Inicializa obstáculos dinâmicos
  useMemo(() => {
    obstaclesRef.current = Array.from({ length: 15 }).map((_, i) => ({
      x: (Math.random() - 0.5) * 6,
      z: -20 - i * 15,
      direction: Math.random() > 0.5 ? 1 : -1
    }));

    timeItemsRef.current = Array.from({ length: 10 }).map((_, i) => ({
      x: (Math.random() - 0.5) * 6,
      z: -30 - i * 20,
      collected: false
    }));
  }, []);

  // Gera curvas dinâmicas baseadas no progresso
  const roadCurve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 100;
    
    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const z = -i * 2;
      
      // Curvas sinusoidais suaves e naturais
      const x = Math.sin(t * Math.PI * 4 + progress * 0.05) * 3;
      
      // Inclinações baseadas no terreno
      let y = 0;
      if (terrain === 'hills') {
        y = Math.sin(t * Math.PI * 3) * 2.5;
      } else if (terrain === 'mountains') {
        y = Math.sin(t * Math.PI * 4) * 5;
      }
      
      points.push(new THREE.Vector3(x, y, z));
    }
    
    return new THREE.CatmullRomCurve3(points);
  }, [progress, terrain]);

  useFrame((state, delta) => {
    if (linesRef.current) {
      // Anima as linhas da estrada
      linesRef.current.position.z += delta * 20;
      if (linesRef.current.position.z > 4) {
        linesRef.current.position.z = 0;
      }
    }

    // Adiciona movimento de curva suave à estrada
    if (roadRef.current) {
      // Curva suave e contínua
      curveOffsetRef.current += delta * 0.3;
      const curveX = Math.sin(curveOffsetRef.current) * 2.5;
      const curveRotation = Math.sin(curveOffsetRef.current) * 0.15;
      
      roadRef.current.position.x = curveX;
      roadRef.current.rotation.z = curveRotation;
    }

    // Anima obstáculos dinâmicos
    obstaclesRef.current.forEach(obstacle => {
      obstacle.x += obstacle.direction * delta * 2;
      if (Math.abs(obstacle.x) > 3.5) {
        obstacle.direction *= -1;
      }
      obstacle.z += delta * 20;
      if (obstacle.z > 10) {
        obstacle.z = -200;
        obstacle.x = (Math.random() - 0.5) * 6;
      }
    });

    // Anima itens de tempo
    timeItemsRef.current.forEach(item => {
      if (!item.collected) {
        item.z += delta * 20;
        if (item.z > 10) {
          item.z = -200;
          item.x = (Math.random() - 0.5) * 6;
          item.collected = false;
        }
      }
    });
  });

  // Material básico compartilhado para reduzir uso de texturas
  const basicRoadMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#3a3a3a',
      roughness: 0.9,
      metalness: 0.1
    }), []
  );

  const shoulderMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#2a2a2a',
      roughness: 0.95
    }), []
  );

  const yellowLineMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#FFFF00',
      emissive: '#FFFF00',
      emissiveIntensity: 0.5
    }), []
  );

  const whiteLineMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#FFFFFF',
      emissive: '#FFFFFF',
      emissiveIntensity: 0.3
    }), []
  );

  const vegetationMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#0d7a0d',
      roughness: 0.8
    }), []
  );

  const obstacleMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#FF6B00',
      emissive: '#FF6B00',
      emissiveIntensity: 0.5,
      metalness: 0.3,
      roughness: 0.7
    }), []
  );

  const timeItemMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#00FF00',
      emissive: '#00FF00',
      emissiveIntensity: 0.8,
      metalness: 0.5,
      roughness: 0.3
    }), []
  );

  return (
    <group ref={roadRef}>
      {/* Estrada principal com textura realista */}
      <mesh receiveShadow position={[0, -0.01, -50]} material={basicRoadMaterial}>
        <planeGeometry args={[8, 200]} />
      </mesh>

      {/* Acostamento lateral esquerdo */}
      <mesh receiveShadow position={[-5, -0.005, -50]} material={shoulderMaterial}>
        <planeGeometry args={[2, 200]} />
      </mesh>

      {/* Acostamento lateral direito */}
      <mesh receiveShadow position={[5, -0.005, -50]} material={shoulderMaterial}>
        <planeGeometry args={[2, 200]} />
      </mesh>

      {/* LINHA PONTILHADA BRANCA ESQUERDA (animada) */}
      <group ref={linesRef}>
        {Array.from({ length: 50 }).map((_, i) => (
          <mesh key={`left-${i}`} position={[-1.9, 0.02, -i * 4]} material={whiteLineMaterial}>
            <boxGeometry args={[0.15, 0.01, 2]} />
          </mesh>
        ))}
      </group>

      {/* LINHA PONTILHADA BRANCA DIREITA (animada) */}
      <group ref={linesRef}>
        {Array.from({ length: 50 }).map((_, i) => (
          <mesh key={`right-${i}`} position={[1.9, 0.02, -i * 4]} material={whiteLineMaterial}>
            <boxGeometry args={[0.15, 0.01, 2]} />
          </mesh>
        ))}
      </group>

      {/* LINHA AMARELA CENTRAL CONTÍNUA (divisória central) */}
      <mesh position={[0, 0.02, -50]} material={yellowLineMaterial}>
        <boxGeometry args={[0.2, 0.01, 200]} />
      </mesh>

      {/* LINHAS BRANCAS CONTÍNUAS LATERAIS (limites da estrada) */}
      {[-3.8, 3.8].map((x, i) => (
        <mesh key={`boundary-${i}`} position={[x, 0.02, -50]} material={whiteLineMaterial}>
          <boxGeometry args={[0.15, 0.01, 200]} />
        </mesh>
      ))}

      {/* OBSTÁCULOS DINÂMICOS (Cones de Trânsito) */}
      {obstaclesRef.current.map((obstacle, i) => (
        <group key={`obstacle-${i}`} position={[obstacle.x, 0, obstacle.z]}>
          <mesh position={[0, 0.5, 0]} material={obstacleMaterial} castShadow>
            <coneGeometry args={[0.3, 1, 8]} />
          </mesh>
          {/* Base do cone */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 0.1, 8]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      ))}

      {/* ITENS COLECIONÁVEIS DE TEMPO (Relógios) */}
      {timeItemsRef.current.map((item, i) => (
        !item.collected && (
          <group key={`time-item-${i}`} position={[item.x, 0.8, item.z]}>
            {/* Relógio rotativo */}
            <mesh rotation={[0, Date.now() * 0.002, 0]} material={timeItemMaterial} castShadow>
              <torusGeometry args={[0.3, 0.1, 16, 32]} />
            </mesh>
            <mesh material={timeItemMaterial}>
              <sphereGeometry args={[0.15, 16, 16]} />
            </mesh>
            {/* Brilho ao redor */}
            <pointLight color="#00FF00" intensity={2} distance={3} />
          </group>
        )
      ))}

      {/* Postes de iluminação - REDUZIDOS de 20 para 10 e luzes otimizadas */}
      {Array.from({ length: 10 }).map((_, i) => {
        const side = i % 2 === 0 ? -7 : 7;
        return (
          <group key={`post-${i}`} position={[side, 0, -i * 20]}>
            {/* Poste */}
            <mesh position={[0, 3, 0]}>
              <cylinderGeometry args={[0.1, 0.15, 6, 8]} />
              <meshStandardMaterial color="#4a4a4a" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Luminária */}
            <mesh position={[side > 0 ? -0.5 : 0.5, 5.5, 0]}>
              <boxGeometry args={[0.8, 0.3, 0.4]} />
              <meshStandardMaterial 
                color="#2a2a2a" 
                emissive="#FFA500" 
                emissiveIntensity={0.2}
              />
            </mesh>
            {/* Luz do poste - APENAS 3 luzes principais em vez de 10 */}
            {i % 3 === 0 && (
              <pointLight 
                position={[side > 0 ? -0.5 : 0.5, 5.3, 0]} 
                color="#FFA500" 
                intensity={3} 
                distance={25}
              />
            )}
          </group>
        );
      })}

      {/* Vegetação lateral variada - REDUZIDA de 40 para 20 */}
      {Array.from({ length: 20 }).map((_, i) => {
        const side = i % 2 === 0 ? -9 : 9;
        const offset = (Math.random() - 0.5) * 3;
        const type = Math.floor(Math.random() * 3);
        
        return (
          <group key={`vegetation-${i}`} position={[side + offset, 0, -i * 10]}>
            {type === 0 && (
              // Árvore alta
              <>
                <mesh position={[0, 2.5, 0]} material={vegetationMaterial}>
                  <coneGeometry args={[1.2, 3, 8]} />
                </mesh>
                <mesh position={[0, 0.5, 0]}>
                  <cylinderGeometry args={[0.25, 0.3, 2, 8]} />
                  <meshStandardMaterial color="#4a2511" roughness={0.9} />
                </mesh>
              </>
            )}
            {type === 1 && (
              // Arbusto
              <mesh position={[0, 0.4, 0]} material={vegetationMaterial}>
                <sphereGeometry args={[0.6, 8, 8]} />
              </mesh>
            )}
            {type === 2 && (
              // Árvore média
              <>
                <mesh position={[0, 1.5, 0]} material={vegetationMaterial}>
                  <sphereGeometry args={[0.8, 8, 8]} />
                </mesh>
                <mesh position={[0, 0.4, 0]}>
                  <cylinderGeometry args={[0.2, 0.25, 1.2, 8]} />
                  <meshStandardMaterial color="#3e2723" roughness={0.9} />
                </mesh>
              </>
            )}
          </group>
        );
      })}

      {/* Placas de sinalização - REDUZIDAS de 8 para 4 */}
      {Array.from({ length: 4 }).map((_, i) => {
        const side = i % 2 === 0 ? -6.5 : 6.5;
        return (
          <group key={`sign-${i}`} position={[side, 0, -i * 50 - 10]}>
            {/* Poste da placa */}
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 3, 8]} />
              <meshStandardMaterial color="#808080" metalness={0.5} />
            </mesh>
            {/* Placa */}
            <mesh position={[0, 2.8, 0]} rotation={[0, side > 0 ? Math.PI / 6 : -Math.PI / 6, 0]}>
              <boxGeometry args={[1.2, 1.2, 0.1]} />
              <meshStandardMaterial 
                color="#FFFF00" 
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
          </group>
        );
      })}

      {/* Guardas de proteção (guard rails) - REDUZIDOS */}
      {[-4.5, 4.5].map((x, i) => (
        <group key={`guardrail-${i}`}>
          {Array.from({ length: 20 }).map((_, j) => (
            <group key={j} position={[x, 0.5, -j * 10]}>
              {/* Poste vertical */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 1, 6]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Paisagem de horizonte realista - SIMPLIFICADA */}
      <group position={[0, 0, -180]}>
        {/* Montanhas ao fundo - REDUZIDAS de 12 para 6 */}
        {Array.from({ length: 6 }).map((_, i) => {
          const xPos = (i - 3) * 20;
          const height = 15 + Math.random() * 15;
          const width = 10 + Math.random() * 8;
          return (
            <mesh key={`mountain-${i}`} position={[xPos, height / 2 - 0.5, -80]}>
              <coneGeometry args={[width, height, 4]} />
              <meshStandardMaterial 
                color={i % 2 === 0 ? "#4a5568" : "#2d3748"} 
                flatShading
              />
            </mesh>
          );
        })}

        {/* Nuvens realistas - REDUZIDAS de 10 para 5 */}
        {Array.from({ length: 5 }).map((_, i) => {
          const xPos = (i - 2) * 20;
          const yPos = 20 + Math.random() * 15;
          const zPos = -60 + Math.random() * 20;
          return (
            <group key={`cloud-${i}`} position={[xPos, yPos, zPos]}>
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[2.5, 12, 12]} />
                <meshStandardMaterial color="#ffffff" opacity={0.7} transparent />
              </mesh>
            </group>
          );
        })}

        {/* Sol realista - SEM luz adicional */}
        <group position={[30, 18, -70]}>
          <mesh>
            <sphereGeometry args={[5, 16, 16]} />
            <meshStandardMaterial 
              color="#FDB813" 
              emissive="#FDB813" 
              emissiveIntensity={1}
            />
          </mesh>
        </group>

        {/* Floresta densa ao fundo - REDUZIDA de 50 para 20 */}
        {Array.from({ length: 20 }).map((_, i) => {
          const xPos = (i - 10) * 5;
          const zPos = -30 + Math.random() * 20;
          const height = 2 + Math.random() * 2;
          return (
            <group key={`forest-tree-${i}`} position={[xPos, 0, zPos]}>
              <mesh position={[0, height / 2 + 0.5, 0]} material={vegetationMaterial}>
                <coneGeometry args={[0.6, height, 6]} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Névoa atmosférica no horizonte */}
      <mesh position={[0, 10, -150]}>
        <planeGeometry args={[200, 40]} />
        <meshBasicMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
