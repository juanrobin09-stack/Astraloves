# 🚀 GUIDE DÉPLOIEMENT NETLIFY - ASTRALOVES

## ✅ PRÉREQUIS

1. Compte Netlify actif
2. Compte Supabase avec projet créé
3. Clé API OpenAI
4. Git repository (GitHub/GitLab/Bitbucket)

---

## 📋 ÉTAPE 1: PRÉPARER LE PROJET

### 1.1 Vérifier les fichiers nécessaires

✅ `netlify.toml` - Configuration Netlify (créé)  
✅ `package.json` - Dépendances complètes  
✅ `.env.example` - Template variables  

### 1.2 Créer .env.example (si pas déjà fait)

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_OPENAI_API_KEY=sk-...
VITE_APP_URL=https://astraloves.netlify.app
```

### 1.3 Vérifier .gitignore

Créer `.gitignore` avec :
```
node_modules/
dist/
.env
.env.local
.DS_Store
```

---

## 📤 ÉTAPE 2: PUSH SUR GIT

```bash
# Initialiser git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Initial commit - ASTRALOVES v1.0"

# Lier au repo distant (remplace par ton URL)
git remote add origin https://github.com/ton-username/astraloves.git

# Push
git push -u origin main
```

---

## 🌐 ÉTAPE 3: CONNECTER NETLIFY

### 3.1 Via Dashboard Netlify

1. **Aller sur:** https://app.netlify.com
2. **Cliquer:** "Add new site" → "Import an existing project"
3. **Choisir:** GitHub (ou GitLab/Bitbucket)
4. **Autoriser** Netlify à accéder à tes repos
5. **Sélectionner** le repo `astraloves`

### 3.2 Configuration Build

Netlify devrait détecter automatiquement grâce à `netlify.toml`:

- **Build command:** `npm run build` ✅
- **Publish directory:** `dist` ✅
- **Base directory:** `/` ✅

Si pas détecté, entre manuellement ces valeurs.

---

## 🔑 ÉTAPE 4: VARIABLES D'ENVIRONNEMENT

### 4.1 Aller dans Site settings

1. **Dashboard Netlify** → Ton site
2. **Site settings** → **Environment variables**
3. **Add a variable**

### 4.2 Ajouter chaque variable

**Variable 1: VITE_SUPABASE_URL**
- Key: `VITE_SUPABASE_URL`
- Value: `https://xxxxx.supabase.co`
- Scopes: All (Production, Deploy Previews, Branch deploys)

**Variable 2: VITE_SUPABASE_ANON_KEY**
- Key: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Scopes: All

**Variable 3: VITE_OPENAI_API_KEY**
- Key: `VITE_OPENAI_API_KEY`
- Value: `sk-...`
- Scopes: All

**Variable 4: VITE_APP_URL**
- Key: `VITE_APP_URL`
- Value: `https://astraloves.netlify.app` (ou ton custom domain)
- Scopes: All

### 4.3 Où trouver les clés Supabase ?

1. **Supabase Dashboard:** https://app.supabase.com
2. **Sélectionner** ton projet
3. **Settings** → **API**
4. Copier:
   - Project URL → `VITE_SUPABASE_URL`
   - anon public → `VITE_SUPABASE_ANON_KEY`

---

## 🏗️ ÉTAPE 5: LANCER LE BUILD

### 5.1 Trigger deploy

1. **Deploys** tab dans Netlify
2. **Trigger deploy** → **Deploy site**

Ou push un commit pour auto-deploy:
```bash
git add .
git commit -m "Add netlify config"
git push
```

### 5.2 Suivre le build

- **Production deploys** → Cliquer sur le deploy en cours
- **Deploy log** s'affiche en temps réel

**Build typique:** 2-5 minutes

---

## 🎯 ÉTAPE 6: VÉRIFIER LE DÉPLOIEMENT

### 6.1 Site live

Une fois le build réussi:
- **URL temporaire:** `https://random-name-123456.netlify.app`
- Clique dessus pour voir le site

### 6.2 Tests critiques

✅ **Page login** charge  
✅ **Signup** fonctionne (test Supabase)  
✅ **Onboarding** s'affiche après signup  
✅ **Routes** fonctionnent (/univers, /astra, etc.)  
✅ **Pas d'erreur console** (F12)

---

## 🌍 ÉTAPE 7: CUSTOM DOMAIN (optionnel)

### 7.1 Ajouter un domaine

1. **Site settings** → **Domain management**
2. **Add custom domain**
3. Entre ton domaine: `astraloves.com`

### 7.2 Configurer DNS

Netlify te donnera des records DNS à ajouter:

**Type A:**
```
@ → 75.2.60.5
```

**Type CNAME:**
```
www → astraloves.netlify.app
```

Ajoute-les chez ton registrar (OVH, Namecheap, etc.)

### 7.3 SSL automatique

Netlify génère un certificat SSL HTTPS automatiquement (Let's Encrypt).

**Délai:** 10-60 minutes après config DNS.

---

## 🔧 TROUBLESHOOTING

### Erreur: "Build failed"

**Solution 1:** Vérifier `netlify.toml` présent  
**Solution 2:** Vérifier `package.json` a toutes les deps  
**Solution 3:** Regarder le log complet (Deploy log)

### Erreur: "Page not found" sur refresh

**Cause:** Redirects SPA manquants  
**Solution:** Vérifier `netlify.toml` a `[[redirects]]` section

### Erreur: "Supabase connection failed"

**Cause:** Variables d'env manquantes  
**Solution:** Re-vérifier les 4 variables dans Site settings

### Erreur: "Cannot find module 'react-hot-toast'"

**Cause:** Dépendance manquante  
**Solution:** Package.json corrigé dans le zip final ✅

---

## 📊 COMMANDES UTILES

### Deploy local test

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Test build local
netlify build

# Test en local avec functions
netlify dev
```

### Forcer redeploy

```bash
# Via CLI
netlify deploy --prod

# Via Git
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## ✅ CHECKLIST FINALE

- [ ] `netlify.toml` créé et push
- [ ] Package.json avec react-hot-toast
- [ ] .gitignore configuré
- [ ] Repo Git créé et push
- [ ] Site Netlify connecté au repo
- [ ] 4 variables d'env ajoutées
- [ ] Build réussi (vert)
- [ ] Site accessible via URL
- [ ] Signup/Login fonctionnel
- [ ] Onboarding s'affiche
- [ ] Pas d'erreur console

---

## 🎉 RÉSULTAT ATTENDU

**URL:** https://astraloves.netlify.app (ou custom)  
**Status:** ✅ Published  
**Build time:** ~3 minutes  
**SSL:** ✅ HTTPS automatique  

---

## 📞 SUPPORT

**Erreur persistante ?**

1. **Deploy log complet:** Copie-colle le log Netlify
2. **Screenshot erreur:** Capture l'écran
3. **Console browser:** Copie erreurs F12

Je t'aide à débugger ! 🚀
