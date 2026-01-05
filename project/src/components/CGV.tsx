import { useEffect } from 'react';

type CGVProps = {
  onBack: () => void;
};

export default function CGV({ onBack }: CGVProps) {
  useEffect(() => {
    window.onbeforeunload = null;
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      <style>{`
        .legal-section {
          opacity: 1;
        }
      `}</style>

      {/* Header fixe */}
      <div className="sticky top-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-xl border-b border-[#2a2a2a] px-6 py-5 flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-[#a3a3a3] hover:text-[#ef4444] hover:bg-[#252525] transition-all px-4 py-2 rounded-lg text-[15px]"
        >
          ← Retour
        </button>
        <div className="text-lg font-bold bg-gradient-to-r from-[#ef4444] to-[#dc2626] bg-clip-text text-transparent">
          ⭐ ASTRA
        </div>
      </div>

      {/* Container centré */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Titre section */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-6" style={{ filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.3))' }}>
            📜
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Conditions Générales de Vente
          </h1>
          <p className="text-[#6b6b6b] text-sm">
            Dernière mise à jour : 24 novembre 2025
          </p>
        </div>

        {/* Sections */}
        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            🎯 Service
          </h2>
          <div className="text-[#a3a3a3] leading-relaxed space-y-3">
            <p>
              Astra est un <strong className="text-white">service de divertissement</strong> réservé aux personnes majeures (18+).
            </p>
            <p className="mt-3 p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl">
              <strong className="text-[#ef4444]">⚠️ Important :</strong> Aucun conseil médical ou psychologique.
            </p>
          </div>
        </section>

        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            💎 Abonnements
          </h2>
          <div className="space-y-4">
            <div className="bg-[#252525] border border-[#2a2a2a] rounded-xl p-6">
              <strong className="text-white text-lg block mb-3">🆓 Gratuit</strong>
              <ul className="space-y-2 text-[#a3a3a3]">
                <li className="pl-7 relative">
                  <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                  5 messages privés/jour
                </li>
                <li className="pl-7 relative">
                  <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                  10 messages Astra IA/jour
                </li>
                <li className="pl-7 relative">
                  <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                  5 swipes/jour
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#ef4444]/20 to-[#dc2626]/20 border-2 border-[#ef4444] rounded-xl p-6">
              <strong className="text-white text-lg block mb-3">💎 Premium - 9,99€/mois</strong>
              <ul className="space-y-2 text-[#a3a3a3]">
                <li className="pl-7 relative">
                  <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                  10 messages privés/jour
                </li>
                <li className="pl-7 relative">
                  <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                  40 messages Astra IA/jour
                </li>
                <li className="pl-7 relative">
                  <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                  Swipes illimités
                </li>
                <li className="pl-7 relative">
                  <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                  Tous les questionnaires
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#ffd700]/20 to-[#ff8c00]/20 border-2 border-[#ffd700] rounded-xl p-6">
              <strong className="text-white text-lg block mb-3">👑 Premium+ Elite - 19,99€/mois</strong>
              <ul className="space-y-2 text-[#a3a3a3]">
                <li className="pl-7 relative">
                  <span className="absolute left-3 text-[#ffd700] text-xl">•</span>
                  Messages privés illimités
                </li>
                <li className="pl-7 relative">
                  <span className="absolute left-3 text-[#ffd700] text-xl">•</span>
                  65 messages Astra IA Ultra/jour
                </li>
                <li className="pl-7 relative">
                  <span className="absolute left-3 text-[#ffd700] text-xl">•</span>
                  Swipes illimités
                </li>
                <li className="pl-7 relative">
                  <span className="absolute left-3 text-[#ffd700] text-xl">•</span>
                  Tous les questionnaires premium
                </li>
                <li className="pl-7 relative">
                  <span className="absolute left-3 text-[#ffd700] text-xl">•</span>
                  Badge Elite exclusif
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            💳 Paiement
          </h2>
          <div className="text-[#a3a3a3] leading-relaxed space-y-3">
            <ul className="space-y-3">
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                <strong className="text-white">Processeur :</strong> Stripe (paiement sécurisé)
              </li>
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                <strong className="text-white">Facturation :</strong> mensuelle automatique
              </li>
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                <strong className="text-white">Moyens :</strong> Carte bancaire (Visa, Mastercard, Amex)
              </li>
            </ul>
          </div>
        </section>

        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            🔄 Résiliation
          </h2>
          <div className="text-[#a3a3a3] leading-relaxed space-y-3">
            <ul className="space-y-3">
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                <strong className="text-white">Annulation :</strong> depuis ton profil
              </li>
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                <strong className="text-white">Effet :</strong> fin de période en cours
              </li>
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                <strong className="text-white">Remboursement :</strong> pas de prorata (période payée conservée)
              </li>
            </ul>
          </div>
        </section>

        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            ↩️ Rétractation (14 jours)
          </h2>
          <div className="text-[#a3a3a3] leading-relaxed space-y-3">
            <p>
              Droit de rétractation dans les <strong className="text-white">14 jours</strong> suivant la souscription.
            </p>
            <p className="mt-3 p-4 bg-[#252525] border border-[#2a2a2a] rounded-xl">
              <strong className="text-white">Demande :</strong> envoie un email à{' '}
              <a href="mailto:astra.loveai@gmail.com" className="text-[#ef4444] hover:underline">
                astra.loveai@gmail.com
              </a>
            </p>
          </div>
        </section>

        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            ⚖️ Responsabilité
          </h2>
          <div className="text-[#a3a3a3] leading-relaxed space-y-3">
            <ul className="space-y-3">
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                Astra n'est <strong className="text-white">pas un service médical</strong>
              </li>
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                Les conseils sont à titre <strong className="text-white">informatif et ludique</strong>
              </li>
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                Aucune garantie de résultat relationnel
              </li>
            </ul>
          </div>
        </section>

        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            📊 Données collectées
          </h2>
          <div className="text-[#a3a3a3] leading-relaxed space-y-3">
            <ul className="space-y-3">
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                Email, prénom, date de naissance
              </li>
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                Réponses aux questionnaires
              </li>
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                Historique de conversations
              </li>
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                Photo de profil (optionnel)
              </li>
            </ul>
          </div>
        </section>

        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            🎯 Utilisation de tes données
          </h2>
          <div className="text-[#a3a3a3] leading-relaxed space-y-3">
            <ul className="space-y-3">
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                Fonctionnement du service
              </li>
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                Personnalisation de l'IA
              </li>
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                Amélioration de la compatibilité
              </li>
            </ul>
          </div>
        </section>

        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            📝 Conservation
          </h2>
          <div className="text-[#a3a3a3] leading-relaxed space-y-3">
            <ul className="space-y-3">
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                <strong className="text-white">Compte actif :</strong> illimité
              </li>
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                <strong className="text-white">Après suppression :</strong> 30 jours
              </li>
            </ul>
          </div>
        </section>

        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            🏛️ Droit applicable
          </h2>
          <div className="text-[#a3a3a3] leading-relaxed space-y-3">
            <p>
              <strong className="text-white">Droit français.</strong> Juridiction compétente : Tribunaux français.
            </p>
          </div>
        </section>

        {/* Contact box */}
        <div className="bg-gradient-to-r from-[#ef4444] to-[#dc2626] rounded-3xl p-10 text-center mt-12">
          <h3 className="text-white text-xl font-semibold mb-4">📧 Contact</h3>
          <a
            href="mailto:astra.loveai@gmail.com"
            className="inline-block bg-white/20 hover:bg-white/30 text-white no-underline px-8 py-3 rounded-xl text-base font-semibold mb-3 transition-all hover:scale-105"
          >
            astra.loveai@gmail.com
          </a>
          <p className="text-white/80 text-[13px] m-0">
            Pour toute question sur les CGV
          </p>
        </div>
      </div>
    </div>
  );
}
