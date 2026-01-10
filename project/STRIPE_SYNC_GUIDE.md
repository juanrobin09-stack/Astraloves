# Guide de Synchronisation Stripe

## Script de Migration des Abonnements

Un script de migration a été créé pour activer automatiquement le statut Premium pour tous les utilisateurs qui ont déjà payé mais dont l'abonnement n'a pas été activé correctement.

### Comment utiliser le script

Le script est déployé en tant qu'Edge Function Supabase : `sync-stripe-subscriptions`

**Option 1 : Appel via curl (recommandé pour l'administrateur)**

```bash
curl -X POST https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/sync-stripe-subscriptions \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json"
```

**Option 2 : Appel depuis le code frontend**

```typescript
const { data, error } = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-stripe-subscriptions`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  }
);

const result = await data.json();
console.log(result);
```

### Ce que fait le script

1. **Récupère tous les profils** ayant un `stripe_customer_id`
2. **Vérifie dans Stripe** si l'utilisateur a un abonnement actif
3. **Active le Premium** si un abonnement actif est trouvé :
   - Met `is_premium: true`
   - Enregistre `subscription_id`
   - Enregistre `current_period_end`
   - Crée l'entrée dans `astra_subscriptions`
4. **Désactive le Premium** si aucun abonnement actif n'est trouvé et que l'utilisateur était marqué Premium

### Résultats

Le script retourne un objet JSON avec :

```json
{
  "success": true,
  "message": "Subscription sync completed",
  "results": {
    "processed": 10,
    "activated": 5,
    "deactivated": 0,
    "errors": []
  }
}
```

- `processed` : nombre total d'utilisateurs traités
- `activated` : nombre d'utilisateurs dont le Premium a été activé
- `deactivated` : nombre d'utilisateurs dont le Premium a été désactivé
- `errors` : liste des erreurs rencontrées

### Sécurité

- Le script nécessite une authentification JWT (token Supabase)
- Il utilise la clé `SUPABASE_SERVICE_ROLE_KEY` pour modifier les profils
- Tous les logs sont enregistrés dans les logs Supabase

### Quand l'utiliser

- Après avoir corrigé le bug du webhook
- Pour synchroniser les utilisateurs existants
- Périodiquement si vous suspectez des désynchronisations

### Note importante

Ce script peut être exécuté plusieurs fois sans problème. Il vérifie toujours l'état actuel dans Stripe avant de modifier la base de données.
