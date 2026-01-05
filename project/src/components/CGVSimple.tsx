import { ArrowLeft, FileText } from 'lucide-react';

type CGVSimpleProps = {
  onBack: () => void;
};

export default function CGVSimple({ onBack }: CGVSimpleProps) {
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
            <FileText className="w-10 h-10 text-red-600" />
            <h1 className="text-3xl font-bold text-white">
              Conditions Générales de Vente
            </h1>
          </div>

          <div className="text-gray-300 space-y-6 leading-relaxed">
            <div className="space-y-4">
              <p>
                <strong className="text-white">Abonnement Premium 9,99 €/mois TTC</strong> – reconduction automatique.
              </p>

              <p>
                <strong className="text-white">Résiliation à tout moment</strong> dans la section Mon abonnement de ton profil (effet immédiat, sans frais supplémentaires).
              </p>

              <p>
                <strong className="text-white">Délai de rétractation de 14 jours</strong> (remboursement intégral si demandé avant).
              </p>

              <p>
                <strong className="text-white">Paiement sécurisé par Stripe</strong> – nous n'avons jamais accès à tes données bancaires.
              </p>

              <p>
                <strong className="text-white">Service de divertissement 18+</strong> – aucun conseil médical ou psychologique.
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
