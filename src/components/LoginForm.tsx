import { useState, useEffect } from 'react';
import SocialButtons from './SocialButtons';
import { supabase } from '@/config/supabase';

interface LoginFormProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onClose, onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showResetForm) {
          setShowResetForm(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, showResetForm]);

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (showResetForm) {
        setShowResetForm(false);
      } else {
        onClose();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/#type=recovery`,
      });

      if (result && result.error) {
        throw result.error;
      }

      setResetSuccess(true);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  if (showResetForm) {
    return (
      <div
        className={`auth-modal-overlay ${true ? 'active' : ''}`}
        onClick={handleOverlayClick}
      >
        <div className="auth-modal">
          <button className="btn-close" onClick={() => setShowResetForm(false)}>✕</button>

          <div className="modal-header">
            <h2>Mot de passe oublié ? 🔑</h2>
            <p>On va t'aider à le récupérer</p>
          </div>

          {!resetSuccess ? (
            <>
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

              <form className="auth-form" onSubmit={handleResetPassword}>
                <div className="input-group">
                  <div className="input-icon">📧</div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-submit-astra" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Chargement...</span>
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">📧</span>
                      Envoyer le lien
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="success-message">
              <div className="success-icon">✅</div>
              <h3>Email envoyé !</h3>
              <p>Consulte ta boîte mail pour réinitialiser ton mot de passe.</p>
              <button
                className="btn-submit-astra"
                onClick={() => {
                  setShowResetForm(false);
                  setResetSuccess(false);
                }}
              >
                <span className="btn-icon">⭐</span>
                Retour à la connexion
              </button>
            </div>
          )}

          <div className="modal-footer">
            <p>
              Tu te souviens ?{' '}
              <button
                className="link-button"
                onClick={() => {
                  setShowResetForm(false);
                  setResetSuccess(false);
                }}
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

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

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Se souvenir</span>
            </label>

            <button
              type="button"
              className="forgot-password"
              onClick={() => {
                setResetEmail(email);
                setShowResetForm(true);
              }}
            >
              Oublié ?
            </button>
          </div>

          <button type="submit" className="btn-submit-astra" disabled={loading}>
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Chargement...</span>
              </>
            ) : (
              <>
                <span className="btn-icon">⭐</span>
                Se connecter
              </>
            )}
          </button>
        </form>

        <div className="modal-footer">
          <p>
            Nouveau ? <button className="link-button" onClick={onSwitchToSignup}>S'inscrire</button>
          </p>
        </div>
      </div>
    </div>
  );
}
