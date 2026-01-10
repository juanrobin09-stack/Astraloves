import { useState, useEffect } from 'react';
import SocialButtons from './SocialButtons';
import { supabase } from '@/config/supabase';

interface SignupFormProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onClose, onSwitchToLogin }: SignupFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!acceptTerms) {
      setError('Vous devez accepter les conditions générales');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
          data: {
            display_name: name,
            username: name.toLowerCase().replace(/\s+/g, '_'),
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        window.location.href = '/onboarding';
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`auth-modal-overlay ${true ? 'active' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="auth-modal">
        <button className="btn-close" onClick={onClose}>✕</button>

        <div className="social-buttons">
          <SocialButtons
            layout="full"
            onError={(err) => setError(err)}
          />
        </div>

        <div className="divider">
          <span>ou</span>
        </div>

        {error && (
          <div style={{
            marginBottom: '6px',
            padding: '6px 8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            color: '#ef4444',
            fontSize: '12px'
          }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-icon">👤</div>
            <input
              type="text"
              placeholder="Prénom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <div className="input-icon">📧</div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <div className="input-icon">🔒</div>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <div className="input-icon">🔒</div>
            <input
              type="password"
              placeholder="Confirmer"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              required
            />
            <span>
              J'accepte les{' '}
              <a
                href="/conditions-generales-de-vente"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                CGV
              </a>
              {' '}et la{' '}
              <a
                href="/politique-confidentialite"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                politique
              </a>
            </span>
          </label>

          <button type="submit" className="btn-submit-astra" disabled={loading}>
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Chargement...</span>
              </>
            ) : (
              <>
                <span className="btn-icon">⭐</span>
                S'inscrire
              </>
            )}
          </button>
        </form>

        <div className="modal-footer">
          <p>
            Déjà membre ? <button className="link-button" onClick={onSwitchToLogin}>Connexion</button>
          </p>
        </div>
      </div>
    </div>
  );
}
