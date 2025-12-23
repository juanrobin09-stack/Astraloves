import { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { resendVerificationEmail } from '../lib/emailVerification';

interface EmailVerificationModalProps {
  email: string;
  onClose: () => void;
}

export default function EmailVerificationModal({ email, onClose }: EmailVerificationModalProps) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

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
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal verification-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer">
          <X size={24} />
        </button>

        <div className="modal-icon verification-icon">
          <Mail size={48} />
        </div>

        <h2 className="modal-title">Vérifie ton email</h2>

        <p className="modal-description">
          Tu dois vérifier ton adresse email avant de pouvoir utiliser cette fonctionnalité.
        </p>

        <p className="email-sent">
          Email envoyé à : <strong>{email}</strong>
        </p>

        {message && (
          <div className={`verification-message ${message.includes('Erreur') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="modal-actions">
          <button
            onClick={handleResend}
            disabled={sending}
            className="btn-primary"
          >
            {sending ? 'Envoi en cours...' : 'Renvoyer l\'email'}
          </button>

          <button onClick={onClose} className="btn-secondary">
            Fermer
          </button>
        </div>

        <p className="modal-note">
          N'oublie pas de vérifier tes spams si tu ne reçois pas l'email.
        </p>
      </div>
    </div>
  );
}
