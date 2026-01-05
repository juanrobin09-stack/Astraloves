# Test de l'intégration Stripe

## ✅ Vos clés sont déjà configurées !

J'ai vérifié votre fichier `.env` et toutes les clés Stripe LIVE sont présentes :

```
✓ STRIPE_SECRET_KEY (sk_live_...)
✓ VITE_STRIPE_PUBLIC_KEY (pk_live_...)
✓ STRIPE_WEBHOOK_SECRET (whsec_...)
✓ STRIPE_PRICE_PREMIUM (price_1SU49J...)
✓ STRIPE_PRICE_PREMIUM_PLUS (price_1SYn2I...)
```

## 🔧 Configuration Supabase Edge Functions

### Étape 1 : Vérifier les secrets dans Supabase

1. Aller sur : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia
2. Menu de gauche : **Edge Functions**
3. Cliquer sur l'onglet **Secrets** ou **Settings**
4. Vérifier que ces 4 secrets existent :
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_PREMIUM`
   - `STRIPE_PRICE_PREMIUM_PLUS`

### Étape 2 : Ajouter les secrets (si manquants)

Si les secrets n'existent pas, cliquer sur **"Add secret"** et ajouter un par un :

#### Secret 1
```
Name: STRIPE_SECRET_KEY
Value: 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
```

#### Secret 2
```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_tyU7SXm7aBlVskKClodAHcLTaOCbXe7K
```

#### Secret 3
```
Name: STRIPE_PRICE_PREMIUM
Value: price_1SU49JLrLnnlXnfyydjPnUlF
```

#### Secret 4
```
Name: STRIPE_PRICE_PREMIUM_PLUS
Value: price_1SYn2ILrLnnlXnfyMxk2219W
```

### Étape 3 : Re-déployer les Edge Functions

**⚠️ IMPORTANT** : Les secrets ne sont disponibles qu'après un nouveau déploiement !

Aller dans **Edge Functions** et re-déployer :
1. `create-checkout` → Cliquer sur **Deploy**
2. `stripe-webhook` → Cliquer sur **Deploy**

---

## 🧪 Test de l'intégration

### Test 1 : Vérifier que les Edge Functions fonctionnent

1. Dans votre application, connectez-vous avec un compte
2. Aller dans **Profil** → **Gérer mon abonnement**
3. Cliquer sur **"Choisir Premium"** (9,99€/mois)
4. Vous devriez être redirigé vers la page de paiement Stripe

### Test 2 : Faire un vrai paiement de test

**Option A : Utiliser une vraie carte (recommandé pour tester)**
- Utiliser votre carte bancaire
- Le paiement sera réel (9,99€ ou 14,99€)
- Vous pourrez l'annuler immédiatement après dans Stripe

**Option B : Créer des produits de test**
- Créer des prix de test à 0,50€ dans Stripe
- Remplacer temporairement les Price IDs
- Faire un paiement de test

### Test 3 : Vérifier l'activation Premium

Après le paiement :
1. Vous devriez être redirigé vers `/payment-success`
2. Votre compte devrait passer en Premium
3. Vérifier dans Supabase :
   ```sql
   SELECT id, email, is_premium, premium_tier, subscription_id
   FROM astra_profiles
   WHERE id = 'VOTRE_USER_ID';
   ```
4. Le champ `is_premium` devrait être `true`
5. Le champ `premium_tier` devrait être `premium` ou `premium_elite`

---

## 🔍 Débogage

### Si la redirection vers Stripe ne fonctionne pas

1. **Ouvrir la console du navigateur** (F12)
2. Regarder les erreurs dans l'onglet **Console**
3. Regarder les requêtes dans l'onglet **Network**

**Erreurs possibles :**

#### Erreur : "Price ID not configured"
→ Les secrets ne sont pas configurés dans Supabase Edge Functions
→ Solution : Suivre l'Étape 2 ci-dessus

#### Erreur : "Stripe not configured"
→ `STRIPE_SECRET_KEY` est manquant
→ Solution : Ajouter le secret et re-déployer

#### Erreur : "Unauthorized"
→ L'utilisateur n'est pas connecté
→ Solution : Se reconnecter

### Si le webhook ne fonctionne pas

1. Aller sur Stripe Dashboard : https://dashboard.stripe.com/webhooks
2. Vérifier que le webhook existe avec l'URL :
   ```
   https://vlpyjblasmkugfyfxoia.supabase.co/functions/v1/stripe-webhook
   ```
3. Vérifier les événements dans les logs Stripe
4. Vérifier les logs dans Supabase :
   ```sql
   SELECT * FROM stripe_webhook_logs
   ORDER BY created_at DESC
   LIMIT 10;
   ```

### Si l'abonnement ne s'active pas

1. Vérifier que le webhook a été reçu :
   ```sql
   SELECT * FROM stripe_webhook_logs
   WHERE event_type = 'checkout.session.completed'
   ORDER BY created_at DESC
   LIMIT 5;
   ```

2. Regarder le champ `processing_result` pour voir les erreurs

3. Vérifier manuellement dans la table :
   ```sql
   UPDATE astra_profiles
   SET is_premium = true,
       premium_tier = 'premium'
   WHERE id = 'VOTRE_USER_ID';
   ```

---

## 📊 URLs importantes

### Frontend
- Page d'abonnement : `https://votre-app.com/premium`
- Page de succès : `https://votre-app.com/payment-success`

### Edge Functions
- Create Checkout : `https://vlpyjblasmkugfyfxoia.supabase.co/functions/v1/create-checkout`
- Webhook : `https://vlpyjblasmkugfyfxoia.supabase.co/functions/v1/stripe-webhook`

### Stripe Dashboard
- Webhooks : https://dashboard.stripe.com/webhooks
- Paiements : https://dashboard.stripe.com/payments
- Abonnements : https://dashboard.stripe.com/subscriptions
- Produits : https://dashboard.stripe.com/products

---

## ✅ Checklist finale

- [ ] Secrets configurés dans Supabase Edge Functions
- [ ] Edge Functions re-déployées (create-checkout + stripe-webhook)
- [ ] Webhook Stripe configuré avec la bonne URL
- [ ] Test de redirection vers Stripe Checkout
- [ ] Test de paiement (réel ou test)
- [ ] Vérification de l'activation Premium dans la BDD
- [ ] Vérification des logs webhook dans Stripe
- [ ] Vérification des logs webhook dans Supabase

Une fois tous les points cochés, votre intégration Stripe est **100% fonctionnelle en production** ! 🎉
