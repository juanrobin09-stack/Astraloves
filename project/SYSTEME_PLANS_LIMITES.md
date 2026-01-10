# 🎯 SYSTÈME DE PLANS ET LIMITATIONS - GUIDE COMPLET

## ✅ Infrastructure créée

### 1. Migration Supabase
**Fichier**: `supabase/migrations/[timestamp]_create_plan_limits_system.sql`

**Tables et colonnes ajoutées:**

#### Profiles (nouvelles colonnes)
```sql
- swipes_today (integer) - Compteur de swipes quotidiens
- messages_astra_today (integer) - Compteur messages Astra IA quotidiens
- messages_matchs_today (integer) - Compteur messages matchs quotidiens
- super_likes_today (integer) - Compteur super likes quotidiens
- last_reset_date (date) - Date du dernier reset des compteurs
- boost_active (boolean) - Boost de visibilité actif
- boost_expiry (timestamptz) - Date d'expiration du boost
- incognito_mode (boolean) - Mode incognito actif (Elite)
```

#### Table profile_visitors (nouvelle)
```sql
- id (uuid) - ID unique
- profile_id (uuid) - Profil visité
- visitor_id (uuid) - Visiteur
- visited_at (timestamptz) - Date de visite
- created_at (timestamptz) - Date de création
```

**Fonctions Postgres créées:**
- `increment_user_swipes(user_id)` - Incrémenter avec vérification limite
- `increment_user_match_messages(user_id)` - Incrémenter messages matchs
- `activate_user_boost(user_id)` - Activer boost de visibilité
- `check_expired_boosts()` - Trigger pour désactiver boosts expirés

### 2. Hooks React

#### useUserLimits
**Fichier**: `src/hooks/useUserLimits.ts`

```typescript
import { useUserLimits } from '../hooks/useUserLimits';

const limits = useUserLimits(user.premium_tier);

console.log(limits.swipesPerDay); // 10 (free) | Infinity (premium/elite)
console.log(limits.hasAICoach); // false (free/premium) | true (elite)
```

**Limites par plan:**

**🆓 FREE:**
- swipesPerDay: 10
- messagesAstraPerDay: 10
- messagesMatchsPerDay: 20
- superLikesPerDay: 0
- maxPhotos: 5
- maxBioLength: 200
- boostMultiplier: 1
- hasAdvancedAstro: false
- hasAICoach: false
- hasIncognito: false
- canSeeVisitors: false
- hasEliteBadge: false
- hasPremiumBadge: false
- hasAdvancedFilters: false

**💎 PREMIUM:**
- swipesPerDay: Infinity
- messagesAstraPerDay: 40
- messagesMatchsPerDay: Infinity
- superLikesPerDay: 0
- maxPhotos: 10
- maxBioLength: 500
- boostMultiplier: 3
- hasAdvancedAstro: true
- hasAICoach: false
- hasIncognito: false
- canSeeVisitors: false
- hasEliteBadge: false
- hasPremiumBadge: true
- hasAdvancedFilters: false

**👑 ELITE:**
- swipesPerDay: Infinity
- messagesAstraPerDay: 65
- messagesMatchsPerDay: Infinity
- superLikesPerDay: 10
- maxPhotos: 20
- maxBioLength: Infinity
- boostMultiplier: 10
- hasAdvancedAstro: true
- hasAICoach: true
- hasIncognito: true
- canSeeVisitors: true
- hasEliteBadge: true
- hasPremiumBadge: false
- hasAdvancedFilters: true

#### useDailyLimits
**Fichier**: `src/hooks/useDailyLimits.ts`

```typescript
import { useDailyLimits } from '../hooks/useDailyLimits';

const { counts, loading, incrementSwipes, incrementMatchMessages } = useDailyLimits(userId);

// Vérifier les compteurs
console.log(counts.swipes_today); // 5
console.log(counts.messages_astra_today); // 3

// Incrémenter avec vérification
const result = await incrementSwipes();
if (!result.success) {
  // Afficher popup upgrade
  showUpgradePopup({...});
}
```

### 3. Composants React

#### UpgradePopup
**Fichier**: `src/components/UpgradePopup.tsx`

```typescript
import UpgradePopup from './UpgradePopup';

const [showUpgrade, setShowUpgrade] = useState(false);

<UpgradePopup
  isOpen={showUpgrade}
  onClose={() => setShowUpgrade(false)}
  title="Limite de swipes atteinte"
  message="Vous avez utilisé vos 10 swipes quotidiens"
  feature="Swipes illimités"
  plans={['premium', 'premium_elite']}
/>
```

#### PlanBadge
**Fichier**: `src/components/PlanBadge.tsx`

```typescript
import PlanBadge from './PlanBadge';

<PlanBadge plan="premium_elite" size="md" />
// Affiche: 👑 ELITE (avec gradient jaune-orange)

<PlanBadge plan="premium" size="sm" />
// Affiche: 💎 PREMIUM (avec gradient rose-violet)

<PlanBadge plan="free" />
// N'affiche rien
```

## 📋 GUIDE D'INTÉGRATION

### Étape 1: SwipePage - Limiter les swipes

```typescript
import { useUserLimits } from '../hooks/useUserLimits';
import { useDailyLimits } from '../hooks/useDailyLimits';
import UpgradePopup from './UpgradePopup';
import { useAuth } from '../contexts/AuthContext';

function SwipePage() {
  const { user } = useAuth();
  const limits = useUserLimits(user?.premium_tier);
  const { counts, incrementSwipes } = useDailyLimits(user?.id);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeConfig, setUpgradeConfig] = useState({});

  async function handleSwipe(direction: string, profile: any) {
    // Vérifier limite avant le swipe
    const result = await incrementSwipes();

    if (!result.success) {
      setUpgradeConfig({
        title: "Limite de swipes atteinte",
        message: `Vous avez utilisé vos ${result.max} swipes quotidiens`,
        feature: "Swipes illimités",
        plans: ['premium', 'premium_elite']
      });
      setShowUpgrade(true);
      return;
    }

    // Traiter le swipe
    if (direction === 'right') {
      handleLike(profile);
    }

    // Avertir l'utilisateur si proche de la limite
    if (user?.premium_tier === 'free' && result.current >= result.max - 3) {
      showToast(`Plus que ${result.max - result.current} swipes aujourd'hui`);
    }
  }

  return (
    <div>
      {/* Afficher compteur pour free */}
      {user?.premium_tier === 'free' && (
        <div className="mb-4 text-center text-sm text-gray-400">
          {counts.swipes_today}/{limits.swipesPerDay} swipes aujourd'hui
        </div>
      )}

      {/* Cartes de profils */}
      {/* ... */}

      <UpgradePopup
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        {...upgradeConfig}
      />
    </div>
  );
}
```

### Étape 2: AstraChat - Limiter les messages

```typescript
import { useUserLimits } from '../hooks/useUserLimits';
import UpgradePopup from './UpgradePopup';

function AstraChat() {
  const { user } = useAuth();
  const limits = useUserLimits(user?.premium_tier);
  const [messagesAstraToday, setMessagesAstraToday] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);

  async function sendMessage(text: string) {
    // Vérifier limite
    if (messagesAstraToday >= limits.messagesAstraPerDay) {
      const message = user?.premium_tier === 'free'
        ? "10 messages quotidiens utilisés. Passez à Premium pour 40 messages/jour!"
        : "40 messages utilisés. Passez à Elite pour 65 messages ultra-rapides/jour!";

      setUpgradeConfig({
        title: "Limite de messages Astra atteinte",
        message,
        feature: user?.premium_tier === 'free' ? "40 messages/jour" : "65 messages ultra/jour",
        plans: user?.premium_tier === 'free' ? ['premium', 'premium_elite'] : ['premium_elite']
      });
      setShowUpgrade(true);
      return;
    }

    // Envoyer le message
    setMessagesAstraToday(prev => prev + 1);

    // Incrémenter dans la DB
    await supabase
      .from('profiles')
      .update({ messages_astra_today: messagesAstraToday + 1 })
      .eq('id', user.id);

    // Générer réponse avec vitesse selon le plan
    const responseTime = {
      free: 3000,
      premium: 1500,
      premium_elite: 500
    };

    setTimeout(() => {
      addAstraMessage(generateResponse(text));
    }, responseTime[user?.premium_tier || 'free']);
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2>Chat avec Astra</h2>
        {user?.premium_tier === 'premium_elite' && (
          <span className="px-2 py-1 bg-purple-500 rounded text-xs">⚡ Ultra-Rapide</span>
        )}
      </div>

      <p className="text-sm text-gray-400">
        {messagesAstraToday}/{limits.messagesAstraPerDay} messages aujourd'hui
      </p>

      {/* Messages */}
      {/* ... */}

      <UpgradePopup {...upgradeConfig} />
    </div>
  );
}
```

### Étape 3: ProfileEdit - Limiter photos et bio

```typescript
import { useUserLimits } from '../hooks/useUserLimits';
import UpgradePopup from './UpgradePopup';

function ProfileEdit() {
  const { user } = useAuth();
  const limits = useUserLimits(user?.premium_tier);
  const [photos, setPhotos] = useState([]);
  const [bio, setBio] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);

  function handleAddPhoto(file: File) {
    if (photos.length >= limits.maxPhotos) {
      setUpgradeConfig({
        title: "Limite de photos atteinte",
        message: `Vous pouvez ajouter jusqu'à ${limits.maxPhotos} photos avec votre plan ${user?.premium_tier}`,
        feature: user?.premium_tier === 'free' ? "10 photos avec Premium" : "20 photos avec Elite",
        plans: user?.premium_tier === 'free' ? ['premium', 'premium_elite'] : ['premium_elite']
      });
      setShowUpgrade(true);
      return;
    }

    setPhotos([...photos, file]);
  }

  function handleBioChange(text: string) {
    if (text.length > limits.maxBioLength && limits.maxBioLength !== Infinity) {
      showToast(`Bio limitée à ${limits.maxBioLength} caractères`);
      return;
    }

    setBio(text);
  }

  return (
    <div>
      {/* Photos */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3>Photos ({photos.length}/{limits.maxPhotos === Infinity ? '∞' : limits.maxPhotos})</h3>
          {photos.length >= limits.maxPhotos && limits.maxPhotos !== Infinity && (
            <button onClick={() => navigate('/abonnement')} className="text-pink-500 text-sm">
              Ajouter plus de photos →
            </button>
          )}
        </div>
        {/* Grille de photos */}
      </div>

      {/* Bio */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3>Bio</h3>
          <span className="text-sm text-gray-400">
            {bio.length}/{limits.maxBioLength === Infinity ? '∞' : limits.maxBioLength}
          </span>
        </div>
        <textarea
          value={bio}
          onChange={(e) => handleBioChange(e.target.value)}
          maxLength={limits.maxBioLength === Infinity ? undefined : limits.maxBioLength}
          className="w-full p-3 bg-gray-800 rounded-lg"
        />
      </div>

      <UpgradePopup {...upgradeConfig} />
    </div>
  );
}
```

### Étape 4: Afficher les badges

```typescript
import PlanBadge from './PlanBadge';

function ProfileCard({ profile }) {
  return (
    <div className="profile-card">
      <img src={profile.photos[0]} />

      <div className="profile-info">
        <div className="flex items-center gap-2">
          <h2>{profile.name}, {profile.age}</h2>
          <PlanBadge plan={profile.premium_tier} size="md" />
        </div>

        {profile.premium_tier === 'premium_elite' && (
          <div className="mt-2 inline-block px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded-full text-xs">
            ⭐ Top 1% des profils
          </div>
        )}
      </div>
    </div>
  );
}
```

### Étape 5: Boost de visibilité

```typescript
async function activateBoost() {
  const { data, error } = await supabase.rpc('activate_user_boost', {
    user_id: user.id
  });

  if (error) {
    console.error('Error activating boost:', error);
    return;
  }

  showNotification({
    title: `🚀 Boost x${data.multiplier} activé!`,
    message: `Votre profil est maintenant ${data.multiplier}x plus visible`,
    duration: 5000
  });

  // Rafraîchir le profil pour obtenir boost_active et boost_expiry
  refreshProfile();
}

// Afficher indicateur de boost actif
function BoostIndicator({ boostActive, boostExpiry, plan }) {
  if (!boostActive) return null;

  const limits = useUserLimits(plan);
  const timeRemaining = new Date(boostExpiry) - new Date();
  const minutesRemaining = Math.floor(timeRemaining / 60000);

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

## 🔒 FONCTIONNALITÉS ELITE

### Mode Incognito

```typescript
async function toggleIncognito() {
  const limits = useUserLimits(user?.premium_tier);

  if (!limits.hasIncognito) {
    setUpgradeConfig({
      title: "Mode Incognito",
      message: "Naviguez anonymement et contrôlez qui voit votre profil",
      feature: "Mode incognito premium",
      plans: ['premium_elite']
    });
    setShowUpgrade(true);
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({ incognito_mode: !user.incognito_mode })
    .eq('id', user.id);

  if (!error) {
    showToast(user.incognito_mode ? 'Mode incognito désactivé' : 'Mode incognito activé');
  }
}
```

### Visiteurs de profil

```typescript
function ProfileVisitors() {
  const limits = useUserLimits(user?.premium_tier);
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    if (limits.canSeeVisitors) {
      loadVisitors();
    }
  }, [limits.canSeeVisitors]);

  async function loadVisitors() {
    const { data } = await supabase
      .from('profile_visitors')
      .select(`
        visitor_id,
        visited_at,
        visitor:profiles!visitor_id(name, age, photos)
      `)
      .eq('profile_id', user.id)
      .order('visited_at', { ascending: false })
      .limit(20);

    setVisitors(data || []);
  }

  if (!limits.canSeeVisitors) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <div className="text-4xl mb-2">👀</div>
        <h3 className="font-bold mb-2">Qui a visité ton profil</h3>
        <p className="text-gray-400 text-sm mb-4">
          Découvre qui s'intéresse à toi
        </p>
        <button
          onClick={() => navigate('/abonnement')}
          className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
        >
          Débloquer avec Elite
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="font-bold mb-4">👀 Visiteurs ({visitors.length})</h3>
      {visitors.map(v => (
        <div key={v.visitor_id} className="flex items-center gap-3 mb-3">
          <img src={v.visitor.photos[0]} className="w-12 h-12 rounded-full" />
          <div>
            <div className="font-bold">{v.visitor.name}, {v.visitor.age}</div>
            <div className="text-xs text-gray-400">
              {getTimeAgo(v.visited_at)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Enregistrer une visite de profil
async function recordProfileVisit(profileId: string) {
  if (user && profileId !== user.id) {
    await supabase.from('profile_visitors').insert({
      profile_id: profileId,
      visitor_id: user.id
    });
  }
}
```

## ✅ CHECKLIST D'INTÉGRATION

### Pages à modifier:
- [ ] SwipePage - Vérifier limite de swipes
- [ ] AstraChat - Vérifier limite de messages Astra
- [ ] ChatWindow - Vérifier limite de messages matchs
- [ ] ProfileEdit - Vérifier limite photos et bio
- [ ] AstroPage - Bloquer horoscope avancé (free)
- [ ] ProfilePage - Afficher badges Premium/Elite
- [ ] SettingsPage - Ajouter toggle mode incognito (Elite)
- [ ] SearchPage - Bloquer filtres avancés (free/premium)

### Nouveaux composants à créer:
- [ ] AICoachPage - Coach IA personnalisé (Elite)
- [ ] BoostButton - Activer boost de visibilité
- [ ] SuperLikeButton - Super likes (Elite uniquement)
- [ ] AdvancedFilters - Filtres astro (ascendant, lune, élément)

## 🎯 RÉSUMÉ

Le système de plans et limitations est maintenant en place avec:

✅ **Migration Supabase** avec colonnes et fonctions
✅ **Hooks React** (useUserLimits, useDailyLimits)
✅ **Composants** (UpgradePopup, PlanBadge)
✅ **Fonctions de vérification** automatiques
✅ **Reset quotidien** des compteurs
✅ **Système de boost** avec expiration automatique
✅ **Visiteurs de profil** (Elite)
✅ **Mode incognito** (Elite)

**Prochaines étapes:**
1. Intégrer les vérifications dans chaque page
2. Créer les composants manquants (AICoach, Boost, SuperLike)
3. Améliorer AstroPage avec contenu premium
4. Créer les filtres avancés
5. Tester toutes les limitations

**Le système est prêt à être intégré page par page selon les besoins!** 🚀
