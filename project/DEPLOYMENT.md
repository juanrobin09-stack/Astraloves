# 🚀 Guide de Déploiement - astraloves.com sur Netlify

Guide complet pour déployer et maintenir votre application Astra sur Netlify avec le domaine personnalisé astraloves.com.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration Initiale](#configuration-initiale)
3. [Déploiement Automatique](#déploiement-automatique)
4. [Configuration DNS (Name.com)](#configuration-dns-namecom)
5. [Variables d'Environnement](#variables-denvironnement)
6. [Commandes de Maintenance](#commandes-de-maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Checklist de Déploiement](#checklist-de-déploiement)

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ **Node.js** 18+ installé ([télécharger](https://nodejs.org))
- ✅ **npm** ou **yarn** installé
- ✅ Un compte **Netlify** ([créer un compte](https://app.netlify.com/signup))
- ✅ Un compte **GitHub/GitLab/Bitbucket** pour le repository
- ✅ Accès au domaine **astraloves.com** sur **Name.com**
- ✅ Les clés API de production (Supabase, Stripe)

---

## ⚙️ Configuration Initiale

### 1. Préparer le Repository Git

```powershell
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - Ready for Netlify"

# Créer un repository sur GitHub et connecter
git remote add origin https://github.com/votre-username/astraloves-app.git
git branch -M main
git push -u origin main
```

### 2. Créer un Site sur Netlify

1. Allez sur [app.netlify.com](https://app.netlify.com)
2. Cliquez sur **"Add new site"** → **"Import an existing project"**
3. Choisissez **GitHub** (ou votre provider Git)
4. Autorisez Netlify à accéder à votre compte
5. Sélectionnez votre repository `astraloves-app`
6. Netlify détectera automatiquement la configuration depuis `netlify.toml`

### 3. Configurer les Variables d'Environnement

Dans Netlify Dashboard :

1. Allez dans **Site settings** → **Environment variables**
2. Ajoutez les variables suivantes :

```
VITE_SUPABASE_URL = https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY = votre_cle_anon_supabase
VITE_STRIPE_PUBLIC_KEY = pk_live_votre_cle_publique_stripe
VITE_APP_URL = https://astraloves.com
NODE_ENV = production
```

⚠️ **IMPORTANT** : Utilisez les clés de **production** (pas de test) !

---

## 🚀 Déploiement Automatique

### Option 1 : Script PowerShell (Recommandé)

```powershell
# Déploiement en production
.\deploy.ps1

# Déploiement en preview (test)
.\deploy.ps1 -Preview

# Déploiement sans rebuild (si dist existe déjà)
.\deploy.ps1 -SkipBuild
```

Le script automatise :
- ✅ Installation des dépendances
- ✅ Build de production
- ✅ Installation de Netlify CLI
- ✅ Connexion à Netlify
- ✅ Déploiement

### Option 2 : Commandes npm

```powershell
# Build de production
npm run build

# Déploiement en production
npm run deploy

# Déploiement en preview
npm run deploy:preview
```

### Option 3 : Netlify CLI Direct

```powershell
# Installer Netlify CLI (une seule fois)
npm install -g netlify-cli

# Se connecter (une seule fois)
netlify login

# Déployer en production
netlify deploy --prod --dir=dist

# Déployer en preview
netlify deploy --dir=dist
```

---

## 🌐 Configuration DNS (Name.com)

### Méthode 1 : Utiliser les Nameservers Netlify (RECOMMANDÉ)

Cette méthode est la plus simple et Netlify gère tout automatiquement.

#### Dans Netlify :

1. Allez dans **Site settings** → **Domain management**
2. Cliquez sur **"Add custom domain"**
3. Entrez `astraloves.com`
4. Cliquez sur **"Verify"**
5. Netlify vous donnera des nameservers (ex: `dns1.p01.nsone.net`, `dns2.p01.nsone.net`)

#### Dans Name.com :

1. Allez sur [name.com](https://www.name.com/account/domain/list)
2. Cliquez sur votre domaine `astraloves.com`
3. Allez dans **"Nameservers"** ou **"DNS"**
4. Remplacez les nameservers actuels par ceux fournis par Netlify :
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   ```
   (Les nameservers exacts vous seront donnés par Netlify)

5. Sauvegardez et attendez la propagation (15 min - 48h, généralement 1-2h)

### Méthode 2 : Garder NSOne et Configurer les DNS

Si vous préférez garder NSOne comme nameserver :

#### Dans Netlify :

1. Ajoutez le domaine `astraloves.com` dans Netlify
2. Notez l'**adresse IP** fournie (ex: `75.2.60.5`)
3. Ou notez l'URL CNAME si disponible

#### Dans Name.com :

1. Allez dans **DNS Records** de `astraloves.com`
2. Ajoutez/modifiez ces enregistrements :

**Pour astraloves.com (domaine principal) :**
```
Type: A
Host: @
Value: [Adresse IP fournie par Netlify]
TTL: 3600
```

**Pour www.astraloves.com :**
```
Type: CNAME
Host: www
Value: astraloves.com
TTL: 3600
```

Ou si Netlify fournit une URL CNAME :
```
Type: CNAME
Host: www
Value: [URL CNAME Netlify]
TTL: 3600
```

### Vérifier la Configuration DNS

```powershell
# Vérifier la propagation DNS
nslookup astraloves.com

# Ou utiliser un outil en ligne
# https://www.whatsmydns.net/#A/astraloves.com
```

### Activer HTTPS

1. Dans Netlify, allez dans **Domain management**
2. Cliquez sur **"Verify DNS configuration"**
3. Une fois vérifié, Netlify générera automatiquement un certificat SSL via Let's Encrypt
4. Activez **"Force HTTPS"** dans les paramètres
5. Attendez quelques minutes pour la génération du certificat

---

## 🔐 Variables d'Environnement

### Variables Requises

Ces variables doivent être configurées dans **Netlify Dashboard** → **Environment variables** :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_STRIPE_PUBLIC_KEY` | Clé publique Stripe (production) | `pk_live_...` |
| `VITE_APP_URL` | URL de l'application | `https://astraloves.com` |
| `NODE_ENV` | Environnement Node.js | `production` |

### Variables Optionnelles

| Variable | Description |
|----------|-------------|
| `VITE_ANALYTICS_ID` | ID Google Analytics (si utilisé) |
| `VITE_SENTRY_DSN` | DSN Sentry pour le monitoring (si utilisé) |

### Configuration dans Netlify

1. Allez dans **Site settings** → **Environment variables**
2. Cliquez sur **"Add variable"**
3. Ajoutez chaque variable avec sa valeur
4. Cliquez sur **"Save"**

⚠️ **Note** : Après avoir ajouté/modifié des variables, vous devez **redéployer** le site pour que les changements prennent effet.

---

## 🔧 Commandes de Maintenance

### Vérifier le Statut du Site

```powershell
# Vérifier le statut Netlify
netlify status

# Voir les informations du site
netlify sites:list
```

### Voir les Logs

```powershell
# Logs en temps réel
netlify logs

# Logs de build
netlify logs:build

# Logs de fonctions (si vous utilisez des fonctions)
netlify logs:functions
```

### Redéployer un Déploiement Précédent

```powershell
# Lister les déploiements
netlify deploy:list

# Redéployer un déploiement spécifique
netlify deploy:rollback
```

### Nettoyer le Cache

```powershell
# Dans Netlify Dashboard :
# Site settings → Build & deploy → Clear cache and deploy site
```

### Mettre à Jour Netlify CLI

```powershell
npm update -g netlify-cli
```

### Vérifier la Configuration

```powershell
# Vérifier la configuration Netlify
netlify status

# Voir la configuration complète
cat netlify.toml
```

---

## 🐛 Troubleshooting

### Le Build Échoue

**Erreur : "Missing environment variables"**

```powershell
# Solution :
# 1. Vérifiez que toutes les variables sont configurées dans Netlify
# 2. Redéployez après avoir ajouté les variables
# 3. Vérifiez que les variables commencent par VITE_ pour être accessibles côté client
```

**Erreur : "Build command failed"**

```powershell
# Solution :
# 1. Testez le build localement
npm run build

# 2. Vérifiez les logs de build dans Netlify Dashboard
# 3. Vérifiez la version de Node.js (Netlify utilise Node 18 par défaut)
# 4. Ajoutez un fichier .nvmrc si vous avez besoin d'une version spécifique
echo "18" > .nvmrc
```

**Erreur : "Module not found"**

```powershell
# Solution :
# 1. Vérifiez que package.json contient toutes les dépendances
# 2. Supprimez node_modules et package-lock.json
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
npm run build
```

### Le Déploiement Échoue

**Erreur : "Not logged in"**

```powershell
# Solution :
netlify login
```

**Erreur : "Site not found"**

```powershell
# Solution :
# 1. Vérifiez que vous êtes dans le bon dossier
# 2. Liez le site manuellement
netlify link
```

### Le Domaine Ne Fonctionne Pas

**Erreur : "DNS not configured"**

```powershell
# Solution :
# 1. Vérifiez la configuration DNS dans Name.com
# 2. Attendez la propagation DNS (peut prendre jusqu'à 48h)
# 3. Utilisez https://www.whatsmydns.net pour vérifier
# 4. Vérifiez dans Netlify Dashboard → Domain management
```

**Erreur : "SSL certificate pending"**

```powershell
# Solution :
# 1. Attendez quelques minutes après la configuration DNS
# 2. Netlify génère automatiquement le certificat SSL
# 3. Vérifiez dans Domain management → HTTPS
# 4. Si ça prend trop de temps, contactez le support Netlify
```

### L'Application Ne Fonctionne Pas en Production

**Erreur : "Cannot connect to Supabase"**

```powershell
# Solution :
# 1. Vérifiez VITE_SUPABASE_URL dans Netlify
# 2. Vérifiez VITE_SUPABASE_ANON_KEY dans Netlify
# 3. Vérifiez que vous utilisez les clés de PRODUCTION (pas de test)
# 4. Vérifiez les logs de la console du navigateur
```

**Erreur : "Stripe not working"**

```powershell
# Solution :
# 1. Vérifiez VITE_STRIPE_PUBLIC_KEY dans Netlify
# 2. Assurez-vous d'utiliser la clé PUBLIQUE (pk_live_...)
# 3. Vérifiez que vous êtes en mode PRODUCTION dans Stripe Dashboard
# 4. Vérifiez les logs de la console du navigateur
```

**Les Routes Ne Fonctionnent Pas (404)**

```powershell
# Solution :
# 1. Vérifiez que netlify.toml contient la redirection SPA :
#    [[redirects]]
#      from = "/*"
#      to = "/index.html"
#      status = 200
# 2. Redéployez après modification
```

### Performance Lente

```powershell
# Solutions :
# 1. Vérifiez la taille du build
npm run build
Get-ChildItem -Recurse dist | Measure-Object -Property Length -Sum

# 2. Optimisez les images (utilisez WebP, compressez)
# 3. Vérifiez le code splitting dans vite.config.ts
# 4. Utilisez Netlify Analytics pour identifier les problèmes
```

---

## ✅ Checklist de Déploiement

Avant de considérer le déploiement terminé :

### Pré-Déploiement

- [ ] Code poussé sur GitHub/GitLab
- [ ] Build local réussi (`npm run build`)
- [ ] Dossier `dist` créé et contient les fichiers
- [ ] Variables d'environnement préparées
- [ ] Tests locaux passés

### Configuration Netlify

- [ ] Site créé sur Netlify
- [ ] Repository connecté
- [ ] Variables d'environnement configurées
- [ ] Configuration `netlify.toml` vérifiée
- [ ] Premier déploiement réussi

### Configuration DNS

- [ ] Domaine `astraloves.com` ajouté dans Netlify
- [ ] DNS configurés dans Name.com
- [ ] Propagation DNS vérifiée
- [ ] HTTPS activé et fonctionnel
- [ ] Redirection www → non-www fonctionnelle

### Tests de Production

- [ ] Site accessible sur https://astraloves.com
- [ ] Authentification fonctionnelle
- [ ] Questionnaires fonctionnels
- [ ] Chat Astra fonctionnel
- [ ] Stripe configuré et fonctionnel (si utilisé)
- [ ] Tests mobile effectués
- [ ] Performance vérifiée (PageSpeed)
- [ ] Console du navigateur sans erreurs

### Post-Déploiement

- [ ] Monitoring configuré
- [ ] Backups Supabase configurés
- [ ] Analytics configurés (si utilisé)
- [ ] Documentation à jour

---

## 📚 Ressources Utiles

### Documentation

- **Netlify Docs** : https://docs.netlify.com
- **Netlify CLI** : https://cli.netlify.com
- **Vite Docs** : https://vitejs.dev
- **Supabase Docs** : https://supabase.com/docs

### Outils

- **Vérification DNS** : https://www.whatsmydns.net
- **Test de Performance** : https://pagespeed.web.dev
- **Netlify Status** : https://www.netlifystatus.com

### Support

- **Netlify Support** : https://www.netlify.com/support
- **Netlify Community** : https://answers.netlify.com

---

## 🎉 Félicitations !

Votre application est maintenant en production sur **https://astraloves.com** !

### Prochaines Étapes

1. **Monitoring** : Surveillez les logs et métriques
2. **Optimisation** : Améliorez les performances selon les métriques
3. **SEO** : Configurez Google Search Console
4. **Analytics** : Ajoutez Google Analytics ou Netlify Analytics
5. **Backups** : Configurez des backups automatiques

---

**Dernière mise à jour** : Décembre 2024  
**Version** : 1.0.0



