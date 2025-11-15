import { useState } from 'react';
import { Route, Obstacle } from '../../types/game';

interface GameHUDProps {
  progress: number;
  fuel: number;
  speed: number;
  credits: number;
  route: Route;
  activeObstacles: Obstacle[];
  onAccelerate: () => void;
  onBrake: () => void;
  onRefuel: () => void;
  onSteerLeft?: () => void;
  onSteerRight?: () => void;
  onPitStop?: () => void;
}

export function GameHUD({
  progress,
  fuel,
  speed,
  credits,
  route,
  activeObstacles,
  onAccelerate,
  onBrake,
  onRefuel,
  onSteerLeft,
  onSteerRight,
  onPitStop
}: GameHUDProps) {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  
  const distanceTraveled = (progress / 100) * route.distance;
  const distanceRemaining = route.distance - distanceTraveled;
  
  // Calcula tempo estimado de chegada baseado na velocidade atual
  const estimatedTimeHours = speed > 0 ? distanceRemaining / speed : 0;
  const estimatedTimeMinutes = Math.round(estimatedTimeHours * 60);

  const getFuelColor = () => {
    if (fuel > 50) return 'bg-green-500';
    if (fuel > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getObstacleIcon = (type: Obstacle['type']) => {
    switch (type) {
      case 'sharp_curve': return '⚠️ Curva';
      case 'steep_hill': return '⛰️ Subida';
      case 'traffic_jam': return '🚗 Trânsito';
      case 'accident': return '🚨 Acidente';
      case 'pothole': return '🕳️ Buraco';
      case 'rain': return '🌧️ Chuva';
      case 'fog': return '🌫️ Neblina';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Botão para Toggle do Painel */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <button
          onClick={() => setIsPanelVisible(!isPanelVisible)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors active:scale-95 shadow-lg"
        >
          📊 PAINEL
        </button>
      </div>

      {/* Painel de Informações - Tamanho Original Completo */}
      {isPanelVisible && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto w-[90%] max-w-6xl">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl p-6 text-white shadow-2xl border border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Rota */}
              <div className="space-y-2">
                <p className="text-xs text-white/60 uppercase tracking-wider">Rota</p>
                <p className="font-bold text-xl">{route.name}</p>
                <p className="text-sm text-white/80">{route.distance} km</p>
              </div>

              {/* Progresso */}
              <div className="space-y-2">
                <p className="text-xs text-white/60 uppercase tracking-wider">Progresso</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/20 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#0066CC] to-[#FF6B00] h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="font-bold text-lg">{progress.toFixed(0)}%</span>
                </div>
                <p className="text-sm text-white/80">
                  {distanceTraveled.toFixed(1)} / {route.distance} km
                </p>
              </div>

              {/* Combustível */}
              <div className="space-y-2">
                <p className="text-xs text-white/60 uppercase tracking-wider">Combustível</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/20 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${getFuelColor()} h-full transition-all duration-300`}
                      style={{ width: `${fuel}%` }}
                    />
                  </div>
                  <span className="font-bold text-lg">{fuel.toFixed(0)}%</span>
                </div>
                <p className="text-sm text-white/80">
                  {fuel < 20 ? '⚠️ Combustível baixo!' : 'Nível adequado'}
                </p>
              </div>

              {/* Velocidade e Créditos */}
              <div className="space-y-2">
                <p className="text-xs text-white/60 uppercase tracking-wider">Status</p>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-white/60">Velocidade:</span>{' '}
                    <span className="font-bold text-[#0066CC]">{speed.toFixed(0)} km/h</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-white/60">Créditos:</span>{' '}
                    <span className="font-bold text-[#FF6B00]">R$ {credits.toFixed(2)}</span>
                  </p>
                  {estimatedTimeMinutes > 0 && (
                    <p className="text-sm">
                      <span className="text-white/60">Tempo estimado:</span>{' '}
                      <span className="font-bold">{estimatedTimeMinutes} min</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Barra de Distância Restante */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-white/60 uppercase tracking-wider">Distância Restante</p>
                <p className="text-sm font-bold">{distanceRemaining.toFixed(1)} km</p>
              </div>
              <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#FF6B00] to-[#0066CC] h-full transition-all duration-300"
                  style={{ width: `${100 - progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Obstáculos Ativos - Topo Esquerdo */}
      {activeObstacles.length > 0 && (
        <div className="absolute top-24 left-4 pointer-events-auto max-w-[200px]">
          <div className="bg-red-500/90 backdrop-blur-md rounded-lg p-3 text-white shadow-xl">
            <p className="font-bold mb-2 text-sm">⚠️ OBSTÁCULOS ATIVOS</p>
            <div className="space-y-1.5">
              {activeObstacles.map((obstacle) => (
                <div
                  key={obstacle.id}
                  className="bg-white/20 rounded px-2 py-1 text-sm animate-pulse"
                >
                  {getObstacleIcon(obstacle.type)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controles - Bottom Center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="bg-black/70 backdrop-blur-md rounded-xl p-2.5">
          {/* Controles de Direção */}
          <div className="flex justify-center gap-2 mb-2">
            <button
              onClick={onSteerLeft}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors active:scale-95"
            >
              ⬅️ ESQ
            </button>
            <button
              onClick={onSteerRight}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors active:scale-95"
            >
              DIR ➡️
            </button>
          </div>

          {/* Controles de Velocidade */}
          <div className="flex gap-2">
            <button
              onClick={onBrake}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors active:scale-95"
            >
              🛑 FREIO
            </button>
            <button
              onClick={onAccelerate}
              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors active:scale-95"
            >
              ⚡ ACELERAR
            </button>
            <button
              onClick={onRefuel}
              className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E55A00] text-white text-xs font-bold rounded-lg transition-colors active:scale-95"
            >
              ⛽ ABASTECER
            </button>
            <button
              onClick={onPitStop}
              className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition-colors active:scale-95"
            >
              ⏸️ PITSTOP
            </button>
          </div>
          <p className="text-[9px] text-white/60 text-center mt-1.5">
            Use ↑ ↓ ← → ou botões | Espaço = freio | P = pitstop
          </p>
        </div>
      </div>
    </div>
  );
}
