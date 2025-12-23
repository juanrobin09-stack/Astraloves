import { useEffect, useState } from 'react';
import { CheckCircle, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VerifyEmailPageProps {
  onSuccess: () => void;
}

export default function VerifyEmailPage({ onSuccess }: VerifyEmailPageProps) {
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));

        const tokenHash = queryParams.get('token_hash') || hashParams.get('token_hash');
        const type = queryParams.get('type') || hashParams.get('type');
        const accessToken = queryParams.get('access_token') || hashParams.get('access_token');

        if (!tokenHash && !accessToken) {
          setError('Lien de vérification invalide');
          setVerifying(false);
          return;
        }

        if (type === 'signup' || type === 'email') {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) throw sessionError;

          if (session) {
            setVerified(true);
            setTimeout(() => {
              onSuccess();
            }, 2000);
          } else {
            setError('Session introuvable');
          }
        } else {
          setError('Type de vérification inconnu');
        }
      } catch (err: any) {
        console.error('Email verification error:', err);
        setError(err.message || 'Erreur lors de la vérification');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [onSuccess]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-white animate-spin" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            Vérification en cours...
          </h1>

          <p className="text-gray-400 text-lg">
            Nous vérifions ton email, patiente quelques secondes
          </p>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            Email vérifié !
          </h1>

          <p className="text-gray-400 text-lg mb-8">
            Ton compte est maintenant actif
            <br />
            Redirection en cours...
          </p>

          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-xl opacity-50" />
            <div className="relative w-16 h-16 border-4 border-gray-800 border-t-red-500 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full blur-2xl opacity-30" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            Erreur de vérification
          </h1>

          <div className="mb-8 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl">
            <p className="text-red-400 font-medium">{error}</p>
          </div>

          <p className="text-gray-400 text-lg mb-8">
            Le lien de vérification est peut-être expiré ou invalide
          </p>

          <button
            onClick={() => window.location.href = '/'}
            className="relative px-8 py-4 rounded-xl font-bold text-white overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 transition-transform group-hover:scale-105" />
            <span className="relative z-10 flex items-center justify-center gap-3">
              <Mail className="w-5 h-5" />
              <span>Retour à l'accueil</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
