import { GameState, Obstacle, ObstacleType, ObstacleEffect, Route } from '../../types/game';

export class GameLogic {
  private static obstacleEffects: Record<ObstacleType, ObstacleEffect> = {
    sharp_curve: {
      speedReduction: 60, // reduz 60% da velocidade
      fuelConsumption: 1.2,
      duration: 5
    },
    steep_hill: {
      speedReduction: 50,
      fuelConsumption: 2.0, // consome 2x mais combustível
      duration: 10
    },
    traffic_jam: {
      speedReduction: 80,
      fuelConsumption: 1.5,
      duration: 15
    },
    accident: {
      speedReduction: 100, // para completamente
      fuelConsumption: 0.5,
      duration: 20
    },
    pothole: {
      speedReduction: 30,
      fuelConsumption: 1.1,
      duration: 2
    },
    rain: {
      speedReduction: 40,
      fuelConsumption: 1.3,
      duration: 30
    },
    fog: {
      speedReduction: 50,
      fuelConsumption: 1.2,
      duration: 25
    }
  };

  // Gera obstáculos aleatórios baseado na dificuldade da rota
  static generateObstacles(route: Route): Obstacle[] {
    const obstacles: Obstacle[] = [];
    const difficultyMultiplier = {
      easy: 8,
      medium: 15,
      hard: 25,
      extreme: 35
    };

    const obstacleCount = difficultyMultiplier[route.difficulty];

    for (let i = 0; i < obstacleCount; i++) {
      const obstacleTypes: ObstacleType[] = [
        'sharp_curve',
        'sharp_curve', // Mais curvas para emoção
        'steep_hill',
        'traffic_jam',
        'traffic_jam', // Mais trânsito
        'accident',
        'pothole',
        'rain',
        'fog'
      ];

      obstacles.push({
        id: `obstacle-${i}`,
        type: obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)],
        position: Math.random(), // 0-1 (posição na rota)
        severity: Math.floor(Math.random() * 10) + 1,
        active: false
      });
    }

    // Ordena por posição
    return obstacles.sort((a, b) => a.position - b.position);
  }

  // Calcula consumo de combustível por segundo
  static calculateFuelConsumption(
    speed: number,
    activeObstacles: Obstacle[],
    terrain: Route['terrain'][0]
  ): number {
    let baseConsumption = 0.05; // 0.05% por segundo em velocidade normal

    // Ajusta baseado no terreno
    const terrainMultiplier = {
      flat: 1.0,
      hills: 1.3,
      mountains: 1.8,
      urban: 1.2,
      highway: 0.9
    };

    baseConsumption *= terrainMultiplier[terrain];

    // Ajusta baseado na velocidade
    const speedFactor = speed / 80; // velocidade base 80 km/h
    baseConsumption *= speedFactor;

    // Aplica efeitos dos obstáculos ativos
    activeObstacles.forEach(obstacle => {
      const effect = this.obstacleEffects[obstacle.type];
      baseConsumption *= effect.fuelConsumption;
    });

    return baseConsumption;
  }

  // Calcula velocidade atual baseado em obstáculos e inclinações
  static calculateSpeed(
    baseSpeed: number,
    activeObstacles: Obstacle[],
    terrain: Route['terrain'][0]
  ): number {
    let speed = baseSpeed;

    // Ajusta baseado no terreno (inclinações naturalmente diminuem velocidade)
    const terrainSpeedLimit = {
      flat: 100,
      hills: 80,
      mountains: 60,
      urban: 60,
      highway: 110
    };

    speed = Math.min(speed, terrainSpeedLimit[terrain]);

    // Redução adicional por inclinação (subidas diminuem velocidade naturalmente)
    if (terrain === 'hills') {
      speed *= 0.85; // 15% mais lento em subidas
    } else if (terrain === 'mountains') {
      speed *= 0.70; // 30% mais lento em montanhas
    }

    // Aplica reduções dos obstáculos
    activeObstacles.forEach(obstacle => {
      const effect = this.obstacleEffects[obstacle.type];
      speed *= (1 - effect.speedReduction / 100);
    });

    return Math.max(0, speed);
  }

  // Verifica se o jogador encontrou um obstáculo
  static checkObstacles(progress: number, obstacles: Obstacle[]): Obstacle[] {
    return obstacles.filter(obstacle => {
      const tolerance = 0.005; // 0.5% de tolerância
      return Math.abs(obstacle.position - progress / 100) < tolerance && !obstacle.active;
    });
  }

  // Ativa obstáculo
  static activateObstacle(obstacle: Obstacle): Obstacle {
    return { ...obstacle, active: true };
  }

  // Calcula progresso baseado na velocidade e tempo
  static calculateProgress(
    currentProgress: number,
    speed: number,
    distance: number,
    deltaTime: number
  ): number {
    // Converte velocidade (km/h) para progresso (%)
    const distancePerSecond = (speed / 3600) * deltaTime; // km percorridos
    const progressIncrease = (distancePerSecond / distance) * 100;
    
    return Math.min(100, currentProgress + progressIncrease);
  }

  // Calcula tempo estimado de chegada baseado na velocidade atual
  static calculateETA(
    currentProgress: number,
    currentSpeed: number,
    totalDistance: number
  ): number {
    const remainingDistance = totalDistance * (1 - currentProgress / 100);
    
    if (currentSpeed === 0) {
      return Infinity;
    }
    
    // Retorna tempo em minutos
    return (remainingDistance / currentSpeed) * 60;
  }

  // Calcula custo por km rodado (dedução de crédito proporcional) - FATOR 0.80 APLICADO
  static calculateCreditDeduction(
    distanceTraveled: number,
    basePrice: number,
    totalDistance: number
  ): number {
    // Fator de multiplicação 0.80 (ida e volta = 2x a distância, mas com desconto)
    const roundTripFactor = 0.80;
    const totalTripDistance = totalDistance * 2; // Ida e volta
    const costPerKm = (basePrice * roundTripFactor) / totalTripDistance;
    return costPerKm * distanceTraveled;
  }

  // Verifica se o jogo terminou
  static checkGameEnd(state: GameState): 'completed' | 'failed' | 'playing' {
    if (state.progress >= 100) {
      return 'completed';
    }
    if (state.fuel <= 0) {
      return 'failed';
    }
    if (state.credits <= 0) {
      return 'failed';
    }
    return 'playing';
  }

  // Calcula recompensa ao completar a rota
  static calculateReward(route: Route, totalInvested: number): {
    ticketEarned: boolean;
    refund: number;
    profit: number;
  } {
    const ticketEarned = totalInvested >= route.basePrice;
    const refund = ticketEarned ? 0 : 0; // Não há reembolso se não completar
    const profit = Math.max(0, totalInvested - route.basePrice);

    return { ticketEarned, refund, profit };
  }

  // Sistema de dificuldade progressiva
  static getObstacleEffect(obstacle: Obstacle): ObstacleEffect {
    const baseEffect = this.obstacleEffects[obstacle.type];
    
    // Aumenta efeito baseado na severidade
    return {
      speedReduction: baseEffect.speedReduction * (obstacle.severity / 10),
      fuelConsumption: baseEffect.fuelConsumption * (obstacle.severity / 10),
      duration: baseEffect.duration
    };
  }

  // Gera trânsito pesado aleatório (de vez em quando para emoção)
  static generateTrafficCondition(progress: number): 'light' | 'medium' | 'heavy' {
    const random = Math.random();
    const progressFactor = progress / 100;
    
    // Mais trânsito em áreas urbanas (meio da rota)
    if (progressFactor > 0.3 && progressFactor < 0.7) {
      if (random < 0.3) return 'heavy'; // 30% de chance de trânsito pesado
      if (random < 0.6) return 'medium'; // 30% de chance de trânsito médio
      return 'light'; // 40% de chance de trânsito leve
    }
    
    // Menos trânsito em rodovias
    if (random < 0.1) return 'heavy'; // 10% de chance
    if (random < 0.3) return 'medium'; // 20% de chance
    return 'light'; // 70% de chance
  }

  // Aplica efeito de trânsito pesado na velocidade
  static applyTrafficEffect(speed: number, trafficCondition: 'light' | 'medium' | 'heavy'): number {
    const trafficMultiplier = {
      light: 1.0,
      medium: 0.7, // 30% mais lento
      heavy: 0.4   // 60% mais lento
    };

    return speed * trafficMultiplier[trafficCondition];
  }
}
