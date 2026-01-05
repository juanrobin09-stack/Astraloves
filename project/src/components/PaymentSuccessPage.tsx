import { useEffect, useState } from 'react';
import { CheckCircle, Loader2, Star, Crown } from 'lucide-react';

interface PaymentSuccessPageProps {
  onNavigate: (page: string) => void;
}

export default function PaymentSuccessPage({ onNavigate }: PaymentSuccessPageProps) {
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'subscription' | 'stars' | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
      setTimeout(() => {
        const urlType = params.get('type');
        setType(urlType as 'subscription' | 'stars');
        setLoading(false);
      }, 2000);
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-xl">Vérification du paiement...</p>
          <p className="text-gray-400 mt-2">Patiente quelques instants</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-gray-900 rounded-3xl p-8 border-2 border-green-600 text-center">
        <div className="mb-6">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Paiement réussi !</h1>
        </div>

        {type === 'subscription' ? (
          <>
            <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border border-yellow-600 rounded-2xl p-6 mb-6">
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <p className="text-xl font-bold mb-2">Ton abonnement Premium+ est actif</p>
              <p className="text-gray-400">Tu as maintenant accès à toutes les fonctionnalités Premium</p>
            </div>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                40 Messages Astra/jour
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                Analyses Premium détaillées
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                Profil mis en avant
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                Accès aux lives Premium+
              </li>
            </ul>
          </>
        ) : type === 'stars' ? (
          <>
            <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border border-yellow-600 rounded-2xl p-6 mb-6">
              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-3 fill-current" />
              <p className="text-xl font-bold mb-2">Tes étoiles ont été ajoutées !</p>
              <p className="text-gray-400">Tu peux maintenant les utiliser pour envoyer des cadeaux</p>
            </div>
          </>
        ) : (
          <p className="text-gray-400 mb-8">Ton paiement a été traité avec succès</p>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => onNavigate('profile')}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all"
          >
            Voir mon profil
          </button>
          <button
            onClick={() => onNavigate('swipe')}
            className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all"
          >
            Commencer
          </button>
        </div>
      </div>
    </div>
  );
}
