import { ArrowLeft, Shield, Lock, Database, Eye, FileText, Mail } from 'lucide-react';

type PolitiqueConfidentialiteSimpleProps = {
  onBack: () => void;
};

export default function PolitiqueConfidentialiteSimple({ onBack }: PolitiqueConfidentialiteSimpleProps) {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <button onClick={onBack} className="back-button" aria-label="Retour">
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="legal-title-section">
          <Shield className="legal-icon" size={64} />
          <h1 className="legal-title">Politique de confidentialité</h1>
          <p className="legal-date">Dernière mise à jour : 24 novembre 2025</p>
        </div>
      </div>

      <div className="legal-content">
        <p className="legal-intro">
          Chez Astra, ta vie privée est notre priorité. 💫 Voici comment nous protégeons tes données.
        </p>

        <section className="legal-section">
          <h2 className="legal-section-title">
            <Database size={24} />
            Données collectées
          </h2>

          <div className="legal-subsection">
            <h3>✓ Informations de compte</h3>
            <ul>
              <li>Email (pour connexion)</li>
              <li>Prénom et pseudo</li>
              <li>Date de naissance (calcul signe astro)</li>
              <li>Photo de profil (optionnel)</li>
            </ul>
          </div>

          <div className="legal-subsection">
            <h3>✓ Données astrologiques</h3>
            <ul>
              <li>Signe solaire, ascendant, lune</li>
              <li>Heure et lieu de naissance (optionnel)</li>
              <li>Réponses aux questionnaires</li>
            </ul>
          </div>

          <div className="legal-subsection">
            <h3>✓ Historique d'utilisation</h3>
            <ul>
              <li>Conversations avec Astra IA</li>
              <li>Matchs et compatibilités</li>
              <li>Messages privés</li>
            </ul>
          </div>

          <div className="legal-subsection">
            <h3>✓ Données techniques</h3>
            <ul>
              <li>Adresse IP</li>
              <li>Type d'appareil et navigateur</li>
              <li>Logs de connexion</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">
            <Eye size={24} />
            Utilisation de tes données
          </h2>

          <p>Tes données servent exclusivement à :</p>
          <ul>
            <li>Fonctionnement du service de matching</li>
            <li>Personnalisation de l'IA Astra</li>
            <li>Amélioration de la compatibilité</li>
            <li>Sécurité et prévention de la fraude</li>
            <li>Support client</li>
          </ul>

          <div className="legal-warning">
            <p>⚠️ Nous ne vendons JAMAIS tes données</p>
            <p>⚠️ Pas de publicité ciblée externe</p>
            <p>⚠️ Pas de partage avec des tiers (sauf hébergeurs)</p>
          </div>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">
            <FileText size={24} />
            Conservation des données
          </h2>

          <ul>
            <li><strong>Compte actif :</strong> conservation illimitée</li>
            <li><strong>Après suppression :</strong> 30 jours (backup)</li>
            <li><strong>Conversations Premium :</strong> à vie (sauf demande)</li>
            <li><strong>Conversations Gratuit :</strong> 24h puis suppression</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">
            <Lock size={24} />
            Sécurité
          </h2>

          <p>Mesures de protection :</p>
          <ul>
            <li>Chiffrement SSL/TLS (données en transit)</li>
            <li>Hachage des mots de passe (bcrypt)</li>
            <li>Hébergement sécurisé conforme RGPD</li>
            <li>Surveillance 24/7 des accès</li>
            <li>Sauvegardes quotidiennes chiffrées</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">
            🌍 Hébergement & Transferts
          </h2>

          <div className="legal-subsection">
            <h3>📍 Hébergeurs principaux :</h3>
            <ul>
              <li>
                <strong>Supabase (Irlande)</strong> – Base de données<br />
                <span className="text-gray-500">Conformité : RGPD, ISO 27001</span>
              </li>
              <li>
                <strong>Netlify/Bolt (USA)</strong> – Hébergement app<br />
                <span className="text-gray-500">Conformité : Privacy Shield, DPA signé</span>
              </li>
            </ul>
          </div>

          <div className="legal-warning">
            <p>⚠️ Aucun transfert hors UE sans ton consentement</p>
          </div>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">
            ⚖️ Tes droits RGPD
          </h2>

          <p>Tu as le droit de :</p>
          <ul>
            <li><strong>Accès :</strong> obtenir une copie de tes données</li>
            <li><strong>Rectification :</strong> corriger tes informations</li>
            <li><strong>Suppression :</strong> effacer ton compte définitivement</li>
            <li><strong>Opposition :</strong> refuser certains traitements</li>
            <li><strong>Portabilité :</strong> récupérer tes données (JSON)</li>
            <li><strong>Limitation :</strong> restreindre l'utilisation</li>
          </ul>

          <div className="legal-contact">
            <p><strong>Pour exercer ces droits :</strong></p>
            <p>
              <Mail size={16} />
              <a href="mailto:astra.loveai@gmail.com">astra.loveai@gmail.com</a>
            </p>
            <p className="text-sm text-gray-500">Délai de réponse : 30 jours maximum</p>
          </div>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">
            🍪 Cookies
          </h2>

          <p>Nous utilisons uniquement :</p>
          <ul>
            <li>Cookies essentiels (connexion, session)</li>
            <li>Cookies analytiques (anonymes, optionnel)</li>
          </ul>

          <p className="legal-note">Pas de cookies publicitaires.</p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">
            👤 Délégué à la Protection des Données (DPO)
          </h2>

          <div className="legal-contact">
            <p>
              <strong>Contact DPO :</strong>{' '}
              <a href="mailto:astra.loveai@gmail.com">astra.loveai@gmail.com</a>
            </p>
            <p>En cas de litige, tu peux saisir la CNIL :</p>
            <p>
              🌐 <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
            </p>
          </div>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">
            🔄 Modifications
          </h2>

          <p>Cette politique peut être mise à jour.</p>
          <p>Toute modification sera notifiée par email.</p>
        </section>
      </div>

      <div className="legal-footer">
        <p>© 2025 Astra. Tous droits réservés.</p>
        <p className="legal-footer-note">
          Service de divertissement • 18+ • Aucun conseil médical ou psychologique
        </p>
      </div>
    </div>
  );
}
