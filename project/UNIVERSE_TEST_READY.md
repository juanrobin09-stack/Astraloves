# 🌌 TEST COMPLET DE L'UNIVERS - MODE DÉMO

## 🚀 COMMENT ACCÉDER AU TEST

### Option 1 : URL directe
```
http://localhost:5173/#universe-test
```
Ou en production :
```
https://ton-domaine.com/#universe-test
```

### Option 2 : Depuis la console
```javascript
// Ouvre la console (F12) et tape :
window.location.hash = '#universe-test';
window.location.reload();
```

---

## ✨ CE QUI EST TESTÉ

### 1. Utilisateur connecté (TOI)
- **Prénom** : Toi
- **Âge** : 25 ans
- **Genre** : Homme
- **Signe** : Lion ♌
- **Ville** : Paris
- **Recherche** : Femmes 20-35 ans
- **Questionnaire** :
  - Objectif : Sérieux
  - Weekend : Aventurier
  - Lifestyle : Équilibré
  - Valeurs : Loyal
- **Abonnement** : Gratuit (15 étoiles visibles)
- **Signaux** : 10/10 restants

### 2. 18 utilisateurs fictifs
Profils variés avec différents :
- Signes astrologiques (Bélier, Sagittaire, Lion, Vierge, etc.)
- Objectifs (amour, sérieux, aventure, sais pas)
- Villes (Paris, Lyon, Marseille, Bordeaux, etc.)
- Personnalités (fêtard, casanier, aventurier, culturel)

---

## 🎯 COMPATIBILITÉS CALCULÉES AUTOMATIQUEMENT

### Top 5 attendu :
1. **Léa** (Bélier, Paris, même objectif/valeurs) → ~92-95%
2. **Sarah** (Sagittaire, Paris, valeurs compatibles) → ~90-94%
3. **Emma** (Sagittaire, Paris) → ~88-93%
4. **Lucie** (Bélier, Paris) → ~88-92%
5. **Chloé** (Lion, Lyon, même signe) → ~85-88%

### Moins compatibles :
- **Marine** (Vierge, casanier vs aventurier) → ~55-65%
- **Manon** (Scorpion, aventure vs sérieux) → ~40-50%

---

## 📊 AFFICHAGE DANS L'UNIVERS

### Positions
- **TOI** au centre : Photo ronde avec bordure rouge brillante
- **15 premières étoiles** : Claires et visibles en cercle
- **3 dernières étoiles (16-18)** : Floutées avec 🔒

### Tailles selon compatibilité
- **90%+** → 65px + glow intense rouge
- **80-89%** → 55px + glow moyen
- **70-79%** → 48px + glow léger
- **<70%** → 40px sans glow

### Animation
- Chaque planète flotte doucement (effet float)
- Délai différent pour chaque planète (effet naturel)
- Fond étoilé animé qui défile

---

## 🎨 DESIGN

### Header (en haut)
```
┌────────────────────────────────────────┐
│  [Gratuit ✨]     🔥 10/10    ⭐ 15   │
└────────────────────────────────────────┘
```

### Navigation (en bas)
```
┌────────────────────────────────────────┐
│  🌌      💬      ✨      🔮      👤  │
│ Univers Messages Astra  Astro  Profil │
│ (rouge)  (gris)  (gris) (gris) (gris) │
└────────────────────────────────────────┘
```

---

## 🎪 INTERACTIONS TESTABLES

### 1. Cliquer sur une planète visible (1-15)
**Résultat** : Bottom sheet s'affiche avec :
- Grande photo du profil
- Nom, âge, signe astrologique
- Ville
- Score de compatibilité (⭐ XX%)
- 3 boutons :
  - **Voir profil** (bleu)
  - **💫 Signal** (violet)
  - **🌟 Super** (rouge)

### 2. Cliquer sur une planète floutée (16-18)
**Résultat** : Alert JavaScript :
```
🔒 Passe Premium pour voir les 50 étoiles les plus compatibles
```

### 3. Fermer le bottom sheet
- Cliquer en dehors
- Cliquer sur le X en haut à droite
- Le sheet se ferme avec animation

---

## 🔍 VÉRIFICATIONS DANS LA CONSOLE

Ouvre la console (F12) pour voir :

```javascript
🎯 Top 5 compatibilités: [
  { prenom: "Léa", score: 94 },
  { prenom: "Sarah", score: 92 },
  { prenom: "Emma", score: 90 },
  { prenom: "Lucie", score: 89 },
  { prenom: "Chloé", score: 86 }
]
```

---

## 📱 TEST MOBILE

### À vérifier :
- ✅ Les planètes sont bien réparties en cercle
- ✅ Les 15 premières sont claires
- ✅ Les 3 dernières sont floutées avec 🔒
- ✅ Tap sur planète ouvre le bottom sheet
- ✅ Le bottom sheet glisse depuis le bas
- ✅ Les scores de compatibilité sont affichés
- ✅ Le fond étoilé est animé
- ✅ Les planètes flottent légèrement
- ✅ Le header et la nav sont fixes

### Gestes tactiles :
- **Tap sur planète** → Ouvre bottom sheet
- **Tap en dehors** → Ferme bottom sheet
- **Swipe vers le bas** → Ferme bottom sheet (pas implémenté dans v1)

---

## 🎲 DONNÉES DE TEST

### Matrice de compatibilité utilisée :

#### Astrologique (25% du score)
- Lion × Bélier = 97%
- Lion × Sagittaire = 95%
- Lion × Lion = 78%
- Lion × Vierge = 52%
- Lion × Scorpion = 55%

#### Questionnaire (75% du score)
- **Objectif** (35%) : Sérieux × Sérieux = 100%
- **Valeurs** (20%) : Loyal × Loyal = 100%
- **Lifestyle** (10%) : Équilibré × Équilibré = 100%
- **Weekend** (10%) : Aventurier × Aventurier = 100%

#### Bonus
- **Même ville** : +5%
- **Distance < 20km** : +3%

---

## 🔧 FORMULES EXACTES

```typescript
// Score astro
const astroScore = astroCompatibility[user1.signe][user2.signe] || 50;

// Score questionnaire
const objectifScore = questionnaireCompatibility.objectif[q1][q2] || 50;
const valeursScore = questionnaireCompatibility.valeurs[v1][v2] || 50;
const lifestyleScore = questionnaireCompatibility.lifestyle[l1][l2] || 50;
const weekendScore = questionnaireCompatibility.weekend[w1][w2] || 50;

// Score final
let totalScore = 0;
totalScore += astroScore * 0.25;        // 25%
totalScore += objectifScore * 0.35;     // 35%
totalScore += valeursScore * 0.20;      // 20%
totalScore += lifestyleScore * 0.10;    // 10%
totalScore += weekendScore * 0.10;      // 10%

// Bonus
if (mêmeVille) totalScore += 5;
if (distance < 20) totalScore += 3;

return Math.min(100, Math.round(totalScore));
```

---

## 🎨 PALETTE DE COULEURS

- **Fond** : Noir pur (#000000)
- **Étoiles** : Blanc avec opacité
- **Bordures planètes** : Rouge (#EF4444)
- **Glow intense** : rgba(220, 38, 38, 0.6)
- **Glow moyen** : rgba(220, 38, 38, 0.4)
- **Badge compatibilité** : Fond noir/90, texte blanc
- **Score** : Jaune (#FBBF24)
- **Bottom sheet** : Dégradé gris-900 → noir
- **Boutons** : Bleu, violet, rouge avec dégradés

---

## 🚨 LIMITES DE LA VERSION GRATUITE

### Visibles dans le test :
1. **15 étoiles max** → Planètes 16-18 floutées
2. **10 signaux/jour** → Compteur affiché en haut
3. **Pas de distance** → Non affiché dans le bottom sheet (réservé Premium)

### Message d'upgrade :
Cliquer sur une planète floutée affiche :
```
🔒 Passe Premium pour voir les 50 étoiles les plus compatibles
```

---

## 📈 STATISTIQUES ATTENDUES

### Distribution des scores :
- **90-100%** : 2-3 profils (très compatibles)
- **80-89%** : 4-5 profils (compatibles)
- **70-79%** : 5-6 profils (moyennement compatibles)
- **<70%** : 6-7 profils (peu compatibles)

### Signes les plus compatibles avec Lion :
1. Bélier (97%)
2. Sagittaire (95%)
3. Gémeaux (85%)
4. Balance (88%)

### Signes les moins compatibles :
1. Vierge (52%)
2. Capricorne (48%)
3. Scorpion (55%)

---

## 🔥 FONCTIONNALITÉS TESTÉES

- ✅ Calcul de compatibilité en temps réel
- ✅ Tri par score (meilleurs en premier)
- ✅ Positionnement en cercle
- ✅ Tailles dynamiques selon score
- ✅ Glow selon compatibilité
- ✅ Animation de flottement
- ✅ Fond étoilé animé
- ✅ Bottom sheet avec animation
- ✅ Limitation gratuite (15 étoiles)
- ✅ Floutage des profils premium
- ✅ Compteurs en header
- ✅ Navigation en footer
- ✅ Responsive mobile/desktop

---

## 💡 NOTES POUR LE DÉVELOPPEMENT

### Pour intégrer au vrai univers :
1. Remplacer `testUsers` par `fetchAllUsers()` depuis Supabase
2. Remplacer `currentUser` par l'utilisateur connecté
3. Ajouter les vraies actions sur les boutons :
   - "Voir profil" → Navigation vers ProfilePage
   - "Signal" → Envoyer signal + décrémenter compteur
   - "Super" → Envoyer super signal
4. Ajouter le swipe down pour fermer le bottom sheet
5. Ajouter les animations de réaction (cœurs, étoiles)

### Optimisations possibles :
- Cache des compatibilités calculées
- Lazy loading des images
- Virtualisation pour 50+ profils
- Web Workers pour les calculs lourds

---

## 🎉 C'EST PRÊT !

Lance le serveur de dev et va sur :
```
http://localhost:5173/#universe-test
```

Tu verras l'univers complet avec :
- TOI au centre
- 18 profils triés par compatibilité
- Scores calculés en temps réel
- Interactions fonctionnelles
- Design final

**Profite du spectacle ! 🌌✨**
