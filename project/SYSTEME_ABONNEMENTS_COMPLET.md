# Système d'Abonnements Complet

Le système d'abonnements avec 3 tiers est maintenant complètement implémenté et fonctionnel.

## Structure des Abonnements

### 3 Tiers Disponibles

#### 1. GRATUIT (free)
- 10 swipes par jour
- 10 messages Astra IA par jour
- 20 messages matchs par jour
- 5 photos de profil max
- Bio 200 caractères max
- Horoscope basique
- Pas de badge
- Pas de boost de visibilité

#### 2. PREMIUM (premium) - 9,99€/mois
- ♾️ Swipes illimités
- 40 messages Astra IA par jour
- Messages matchs illimités
- 10 photos de profil max
- Bio 500 caractères max
- Boost de visibilité x3
- Matchs 92% compatibilité IA
- Conseils de profil par IA
- Horoscope avancé détaillé
- Badge 💎 Premium visible

#### 3. PREMIUM+ ELITE (premium_elite) - 14,99€/mois
- ♾️ Swipes illimités
- 65 messages Astra IA Ultra par jour
- Messages matchs illimités
- 20 photos de profil max
- Bio illimitée
- Boost Elite x10 de visibilité
- Coach IA Pro personnalisé
- 10 super likes par jour
- Filtres astro avancés
- Mode incognito premium
- Voir qui a visité ton profil
- Thème astral complet détaillé
- Badge 👑 Elite · Top 1%

## Fichiers Créés

### 1. `src/lib/subscriptionTiers.ts`
Définit les constantes SUBSCRIPTION_TIERS avec toutes les features de chaque tier.

```typescript
import { SUBSCRIPTION_TIERS, getTierByPlan } from '../lib/subscriptionTiers';
```

### 2. `src/hooks/useSubscriptionLimits.ts`
Hook personnalisé pour gérer les limites et vérifications.

```typescript
const { tier, features, dailyUsage, checkLimit, incrementUsage, refreshLimits } = useSubscriptionLimits();
```

### 3. `src/components/UpgradeModal.tsx`
Modal qui s'affiche quand une limite est atteinte.

```typescript
<UpgradeModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  message="Message personnalisé"
  onUpgrade={() => navigate('subscriptions-plans')}
/>
```

### 4. `src/components/SubscriptionsPlansPage.tsx`
Page complète d'abonnements avec les 3 tiers et intégration Stripe.

## Architecture Supabase

### Tables Utilisées
- `profiles` : premium_tier, swipes_today, messages_matchs_today, super_likes_today, last_reset_date
- `astra_profiles` : daily_astra_messages, daily_swipes, daily_match_messages, daily_super_likes

### Fonctions RPC
- `increment_user_swipes(user_id)` : Incrémente les swipes avec vérification
- `increment_user_match_messages(user_id)` : Incrémente les messages matchs avec vérification
- `activate_user_boost(user_id)` : Active le boost de visibilité

### Reset Automatique
Les compteurs sont automatiquement réinitialisés à minuit grâce à la colonne `last_reset_date`.

## Utilisation dans les Composants

### SwipePage
Affiche déjà le compteur de swipes dans le header :
- ♾️ Illimités (pour premium/elite)
- X/10 (pour gratuit)

```typescript
const swipeStats = useDailyLimits(user?.id);
if (!swipeStats.canSwipe) {
  setShowLimitModal(true);
  return;
}
```

### AstraChat
Affiche déjà le compteur de messages Astra :
- X/10 (gratuit)
- X/40 (premium)
- X/65 (elite)

```typescript
const { messagesUsed, limit, remaining, checkLimit } = useAstraChatLimit({
  userId: user?.id,
  premiumTier: userTier
});
```

## Navigation

### Accéder à la page d'abonnements
```typescript
onNavigate('subscriptions-plans')
```

### Route ajoutée dans App.tsx
```typescript
if (page === 'subscriptions-plans') {
  return <SubscriptionsPlansPage onNavigate={...} />
}
```

## Intégration Stripe

La page SubscriptionsPlansPage est déjà connectée à Stripe :
- Utilise `create-checkout` edge function
- Redirige vers le checkout Stripe
- Gère les webhooks pour activer les abonnements

## Affichage des Badges

Les badges sont automatiquement affichés selon le tier :
- Gratuit : Pas de badge
- Premium : 💎 Premium
- Elite : 👑 Elite · Top 1%

## Variables d'Environnement Requises

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
VITE_STRIPE_PRICE_PREMIUM=price_...
VITE_STRIPE_PRICE_ELITE=price_...
```

## Vérifications de Limites

Le système vérifie automatiquement les limites AVANT chaque action :
- ✅ Swipe
- ✅ Message Astra
- ✅ Message Match
- ✅ Super Like
- ✅ Ajout de photo

Si la limite est atteinte, un modal d'upgrade s'affiche automatiquement.

## Compteurs UI

Tous les compteurs sont affichés en temps réel dans l'interface :
- Header SwipePage : Swipes restants
- Chat Astra : Messages Astra restants
- Badge Premium/Elite visible sur les profils

## Reset Quotidien

Le système détecte automatiquement le changement de jour et reset les compteurs :
- Vérifie `last_reset_date` vs date du jour
- Reset automatique à 00h00
- Pas besoin de CRON job

## Tests

Pour tester le système :
1. Naviguer vers `/subscriptions-plans`
2. Voir les 3 tiers avec leurs features
3. Cliquer sur "Commencer Premium" ou "Devenir Elite"
4. Être redirigé vers Stripe Checkout
5. Après paiement, revenir et voir le tier activé

## Prochaines Étapes Possibles

- Ajouter des offres promotionnelles
- Système de referral avec récompenses
- Badge vérifié pour certains utilisateurs
- Statistiques d'utilisation des features premium
- A/B testing des prix
