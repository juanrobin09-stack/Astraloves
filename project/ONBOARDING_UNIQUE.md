# ✅ Questionnaire d'onboarding unique

## Ce qui a été mis en place

### 1. Bouton Retour amélioré
- **Visible et clair** : Bouton "← Retour" avec texte
- **Fonctionnel** : Permet de revenir à l'étape précédente
- **Design moderne** : Fond semi-transparent avec bordure blanche
- **Efface les erreurs** : Quand on revient en arrière, les messages d'erreur disparaissent

### 2. Questionnaire unique à l'inscription
Le système garantit que le questionnaire d'onboarding ne s'affiche **qu'une seule fois** :

#### Dans `OnboardingPageNew.tsx` (lignes 77-95)
```typescript
useEffect(() => {
  const checkExistingProfile = async () => {
    if (!user?.id) return;

    const { data: profile } = await supabase
      .from('astra_profiles')
      .select('first_name, onboarding_completed')
      .eq('id', user.id)
      .maybeSingle();

    // Si l'onboarding est déjà complété, on redirige immédiatement
    if (profile?.onboarding_completed && profile?.first_name) {
      console.log('⚠️ Onboarding déjà complété, redirection...');
      onComplete();
      return;
    }
  };

  checkExistingProfile();
}, [user, onComplete]);
```

#### Dans `App.tsx` (lignes 358-364)
```typescript
// Si pas d'onboarding complété -> on force l'onboarding
if (!profile?.onboarding_completed || !profile?.first_name) {
  if (page !== 'onboarding') {
    setPage('onboarding');
  }
// Si onboarding complété ET sur page login/signup -> on redirige vers l'app
} else if (page === 'landing' || page === 'signup' || page === 'login') {
  setPage('univers');
}
```

### 3. Marqueur de complétion
Quand l'utilisateur termine l'onboarding (ligne 188) :
```typescript
updateData.onboarding_completed = true
```

Cette valeur est enregistrée dans la base de données et **ne change jamais** après.

## Comment ça marche

### Premier usage (inscription)
1. L'utilisateur s'inscrit
2. Il arrive sur l'onboarding
3. Il complète les 11 étapes
4. La colonne `onboarding_completed` passe à `true`
5. Il est redirigé vers la page Univers

### Connexion suivante
1. L'utilisateur se connecte
2. Le système vérifie `onboarding_completed`
3. C'est `true` → redirection directe vers Univers
4. **Le questionnaire ne s'affiche plus jamais**

### Si l'utilisateur essaie d'accéder à l'onboarding
Si quelqu'un ayant déjà complété l'onboarding tente d'y accéder :
- Le `useEffect` détecte que `onboarding_completed === true`
- Il appelle `onComplete()` immédiatement
- L'utilisateur est redirigé vers l'application

## Garanties

✅ Le questionnaire ne s'affiche **qu'une seule fois**
✅ Un bouton retour permet de modifier les réponses **pendant** l'onboarding
✅ Une fois terminé, impossible de revenir au questionnaire
✅ Les utilisateurs déjà enregistrés ne voient jamais le questionnaire
