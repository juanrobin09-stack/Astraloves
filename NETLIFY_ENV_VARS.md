# 🔐 Variables d'Environnement Netlify

Liste complète des variables d'environnement nécessaires pour le déploiement sur Netlify.

---

## 📋 Variables Requises (OBLIGATOIRES)

Ces variables **DOIVENT** être configurées dans Netlify pour que l'application fonctionne :

### Supabase

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase | Dashboard Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme (publique) Supabase | Dashboard Supabase → Settings → API → Project API keys → `anon` `public` |

**Exemple :**
```
VITE_SUPABASE_URL = https://qlbqmknafbqwsgjyfykp.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Stripe

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `VITE_STRIPE_PUBLIC_KEY` | Clé publique Stripe (production) | Dashboard Stripe → Developers → API keys → Publishable key (mode Live) |

**Exemple :**
```
VITE_STRIPE_PUBLIC_KEY = pk_live_51AbCdEfGhIjKlMnOpQrStUvWxYz...
```

⚠️ **IMPORTANT** : Utilisez la clé **LIVE** (commence par `pk_live_`) pour la production, pas la clé de test (`pk_test_`) !

### Application

| Variable | Description | Valeur |
|----------|-------------|--------|
| `VITE_APP_URL` | URL de l'application en production | `https://astraloves.com` |
| `NODE_ENV` | Environnement Node.js | `production` |

---

## 📋 Variables Optionnelles

Ces variables sont utilisées par certaines fonctionnalités mais ne sont pas strictement nécessaires :

### Stripe (Price IDs)

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `VITE_STRIPE_PREMIUM_PRICE_ID` | ID du prix Premium (9,99€/mois) | Dashboard Stripe → Products → Premium → Price ID |
| `VITE_STRIPE_ELITE_PRICE_ID` | ID du prix Elite (14,99€/mois) | Dashboard Stripe → Products → Elite → Price ID |

**Exemple :**
```
VITE_STRIPE_PREMIUM_PRICE_ID = price_1AbCdEfGhIjKlMnOpQrStUv
VITE_STRIPE_ELITE_PRICE_ID = price_1XyZaBcDeFgHiJkLmNoPqRs
```

### OpenAI (Optionnel)

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `VITE_OPENAI_API_KEY` | Clé API OpenAI (si utilisé) | https://platform.openai.com/api-keys |

⚠️ **Note** : Cette variable est utilisée pour certaines fonctionnalités IA mais peut ne pas être nécessaire si vous utilisez uniquement Supabase Edge Functions.

---

## 🔧 Comment Configurer dans Netlify

### Étape 1 : Accéder aux Variables d'Environnement

1. Allez sur **https://app.netlify.com**
2. Sélectionnez votre site
3. Allez dans **Site settings** → **Environment variables**
4. Cliquez sur **"Add a variable"**

### Étape 2 : Ajouter Chaque Variable

Pour chaque variable, ajoutez :
- **Key** : Le nom de la variable (ex: `VITE_SUPABASE_URL`)
- **Value** : La valeur de la variable
- **Scopes** : Sélectionnez **"All scopes"** (ou spécifiez Production/Deploy previews)

### Étape 3 : Sauvegarder

Cliquez sur **"Save"** après avoir ajouté toutes les variables.

### Étape 4 : Redéployer

⚠️ **IMPORTANT** : Après avoir ajouté/modifié des variables, vous devez **redéployer** le site pour que les changements prennent effet.

1. Allez dans **Deploys**
2. Cliquez sur **"Trigger deploy"** → **"Deploy site"**

---

## ✅ Checklist des Variables

Avant de déployer, vérifiez que vous avez configuré :

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_STRIPE_PUBLIC_KEY`
- [ ] `VITE_APP_URL` = `https://astraloves.com`
- [ ] `NODE_ENV` = `production`
- [ ] `VITE_STRIPE_PREMIUM_PRICE_ID` (optionnel)
- [ ] `VITE_STRIPE_ELITE_PRICE_ID` (optionnel)
- [ ] `VITE_OPENAI_API_KEY` (optionnel)

---

## 🔍 Où Trouver les Clés

### Supabase

1. Allez sur **https://app.supabase.com**
2. Sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Copiez :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys** → `anon` `public` → `VITE_SUPABASE_ANON_KEY`

📖 **Documentation** : https://supabase.com/docs/guides/getting-started/tutorials/with-react

### Stripe

1. Allez sur **https://dashboard.stripe.com**
2. Assurez-vous d'être en mode **Live** (pas Test)
3. Allez dans **Developers** → **API keys**
4. Copiez la **Publishable key** → `VITE_STRIPE_PUBLIC_KEY`

Pour les Price IDs :
1. Allez dans **Products**
2. Cliquez sur votre produit (Premium ou Elite)
3. Copiez le **Price ID** (commence par `price_`)

📖 **Documentation** : https://stripe.com/docs/keys

---

## 🆘 Dépannage

### Erreur : "Missing Supabase environment variables"

**Solution** : Vérifiez que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont bien configurées dans Netlify.

### Erreur : "Invalid API Key" (Stripe)

**Solution** : 
- Vérifiez que vous utilisez la clé **LIVE** (`pk_live_...`) et non la clé de test
- Vérifiez que vous êtes en mode **Live** dans Stripe Dashboard
- Vérifiez que la clé est correctement copiée (sans espaces)

### Les variables ne sont pas prises en compte

**Solution** :
1. Vérifiez que les variables commencent par `VITE_` (pour Vite)
2. Redéployez le site après avoir ajouté les variables
3. Vérifiez que vous avez sélectionné le bon scope (Production/Deploy previews)

---

## 📚 Ressources

- **Supabase Docs** : https://supabase.com/docs
- **Stripe Docs** : https://stripe.com/docs
- **Netlify Environment Variables** : https://docs.netlify.com/environment-variables/overview/
- **Vite Environment Variables** : https://vitejs.dev/guide/env-and-mode.html

---

**Dernière mise à jour** : Décembre 2024

