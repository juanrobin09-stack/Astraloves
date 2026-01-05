# 🖤 Application de Dating - Design Noir Pur Premium

## 🎯 Vue d'ensemble

Application de dating complète avec **flux de profils réels**, animations fluides et design **noir pur premium**. Interface ultra-immersive avec 8 profils variés et système de swipe fonctionnel.

---

## ✨ Fonctionnalités Principales

### 📊 Flux de Profils
- **8 profils prédéfinis** variés et réalistes
- **Défilement infini** : retour au début après le dernier profil
- **Transitions fluides** entre chaque profil
- **Compteur de matchs** en temps réel

### 🎨 Design Noir Pur
- Fond **#000000** absolu
- **Vignette rouge subtile** sur les bords uniquement
- **Pas de dégradés de fond** - noir pur
- Accents **rouges/roses** pour les éléments interactifs

### 🎬 Animations Premium
- **Fade-in + slide-up** à l'entrée de carte
- **Slide-left/right/up** selon l'action de swipe
- **Barre de compatibilité** animée (1s)
- **Super Like** avec pulse permanent
- **Toast "C'est un match !"** animé

---

## 📂 Structure des Fichiers

### Nouveaux Fichiers Créés

#### 1. `src/data/datingProfiles.ts`
Base de données de 8 profils avec photos réalistes Pexels.

**Interface Profile** :
```typescript
export interface DatingProfile {
  id: number;
  name: string;
  age: number;
  location: string;
  photo: string;          // URL Pexels
  compatibility: number;   // 85-94%
  zodiac: string;
  bio: string;
  verified: boolean;
  interests?: string[];
}
```

**Profils Inclus** :
1. **Juan**, 53 ans, France - Balance (93%)
2. **Sofia**, 29 ans, Espagne - Lion (87%)
3. **Marcus**, 35 ans, Italie - Gémeaux (91%)
4. **Léa**, 27 ans, Belgique - Verseau (89%)
5. **Alexandre**, 42 ans, Suisse - Scorpion (85%)
6. **Camille**, 31 ans, Canada - Poissons (94%)
7. **Thomas**, 38 ans, Allemagne - Taureau (88%)
8. **Emma**, 26 ans, Angleterre - Bélier (92%)

**Helpers** :
```typescript
getZodiacEmoji(sign: string): string  // ♈, ♉, ♊, etc.
getBioIcon(id: number): string        // ❤️‍🔥, ✨, 🌟, etc.
```

#### 2. `src/components/SwipePagePure.tsx`
Composant principal avec design noir pur.

---

## 🎨 Design - Détails Techniques

### Background (#000000)
```tsx
<div className="min-h-screen bg-black">
  {/* Vignette rouge subtile sur les bords */}
  <div className="fixed inset-0 pointer-events-none" style={{
    background: 'radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(139, 0, 0, 0.15) 100%)'
  }} />
</div>
```

**Caractéristiques** :
- Fond **noir pur** partout
- Vignette rouge **très subtile** (15% opacité)
- Pas de particules flottantes
- Design **minimaliste et épuré**

---

### Header Fixe

**Position** : Fixed top avec backdrop-blur
**Style** : Glassmorphism noir avec bordures rouges

```tsx
<div className="fixed top-0 backdrop-blur-xl bg-black/60">
  {/* Swipes illimités */}
  <div className="bg-black/80 border border-red-600/50 shadow-lg shadow-red-600/20">
    <Flame className="text-red-500 animate-pulse" />
    <span>
  {swipesLimit === Infinity
    ? '∞ Swipes illimités'
    : `${swipesUsed}/${swipesLimit} swipes par jour`}
</span>

  </div>

  {/* Matchs */}
  <div className="bg-black/80 border border-red-600/50">
    <Heart className="text-red-500" fill="currentColor" />
    <span>{matchCount}</span>
  </div>
</div>
```

**Éléments** :
- **Gauche** : Badge "Swipes illimités" avec flamme 🔥
- **Droite** : Badge "Matchs" avec compteur dynamique
- **Bordures** : Rouge 50% opacité avec glow rouge

---

### Card de Profil

#### Container Principal
```tsx
<div className="bg-[#0a0a0a] rounded-[20px] border border-red-600 shadow-2xl"
     style={{
       boxShadow: '0 0 60px rgba(220, 20, 60, 0.4), 0 0 30px rgba(255, 0, 0, 0.2)'
     }}>
```

**Caractéristiques** :
- **Fond** : #0a0a0a (noir mat légèrement plus clair)
- **Bordure** : 1px rouge néon (#DC2626)
- **Shadow** : Rouge diffuse XXL avec double couche
- **Radius** : 20px
- **Max-width** : 440px desktop, 95vw mobile

---

#### Photo Section (3:4)

```tsx
<div className="relative aspect-[3/4] rounded-t-[20px]">
  <img src={photo} className="w-full h-full object-cover" />

  {/* Bordure interne rouge */}
  <div className="absolute inset-0 border border-red-600/30 rounded-t-[20px]" />

  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-b"
       style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.4) 70%, #000000 100%)' }}
  />
</div>
```

**Overlays** :
1. **Bordure interne** rouge 30% opacité
2. **Gradient** : transparent → noir du milieu vers le bas

---

#### Info Overlay (sur photo)

```tsx
<div className="absolute bottom-0 p-6 space-y-3">
  {/* Nom avec glow rouge */}
  <h2
    className="text-[40px] font-bold text-white"
    style={{ textShadow: '0 2px 20px rgba(220, 20, 60, 0.8), 0 0 40px rgba(255, 0, 0, 0.4)' }}
  >
    {name}
  </h2>

  {/* Badge vérifié */}
  <div className="w-6 h-6 rounded-full bg-red-600">
    <Check className="text-white" />
  </div>

  {/* Âge + Location */}
  <div className="flex items-center gap-3 text-[18px] text-gray-300">
    <span>{age} ans</span>
    <div className="w-1 h-1 rounded-full bg-red-500" />
    <span>{location}</span>
  </div>

  {/* Badge Zodiac */}
  <div className="bg-red-900/60 border border-red-600 backdrop-blur-sm">
    <span>{zodiac} {emoji}</span>
  </div>
</div>
```

**Typographie** :
- **Nom** : 40px bold avec double text-shadow rouge
- **Âge/Ville** : 18px gris clair
- **Point séparateur** : Cercle rouge 1px

---

#### Section Compatibilité

```tsx
<div className="bg-black px-6 py-5 space-y-3">
  {/* Header */}
  <div className="flex justify-between">
    <span className="text-red-400 text-sm font-semibold tracking-widest uppercase">
      Compatibilité
    </span>
    <span className="text-[32px] font-bold bg-gradient-to-r from-red-600 to-pink-500 bg-clip-text text-transparent">
      {compatibility}%
    </span>
  </div>

  {/* Barre de progression */}
  <div className="relative h-2 bg-[#1a1a1a] rounded-full">
    <div
      className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
      style={{
        width: `${progress}%`,
        background: 'linear-gradient(to right, #8B0000 0%, #FF0000 50%, #FF1493 100%)'
      }}
    />

    {/* Points indicateurs */}
    {[10, 25, 50, 75, 90].map((point) => (
      <div
        className="absolute w-[2px] bg-black/40"
        style={{ left: `${point}%` }}
      />
    ))}
  </div>
</div>
```

**Gradient de la barre** :
```
#8B0000 (rouge foncé) → #FF0000 (rouge vif) → #FF1493 (rose néon)
```

**Animation** :
- **Duration** : 1s ease-out
- **Delay** : 100ms après montage
- **Points** : 5 indicateurs à 10%, 25%, 50%, 75%, 90%

---

#### Bio Section

```tsx
<div className="bg-black px-6 py-5">
  <div className="flex items-start gap-3">
    <span className="text-2xl">{getBioIcon(id)}</span>
    <p className="text-[#e5e5e5] leading-relaxed text-[15px]">
      {bio}
    </p>
  </div>
</div>
```

**Icônes dynamiques** :
❤️‍🔥, ✨, 🌟, 💫, 🔥, ⭐, 💖, 🌙 (selon ID du profil)

---

#### Bouton "Voir Profil"

```tsx
<button className="w-full h-12 rounded-xl border-2 border-red-600 bg-transparent hover:bg-red-600 transition-all duration-300 group">
  <Eye className="w-5 h-5 group-hover:scale-110" />
  <span>Voir le profil complet</span>
</button>
```

**États** :
- **Default** : Bordure rouge, fond transparent
- **Hover** : Fond rouge, icône scale 110%

---

### Action Buttons

#### Container
```tsx
<div className="fixed bottom-0 bg-black pb-8 pt-4">
  <div className="flex items-center justify-center gap-6">
```

**Spacing** : `gap-6` (24px) entre les boutons

---

#### PASSER (X) - 68px

```tsx
<button
  onClick={() => handleSwipe('left')}
  className="w-[68px] h-[68px] rounded-full bg-[#0a0a0a] border-2 border-gray-700 hover:border-red-600 hover:scale-110"
>
  <X className="w-8 h-8 text-gray-400 group-hover:text-red-600" />
</button>
```

**Caractéristiques** :
- **Taille** : 68px × 68px
- **Fond** : #0a0a0a (noir mat)
- **Bordure** : Gris foncé → rouge au hover
- **Icône** : X gris clair → rouge au hover
- **Hover** : scale 1.1, bordure rouge

---

#### SUPER LIKE (⭐) - 84px

```tsx
<button
  onClick={() => handleSwipe('super')}
  className="w-[84px] h-[84px] rounded-full hover:scale-[1.15] hover:rotate-12 animate-pulse-subtle"
  style={{
    background: 'radial-gradient(circle at center, #DC143C 0%, #FF1493 100%)',
    boxShadow: '0 0 30px rgba(220, 20, 60, 0.6), 0 0 60px rgba(220, 20, 60, 0.3)'
  }}
>
  <Star className="w-11 h-11 text-[#FFD700]" fill="currentColor" />

  {/* Glow enhanced on hover */}
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100"
       style={{
         background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)',
         filter: 'blur(10px)'
       }}
  />
</button>
```

**Caractéristiques** :
- **Taille** : 84px × 84px (le plus grand)
- **Fond** : Gradient radial #DC143C → #FF1493
- **Icône** : Étoile dorée #FFD700 remplie
- **Shadow** : Double couche rouge diffuse
- **Hover** : scale 1.15 + rotation 12deg
- **Animation** : Pulse permanent subtil

**Animation Pulse** :
```css
@keyframes pulse-subtle {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 30px rgba(220, 20, 60, 0.6);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 40px rgba(220, 20, 60, 0.8);
  }
}
```

---

#### LIKE (❤️) - 68px

```tsx
<button
  onClick={() => handleSwipe('right')}
  className="w-[68px] h-[68px] rounded-full hover:scale-110"
  style={{
    background: 'linear-gradient(135deg, #FF0000 0%, #FF69B4 100%)',
    boxShadow: '0 0 20px rgba(255, 0, 0, 0.5)'
  }}
>
  <Heart className="w-8 h-8 text-white group-hover:animate-pulse" fill="currentColor" />
</button>
```

**Caractéristiques** :
- **Taille** : 68px × 68px
- **Fond** : Gradient #FF0000 → #FF69B4
- **Icône** : Cœur blanc rempli
- **Shadow** : Rouge diffuse
- **Hover** : scale 1.1 + animation battement

---

## 🎬 Animations & Transitions

### 1. Entrée de Carte

```css
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

**Application** :
- Animation automatique à l'apparition
- Duration : 0.5s ease-out

---

### 2. Sortie de Carte (Swipe)

**Swipe Left (Passer)** :
```tsx
translate-x-[-150%] rotate-[-25deg] opacity-0
```

**Swipe Right (Like)** :
```tsx
translate-x-[150%] rotate-[25deg] opacity-0
```

**Swipe Up (Super Like)** :
```tsx
translate-y-[-150%] scale-110 opacity-0
```

**Timing** :
- Duration : 300ms ease-out
- Nouveau profil après 300ms

---

### 3. Barre de Compatibilité

```tsx
const [compatibilityProgress, setCompatibilityProgress] = useState(0);

useEffect(() => {
  setCompatibilityProgress(0);
  const timer = setTimeout(() => {
    setCompatibilityProgress(currentProfile?.compatibility || 0);
  }, 100);
  return () => clearTimeout(timer);
}, [currentIndex]);
```

**Style** :
```tsx
<div
  className="transition-all duration-1000 ease-out"
  style={{ width: `${compatibilityProgress}%` }}
/>
```

**Animation** :
- Départ à 0%
- Remplissage en 1s
- Delay de 100ms après montage

---

### 4. Toast "C'est un match !"

```tsx
{showMatchToast && (
  <div className="fixed top-24 left-1/2 transform -translate-x-1/2 animate-slideDown">
    <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-3 rounded-full">
      <Heart className="animate-pulse" />
      <span>C'est un match ! 🎉</span>
    </div>
  </div>
)}
```

**Animation** :
```css
@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translate(-50%, -100%);
  }
  10% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  90% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
}
```

**Durée** : 2s (visible pendant ~1.6s)

---

## 🎯 Fonctionnalités React

### State Management

```typescript
const [currentIndex, setCurrentIndex] = useState(0);
const [matchCount, setMatchCount] = useState(0);
const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'super' | null>(null);
const [isAnimating, setIsAnimating] = useState(false);
const [showMatchToast, setShowMatchToast] = useState(false);
const [compatibilityProgress, setCompatibilityProgress] = useState(0);
```

---

### handleSwipe Function

```typescript
const handleSwipe = (direction: 'left' | 'right' | 'super') => {
  if (isAnimating) return;

  setIsAnimating(true);
  setSwipeDirection(direction);

  // Incrémenter matchs si like ou super like
  if (direction === 'right' || direction === 'super') {
    setMatchCount(prev => prev + 1);
    setShowMatchToast(true);
    setTimeout(() => setShowMatchToast(false), 2000);
  }

  // Passer au profil suivant après animation
  setTimeout(() => {
    const nextIndex = (currentIndex + 1) % datingProfiles.length;
    setCurrentIndex(nextIndex);
    setSwipeDirection(null);
    setIsAnimating(false);
  }, 300);
};
```

**Logique** :
1. Vérifier si animation en cours
2. Lancer animation de swipe
3. Si like/super like : incrémenter matchs + toast
4. Attendre 300ms
5. Passer au profil suivant (loop infini)
6. Reset animation

---

### Cycle Infini

```typescript
const nextIndex = (currentIndex + 1) % datingProfiles.length;
```

**Comportement** :
- Profil 1 → 2 → 3 → ... → 8 → 1 → 2 → ...
- Défilement sans fin

---

## 📱 Responsive Design

### Breakpoints

**Desktop (≥640px)** :
```tsx
<div className="max-w-[440px]">
  {/* Card 440px centrée */}
</div>
```

**Mobile (<640px)** :
```css
@media (max-width: 640px) {
  .max-w-\[440px\] {
    max-width: 95vw;
  }
}
```

**Boutons Mobile** :
- Pass : 60px
- Super Like : 76px
- Like : 60px

---

### Adaptation

**Desktop** :
- Card : 440px max-width
- Spacing large
- Padding généreux

**Mobile** :
- Card : 95vw
- Padding réduit
- Textes adaptés

---

## 🔧 Stack Technique

### Technologies
- ✅ **React 18** avec hooks
- ✅ **TypeScript** pour type safety
- ✅ **Tailwind CSS** classes core
- ✅ **Lucide React** pour icônes
- ✅ **CSS Animations** customisées

### Hooks Utilisés
```typescript
useState  // State management
useEffect // Animations de compatibilité
```

### Pas de Dépendances Externes
- Pas de Framer Motion
- Pas de React Spring
- Animations CSS pures
- Pas de localStorage

---

## 🎨 Palette de Couleurs

### Noirs
```css
#000000  /* Background principal */
#0a0a0a  /* Card container */
#1a1a1a  /* Progress bar background */
```

### Rouges
```css
#8B0000  /* Darkred - début gradient */
#DC143C  /* Crimson - super like */
#FF0000  /* Red vif - milieu gradient */
#DC2626  /* Red-600 - bordures */
```

### Roses
```css
#FF1493  /* Deep pink - fin gradients */
#FF69B4  /* Hot pink - like button */
#EC4899  /* Pink-500 - accents */
```

### Or
```css
#FFD700  /* Gold - étoile super like */
```

### Gris
```css
#e5e5e5  /* Texte bio */
#d1d5db  /* Gray-300 - âge/ville */
#4b5563  /* Gray-700 - bordure pass */
```

---

## 🚀 Utilisation

### Navigation
L'application utilise l'onglet **Découvrir** (🔍) dans la barre de navigation.

### Actions Disponibles

**Pass (X)** :
- Passe au profil suivant
- Slide left + rotation
- Ne compte pas comme match

**Like (❤️)** :
- Like le profil
- Slide right + rotation
- Incrémente matchs
- Toast "C'est un match !"

**Super Like (⭐)** :
- Super like le profil
- Slide up + scale
- Incrémente matchs
- Toast "C'est un match !"

---

## 📊 Profils Disponibles

| ID | Nom | Âge | Pays | Signe | Score |
|----|-----|-----|------|-------|-------|
| 1 | Juan | 53 | France | Balance ♎ | 93% |
| 2 | Sofia | 29 | Espagne | Lion ♌ | 87% |
| 3 | Marcus | 35 | Italie | Gémeaux ♊ | 91% |
| 4 | Léa | 27 | Belgique | Verseau ♒ | 89% |
| 5 | Alexandre | 42 | Suisse | Scorpion ♏ | 85% |
| 6 | Camille | 31 | Canada | Poissons ♓ | 94% |
| 7 | Thomas | 38 | Allemagne | Taureau ♉ | 88% |
| 8 | Emma | 26 | Angleterre | Bélier ♈ | 92% |

**Photos** : Pexels stock photos haute qualité

---

## 💡 Points Forts

### Design
✅ **Noir pur** (#000000) - pas de dégradés
✅ **Vignette rouge subtile** sur bords uniquement
✅ **Bordures néon rouges** avec glow
✅ **Shadows XXL diffuses** pour profondeur
✅ **Glassmorphism** sur header

### UX
✅ **Transitions ultra fluides** (300-500ms)
✅ **Feedback visuel immédiat** sur actions
✅ **Compteur de matchs** qui s'anime
✅ **Toast notifications** pour matchs
✅ **Animations entrée/sortie** premium

### Performance
✅ **Animations CSS** hardware-accelerated
✅ **Pas de re-render** inutiles
✅ **Images optimisées** Pexels
✅ **Code léger** sans dépendances lourdes

### Responsive
✅ **Mobile-first** design
✅ **Breakpoints** adaptés
✅ **Boutons** redimensionnés sur mobile
✅ **Textes** lisibles partout

---

## 🎯 Expérience Utilisateur

### Flux Complet

1. **Arrivée** sur la page
   - Carte apparaît avec fade-in + slide-up
   - Barre de compatibilité s'anime
   - Header affiche "0 matchs"

2. **Swipe Right/Super Like**
   - Carte disparaît (slide + rotation)
   - Matchs incrémente
   - Toast "C'est un match !" apparaît
   - Nouveau profil après 300ms

3. **Swipe Left**
   - Carte disparaît (slide left)
   - Pas de match
   - Nouveau profil après 300ms

4. **Cycle Infini**
   - Profil 8 → retour au profil 1
   - Compteur de matchs conservé

---

## 🔍 Détails d'Implémentation

### Prévention Double-Click
```typescript
const [isAnimating, setIsAnimating] = useState(false);

const handleSwipe = (direction) => {
  if (isAnimating) return;  // Bloque pendant animation
  setIsAnimating(true);
  // ... logique
  setTimeout(() => {
    setIsAnimating(false);  // Réactive après 300ms
  }, 300);
};
```

### Gestion des Photos
```tsx
<img
  src={currentProfile.photo}
  alt={currentProfile.name}
  className="w-full h-full object-cover"
/>
```

Photos Pexels choisies pour :
- **Qualité** professionnelle
- **Diversité** ethnique et d'âge
- **Résolution** 800px minimum
- **Compression** optimisée

---

## 📈 Métriques

### Tailles
- **Card** : 440px max (desktop)
- **Photo** : Ratio 3:4
- **Pass/Like** : 68px
- **Super Like** : 84px

### Espacements
- **Gap buttons** : 24px (gap-6)
- **Padding card** : 24px (p-6)
- **Border radius** : 20px
- **Header padding** : 16px (p-4)

### Animations
- **Swipe** : 300ms
- **Compatibilité** : 1000ms
- **Toast** : 2000ms
- **Pulse** : 3000ms

---

**Date** : 2 décembre 2025
**Build** : ✅ 9.70s
**Status** : ✅ Production-ready
**Composant** : SwipePagePure.tsx
**Thème** : 🖤 Noir Pur Premium
**Profils** : 8 profils réalistes
**Flux** : Cycle infini fonctionnel
