# ✅ SYSTÈME DE PLANS ET LIMITATIONS - INTÉGRATION RÉUSSIE

## 🎉 Ce qui a été implémenté

### 1. Infrastructure de base (100% ✅)

#### Migration Supabase
**Fichier**: `supabase/migrations/[timestamp]_create_plan_limits_system.sql`

✅ Colonnes ajoutées à `profiles` :
- `swipes_today` - Compteur de swipes quotidiens
- `messages_astra_today` - Compteur messages Astra IA
- `messages_matchs_today` - Compteur messages matchs
- `super_likes_today` - Compteur super likes
- `last_reset_date` - Date du dernier reset
- `boost_active` - État du boost de visibilité
- `boost_expiry` - Expiration du boost
- `incognito_mode` - Mode incognito (Elite)

✅ Table `profile_visitors` créée :
- Track les visiteurs de profil (fonctionnalité Elite)
- Policies RLS configurées

✅ Fonctions Postgres créées :
- `increment_user_swipes(user_id)` - Incrémenter swipes avec limite
- `increment_user_match_messages(user_id)` - Incrémenter messages matchs
- `activate_user_boost(user_id)` - Activer boost selon le plan
- `check_expired_boosts()` - Trigger auto-désactivation boosts

### 2. Hooks React (100% ✅)

#### useUserLimits
**Fichier**: `src/hooks/useUserLimits.ts`

Retourne les limites selon le plan utilisateur :

```typescript
const limits = useUserLimits(user.premium_tier);

// FREE: 10 swipes, 10 msg Astra, 20 msg matchs, 5 photos, bio 200 car
// PREMIUM: ∞ swipes, 40 msg Astra, ∞ matchs, 10 photos, bio 500 car, boost x3
// ELITE: ∞ swipes, 65 msg Astra Ultra, 10 super likes, 20 photos, bio ∞, boost x10
```

#### useDailyLimits
**Fichier**: `src/hooks/useDailyLimits.ts`

Gère les compteurs quotidiens :
- Reset automatique à minuit
- `incrementSwipes()` avec vérification
- `incrementMatchMessages()` avec vérification
- Retourne `counts` avec tous les compteurs

### 3. Composants React (100% ✅)

#### UpgradePopup
**Fichier**: `src/components/UpgradePopup.tsx`

Popup universelle pour inciter à l'upgrade :
- Titre et message personnalisables
- Affiche la feature débloquée
- Boutons Premium et/ou Elite
- Intégré avec système de navigation

#### PlanBadge
**Fichier**: `src/components/PlanBadge.tsx`

Badge visuel Premium/Elite :
- 💎 PREMIUM (gradient rose-violet)
- 👑 ELITE (gradient jaune-orange)
- Sizes : sm, md, lg
- N'affiche rien pour FREE

### 4. Intégrations réalisées (50% ✅)

#### ✅ SwipePage - INTÉGRÉ
**Fichier**: `src/components/SwipePagePure.tsx`

Modifications apportées :
- Import de `UpgradePopup` et `PlanBadge`
- Vérification limite de swipes avant chaque swipe
- Utilise `increment_user_swipes()` via RPC
- Affiche popup quand limite atteinte
- Badge Premium/Elite sur les cartes de profil
- Compteur de swipes pour utilisateurs FREE

**Fonctionnement** :
1. Utilisateur swipe → Vérification `swipeStats.canSwipe`
2. Si limite atteinte → Affiche `UpgradePopup`
3. Sinon → Incrémente via `incrementSwipeCount()`
4. Rafraîchit les stats après chaque swipe

#### ✅ dailySwipes.ts - MIS À JOUR
**Fichier**: `src/lib/dailySwipes.ts`

Modifications :
- Utilise `profiles.premium_tier` et `profiles.swipes_today`
- Appelle `increment_user_swipes()` RPC
- Retourne `plan` dans SwipeStats
- Limite : 10 pour FREE, ∞ pour PREMIUM/ELITE

#### ⏳ AstraChat - À INTÉGRER
**Ce qui doit être fait** :

```typescript
// Dans AstraChat.tsx
import { useUserLimits } from '../hooks/useUserLimits';
import UpgradePopup from './UpgradePopup';

const limits = useUserLimits(user?.premium_tier);
const [messagesAstraToday, setMessagesAstraToday] = useState(0);
const [showUpgrade, setShowUpgrade] = useState(false);

// Avant d'envoyer un message
if (messagesAstraToday >= limits.messagesAstraPerDay) {
  setShowUpgrade(true);
  return;
}

// Si OK, incrémenter
const { data } = await supabase.rpc('increment_astra_messages', {
  user_id: user.id
});

if (!data.success) {
  setShowUpgrade(true);
  return;
}

// Vitesse de réponse selon le plan
const responseTime = {
  free: 3000,
  premium: 1500,
  premium_elite: 500
};

// Afficher badge Ultra-Rapide pour Elite
{user?.premium_tier === 'premium_elite' && (
  <span className="px-2 py-1 bg-purple-500 rounded text-xs">⚡ Ultra-Rapide</span>
)}
```

#### ⏳ ProfileEdit - À INTÉGRER
**Ce qui doit être fait** :

```typescript
// Limiter les photos
const limits = useUserLimits(user?.premium_tier);

function handleAddPhoto(file: File) {
  if (photos.length >= limits.maxPhotos) {
    setShowUpgrade(true);
    return;
  }
  setPhotos([...photos, file]);
}

// Limiter la bio
function handleBioChange(text: string) {
  if (text.length > limits.maxBioLength && limits.maxBioLength !== Infinity) {
    showToast(`Bio limitée à ${limits.maxBioLength} caractères`);
    return;
  }
  setBio(text);
}

// Afficher compteur
<span className="text-sm text-gray-400">
  {photos.length}/{limits.maxPhotos === Infinity ? '∞' : limits.maxPhotos} photos
</span>

<span className="text-sm text-gray-400">
  {bio.length}/{limits.maxBioLength === Infinity ? '∞' : limits.maxBioLength}
</span>
```

## 📋 FONCTIONNALITÉS À CRÉER

### 1. Boost de visibilité
**Fichier à créer**: `src/components/ProfileBoostButton.tsx`

```typescript
async function activateBoost() {
  const { data, error } = await supabase.rpc('activate_user_boost', {
    user_id: user.id
  });

  if (data.success) {
    showNotification({
      title: `🚀 Boost x${data.multiplier} activé!`,
      message: `Durée: ${getDuration(data.plan)}`,
      duration: 5000
    });
  }
}

// Durées par plan:
// FREE: 30 minutes, x1
// PREMIUM: 1 heure, x3
// ELITE: 3 heures, x10
```

### 2. Indicateur de boost actif
**Fichier à créer**: `src/components/BoostIndicator.tsx`

```typescript
function BoostIndicator({ boostActive, boostExpiry, plan }) {
  if (!boostActive) return null;

  const limits = useUserLimits(plan);
  const minutesRemaining = Math.floor((new Date(boostExpiry) - new Date()) / 60000);

  return (
    <div className="fixed top-20 left-0 right-0 mx-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg p-3 z-50">
      <div className="flex items-center justify-between">
        <span className="font-bold">🚀 Boost x{limits.boostMultiplier} actif</span>
        <span className="text-sm">{minutesRemaining} min restantes</span>
      </div>
    </div>
  );
}
```

### 3. Super Likes (Elite uniquement)
**Fichier à créer**: `src/components/SuperLikeButton.tsx`

```typescript
function SuperLikeButton({ profile, onSuperLike }) {
  const limits = useUserLimits(user?.premium_tier);
  const [superLikesToday, setSuperLikesToday] = useState(0);

  if (limits.superLikesPerDay === 0) {
    return (
      <button onClick={() => setShowUpgrade(true)}>
        <Star className="w-8 h-8 text-gray-500" />
      </button>
    );
  }

  if (superLikesToday >= limits.superLikesPerDay) {
    return (
      <button disabled>
        <Star className="w-8 h-8 text-gray-600" />
        <span className="text-xs">{superLikesToday}/{limits.superLikesPerDay}</span>
      </button>
    );
  }

  return (
    <button onClick={handleSuperLike}>
      <Star className="w-8 h-8 text-yellow-500" fill="currentColor" />
      <span className="text-xs">{superLikesToday}/{limits.superLikesPerDay}</span>
    </button>
  );
}
```

### 4. Coach IA Pro (Elite)
**Fichier à créer**: `src/components/AICoachPage.tsx`

```typescript
function AICoachPage() {
  const limits = useUserLimits(user?.premium_tier);

  if (!limits.hasAICoach) {
    return (
      <div className="text-center p-6">
        <div className="text-6xl mb-4">🤖</div>
        <h2 className="text-2xl font-bold mb-2">Coach IA Pro</h2>
        <p className="text-gray-400 mb-6">
          Coaching personnalisé pour optimiser votre profil
        </p>
        <button onClick={() => navigate('/abonnement')}>
          Passer à Elite
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4">
        <h2>🤖 Coach IA Pro</h2>
        <span className="px-2 py-1 bg-yellow-500 rounded text-xs">ELITE</span>
      </div>

      <div className="mt-4 space-y-4">
        <AnalyseProfil />
        <AnalyseConversations />
        <StrategieOptimale />
      </div>
    </div>
  );
}
```

### 5. Mode Incognito & Visiteurs (Elite)
**Fichier à créer**: `src/components/IncognitoToggle.tsx` et `src/components/ProfileVisitors.tsx`

```typescript
// IncognitoToggle
function IncognitoToggle() {
  const limits = useUserLimits(user?.premium_tier);

  if (!limits.hasIncognito) {
    return <button onClick={() => navigate('/abonnement')}>🔒 Mode Incognito (Elite)</button>;
  }

  return (
    <button onClick={toggleIncognito}>
      🕶️ Mode Incognito {user.incognito_mode ? 'Activé' : 'Désactivé'}
    </button>
  );
}

// ProfileVisitors
function ProfileVisitors() {
  const limits = useUserLimits(user?.premium_tier);
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    if (limits.canSeeVisitors) {
      loadVisitors();
    }
  }, []);

  if (!limits.canSeeVisitors) {
    return <div>👀 Visiteurs (Débloquer avec Elite)</div>;
  }

  return (
    <div>
      <h3>👀 Visiteurs ({visitors.length})</h3>
      {visitors.map(v => (
        <VisitorCard key={v.id} visitor={v} />
      ))}
    </div>
  );
}
```

### 6. Filtres Astrologiques Avancés (Elite)
**Fichier à créer**: `src/components/AdvancedFilters.tsx`

```typescript
function AdvancedFilters() {
  const limits = useUserLimits(user?.premium_tier);

  return (
    <div>
      {/* Filtres basiques (tous) */}
      <AgeFilter />
      <DistanceFilter />
      <SignFilter />

      {/* Filtres avancés (Elite) */}
      <div className={!limits.hasAdvancedFilters ? 'opacity-50 pointer-events-none' : ''}>
        {!limits.hasAdvancedFilters && (
          <div className="overlay">
            <button onClick={() => navigate('/abonnement')}>
              🔒 Débloquer avec Elite
            </button>
          </div>
        )}

        <AscendantFilter disabled={!limits.hasAdvancedFilters} />
        <LuneFilter disabled={!limits.hasAdvancedFilters} />
        <ElementFilter disabled={!limits.hasAdvancedFilters} />
      </div>
    </div>
  );
}
```

### 7. Horoscope Avancé (Premium/Elite)
**Fichier**: `src/components/AstroPage.tsx` - À améliorer

```typescript
function AstroPage() {
  const limits = useUserLimits(user?.premium_tier);

  return (
    <div>
      {/* Horoscope basique (tous) */}
      <div>
        <h2>🔮 Horoscope du jour</h2>
        <p>{getBasicHoroscope(user.signAstro)}</p>
      </div>

      {/* Horoscope avancé (Premium & Elite) */}
      {limits.hasAdvancedAstro ? (
        <div>
          <AnalyseDetaillee />
          <ConseilDuJour />

          {/* Thème astral complet (Elite uniquement) */}
          {user?.premium_tier === 'premium_elite' && (
            <ThemeAstralComplet />
          )}
        </div>
      ) : (
        <div className="text-center p-6">
          <div className="text-4xl mb-2">🔒</div>
          <h3>Horoscope avancé</h3>
          <button onClick={() => navigate('/abonnement')}>
            Passer à Premium
          </button>
        </div>
      )}
    </div>
  );
}
```

## 📊 RÉCAPITULATIF DES LIMITES

### 🆓 Plan FREE
```
✅ 10 swipes par jour
✅ 10 messages Astra IA par jour (3s réponse)
✅ 20 messages matchs par jour
✅ 5 photos de profil max
✅ Bio 200 caractères max
✅ Horoscope basique
❌ Pas de boost
❌ Pas de super likes
❌ Pas de coach IA
❌ Pas d'incognito
❌ Pas de visiteurs
❌ Pas de filtres avancés
```

### 💎 Plan PREMIUM (9,99€/mois)
```
♾️ Swipes illimités
💬 40 messages Astra IA par jour (1,5s réponse)
📱 Messages matchs illimités
📸 10 photos de profil max
✍️ Bio 500 caractères max
🚀 Boost x3 (1 heure)
🔮 Horoscope avancé détaillé
💎 Badge Premium visible
❌ Pas de super likes
❌ Pas de coach IA
❌ Pas d'incognito
❌ Pas de visiteurs
❌ Pas de filtres avancés
```

### 👑 Plan ELITE (14,99€/mois)
```
♾️ Swipes illimités
⚡ 65 messages Astra IA Ultra par jour (0,5s réponse)
📱 Messages matchs illimités
📸 20 photos de profil max
✍️ Bio illimitée
🔥 Boost x10 (3 heures)
💕 10 super likes par jour
🤖 Coach IA Pro personnalisé
👑 Badge Elite + Top 1%
🕶️ Mode incognito premium
👀 Voir qui a visité ton profil
🌌 Thème astral complet
🔮 Filtres astro avancés (ascendant, lune, élément)
💫 Compatibilité cosmique avancée
```

## ✅ TESTS À EFFECTUER

### Test 1: Swipes (FREE)
1. Créer compte FREE
2. Swiper 10 fois → OK
3. Swiper une 11ème fois → Popup "Limite atteinte"
4. Cliquer "Voir Premium" → Redirige vers page abonnement
5. Le lendemain → Compteur reset à 0

### Test 2: Swipes (PREMIUM/ELITE)
1. Upgrade vers Premium/Elite
2. Swiper 50 fois → Toujours OK
3. Aucune limite → Pas de popup

### Test 3: Badges
1. Visiter profil FREE → Pas de badge
2. Visiter profil Premium → Badge 💎 PREMIUM
3. Visiter profil Elite → Badge 👑 ELITE

### Test 4: Boost
1. Activer boost FREE → x1, 30 min
2. Activer boost Premium → x3, 1h
3. Activer boost Elite → x10, 3h
4. Vérifier désactivation auto après expiration

## 🎯 PROCHAINES ÉTAPES

### Priorité 1 (Essentiel)
- [ ] Intégrer limites dans AstraChat (messages IA)
- [ ] Intégrer limites dans ProfileEdit (photos, bio)
- [ ] Créer ProfileBoostButton et BoostIndicator
- [ ] Créer SuperLikeButton (Elite)

### Priorité 2 (Important)
- [ ] Créer AICoachPage (Elite)
- [ ] Créer IncognitoToggle et ProfileVisitors (Elite)
- [ ] Améliorer AstroPage avec horoscope avancé
- [ ] Créer AdvancedFilters (Elite)

### Priorité 3 (Nice to have)
- [ ] Statistiques d'utilisation quotidienne
- [ ] Historique des boosts utilisés
- [ ] Notifications push pour limites atteintes
- [ ] Graphiques de compatibilité avancés

## 🚀 RÉSUMÉ

Le système de plans et limitations est maintenant **opérationnel** avec :

✅ **Infrastructure complète** (migration, fonctions, hooks, composants)
✅ **SwipePage intégré** avec vérification de limites
✅ **Badges Premium/Elite** sur les profils
✅ **UpgradePopup universel** pour tous les cas
✅ **Compilation réussie** sans erreurs

**Le système est prêt à être étendu aux autres fonctionnalités !**

Consultez `SYSTEME_PLANS_LIMITES.md` pour le guide technique complet.
