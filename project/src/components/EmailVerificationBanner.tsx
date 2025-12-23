import { useState, useEffect } from 'react';
import { X, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { resendVerificationEmail } from '../lib/emailVerification';

export default function EmailVerificationBanner() {
  const [user, setUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function handleResend() {
    setSending(true);
    setMessage('');

    const result = await resendVerificationEmail();

    if (result.success) {
      setMessage('Email renvoyé ! Vérifie ta boîte de réception.');
    } else {
      setMessage(result.error || 'Erreur lors de l\'envoi');
    }

    setSending(false);

    setTimeout(() => setMessage(''), 5000);
  }

  if (!user || user.email_confirmed_at || dismissed) {
    return null;
  }

  return (
    <div className="verification-banner">
      <div className="banner-content">
        <div className="banner-icon">⚠️</div>
        <div className="banner-text">
          <strong>Vérifie ton email pour déverrouiller Astra</strong>
          <p>Email envoyé à : {user.email}</p>
          {message && (
            <p className={message.includes('Erreur') ? 'banner-error' : 'banner-success'}>
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="banner-actions">
        <button
          onClick={handleResend}
          disabled={sending}
          className="btn-resend"
        >
          {sending ? (
            'Envoi...'
          ) : (
            <>
              <Mail size={16} />
              Renvoyer
            </>
          )}
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="btn-dismiss"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
