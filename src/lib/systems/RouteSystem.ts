import { Route } from '../types/game';

// Sistema de rotas customizadas pelo jogador
export class RouteSystem {
  private static readonly PRICE_PER_KM = 0.80;

  // Calcula o preço base da rota (R$ 0,80 por KM)
  static calculateBasePrice(distance: number): number {
    return distance * this.PRICE_PER_KM;
  }

  // Determina a dificuldade baseada na distância
  static calculateDifficulty(distance: number): Route['difficulty'] {
    if (distance > 2000) return 'extreme';
    if (distance > 1000) return 'hard';
    if (distance > 500) return 'medium';
    return 'easy';
  }

  // Calcula o tempo estimado (média de 80 km/h)
  static calculateEstimatedTime(distance: number): number {
    const hours = distance / 80;
    return Math.ceil(hours * 60); // retorna em minutos
  }

  // Cria uma rota customizada
  static createCustomRoute(
    origin: string,
    destination: string,
    distance: number
  ): Route {
    const basePrice = this.calculateBasePrice(distance);
    const difficulty = this.calculateDifficulty(distance);
    const estimatedTime = this.calculateEstimatedTime(distance);

    return {
      id: `custom-${Date.now()}`,
      name: `${origin} → ${destination}`,
      origin,
      destination,
      distance,
      difficulty,
      basePrice,
      estimatedTime,
      terrain: this.generateTerrain(distance, difficulty)
    };
  }

  // Gera terreno baseado na distância e dificuldade
  private static generateTerrain(
    distance: number,
    difficulty: Route['difficulty']
  ): Route['terrain'] {
    const terrain: Route['terrain'] = ['highway'];

    if (difficulty === 'easy') {
      terrain.push('flat');
    } else if (difficulty === 'medium') {
      terrain.push('hills', 'urban');
    } else if (difficulty === 'hard') {
      terrain.push('hills', 'mountains', 'urban');
    } else {
      terrain.push('mountains', 'hills', 'flat', 'urban');
    }

    return terrain;
  }

  // Calcula o custo de combustível baseado na distância e dificuldade
  static calculateFuelCost(distance: number, difficulty: Route['difficulty']): number {
    const baseRate = 0.15; // R$ 0.15 por km
    const difficultyMultiplier = {
      easy: 1.0,
      medium: 1.3,
      hard: 1.6,
      extreme: 2.0
    };
    
    return distance * baseRate * difficultyMultiplier[difficulty];
  }

  // Calcula quantos créditos o jogador precisa para completar a rota
  static calculateRequiredCredits(route: Route): number {
    const fuelCost = this.calculateFuelCost(route.distance, route.difficulty);
    // Adiciona 30% de margem para obstáculos
    return Math.ceil(fuelCost * 1.3);
  }

  // Sistema de conversão com "juros" embutidos
  static convertMoneyToCredits(amount: number): number {
    // Taxa de conversão: R$ 1.00 = 0.75 créditos
    // Isso significa que o jogador paga 33% a mais que o valor real da passagem
    const conversionRate = 0.75;
    return Math.floor(amount * conversionRate * 100) / 100;
  }

  // Calcula quanto o jogador já pagou em relação ao preço real da passagem
  static calculatePaymentProgress(totalInvested: number, route: Route): {
    percentage: number;
    remaining: number;
    overpaid: number;
  } {
    const percentage = (totalInvested / route.basePrice) * 100;
    const remaining = Math.max(0, route.basePrice - totalInvested);
    const overpaid = Math.max(0, totalInvested - route.basePrice);
    
    return { percentage, remaining, overpaid };
  }

  // Valida se a rota é válida
  static validateRoute(origin: string, destination: string, distance: number): {
    valid: boolean;
    error?: string;
  } {
    if (!origin.trim()) {
      return { valid: false, error: 'Origem não pode estar vazia' };
    }

    if (!destination.trim()) {
      return { valid: false, error: 'Destino não pode estar vazio' };
    }

    if (distance <= 0) {
      return { valid: false, error: 'Distância deve ser maior que zero' };
    }

    if (distance > 50000) {
      return { valid: false, error: 'Distância máxima: 50.000 km' };
    }

    return { valid: true };
  }

  // Calcula créditos mínimos para começar (10% do total)
  static calculateMinimumCredits(route: Route): number {
    return Math.ceil(route.basePrice * 0.1);
  }
}
