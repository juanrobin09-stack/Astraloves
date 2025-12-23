import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Star, Mail, ArrowLeft } from 'lucide-react';

type AstraAuthProps = {
  onBack: () => void;
  onSwitchToSignup: () => void;
};

export default function AstraAuth({ onBack, onSwitchToSignup }: AstraAuthProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);


  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('[Astra] Sending magic link to:', email);

    try {
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (magicLinkError) {
        console.error('[Astra] Magic link error:', magicLinkError);
        setError(magicLinkError.message || 'Erreur lors de l\'envoi du lien');
      } else {
        console.log('[Astra] Magic link sent successfully');
        setCodeSent(true);
      }
    } catch (err: any) {
      console.error('[Astra] Magic link exception:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };


  if (codeSent) {
    return (
      <div className="min-h-screen velvet-bg relative overflow-hidden flex items-center justify-center p-4">
        <div className="stars-bg absolute inset-0 opacity-30" />

        <div className="relative z-10 w-full max-w-md">
          <button
            onClick={() => {
              setCodeSent(false);
              setError('');
            }}
            className="text-white hover:text-red-600 flex items-center gap-2 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>

          <div className="premium-card rounded-3xl p-10 text-center">
            <div className="flex justify-center mb-6">
              <Mail className="w-20 h-20 text-white premium-glow animate-pulse-glow" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 premium-text">
              Lien envoyé !
            </h2>
            <p className="text-gray-300 text-lg mb-2 leading-relaxed">
              Clique dessus dans ton mail pour continuer.
            </p>
            <p className="text-white font-semibold text-lg mb-8">
              {email}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="mt-6 text-center space-y-3">
              <button
                onClick={handleSendMagicLink}
                disabled={loading}
                className="text-gray-400 hover:text-white transition-colors text-sm underline"
              >
                Renvoyer le lien
              </button>
              <div className="bg-black/40 rounded-xl p-4">
                <p className="text-gray-400 text-xs">
                  Lien valable 60 minutes
                </p>
              </div>
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-white transition-colors text-xs underline"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen velvet-bg relative overflow-hidden flex items-center justify-center p-4">
      <div className="stars-bg absolute inset-0 opacity-30" />

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={onBack}
          className="text-white hover:text-red-600 flex items-center gap-2 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Star className="w-20 h-20 text-white premium-glow animate-pulse-glow" fill="white" />
          </div>
          <h1 className="text-5xl font-bold mb-3 premium-text tracking-wider">ASTRA</h1>
          <p className="text-gray-300 text-lg">Bon retour parmi nous</p>
        </div>

        <div className="premium-card rounded-3xl p-10">
          <h2 className="text-3xl font-bold text-white mb-2 text-center premium-text-sm">
            Connexion
          </h2>
          <p className="text-gray-400 text-center mb-8">
            Entre ton email pour recevoir ton lien de connexion
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSendMagicLink} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-3 text-sm">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton.email@exemple.com"
                className="w-full px-5 py-4 premium-input rounded-xl text-white placeholder-gray-500 text-lg"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full premium-button text-white font-bold py-5 px-6 rounded-xl text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <span>Recevoir mon lien de connexion</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Pas encore de compte ?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-white premium-text-sm hover:underline font-semibold"
              >
                Créer un compte
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
