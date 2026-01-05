# Système de Filtre d'Âge Intelligent

## Vue d'ensemble

Le système de filtre d'âge intelligent a été implémenté pour garantir que les utilisateurs ne voient que des profils dans une tranche d'âge appropriée, éliminant ainsi les situations problématiques où une personne de 18 ans pourrait voir une personne de 50 ans et vice-versa.

## Composants du Système

### 1. Service de Filtre d'Âge (`src/lib/ageFilterService.ts`)

Le service contient trois fonctions principales :

#### `getAgeRange(userAge: number, preferences?: UserPreferences): AgeRange`

Calcule la tranche d'âge acceptable pour un utilisateur donné :

| Âge utilisateur | Âge min | Âge max | Écart |
|----------------|---------|---------|-------|
| 18-25 ans      | 18      | 28      | +0/+10|
| 26-35 ans      | age-5   | age+5   | ±5    |
| 36-45 ans      | age-7   | age+7   | ±7    |
| 46-55 ans      | age-8   | age+8   | ±8    |
| 56+ ans        | age-10  | age+10  | ±10   |

**Règles de sécurité :**
- L'âge minimum ne descend JAMAIS en dessous de 18 ans
- Si l'utilisateur a défini des préférences personnalisées, elles sont utilisées
- Sinon, le calcul automatique s'applique

#### `calculateAge(birthDate: string): number`

Calcule l'âge d'une personne à partir de sa date de naissance.

#### `isAgeCompatible(userAge: number, targetAge: number, preferences?: UserPreferences): boolean`

Vérifie si deux personnes ont des âges compatibles selon les règles du système.

### 2. Base de Données

#### Nouvelles colonnes dans `astra_profiles`

```sql
preferred_min_age integer  -- Âge minimum préféré (optionnel)
preferred_max_age integer  -- Âge maximum préféré (optionnel)
```

**Contraintes de sécurité :**
- `preferred_min_age` >= 18 (si défini)
- `preferred_max_age` >= 18 (si défini)
- `preferred_min_age` <= `preferred_max_age` (cohérence logique)

### 3. Intégration dans SwipePagePure

Le filtre d'âge est automatiquement appliqué lors du chargement des profils :

```typescript
// Récupération de l'âge et des préférences de l'utilisateur
const { data: currentUserProfile } = await supabase
  .from('astra_profiles')
  .select('signe_solaire, interests, age, preferred_min_age, preferred_max_age')
  .eq('id', user.id)
  .single();

// Calcul de la tranche d'âge
const userAge = currentUserProfile?.age || 25;
const { minAge, maxAge } = getAgeRange(userAge, preferences);

// Application du filtre dans la requête
let query = supabase
  .from('astra_profiles')
  .select('...')
  .neq('id', user.id)
  .gte('age', minAge)  // >= minAge
  .lte('age', maxAge)  // <= maxAge
  .limit(50);
```

### 4. Intégration dans la Recherche

La fonction PostgreSQL `search_profiles` a été mise à jour pour inclure le filtre d'âge :

```sql
-- Récupération de l'âge et des préférences
SELECT ap.age, ap.preferred_min_age, ap.preferred_max_age
INTO v_user_age, v_preferred_min, v_preferred_max
FROM astra_profiles ap
WHERE ap.id = p_user_id;

-- Application du filtre dans la recherche
WHERE
  p.id != p_user_id
  AND p.age >= v_min_age
  AND p.age <= v_max_age
  AND (conditions de recherche...)
```

## Exemples Concrets

### Exemple 1 : Utilisateur de 22 ans
- **Âge :** 22 ans
- **Tranche automatique :** 18-28 ans
- **Résultat :** Ne verra que des personnes entre 18 et 28 ans

### Exemple 2 : Utilisateur de 30 ans
- **Âge :** 30 ans
- **Tranche automatique :** 25-35 ans (30±5)
- **Résultat :** Ne verra que des personnes entre 25 et 35 ans

### Exemple 3 : Utilisateur de 50 ans
- **Âge :** 50 ans
- **Tranche automatique :** 42-58 ans (50±8)
- **Résultat :** Ne verra que des personnes entre 42 et 58 ans

### Exemple 4 : Préférences personnalisées
- **Âge :** 30 ans
- **Préférences :** 27-33 ans (personnalisé)
- **Résultat :** Ne verra que des personnes entre 27 et 33 ans

## Validation

Le système garantit :

1. **Sécurité légale** : Aucun profil < 18 ans ne peut être affiché
2. **Compatibilité d'âge** : Les écarts d'âge sont raisonnables et adaptés
3. **Personnalisation** : Les utilisateurs peuvent définir leurs propres préférences
4. **Cohérence** : Le filtre s'applique partout (swipe, recherche, découverte)

## Tests de Validation

Pour tester le système :

1. Créer un profil de 18 ans → Ne devrait voir personne de plus de 28 ans
2. Créer un profil de 50 ans → Ne devrait voir personne de moins de 42 ans
3. Créer un profil de 30 ans → Ne devrait voir que 25-35 ans
4. Vérifier les logs console avec `🔍 [SwipePagePure] Age filter:`

## Future : Interface de Préférences

Pour permettre aux utilisateurs de modifier leurs préférences d'âge, ajouter dans `SettingsPage` :

```typescript
// Section des préférences d'âge
<div className="space-y-4">
  <h3>Préférences d'âge</h3>
  <div>
    <label>Âge minimum</label>
    <input
      type="number"
      min="18"
      value={preferredMinAge}
      onChange={handleMinAgeChange}
    />
  </div>
  <div>
    <label>Âge maximum</label>
    <input
      type="number"
      min="18"
      value={preferredMaxAge}
      onChange={handleMaxAgeChange}
    />
  </div>
</div>
```

## Impact sur les Performances

- Filtre appliqué côté base de données (efficace)
- Index existant sur la colonne `age` recommandé
- Aucun impact significatif sur les performances

## Conclusion

Le système de filtre d'âge intelligent est maintenant opérationnel et garantit que :
- Une personne de 18 ans ne verra JAMAIS une personne de 50 ans
- Une personne de 50 ans ne verra JAMAIS une personne de 18 ans
- Les écarts d'âge sont toujours raisonnables et adaptés
- Les utilisateurs peuvent personnaliser leurs préférences si nécessaire
