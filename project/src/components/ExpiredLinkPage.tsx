import { AlertCircle, Star, Mail } from 'lucide-react';

type ExpiredLinkPageProps = {
  onRequestNewLink: () => void;
};

export default function ExpiredLinkPage({ onRequestNewLink }: ExpiredLinkPageProps) {
  return (
    <div className="min-h-screen velvet-bg relative overflow-hidden flex items-center justify-center p-4">
      <div className="stars-bg absolute inset-0 opacity-30" />

      <div className="relative z-10 max-w-md w-full">
        <div className="premium-card rounded-3xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <Star className="w-20 h-20 text-red-600 premium-glow animate-pulse-glow" fill="white" />
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-white premium-text-sm">
              Lien expiré
            </h1>
          </div>

          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Ton lien d'accès a expiré. Pas de problème, on t'en renvoie un nouveau tout de suite.
          </p>

          <button
            onClick={onRequestNewLink}
            className="w-full premium-button text-white font-bold py-4 px-6 rounded-xl text-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
            style={{ backgroundColor: '#E91E63' }}
          >
            <Mail className="w-6 h-6" />
            Renvoyer mon lien d'accès
          </button>

          <p className="text-gray-500 text-sm mt-6">
            Tu seras redirigé vers la page d'accueil pour entrer ton email
          </p>
        </div>
      </div>
    </div>
  );
}
