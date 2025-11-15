// Tipos do jogo Turiza Bus Challenge

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number; // em km
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  basePrice: number; // preço real da passagem
  estimatedTime: number; // em minutos
  terrain: TerrainType[];
}

export type TerrainType = 'flat' | 'hills' | 'mountains' | 'urban' | 'highway';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  position: number; // posição na rota (0-1)
  severity: number; // 1-10
  active: boolean;
}

export type ObstacleType = 
  | 'sharp_curve' 
  | 'steep_hill' 
  | 'traffic_jam' 
  | 'accident' 
  | 'pothole' 
  | 'rain' 
  | 'fog';

export interface GameState {
  currentRoute: Route | null;
  progress: number; // 0-100%
  fuel: number; // 0-100%
  credits: number; // créditos disponíveis
  totalInvested: number; // total investido na rota atual
  speed: number; // km/h
  obstacles: Obstacle[];
  gameStatus: 'menu' | 'playing' | 'paused' | 'refueling' | 'completed' | 'failed';
}

export interface Player {
  id: string;
  name: string;
  email: string;
  totalCredits: number;
  completedRoutes: string[];
  currentRoute: string | null;
  createdAt: Date;
}

export interface FuelPurchase {
  amount: number; // em reais
  credits: number; // créditos recebidos
  conversionRate: number; // taxa de conversão (com juros embutidos)
  timestamp: Date;
}

export interface ObstacleEffect {
  speedReduction: number; // % de redução de velocidade
  fuelConsumption: number; // consumo extra de combustível
  duration: number; // duração do efeito em segundos
}
