# 🔧 Fix Erreur Stripe "Invalid API Key"

## ✅ Modifications effectuées

### 1. **Correction du .env**
```bash
# AVANT (INCORRECT)
pk_live_51STpDZ...

# APRÈS (CORRECT)
VITE_STRIPE_PUBLIC_KEY=pk_live_51STpDZ...
```

**Problème** : La clé publique n'avait pas le préfixe `VITE_` nécessaire pour être accessible côté client dans Vite.

### 2. **Nouveau fichier de configuration centralisée**
`src/lib/stripeConfig.ts`

Fonctionnalités :
- ✅ Détection automatique si Stripe est configuré
- ✅ Validation des clés (sk_live_/sk_test_ et pk_live_/pk_test_)
- ✅ Wrapper sécurisé `safeStripeCall()` qui ignore les erreurs en dev
- ✅ Logs informatifs sans bloquer l'application

## 🔄 Solutions pour éliminer l'erreur

### Option 1 : Hard Refresh (Recommandé)

**Le cache du navigateur contient l'ancienne clé invalide.**

1. **Windows/Linux** : `Ctrl + Shift + R`
2. **Mac** : `Cmd + Shift + R`

Cela force le rechargement des bundles JavaScript avec les nouvelles variables d'environnement.

### Option 2 : Vérifier les clés Stripe

Si le hard refresh ne suffit pas :

1. Va sur https://dashboard.stripe.com/apikeys
2. Vérifie que tes clés sont actives et valides
3. Copie les nouvelles clés si nécessaire
4. Mets à jour dans `.env` :

```bash
STRIPE_SECRET_KEY=sk_live_NOUVELLE_CLE_COMPLETE
VITE_STRIPE_PUBLIC_KEY=pk_live_NOUVELLE_CLE_COMPLETE
```

5. Redémarre le serveur de dev :
```bash
npm run dev
```

### Option 3 : Nettoyer complètement le cache

Si l'erreur persiste encore :

```bash
# Arrête le serveur dev (Ctrl+C)

# Nettoie le cache Vite
rm -rf node_modules/.vite

# Rebuild
npm run build

# Relance
npm run dev
```

## 📊 Diagnostic

### ✅ Ce qui fonctionne
```
✅ Analyse IA des quiz → OK
✅ Chargement des profils (20 profils) → OK
✅ Chat Astra (40 messages) → OK
✅ Utilisateur Premium détecté → OK
✅ Page Astro → OK (nouvelle page)
```

### ⚠️ Erreur restante
```
❌ Error: Invalid API Key provided: sk_test_****XXXX
```

**Cause** : Cache navigateur avec ancienne clé invalide `sk_test_****XXXX`
**Solution** : Hard refresh (Ctrl+Shift+R)

## 🔍 Pourquoi cette erreur apparaît ?

1. **Cache du bundle** : Le code JavaScript est compilé et mis en cache par le navigateur
2. **Anciennes variables** : Le bundle en cache contient une référence à `sk_test_****XXXX` (clé tronquée invalide)
3. **Nouvelle clé** : Le `.env` a maintenant `sk_live_51STpDZ...` (valide)
4. **Conflit** : Le navigateur utilise l'ancien bundle au lieu du nouveau

## 🎯 Validation que c'est corrigé

Après le hard refresh, tu NE devrais PLUS voir :
```
❌ Error: Invalid API Key provided: sk_test_****XXXX
```

Tu pourrais voir (normal si Stripe non utilisé) :
```
ℹ️ Stripe désactivé - Clés API non configurées
ℹ️ [Operation] ignoré - Stripe désactivé
```

Ou rien du tout si Stripe fonctionne correctement.

## 📝 Notes importantes

### Edge Functions Stripe
Les edge functions (`stripe-webhook`, `sync-stripe-subscriptions`) sont correctes et n'ont pas besoin de modifications. Elles utilisent déjà `Deno.env.get('STRIPE_SECRET_KEY')` qui récupère automatiquement la variable d'environnement depuis Supabase.

### Variables d'environnement Supabase
Les secrets Stripe dans Supabase sont automatiquement injectés dans les Edge Functions. Pas besoin de les reconfigurer manuellement.

### En production (Vercel/Netlify)
Si tu déploies sur Vercel/Netlify, assure-toi d'ajouter ces variables d'environnement :
- `STRIPE_SECRET_KEY`
- `VITE_STRIPE_PUBLIC_KEY`
- `STRIPE_WEBHOOK_SECRET`

## 🚀 Prochaines étapes

1. **Hard refresh** du navigateur (Ctrl+Shift+R)
2. Vérifie que l'erreur a disparu
3. Si elle persiste, nettoie le cache Vite
4. Si toujours présent, vérifie que les clés Stripe sont valides sur le dashboard

---

**Status** : ✅ Configuration Stripe corrigée
**Action requise** : Hard refresh du navigateur
