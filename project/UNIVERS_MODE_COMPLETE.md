# Mode Univers - Vue Cosmique Interactive

## Vue d'ensemble

Le mode Univers transforme l'expérience de découverte en une vue cosmique immersive où chaque utilisateur est représenté par une étoile dans l'espace. C'est le cœur différenciant de l'application Signaux Cosmiques.

## Architecture

### Composants Créés

```
src/
├── components/
│   └── universe/
│       ├── UniverseCanvas.tsx          # Composant principal orchestrateur
│       ├── BackgroundStarfield.tsx     # Fond étoilé animé
│       ├── MyStar.tsx                  # Étoile de l'utilisateur (centre)
│       ├── OtherStar.tsx              # Étoiles des autres utilisateurs
│       ├── FogOverlay.tsx             # Brouillard pour limiter vision
│       └── StarPreviewModal.tsx       # Modal de preview au clic
├── constellation/
│   ├── UniversMode.tsx                # Wrapper du mode Univers
│   └── UniversPricingMode.tsx         # Ancien mode (tarifs)
└── lib/
    └── universePositioning.ts         # Logique de positionnement
```

## Fonctionnalités

### 1. Positionnement Intelligent

Les étoiles sont positionnées selon un algorithme de spirale dorée (angle d'or) pour éviter les superpositions. La distance au centre dépend de la compatibilité:

- **91-100%**: 100px (très proche)
- **76-90%**: 180px (proche)
- **51-75%**: 280px (moyen)
- **26-50%**: 400px (loin)
- **0-25%**: 520px (très loin)

### 2. Apparence par Abonnement

#### Gratuit (Free)
- **Vision**: 15 étoiles max
- **Apparence utilisateur**:
  - Petite étoile (40px)
  - Glow blanc basique (20px)
  - Pas d'animations
- **Ce qu'il voit**:
  - Profils floutés (sauf Premium/Elite)
  - Zoom limité (0.8x - 1.5x)
  - Pan limité (200px)

#### Premium
- **Vision**: 50 étoiles max
- **Apparence utilisateur**:
  - Étoile moyenne (55px)
  - Glow doré x2 (40px)
  - Animation pulse
- **Ce qu'il voit**:
  - Tous les profils nets
  - Zoom étendu (0.5x - 2.5x)
  - Pan étendu (500px)

#### Elite
- **Vision**: ∞ étoiles
- **Apparence utilisateur**:
  - Grande étoile (70px)
  - Glow doré x3 (60px)
  - Aura dorée animée
  - Particules orbitales
  - Animation pulse + rotation
- **Ce qu'il voit**:
  - Vision totale
  - Zoom illimité (0.3x - 4.0x)
  - Pan illimité

### 3. Couleurs par Compatibilité

Les étoiles changent de couleur selon la compatibilité avec l'utilisateur:

- **86-100%**: Or brillant (#FFD700) + animation spéciale
- **71-85%**: Orange doré (#F59E0B)
- **51-70%**: Jaune (#FBBF24)
- **31-50%**: Gris clair (#9CA3AF)
- **0-30%**: Gris (#6B7280)

### 4. Interactions

#### Molette / Pinch
- Zoom avant/arrière
- Limité selon l'abonnement

#### Clic & Glisser
- Déplacement dans l'univers
- Rayon limité selon l'abonnement

#### Clic sur Étoile
- Ouvre un modal de preview
- Affiche:
  - Photo (floutée si gratuit)
  - Compatibilité (orbe circulaire)
  - Infos de base
  - Actions: Signal, SuperNova, Voir profil

### 5. Effets Visuels

#### Fond Cosmique
- Canvas animé avec 200 étoiles scintillantes
- Gradient radial du centre vers l'extérieur
- Couleurs: #0D0D2B → #080818 → #030308

#### Glow Dynamique
- Plusieurs couches de box-shadow
- Intensité selon l'abonnement
- Couleur selon compatibilité

#### Aura Dorée (Elite)
- 3 cercles concentriques pulsants
- Animation vers l'extérieur
- Opacité décroissante

#### Particules (Elite)
- 8 particules orbitant autour de l'étoile
- Mouvement sinusoïdal
- Taille et opacité variables

#### Brouillard
- Gradient radial masquant les bords
- Rayon selon abonnement
- CTA d'upgrade au centre pour gratuits

### 6. Badges & Indicateurs

- **Badge compatibilité**: Affiché au-dessus de chaque étoile
- **Badge en ligne**: Point vert pulsant si utilisateur actif
- **Compteur**: Nombre d'étoiles visibles / max
- **Zoom**: Niveau de zoom actuel

## Utilisation

```tsx
import UniversMode from './components/constellation/UniversMode';

<UniversMode
  profiles={profilesList}
  onSignal={(profile) => handleSignal(profile)}
  onViewProfile={(profile) => showFullProfile(profile)}
  currentUserId={user.id}
  userTier="premium"  // ou "free" ou "premium_elite"
  userPhoto={user.avatar_url}
  onUpgrade={() => navigateToSubscription()}
/>
```

## Optimisations

### Performance
- Canvas séparé pour le fond (ne se redessine pas à chaque frame)
- Animation requestAnimationFrame pour fluidité
- Limitation du nombre d'étoiles visibles

### Mobile
- Support du pinch-to-zoom
- Drag fluide avec touch
- Tailles adaptées aux petits écrans

## Prochaines Améliorations

- [ ] Connexions lumineuses entre matchs
- [ ] Animation "alignement des astres" pour 90%+
- [ ] Mode nébuleuse avec clusters de profils
- [ ] Son spatial au clic
- [ ] Vibration haptique différenciée
- [ ] Filtre par signe astrologique (overlay)
- [ ] Mode "vue galaxie" avec zoom arrière extrême

## Notes Techniques

- Utilise Canvas HTML5 pour les rendus graphiques
- React Hooks pour la gestion d'état
- Animations CSS pour les effets simples
- requestAnimationFrame pour animations complexes
- Calcul mathématique précis pour positionnement

## Configuration dans Supabase

Les profils doivent avoir:
- `premium_tier`: 'free' | 'premium' | 'premium_elite'
- `compatibility`: number (0-100)
- `isOnline`: boolean
- `photos`: string[]
- `first_name`, `age`, `location`, `zodiac`, etc.

La compatibilité est calculée automatiquement via `matchingService`.
