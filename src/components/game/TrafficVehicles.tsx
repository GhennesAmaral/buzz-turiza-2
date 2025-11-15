import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Coin {
  id: string;
  type: 'golden' | 'red';
  lane: number; // -1.5, 0, 1.5 (faixas)
  position: number;
  value: number; // 0.0001 a 0.05
  collected: boolean;
  targetLane: number; // Faixa alvo para transição suave
  laneTransitionProgress: number; // 0 a 1 para transição entre faixas
}

interface FloatingPoint {
  id: string;
  value: number;
  type: 'golden' | 'red';
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  opacity: number;
  scale: number;
  lifetime: number;
}

interface FloatingCoinsProps {
  progress: number;
  density: 'light' | 'medium' | 'heavy';
  onCoinCollect?: (value: number, type: 'golden' | 'red') => void;
}

export function TrafficVehicles({ progress, density, onCoinCollect }: FloatingCoinsProps) {
  const coinsRef = useRef<THREE.Group>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);
  const lastLaneChangeRef = useRef<{ [key: string]: number }>({});
  
  // Inicializa AudioContext para som de coleta
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Função para tocar som de coleta de moeda
  const playCoinSound = (type: 'golden' | 'red') => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'golden') {
      // Som agradável para moeda dourada (nota musical ascendente)
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      oscillator.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.1); // G5
    } else {
      // Som de alerta para moeda vermelha (nota descendente)
      oscillator.frequency.setValueAtTime(392, ctx.currentTime); // G4
      oscillator.frequency.exponentialRampToValueAtTime(261.63, ctx.currentTime + 0.15); // C4
    }

    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  };

  // Função para criar pontos flutuantes quando moeda é coletada
  const createFloatingPoints = (position: THREE.Vector3, value: number, type: 'golden' | 'red') => {
    // Cria 3-5 partículas de pontos flutuantes
    const numParticles = Math.floor(Math.random() * 3) + 3;
    const newPoints: FloatingPoint[] = [];

    for (let i = 0; i < numParticles; i++) {
      newPoints.push({
        id: `point-${Date.now()}-${i}`,
        value,
        type,
        position: position.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2, // movimento horizontal aleatório
          Math.random() * 2 + 1, // movimento para cima
          (Math.random() - 0.5) * 0.5 // leve movimento em Z
        ),
        opacity: 1,
        scale: 1,
        lifetime: 0
      });
    }

    setFloatingPoints(prev => [...prev, ...newPoints]);
  };
  
  // Gera moedas ocasionalmente (aparecem de vez em quando)
  const coins = useMemo<Coin[]>(() => {
    // Densidade baixa - moedas aparecem ocasionalmente
    const coinCount = Math.floor(Math.random() * 3) + 2; // 2-4 moedas apenas
    
    const lanes = [-1.5, 0, 1.5]; // Três faixas

    return Array.from({ length: coinCount }, (_, i) => {
      const isGolden = Math.random() > 0.3; // 70% douradas, 30% vermelhas
      const value = parseFloat((Math.random() * (0.05 - 0.0001) + 0.0001).toFixed(4));
      const initialLane = lanes[Math.floor(Math.random() * lanes.length)];
      
      return {
        id: `coin-${i}-${Date.now()}`,
        type: isGolden ? 'golden' : 'red',
        lane: initialLane,
        position: -i * 40 - Math.random() * 100, // Bem espaçadas
        value,
        collected: false,
        targetLane: initialLane,
        laneTransitionProgress: 1 // Começa já na faixa
      };
    });
  }, [progress]); // Regenera ocasionalmente baseado no progresso

  useFrame((state, delta) => {
    if (!coinsRef.current) return;

    const lanes = [-1.5, 0, 1.5];
    const currentTime = state.clock.elapsedTime;

    // Move moedas para trás (simulando movimento do ônibus) - SEMPRE DEVAGAR E LENTO
    coinsRef.current.children.forEach((child, i) => {
      const coin = coins[i];
      if (!coin || coin.collected) return;

      // VELOCIDADE MUITO LENTA E FIXA - TOTALMENTE INDEPENDENTE DA ACELERAÇÃO DO ÔNIBUS
      const VERY_SLOW_SPEED = 1.5; // Velocidade bem mais lenta (reduzida de 3 para 1.5)
      child.position.z += delta * VERY_SLOW_SPEED;

      // Rotação contínua para efeito visual (bem lenta)
      child.rotation.y += delta * 1;

      // Movimento flutuante (sobe e desce) bem suave
      child.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 1.2 + i) * 0.2;

      // MUDANÇA DE FAIXA MAIS FREQUENTE E ALEATÓRIA
      const lastChange = lastLaneChangeRef.current[coin.id] || 0;
      const timeSinceLastChange = currentTime - lastChange;
      
      // A cada 2-4 segundos, chance maior de mudar de faixa
      if (timeSinceLastChange > 2 && Math.random() < 0.03) { // 3% de chance por frame (aumentado)
        // Escolhe nova faixa aleatória diferente da atual
        const availableLanes = lanes.filter(l => Math.abs(l - coin.targetLane) > 0.1);
        if (availableLanes.length > 0) {
          coin.targetLane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
          coin.laneTransitionProgress = 0;
          lastLaneChangeRef.current[coin.id] = currentTime;
        }
      }

      // Transição muito suave entre faixas
      if (coin.laneTransitionProgress < 1) {
        coin.laneTransitionProgress = Math.min(1, coin.laneTransitionProgress + delta * 0.4); // Transição suave
        // Interpolação suave (easing cubic)
        const t = coin.laneTransitionProgress;
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const currentLane = coin.lane + (coin.targetLane - coin.lane) * eased * delta * 3;
        coin.lane = currentLane;
      } else {
        coin.lane = coin.targetLane;
      }

      // Atualiza posição X da moeda (faixa) com movimento suave
      child.position.x = THREE.MathUtils.lerp(child.position.x, coin.lane, delta * 2);

      // Reseta posição quando sai da tela
      if (child.position.z > 50) {
        child.position.z = -200 - Math.random() * 100;
        // Reseta para uma faixa aleatória ao reaparecer
        const newLane = lanes[Math.floor(Math.random() * lanes.length)];
        coin.lane = newLane;
        coin.targetLane = newLane;
        coin.laneTransitionProgress = 1;
        coin.collected = false;
        child.visible = true;
        child.position.x = newLane;
      }

      // Detecção de colisão simples (quando moeda passa pelo ônibus)
      if (child.position.z > 5 && child.position.z < 10 && !coin.collected) {
        coin.collected = true;
        
        // Toca som de coleta
        playCoinSound(coin.type);
        
        // Cria pontos flutuantes
        createFloatingPoints(child.position.clone(), coin.value, coin.type);
        
        if (onCoinCollect) {
          onCoinCollect(coin.value, coin.type);
        }
        // Esconde moeda coletada
        child.visible = false;
      }
    });

    // Atualiza pontos flutuantes
    setFloatingPoints(prev => {
      return prev
        .map(point => {
          // Atualiza posição
          point.position.add(point.velocity.clone().multiplyScalar(delta));
          
          // Aplica gravidade suave
          point.velocity.y -= delta * 0.5;
          
          // Atualiza opacidade e escala (efeito de desaparecimento)
          point.lifetime += delta;
          point.opacity = Math.max(0, 1 - point.lifetime / 1.5);
          point.scale = 1 + point.lifetime * 0.5;
          
          return point;
        })
        .filter(point => point.lifetime < 1.5); // Remove pontos após 1.5 segundos
    });
  });

  const renderCoin = (coin: Coin, index: number) => {
    return (
      <group key={coin.id} position={[coin.lane, 0.5, coin.position]}>
        {/* Moeda principal */}
        <mesh castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
          <meshStandardMaterial 
            color={coin.type === 'golden' ? '#FFD700' : '#FF0000'}
            metalness={0.8}
            roughness={0.2}
            emissive={coin.type === 'golden' ? '#FFD700' : '#FF0000'}
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Brilho ao redor */}
        <mesh>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial 
            color={coin.type === 'golden' ? '#FFD700' : '#FF0000'}
            transparent
            opacity={0.3}
            emissive={coin.type === 'golden' ? '#FFD700' : '#FF0000'}
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Luz pontual para efeito dramático */}
        <pointLight 
          color={coin.type === 'golden' ? '#FFD700' : '#FF0000'} 
          intensity={2} 
          distance={5} 
        />

        {/* Símbolo na moeda */}
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial 
            color={coin.type === 'golden' ? '#FFA500' : '#8B0000'}
            emissive={coin.type === 'golden' ? '#FFA500' : '#8B0000'}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
    );
  };

  return (
    <>
      <group ref={coinsRef}>
        {coins.map((coin, index) => renderCoin(coin, index))}
      </group>

      {/* Renderiza pontos flutuantes */}
      {floatingPoints.map(point => (
        <group key={point.id} position={point.position}>
          <mesh scale={point.scale}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color={point.type === 'golden' ? '#FFD700' : '#FF0000'}
              transparent
              opacity={point.opacity}
              emissive={point.type === 'golden' ? '#FFD700' : '#FF0000'}
              emissiveIntensity={0.8}
            />
          </mesh>
          
          {/* Texto do valor (simulado com sprite) */}
          <mesh position={[0, 0.3, 0]} scale={point.scale * 0.5}>
            <planeGeometry args={[0.5, 0.3]} />
            <meshBasicMaterial
              color={point.type === 'golden' ? '#FFD700' : '#FF0000'}
              transparent
              opacity={point.opacity}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}
