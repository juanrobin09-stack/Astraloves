# 🌌 Univers - Composant Unique Autonome

## ✅ Refonte Complète

L'ancien système d'univers avec multiples fichiers a été **complètement remplacé** par un **composant unique autonome**.

## 🗑️ Fichiers Supprimés

### Composants
- `src/components/Universe/UniverseScreen.tsx` ❌
- `src/components/Universe/MyStar.tsx` ❌
- `src/components/Universe/OtherStar.tsx` ❌
- `src/components/Universe/BackgroundStarfield.tsx` ❌
- `src/components/Universe/Nebulas.tsx` ❌
- `src/components/Universe/FogOverlay.tsx` ❌
- `src/components/Universe/UniverseControls.tsx` ❌
- `src/components/Universe/StarPreviewModal.tsx` ❌

### Hooks & Utils
- `src/hooks/useUniverse.ts` ❌
- `src/lib/universePositioning.ts` ❌
- `src/styles/universe.css` ❌

## ✨ Nouveau Fichier Unique

### `src/components/UniverseScreen.tsx`

Un **seul fichier** qui contient **TOUT** :

```tsx
// 🎯 TOUT EST DANS CE FICHIER
export const UniverseScreen = ({ userTier = 'free' }) => {
  // Logique complète et autonome
};
```

### Composants Internes (dans le même fichier)

1. **BackgroundStars** - Étoiles de fond animées
2. **MyStar** - TON étoile au centre (avec aura Elite/Premium)
3. **OtherStar** - Étoiles des autres utilisateurs
4. **StarPreviewModal** - Modal de prévisualisation
5. **UniverseScreen** - Composant principal

### Données Mock Intégrées

```typescript
const MOCK_STARS: Star[] = Array.from({ length: 30 }, (_, i) => ({
  id: `star-${i}`,
  name: ['Luna', 'Nova', 'Stella', ...][i % 10],
  compatibility: Math.floor(Math.random() * 50) + 50,
  tier: ['free', 'premium', 'elite'][...],
  // ...
}));
```

Pas besoin de base de données pour tester !

## 🎨 Features Incluses

### 1. Centrage Automatique
```tsx
const [center, setCenter] = useState({ x: 200, y: 350 });

useEffect(() => {
  const updateCenter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCenter({ x: rect.width / 2, y: rect.height / 2 });
    }
  };
  updateCenter();
  setTimeout(updateCenter, 100);
  window.addEventListener('resize', updateCenter);
}, []);
```

### 2. Positionnement en Spirale Dorée
```tsx
const starPositions = useMemo(() => {
  const goldenAngle = 137.5 * (Math.PI / 180);

  visibleStars.forEach((star, index) => {
    const minDist = 70;
    const maxDist = Math.min(center.x, center.y) - 30;
    const distance = minDist + ((100 - star.compatibility) / 100) * (maxDist - minDist);
    const angle = index * goldenAngle;

    positions.set(star.id, {
      x: center.x + distance * Math.cos(angle),
      y: center.y + distance * Math.sin(angle),
    });
  });
}, [visibleStars, center]);
```

### 3. Limites par Tier
```typescript
const getTierLimits = (tier: UserTier) => {
  switch (tier) {
    case 'elite': return { maxStars: 100, zoomMin: 0.3, zoomMax: 3 };
    case 'premium': return { maxStars: 50, zoomMin: 0.5, zoomMax: 2 };
    default: return { maxStars: 15, zoomMin: 0.8, zoomMax: 1.3 };
  }
};
```

### 4. Effets Visuels Premium
- **Free** : Étoile blanche simple + brouillard périphérique
- **Premium** : Étoile dorée avec glow + 50 étoiles visibles
- **Elite** : Aura expansive + 100 étoiles + zoom illimité

### 5. Animations CSS
```tsx
<style>{`
  @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
  @keyframes auraExpand { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.6; } 100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; } }
  @keyframes float { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-5px); } }
`}</style>
```

### 6. Contrôles Zoom
- Boutons **+** / **−**
- Affichage pourcentage
- Reset avec **⟳**
- Limites selon tier

### 7. Modal de Prévisualisation
- Photo + infos profil
- Score de compatibilité
- Badge online
- Indicateur "a envoyé un signal"
- Actions : Signal / Nova / Profil
- Upsell Premium pour profils floutés

## 📱 Utilisation

### Dans n'importe quel composant :

```tsx
import UniverseScreen from './components/UniverseScreen';

// Parent DOIT avoir flex-1 et relative
<div className="flex-1 relative">
  <UniverseScreen userTier="free" />
</div>
```

### Tiers disponibles :

```tsx
<UniverseScreen userTier="free" />      // 15 étoiles, zoom limité
<UniverseScreen userTier="premium" />   // 50 étoiles
<UniverseScreen userTier="elite" />     // 100 étoiles, zoom max
```

## 🎯 Fichiers Mis à Jour

1. **src/components/ConstellationPage.tsx**
   ```tsx
   import UniverseScreen from './UniverseScreen';

   export default function ConstellationPage() {
     return (
       <div className="flex-1 relative">
         <UniverseScreen userTier="free" />
       </div>
     );
   }
   ```

2. **src/components/constellation/UniversMode.tsx**
   ```tsx
   import UniverseScreen from '../UniverseScreen';
   ```

3. **src/index.css**
   - Supprimé `@import './styles/universe.css';`

## ✅ Avantages

- **1 fichier** au lieu de 10+
- **0 dépendances** externes (tout autonome)
- **Mock data** intégré pour tests
- **Copy-paste** facile
- **Maintenance** simplifiée
- **Debug** plus facile
- **Performance** identique

## 🎨 Résultat Visuel

```
┌─────────────────────────────────┐
│  ✨ 15        🔭 100%  +        │
│     ✨  ✨                      │
│   ✨      ✨    ✨              │
│        ⭐ TOI                   │
│     ✨    ✨      ✨            │
│  ✨         ✨                  │
│                      − ⟳        │
│ 🌑 Gratuit                      │
└─────────────────────────────────┘
```

## 🚀 Build Status

✅ Build réussi
✅ TypeScript validé
✅ 0 erreurs
✅ Composant autonome opérationnel

Le composant fonctionne **immédiatement** sans configuration additionnelle !
