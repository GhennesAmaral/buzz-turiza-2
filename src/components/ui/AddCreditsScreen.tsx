import { useState } from 'react';

interface AddCreditsScreenProps {
  onContinue: (credits: number) => void;
  onSkip: () => void;
}

export function AddCreditsScreen({ onContinue, onSkip }: AddCreditsScreenProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const creditPackages = [
    { amount: 10, price: 10, bonus: 0, label: 'Iniciante' },
    { amount: 25, price: 25, bonus: 5, label: 'Básico' },
    { amount: 50, price: 50, bonus: 15, label: 'Popular' },
    { amount: 100, price: 100, bonus: 35, label: 'Premium' },
  ];

  const handlePurchase = () => {
    if (selectedAmount === null) {
      alert('⚠️ Selecione um pacote de créditos');
      return;
    }

    const selectedPackage = creditPackages.find(pkg => pkg.amount === selectedAmount);
    if (selectedPackage) {
      const totalCredits = selectedPackage.amount + selectedPackage.bonus;
      alert(`✅ Compra simulada com sucesso!\n\nVocê recebeu R$ ${totalCredits.toFixed(2)} em créditos.`);
      onContinue(totalCredits);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0066CC] via-[#004499] to-[#002266] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">💰 Adicionar Créditos</h1>
          <p className="text-white/80 text-lg">
            Escolha um pacote para começar a jogar e ganhar passagens reais!
          </p>
        </div>

        {/* Pacotes de Créditos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {creditPackages.map((pkg) => (
            <button
              key={pkg.amount}
              onClick={() => setSelectedAmount(pkg.amount)}
              className={`relative bg-white rounded-2xl p-6 transition-all transform hover:scale-105 ${
                selectedAmount === pkg.amount
                  ? 'ring-4 ring-[#FF6B00] shadow-2xl'
                  : 'hover:shadow-xl'
              }`}
            >
              {pkg.bonus > 0 && (
                <div className="absolute -top-3 -right-3 bg-[#FF6B00] text-white px-3 py-1 rounded-full text-sm font-bold">
                  +R$ {pkg.bonus} BÔNUS
                </div>
              )}

              <div className="text-center">
                <p className="text-gray-500 text-sm font-semibold mb-1">{pkg.label}</p>
                <p className="text-4xl font-bold text-[#0066CC] mb-2">
                  R$ {pkg.amount}
                </p>
                {pkg.bonus > 0 && (
                  <p className="text-green-600 font-semibold mb-2">
                    = R$ {pkg.amount + pkg.bonus} total
                  </p>
                )}
                <p className="text-gray-600 text-sm">
                  Por R$ {pkg.price.toFixed(2)}
                </p>
              </div>

              {selectedAmount === pkg.amount && (
                <div className="mt-4 text-center">
                  <span className="inline-block bg-[#FF6B00] text-white px-4 py-1 rounded-full text-sm font-bold">
                    ✓ Selecionado
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <button
            onClick={handlePurchase}
            disabled={selectedAmount === null}
            className="w-full py-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white text-xl font-bold rounded-xl hover:from-[#FF8533] hover:to-[#FFA366] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            💳 Comprar Créditos
          </button>

          <button
            onClick={onSkip}
            className="w-full py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
          >
            ⏭️ Pular por Enquanto (R$ 0,00)
          </button>
        </div>

        {/* Informações */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-3">💡 Por que adicionar créditos?</h3>
          <ul className="space-y-2 text-sm">
            <li>✅ Créditos são usados para começar rotas (30% do valor da passagem)</li>
            <li>⛽ Você precisa de créditos para abastecer durante a viagem</li>
            <li>🎯 Complete rotas e ganhe passagens reais de ônibus!</li>
            <li>💰 Quanto mais você joga, mais passagens você desbloqueia</li>
          </ul>
        </div>

        {/* Aviso */}
        <div className="mt-4 text-center text-white/60 text-xs">
          <p>⚠️ Esta é uma simulação. Em produção, integrar com gateway de pagamento real.</p>
        </div>
      </div>
    </div>
  );
}
