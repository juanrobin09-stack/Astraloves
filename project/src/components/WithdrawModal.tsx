import { useState } from 'react';
import { X } from 'lucide-react';

interface WithdrawModalProps {
  user: any;
  onClose: () => void;
}

export default function WithdrawModal({ user, onClose }: WithdrawModalProps) {
  const [amount, setAmount] = useState(5000);
  const [iban, setIban] = useState('');
  const [name, setName] = useState('');

  const totalEarnings = user?.total_earnings || 0;
  const amountEuros = (amount * 0.01).toFixed(2);
  const canWithdraw = totalEarnings >= 5000;

  const handleWithdraw = async () => {
    if (!canWithdraw) {
      alert('Minimum 5000 ⭐ (50€) requis');
      return;
    }

    if (!iban || !name) {
      alert('Remplis tes coordonnées bancaires');
      return;
    }

    try {
      console.log('Withdraw request:', { amount, iban, name });
      alert('✅ Demande de retrait envoyée ! Virement sous 3-5 jours.');
      onClose();
    } catch (error) {
      alert('❌ Erreur lors du retrait');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-5" onClick={onClose}>
      <div className="relative w-full max-w-[500px] bg-[#0a0a0a] border-2 border-red-500 rounded-3xl p-8" onClick={(e) => e.stopPropagation()}>

        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 bg-red-500/20 rounded-full text-white hover:bg-red-500/30 transition-all flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-3xl font-bold text-white mb-2">💸 Retirer tes gains</h2>
        <p className="text-sm text-gray-400 mb-6">Convertis tes étoiles en argent réel</p>

        {/* MONTANT */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-3">Montant à retirer</label>
          <input
            type="range"
            min="5000"
            max={totalEarnings}
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            className="w-full mb-3 accent-red-500"
            disabled={!canWithdraw}
          />
          <div className="flex justify-between text-2xl font-bold">
            <span className="text-red-500">{amount} ⭐</span>
            <span className="text-white">{amountEuros}€</span>
          </div>
        </div>

        {/* IBAN */}
        <div className="mb-5">
          <label className="block text-sm text-gray-400 mb-2">IBAN</label>
          <input
            type="text"
            placeholder="FR76 1234 5678 9012 3456 7890 123"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border-2 border-gray-800 rounded-xl text-white text-base focus:outline-none focus:border-red-500 transition-all"
          />
        </div>

        {/* NOM */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Nom du titulaire</label>
          <input
            type="text"
            placeholder="Prénom NOM"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border-2 border-gray-800 rounded-xl text-white text-base focus:outline-none focus:border-red-500 transition-all"
          />
        </div>

        {/* BOUTON CONFIRMATION */}
        <button
          onClick={handleWithdraw}
          disabled={!canWithdraw}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-white text-base font-bold shadow-lg shadow-red-600/50 hover:shadow-xl hover:shadow-red-600/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          💸 Confirmer le retrait de {amountEuros}€
        </button>

        <p className="text-xs text-center text-gray-500">
          Délai : 3-5 jours ouvrés • 🔒 Paiement sécurisé
        </p>
      </div>
    </div>
  );
}
