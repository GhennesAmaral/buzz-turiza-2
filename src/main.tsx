import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { LoginScreen } from './components/ui/LoginScreen';
import { AddCreditsScreen } from './components/ui/AddCreditsScreen';
import { RouteSelection } from './components/ui/RouteSelection';
import { BusGame } from './components/game/BusGame';
import { FuelStation } from './components/ui/FuelStation';
import { Player, Route } from './types/game';
import { RouteSystem } from './lib/systems/RouteSystem';

type GameScreen = 'login' | 'add-credits' | 'route-selection' | 'playing' | 'refueling' | 'completed' | 'failed';

function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('login');
  const [player, setPlayer] = useState<Player | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [totalInvested, setTotalInvested] = useState(0);

  const handleLogin = (loggedPlayer: Player) => {
    setPlayer(loggedPlayer);
    
    // Se for visitante (já tem créditos), vai direto para seleção de rota
    if (loggedPlayer.id === 'guest') {
      setCurrentScreen('route-selection');
    } else {
      // Se for cadastro novo, vai para tela de adicionar créditos
      setCurrentScreen('add-credits');
    }
  };

  const handleAddCredits = (credits: number) => {
    if (!player) return;
    
    setPlayer({
      ...player,
      totalCredits: player.totalCredits + credits
    });
    
    setCurrentScreen('route-selection');
  };

  const handleSkipCredits = () => {
    setCurrentScreen('route-selection');
  };

  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);
    setTotalInvested(0);
    setCurrentScreen('playing');
  };

  const handleNeedFuel = () => {
    setCurrentScreen('refueling');
  };

  const handlePurchaseFuel = (amount: number, credits: number) => {
    if (!player) return;

    setPlayer({
      ...player,
      totalCredits: player.totalCredits + credits
    });

    setTotalInvested(prev => prev + amount);
    setCurrentScreen('playing');
  };

  const handleCancelRefuel = () => {
    // Volta para seleção de rota (abandona a viagem)
    if (confirm('⚠️ Se você voltar agora, perderá todo o investimento desta viagem. Deseja continuar?')) {
      setCurrentScreen('route-selection');
      setSelectedRoute(null);
      setTotalInvested(0);
    }
  };

  const handleGameEnd = (completed: boolean, invested: number) => {
    setTotalInvested(invested);
    setCurrentScreen(completed ? 'completed' : 'failed');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('route-selection');
    setSelectedRoute(null);
    setTotalInvested(0);
  };

  // Tela de Login
  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Tela de Adicionar Créditos
  if (currentScreen === 'add-credits' && player) {
    return (
      <AddCreditsScreen 
        onContinue={handleAddCredits}
        onSkip={handleSkipCredits}
      />
    );
  }

  // Tela de Seleção de Rota
  if (currentScreen === 'route-selection' && player) {
    return (
      <RouteSelection
        onSelectRoute={handleSelectRoute}
        playerCredits={player.totalCredits}
      />
    );
  }

  // Tela de Jogo
  if (currentScreen === 'playing' && player && selectedRoute) {
    return (
      <BusGame
        route={selectedRoute}
        initialCredits={player.totalCredits}
        onGameEnd={handleGameEnd}
        onNeedFuel={handleNeedFuel}
      />
    );
  }

  // Tela de Abastecimento
  if (currentScreen === 'refueling' && player) {
    return (
      <FuelStation
        currentCredits={player.totalCredits}
        onPurchase={handlePurchaseFuel}
        onCancel={handleCancelRefuel}
      />
    );
  }

  // Tela de Vitória
  if (currentScreen === 'completed' && selectedRoute) {
    const paymentProgress = RouteSystem.calculatePaymentProgress(totalInvested, selectedRoute);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-green-700 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Parabéns!
          </h1>
          <h2 className="text-3xl font-bold text-green-600 mb-6">
            Você completou a rota!
          </h2>

          <div className="bg-green-50 rounded-2xl p-6 mb-6">
            <p className="text-xl text-gray-700 mb-4">
              <strong>{selectedRoute.name}</strong>
            </p>
            <p className="text-gray-600">
              {selectedRoute.origin} → {selectedRoute.destination}
            </p>
            <p className="text-2xl font-bold text-green-600 mt-4">
              {selectedRoute.distance} km percorridos!
            </p>
          </div>

          <div className="bg-gradient-to-r from-[#0066CC] to-[#FF6B00] rounded-2xl p-6 text-white mb-6">
            <h3 className="text-2xl font-bold mb-4">💰 Resumo Financeiro</h3>
            <div className="space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span>Total investido:</span>
                <span className="font-bold text-2xl">R$ {totalInvested.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Valor da passagem:</span>
                <span className="font-bold text-2xl">R$ {selectedRoute.basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/30">
                <span>Progresso do pagamento:</span>
                <span className="font-bold text-2xl">{paymentProgress.percentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {paymentProgress.percentage >= 100 ? (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
              <div className="text-6xl mb-4">🎟️</div>
              <h3 className="text-2xl font-bold text-yellow-800 mb-2">
                Passagem Desbloqueada!
              </h3>
              <p className="text-yellow-700">
                Você pagou o valor total da passagem e ganhou o direito de viajar nesta rota!
              </p>
              <p className="text-sm text-yellow-600 mt-2">
                Entre em contato com a Turiza para resgatar sua passagem.
              </p>
            </div>
          ) : (
            <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-bold text-orange-800 mb-2">
                Quase lá! 🚀
              </h3>
              <p className="text-orange-700">
                Você ainda precisa de <strong>R$ {paymentProgress.remaining.toFixed(2)}</strong> para desbloquear a passagem completa.
              </p>
              <p className="text-sm text-orange-600 mt-2">
                Continue jogando outras rotas para acumular mais créditos!
              </p>
            </div>
          )}

          <button
            onClick={handleBackToMenu}
            className="w-full py-4 bg-[#0066CC] text-white text-xl font-bold rounded-xl hover:bg-[#0052A3] transition-colors"
          >
            🗺️ Escolher Nova Rota
          </button>
        </div>
      </div>
    );
  }

  // Tela de Derrota
  if (currentScreen === 'failed' && selectedRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-8xl mb-6">😢</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Que pena!
          </h1>
          <h2 className="text-3xl font-bold text-red-600 mb-6">
            Você não completou a rota
          </h2>

          <div className="bg-red-50 rounded-2xl p-6 mb-6">
            <p className="text-xl text-gray-700 mb-4">
              <strong>{selectedRoute.name}</strong>
            </p>
            <p className="text-gray-600 mb-4">
              Seu ônibus ficou sem combustível e você não conseguiu continuar a viagem.
            </p>
            <div className="bg-white rounded-xl p-4">
              <p className="text-red-600 font-bold text-lg">
                ⚠️ Investimento perdido: R$ {totalInvested.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Ao abandonar a rota, você perde todo o valor investido.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-400 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-blue-800 mb-2">
              💡 Dicas para próxima vez:
            </h3>
            <ul className="text-left text-blue-700 space-y-2">
              <li>✅ Abasteça antes do combustível acabar completamente</li>
              <li>✅ Reduza a velocidade em obstáculos para economizar combustível</li>
              <li>✅ Escolha rotas mais fáceis primeiro para ganhar experiência</li>
              <li>✅ Gerencie bem seus créditos durante a viagem</li>
            </ul>
          </div>

          <button
            onClick={handleBackToMenu}
            className="w-full py-4 bg-[#0066CC] text-white text-xl font-bold rounded-xl hover:bg-[#0052A3] transition-colors"
          >
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// Inicialização única e estável
const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
