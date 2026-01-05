import { ArrowLeft, Building2 } from 'lucide-react';

type MentionsLegalesSimpleProps = {
  onBack: () => void;
};

export default function MentionsLegalesSimple({ onBack }: MentionsLegalesSimpleProps) {
  return (
    <div className="min-h-screen velvet-bg relative overflow-hidden">
      <div className="stars-bg absolute inset-0 opacity-30" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={onBack}
          className="text-white hover:text-red-600 flex items-center gap-2 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <div className="premium-card rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="w-10 h-10 text-red-600" />
            <h1 className="text-3xl font-bold text-white">
              Mentions légales
            </h1>
          </div>

          <div className="text-gray-300 space-y-6 leading-relaxed">
            <div className="space-y-4">
              <p>
                <strong className="text-white">Éditeur :</strong> Juan Robin
              </p>

              <p>
                <strong className="text-white">SIRET :</strong> 994 221 653 00011
              </p>

              <p>
                <strong className="text-white">Directeur de publication :</strong> Juan
              </p>

              <p>
                <strong className="text-white">Contact / DPO :</strong>{' '}
                <a href="mailto:astra.loveai@gmail.com" className="text-red-600 hover:text-red-500 underline">
                  astra.loveai@gmail.com
                </a>
              </p>

              <p>
                <strong className="text-white">Hébergeurs :</strong> Supabase (Irlande) – Netlify/Bolt (USA)
              </p>

              <p className="text-sm text-gray-400 mt-4">
                Service de divertissement pour adultes (+18). Les données personnelles sont hébergées sur des serveurs conformes RGPD.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-red-600/30 text-center">
            <p className="text-gray-500 text-sm">
              Divertissement • 18+ • Pas de conseil médical
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
