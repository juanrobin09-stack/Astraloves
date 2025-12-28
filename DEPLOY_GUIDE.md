# 🚀 Guide de Déploiement Netlify - astraloves.com

Guide complet étape par étape pour déployer votre application Astra sur Netlify.

---

## 📋 Diagnostic et Structure

### Structure du Projet

```
project-bolt-sb1-syq8q77g (1)/
├── netlify.toml          ← Configuration Netlify (RACINE)
├── NETLIFY_ENV_VARS.md   ← Liste des variables d'environnement
├── DEPLOY_GUIDE.md       ← Ce fichier
└── project/              ← Code source de l'application
    ├── package.json      ← Package.json principal
    ├── vite.config.ts    ← Configuration Vite
    ├── src/              ← Code source React
    └── dist/             ← Build output (généré)
```

### Package.json Principal

**Emplacement** : `project/package.json`

**Scripts disponibles** :
- ✅ `npm run build` - Crée le build de production
- ✅ `npm run dev` - Lance le serveur de développement
- ✅ `npm run preview` - Prévisualise le build
- ✅ `npm run deploy` - Déploie sur Netlify (production)
- ✅ `npm run deploy:preview` - Déploie sur Netlify (preview)

### Build Output

**Dossier** : `project/dist` (généré par `npm run build`)

---

## ✅ Vérifications Pré-Déploiement

### 1. Tester le Build Localement

```powershell
# Naviguer vers le dossier project
cd project

# Installer les dépendances (si pas déjà fait)
npm install

# Créer le build
npm run build

# Vérifier que dist/ a été créé
Test-Path dist

# Prévisualiser le build
npm run preview
```

Le build doit se terminer **sans erreur**. Ouvrez `http://localhost:4173` pour vérifier.

### 2. Vérifier les Variables d'Environnement

Consultez `NETLIFY_ENV_VARS.md` pour la liste complète des variables nécessaires.

---

## 🌐 Configuration Netlify

### Étape 1 : Créer le Site sur Netlify

1. Allez sur **https://app.netlify.com**
2. Cliquez sur **"Add new site"** → **"Import an existing project"**
3. Choisissez **GitHub** (ou votre provider Git)
4. Autorisez Netlify à accéder à votre compte
5. Sélectionnez votre repository

### Étape 2 : Configurer les Paramètres de Build

Netlify devrait **détecter automatiquement** la configuration depuis `netlify.toml`, mais vérifiez :

- **Base directory** : `project` ✅ (détecté automatiquement)
- **Build command** : `npm run build` ✅ (détecté automatiquement)
- **Publish directory** : `project/dist` ✅ (détecté automatiquement)

Si Netlify ne détecte pas automatiquement, configurez manuellement :
- Base directory : `project`
- Build command : `npm run build`
- Publish directory : `project/dist`

### Étape 3 : Configurer les Variables d'Environnement

**CRUCIAL** : Configurez toutes les variables avant le premier déploiement !

1. Dans Netlify → **Site settings** → **Environment variables**
2. Ajoutez chaque variable (voir `NETLIFY_ENV_VARS.md` pour la liste complète)

**Variables minimales requises** :
```
VITE_SUPABASE_URL = https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY = votre_cle_anon_supabase
VITE_STRIPE_PUBLIC_KEY = pk_live_votre_cle_publique_stripe
VITE_APP_URL = https://astraloves.com
NODE_ENV = production
```

3. Cliquez sur **"Save"**

### Étape 4 : Déployer

1. Cliquez sur **"Deploy site"**
2. Attendez 2-5 minutes
3. Vérifiez les logs de build pour les erreurs

---

## 🔗 Configuration du Domaine astraloves.com

### Étape 1 : Ajouter le Domaine dans Netlify

1. Dans Netlify → **Site settings** → **Domain management**
2. Cliquez sur **"Add custom domain"**
3. Entrez `astraloves.com`
4. Cliquez sur **"Verify"**

### Étape 2 : Configurer les DNS

Netlify vous donnera soit des **nameservers**, soit une **adresse IP**.

#### Option A : Utiliser les Nameservers Netlify (Recommandé)

Dans Bolt.new ou Name.com :
1. Allez dans les paramètres DNS de `astraloves.com`
2. Remplacez les nameservers par ceux fournis par Netlify

#### Option B : Configurer les DNS Manuellement

Dans Bolt.new ou Name.com, ajoutez :

**Pour astraloves.com :**
```
Type: A
Host: @
Value: 75.2.60.5 (ou l'IP fournie par Netlify)
TTL: 3600
```

**Pour www.astraloves.com :**
```
Type: CNAME
Host: www
Value: wondrous-hotteok-91e3c4.netlify.app (ou votre URL Netlify)
TTL: 3600
```

### Étape 3 : Activer HTTPS

1. Attendez la propagation DNS (15 min - 2h)
2. Dans Netlify → **Domain management**
3. Cliquez sur **"Verify DNS configuration"**
4. Netlify générera automatiquement le certificat SSL
5. Activez **"Force HTTPS"**

---

## 🔄 Déploiement Continu (GitHub)

### Configuration

1. Dans Netlify → **Site settings** → **Build & deploy**
2. Dans **"Continuous Deployment"**, vérifiez que votre repository GitHub est connecté
3. La branche de production est `main` (par défaut)

### Workflow Quotidien

```powershell
# 1. Modifier votre code dans Cursor
# 2. Sauvegarder

# 3. Commiter et pousser
cd project
git add .
git commit -m "Description des modifications"
git push origin main

# 4. Netlify déploie automatiquement en 2-3 minutes !
```

---

## 🧪 Tester le Build Localement

### Avant de Déployer

```powershell
# Naviguer vers le dossier project
cd project

# Installer les dépendances
npm install

# Créer le build
npm run build

# Vérifier le build
Test-Path dist
Get-ChildItem dist

# Prévisualiser
npm run preview
```

Ouvrez `http://localhost:4173` pour tester le build de production localement.

---

## 🐛 Troubleshooting

### Erreur : "ENOENT package.json"

**Cause** : Netlify cherche `package.json` à la racine au lieu de `project/package.json`

**Solution** : 
- ✅ Le fichier `netlify.toml` à la racine est maintenant configuré avec `base = "project"`
- Vérifiez dans Netlify → Site settings → Build & deploy que :
  - Base directory = `project`
  - Build command = `npm run build`
  - Publish directory = `project/dist`

### Erreur : "Build command failed"

**Solutions** :
1. Vérifiez les logs de build dans Netlify
2. Testez le build localement : `cd project && npm run build`
3. Vérifiez que toutes les variables d'environnement sont configurées
4. Vérifiez la version de Node.js (Netlify utilise Node 20 par défaut)

### Erreur : "Missing environment variables"

**Solution** :
1. Vérifiez que toutes les variables sont configurées dans Netlify
2. Les variables doivent commencer par `VITE_` pour être accessibles côté client
3. Redéployez après avoir ajouté les variables

### Le Build Fonctionne mais l'App ne Charge Pas

**Solutions** :
1. Vérifiez la console du navigateur pour les erreurs
2. Vérifiez que les variables d'environnement sont correctes
3. Vérifiez que `netlify.toml` contient la redirection SPA :
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Les Routes Ne Fonctionnent Pas (404)

**Solution** : Vérifiez que `netlify.toml` contient la redirection SPA (voir ci-dessus).

---

## 📝 Checklist de Déploiement

### Pré-Déploiement

- [ ] Build local réussi (`npm run build`)
- [ ] Build testé localement (`npm run preview`)
- [ ] Variables d'environnement listées (voir `NETLIFY_ENV_VARS.md`)
- [ ] Code commité et poussé sur GitHub

### Configuration Netlify

- [ ] Site créé sur Netlify
- [ ] Repository GitHub connecté
- [ ] Base directory = `project`
- [ ] Build command = `npm run build`
- [ ] Publish directory = `project/dist`
- [ ] Variables d'environnement configurées
- [ ] Premier déploiement réussi

### Configuration DNS

- [ ] Domaine `astraloves.com` ajouté dans Netlify
- [ ] DNS configurés (Bolt.new ou Name.com)
- [ ] Propagation DNS vérifiée
- [ ] HTTPS activé
- [ ] Redirection www → non-www fonctionnelle

### Tests Post-Déploiement

- [ ] Site accessible sur https://astraloves.com
- [ ] Authentification fonctionnelle
- [ ] Questionnaires fonctionnels
- [ ] Chat Astra fonctionnel
- [ ] Stripe configuré (si utilisé)
- [ ] Tests mobile effectués
- [ ] Console du navigateur sans erreurs

---

## 🔧 Commandes Utiles

### Git

```powershell
# Voir l'état
git status

# Ajouter et commiter
git add .
git commit -m "Description"

# Pousser vers GitHub
git push origin main

# Voir l'historique
git log --oneline -10
```

### Build

```powershell
# Build de production
cd project
npm run build

# Prévisualiser
npm run preview

# Nettoyer et rebuilder
Remove-Item -Recurse -Force dist
npm run build
```

### Netlify CLI

```powershell
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Voir le statut
netlify status

# Déployer manuellement
netlify deploy --prod --dir=project/dist
```

---

## 📚 Ressources

- **Netlify Docs** : https://docs.netlify.com
- **Vite Docs** : https://vitejs.dev
- **Supabase Docs** : https://supabase.com/docs
- **Stripe Docs** : https://stripe.com/docs

---

## ✅ Résumé

Votre projet est maintenant configuré avec :

- ✅ `netlify.toml` à la racine avec `base = "project"`
- ✅ `package.json` vérifié avec script `build`
- ✅ Variables d'environnement documentées
- ✅ `.gitignore` configuré
- ✅ Guide de déploiement complet

**Prochaine étape** : Configurez les variables d'environnement dans Netlify et déployez !

---

**Dernière mise à jour** : Décembre 2024

