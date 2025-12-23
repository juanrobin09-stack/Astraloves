# Configuration Stripe en Production

## ✅ L'intégration Stripe est déjà complète !

L'application utilise **Supabase Edge Functions** pour gérer les paiements Stripe de manière sécurisée.

---

## 🔑 ÉTAPE 1 : Récupérer vos clés Stripe

### 1. Créer un compte Stripe
- Aller sur https://dashboard.stripe.com/register
- Créer votre compte
- **Activer le mode LIVE** (pas Test)

### 2. Récupérer vos clés API
- Aller dans **Développeurs** → **Clés API**
- Copier :
  - **Clé publique** : commence par `pk_live_...`
  - **Clé secrète** : commence par `sk_live_...`

### 3. Créer vos produits dans Stripe

#### Produit 1 : Premium (9,99€/mois)
1. Aller dans **Produits** → **Créer un produit**
2. Nom : **Astra Premium**
3. Prix : **9,99 EUR** par mois
4. Type : **Abonnement récurrent**
5. Copier le **Price ID** : commence par `price_...`

#### Produit 2 : Premium+ Elite (14,99€/mois)
1. Créer un nouveau produit
2. Nom : **Astra Premium+ Elite**
3. Prix : **14,99 EUR** par mois
4. Type : **Abonnement récurrent**
5. Copier le **Price ID** : commence par `price_...`

---

## 🔧 ÉTAPE 2 : Configurer les variables d'environnement

### Dans Supabase

1. Aller sur votre projet Supabase
2. Aller dans **Edge Functions** → **Settings** → **Secrets**
3. Ajouter ces secrets :

```bash
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET (voir étape 3)
STRIPE_PRICE_PREMIUM=price_VOTRE_ID_PREMIUM
STRIPE_PRICE_PREMIUM_PLUS=price_VOTRE_ID_ELITE
```

### Dans votre .env local (pour le frontend)

```bash
VITE_STRIPE_PUBLIC_KEY=pk_live_VOTRE_CLE_PUBLIQUE
```

---

## 🪝 ÉTAPE 3 : Configurer le Webhook Stripe

### 1. Créer le webhook dans Stripe
- Aller dans **Développeurs** → **Webhooks** → **Ajouter un endpoint**

### 2. URL du webhook
```
https://VOTRE_PROJET_ID.supabase.co/functions/v1/stripe-webhook
```
Remplacez `VOTRE_PROJET_ID` par votre ID de projet Supabase

### 3. Événements à écouter
Sélectionner ces événements :
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

### 4. Copier le secret de signature
- Après création, copier le **secret de signature** (`whsec_...`)
- L'ajouter dans les secrets Supabase : `STRIPE_WEBHOOK_SECRET`

---

## 📋 ÉTAPE 4 : Déployer les Edge Functions

Les fonctions sont déjà créées dans `supabase/functions/` :

### Fonction 1 : create-checkout
Crée une session de paiement Stripe

### Fonction 2 : stripe-webhook
Reçoit les événements Stripe et met à jour la base de données

### Déploiement
```bash
# Si vous avez Supabase CLI installé
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

**OU** utiliser l'interface Supabase :
1. Aller dans **Edge Functions**
2. Les fonctions apparaissent automatiquement
3. Cliquer sur **Deploy** pour chaque fonction

---

## ✅ ÉTAPE 5 : Tester

### Test en mode Test d'abord (recommandé)
1. Utiliser les clés de test : `pk_test_...` et `sk_test_...`
2. Créer des produits de test dans Stripe
3. Utiliser la carte de test : `4242 4242 4242 4242`
4. Vérifier que tout fonctionne

### Passer en production
1. Remplacer toutes les clés test par les clés live
2. Mettre à jour les Price IDs avec les vrais produits
3. Vérifier le webhook en production

---

## 🎯 Comment ça marche ?

### Flux de paiement

1. **Utilisateur clique sur "Passer à Premium"**
   → Appel à `/functions/v1/create-checkout`

2. **Edge Function crée une session Stripe**
   → Redirige l'utilisateur vers Stripe Checkout

3. **Utilisateur paie sur Stripe**
   → Stripe envoie un webhook à `/functions/v1/stripe-webhook`

4. **Webhook met à jour la base de données**
   → `astra_profiles.is_premium = true`
   → `astra_profiles.premium_tier = 'premium'` ou `'premium_elite'`

5. **Utilisateur revient sur l'app**
   → Redirection vers `/payment-success`
   → Son compte est maintenant Premium !

---

## 🔍 Vérification

### Dans Supabase
Vérifier que la table `astra_profiles` a ces colonnes :
- ✅ `is_premium` (boolean)
- ✅ `premium_tier` (text)
- ✅ `stripe_customer_id` (text)
- ✅ `subscription_id` (text)
- ✅ `current_period_end` (timestamp)

### Dans Stripe
Vérifier que les webhooks reçoivent bien les événements :
- Aller dans **Développeurs** → **Webhooks** → **Votre webhook**
- Vérifier les logs d'événements

---

## 🐛 Dépannage

### Erreur "Price ID not configured"
→ Vérifier que `STRIPE_PRICE_PREMIUM` et `STRIPE_PRICE_PREMIUM_PLUS` sont bien configurés dans les secrets Supabase

### Erreur "Stripe not configured"
→ Vérifier que `STRIPE_SECRET_KEY` est bien configuré dans les secrets Supabase

### Le webhook ne reçoit rien
→ Vérifier l'URL du webhook dans Stripe
→ Vérifier que les Edge Functions sont bien déployées
→ Vérifier que `STRIPE_WEBHOOK_SECRET` est correct

### Le profil ne passe pas en Premium
→ Vérifier les logs dans Supabase : **Edge Functions** → **Logs**
→ Vérifier la table `stripe_webhook_logs` pour voir les erreurs

---

## 📊 URLs importantes

### Frontend (votre app)
- Page d'abonnement : `/premium-plans`
- Page de succès : `/payment-success`
- Page d'annulation : `/premium`

### Backend (Edge Functions)
- Create checkout : `https://VOTRE_ID.supabase.co/functions/v1/create-checkout`
- Webhook : `https://VOTRE_ID.supabase.co/functions/v1/stripe-webhook`

---

## 🎉 C'est prêt !

Une fois configuré, les utilisateurs peuvent :
- ✅ S'abonner à Premium (9,99€/mois)
- ✅ S'abonner à Elite (14,99€/mois)
- ✅ Payer par carte bancaire
- ✅ Gérer leur abonnement dans Stripe Customer Portal
- ✅ Annuler à tout moment

Les limites et fonctionnalités sont automatiquement appliquées selon le plan !
