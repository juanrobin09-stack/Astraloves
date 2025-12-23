import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, DollarSign, Star, Gift, Download, Crown, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getCreatorStats, requestWithdrawal, COMMISSION_RATES, STARS_TO_EUROS_RATE } from '../lib/giftTransactions';

interface CreatorEarningsPageProps {
  onBack: () => void;
}

interface CreatorStats {
  totalEarnings: number;
  totalCommissionPaid: number;
  withdrawableBalance: number;
  starsBalance: number;
  premiumTier: string;
  currentCommissionRate: number;
  totalGiftsReceived: number;
  averageGift: number;
  recentTransactions: any[];
  isCreator: boolean;
}

export default function CreatorEarningsPage({ onBack }: CreatorEarningsPageProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    const data = await getCreatorStats(user.id);
    setStats(data);
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Chargement...</div>;
  }

  if (!stats || !stats.isCreator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20 p-6">
        <button onClick={onBack} className="mb-6 text-white/80 hover:text-white flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>
        <div className="max-w-2xl mx-auto text-center bg-gray-900/50 border border-gray-800 rounded-2xl p-12">
          <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Deviens Créateur</h2>
          <p className="text-gray-400 mb-6">
            Reçois ton premier cadeau pendant un live pour débloquer tes statistiques de gains
          </p>
        </div>
      </div>
    );
  }

  const tierInfo = {
    free: { name: 'Gratuit', icon: '🆓', color: 'gray' },
    premium: { name: 'Premium', icon: '💎', color: 'yellow' },
    'premium+elite': { name: 'Premium+ Elite', icon: '👑', color: 'purple' },
  };

  const currentTier = tierInfo[stats.premiumTier as keyof typeof tierInfo] || tierInfo.free;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <button onClick={onBack} className="mb-6 text-white/80 hover:text-white flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">💰 Mes Gains</h1>
          <p className="text-gray-400">Statistiques et revenus de tes lives</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Total Earnings */}
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-600/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="text-green-400 text-sm font-semibold">Total</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.totalEarnings} ⭐</div>
            <div className="text-sm text-gray-400">≈ {(stats.totalEarnings * STARS_TO_EUROS_RATE).toFixed(2)}€</div>
          </div>

          {/* Withdrawable */}
          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-600/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-blue-500" />
              <span className="text-blue-400 text-sm font-semibold">Retirable</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.withdrawableBalance.toFixed(2)}€</div>
            <div className="text-sm text-gray-400">Min. 50€ pour retrait</div>
          </div>

          {/* Stars Balance */}
          <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-600/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="text-yellow-400 text-sm font-semibold">Solde</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.starsBalance} ⭐</div>
            <div className="text-sm text-gray-400">Étoiles disponibles</div>
          </div>

          {/* Total Gifts */}
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-600/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Gift className="w-8 h-8 text-purple-500" />
              <span className="text-purple-400 text-sm font-semibold">Cadeaux</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.totalGiftsReceived}</div>
            <div className="text-sm text-gray-400">Moy: {stats.averageGift} ⭐</div>
          </div>
        </div>

        {/* Commission Info */}
        <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                {currentTier.icon} Ton Plan : {currentTier.name}
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                Commission actuelle : <span className="text-red-400 font-bold">{(stats.currentCommissionRate * 100).toFixed(0)}%</span>
              </p>
              <div className="text-sm text-gray-500">
                Commission totale payée : {stats.totalCommissionPaid} ⭐ (≈ {(stats.totalCommissionPaid * STARS_TO_EUROS_RATE).toFixed(2)}€)
              </div>
            </div>

            {stats.premiumTier !== 'premium+elite' && (
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-600/30 rounded-lg p-4">
                <div className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Upgrade ton plan
                </div>
                <div className="text-xs text-gray-300 space-y-1 mb-3">
                  {stats.premiumTier === 'free' && (
                    <>
                      <div>Premium : 15% commission (-50%)</div>
                      <div>Premium+ Elite : 5% commission (-83%)</div>
                    </>
                  )}
                  {stats.premiumTier === 'premium' && (
                    <div>Premium+ Elite : 5% commission (-67%)</div>
                  )}
                </div>
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all">
                  Passer Premium{stats.premiumTier === 'premium' ? '+ Elite' : ''}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Withdraw Button */}
        {stats.withdrawableBalance >= 50 && (
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-600/30 rounded-xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Prêt à retirer ?</h3>
                <p className="text-gray-400 text-sm">
                  Tu peux demander un virement de {stats.withdrawableBalance.toFixed(2)}€
                </p>
              </div>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-all"
              >
                <Download className="w-5 h-5" />
                Demander un retrait
              </button>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Derniers cadeaux reçus</h3>
          {stats.recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun cadeau reçu pour le moment</p>
          ) : (
            <div className="space-y-3">
              {stats.recentTransactions.map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-black/50 border border-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Cadeau reçu</div>
                      <div className="text-gray-500 text-xs">
                        {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">+{tx.amount} ⭐</div>
                    <div className="text-gray-500 text-xs">≈ {(tx.amount * STARS_TO_EUROS_RATE).toFixed(2)}€</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commission Comparison */}
        <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">💡 Comprends les commissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/50 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm font-semibold mb-2">🆓 Gratuit</div>
              <div className="text-2xl font-bold text-red-400 mb-1">30%</div>
              <div className="text-xs text-gray-500">Sur 100 ⭐ reçues, tu gardes 70 ⭐</div>
            </div>
            <div className="bg-black/50 border border-yellow-600/30 rounded-lg p-4">
              <div className="text-yellow-400 text-sm font-semibold mb-2">💎 Premium</div>
              <div className="text-2xl font-bold text-yellow-400 mb-1">15%</div>
              <div className="text-xs text-gray-500">Sur 100 ⭐ reçues, tu gardes 85 ⭐</div>
            </div>
            <div className="bg-black/50 border border-purple-600/30 rounded-lg p-4">
              <div className="text-purple-400 text-sm font-semibold mb-2">👑 Premium+ Elite</div>
              <div className="text-2xl font-bold text-purple-400 mb-1">5%</div>
              <div className="text-xs text-gray-500">Sur 100 ⭐ reçues, tu gardes 95 ⭐</div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          balance={stats.withdrawableBalance}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={() => {
            setShowWithdrawModal(false);
            loadStats();
          }}
        />
      )}
    </div>
  );
}

function WithdrawModal({
  balance,
  onClose,
  onSuccess,
}: {
  balance: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [amount, setAmount] = useState(balance);
  const [method, setMethod] = useState('bank_transfer');
  const [iban, setIban] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || submitting) return;

    setSubmitting(true);

    const amountStars = Math.floor(amount / STARS_TO_EUROS_RATE);

    const result = await requestWithdrawal(user.id, amountStars, method, { iban });

    if (result.success) {
      alert('✅ Demande de retrait envoyée ! Tu recevras une confirmation sous 48h.');
      onSuccess();
    } else {
      alert(`❌ ${result.error}`);
    }

    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-green-600/30 rounded-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Demander un retrait</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Montant</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              max={balance}
              min={50}
              step={10}
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
            />
            <p className="text-xs text-gray-500 mt-1">Disponible : {balance.toFixed(2)}€</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Méthode de paiement</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
            >
              <option value="bank_transfer">Virement bancaire</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">IBAN</label>
            <input
              type="text"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || amount < 50 || !iban}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Envoi...' : 'Confirmer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
