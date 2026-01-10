# 🎯 GUIDE D'INTÉGRATION DU SYSTÈME D'ABONNEMENTS ASTRA

## 📦 Fichiers créés

### Configuration
- `/src/config/subscriptionLimits.ts` - Configuration centralisée des limites
- `/src/hooks/useFeatureAccess.ts` - Hook pour vérifier l'accès aux features
- `/src/components/FeatureLocked.tsx` - Modal de feature verrouillée
- `/src/components/TierBadge.tsx` - Badges et effets visuels par tier
- `/supabase/migrations/20260110_create_daily_usage_system.sql` - Migration DB

## 🚀 ÉTAPES D'INTÉGRATION

### 1. Exécuter la migration SQL
```sql
-- Dans Supabase SQL Editor, copier/coller et exécuter:
-- supabase/migrations/20260110_create_daily_usage_system.sql
```

### 2. Exemples d'utilisation

#### 📤 Envoyer un signal cosmique (avec limite)

```tsx
import { useState } from 'react';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import FeatureLocked from '../components/FeatureLocked';

function SignalButton() {
  const { checkCosmicSignal, incrementUsage } = useFeatureAccess();
  const [showLocked, setShowLocked] = useState(false);

  const handleSendSignal = async (userId: string) => {
    const access = checkCosmicSignal();
    
    if (!access.canAccess) {
      setShowLocked(true);
      return;
    }

    // Envoyer le signal...
    await sendSignalToUser(userId);
    
    // Incrémenter le compteur
    await incrementUsage('cosmicSignals');
  };

  return (
    <>
      <button onClick={handleSendSignal}>
        💫 Envoyer signal
      </button>
      
      {showLocked && (
        <FeatureLocked
          featureName="Signaux Cosmiques"
          requiredTier="premium"
          currentUsage={checkCosmicSignal().currentUsage}
          limit={checkCosmicSignal().limit}
          onClose={() => setShowLocked(false)}
        />
      )}
    </>
  );
}
```

#### 🌟 Super Nova (Premium only)

```tsx
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import FeatureLocked from '../components/FeatureLocked';

function SuperNovaButton() {
  const { checkSuperNova, incrementUsage } = useFeatureAccess();
  const [showLocked, setShowLocked] = useState(false);

  const handleSuperNova = async () => {
    const access = checkSuperNova();
    
    if (!access.canAccess) {
      setShowLocked(true);
      return;
    }

    // Activer Super Nova...
    await activateSuperNova();
    await incrementUsage('superNova');
  };

  const access = checkSuperNova();

  return (
    <>
      <button 
        onClick={handleSuperNova}
        disabled={!access.canAccess}
      >
        🌟 Super Nova {access.limit && `(${access.currentUsage}/${access.limit})`}
      </button>
      
      {showLocked && (
        <FeatureLocked
          featureName="Super Nova"
          requiredTier="premium"
          currentUsage={access.currentUsage}
          limit={access.limit}
          onClose={() => setShowLocked(false)}
        />
      )}
    </>
  );
}
```

#### 🤖 Messages Astra IA

```tsx
function AstraChatInput() {
  const { checkAstraMessage, incrementUsage, limits } = useFeatureAccess();

  const handleSendMessage = async (message: string) => {
    const access = checkAstraMessage();
    
    if (!access.canAccess) {
      // Afficher modal upgrade
      return;
    }

    // Envoyer le message...
    await sendToAstra(message);
    await incrementUsage('astraMessages');
  };

  // Afficher le compteur en temps réel
  const access = checkAstraMessage();
  
  return (
    <div>
      <textarea onChange={(e) => setMessage(e.target.value)} />
      <button onClick={handleSendMessage}>Envoyer</button>
      <p>
        Messages restants: {access.limit ? `${access.limit - (access.currentUsage || 0)}` : '∞'}
      </p>
    </div>
  );
}
```

#### 👁️ Voir qui a envoyé un signal (Premium+)

```tsx
function SignalsList() {
  const { checkFeature } = useFeatureAccess();
  const canSeeWho = checkFeature('seeWhoSentSignal');

  return (
    <div>
      {signals.map(signal => (
        <div key={signal.id}>
          {canSeeWho.canAccess ? (
            <p>Signal de {signal.userName}</p>
          ) : (
            <div>
              <p>Signal reçu</p>
              <FeatureLocked
                featureName="Voir qui envoie les signaux"
                requiredTier="premium"
                inline
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

#### 👑 Badge et effets visuels

```tsx
import TierBadge, { GoldenAura, StarEffect } from '../components/TierBadge';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

function ProfileCard() {
  const { tier, limits } = useFeatureAccess();

  return (
    <div>
      {/* Badge du plan */}
      <TierBadge tier={tier} size="medium" />

      {/* Aura dorée pour Elite */}
      {limits.hasGoldenAura && (
        <GoldenAura>
          <img src={avatar} />
        </GoldenAura>
      )}

      {/* Étoile avec brillance selon tier */}
      <StarEffect tier={tier} size={32} />
    </div>
  );
}
```

### 3. Intégrations par page

#### 🌌 UniversPage

```tsx
function UniversPage() {
  const { limits } = useFeatureAccess();

  // Limiter le nombre d'étoiles visibles
  const visibleProfiles = allProfiles.slice(
    0, 
    limits.maxVisibleStars || allProfiles.length
  );

  // Flouter les profils pour free
  const profileStyle = limits.profilesBlurred
    ? { filter: 'blur(8px)' }
    : {};

  return (
    <div>
      {visibleProfiles.map(profile => (
        <div style={profileStyle}>
          {/* Profil... */}
        </div>
      ))}
      
      {limits.maxVisibleStars && allProfiles.length > limits.maxVisibleStars && (
        <FeatureLocked
          featureName="Voir plus de profils"
          requiredTier="premium"
          inline
        />
      )}
    </div>
  );
}
```

#### 💬 ChatPage

```tsx
function ChatInput() {
  const { checkMatchMessage, incrementUsage } = useFeatureAccess();

  const handleSendMessage = async () => {
    const access = checkMatchMessage();
    
    if (!access.canAccess) {
      // Modal upgrade
      return;
    }

    await sendMessage();
    await incrementUsage('matchMessages');
  };

  return (
    <div>
      <input />
      <button onClick={handleSendMessage}>Envoyer</button>
    </div>
  );
}
```

#### 🔮 HoroscopePage

```tsx
function HoroscopePage() {
  const { limits } = useFeatureAccess();

  return (
    <div>
      {limits.horoscopeLevel === 'basic' && (
        <div>
          <p>Horoscope court du jour...</p>
          <FeatureLocked
            featureName="Horoscope Avancé"
            requiredTier="premium"
            inline
          />
        </div>
      )}
      
      {limits.horoscopeLevel === 'advanced' && (
        <div>Horoscope détaillé...</div>
      )}
      
      {limits.horoscopeLevel === 'complete' && (
        <div>Thème astral complet...</div>
      )}
    </div>
  );
}
```

#### 📷 ProfileEdit - Limite de photos

```tsx
function PhotoUpload() {
  const { limits } = useFeatureAccess();
  const [photos, setPhotos] = useState([]);

  const canAddPhoto = photos.length < limits.maxPhotos;

  return (
    <div>
      {photos.map(photo => <img src={photo} />)}
      
      {canAddPhoto ? (
        <button onClick={handleUpload}>Ajouter photo</button>
      ) : (
        <FeatureLocked
          featureName={`Maximum ${limits.maxPhotos} photos`}
          requiredTier="premium"
          inline
        />
      )}
    </div>
  );
}
```

#### 📝 Bio - Limite de caractères

```tsx
function BioEditor() {
  const { limits } = useFeatureAccess();
  const [bio, setBio] = useState('');

  const remaining = limits.maxBioLength - bio.length;

  return (
    <div>
      <textarea
        maxLength={limits.maxBioLength}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      <p>
        {remaining} caractères restants
        {remaining <= 0 && (
          <FeatureLocked
            featureName="Bio illimitée"
            requiredTier="premium_elite"
            inline
          />
        )}
      </p>
    </div>
  );
}
```

### 4. Affichage du plan actuel

```tsx
import TierBadge from '../components/TierBadge';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

function ProfileHeader() {
  const { tier, tierName } = useFeatureAccess();

  return (
    <div>
      <h1>Mon Profil</h1>
      <TierBadge tier={tier} size="large" animated />
      <p>Abonnement: {tierName}</p>
    </div>
  );
}
```

## 📊 Résumé des compteurs

| Métrique | Free | Premium | Elite |
|----------|------|---------|-------|
| Signaux cosmiques | 10/jour | ∞ | ∞ |
| Super Nova | 0 | 1/jour | 5/jour |
| Messages Astra | 10/jour | 40/jour | 65/jour |
| Messages matchs | 20/jour | ∞ | ∞ |
| Super Likes | 0 | 3/jour | 10/jour |

## 🎨 Effets visuels

- **Free**: Étoile normale, pas de badge
- **Premium**: Étoile 2x plus brillante, badge rouge
- **Elite**: Aura dorée, étoile 3x plus brillante, badge doré, effet étoile filante

## ✅ Checklist d'intégration

- [ ] Exécuter migration SQL
- [ ] Intégrer `useFeatureAccess` dans les pages
- [ ] Ajouter `FeatureLocked` pour features verrouillées
- [ ] Afficher `TierBadge` sur profils
- [ ] Ajouter compteurs en temps réel
- [ ] Implémenter effets visuels par tier
- [ ] Tester limits en créant comptes test
- [ ] Vérifier reset quotidien (minuit)

## 🔧 Debugging

```tsx
// Afficher les limites actuelles en dev
function DebugLimits() {
  const { tier, limits, dailyUsage } = useFeatureAccess();

  return (
    <pre>
      {JSON.stringify({ tier, limits, dailyUsage }, null, 2)}
    </pre>
  );
}
```

## 🚨 IMPORTANT

- **Toujours vérifier** l'accès AVANT d'exécuter une action
- **Toujours incrémenter** le compteur APRÈS une action réussie
- **Ne jamais** faire confiance au client - toute logique critique doit être serveur-side
- **Tester** avec des comptes de chaque tier
