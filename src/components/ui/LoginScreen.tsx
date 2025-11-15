import { useState } from 'react';
import { Player } from '../../types/game';

interface LoginScreenProps {
  onLogin: (player: Player) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simula criação de jogador (em produção, integrar com backend)
    const player: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      totalCredits: 0,
      completedRoutes: [],
      currentRoute: null,
      createdAt: new Date()
    };

    onLogin(player);
  };

  const handleQuickPlay = () => {
    // Acesso rápido sem login
    const guestPlayer: Player = {
      id: 'guest',
      name: 'Visitante',
      email: '',
      totalCredits: 10, // Créditos iniciais para testar
      completedRoutes: [],
      currentRoute: null,
      createdAt: new Date()
    };

    onLogin(guestPlayer);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0066CC] via-[#004499] to-[#002266] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-2">🚌</h1>
          <h2 className="text-4xl font-bold text-white mb-2">Turiza</h2>
          <p className="text-xl text-[#FF6B00] font-semibold">Bus Challenge</p>
          <p className="text-white/80 mt-2">Dirija, complete rotas e ganhe passagens reais!</p>
        </div>

        {/* Card de Login/Registro */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                !isRegistering
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                isRegistering
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Registrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                  placeholder="Seu nome"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0066CC] text-white py-3 rounded-lg font-semibold hover:bg-[#0052A3] transition-colors"
            >
              {isRegistering ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleQuickPlay}
              className="w-full bg-[#FF6B00] text-white py-3 rounded-lg font-semibold hover:bg-[#E55A00] transition-colors"
            >
              🎮 Jogar Agora (Modo Visitante)
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Ganhe R$ 10 em créditos para testar!
            </p>
          </div>
        </div>

        {/* Informações */}
        <div className="mt-6 text-center text-white/80 text-sm">
          <p>🎯 Complete rotas e ganhe passagens reais de ônibus</p>
          <p>⚡ Enfrente obstáculos e desafios pelo caminho</p>
          <p>💰 Valores baixos para começar a jogar</p>
        </div>
      </div>
    </div>
  );
}
