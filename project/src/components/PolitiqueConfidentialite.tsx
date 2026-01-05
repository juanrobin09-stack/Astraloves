import { useEffect } from 'react';

type PolitiqueConfidentialiteProps = {
  onBack: () => void;
};

export default function PolitiqueConfidentialite({ onBack }: PolitiqueConfidentialiteProps) {
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
            🔒
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Politique de confidentialité
          </h1>
          <p className="text-[#6b6b6b] text-sm">
            Dernière mise à jour : 24 novembre 2025
          </p>
        </div>

        {/* Sections */}
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
            🗄️ Conservation
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
            🌍 Hébergement
          </h2>
          <div className="space-y-4">
            <div className="bg-[#252525] border border-[#2a2a2a] rounded-xl p-5">
              <strong className="text-white text-base block mb-2">Supabase (Irlande)</strong>
              <p className="text-[#a3a3a3] text-sm m-0">Base de données - Conformité RGPD</p>
            </div>
            <div className="bg-[#252525] border border-[#2a2a2a] rounded-xl p-5">
              <strong className="text-white text-base block mb-2">Netlify (USA)</strong>
              <p className="text-[#a3a3a3] text-sm m-0">Hébergement app - Privacy Shield</p>
            </div>
          </div>
        </section>

        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            ⚖️ Tes droits RGPD
          </h2>
          <div className="text-[#a3a3a3] leading-relaxed space-y-3">
            <ul className="space-y-3">
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                <strong className="text-white">Accès :</strong> Obtenir une copie de tes données
              </li>
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                <strong className="text-white">Rectification :</strong> Corriger tes informations
              </li>
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                <strong className="text-white">Suppression :</strong> Effacer ton compte
              </li>
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                <strong className="text-white">Opposition :</strong> Refuser certains traitements
              </li>
            </ul>
          </div>
        </section>

        {/* Contact box */}
        <div className="bg-gradient-to-r from-[#ef4444] to-[#dc2626] rounded-3xl p-10 text-center mt-12">
          <h3 className="text-white text-xl font-semibold mb-4">📧 Contact DPO</h3>
          <a
            href="mailto:astra.loveai@gmail.com"
            className="inline-block bg-white/20 hover:bg-white/30 text-white no-underline px-8 py-3 rounded-xl text-base font-semibold mb-3 transition-all hover:scale-105"
          >
            astra.loveai@gmail.com
          </a>
          <p className="text-white/80 text-[13px] m-0">
            Délai de réponse : 30 jours maximum
          </p>
        </div>
      </div>
    </div>
  );
}
