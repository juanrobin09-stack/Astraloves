import { useEffect } from 'react';

type MentionsLegalesProps = {
  onBack: () => void;
};

export default function MentionsLegales({ onBack }: MentionsLegalesProps) {
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
            🏛️
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Mentions Légales
          </h1>
          <p className="text-[#6b6b6b] text-sm">
            Conformité LCEN (Loi pour la Confiance dans l'Économie Numérique)
          </p>
        </div>

        {/* Sections */}
        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            🏢 Éditeur du site
          </h2>
          <div className="text-[#a3a3a3] leading-relaxed space-y-3">
            <div className="bg-[#252525] border border-[#2a2a2a] rounded-xl p-5">
              <p className="space-y-2">
                <span className="block"><strong className="text-white">Nom du service :</strong> Astra</span>
                <span className="block"><strong className="text-white">Nature :</strong> Coach IA en amour et relations</span>
                <span className="block"><strong className="text-white">Statut juridique :</strong> [À compléter]</span>
                <span className="block"><strong className="text-white">SIRET :</strong> [À compléter si applicable]</span>
                <span className="block"><strong className="text-white">Siège social :</strong> [Adresse à compléter]</span>
                <span className="block">
                  <strong className="text-white">Email :</strong>{' '}
                  <a href="mailto:astra.loveai@gmail.com" className="text-[#ef4444] hover:underline">
                    astra.loveai@gmail.com
                  </a>
                </span>
              </p>
            </div>
            <p className="text-sm text-[#6b6b6b] italic mt-4 p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl">
              Note : Ces informations doivent être complétées avec les données réelles de l'éditeur du service.
            </p>
          </div>
        </section>

        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            👤 Directeur de la publication
          </h2>
          <div className="text-[#a3a3a3] leading-relaxed space-y-3">
            <p>
              <strong className="text-white">Nom :</strong> [Nom du responsable]<br />
              <strong className="text-white">Email :</strong>{' '}
              <a href="mailto:astra.loveai@gmail.com" className="text-[#ef4444] hover:underline">
                astra.loveai@gmail.com
              </a>
            </p>
          </div>
        </section>

        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            🌐 Hébergement
          </h2>
          <div className="space-y-4">
            <div className="bg-[#252525] border border-[#2a2a2a] rounded-xl p-5">
              <strong className="text-white text-base block mb-2">Application Web - Netlify</strong>
              <p className="text-[#a3a3a3] text-sm space-y-1">
                <span className="block">Netlify, Inc.</span>
                <span className="block">44 Montgomery Street, Suite 300</span>
                <span className="block">San Francisco, CA 94104, USA</span>
                <span className="block">
                  Site :{' '}
                  <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer" className="text-[#ef4444] hover:underline">
                    www.netlify.com
                  </a>
                </span>
              </p>
            </div>

            <div className="bg-[#252525] border border-[#2a2a2a] rounded-xl p-5">
              <strong className="text-white text-base block mb-2">Base de données - Supabase</strong>
              <p className="text-[#a3a3a3] text-sm space-y-1">
                <span className="block">Supabase Inc.</span>
                <span className="block">Serveurs en Irlande (Europe)</span>
                <span className="block">Conformité RGPD</span>
                <span className="block">
                  Site :{' '}
                  <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#ef4444] hover:underline">
                    supabase.com
                  </a>
                </span>
              </p>
            </div>
          </div>
        </section>

        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            ⚖️ Propriété intellectuelle
          </h2>
          <div className="text-[#a3a3a3] leading-relaxed space-y-3">
            <p>
              L'ensemble du site Astra (structure, textes, logos, images, code) est protégé par le droit d'auteur.
            </p>
            <p>
              <strong className="text-white">Toute reproduction</strong> ou représentation, totale ou partielle, sans autorisation
              écrite de l'éditeur est <strong className="text-white">interdite</strong> et constituerait une contrefaçon
              sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
            </p>
          </div>
        </section>

        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            🍪 Cookies
          </h2>
          <div className="text-[#a3a3a3] leading-relaxed space-y-3">
            <p>
              Le site Astra utilise des cookies strictement nécessaires au fonctionnement du service (authentification, sécurité).
            </p>
            <ul className="space-y-2">
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                <strong className="text-white">Session utilisateur :</strong> maintenir la connexion
              </li>
              <li className="pl-7 relative">
                <span className="absolute left-3 text-[#ef4444] text-xl">•</span>
                <strong className="text-white">Sécurité :</strong> protection contre les attaques
              </li>
            </ul>
            <p className="mt-3">
              Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
            </p>
          </div>
        </section>

        <section className="legal-section bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] hover:border-[#ef4444] rounded-3xl p-8 mb-6 transition-all hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]">
          <h2 className="text-[#ef4444] text-2xl font-semibold mb-5 flex items-center gap-2">
            🔐 Responsabilité
          </h2>
          <div className="text-[#a3a3a3] leading-relaxed space-y-3">
            <p>
              L'éditeur s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le site,
              mais ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
            </p>
            <p className="mt-3 p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl">
              <strong className="text-[#ef4444]">⚠️ Rappel :</strong> Astra est un service de divertissement.
              Les conseils fournis ne constituent pas un avis médical ou psychologique professionnel.
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
            Pour toute question juridique
          </p>
        </div>
      </div>
    </div>
  );
}
