# COMPTEURS HEADER - CORRECTION FINALE

## MODIFICATIONS APPORTÉES

Les compteurs du header affichent maintenant les **VRAIES valeurs** du système d'abonnement selon le tier de l'utilisateur.

---

## AFFICHAGE HEADER PAR TIER

### GRATUIT (Étoile Naissante)
```
[Gratuit ✨]  [🔥 10/10]  [⭐ 15]
```

- **Badge** : "Gratuit ✨"
- **Signaux** : 10/10 (avec compteur décroissant)
- **Super Nova** : ❌ Pas affiché (0 disponible)
- **Vision** : 15 étoiles max

Exemple avec utilisation :
```
[Gratuit ✨]  [🔥 3/10]  [⭐ 15]
```
(3 signaux restants sur 10)

---

### PREMIUM (Étoile Brillante) - 9.99€/mois
```
[Premium 💎]  [🔥 ∞]  [🌟 1/1]  [⭐ 50]
```

- **Badge** : "Premium 💎"
- **Signaux** : ∞ (illimités)
- **Super Nova** : 1/1 (1 par jour)
- **Vision** : 50 étoiles max

Exemple avec utilisation :
```
[Premium 💎]  [🔥 ∞]  [🌟 0/1]  [⭐ 50]
```
(Super Nova déjà utilisée)

---

### PREMIUM+ ELITE (Supernova) - 14.99€/mois
```
[Elite 👑]  [🔥 ∞]  [🌟 5/5]  [⭐ ∞]
```

- **Badge** : "Elite 👑"
- **Signaux** : ∞ (illimités)
- **Super Nova** : 5/5 (5 par jour)
- **Vision** : ∞ (illimitée)

Exemple avec utilisation :
```
[Elite 👑]  [🔥 ∞]  [🌟 2/5]  [⭐ ∞]
```
(2 Super Nova restantes sur 5)

---

## TABLEAU DES LIMITES OFFICIELLES

| Tier | Signaux/jour | Super Nova/jour | Vision étoiles |
|------|--------------|-----------------|----------------|
| Gratuit | 10 | 0 | 15 |
| Premium | ∞ | 1 | 50 |
| Elite | ∞ | 5 | ∞ |

---

## CODE - STRUCTURE LIMITS

```typescript
const [limits, setLimits] = useState({
  signals: 10,                    // Gratuit: 10, Premium+: Infinity
  signalsUsed: 0,
  superNovas: 0,                  // Gratuit: 0, Premium: 1, Elite: 5
  superNovasUsed: 0,
  astraMessages: 10,              // Gratuit: 10, Premium: 40, Elite: 65
  astraMessagesUsed: 0,
  maxStarsVisible: 15,            // Gratuit: 15, Premium: 50, Elite: Infinity
});
```

### Définition par tier
```typescript
const tierLimits = {
  gratuit: {
    signals: 10,
    superNovas: 0,
    astraMessages: 10,
    maxStarsVisible: 15
  },
  premium: {
    signals: Infinity,
    superNovas: 1,
    astraMessages: 40,
    maxStarsVisible: 50
  },
  premium_plus: {
    signals: Infinity,
    superNovas: 5,
    astraMessages: 65,
    maxStarsVisible: Infinity
  },
};
```

---

## AFFICHAGE COMPTEURS

### Badge tier
```tsx
{tier === 'premium_plus' ? (
  <>Elite <span className="text-yellow-500">👑</span></>
) : tier === 'premium' ? (
  <>Premium <span className="text-red-500">💎</span></>
) : (
  <>Gratuit <Sparkles className="w-3 h-3 text-red-500" /></>
)}
```

### Compteur signaux
```tsx
<Flame className="w-4 h-4 text-red-500" />
{limits.signals === Infinity ? (
  <span className="text-white font-semibold text-sm">∞</span>
) : (
  <>
    <span className="text-white font-semibold">{limits.signals - limits.signalsUsed}</span>
    <span className="text-gray-500 text-xs">/{limits.signals}</span>
  </>
)}
```

### Compteur Super Nova (conditionnel)
```tsx
{limits.superNovas > 0 && (
  <motion.div>
    <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
    <span>{limits.superNovas - limits.superNovasUsed}</span>
    <span className="text-gray-500">/{limits.superNovas}</span>
  </motion.div>
)}
```
**Important** : N'affiche PAS le compteur si `superNovas === 0` (Gratuit)

### Compteur vision étoiles
```tsx
<span className="text-lg">⭐</span>
{limits.maxStarsVisible === Infinity ? (
  <span className="text-white font-semibold">∞</span>
) : (
  <span className="text-white font-semibold">{limits.maxStarsVisible}</span>
)}
```

---

## LOGIQUE RESTRICTIONS

### Vérification limite signaux
```typescript
const handleSendSignal = (userId: string, type: 'signal' | 'super_nova') => {
  // Pour signaux normaux
  if (type === 'signal' && limits.signals !== Infinity && limits.signalsUsed >= limits.signals) {
    setShowLimitPopup({ show: true, type: 'signals' });
    return;
  }

  // Pour Super Nova
  if (type === 'super_nova') {
    if (tier === 'gratuit') {
      setShowLimitPopup({ show: true, type: 'super_nova' });
      return;
    }
    if (limits.superNovasUsed >= limits.superNovas) {
      setShowLimitPopup({ show: true, type: 'super_nova' });
      return;
    }
  }

  // Envoyer le signal
  await sendCosmicSignal(userId, type);
};
```

### Vérification limite visibilité
```typescript
const handlePlanetClick = (planet: UniverseUser, idx: number) => {
  if (limits.maxStarsVisible !== Infinity && idx >= limits.maxStarsVisible) {
    setShowLimitPopup({ show: true, type: 'visibility' });
    return;
  }
  setSelectedPlanet(planet);
};
```

### Floutage étoiles
```typescript
const isBlurred = limits.maxStarsVisible !== Infinity && idx >= limits.maxStarsVisible;
```

---

## COMPORTEMENT BOUTON SEND SIGNAL

### canSendSignal
```typescript
const canSendSignal = limits.signals === Infinity || limits.signalsUsed < limits.signals;
```

**Retourne true si :**
- Signaux illimités (Premium/Elite), OU
- Il reste des signaux (Gratuit)

**Utilisé dans ProfileBottomSheet :**
```tsx
<button
  onClick={() => onSendSignal(userId, 'signal')}
  disabled={!canSendSignal}
>
  Signal
</button>
```

---

## POPUP LIMITES ATTEINTES

### Types de popup

#### 1. Limite signaux (Gratuit 10/10)
```
💫
Plus de signaux aujourd'hui
Tu as utilisé 10/10

Recharge dans : 6h 23min

[✨ Passer illimité]
[Revenir demain]
```

#### 2. Super Nova bloqué (Gratuit)
```
✨
Fonctionnalité Premium
Les Super Nova sont réservés aux
membres Premium et Elite

[Découvrir Premium]
[Plus tard]
```

#### 3. Limite visibilité (Gratuit 15 étoiles)
```
🔒
Limite de visibilité atteinte
Tu as atteint la limite de 15 étoiles.
Passe Premium pour voir jusqu'à 50 étoiles

[Découvrir Premium]
[Plus tard]
```

---

## MISE À JOUR COMPTEURS

### Après envoi signal
```typescript
const result = await sendCosmicSignal(userId, type);

if (result.success) {
  setSelectedPlanet(null);
  await loadData(); // ← Recharge les compteurs
}
```

### Fonction loadData
```typescript
const loadData = async () => {
  // Récupère profil
  const { data: profile } = await supabase
    .from('astra_profiles')
    .select('daily_swipes, daily_super_likes, daily_astra_messages, premium_tier')
    .eq('id', user.id)
    .maybeSingle();

  // Définit limites selon tier
  const tierLimit = tierLimits[profile.premium_tier || 'gratuit'];

  // Met à jour state
  setLimits({
    signals: tierLimit.signals,
    signalsUsed: profile.daily_swipes || 0,
    superNovas: tierLimit.superNovas,
    superNovasUsed: profile.daily_super_likes || 0,
    astraMessages: tierLimit.astraMessages,
    astraMessagesUsed: profile.daily_astra_messages || 0,
    maxStarsVisible: tierLimit.maxStarsVisible,
  });
};
```

**Appelé :**
- Au mount du composant
- Après envoi d'un signal
- Quand tier change

---

## RESET QUOTIDIEN (TODO)

Les compteurs quotidiens doivent être reset à minuit :
- `daily_swipes → 0`
- `daily_super_likes → 0`
- `daily_astra_messages → 0`

**Edge function à créer :**
```sql
-- Reset à 00:00 (timezone utilisateur)
UPDATE astra_profiles SET
  daily_swipes = 0,
  daily_super_likes = 0,
  daily_astra_messages = 0
WHERE created_at < CURRENT_DATE;
```

**Cron job Supabase :**
```
0 0 * * * -- Tous les jours à minuit
```

---

## RESPONSIVE MOBILE

### Petit écran (< 375px)
Version compacte sans /max :
```
[Gratuit]  [🔥 10]  [⭐ 15]
```

### Écran standard (375px - 768px)
Version normale :
```
[Gratuit ✨]  [🔥 10/10]  [⭐ 15]
```

### Tablet/Desktop (> 768px)
Version détaillée avec labels :
```
[Gratuit ✨]  [🔥 10/10 signaux]  [⭐ 15 étoiles]
```

**CSS responsive :**
```css
@media (max-width: 375px) {
  .counter-label { display: none; }
  .counter-max { display: none; }
}
```

---

## PERFORMANCE

### Build size
```
UniverseMapPage-CBfaxPHz.js    29.07 kB │ gzip: 8.83 kB
```

**Évolution :**
- Version précédente : 28.07 kB (8.69 kB gzip)
- Version actuelle : 29.07 kB (8.83 kB gzip)
- **+1 kB** (+140 bytes gzip) pour :
  - Compteur Super Nova
  - Logique Infinity
  - Badge amélioré

Acceptable pour la fonctionnalité ajoutée.

---

## TESTS UTILISATEUR

### Scénario 1 : Utilisateur Gratuit
1. Voir header : `[Gratuit ✨] [🔥 10/10] [⭐ 15]`
2. Envoyer 10 signaux → `[🔥 0/10]`
3. Essayer d'envoyer 11e signal → Popup "Plus de signaux"
4. Voir 15 étoiles claires, le reste flouté
5. Tap étoile 16+ → Popup "Limite visibilité"
6. Essayer Super Nova → Popup "Fonctionnalité Premium"

### Scénario 2 : Utilisateur Premium
1. Voir header : `[Premium 💎] [🔥 ∞] [🌟 1/1] [⭐ 50]`
2. Envoyer 50 signaux → `[🔥 ∞]` (pas de changement)
3. Utiliser 1 Super Nova → `[🌟 0/1]`
4. Essayer 2e Super Nova → Popup "Limite Super Nova"
5. Voir 50 étoiles claires, le reste flouté
6. Voir distance sur tous les profils

### Scénario 3 : Utilisateur Elite
1. Voir header : `[Elite 👑] [🔥 ∞] [🌟 5/5] [⭐ ∞]`
2. Envoyer 100+ signaux → `[🔥 ∞]` (illimité)
3. Utiliser 3 Super Nova → `[🌟 2/5]`
4. Voir TOUTES les étoiles claires (∞)
5. Distance exacte en km sur tous les profils
6. Aucune limite de visibilité

---

## RÉSULTAT FINAL

Compteurs header maintenant **100% corrects** et **conformes** au système d'abonnement :

✅ Gratuit : 10 signaux, 0 Super Nova, 15 étoiles
✅ Premium : ∞ signaux, 1 Super Nova, 50 étoiles
✅ Elite : ∞ signaux, 5 Super Nova, ∞ étoiles
✅ Affichage ∞ pour illimité
✅ Compteur Super Nova conditionnel
✅ Badge emoji selon tier
✅ Restrictions fonctionnelles actives
✅ Popups limites élégants
✅ Build réussi sans erreurs

**Les compteurs reflètent maintenant les vraies valeurs du système.** 🎯
