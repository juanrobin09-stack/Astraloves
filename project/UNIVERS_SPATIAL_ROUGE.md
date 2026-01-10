# Application de Dating - Univers Spatial Rouge & Noir

Application de dating complète avec un concept spatial immersif en rouge et noir.

## Pages créées

### 1. Carte de l'Univers (UniverseMapPage)
**Route:** `universe-map`

Écran principal avec une constellation interactive où chaque utilisateur est représenté par une planète lumineuse.

**Fonctionnalités:**
- Fond spatial avec 200+ étoiles scintillantes (blanches et rouges)
- 3 nébuleuses animées rouges qui se déplacent lentement
- Constellation rotative au centre avec 8 planètes (utilisateurs)
- Chaque planète a:
  - Un glow pulsant dans les tons rouges (#EF4444, #F43F5E, #EA580C)
  - Un badge de compatibilité en pourcentage
  - Un effet hover qui affiche les détails
  - Des orbites dessinées en pointillés rouges
- Contrôles de zoom (+/-) avec slider visuel
- Bouton de recentrage
- Effet étoile filante occasionnel
- TOI au centre avec aura spéciale pulsante
- Navigation bottom (mobile) / sidebar (desktop)
- Système de drag & drop pour déplacer la vue
- 100% responsive mobile et desktop

**En-tête:**
- Badge tier utilisateur (Gratuit/Premium/Elite)
- Compteur de crédits (🔥 8/10)
- Compteur d'étoiles (⭐ 15/15)

---

### 2. Page Abonnements (SubscriptionPlansPageRed)
**Route:** `subscription-plans-red`

Page spectaculaire présentant 3 plans d'abonnement avec animations et effets visuels immersifs.

**Plans disponibles:**

#### 🌑 Gratuit - "Étoile Naissante"
- Prix: 0€
- Design: sobre avec bordure grise
- Fonctionnalités limitées:
  - 10 signaux cosmiques/jour
  - 10 messages Astra IA/jour
  - 20 messages matchs/jour
  - Horoscope basique
  - 5 photos max
  - Vision limitée (15 étoiles)

#### 💎 Premium - "Étoile Brillante" (RECOMMANDÉ)
- Prix: 9,99€/mois
- Badge "⭐ Recommandé" animé
- Bordure rouge #EF4444 avec glow pulsant
- Effet shimmer sur la carte
- Background gradient noir vers rouge sombre
- Fonctionnalités:
  - Signaux illimités (∞)
  - 1 Super Nova/jour
  - 40 messages Astra IA/jour
  - Messages matchs illimités
  - Voir qui a envoyé un signal
  - Vision étendue (50 étoiles)
  - Filtres avancés
  - Boost visibilité x3
  - Matchs 92% compatibilité IA
  - Badge Premium visible
  - Et plus...

#### 👑 Elite - "Supernova"
- Prix: 14,99€/mois
- Bordure gradient doré/rouge
- Particules dorées flottantes
- Effet luxe premium
- Fonctionnalités VIP:
  - Tout Premium PLUS:
  - 5 Super Nova/jour
  - 65 messages Astra IA Ultra/jour
  - Coach IA Pro personnalisé
  - Vision TOTALE (∞)
  - Mode incognito
  - Badge Elite Top 1%
  - 20 photos max
  - Bio illimitée
  - Boost Elite x10
  - 10 super likes/jour
  - Filtres astro avancés
  - Thème astral complet
  - Aura dorée animée
  - Astra écrit les premiers messages

**Effets visuels:**
- 150+ étoiles scintillantes
- Galaxie spirale en rotation lente
- 20 particules flottantes qui montent
- Étoiles filantes occasionnelles
- Animations de hover sur cartes
- Stagger animation à l'apparition

---

## Comment tester

### Option 1: Via la console du navigateur
```javascript
// Pour la carte de l'univers
window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'universe-map' } }));

// Pour les abonnements
window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'subscription-plans-red' } }));
```

### Option 2: Modifier temporairement App.tsx
Changer la page par défaut dans `getInitialPage()`:
```typescript
const getInitialPage = (): Page => {
  return 'universe-map'; // ou 'subscription-plans-red'
};
```

### Option 3: Ajouter des liens dans la navigation
Ajouter des boutons dans BottomNav ou AppHeader qui appellent:
```typescript
handleNavigate('universe-map')
// ou
handleNavigate('subscription-plans-red')
```

---

## Technologies utilisées
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animations fluides)
- 100% responsive (mobile-first)

## Thème
- Palette: Rouge vif #EF4444, Rose #F43F5E, Orange #EA580C, Noir profond
- Ambiance: Spatiale, immersive, mystérieuse, premium
- Animations: Fluides, satisfaisantes, feedback visuel constant
- Performance: Optimisé avec useMemo pour les éléments statiques

## Responsive
- Mobile: Navigation en bottom bar, cartes swipeable
- Tablet: 2 colonnes de cartes
- Desktop: 3 cartes côte à côte, sidebar navigation, univers plus grand

---

## Build
Le projet a été testé et build avec succès.

```bash
npm run build
```

Les deux nouvelles pages sont incluses dans le build de production.
