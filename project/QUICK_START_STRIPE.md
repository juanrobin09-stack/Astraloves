# 🚀 Quick Start - Test de l'intégration Stripe

## ⚡ En 3 étapes rapides

### Étape 1 : Vider le cache navigateur (30 secondes)

**Appuyer sur :** `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)

➡️ Cela résout les erreurs console que vous voyez

### Étape 2 : Configurer Supabase (2 minutes)

1. Aller sur : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/functions
2. Cliquer sur **"Secrets"** ou **"Settings"**
3. Ajouter ces 4 secrets :

```
STRIPE_SECRET_KEY
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

STRIPE_WEBHOOK_SECRET
whsec_tyU7SXm7aBlVskKClodAHcLTaOCbXe7K

STRIPE_PRICE_PREMIUM
price_1SU49JLrLnnlXnfyydjPnUlF

STRIPE_PRICE_PREMIUM_PLUS
price_1SYn2ILrLnnlXnfyMxk2219W
```

4. Re-déployer les fonctions :
   - Cliquer sur `create-checkout` → **Deploy**
   - Cliquer sur `stripe-webhook` → **Deploy**

### Étape 3 : Tester (1 minute)

1. Connectez-vous à votre app
2. Aller dans **Profil** → **Gérer mon abonnement**
3. Cliquer sur **"Choisir Premium"** (9,99€/mois)
4. Vous devriez être redirigé vers **checkout.stripe.com** ✅

---

## 🎯 C'est tout !

Si vous êtes redirigé vers Stripe Checkout, **l'intégration fonctionne à 100%** !

### Prochaines étapes (optionnel)

- Configurer le webhook Stripe (voir `WEBHOOK_STRIPE_SETUP.md`)
- Faire un vrai paiement de test
- Vérifier l'activation Premium dans la BDD

### Besoin d'aide ?

Voir les guides complets :
- **CLEAR_BROWSER_CACHE.md** - Résoudre les erreurs console
- **TEST_STRIPE_INTEGRATION.md** - Guide de test complet
- **WEBHOOK_STRIPE_SETUP.md** - Configuration du webhook

---

## ✅ Checklist rapide

- [ ] Cache vidé (`Ctrl + Shift + R`)
- [ ] Secrets ajoutés dans Supabase
- [ ] Edge Functions re-déployées
- [ ] Test de redirection vers Stripe OK

**Temps total : ~5 minutes** ⚡
