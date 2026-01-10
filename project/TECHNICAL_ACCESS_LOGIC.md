# 🔐 LOGIQUE D'ACCÈS TECHNIQUE COMPLÈTE

## 📊 TABLEAU COMPLET DES FEATURES

| Feature | Plan Requis | Limite Journalière | UI Feedback | Comportement Limite | Comportement Expiration |
|---------|-------------|-------------------|-------------|---------------------|------------------------|
| **💫 Signaux cosmiques** | Free | 10/jour | Compteur + modal | Modal upgrade Premium | Retour à 10/jour |
| **💫 Signaux cosmiques** | Premium | ∞ | Badge ∞ | - | Retour à 10/jour |
| **💫 Signaux cosmiques** | Elite | ∞ | Badge ∞ + aura | - | Retour à 10/jour |
| **🌟 Super Nova** | Premium | 1/jour | Compteur + icon | Modal upgrade Elite | Désactivé |
| **🌟 Super Nova** | Elite | 5/jour | Compteur + aura | Modal "limite atteinte" | Retour à 1/jour |
| **🤖 Messages Astra** | Free | 10/jour | Compteur rouge | Modal upgrade | Retour à 10/jour |
| **🤖 Messages Astra** | Premium | 40/jour | Compteur orange | Modal upgrade Elite | Retour à 10/jour |
| **🤖 Messages Astra** | Elite | 65/jour | Compteur vert | Modal "revenir demain" | Retour à 10/jour |
| **💬 Messages matchs** | Free | 20/jour | Compteur | Modal upgrade | Retour à 20/jour |
| **💬 Messages matchs** | Premium+ | ∞ | Badge ∞ | - | Retour à 20/jour |
| **👁️ Voir qui a envoyé signal** | Premium+ | - | Nom révélé | Nom flouté | Noms floutés |
| **⏰ Voir quand signal envoyé** | Elite | - | Timestamp | Timestamp caché | Timestamps cachés |
| **👁️ Voir visiteurs profil** | Elite | - | Liste visible | Liste verrouillée | Liste verrouillée |
| **🌌 Étoiles univers** | Free | 15 max | "Voir plus" button | Modal upgrade | Max 15 |
| **🌌 Étoiles univers** | Premium | 50 max | "Voir plus" button | Modal upgrade Elite | Max 15 |
| **🌌 Étoiles univers** | Elite | ∞ | Aucune limite | - | Max 15 |
| **🔮 Horoscope** | Free | Basique | Text court | "Version complète" lock | Retour basique |
| **🔮 Horoscope** | Premium | Avancé | Text détaillé | "Version Elite" lock | Retour basique |
| **🔮 Horoscope** | Elite | Complet | Thème astral full | - | Retour basique |
| **📷 Photos profil** | Free | 5 max | Compteur photos | Modal upgrade | Max 5, suppression auto |
| **📷 Photos profil** | Premium | 10 max | Compteur photos | Modal upgrade Elite | Max 5, suppression auto |
| **📷 Photos profil** | Elite | 20 max | Compteur photos | Modal "limite" | Max 5, suppression auto |
| **📝 Bio** | Free | 200 chars | Compteur chars | Texte coupé | Texte coupé à 200 |
| **📝 Bio** | Premium | 500 chars | Compteur chars | Texte coupé | Texte coupé à 200 |
| **📝 Bio** | Elite | ∞ | Aucune limite | - | Texte coupé à 200 |
| **💖 Super Likes** | Premium | 3/jour | Compteur | Modal "revenir demain" | Désactivé |
| **💖 Super Likes** | Elite | 10/jour | Compteur | Modal "revenir demain" | Retour à 3/jour |
| **🔄 Rembobinage** | Elite | - | Icon active | Feature grisée | Feature grisée |
| **🔭 Filtres avancés** | Elite | - | Filtres ouverts | Filtres verrouillés | Filtres verrouillés |
| **🎭 Mode incognito** | Elite | - | Toggle actif | Toggle désactivé | Toggle désactivé |
| **🚀 Boost visibilité** | Free | x1 | - | - | - |
| **🚀 Boost visibilité** | Premium | x3 | Badge boost | - | Retour x1 |
| **🚀 Boost visibilité** | Elite | x10 | Badge boost + aura | - | Retour x1 |
| **🧠 Coach IA Pro** | Elite | - | Messages enrichis | Coach basique | Coach basique |
| **✍️ ASTRA écrit messages** | Elite | - | Bouton "écrire pour moi" | Bouton caché | Bouton caché |

## 🔐 PSEUDO-CODE DE VÉRIFICATION D'ACCÈS

### Pattern général (OBLIGATOIRE pour TOUTES les features)

```typescript
// AVANT toute action
async function attemptAction(userId: string, action: ActionType) {
  // 1. Vérifier le plan actif
  const user = await getUser(userId);
  const planActive = isPlanActive(user.premium_tier, user.premium_until);
  
  // 2. Vérifier la limite journalière
  const dailyUsage = await getDailyUsage(userId, action);
  const limit = getPlanLimit(planActive ? user.premium_tier : 'free', action);
  
  // 3. Décision
  if (!planActive && requiresPremium(action)) {
    return {
      allowed: false,
      reason: 'PLAN_REQUIRED',
      requiredTier: getRequiredTier(action),
      showUpgradeModal: true
    };
  }
  
  if (limit !== null && dailyUsage >= limit) {
    return {
      allowed: false,
      reason: 'LIMIT_REACHED',
      currentUsage: dailyUsage,
      limit: limit,
      resetTime: 'minuit',
      showUpgradeModal: canUpgrade(user.premium_tier, action)
    };
  }
  
  // 4. Exécuter l'action
  await executeAction(userId, action);
  
  // 5. Incrémenter le compteur
  await incrementDailyUsage(userId, action);
  
  return {
    allowed: true,
    newUsage: dailyUsage + 1,
    remaining: limit ? limit - (dailyUsage + 1) : null
  };
}
```

### Vérification d'expiration (CRON JOB)

```typescript
// Exécuté toutes les heures
async function checkExpirations() {
  const now = new Date();
  
  // Trouver tous les abonnements expirés
  const expiredUsers = await db.profiles
    .where('premium_until', '<', now)
    .where('is_premium', '=', true);
  
  for (const user of expiredUsers) {
    // Rétrograder au plan gratuit
    await db.profiles.update(user.id, {
      is_premium: false,
      premium_tier: 'free',
      premium_until: null
    });
    
    // Appliquer les limites Free
    await applyFreeLimits(user.id);
    
    // Notification
    await sendEmail(user.email, 'Ton abonnement ASTRA a expiré');
  }
}
```

### Application des limites Free

```typescript
async function applyFreeLimits(userId: string) {
  const freeLimits = PLAN_LIMITS['free'];
  
  // 1. Limiter les photos (garder les 5 premières)
  const photos = await getProfilePhotos(userId);
  if (photos.length > freeLimits.maxPhotos) {
    const toDelete = photos.slice(freeLimits.maxPhotos);
    await deletePhotos(toDelete.map(p => p.id));
  }
  
  // 2. Tronquer la bio
  const profile = await getProfile(userId);
  if (profile.bio.length > freeLimits.maxBioLength) {
    await updateProfile(userId, {
      bio: profile.bio.substring(0, freeLimits.maxBioLength)
    });
  }
  
  // 3. Désactiver features premium
  await updateProfile(userId, {
    incognito_mode: false,
    advanced_filters_enabled: false
  });
  
  // 4. Reset compteurs journaliers aux limites Free
  await updateDailyUsage(userId, {
    cosmic_signals_limit: freeLimits.cosmicSignalsPerDay,
    astra_messages_limit: freeLimits.astraMessagesPerDay,
    match_messages_limit: freeLimits.matchMessagesPerDay
  });
}
```

### Vérification en temps réel (React Hook)

```typescript
function useFeatureCheck(featureName: string) {
  const { user } = useAuth();
  const [canAccess, setCanAccess] = useState(false);
  const [feedback, setFeedback] = useState<AccessFeedback | null>(null);
  
  useEffect(() => {
    if (!user) return;
    
    // Subscribe aux changements de plan
    const subscription = supabase
      .channel(`user_${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        checkFeatureAccess();
      })
      .subscribe();
    
    checkFeatureAccess();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user, featureName]);
  
  const checkFeatureAccess = async () => {
    const result = await attemptAction(user.id, featureName);
    setCanAccess(result.allowed);
    setFeedback(result);
  };
  
  return { canAccess, feedback, checkFeatureAccess };
}
```

## 🎨 UI FEEDBACK PAR SITUATION

### Limite atteinte (avec upgrade possible)

```tsx
<Modal>
  <Icon>⚠️</Icon>
  <Title>Limite quotidienne atteinte</Title>
  <Message>
    Tu as utilisé tes {limit} {featureName} du jour.
  </Message>
  <ResetInfo>⏰ Réinitialisation à minuit</ResetInfo>
  <UpgradeButton tier={nextTier}>
    Passer à {tierName} • {price}
  </UpgradeButton>
</Modal>
```

### Limite atteinte (sans upgrade possible)

```tsx
<Modal>
  <Icon>😴</Icon>
  <Title>C'est tout pour aujourd'hui</Title>
  <Message>
    Tu as utilisé tes {limit} {featureName}.
    Reviens demain pour continuer !
  </Message>
  <Countdown>Réinitialisation dans {timeUntilMidnight}</Countdown>
</Modal>
```

### Feature verrouillée

```tsx
<LockedFeature>
  <Icon>🔒</Icon>
  <Title>{featureName}</Title>
  <Message>Réservé aux abonnés {tierName}</Message>
  <FeaturesList>
    {features.map(f => <li>{f}</li>)}
  </FeaturesList>
  <UpgradeButton>Débloquer • {price}</UpgradeButton>
</LockedFeature>
```

### Expiration imminente

```tsx
<Banner>
  <Icon>⏰</Icon>
  Ton abonnement expire dans {daysLeft} jours.
  <RenewButton>Renouveler</RenewButton>
</Banner>
```

### Post-expiration

```tsx
<Modal>
  <Icon>😢</Icon>
  <Title>Ton abonnement a expiré</Title>
  <Message>
    Tu es revenu(e) au plan Gratuit.
    Certaines features sont maintenant limitées.
  </Message>
  <LostFeatures>
    <h3>Ce qui a changé :</h3>
    <ul>
      <li>Signaux : ∞ → 10/jour</li>
      <li>Messages Astra : 40 → 10/jour</li>
      <li>Photos : 10 → 5 (5 supprimées)</li>
    </ul>
  </LostFeatures>
  <ReactivateButton>Réactiver Premium</ReactivateButton>
</Modal>
```

## 🔄 FLUX DE VÉRIFICATION COMPLET

```
┌─────────────────┐
│  User Action    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check Plan      │
│ Active?         │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  OUI       NON
    │         │
    │         └──> Feature requires Premium?
    │                      │
    │                 ┌────┴────┐
    │                 │         │
    │                YES       NO
    │                 │         │
    │                 ▼         ▼
    │           [BLOCKED]   [CONTINUE]
    │           Show Modal
    │
    ▼
┌─────────────────┐
│ Check Daily     │
│ Limit           │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
UNDER      OVER
LIMIT      LIMIT
    │         │
    │         └──> Can Upgrade?
    │                   │
    │              ┌────┴────┐
    │              │         │
    │             YES       NO
    │              │         │
    │              ▼         ▼
    │         [BLOCKED]  [BLOCKED]
    │         Show Modal  "Tomorrow"
    │         with Upgrade
    │
    ▼
┌─────────────────┐
│ Execute Action  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Increment       │
│ Counter         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update UI       │
│ (new count)     │
└─────────────────┘
```

## ⚠️ RÈGLES ABSOLUES

### ✅ TOUJOURS :
- Vérifier le plan AVANT l'action
- Vérifier la limite AVANT l'action
- Incrémenter le compteur APRÈS succès
- Feedback visuel immédiat
- Logs côté serveur pour tracking

### ❌ JAMAIS :
- Faire confiance au client seul
- Permettre une action sans vérification
- Oublier d'incrémenter le compteur
- Laisser une feature accessible "par accident"
- Feature verrouillée = bug critique

## 🧪 TESTS REQUIS

### Test Plan Gratuit
```typescript
describe('Free Plan Limits', () => {
  test('Blocks cosmic signal after 10', async () => {
    // Envoyer 10 signaux
    for (let i = 0; i < 10; i++) {
      await sendSignal(userId);
    }
    
    // Le 11ème doit être bloqué
    const result = await sendSignal(userId);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('LIMIT_REACHED');
  });
});
```

### Test Expiration
```typescript
describe('Plan Expiration', () => {
  test('Reverts to free limits on expiration', async () => {
    // Créer user Premium
    await createUser({ tier: 'premium', until: tomorrow });
    
    // Simuler expiration
    await simulateExpiration();
    
    // Vérifier limites Free appliquées
    const limits = await getUserLimits(userId);
    expect(limits.cosmic_signals).toBe(10);
  });
});
```

---

**Chaque feature = Vérification obligatoire. Aucune exception.**
