import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Star, Mail, Sparkles, AlertCircle } from 'lucide-react';

type SignupPageProps = {
  mode: 'signup' | 'login';
  onSignupSuccess: (email: string) => void;
  onSwitchToLogin: () => void;
  onSwitchToSignup: () => void;
  onNavigateLegal: (page: 'politique-confidentialite' | 'cgv-simple') => void;
};

export default function SignupPage({ mode, onSignupSuccess, onSwitchToLogin, onSwitchToSignup, onNavigateLegal }: SignupPageProps) {
  const [signupEmail, setSignupEmail] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [userExistsError, setUserExistsError] = useState(false);
  const [userNotFoundError, setUserNotFoundError] = useState(false);
  const debounceTimerRef = useRef<number | null>(null);


  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const verifyEmailWithRapid = async (email: string): Promise<{valid: boolean, reason?: string}> => {
    try {
      console.log('[Astra] Verifying email with Rapid Email Verifier:', email);
      const response = await fetch(`https://rapid-email-verifier.fly.dev/verify?email=${encodeURIComponent(email)}`);

      if (!response.ok) {
        console.error('[Astra] Email verification HTTP error:', response.status);
        return { valid: true };
      }

      const data = await response.json();
      console.log('[Astra] Email verification response:', data);

      if (data.status === 'VALID') {
        return { valid: true };
      } else {
        return {
          valid: false,
          reason: 'Email invalide ou temporaire (ex. : temp-mail). Utilise Gmail/Outlook pour continuer.'
        };
      }
    } catch (error) {
      console.error('[Astra] Email verification error:', error);
      return { valid: true };
    }
  };

  const debouncedVerifyEmail = (email: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      if (!email || !validateEmail(email)) {
        return;
      }

      setIsVerifyingEmail(true);
      setEmailError('');
      setEmailVerified(false);

      const result = await verifyEmailWithRapid(email);

      setIsVerifyingEmail(false);

      if (!result.valid) {
        setEmailError(result.reason || 'Email invalide ou temporaire');
        setEmailVerified(false);
      } else {
        setEmailVerified(true);
        setEmailError('');
      }
    }, 1000);
  };

  const handleEmailChange = (value: string) => {
    setSignupEmail(value);
    setEmailError('');
    setGeneralError('');
    setEmailVerified(false);

    if (value && validateEmail(value)) {
      debouncedVerifyEmail(value);
    }
  };

  const handleEmailBlur = async () => {
    if (!signupEmail || !validateEmail(signupEmail)) {
      if (signupEmail) {
        setEmailError('Format d\'email invalide');
      }
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsVerifyingEmail(true);
    setEmailError('');
    setEmailVerified(false);

    const result = await verifyEmailWithRapid(signupEmail);

    setIsVerifyingEmail(false);

    if (!result.valid) {
      setEmailError(result.reason || 'Email invalide ou temporaire');
      setEmailVerified(false);
    } else {
      setEmailVerified(true);
      setEmailError('');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!signupEmail || !validateEmail(signupEmail)) {
      setEmailError('Format d\'email invalide');
      return;
    }

    if (!emailVerified) {
      setEmailError('Vérifie que ton email est valide');
      return;
    }

    setShowConsentModal(true);
  };

  const handleContinueSignup = async () => {
    if (!gdprConsent) {
      setGeneralError('Tu dois accepter les conditions pour continuer');
      return;
    }

    setShowConsentModal(false);
    setLoading(true);

    try {
      const email = signupEmail.trim().toLowerCase();
      console.log('[Astra] Creating account for:', email);

      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: window.location.origin,
          shouldCreateUser: true
        }
      });

      if (error) {
        console.error("=== ERREUR INSCRIPTION DÉTAILLÉE ===");
        console.error("Message:", error.message);
        console.error("Status:", error.status);
        console.error("Full error:", error);
        alert("ERREUR EXACTE : " + error.message);

        if (error.message?.includes('rate') || error.message?.includes('limit') || error.message?.includes('too many')) {
          setGeneralError('Trop de tentatives. Attends 5 minutes avant de réessayer.');
        } else {
          setGeneralError('Réessaie ou contacte astra.loveai@gmail.com');
        }
        setLoading(false);
        return;
      }

      console.log('[Astra] Magic link sent to:', email);
      setSentEmail(email);
      setCodeSent(true);
    } catch (err: any) {
      console.error("=== ERREUR INSCRIPTION EXCEPTION ===");
      console.error("Message:", err.message);
      console.error("Status:", err.status);
      console.error("Full error:", err);
      alert("ERREUR EXCEPTION : " + err.message);

      if (!generalError) {
        setGeneralError('Réessaie ou contacte astra.loveai@gmail.com');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!loginEmail || !validateEmail(loginEmail)) {
      setGeneralError('Format d\'email invalide');
      return;
    }

    setLoading(true);

    try {
      const email = loginEmail.trim().toLowerCase();
      console.log('[Astra] Sending magic link for:', email);

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
          shouldCreateUser: false
        }
      });

      if (error) {
        console.error("=== ERREUR LOGIN DÉTAILLÉE ===");
        console.error("Message:", error.message);
        console.error("Status:", error.status);
        console.error("Full error:", error);
        alert("ERREUR LOGIN : " + error.message);

        if (error.message?.includes('rate') || error.message?.includes('limit') || error.message?.includes('too many')) {
          setGeneralError('Trop de tentatives. Attends 5 minutes avant de réessayer.');
        } else if (error.message?.includes('User not found') || error.message?.includes('not found')) {
          setUserNotFoundError(true);
        } else {
          setGeneralError('Réessaie ou contacte astra.loveai@gmail.com');
        }
        setLoading(false);
        return;
      }

      console.log('[Astra] Magic link sent successfully to:', email);
      setSentEmail(email);
      setCodeSent(true);
    } catch (err: any) {
      console.error("=== ERREUR LOGIN EXCEPTION ===");
      console.error("Message:", err.message);
      console.error("Status:", err.status);
      console.error("Full error:", err);
      alert("ERREUR LOGIN EXCEPTION : " + err.message);

      if (!generalError) {
        setGeneralError('Réessaie ou contacte astra.loveai@gmail.com');
      }
      setLoading(false);
    }
  };


  if (codeSent) {
    return (
      <div className="min-h-screen velvet-bg relative overflow-hidden flex items-center justify-center p-4">
        <div className="stars-bg absolute inset-0 opacity-30" />

        <div className="relative z-10 w-full max-w-md">
          <div className="premium-card rounded-3xl p-10 text-center">
            <div className="flex justify-center mb-6">
              <Mail className="w-20 h-20 text-white premium-glow animate-pulse-glow" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 premium-text">
              Lien envoyé !
            </h2>
            <p className="text-gray-300 text-lg mb-2 leading-relaxed">
              Vérifie ta boîte (et les spams) puis clique sur le lien pour continuer.
            </p>
            <p className="text-white font-semibold text-lg mb-8">
              {sentEmail}
            </p>

            {generalError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                {generalError}
              </div>
            )}

            <div className="mt-6 text-center space-y-3">
              <button
                onClick={() => {
                  setCodeSent(false);
                  setGeneralError('');
                }}
                disabled={loading}
                className="w-full premium-button text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-4"
                style={{ backgroundColor: '#E91E63' }}
              >
                Renvoyer le lien
              </button>
              <div className="bg-black/40 rounded-xl p-4">
                <p className="text-gray-400 text-xs">
                  Lien valable 60 minutes • Vérifie tes spams
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
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

      <div className="relative z-10 w-full max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Star className="w-20 h-20 text-white premium-glow animate-pulse-glow" fill="white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 premium-text tracking-wider flex items-center justify-center gap-3" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF' }}>
            <span>Bienvenue sur Astra</span>
            <span className="text-2xl md:text-3xl">✨</span>
          </h1>
          <p className="text-base md:text-lg text-gray-300" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF' }}>
            Ton coach amoureux éthique et bienveillant
          </p>
        </div>

        {mode === 'signup' ? (
          <div className="max-w-2xl mx-auto w-full">
          <div className="premium-card rounded-3xl p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#E91E63' }}>
              Créer mon compte
            </h2>
            <p className="text-gray-400 text-center mb-8" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF' }}>
              Entre ton email, on t'envoie ton lien d'accès magique
            </p>

            {userExistsError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
                Tu as déjà un compte ! <button onClick={onSwitchToLogin} className="underline font-bold hover:text-white">Connecte-toi ici →</button>
              </div>
            )}

            {generalError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                {generalError}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label className="block font-medium mb-3 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF' }}>
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={handleEmailBlur}
                    placeholder="ton.email@exemple.com"
                    className={`w-full px-5 py-4 premium-input rounded-xl text-white placeholder-gray-500 text-lg pr-12 transition-all ${
                      emailError ? 'border-2 border-red-500' : emailVerified ? 'border-2 border-green-500' : ''
                    }`}
                    disabled={loading}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  {isVerifyingEmail && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                  {!isVerifyingEmail && emailVerified && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-xl font-bold">
                      ✓
                    </div>
                  )}
                </div>
                {emailError && (
                  <p className="text-red-400 text-sm mt-2 font-medium">{emailError}</p>
                )}
                {emailVerified && !emailError && (
                  <p className="text-green-400 text-sm mt-2 font-medium">Email valide !</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !emailVerified || isVerifyingEmail}
                className="w-full text-white font-bold py-4 px-6 rounded-xl text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-8 transition-all"
                style={{
                  backgroundColor: '#E91E63',
                  fontFamily: 'Inter, sans-serif',
                  borderRadius: '12px'
                }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Recevoir mon lien d'accès</span>
                  </>
                )}
              </button>
            </form>
          </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto w-full">
          <div className="premium-card rounded-3xl p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#E91E63' }}>
              J'ai déjà un compte
            </h2>
            <p className="text-gray-400 text-center mb-8" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF' }}>
              Entre ton email pour recevoir un nouveau lien de connexion
            </p>

            {userNotFoundError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
                Aucun compte trouvé. <button onClick={onSwitchToSignup} className="underline font-bold hover:text-white">Crée ton compte ici →</button>
              </div>
            )}

            {generalError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                {generalError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block font-medium mb-3 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF' }}>
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ton.email@exemple.com"
                  className="w-full px-5 py-4 premium-input rounded-xl text-white placeholder-gray-500 text-lg"
                  required
                  disabled={loading}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-bold py-4 px-6 rounded-xl text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-8 transition-all"
                style={{
                  backgroundColor: '#E91E63',
                  fontFamily: 'Inter, sans-serif',
                  borderRadius: '12px'
                }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <span>Me connecter</span>
                )}
              </button>
            </form>
          </div>
          </div>
        )}

        {showConsentModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="premium-card rounded-2xl p-8 max-w-md w-full">
              <div className="flex justify-center mb-6">
                <AlertCircle className="w-16 h-16 text-red-600 premium-glow" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                Consentement obligatoire
              </h2>
              <p className="text-gray-300 mb-6 text-center leading-relaxed">
                En continuant, tu acceptes :
              </p>

              <div className="space-y-3 mb-6 text-left">
                <a
                  href="/politique-confidentialite"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-red-600 hover:text-red-500 underline text-sm text-left"
                >
                  • Notre Politique de confidentialité
                </a>
                <a
                  href="/cgv-simple"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-red-600 hover:text-red-500 underline text-sm text-left"
                >
                  • Nos Conditions Générales de Vente
                </a>
              </div>

              <div className="bg-black/40 rounded-xl p-4 mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gdprConsent}
                    onChange={(e) => setGdprConsent(e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-red-600"
                  />
                  <span className="text-white text-sm">
                    J'accepte les <a href="https://astraloves.com/politique-confidentialite" target="_blank" rel="noopener" className="text-red-600 hover:text-red-500 underline">Politique de confidentialité</a> et je confirme avoir 18 ans ou plus
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConsentModal(false);
                    setGdprConsent(false);
                  }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleContinueSignup}
                  disabled={!gdprConsent || loading}
                  className="flex-1 premium-button text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50"
                >
                  Continuer
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Ces consentements sont requis pour utiliser Astra
              </p>
            </div>
          </div>
        )}

        <p className="text-gray-500 text-xs text-center mt-8" style={{ fontFamily: 'Inter, sans-serif' }}>
          En créant un compte, tu acceptes nos conditions d'utilisation et notre politique de confidentialité
        </p>
      </div>
    </div>
  );
}
