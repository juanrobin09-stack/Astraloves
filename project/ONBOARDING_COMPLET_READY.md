# 🚀 ONBOARDING COMPLET AVEC COMPATIBILITÉ ET VILLES FRANÇAISES

## ✅ CE QUI A ÉTÉ CRÉÉ

### 1. Service de recherche de villes françaises
**Fichier:** `src/lib/frenchCitiesService.ts`

- ✅ API gouvernementale française (geo.api.gouv.fr) - GRATUITE
- ✅ Recherche en temps réel avec debounce
- ✅ Coordonnées GPS exactes pour chaque ville
- ✅ Calcul de distance entre deux villes
- ✅ Géolocalisation de l'utilisateur
- ✅ Reverse geocoding (coordonnées → ville)

```typescript
// Rechercher des villes
const villes = await searchFrenchCities('Paris');
// Retourne: [{ nom, codePostal, coordinates: { lat, lng }, population }]

// Géolocaliser l'utilisateur
const coords = await getUserLocation();
const ville = await getCityByCoordinates(coords.lat, coords.lng);

// Calculer la distance
const distance = calculateDistance(ville1.coordinates, ville2.coordinates);
// Retourne la distance en km
```

---

### 2. Système de compatibilité avancé
**Fichier:** `src/lib/advancedCompatibility.ts`

#### Matrice astrologique complète (12 signes × 12 signes)
- Scores de compatibilité de 35% à 97%
- Basé sur les vraies affinités astrologiques

#### Matrice questionnaire de personnalité
4 critères évalués :
1. **Weekend idéal** (10%) : fêtard, casanier, aventurier, culturel
2. **Lifestyle** (10%) : rythme de sorties
3. **Valeurs** (20%) : loyal, indépendant, humour, ambitieux
4. **Objectif** (35%) : amour, sérieux, aventure, sais pas

#### Calcul de compatibilité
```typescript
const score = calculateAdvancedCompatibility(user1, user2);
// Retourne un score de 0 à 100

// Avec détails
const details = getCompatibilityDetails(user1, user2);
/*
{
  global: 87,
  details: [
    { label: 'Astral', emoji: '✨', score: 95 },
    { label: 'Objectifs', emoji: '🎯', score: 100 },
    { label: 'Valeurs', emoji: '💎', score: 70 },
    { label: 'Lifestyle', emoji: '🌙', score: 90 }
  ],
  distance: 15 // km
}
*/
```

#### Pondération du score final
- **25%** Compatibilité astrologique
- **35%** Objectif relationnel (très important !)
- **20%** Valeurs communes
- **10%** Lifestyle
- **10%** Weekend idéal
- **+5%** Bonus si même ville
- **+3%** Bonus si distance < 20km

---

### 3. Composant d'autocomplete de villes
**Fichier:** `src/components/FrenchCityAutocomplete.tsx`

- ✅ Recherche avec suggestions en temps réel
- ✅ API française officielle
- ✅ Bouton "Utiliser ma position actuelle"
- ✅ Affichage du code postal
- ✅ Design moderne noir/rouge

---

### 4. Nouvel onboarding complet
**Fichier:** `src/components/OnboardingPageNew.tsx`

#### 10 étapes optimisées :

**Étapes profil (1-6)** :
1. **Prénom** - Comment tu t'appelles ?
2. **Date de naissance** - Calcul auto de l'âge + signe astro
3. **Genre** - Un homme / Une femme
4. **Je cherche** - Un homme / Une femme / Les deux
5. **Ville** - Avec autocomplete API française
6. **Objectif** - ❤️ Amour / 💕 Sérieux / 🔥 Aventure / 🤷 Sais pas

**Questionnaire personnalité (7-9)** :
7. **Weekend idéal** - 🎉 Fêtes / 🏠 Maison / 🏔️ Aventure / 🎨 Culture
8. **Lifestyle** - Combien de fois tu sors par semaine
9. **Valeurs** - 🤝 Loyal / 🦅 Indépendant / 😂 Humour / 🚀 Ambitieux

**Finalisation (10)** :
10. **Photo de profil** - Pour apparaître dans l'univers

#### Validations strictes
```typescript
// Âge minimum 18 ans
if (calculatedAge < 18) {
  setError('Tu dois avoir 18 ans minimum');
  return;
}

// Tous les champs obligatoires
- Prénom ✅
- Date de naissance ✅
- Genre ✅
- Je cherche ✅
- Ville ✅
- Objectif ✅
- 3 questions personnalité ✅
```

---

## 📊 STRUCTURE DES DONNÉES SAUVEGARDÉES

```typescript
const profileData = {
  // Identité
  first_name: "Alex",
  birth_date: "1998-05-15",
  age: 26,
  sun_sign: "Taureau",
  signe_solaire: "Taureau",

  // Genre et recherche
  gender: "Un homme",
  seeking: "Une femme",
  age_min: 18,
  age_max: 41, // auto: age + 15

  // Localisation (NOUVELLE STRUCTURE)
  ville: "Paris",
  ville_data: {
    nom: "Paris",
    codePostal: "75001",
    coordinates: {
      lat: 48.8566,
      lng: 2.3522
    }
  },

  // Objectif
  goal: "serieux", // amour, serieux, aventure, sais_pas

  // Questionnaire (NOUVEAU !)
  questionnaire: {
    objectif: "serieux",
    weekend: "aventurier",
    lifestyle: "equilibre",
    valeurs: "loyal"
  },

  // Photos
  avatar_url: "url...",
  photos: ["url..."],

  // Métadonnées
  onboarding_completed: true,
  updated_at: "2025-01-01T00:00:00Z"
};
```

---

## 🔄 CONNEXION AVEC L'UNIVERS

### Filtrer les utilisateurs compatibles
```typescript
const getMatchingUsers = (currentUser, allUsers) => {
  return allUsers
    // 1. Filtrer par préférences mutuelles
    .filter(user => {
      // Genre compatible (dans les deux sens)
      const iWantThem =
        currentUser.seeking === "Les deux" ||
        user.gender === currentUser.seeking;

      const theyWantMe =
        user.seeking === "Les deux" ||
        currentUser.gender === user.seeking;

      // Âge compatible (dans les deux sens)
      const ageMatch =
        user.age >= currentUser.age_min &&
        user.age <= currentUser.age_max;

      const reverseAgeMatch =
        currentUser.age >= user.age_min &&
        currentUser.age <= user.age_max;

      return iWantThem && theyWantMe && ageMatch && reverseAgeMatch;
    })

    // 2. Calculer compatibilité
    .map(user => ({
      ...user,
      compatibilite: calculateAdvancedCompatibility(currentUser, user),
      distance: calculateDistance(
        currentUser.ville_data?.coordinates,
        user.ville_data?.coordinates
      ),
    }))

    // 3. Trier par compatibilité (meilleurs en premier)
    .sort((a, b) => b.compatibilite - a.compatibilite)

    // 4. Limiter selon abonnement
    .slice(0, limits[currentUser.plan]);
};
```

### Afficher dans l'univers
```typescript
// Taille selon compatibilité
const size =
  compatibilite >= 90 ? 65 :
  compatibilite >= 80 ? 55 :
  compatibilite >= 70 ? 48 : 40;

// Glow selon compatibilité
const glow =
  compatibilite >= 85 ? 'shadow-[0_0_25px_rgba(220,38,38,0.6)]' :
  compatibilite >= 70 ? 'shadow-[0_0_15px_rgba(220,38,38,0.4)]' : '';

// Badge avec score
<div className="absolute -bottom-7 left-1/2 -translate-x-1/2
                bg-black/90 px-2 py-1 rounded-full text-xs text-white">
  <span className="text-yellow-400">⭐</span>
  <span>{compatibilite}%</span>
</div>

// Distance (Premium+)
{isPremium && (
  <div className="text-[10px] text-gray-400">
    {formatDistance(distance)} {/* "~15 km" */}
  </div>
)}
```

---

## 🎯 COMMENT L'UTILISER

### 1. L'utilisateur s'inscrit
```
SignupPage → Crée compte Supabase → OnboardingPageNew (10 étapes)
```

### 2. L'onboarding collecte tout
- ✅ Infos de base (prénom, date, genre, recherche)
- ✅ Localisation précise avec coordonnées GPS
- ✅ Objectif relationnel
- ✅ 3 questions de personnalité
- ✅ Photo de profil

### 3. Sauvegarde dans Supabase
```sql
-- Table: astra_profiles
UPDATE astra_profiles SET
  first_name = 'Alex',
  birth_date = '1998-05-15',
  age = 26,
  sun_sign = 'Taureau',
  gender = 'Un homme',
  seeking = 'Une femme',
  ville = 'Paris',
  ville_data = '{"nom":"Paris","coordinates":{"lat":48.8566,"lng":2.3522}}',
  goal = 'serieux',
  questionnaire = '{"objectif":"serieux","weekend":"aventurier",...}',
  avatar_url = 'https://...',
  onboarding_completed = true
WHERE id = 'user-uuid';
```

### 4. Affichage dans l'univers
```typescript
// Dans UniverseMapPage ou ConstellationPage
const users = await fetchAllUsers();
const matches = getMatchingUsers(currentUser, users);

// Chaque utilisateur a maintenant :
{
  ...user,
  compatibilite: 87, // Score calculé
  distance: 15, // En km
}
```

---

## 📦 FICHIERS CRÉÉS/MODIFIÉS

### Nouveaux fichiers
- ✅ `src/lib/frenchCitiesService.ts` - API villes françaises
- ✅ `src/lib/advancedCompatibility.ts` - Système de compatibilité
- ✅ `src/components/FrenchCityAutocomplete.tsx` - Autocomplete ville
- ✅ `src/components/OnboardingPageNew.tsx` - Nouvel onboarding 10 étapes

### Fichiers modifiés
- ✅ `src/App.tsx` - Import du nouvel onboarding
- ✅ `src/components/ProfileEdit.tsx` - Simplifié (voir PROFILE_EDIT_READY.md)

---

## 🎨 DESIGN

- **Fond** : Noir avec étoiles animées
- **Couleurs** : Rouge (#DC2626) et dégradés
- **Transitions** : Slide entre les étapes
- **Progress bar** : Rouge qui avance
- **Boutons** : Grands, clairs, avec emojis
- **Mobile first** : Responsive et tactile

---

## 🧪 POUR TESTER

1. **Inscris-toi** avec un nouveau compte
2. **Complète l'onboarding** (10 étapes)
3. **Vérifie dans Supabase** :
   ```sql
   SELECT
     first_name, age, sun_sign, ville,
     ville_data, goal, questionnaire
   FROM astra_profiles
   WHERE id = 'ton-user-id';
   ```
4. **Va dans l'univers** → Ta photo apparaît au centre
5. **Clique sur une étoile** → Popup avec compatibilité calculée

---

## 🚀 PROCHAINES ÉTAPES

Tu peux maintenant :
1. ✅ Utiliser `calculateAdvancedCompatibility()` partout dans l'app
2. ✅ Afficher le score dans les cartes de swipe
3. ✅ Trier les résultats par compatibilité
4. ✅ Ajouter des filtres par distance (avec ville_data.coordinates)
5. ✅ Créer une page "Meilleurs matchs" triée par score

---

## 💡 BONUS : AFFICHER LA COMPATIBILITÉ PARTOUT

### Dans SwipePage
```typescript
const compatibility = calculateAdvancedCompatibility(currentUser, profile);

<div className="absolute top-4 right-4 bg-black/80 px-3 py-2 rounded-full">
  <span className="text-yellow-400">⭐</span>
  <span className="text-white font-bold">{compatibility}%</span>
</div>
```

### Dans MatchesPage
```typescript
const matches = allMatches
  .map(match => ({
    ...match,
    score: calculateAdvancedCompatibility(currentUser, match)
  }))
  .sort((a, b) => b.score - a.score);
```

### Dans la popup profil (univers)
```typescript
const details = getCompatibilityDetails(currentUser, selectedUser);

<div>
  <h3>Compatibilité : {details.global}%</h3>
  {details.details.map(d => (
    <div key={d.label}>
      {d.emoji} {d.label} : {d.score}%
    </div>
  ))}
  {details.distance && (
    <div>📍 Distance : {formatDistance(details.distance)}</div>
  )}
</div>
```

---

## ✨ C'EST PRÊT !

Le système est **complet et fonctionnel** :
- ✅ Onboarding en 10 étapes
- ✅ API française officielle pour les villes
- ✅ Calcul de compatibilité avancé
- ✅ Données sauvegardées dans Supabase
- ✅ Connexion avec l'univers
- ✅ Build réussi

**Tu peux maintenant matcher les utilisateurs avec précision !** 🎯
