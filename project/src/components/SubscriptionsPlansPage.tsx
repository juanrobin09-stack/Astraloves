import { ArrowLeft, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface SubscriptionsPlansPageProps {
  onNavigate: (page: string) => void;
}

export default function SubscriptionsPlansPage({ onNavigate }: SubscriptionsPlansPageProps) {
  const { user } = useAuth();
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUserTier();
  }, [user]);

  const fetchUserTier = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('premium_tier')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setCurrentTier(data.premium_tier || 'free');
    }
  };

  const handleSubscribe = async (tier: string) => {
    if (currentTier === tier) {
      onNavigate('my-subscription');
      return;
    }

    if (tier === 'free') {
      return;
    }

    setLoading(tier);

    try {
      const priceId = tier === 'premium'
        ? import.meta.env.VITE_STRIPE_PRICE_PREMIUM
        : import.meta.env.VITE_STRIPE_PRICE_ELITE;

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      const stripe = await stripePromise;
      if (stripe && data.sessionId) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Erreur lors de la souscription. Réessayez plus tard.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="subscription-page">
      <header className="sub-header">
        <button
          onClick={() => onNavigate('profile')}
          className="btn-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1>Abonnements</h1>
      </header>

      <div className="sub-intro">
        <h2>✨ Débloque tout ton potentiel cosmique</h2>
        <p>Choisis le pouvoir qui te correspond</p>
      </div>

      <div className="plans-container">
        {/* GRATUIT */}
        <div className={`plan-card plan-free ${currentTier === 'free' ? 'current' : ''}`}>
          <div className="plan-header">
            <span className="plan-emoji">🌑</span>
            <div className="plan-titles">
              <h3>Gratuit</h3>
              <span className="plan-subtitle">Étoile Naissante</span>
            </div>
            <span className="plan-price">0€</span>
          </div>

          {currentTier === 'free' && (
            <div className="current-badge">
              <Check className="w-4 h-4" />
              Abonnement actif
            </div>
          )}

          <ul className="plan-features">
            <li><span>💫</span> 10 signaux cosmiques par jour</li>
            <li><span>🤖</span> 10 messages Astra IA par jour</li>
            <li><span>💬</span> 20 messages matchs par jour</li>
            <li><span>🔮</span> Horoscope du jour basique</li>
            <li><span>📷</span> 5 photos de profil max</li>
            <li><span>📝</span> Bio 200 caractères max</li>
            <li><span>⭐</span> Compatibilité cosmique basique</li>
            <li><span>🌌</span> Vision limitée (15 étoiles)</li>
            <li className="negative"><X className="w-4 h-4" /> Pas de boost de visibilité</li>
            <li className="negative"><X className="w-4 h-4" /> Profils floutés</li>
            <li className="negative"><X className="w-4 h-4" /> Pas de Super Nova</li>
          </ul>
        </div>

        {/* PREMIUM */}
        <div className={`plan-card plan-premium ${currentTier === 'premium' ? 'current' : ''}`}>
          <div className="plan-header">
            <span className="plan-emoji">💎</span>
            <div className="plan-titles">
              <h3>Premium</h3>
              <span className="plan-subtitle">Étoile Brillante</span>
            </div>
            <div className="plan-price-container">
              <span className="plan-price">9,99€</span>
              <span className="plan-period">/mois</span>
            </div>
          </div>

          {currentTier === 'premium' && (
            <div className="current-badge">
              <Check className="w-4 h-4" />
              💎 Abonnement en cours
            </div>
          )}

          <ul className="plan-features">
            <li className="highlight"><Check className="w-4 h-4" /> Signaux cosmiques illimités</li>
            <li className="highlight"><Check className="w-4 h-4" /> 1 Super Nova par jour</li>
            <li className="highlight"><Check className="w-4 h-4" /> 40 messages Astra IA par jour</li>
            <li className="highlight"><Check className="w-4 h-4" /> Messages matchs illimités</li>
            <li className="highlight"><Check className="w-4 h-4" /> Voir qui t'a envoyé un signal</li>
            <li className="highlight"><Check className="w-4 h-4" /> Vision étendue (50 étoiles)</li>
            <li className="highlight"><Check className="w-4 h-4" /> Filtres avancés (âge, ville, signe)</li>
            <li className="highlight"><Check className="w-4 h-4" /> Boost de visibilité x3</li>
            <li className="highlight"><Check className="w-4 h-4" /> Matchs 92% compatibilité IA</li>
            <li className="highlight"><Check className="w-4 h-4" /> Conseils de profil par IA</li>
            <li className="highlight"><Check className="w-4 h-4" /> Ice-breakers générés par Astra</li>
            <li><span>🔮</span> Horoscope avancé détaillé</li>
            <li><span>📷</span> 10 photos de profil max</li>
            <li><span>📝</span> Bio 500 caractères max</li>
            <li><span>💎</span> Badge Premium visible</li>
            <li className="highlight"><Check className="w-4 h-4" /> Ton étoile brille 2x plus</li>
          </ul>

          {currentTier !== 'premium' && currentTier !== 'premium_elite' && (
            <button
              className="btn-choose-plan btn-premium"
              onClick={() => handleSubscribe('premium')}
              disabled={loading === 'premium'}
            >
              {loading === 'premium' ? 'Chargement...' : 'Choisir Premium'}
            </button>
          )}

          {currentTier === 'premium' && (
            <button
              className="btn-choose-plan btn-manage"
              onClick={() => onNavigate('my-subscription')}
            >
              Gérer mon abonnement
            </button>
          )}
        </div>

        {/* ELITE */}
        <div className={`plan-card plan-elite ${currentTier === 'premium_elite' ? 'current' : ''}`}>
          <div className="recommended-badge">⭐ Recommandé</div>

          <div className="plan-header">
            <span className="plan-emoji">👑</span>
            <div className="plan-titles">
              <h3>Premium+ Elite</h3>
              <span className="plan-subtitle">Supernova</span>
            </div>
            <div className="plan-price-container">
              <span className="plan-price elite-price">14,99€</span>
              <span className="plan-period">/mois</span>
            </div>
          </div>

          {currentTier === 'premium_elite' && (
            <div className="current-badge elite">
              <Check className="w-4 h-4" />
              👑 Abonnement en cours
            </div>
          )}

          <ul className="plan-features">
            <li className="highlight"><Check className="w-4 h-4" /> Signaux cosmiques ILLIMITÉS</li>
            <li className="highlight"><Check className="w-4 h-4" /> 5 Super Nova par jour</li>
            <li className="highlight"><Check className="w-4 h-4" /> 65 messages Astra IA Ultra par jour</li>
            <li className="highlight"><Check className="w-4 h-4" /> Coach IA Pro personnalisé</li>
            <li className="highlight"><Check className="w-4 h-4" /> Messages matchs illimités</li>
            <li className="highlight"><Check className="w-4 h-4" /> Voir qui t'a envoyé un signal + QUAND</li>
            <li className="highlight"><Check className="w-4 h-4" /> Vision TOTALE de l'univers (∞)</li>
            <li className="highlight"><Check className="w-4 h-4" /> Tous les filtres + "En ligne"</li>
            <li className="highlight"><Check className="w-4 h-4" /> Rembobinage (revoir étoiles passées)</li>
            <li className="highlight"><Check className="w-4 h-4" /> Mode incognito premium</li>
            <li className="highlight"><Check className="w-4 h-4" /> Badge Elite exclusif + Top 1%</li>
            <li><span>📷</span> 20 photos de profil max</li>
            <li><span>🔥</span> Bio illimitée</li>
            <li className="highlight"><Check className="w-4 h-4" /> Boost Elite x10 de visibilité</li>
            <li className="highlight"><Check className="w-4 h-4" /> 10 super likes par jour</li>
            <li className="highlight"><Check className="w-4 h-4" /> Filtres astro avancés</li>
            <li><span>🌌</span> Thème astral complet détaillé</li>
            <li className="highlight"><Check className="w-4 h-4" /> Compatibilité cosmique + Prédictions</li>
            <li className="highlight"><Check className="w-4 h-4" /> Aura dorée animée sur ton étoile</li>
            <li className="highlight"><Check className="w-4 h-4" /> Effet étoile filante (priorité)</li>
            <li className="highlight"><Check className="w-4 h-4" /> Astra écrit tes premiers messages</li>
          </ul>

          {currentTier !== 'premium_elite' && (
            <button
              className="btn-choose-plan btn-elite"
              onClick={() => handleSubscribe('premium_elite')}
              disabled={loading === 'premium_elite'}
            >
              {loading === 'premium_elite' ? 'Chargement...' : 'Choisir Premium+ Elite'}
            </button>
          )}

          {currentTier === 'premium_elite' && (
            <button
              className="btn-choose-plan btn-manage"
              onClick={() => onNavigate('my-subscription')}
            >
              Gérer mon abonnement
            </button>
          )}
        </div>
      </div>

      <div className="sub-footer">
        <p>Annulation possible à tout moment</p>
        <p className="small">Les prix incluent la TVA applicable</p>
      </div>
    </div>
  );
}
