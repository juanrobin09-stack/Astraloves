import { useState, useEffect } from 'react';
import { X, TrendingUp, Gift, DollarSign, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { STARS_TO_EUROS_RATE } from '../lib/giftTransactions';

interface EarningsQuickViewProps {
  onClose: () => void;
  onViewFullDashboard?: () => void;
}

interface Transaction {
  id: string;
  amount: number;
  created_at: string;
  gift_id: string;
  recipient_id: string;
  creator_gain: number;
  commission_rate: number;
}

export default function EarningsQuickView({ onClose, onViewFullDashboard }: EarningsQuickViewProps) {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawableBalance, setWithdrawableBalance] = useState(0);

  useEffect(() => {
    if (user) {
      fetchEarningsAndTransactions();
    }
  }, [user]);

  const fetchEarningsAndTransactions = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Récupérer les gains totaux
      const { data: userData, error: userError } = await supabase
        .from('astra_profiles')
        .select('total_earnings, withdrawable_balance')
        .eq('id', user.id)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching earnings:', userError);
      } else {
        setEarnings(userData?.total_earnings || 0);
        setWithdrawableBalance(userData?.withdrawable_balance || 0);
      }

      // Récupérer les transactions récentes
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('stars_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'gift_received')
        .order('created_at', { ascending: false })
        .limit(5);

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
      } else {
        setTransactions(transactionsData || []);
      }
    } catch (error) {
      console.error('Error in fetchEarningsAndTransactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gradient-to-br from-black via-red-900 to-black rounded-2xl border-2 border-red-600 p-8">
          <div className="text-red-500 text-center text-lg font-semibold">Chargement des données...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-black via-red-900/50 to-black rounded-2xl border-2 border-red-600 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-red-900/50">

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-black via-red-900 to-black border-b-2 border-red-600 p-6 flex items-center justify-between z-10">
          <h2 className="text-3xl font-extrabold text-yellow-400 flex items-center gap-2">
            <TrendingUp className="w-8 h-8" />
            Mes Gains & Commissions
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-red-900/50 hover:bg-red-800 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-600/50 rounded-xl p-4 shadow-lg">
              <div className="text-yellow-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Total Gagné
              </div>
              <div className="text-3xl font-bold text-white mb-1">{earnings} ⭐</div>
              <div className="text-xs text-gray-400">≈ {(earnings * STARS_TO_EUROS_RATE).toFixed(2)}€</div>
            </div>

            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-600/50 rounded-xl p-4 shadow-lg">
              <div className="text-green-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Retirable
              </div>
              <div className="text-3xl font-bold text-white mb-1">{withdrawableBalance.toFixed(2)}€</div>
              <div className="text-xs text-gray-400">Min. 50€ requis</div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h3 className="font-bold text-red-400 mb-3 text-lg">Transactions Récentes</h3>
            {transactions.length === 0 ? (
              <div className="bg-black/70 border border-red-700 rounded-xl p-6 text-center">
                <Gift className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Aucune transaction récente</p>
                <p className="text-gray-500 text-sm mt-1">Les cadeaux reçus apparaîtront ici</p>
              </div>
            ) : (
              <ul className="max-h-64 overflow-y-auto space-y-3 border-2 border-red-700/50 rounded-xl p-4 bg-black/70">
                {transactions.map((tx) => (
                  <li
                    key={tx.id}
                    className="flex justify-between items-center bg-gradient-to-r from-red-900/40 to-red-900/20 rounded-lg p-4 border border-red-800/50 hover:border-red-600/50 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-purple-400" />
                        <span className="font-semibold text-white">Cadeau reçu</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        <span className="text-green-400 font-bold">+{tx.creator_gain} ⭐</span>
                        {tx.commission_rate && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({(tx.commission_rate * 100).toFixed(0)}% commission)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">
                        {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(tx.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {withdrawableBalance >= 50 ? (
              <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-8 py-4 rounded-xl font-bold shadow-lg shadow-yellow-900/50 transition transform hover:scale-[1.02] flex items-center justify-center gap-2">
                <DollarSign className="w-5 h-5" />
                Demander un retrait ({withdrawableBalance.toFixed(2)}€)
              </button>
            ) : (
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">
                  Encore {(50 - withdrawableBalance).toFixed(2)}€ à gagner pour pouvoir retirer
                </p>
              </div>
            )}

            {onViewFullDashboard && (
              <button
                onClick={onViewFullDashboard}
                className="w-full bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Voir le Dashboard Complet
              </button>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4">
            <div className="text-xs text-blue-200 space-y-1">
              <p className="font-semibold mb-2">💡 Optimise tes gains :</p>
              <ul className="space-y-1 text-blue-300">
                <li>• Gratuit : 30% commission → Tu gardes 70%</li>
                <li>• Premium : 15% commission → Tu gardes 85%</li>
                <li>• Premium+ Elite : 5% commission → Tu gardes 95%</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
