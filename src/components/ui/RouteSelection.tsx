import { useState } from 'react';
import { Route } from '../../types/game';

interface RouteSelectionProps {
  onSelectRoute: (route: Route) => void;
  playerCredits: number;
}

export function RouteSelection({ onSelectRoute, playerCredits }: RouteSelectionProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const PRICE_PER_KM = 0.80;

  const calculateRoute = () => {
    if (!origin.trim() || !destination.trim()) {
      alert('⚠️ Por favor, preencha origem e destino');
      return;
    }

    setIsCalculating(true);

    // Abre Google Maps em nova aba para o jogador ver a rota
    const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`;
    window.open(mapsUrl, '_blank');

    // Simula cálculo (em produção, usaria Google Maps API)
    setTimeout(() => {
      setIsCalculating(false);
      alert('📍 Veja a rota no Google Maps que acabou de abrir.\n\n💡 Anote a distância em KM e digite abaixo para calcular o preço da viagem.');
    }, 1000);
  };

  const handleDistanceSubmit = () => {
    if (!distance || distance <= 0) {
      alert('⚠️ Digite uma distância válida em KM');
      return;
    }

    if (!origin.trim() || !destination.trim()) {
      alert('⚠️ Preencha origem e destino primeiro');
      return;
    }

    const totalPrice = distance * PRICE_PER_KM;
    const requiredCredits = Math.ceil(totalPrice * 0.1); // 10% para começar

    if (playerCredits < requiredCredits) {
      alert(`⚠️ Você precisa de pelo menos R$ ${requiredCredits.toFixed(2)} em créditos para começar esta rota.\n\nSeus créditos atuais: R$ ${playerCredits.toFixed(2)}`);
      return;
    }

    // Determina dificuldade baseada na distância
    let difficulty: Route['difficulty'] = 'easy';
    if (distance > 2000) difficulty = 'extreme';
    else if (distance > 1000) difficulty = 'hard';
    else if (distance > 500) difficulty = 'medium';

    const customRoute: Route = {
      id: `custom-${Date.now()}`,
      name: `${origin} → ${destination}`,
      origin: origin,
      destination: destination,
      distance: distance,
      difficulty: difficulty,
      basePrice: totalPrice,
      estimatedTime: Math.ceil(distance / 80) * 60, // ~80km/h média
      terrain: ['highway', 'hills', 'urban']
    };

    onSelectRoute(customRoute);
  };

  const getDifficultyInfo = (dist: number) => {
    if (dist > 2000) return { label: 'Extremo', color: 'text-red-600', emoji: '🔥' };
    if (dist > 1000) return { label: 'Difícil', color: 'text-orange-600', emoji: '⚠️' };
    if (dist > 500) return { label: 'Médio', color: 'text-yellow-600', emoji: '⚡' };
    return { label: 'Fácil', color: 'text-green-600', emoji: '✅' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0066CC] via-[#004499] to-[#002266] overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 pb-20">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">🗺️ Monte sua Rota</h1>
          <p className="text-white/80 text-lg">
            Seus créditos: <span className="text-[#FF6B00] font-bold">R$ {playerCredits.toFixed(2)}</span>
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🌍 Escolha qualquer lugar do mundo!
          </h2>

          {/* Formulário */}
          <div className="space-y-4 mb-6">
            {/* Origem */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                📍 Origem (cidade, estado ou país)
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Ex: São Paulo, SP"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#0066CC] focus:outline-none text-gray-900"
              />
            </div>

            {/* Destino */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                🎯 Destino (cidade, estado ou país)
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ex: Rio de Janeiro, RJ"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#0066CC] focus:outline-none text-gray-900"
              />
            </div>

            {/* Botão Calcular Rota */}
            <button
              onClick={calculateRoute}
              disabled={isCalculating || !origin.trim() || !destination.trim()}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCalculating ? '⏳ Calculando...' : '🗺️ Ver Rota no Google Maps'}
            </button>

            {/* Distância */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                📏 Distância da viagem (em KM)
              </label>
              <input
                type="number"
                value={distance || ''}
                onChange={(e) => setDistance(Number(e.target.value))}
                placeholder="Digite a distância que apareceu no Google Maps"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#0066CC] focus:outline-none text-gray-900"
                min="1"
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Abra o Google Maps acima e anote a distância total em KM
              </p>
            </div>
          </div>

          {/* Preview do Cálculo */}
          {distance && distance > 0 && (
            <div className="bg-gradient-to-r from-[#0066CC] to-[#004499] rounded-xl p-6 mb-6 text-white">
              <h3 className="text-xl font-bold mb-4 text-center">💰 Cálculo da Viagem</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Distância:</span>
                  <span className="font-bold text-xl">{distance} km</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Preço por KM:</span>
                  <span className="font-bold">R$ {PRICE_PER_KM.toFixed(2)}</span>
                </div>

                <div className="border-t border-white/30 pt-3 flex justify-between items-center">
                  <span className="text-lg">Valor Total da Passagem:</span>
                  <span className="font-bold text-2xl text-[#FF6B00]">
                    R$ {(distance * PRICE_PER_KM).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Créditos para começar (10%):</span>
                  <span className="font-bold text-lg">
                    R$ {(distance * PRICE_PER_KM * 0.1).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Tempo estimado:</span>
                  <span className="font-bold">
                    ~{Math.ceil(distance / 80)} horas
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Dificuldade:</span>
                  <span className={`font-bold text-lg ${getDifficultyInfo(distance).color}`}>
                    {getDifficultyInfo(distance).emoji} {getDifficultyInfo(distance).label}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Botão Iniciar Viagem */}
          <button
            onClick={handleDistanceSubmit}
            disabled={!distance || distance <= 0 || !origin.trim() || !destination.trim()}
            className="w-full py-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white text-xl font-bold rounded-xl hover:from-[#FF8533] hover:to-[#FFA366] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            🚌 Iniciar Viagem
          </button>
        </div>

        {/* Informações */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white mb-6">
          <h3 className="text-xl font-bold mb-4">💡 Como funciona?</h3>
          <ul className="space-y-2 text-sm">
            <li>✅ <strong>Escolha qualquer rota do mundo</strong> - Brasil, América do Sul, Europa, etc.</li>
            <li>🗺️ <strong>Use o Google Maps</strong> para ver a rota real e a distância exata</li>
            <li>💰 <strong>Preço fixo:</strong> R$ {PRICE_PER_KM.toFixed(2)} por KM rodado</li>
            <li>⚡ <strong>Comece com 10%</strong> do valor total em créditos</li>
            <li>🎮 <strong>Enfrente obstáculos:</strong> curvas, morros, congestionamentos, acidentes</li>
            <li>⛽ <strong>Gerencie combustível:</strong> quando acabar, você precisa abastecer</li>
            <li>🎯 <strong>Complete a rota:</strong> ganhe uma passagem real de ônibus!</li>
            <li>⚠️ <strong>Abandone a rota:</strong> perde todo o investimento</li>
          </ul>
        </div>

        {/* Exemplos de Rotas */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">🌟 Exemplos de Rotas Populares</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="font-semibold">🇧🇷 São Paulo → Rio de Janeiro</p>
              <p className="text-white/80">~430 km | R$ {(430 * PRICE_PER_KM).toFixed(2)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="font-semibold">🇧🇷 São Paulo → Florianópolis</p>
              <p className="text-white/80">~700 km | R$ {(700 * PRICE_PER_KM).toFixed(2)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="font-semibold">🇧🇷 São Paulo → Salvador</p>
              <p className="text-white/80">~1.960 km | R$ {(1960 * PRICE_PER_KM).toFixed(2)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="font-semibold">🌎 São Paulo → Buenos Aires</p>
              <p className="text-white/80">~3.000 km | R$ {(3000 * PRICE_PER_KM).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
