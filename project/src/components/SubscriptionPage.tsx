import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { usePremiumStatus } from '../hooks/usePremiumStatus';

type SubscriptionPageProps = {
  onBack: () => void;
  onSubscribe?: () => void;
};

type PlanCardProps = {
  title: string;
  price: string;
  features: string[];
  isActive: boolean;
  upgradeLink?: string;
  showUpgradeButton?: boolean;
  specialNote?: string;
};

const messagesAstraLimits = {
  free: 10,
  premium: 40,
  premiumPlus: 105,
};

const planMessagesAstra = (plan: string) => {
  if (plan === 'premiumPlus' || plan === 'premium+elite') return `${messagesAstraLimits.premiumPlus} messages/jour avec Astra`;
  if (plan === 'premium') return `${messagesAstraLimits.premium} messages/jour avec Astra`;
  return `${messagesAstraLimits.free} messages/jour avec Astra`;
};

const PlanCard = ({ title, price, features, isActive, upgradeLink, showUpgradeButton, specialNote }: PlanCardProps) => (
  <div
    className={`p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl flex flex-col border-2 transition-all duration-300 md:hover:scale-105 ${
      isActive
        ? 'border-yellow-400 bg-gradient-to-br from-black via-red-900 to-black shadow-lg shadow-yellow-500/20'
        : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-red-600/50'
    }`}
  >
    <h3 className={`text-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${isActive ? 'text-yellow-400' : 'text-red-400'}`}>
      {title}
    </h3>
    <p className={`text-center text-3xl sm:text-4xl font-extrabold mb-4 sm:mb-6 ${isActive ? 'text-yellow-300' : 'text-gray-400'}`}>
      {price}
    </p>
    <ul className="flex-1 text-xs sm:text-sm space-y-2">
      {features.map((f, i) => (
        <li key={i} className={`pl-3 sm:pl-4 border-l-4 ${isActive ? 'border-yellow-400' : 'border-red-600'} leading-relaxed`}>
          {f}
        </li>
      ))}
    </ul>
    {specialNote && <p className="mt-4 text-center text-yellow-300 font-semibold">{specialNote}</p>}
    {showUpgradeButton && upgradeLink && (
      <a
        href={upgradeLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 sm:mt-8 block bg-yellow-400 text-black py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-base text-center shadow hover:shadow-xl transition transform active:scale-95 md:hover:scale-105 min-h-[44px]"
      >
        Upgrader maintenant
      </a>
    )}
    {isActive && !showUpgradeButton && (
      <div className="mt-8 text-center text-yellow-300 font-semibold">Abonnement actif</div>
    )}
  </div>
);

const FaqSection = () => (
  <div className="max-w-3xl mx-auto text-gray-300 mt-12">
    <h2 className="text-3xl font-extrabold mb-8 text-center text-red-400">Questions fréquentes</h2>
    <ul className="space-y-6 text-sm">
      <li>
        <strong>💳 Paiement sécurisé :</strong> Stripe sécurisé • Abonnements mensuels • Annulation à tout moment via Stripe • Pas d'engagement.
      </li>
      <li>
        <strong>⚡ IA Boost x3 :</strong> Ton profil est affiché 3x plus souvent, assurant +300% de matchs garantis.
      </li>
      <li>
        <strong>🧠 Chat Astra :</strong> IA astrologique personnalisée avec limites adaptées à ton abonnement, création de messages parfaits, compatibilité 92%.
      </li>
    </ul>
  </div>
);

const SubscriptionPage = ({ onBack }: SubscriptionPageProps) => {
  const { isPremium, premiumTier, premiumUntil, loading, error } = usePremiumStatus();

  useEffect(() => {
    // Débloquer le scroll au montage du composant
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';

    // Force scroll reset
    window.scrollTo(0, 0);

    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

  if (loading) {
    return <div className="text-white text-center py-20">Chargement...</div>;
  }
  if (error) {
    return <div className="text-red-500 text-center py-20">Erreur lors du chargement des données.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-red-900/20">
      <div className="flex-1 overflow-y-auto py-6 sm:py-12 md:py-16 px-4 sm:px-6 md:px-12 pb-24" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#ef4444 #1a1a1a'
      }}>
        <div className="max-w-5xl mx-auto text-white">

        <button
          onClick={onBack}
          className="mb-8 text-white/80 hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8 md:mb-12 bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-red-500">
          Mon Abonnement
        </h1>

        <div className="text-center mb-8 md:mb-12 text-base md:text-lg font-semibold">
          Ton statut : {premiumTier === 'premium+elite' ? '👑 Premium+ Elite' : isPremium ? '💎 Premium' : '🆓 Gratuit'}
          {premiumUntil && (
            <div className="mt-2 text-sm text-gray-400">
              Actif jusqu'au {new Date(premiumUntil).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 mb-12 md:mb-16">

          {/* Gratuit */}
          <PlanCard
            title="🆓 Gratuit"
            price="0€"
            features={[
              "5 swipes/jour",
              "10 messages/jour avec Astra",
              "Chat illimité avec les personnes",
              "10 messages/jour vers matchs",
              "Questionnaires basiques limités",
              "3 photos max",
              "Bio 150 caractères",
              "Regarder tous les lives",
              "5 réactions gratuites/live",
              "3 messages chat/live",
              "Recevoir cadeaux cosmiques",
            ]}
            isActive={!isPremium}
            upgradeLink="https://buy.stripe.com/bJe28s83xcdi7xObRXgw000"
            showUpgradeButton={!isPremium}
          />

          {/* Premium */}
          <PlanCard
            title="💎 Premium"
            price="9,99€/mois"
            features={[
              "Swipes illimités",
              planMessagesAstra('premium'),
              "Chat illimité avec les personnes",
              "Messages matchs illimités",
              "IA Boost x3 visibilité",
              "Matchs 92% compatibilité IA",
              "Questionnaires premium illimités",
              "Conseils profil IA personnalisés",
              "Badge Premium 💎",
              "10 photos max",
              "Bio 500 caractères",
              "Réactions illimitées en live",
              "Messages chat illimités en live",
              "Badge Premium 💎 dans le chat",
              "1 live/semaine (1h max)",
              "Max 200 spectateurs",
              "100 étoiles offertes/mois",
              "-20% sur achats de cadeaux",
              "Commission réduite : 15% (vs 30%)",
            ]}
            isActive={isPremium && premiumTier !== 'premium+elite'}
            upgradeLink="https://buy.stripe.com/bJe28s83xcdi7xObRXgw000"
            showUpgradeButton={!isPremium}
          />

          {/* Premium+ Elite */}
          <PlanCard
            title="👑 Premium+ Elite"
            price="14,99€/mois"
            specialNote="⭐ Offre Lancement : 1er mois à 9,99€ !"
            features={[
              "Swipes illimités",
              planMessagesAstra('premiumPlus'),
              "Chat illimité avec les personnes",
              "Messages matchs illimités",
              "Coach Pro Personnalisé & Astra Ultra-Rapide",
              "Lives illimités - Aucune limite quotidienne",
              "500 étoiles offertes chaque mois",
              "Commission réduite à 5% sur les cadeaux",
              "Badge Elite visible sur ton profil",
              "Cadeaux cosmiques exclusifs débloqués",
              "Boost Elite x10 & 10 super likes/jour",
              "Filtres ultra avancés (ascendant, lune etc.)",
              "Voir qui a visité ton profil, mode incognito",
              "Profil Top 1% - 20 photos max, bio illimitée",
              "Multi-angle caméra & enregistrement + replay 7j",
              "Effets AR cosmiques avancés, musique Spotify",
              "Analytics Pro complet live & matching",
              "Cercle élite privé, events VIP & networking",
              "Stories Elite 72h avec stickers cosmiques animés",
              "Support prioritaire 24/7, réponse < 1h garantie",
              "Bêta features & badge Fondateur 2024",
            ]}
            isActive={premiumTier === 'premium+elite'}
            upgradeLink="https://buy.stripe.com/premiumpluselite"
            showUpgradeButton={false}
          />
        </div>

        {premiumTier !== 'premium+elite' && (
          <div className="text-center px-4">
            <a
              href={premiumTier === 'premium' ? "https://buy.stripe.com/premiumpluselite" : "https://buy.stripe.com/bJe28s83xcdi7xObRXgw000"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full sm:w-auto bg-yellow-400 text-black px-6 sm:px-8 py-4 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-2xl transition-transform active:scale-95 md:hover:scale-105 min-h-[56px]"
            >
              <div className="leading-tight">
                {premiumTier === 'premium' ? "Passer Premium+ Elite" : "Passer Premium"}
                <span className="block sm:inline sm:ml-1">- {premiumTier === 'premium' ? "14,99€/mois" : "9,99€/mois"}</span>
              </div>
              {premiumTier === 'premium' && <div className="text-xs sm:text-sm mt-1 font-semibold">🎉 Offre lancement : 1er mois à 9,99€ !</div>}
            </a>
          </div>
        )}

        {/* FAQ Section */}
        <FaqSection />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
