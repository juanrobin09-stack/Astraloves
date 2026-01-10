# 🚀 ASTRALOVES - INSTRUCTIONS FINALES

## PHASE 6 - DÉPLOIEMENT COMPLET

---

# 📦 FICHIERS LIVRÉS

Vous avez reçu **2 ZIP distincts** :

1. **ASTRALOVES-FRONT-COMPLET.zip** (~51K) - Projet React/TypeScript complet
2. **ASTRALOVES-SQL-SUPABASE.zip** (~4K) - Schema database SQL

---

# ⚡ INSTALLATION EN 5 MINUTES

## ÉTAPE 1 : Extraire le projet

```bash
unzip ASTRALOVES-FRONT-COMPLET.zip
cd astraloves-final
```

## ÉTAPE 2 : Installer les dépendances

```bash
npm install
```

**⏱ Durée : ~2 minutes**

## ÉTAPE 3 : Setup Supabase

### A. Créer le projet Supabase

1. Aller sur **https://supabase.com**
2. Cliquer **New Project**
3. Remplir :
   - Name: `astraloves`
   - Database Password: (choisir un mot de passe fort)
   - Region: (choisir la plus proche)
4. Cliquer **Create new project**
5. Attendre ~2 minutes que le projet soit prêt

### B. Exécuter le schema SQL

1. Dans le projet Supabase, aller dans **SQL Editor**
2. Cliquer **New query**
3. Extraire `ASTRALOVES-SQL-SUPABASE.zip`
4. Ouvrir `supabase-schema.sql` dans un éditeur de texte
5. **Copier TOUT le contenu** du fichier
6. **Coller** dans SQL Editor de Supabase
7. Cliquer **Run** (ou CMD+Enter / CTRL+Enter)
8. Vérifier que tout s'exécute sans erreur ✅

**✅ 13 tables créées + RLS + Triggers + Storage**

### C. Récupérer les clés API

1. Dans Supabase, aller dans **Settings** > **API**
2. Copier :
   - **Project URL** (ex: `https://xxx.supabase.co`)
   - **anon public key** (commence par `eyJ...`)

## ÉTAPE 4 : Configurer l'environnement

Dans le dossier `astraloves-final/`, créer un fichier `.env.local` :

```env
# Supabase (OBLIGATOIRE)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# OpenAI (OBLIGATOIRE pour ASTRA)
VITE_OPENAI_API_KEY=sk-...

# Stripe (OPTIONNEL pour démarrer)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App URL
VITE_APP_URL=http://localhost:3000
```

### Obtenir clé OpenAI

1. Aller sur **https://platform.openai.com/api-keys**
2. Créer une nouvelle clé API
3. Copier la clé (commence par `sk-`)
4. **⚠️ Important** : Ajouter des crédits sur votre compte OpenAI

### Obtenir clé Stripe (optionnel)

1. Aller sur **https://dashboard.stripe.com/test/apikeys**
2. Copier **Publishable key** (commence par `pk_test_`)
3. Pour l'instant, le mode test suffit

## ÉTAPE 5 : Lancer l'application

```bash
npm run dev
```

**🎉 Application accessible sur http://localhost:3000**

---

# ✅ VÉRIFICATIONS POST-INSTALLATION

## 1. Tester la base de données

Dans Supabase **SQL Editor**, exécuter :

```sql
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM subscriptions;
SELECT COUNT(*) FROM quotas;
```

**Résultat attendu** : 0 lignes (tables vides mais existantes)

## 2. Tester l'authentification

1. Ouvrir http://localhost:3000
2. Vous devriez voir la page **Login**
3. Cliquer **Sign up** (si implémenté) ou utiliser Supabase Dashboard pour créer un user test

### Créer un user test via Dashboard

1. Dans Supabase, aller dans **Authentication** > **Users**
2. Cliquer **Add user** > **Create new user**
3. Email : `test@astraloves.app`
4. Password : `Test123456!`
5. Cliquer **Create user**

Ensuite dans l'app :
- Email : `test@astraloves.app`
- Password : `Test123456!`
- Cliquer **Se connecter**

**✅ Vous devriez être redirigé vers /onboarding ou /univers**

## 3. Vérifier ASTRA (OpenAI)

Si l'API key OpenAI est configurée :
1. Aller sur `/astra` dans l'app
2. Envoyer un message test
3. ASTRA devrait répondre (peut prendre 2-5 secondes)

---

# 🔧 CONFIGURATION AVANCÉE

## Stripe - Créer les produits

Si vous voulez activer les paiements :

1. Aller sur **https://dashboard.stripe.com/test/products**
2. Créer **4 produits** :

### Premium Monthly
- Name: `ASTRA Premium`
- Price: `9,99 EUR` / `recurring` / `monthly`
- Copier le **Price ID** (ex: `price_xxx`)

### Premium Yearly
- Name: `ASTRA Premium (Annuel)`
- Price: `99,90 EUR` / `recurring` / `yearly`
- Copier le **Price ID**

### Elite Monthly
- Name: `ASTRA Elite`
- Price: `14,99 EUR` / `recurring` / `monthly`
- Copier le **Price ID**

### Elite Yearly
- Name: `ASTRA Elite (Annuel)`
- Price: `149,90 EUR` / `recurring` / `yearly`
- Copier le **Price ID**

3. Dans `src/config/stripe.ts`, remplacer :

```typescript
export const STRIPE_PRICES = {
  premium_monthly: 'price_xxx',  // ← Remplacer
  premium_yearly: 'price_yyy',
  elite_monthly: 'price_zzz',
  elite_yearly: 'price_www',
} as const;
```

## Webhooks Stripe (pour production)

1. Dans Stripe Dashboard, aller dans **Developers** > **Webhooks**
2. Cliquer **Add endpoint**
3. URL : `https://votre-app.com/api/stripe/webhook`
4. Events à écouter :
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

---

# 🚢 DÉPLOIEMENT PRODUCTION

## Option 1 : Netlify (Recommandé)

```bash
# 1. Connecter le repo GitHub
# Sur Netlify : New site > Import from Git > GitHub

# 2. Build settings
# Build command: npm run build
# Publish directory: dist

# 3. Environment variables
# Ajouter toutes les variables de .env.local
```

## Option 2 : Vercel

```bash
npm i -g vercel
vercel

# Suivre les instructions
# Ajouter les env variables dans Vercel Dashboard
```

## Variables d'environnement PRODUCTION

⚠️ **Ne jamais committer `.env.local`** ⚠️

Pour la production, configurer les variables dans :
- **Netlify** : Site settings > Environment variables
- **Vercel** : Project settings > Environment Variables

**Variables obligatoires** :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OPENAI_API_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_APP_URL` (URL de production)

---

# 📁 STRUCTURE DU PROJET

```
astraloves-final/
├─ src/
│  ├─ config/              # Configuration Supabase, OpenAI, Stripe
│  ├─ types/               # Types TypeScript
│  ├─ utils/               # Utilitaires (constants, helpers)
│  ├─ services/            # Logique métier
│  │  ├─ auth/             # Authentification
│  │  ├─ astra/            # Service ASTRA (OpenAI)
│  │  ├─ astro/            # Calculs astrologiques
│  │  ├─ matching/         # Matching & compatibilité
│  │  ├─ messaging/        # Messages (à compléter)
│  │  ├─ subscription/     # Abonnements (à compléter)
│  │  └─ storage/          # Upload photos (à compléter)
│  ├─ hooks/               # Hooks React customs
│  ├─ store/               # State management (Zustand)
│  ├─ components/          # Composants React
│  │  ├─ layout/           # Layout (sidebar, tabbar)
│  │  ├─ ui/               # Design system (Button, Card)
│  │  ├─ common/           # Composants communs (à compléter)
│  │  ├─ univers/          # Page Univers (à compléter)
│  │  ├─ messages/         # Page Messages (à compléter)
│  │  ├─ astra/            # Page ASTRA (à compléter)
│  │  ├─ astro/            # Page Astro (à compléter)
│  │  ├─ profile/          # Page Profil (à compléter)
│  │  ├─ subscription/     # Page Subscription (à compléter)
│  │  └─ onboarding/       # Page Onboarding (à compléter)
│  └─ pages/               # Pages principales
├─ public/                 # Assets statiques
├─ supabase-schema.sql     # Schema database
├─ package.json
├─ vite.config.ts
├─ tailwind.config.js
└─ README.md
```

---

# ✅ CE QUI EST FAIT

## Core ✅
- [x] Setup Vite + React + TypeScript
- [x] Configuration Supabase
- [x] Configuration OpenAI
- [x] Configuration Stripe
- [x] Routing (React Router)
- [x] State management (Zustand)
- [x] Design system (Tailwind)
- [x] Authentification (login/logout)

## Database ✅
- [x] 13 tables créées
- [x] RLS activé partout
- [x] Triggers (auto-create profile, quotas)
- [x] Storage bucket (avatars)
- [x] Indexes optimisés

## Services ✅
- [x] authService (login, signup, profile)
- [x] astraService (intégration OpenAI)
- [x] astroCalculatorService (calculs thème natal)
- [x] synastrieService (compatibilité)
- [x] matchingService (matching + synastrie)

## Composants ✅
- [x] Layout (MainLayout, Sidebar, TabBar)
- [x] UI components (Button, Card)
- [x] Pages structure (toutes créées)

## Hooks ✅
- [x] useAuth
- [x] useSubscription

---

# ⚠️ À COMPLÉTER

Les éléments suivants ont leur **structure** mais nécessitent **implémentation complète** :

## Pages principales
- [ ] **UniversPage** - Constellation view (Canvas/SVG)
- [ ] **AstraPage** - Interface chat complète
- [ ] **AstroPage** - Roue astrologique interactive
- [ ] **ProfilePage** - Upload photos + édition
- [ ] **MessagesPage** - Chat temps réel
- [ ] **SubscriptionPage** - Pricing cards + Stripe checkout
- [ ] **OnboardingPage** - Flow complet

## Services
- [ ] **messagingService** - CRUD messages
- [ ] **subscriptionService** - Gestion abonnements Stripe
- [ ] **photoService** - Upload/modération photos
- [ ] **guardianService** - Détection patterns (Elite)

## Composants business
- [ ] Tous les composants dans `components/[page]/`

**💡 Conseil** : Commencer par **Univers** et **ASTRA Chat** (features différenciantes).

---

# 🐛 TROUBLESHOOTING

## Erreur "Missing env variables"

**Solution** : Vérifier que `.env.local` existe et contient toutes les clés

## Erreur SQL "relation does not exist"

**Solution** : Réexécuter `supabase-schema.sql` dans SQL Editor

## OpenAI API Error 401

**Solution** : 
1. Vérifier que la clé API est correcte
2. Vérifier que vous avez des crédits OpenAI

## Build errors TypeScript

**Solution** : 
```bash
rm -rf node_modules package-lock.json
npm install --force
```

## L'app ne démarre pas

**Solution** :
```bash
npm run dev -- --host
```

---

# 📚 RESSOURCES

- **Supabase Docs** : https://supabase.com/docs
- **OpenAI API** : https://platform.openai.com/docs
- **Stripe Docs** : https://stripe.com/docs
- **React Router** : https://reactrouter.com
- **Zustand** : https://zustand-demo.pmnd.rs
- **Tailwind** : https://tailwindcss.com
- **Framer Motion** : https://www.framer.com/motion

---

# 🎯 ROADMAP SUGGÉRÉE

## Semaine 1 : MVP Core
1. Compléter OnboardingPage (form birth data)
2. Compléter ProfilePage (upload photos)
3. Compléter AstraPage (chat interface)
4. Tester le flow complet

## Semaine 2 : Features principales
1. Compléter UniversPage (constellation view)
2. Compléter AstroPage (roue astrologique)
3. Compléter MessagesPage (chat humains)
4. Intégrer Stripe

## Semaine 3 : Polish & Guardian
1. Guardian logic (Elite)
2. Notifications
3. Optimisations
4. Tests

## Semaine 4 : Launch
1. Deploy production
2. Monitoring
3. Feedback users
4. Itérations

---

# 📞 SUPPORT

Pour questions :
- **GitHub Issues** : (si repo public)
- **Email** : support@astraloves.app
- **Discord** : (si communauté)

---

**🌌 Tout est prêt pour le développement !**

**L'architecture est solide. Le code est propre. La database est optimisée.**

**Il ne reste qu'à compléter les interfaces et déployer. ✨**

---

# 🎉 BON DÉVELOPPEMENT !
