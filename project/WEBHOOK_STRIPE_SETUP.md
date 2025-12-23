# Configuration du Webhook Stripe

## 🎯 URL du Webhook à configurer

```
https://vlpyjblasmkugfyfxoia.supabase.co/functions/v1/stripe-webhook
```

## 📋 Étapes de configuration

### 1. Aller sur le Dashboard Stripe

Ouvrir : https://dashboard.stripe.com/webhooks

### 2. Créer un nouveau webhook (ou vérifier l'existant)

- Cliquer sur **"Add endpoint"** ou **"+ Ajouter un endpoint"**
- Coller l'URL : `https://vlpyjblasmkugfyfxoia.supabase.co/functions/v1/stripe-webhook`

### 3. Sélectionner les événements

Cocher ces 4 événements **obligatoires** :

✅ `checkout.session.completed`
✅ `customer.subscription.created`
✅ `customer.subscription.updated`
✅ `customer.subscription.deleted`

### 4. Enregistrer et copier le secret

- Cliquer sur **"Add endpoint"**
- Copier le **"Signing secret"** (commence par `whsec_...`)
- C'est le secret que vous avez déjà dans votre `.env` :
  ```
  whsec_tyU7SXm7aBlVskKClodAHcLTaOCbXe7K
  ```

### 5. Tester le webhook

Option 1 : **Envoyer un événement de test**
- Dans le dashboard du webhook, cliquer sur **"Send test webhook"**
- Sélectionner `checkout.session.completed`
- Cliquer sur **"Send test event"**
- Vérifier que le statut est ✓ (vert)

Option 2 : **Faire un vrai paiement de test**
- Créer un produit à 0,50€ dans Stripe
- Faire un paiement avec la carte de test : `4242 4242 4242 4242`
- Vérifier que le webhook reçoit l'événement

---

## 🔍 Vérification dans Supabase

### Vérifier les logs du webhook

```sql
-- Voir les derniers webhooks reçus
SELECT
  event_id,
  event_type,
  processing_result,
  created_at
FROM stripe_webhook_logs
ORDER BY created_at DESC
LIMIT 10;
```

### Vérifier qu'un utilisateur est passé Premium

```sql
-- Remplacer USER_EMAIL par l'email de test
SELECT
  id,
  email,
  is_premium,
  premium_tier,
  subscription_id,
  current_period_end
FROM astra_profiles
WHERE email = 'USER_EMAIL';
```

---

## 🐛 Dépannage

### Erreur : "Webhook signature verification failed"

**Cause** : Le secret `STRIPE_WEBHOOK_SECRET` est incorrect

**Solution** :
1. Copier le nouveau secret depuis Stripe
2. Le mettre à jour dans Supabase Edge Functions Secrets
3. Re-déployer la fonction `stripe-webhook`

### Erreur : "No user_id in metadata"

**Cause** : La session Stripe n'a pas le `user_id` dans les metadata

**Solution** : Vérifier que `create-checkout` ajoute bien :
```typescript
metadata: {
  user_id: user.id,
  plan: plan,
  tier: tier
}
```

### Le webhook ne reçoit rien

**Causes possibles** :
1. URL incorrecte
2. Edge Function pas déployée
3. Événements pas sélectionnés

**Solution** :
1. Vérifier l'URL : `https://vlpyjblasmkugfyfxoia.supabase.co/functions/v1/stripe-webhook`
2. Re-déployer `stripe-webhook`
3. Vérifier les événements dans Stripe

### L'utilisateur reste en Free après paiement

**Vérifier** :
1. Le webhook a été reçu (logs Stripe)
2. Le webhook a traité l'événement (logs Supabase)
3. La table `astra_profiles` a été mise à jour

**Solution manuelle temporaire** :
```sql
UPDATE astra_profiles
SET
  is_premium = true,
  premium_tier = 'premium',
  subscription_id = 'VOTRE_SUBSCRIPTION_ID_STRIPE'
WHERE id = 'USER_ID';
```

---

## ✅ État actuel de votre configuration

### Clés Stripe (.env local) ✓
- `STRIPE_SECRET_KEY` : ✓ Configuré (sk_live_...)
- `VITE_STRIPE_PUBLIC_KEY` : ✓ Configuré (pk_live_...)
- `STRIPE_WEBHOOK_SECRET` : ✓ Configuré (whsec_...)
- `STRIPE_PRICE_PREMIUM` : ✓ Configuré
- `STRIPE_PRICE_PREMIUM_PLUS` : ✓ Configuré

### À faire
- [ ] Vérifier que les secrets sont dans Supabase Edge Functions
- [ ] Re-déployer les Edge Functions si nécessaire
- [ ] Créer/vérifier le webhook dans Stripe Dashboard
- [ ] Tester avec un paiement

---

## 📊 Flux complet de paiement

```
1. Utilisateur clique "Choisir Premium"
   ↓
2. Appel à create-checkout Edge Function
   Payload: { plan: 'premium', type: 'subscription', userId: '...' }
   ↓
3. create-checkout crée une session Stripe
   Avec metadata: { user_id, plan, tier }
   ↓
4. Redirection vers Stripe Checkout
   URL: checkout.stripe.com/...
   ↓
5. Utilisateur paie avec sa carte
   ↓
6. Stripe envoie webhook: checkout.session.completed
   Vers: vlpyjblasmkugfyfxoia.supabase.co/functions/v1/stripe-webhook
   ↓
7. stripe-webhook traite l'événement
   - Récupère user_id depuis metadata
   - Met à jour astra_profiles (is_premium=true, premium_tier=...)
   - Log dans stripe_webhook_logs
   ↓
8. Utilisateur redirigé vers /payment-success
   ↓
9. Compte Premium activé ! 🎉
```

---

## 🎉 Une fois configuré

Votre système de paiement sera **100% automatique** :
- ✅ Paiements sécurisés par Stripe
- ✅ Activation automatique Premium/Elite
- ✅ Gestion des renouvellements
- ✅ Gestion des annulations
- ✅ Logs complets des webhooks
- ✅ Zéro maintenance nécessaire
