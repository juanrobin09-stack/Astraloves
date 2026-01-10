# Fix du bug de chargement de l'onglet Univers

## Problème identifié

Lorsqu'un utilisateur s'inscrit pour la première fois, l'onglet "Univers" ne s'affiche pas correctement au premier chargement. Il faut naviguer vers un autre onglet puis revenir pour que l'affichage fonctionne.

## Analyse du bug

### Causes identifiées

1. **Erreur de nom de variable**
   - Le hook `usePremiumStatus()` retourne `premiumTier`
   - Le composant utilisait `tier` au lieu de `premiumTier`
   - Résultat : `tier` était `undefined`, causant des erreurs silencieuses

2. **Race condition au premier chargement**
   - Le `useEffect` se déclenchait avant que `usePremiumStatus` ait fini de charger
   - Le composant tentait de charger les profils avec un tier undefined
   - Pas de vérification du state `loading` du hook premium

3. **Chargements multiples non contrôlés**
   - Aucun système pour éviter les chargements en double
   - Le useEffect pouvait se déclencher plusieurs fois

4. **Absence de feedback visuel pendant le chargement premium**
   - L'écran de chargement ne s'affichait que pour `loading` local
   - Ne prenait pas en compte `premiumLoading` du hook

## Solutions implémentées

### 1. Correction du nom de variable

```typescript
// AVANT
const { tier } = usePremiumStatus();

// APRÈS
const { premiumTier, loading: premiumLoading } = usePremiumStatus();
```

### 2. Gestion de la synchronisation du chargement

```typescript
const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

useEffect(() => {
  // Attendre que user.id soit disponible
  // Attendre que premiumLoading soit terminé
  // Ne charger qu'une seule fois
  if (user?.id && !premiumLoading && !hasLoadedOnce) {
    loadProfiles();
    setHasLoadedOnce(true);
  }
}, [user?.id, premiumLoading, hasLoadedOnce]);
```

**Explication** :
- `user?.id` : Vérifie que l'utilisateur est connecté
- `!premiumLoading` : Attend que le statut premium soit chargé
- `!hasLoadedOnce` : Empêche les chargements multiples
- `setHasLoadedOnce(true)` : Marque le premier chargement comme effectué

### 3. Amélioration de l'écran de chargement

```typescript
// AVANT
if (loading) {
  return <LoadingScreen />;
}

// APRÈS
if (loading || premiumLoading) {
  return <LoadingScreen />;
}
```

**Bénéfice** : L'utilisateur voit un écran de chargement pendant que le statut premium se charge.

### 4. Gestion robuste du tier

```typescript
// Dans loadProfiles()
const tier = premiumTier || 'free';
const limit = tier === 'free' || tier === 'gratuit' ? 15 : tier === 'premium' ? 50 : 100;
```

**Bénéfice** : Même si `premiumTier` est undefined, on utilise 'free' par défaut.

### 5. Logs de débogage

Ajout de console.log stratégiques pour tracer :
- Le montage du composant
- Les conditions du useEffect
- Le chargement des profils
- Les résultats de la requête

### 6. Message d'état vide

Ajout d'un message quand aucun profil n'est disponible :

```typescript
{profiles.length === 0 && !loading && (
  <div className="text-center">
    <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4" />
    <p className="text-white/50 text-lg mb-2">
      Aucune étoile visible pour le moment
    </p>
    <p className="text-white/30 text-sm">
      Reviens plus tard pour découvrir de nouveaux profils
    </p>
  </div>
)}
```

## Résultat attendu

### Avant le fix
1. Utilisateur s'inscrit
2. Arrive sur l'onglet "Univers"
3. Écran vide ou blanc
4. Doit naviguer vers un autre onglet puis revenir
5. L'onglet s'affiche enfin correctement

### Après le fix
1. Utilisateur s'inscrit
2. Arrive sur l'onglet "Univers"
3. Écran de chargement s'affiche
4. Les profils se chargent automatiquement
5. L'affichage fonctionne immédiatement

## Scénarios de test

### Scénario 1 : Nouvel utilisateur
1. Créer un nouveau compte
2. Compléter l'onboarding
3. Vérifier que l'onglet "Univers" s'affiche correctement
4. Vérifier que les profils sont chargés

### Scénario 2 : Utilisateur existant
1. Se connecter
2. Naviguer vers l'onglet "Univers"
3. Vérifier que les profils se chargent
4. Vérifier que le nombre correct de profils est affiché selon le tier

### Scénario 3 : Navigation
1. Être sur l'onglet "Univers"
2. Naviguer vers "Astro"
3. Revenir sur "Univers"
4. Vérifier qu'il n'y a pas de rechargement inutile

### Scénario 4 : Base de données vide
1. Être le premier utilisateur de la plateforme
2. Vérifier que le message "Aucune étoile visible" s'affiche
3. Vérifier qu'il n'y a pas d'erreur dans la console

## Vérifications dans la console

Les logs suivants devraient apparaître lors du premier chargement :

```
[UniversSimple] Mount - user.id: <uuid> premiumLoading: false hasLoadedOnce: false
[UniversSimple] Conditions met, loading profiles...
[UniversSimple] Loading profiles for user: <uuid>
[UniversSimple] Current user loaded: <nom>
[UniversSimple] Loading profiles with tier: free limit: 15
[UniversSimple] Loaded 15 profiles
[UniversSimple] Loading complete, profiles: 15
```

## Fichier modifié

- `src/components/UniversSimple.tsx` (85 lignes modifiées)

## Impact sur les performances

- Pas d'impact négatif
- Évite les chargements multiples grâce à `hasLoadedOnce`
- Meilleure gestion des états de chargement
- Expérience utilisateur améliorée

## Notes importantes

1. Le hook `usePremiumStatus` doit être complètement chargé avant de charger les profils
2. Le flag `hasLoadedOnce` empêche les rechargements inutiles lors de la navigation
3. Les console.log peuvent être retirés en production si nécessaire
4. Le message d'état vide améliore l'expérience pour les nouveaux utilisateurs
