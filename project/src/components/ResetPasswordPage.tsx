/*
 * ResetPasswordPage - Gestion de la réinitialisation de mot de passe
 *
 * FLUX:
 * 1. Extraction des tokens depuis l'URL hash (#type=recovery&access_token=...&refresh_token=...)
 * 2. Échange des tokens contre une session active (supabase.auth.setSession)
 * 3. Affichage du formulaire de changement de mot de passe
 * 4. Mise à jour du mot de passe (supabase.auth.updateUser)
 * 5. Redirection vers la page swipe après succès
 *
 * GESTION D'ERREURS:
 * - Lien invalide ou expiré: affiche un message avec bouton pour renvoyer un email
 * - Erreur de session: affiche un message d'erreur clair
 * - Erreur de mise à jour: affiche l'erreur et permet de réessayer
 */

import { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, Lock, ShieldCheck, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { parseNormalizedHash } from '../lib/hashUtils';

interface ResetPasswordPageProps {
  onSuccess: () => void;
  onCancel?: () => void;
  recoveryTokens?: { accessToken: string; refreshToken: string } | null;
}

type SessionCheckStatus = 'checking' | 'valid' | 'invalid' | 'expired';

export default function ResetPasswordPage({ onSuccess, onCancel, recoveryTokens }: ResetPasswordPageProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionStatus, setSessionStatus] = useState<SessionCheckStatus>('checking');
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailResent, setEmailResent] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      console.log('🔐 ResetPasswordPage - Session check start');

      try {
        let accessToken = '';
        let refreshToken = '';

        // ÉTAPE 1: Récupérer les tokens depuis les props OU depuis l'URL
        if (recoveryTokens) {
          console.log('🔐 Using tokens from props (saved by App.tsx)');
          accessToken = recoveryTokens.accessToken;
          refreshToken = recoveryTokens.refreshToken;
        } else {
          console.log('🔐 Trying to extract tokens from URL hash');
          // Fallback: essayer de lire depuis l'URL
          const rawHash = window.location.hash;
          const parsed = parseNormalizedHash(rawHash);
          const queryParams = new URLSearchParams(window.location.search);

          const type = parsed.type || queryParams.get('type') || '';
          accessToken = parsed.accessToken || queryParams.get('access_token') || '';
          refreshToken = parsed.refreshToken || queryParams.get('refresh_token') || '';

          console.log('🔐 ResetPasswordPage - Extracted from URL:', {
            type,
            hasAccessToken: !!accessToken,
            accessTokenLength: accessToken?.length || 0,
            hasRefreshToken: !!refreshToken,
            refreshTokenLength: refreshToken?.length || 0
          });

          // Vérifier que c'est bien un lien de recovery
          if (type && type !== 'recovery') {
            console.error('❌ Invalid type:', type);
            setError('Lien invalide. Ce lien n\'est pas un lien de réinitialisation de mot de passe.');
            setSessionStatus('invalid');
            setCheckingSession(false);
            return;
          }
        }

        // ÉTAPE 2: Vérifier que les tokens sont présents
        if (!accessToken || !refreshToken) {
          console.error('❌ Missing tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
          setError('Lien incomplet. Veuillez redemander un nouveau lien de réinitialisation.');
          setSessionStatus('invalid');
          setCheckingSession(false);
          return;
        }

        // ÉTAPE 3: Échanger les tokens contre une session active
        console.log('🔐 Exchanging tokens for session...');
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error('❌ Session exchange error:', sessionError);

          // Déterminer si le lien est expiré ou invalide
          if (sessionError.message?.includes('expired') || sessionError.message?.includes('invalid')) {
            setError('Ce lien a expiré. Les liens de réinitialisation sont valables 1 heure.');
            setSessionStatus('expired');
          } else {
            setError(`Erreur de session: ${sessionError.message}`);
            setSessionStatus('invalid');
          }

          setCheckingSession(false);
          return;
        }

        if (!data.session) {
          console.error('❌ No session returned after exchange');
          setError('Impossible de créer une session. Veuillez redemander un nouveau lien.');
          setSessionStatus('invalid');
          setCheckingSession(false);
          return;
        }

        // ÉTAPE 5: Session validée avec succès
        console.log('✅ Session exchanged successfully');
        console.log('✅ User ID:', data.session.user.id);
        console.log('✅ User email:', data.session.user.email);

        setSessionStatus('valid');
      } catch (err: any) {
        console.error('❌ Session check unexpected error:', err);
        setError(`Erreur inattendue: ${err.message || 'Erreur inconnue'}`);
        setSessionStatus('invalid');
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, [recoveryTokens]);

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) return;

    setLoading(true);

    try {
      console.log('🔐 Updating password...');

      // ÉTAPE 6: Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('❌ Password update error:', updateError);
        throw updateError;
      }

      console.log('✅ Password updated successfully');
      setSuccess(true);

      // Redirection après 2.5 secondes
      setTimeout(() => {
        onSuccess();
      }, 2500);
    } catch (err: any) {
      console.error('❌ Reset password error:', err);
      setError(err.message || 'Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour renvoyer un email de réinitialisation
  const handleResendEmail = async () => {
    setResendingEmail(true);
    setError('');

    try {
      // Essayer de récupérer l'email depuis la session
      const { data } = await supabase.auth.getSession();
      const email = data?.session?.user?.email;

      if (!email) {
        setError('Impossible de récupérer votre email. Veuillez retourner à la page de connexion.');
        return;
      }

      console.log('📧 Resending reset email to:', email);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#type=recovery`,
      });

      if (resetError) {
        console.error('❌ Resend email error:', resetError);
        throw resetError;
      }

      console.log('✅ Reset email sent successfully');
      setEmailResent(true);
    } catch (err: any) {
      console.error('❌ Resend email error:', err);
      setError(err.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setResendingEmail(false);
    }
  };

  const passwordStrength = () => {
    if (newPassword.length === 0) return 0;
    if (newPassword.length < 8) return 25;
    if (newPassword.length < 12) return 50;
    if (newPassword.length < 16) return 75;
    return 100;
  };

  const strength = passwordStrength();

  // Écran de chargement pendant la vérification de session
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-20 h-20 border-4 border-gray-800 border-t-red-500 rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 text-lg">Vérification de votre lien...</p>
          <p className="text-gray-600 text-sm mt-2">Cela peut prendre quelques secondes</p>
        </div>
      </div>
    );
  }

  // Écran d'erreur si le lien est invalide ou expiré
  if (sessionStatus === 'invalid' || sessionStatus === 'expired') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-2xl opacity-30 animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-5xl">❌</span>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-3">
              {sessionStatus === 'expired' ? 'Lien expiré' : 'Lien invalide'}
            </h1>
            <p className="text-gray-400 text-lg mb-6">
              {error}
            </p>
          </div>

          {emailResent ? (
            <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-center mb-6">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-green-400 font-medium mb-2">Email envoyé !</p>
              <p className="text-gray-400 text-sm">Vérifie ta boîte mail et clique sur le nouveau lien.</p>
            </div>
          ) : (
            <button
              onClick={handleResendEmail}
              disabled={resendingEmail}
              className="relative w-full py-4 rounded-xl font-bold text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group mb-4"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                {resendingEmail ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>Renvoyer un email de réinitialisation</span>
                  </>
                )}
              </span>
            </button>
          )}

          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full py-4 text-gray-400 hover:text-white transition-colors font-medium"
            >
              Retour à la page de connexion
            </button>
          )}
        </div>
      </div>
    );
  }

  // Écran de succès après changement de mot de passe
  if (success) {
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
            Mot de passe mis à jour !
          </h1>

          <p className="text-gray-400 text-lg mb-2">
            Ton mot de passe a été changé avec succès.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Tu peux maintenant te connecter avec ton nouveau mot de passe.
          </p>

          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-xl opacity-50" />
            <div className="relative w-16 h-16 border-4 border-gray-800 border-t-red-500 rounded-full animate-spin" />
          </div>
          <p className="text-gray-600 text-sm mt-4">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  // Formulaire de changement de mot de passe
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-3">
            Nouveau mot de passe
          </h1>
          <p className="text-gray-400 text-lg">
            Choisis un mot de passe fort et sécurisé
          </p>
        </div>

        {error && (
          <div className="mb-6 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div>
                <p className="text-red-400 font-medium mb-1">Erreur</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-3 text-sm uppercase tracking-wide">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                required
                minLength={8}
                className="w-full pl-12 pr-14 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {newPassword.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Force du mot de passe</span>
                  <span className={`text-xs font-bold ${
                    strength >= 75 ? 'text-green-400' :
                    strength >= 50 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {strength >= 75 ? 'Fort' : strength >= 50 ? 'Moyen' : 'Faible'}
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strength >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      strength >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-white font-semibold mb-3 text-sm uppercase tracking-wide">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme ton mot de passe"
                required
                minLength={8}
                className="w-full pl-12 pr-14 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {confirmPassword.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                {newPassword === confirmPassword ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">Les mots de passe correspondent</span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-red-400" />
                    <span className="text-sm text-red-400 font-medium">Les mots de passe ne correspondent pas</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
              Exigences du mot de passe
            </h4>
            <ul className="space-y-2">
              <li className={`flex items-center gap-2 text-sm ${newPassword.length >= 8 ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  newPassword.length >= 8 ? 'bg-green-500/20' : 'bg-white/5'
                }`}>
                  {newPassword.length >= 8 ? '✓' : '○'}
                </div>
                <span>Au moins 8 caractères</span>
              </li>
              <li className={`flex items-center gap-2 text-sm ${
                newPassword === confirmPassword && newPassword.length > 0 ? 'text-green-400' : 'text-gray-500'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  newPassword === confirmPassword && newPassword.length > 0 ? 'bg-green-500/20' : 'bg-white/5'
                }`}>
                  {newPassword === confirmPassword && newPassword.length > 0 ? '✓' : '○'}
                </div>
                <span>Les deux mots de passe correspondent</span>
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
            className="relative w-full py-4 rounded-xl font-bold text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mise à jour...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Changer mon mot de passe</span>
                </>
              )}
            </span>
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-4 text-gray-400 hover:text-white transition-colors font-medium"
            >
              Annuler
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
