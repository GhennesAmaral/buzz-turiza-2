import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky } from '@react-three/drei';
import { Bus3D } from './Bus3D';
import { Road3D } from './Road3D';
import { Obstacles } from './Obstacles';
import { GameState, Route } from '../../types/game';
import { GameLogic } from '../../lib/systems/GameLogic';
import { GameHUD } from '../ui/GameHUD';

interface BusGameProps {
  route: Route;
  initialCredits: number;
  onGameEnd: (completed: boolean, totalInvested: number) => void;
  onNeedFuel: () => void;
}

interface FloatingPenalty {
  id: string;
  value: number;
  x: number;
  y: number;
  timestamp: number;
}

export function BusGame({ route, initialCredits, onGameEnd, onNeedFuel }: BusGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    currentRoute: route,
    progress: 0,
    fuel: 100,
    credits: initialCredits,
    totalInvested: 0,
    speed: 0,
    obstacles: GameLogic.generateObstacles(route),
    gameStatus: 'playing'
  });

  const [targetSpeed, setTargetSpeed] = useState(0);
  const [busLanePosition, setBusLanePosition] = useState(0);
  const [activeObstacles, setActiveObstacles] = useState<typeof gameState.obstacles>([]);
  const [trafficDensity, setTrafficDensity] = useState<'light' | 'medium' | 'heavy'>('light');
  const [isPaused, setIsPaused] = useState(false);
  const [floatingPenalties, setFloatingPenalties] = useState<FloatingPenalty[]>([]);
  
  const lastUpdateRef = useRef(Date.now());
  const lastTrafficCheckRef = useRef(Date.now());
  const previousProgressRef = useRef(0);

  const handlePitStop = () => {
    setIsPaused(!isPaused);
  };

  // Função para verificar se o ônibus está nas faixas cinzas perigosas
  const isOnDangerLane = (lanePosition: number): boolean => {
    // Faixas cinzas perigosas estão em -1 e 1 (posições laterais)
    // Faixa amarela segura está em 0 (posição central)
    return lanePosition === -1 || lanePosition === 1;
  };

  // Função para adicionar penalidade flutuante
  const addFloatingPenalty = (value: number) => {
    const id = `penalty-${Date.now()}-${Math.random()}`;
    const penalty: FloatingPenalty = {
      id,
      value,
      x: 50 + (Math.random() - 0.5) * 20, // Posição X aleatória próxima ao centro
      y: 50, // Começa no meio da tela
      timestamp: Date.now()
    };
    
    setFloatingPenalties(prev => [...prev, penalty]);
    
    // Remove a penalidade após 3 segundos (animação completa)
    setTimeout(() => {
      setFloatingPenalties(prev => prev.filter(p => p.id !== id));
    }, 3000);
  };

  useEffect(() => {
    if (gameState.gameStatus !== 'playing' || isPaused) return;

    const gameLoop = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      setGameState(prev => {
        const timeSinceLastTrafficCheck = (now - lastTrafficCheckRef.current) / 1000;
        if (timeSinceLastTrafficCheck >= 10) {
          const newTraffic = GameLogic.generateTrafficCondition(prev.progress);
          setTrafficDensity(newTraffic);
          lastTrafficCheckRef.current = now;
        }

        const newObstacles = GameLogic.checkObstacles(prev.progress, prev.obstacles);
        if (newObstacles.length > 0) {
          newObstacles.forEach(obs => {
            setActiveObstacles(active => [...active, obs]);
            setTimeout(() => {
              setActiveObstacles(active => active.filter(a => a.id !== obs.id));
            }, GameLogic.getObstacleEffect(obs).duration * 1000);
          });
        }

        const currentTerrain = route.terrain[Math.floor((prev.progress / 100) * route.terrain.length)];
        
        let currentSpeed = prev.speed;
        const acceleration = 15;
        const deceleration = 20;
        
        if (targetSpeed > currentSpeed) {
          currentSpeed = Math.min(targetSpeed, currentSpeed + acceleration * deltaTime);
        } else if (targetSpeed < currentSpeed) {
          currentSpeed = Math.max(targetSpeed, currentSpeed - deceleration * deltaTime);
        }
        
        currentSpeed = GameLogic.calculateSpeed(currentSpeed, activeObstacles, currentTerrain);
        currentSpeed = GameLogic.applyTrafficEffect(currentSpeed, trafficDensity);

        const fuelConsumption = GameLogic.calculateFuelConsumption(
          currentSpeed,
          activeObstacles,
          currentTerrain
        );

        const newProgress = GameLogic.calculateProgress(
          prev.progress,
          currentSpeed,
          route.distance,
          deltaTime
        );

        const distanceTraveled = ((newProgress - previousProgressRef.current) / 100) * route.distance;
        let creditDeduction = distanceTraveled * 0.80;
        
        // NOVA REGRA: Penalização por andar nas faixas cinzas perigosas
        let dangerLanePenalty = 0;
        if (isOnDangerLane(busLanePosition) && currentSpeed > 0) {
          // Penalidade significativa entre R$ 0,01 e R$ 0,08 por frame
          dangerLanePenalty = Math.random() * (0.08 - 0.01) + 0.01;
          creditDeduction += dangerLanePenalty;
          
          // Adiciona notificação visual flutuante
          addFloatingPenalty(dangerLanePenalty);
        }
        
        const newCredits = Math.max(0, prev.credits - creditDeduction);
        
        previousProgressRef.current = newProgress;

        const newFuel = Math.max(0, prev.fuel - fuelConsumption);

        if (newFuel <= 0) {
          onNeedFuel();
          return { ...prev, fuel: 0, speed: 0, gameStatus: 'refueling' as const };
        }

        const gameEnd = GameLogic.checkGameEnd({ 
          ...prev, 
          progress: newProgress, 
          fuel: newFuel, 
          credits: newCredits 
        });
        
        if (gameEnd !== 'playing') {
          onGameEnd(gameEnd === 'completed', prev.totalInvested);
          return { ...prev, gameStatus: gameEnd };
        }

        return {
          ...prev,
          progress: newProgress,
          fuel: newFuel,
          speed: currentSpeed,
          credits: newCredits
        };
      });
    }, 100);

    return () => clearInterval(gameLoop);
  }, [gameState.gameStatus, isPaused, route, targetSpeed, activeObstacles, trafficDensity, busLanePosition, onGameEnd, onNeedFuel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameStatus !== 'playing') return;

      switch (e.key) {
        case 'ArrowLeft':
          setBusLanePosition(prev => Math.max(-1, prev - 1));
          break;
        case 'ArrowRight':
          setBusLanePosition(prev => Math.min(1, prev + 1));
          break;
        case ' ':
          e.preventDefault();
          setTargetSpeed(0);
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          handlePitStop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.gameStatus]);

  const handleSteerLeft = () => {
    setBusLanePosition(prev => Math.max(-1, prev - 1));
  };

  const handleSteerRight = () => {
    setBusLanePosition(prev => Math.min(1, prev + 1));
  };

  const handleAccelerate = () => {
    setTargetSpeed(prev => Math.min(110, prev + 10));
  };

  const handleBrake = () => {
    setTargetSpeed(prev => Math.max(0, prev - 10));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Canvas shadows className="absolute inset-0">
        <PerspectiveCamera makeDefault position={[0, 3, 8]} fov={75} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2.5}
          minPolarAngle={Math.PI / 4}
        />

        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <hemisphereLight intensity={0.3} groundColor="#444444" />

        <Sky sunPosition={[100, 20, 100]} />

        <Bus3D speed={gameState.speed} position={gameState.progress / 100} lanePosition={busLanePosition} />
        <Road3D 
          progress={gameState.progress} 
          terrain={route.terrain[Math.floor((gameState.progress / 100) * route.terrain.length)]}
        />
        <Obstacles obstacles={gameState.obstacles} progress={gameState.progress} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color="#1a4d1a" />
        </mesh>
      </Canvas>

      <GameHUD
        progress={gameState.progress}
        fuel={gameState.fuel}
        speed={gameState.speed}
        credits={gameState.credits}
        route={route}
        activeObstacles={activeObstacles}
        onAccelerate={handleAccelerate}
        onBrake={handleBrake}
        onRefuel={onNeedFuel}
        onSteerLeft={handleSteerLeft}
        onSteerRight={handleSteerRight}
        onPitStop={handlePitStop}
      />

      {/* Penalidades flutuantes animadas - MAIS VISÍVEIS E IMPACTANTES */}
      {floatingPenalties.map((penalty) => {
        const age = (Date.now() - penalty.timestamp) / 1000; // idade em segundos
        const opacity = Math.max(0, 1 - age / 3); // desaparece em 3 segundos
        const yOffset = age * 40; // sobe 40px por segundo (mais rápido)
        const scale = 1 + age * 0.5; // cresce mais
        
        return (
          <div
            key={penalty.id}
            className="absolute pointer-events-none font-black text-red-600 transition-all duration-100 z-50"
            style={{
              left: `${penalty.x}%`,
              top: `${penalty.y - yOffset}%`,
              opacity: opacity,
              transform: `scale(${scale})`,
              textShadow: '0 0 15px rgba(255, 0, 0, 1), 0 0 30px rgba(255, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)',
              fontSize: '2rem',
              animation: 'float-wiggle 0.4s ease-in-out infinite',
              WebkitTextStroke: '1px rgba(139, 0, 0, 0.8)',
            }}
          >
            -R$ {penalty.value.toFixed(4)}
          </div>
        );
      })}

      {/* Alerta visual quando nas faixas cinzas perigosas */}
      {isOnDangerLane(busLanePosition) && gameState.speed > 0 && !isPaused && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 pointer-events-none z-40">
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 backdrop-blur-md rounded-2xl px-8 py-4 text-white font-black animate-pulse border-4 border-red-400 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">⚠️</span>
              <div>
                <div className="text-xl">FAIXA CINZA PERIGOSA!</div>
                <div className="text-sm font-bold text-red-200">Perdendo créditos rapidamente!</div>
              </div>
              <span className="text-3xl animate-bounce">⚠️</span>
            </div>
          </div>
        </div>
      )}

      {/* Indicador visual das faixas */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-none z-30">
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
          <div className="flex items-center gap-4">
            <div className={`flex flex-col items-center ${busLanePosition === -1 ? 'scale-125' : ''} transition-transform`}>
              <div className="w-12 h-12 bg-gray-500 rounded-lg border-2 border-red-500 flex items-center justify-center">
                {busLanePosition === -1 && <span className="text-2xl">🚌</span>}
              </div>
              <span className="text-xs text-red-400 font-bold mt-1">PERIGO</span>
            </div>
            
            <div className={`flex flex-col items-center ${busLanePosition === 0 ? 'scale-125' : ''} transition-transform`}>
              <div className="w-12 h-12 bg-yellow-400 rounded-lg border-2 border-green-500 flex items-center justify-center">
                {busLanePosition === 0 && <span className="text-2xl">🚌</span>}
              </div>
              <span className="text-xs text-green-400 font-bold mt-1">SEGURO</span>
            </div>
            
            <div className={`flex flex-col items-center ${busLanePosition === 1 ? 'scale-125' : ''} transition-transform`}>
              <div className="w-12 h-12 bg-gray-500 rounded-lg border-2 border-red-500 flex items-center justify-center">
                {busLanePosition === 1 && <span className="text-2xl">🚌</span>}
              </div>
              <span className="text-xs text-red-400 font-bold mt-1">PERIGO</span>
            </div>
          </div>
          <div className="text-center text-white text-xs mt-2 font-semibold">
            Fique na faixa amarela! 🟨
          </div>
        </div>
      </div>

      {isPaused && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 max-w-md text-white text-center shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">⏸️ PITSTOP</h2>
            <p className="text-lg mb-2">Você está descansando!</p>
            <p className="text-sm text-white/80 mb-6">
              Progresso salvo: {gameState.progress.toFixed(1)}% ({((gameState.progress / 100) * route.distance).toFixed(1)} km)
            </p>
            <div className="space-y-3 mb-6">
              <div className="bg-white/20 rounded-lg p-3">
                <p className="text-xs text-white/70">Combustível</p>
                <p className="text-xl font-bold">{gameState.fuel.toFixed(0)}%</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <p className="text-xs text-white/70">Créditos</p>
                <p className="text-xl font-bold text-[#FF6B00]">R$ {gameState.credits.toFixed(2)}</p>
              </div>
            </div>
            <button
              onClick={handlePitStop}
              className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors text-lg"
            >
              ▶️ CONTINUAR VIAGEM
            </button>
            <p className="text-xs text-white/60 mt-4">Pressione P ou clique no botão para continuar</p>
          </div>
        </div>
      )}

      {trafficDensity === 'heavy' && !isPaused && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-red-500/90 backdrop-blur-md rounded-xl px-4 py-2 text-white font-bold animate-pulse">
            🚗🚗🚗 TRÂNSITO PESADO 🚗🚗🚗
          </div>
        </div>
      )}
      {trafficDensity === 'medium' && !isPaused && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-yellow-500/90 backdrop-blur-md rounded-xl px-4 py-2 text-white font-bold">
            🚗 Trânsito Moderado 🚗
          </div>
        </div>
      )}

      <style>{`
        @keyframes float-wiggle {
          0%, 100% { transform: translateX(-8px) rotate(-5deg); }
          50% { transform: translateX(8px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
