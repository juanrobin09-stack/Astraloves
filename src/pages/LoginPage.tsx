import { useState } from 'react';
import { Star } from 'lucide-react';
import { authService } from '@/services/auth/authService';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await authService.signUp({ email, password });
      } else {
        await authService.signIn({ email, password });
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cosmic-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo animé */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <Star 
              className="w-16 h-16 animate-pulse" 
              fill="#dc2626" 
              strokeWidth={0}
              style={{ 
                filter: 'drop-shadow(0 0 15px #dc2626) drop-shadow(0 0 30px #dc2626)',
                animation: 'spin 20s linear infinite'
              }}
            />
          </div>
          <h1 className="text-5xl font-bold mb-2 text-white">
            ASTRA
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Trouvez votre âme sœur
          </p>
          <p className="text-lg text-red-400">
            grâce aux étoiles ✨
          </p>
        </div>

        {/* Card formulaire */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-red-500/20">
          {/* Toggle Login/Signup */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                !isSignUp
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                isSignUp
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none text-white placeholder-gray-500"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none text-white placeholder-gray-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30"
            >
              {loading ? 'Chargement...' : isSignUp ? "Créer mon compte" : "Se connecter"}
            </button>
          </form>
        </div>

        {/* Features */}
        <div className="mt-8 text-center space-y-2 text-gray-400 text-sm">
          <p>✨ Compatibilité astrologique</p>
          <p>🌟 Thème astral complet</p>
          <p>💫 Coach IA Astra</p>
        </div>
      </div>

      {/* Animation CSS pour rotation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
