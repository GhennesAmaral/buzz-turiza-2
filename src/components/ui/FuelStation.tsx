import { useState } from 'react';
import { RouteSystem } from '../../lib/systems/RouteSystem';

interface FuelStationProps {
  currentCredits: number;
  onPurchase: (amount: number, credits: number) => void;
  onCancel: () => void;
}

export function FuelStation({ currentCredits, onPurchase, onCancel }: FuelStationProps) {
  const [amount, setAmount] = useState(5);

  const purchaseOptions = [5, 10, 20, 50, 100];

  const calculateCredits = (value: number) => {
    return RouteSystem.convertMoneyToCredits(value);
  };

  const handlePurchase = () => {
    const credits = calculateCredits(amount);
    onPurchase(amount, credits);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 my-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⛽</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Posto de Combustível</h2>
          <p className="text-gray-600">Abasteça para continuar sua viagem</p>
        </div>

        {/* Créditos atuais */}
        <div className="bg-[#0066CC]/10 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Seus créditos atuais:</p>
          <p className="text-3xl font-bold text-[#0066CC]">R$ {currentCredits.toFixed(2)}</p>
        </div>

        {/* Opções de compra rápida */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Valores rápidos:</p>
          <div className="grid grid-cols-5 gap-2">
            {purchaseOptions.map((value) => (
              <button
                key={value}
                onClick={() => setAmount(value)}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  amount === value
                    ? 'bg-[#0066CC] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                R$ {value}
              </button>
            ))}
          </div>
        </div>

        {/* Input customizado */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ou digite o valor:
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
              R$
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
              min="1"
              step="1"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-lg font-semibold"
            />
          </div>
        </div>

        {/* Conversão */}
        <div className="bg-gradient-to-r from-[#FF6B00]/10 to-[#FF6B00]/5 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Você paga:</span>
            <span className="text-xl font-bold text-gray-900">R$ {amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Você recebe:</span>
            <span className="text-xl font-bold text-[#FF6B00]">
              R$ {calculateCredits(amount).toFixed(2)} em créditos
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Taxa de conversão: R$ 1,00 = R$ 0,75 em créditos
            </p>
            <p className="text-xs text-[#FF6B00] text-center font-semibold mt-1">
              💡 Ao completar a rota, você ganha a passagem real!
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handlePurchase}
            className="flex-1 py-3 bg-[#0066CC] text-white rounded-lg font-semibold hover:bg-[#0052A3] transition-colors"
          >
            💳 Comprar
          </button>
        </div>

        {/* Aviso */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800 text-center">
            ⚠️ Se você abandonar a rota antes de completar, perderá todo o investimento
          </p>
        </div>
      </div>
    </div>
  );
}
