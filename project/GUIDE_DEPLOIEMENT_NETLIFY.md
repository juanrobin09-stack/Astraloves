# 🚀 Guide de Déploiement Netlify - astraloves.com

Guide complet étape par étape pour déployer votre projet Bolt sur Netlify avec le domaine personnalisé astraloves.com.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ Un compte Netlify (gratuit) : https://app.netlify.com
- ✅ Un compte GitHub/GitLab/Bitbucket (pour le déploiement continu)
- ✅ Votre domaine astraloves.com géré par Name.com
- ✅ Les variables d'environnement de production (Supabase, Stripe)

---

## ÉTAPE 1 : Vérifier la Structure du Projet

### 1.1 Vérifier que vous êtes dans le bon dossier

```powershell
# Vérifier votre emplacement actuel
pwd

# Vous devriez être dans le dossier racine du projet
# Si non, naviguez vers le dossier project
cd project
```

### 1.2 Vérifier les fichiers essentiels

```powershell
# Vérifier que package.json existe
Test-Path package.json

# Vérifier que netlify.toml existe
Test-Path netlify.toml

# Vérifier que vite.config.ts existe
Test-Path vite.config.ts
```

### 1.3 Vérifier la version de Node.js

```powershell
# Vérifier la version de Node.js (minimum 18 recommandé)
node --version

# Si Node.js n'est pas installé, téléchargez-le depuis https://nodejs.org
```

---

## ÉTAPE 2 : Installer les Dépendances

### 2.1 Installer les packages npm

```powershell
# Naviguer vers le dossier project si ce n'est pas déjà fait
cd project

# Installer toutes les dépendances
npm install
```

Cette commande peut prendre quelques minutes. Attendez qu'elle se termine sans erreur.

---

## ÉTAPE 3 : Configurer les Variables d'Environnement

### 3.1 Créer un fichier .env.local (pour test local)

Créez un fichier `.env.local` dans le dossier `project` avec vos variables :

```env
# Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# Stripe (clé publique uniquement)
VITE_STRIPE_PUBLIC_KEY=pk_live_votre_cle_publique_stripe
```

⚠️ **IMPORTANT** : Ne commitez JAMAIS ce fichier dans Git ! Il est déjà dans `.gitignore`.

### 3.2 Vérifier que les variables sont correctes

```powershell
# Tester le build localement avec les variables
npm run build
```

Si le build réussit, vous êtes prêt pour le déploiement !

---

## ÉTAPE 4 : Créer un Build de Production

### 4.1 Nettoyer les anciens builds (optionnel)

```powershell
# Supprimer le dossier dist s'il existe
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
```

### 4.2 Créer le build de production

```powershell
# Créer le build optimisé pour la production
npm run build
```

Cette commande va :
- Compiler votre application React
- Optimiser les assets (images, CSS, JS)
- Créer un dossier `dist` avec tous les fichiers statiques

### 4.3 Vérifier le build

```powershell
# Vérifier que le dossier dist a été créé
Test-Path dist

# Vérifier le contenu
Get-ChildItem dist
```

Vous devriez voir :
- `index.html`
- Dossier `assets/` avec les fichiers JS et CSS

### 4.4 Tester le build localement (optionnel)

```powershell
# Prévisualiser le build
npm run preview
```

Ouvrez votre navigateur sur `http://localhost:4173` pour vérifier que tout fonctionne.

---

## ÉTAPE 5 : Préparer le Repository Git

### 5.1 Initialiser Git (si pas déjà fait)

```powershell
# Vérifier si Git est initialisé
Test-Path .git

# Si non, initialiser Git
git init

# Ajouter tous les fichiers (sauf ceux dans .gitignore)
git add .

# Créer le premier commit
git commit -m "Initial commit - Ready for Netlify deployment"
```

### 5.2 Créer un repository sur GitHub

1. Allez sur https://github.com/new
2. Créez un nouveau repository (ex: `astraloves-app`)
3. **Ne cochez PAS** "Initialize with README"
4. Copiez l'URL du repository (ex: `https://github.com/votre-username/astraloves-app.git`)

### 5.3 Connecter votre projet local à GitHub

```powershell
# Ajouter le remote (remplacez par votre URL)
git remote add origin https://github.com/votre-username/astraloves-app.git

# Pousser le code vers GitHub
git branch -M main
git push -u origin main
```

---

## ÉTAPE 6 : Déployer sur Netlify

### 6.1 Créer un nouveau site sur Netlify

1. Allez sur https://app.netlify.com
2. Cliquez sur **"Add new site"** → **"Import an existing project"**
3. Choisissez **"GitHub"** (ou GitLab/Bitbucket)
4. Autorisez Netlify à accéder à votre compte GitHub
5. Sélectionnez votre repository `astraloves-app`

### 6.2 Configurer les paramètres de build

Netlify devrait détecter automatiquement la configuration depuis `netlify.toml`, mais vérifiez :

- **Base directory** : `project`
- **Build command** : `npm run build`
- **Publish directory** : `dist`

### 6.3 Configurer les Variables d'Environnement

**CRUCIAL** : Configurez vos variables d'environnement dans Netlify :

1. Dans les paramètres de build, cliquez sur **"Environment variables"**
2. Ajoutez chaque variable :

```
VITE_SUPABASE_URL = https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY = votre_cle_anon_supabase
VITE_STRIPE_PUBLIC_KEY = pk_live_votre_cle_publique_stripe
```

3. Cliquez sur **"Save"**

### 6.4 Déployer

1. Cliquez sur **"Deploy site"**
2. Attendez que le déploiement se termine (2-5 minutes)
3. Une fois terminé, vous obtiendrez une URL Netlify (ex: `https://random-name-123.netlify.app`)

### 6.5 Vérifier le déploiement

1. Ouvrez l'URL Netlify dans votre navigateur
2. Testez que l'application fonctionne correctement
3. Vérifiez la console du navigateur pour les erreurs

---

## ÉTAPE 7 : Configurer le Domaine Personnalisé astraloves.com

### 7.1 Ajouter le domaine dans Netlify

1. Dans votre dashboard Netlify, allez dans **"Site settings"**
2. Cliquez sur **"Domain management"**
3. Cliquez sur **"Add custom domain"**
4. Entrez `astraloves.com`
5. Cliquez sur **"Verify"**

### 7.2 Configurer les DNS dans Name.com

Netlify va vous donner des instructions spécifiques. Voici les étapes générales :

#### Option A : Utiliser les Nameservers Netlify (RECOMMANDÉ)

1. Dans Netlify, notez les nameservers fournis (ex: `dns1.p01.nsone.net`, `dns2.p01.nsone.net`)
2. Allez sur https://www.name.com/account/domain/list
3. Cliquez sur votre domaine `astraloves.com`
4. Allez dans **"DNS Records"** ou **"Nameservers"**
5. Remplacez les nameservers actuels par ceux de Netlify :
   - `dns1.p01.nsone.net`
   - `dns2.p01.nsone.net`
   - (Netlify vous donnera les exacts)

#### Option B : Utiliser les DNS de Name.com avec NSOne

Si vous préférez garder NSOne, configurez les enregistrements DNS :

1. Dans Name.com, allez dans les **DNS Records** de `astraloves.com`
2. Ajoutez/modifiez ces enregistrements :

**Pour le domaine principal (astraloves.com) :**
- Type : `A`
- Host : `@` ou `astraloves.com`
- Value : L'adresse IP fournie par Netlify (ex: `75.2.60.5`)

**Pour www.astraloves.com :**
- Type : `CNAME`
- Host : `www`
- Value : `astraloves.com` ou l'URL Netlify fournie

**Pour HTTPS (SSL) :**
- Netlify gère automatiquement le certificat SSL via Let's Encrypt
- Aucune configuration supplémentaire nécessaire

### 7.3 Activer HTTPS dans Netlify

1. Dans Netlify, allez dans **"Domain management"**
2. Cliquez sur **"Verify DNS configuration"**
3. Une fois vérifié, Netlify activera automatiquement HTTPS
4. Activez **"Force HTTPS"** dans les paramètres

### 7.4 Attendre la propagation DNS

- La propagation DNS peut prendre de **15 minutes à 48 heures**
- En général, c'est actif en **1-2 heures**
- Vous pouvez vérifier la propagation avec : https://www.whatsmydns.net

---

## ÉTAPE 8 : Vérifications Finales

### 8.1 Tester le domaine

```powershell
# Tester que le domaine répond
curl -I https://astraloves.com

# Ou ouvrez simplement dans votre navigateur
# https://astraloves.com
```

### 8.2 Vérifier HTTPS

- ✅ Le site doit charger en HTTPS (https://astraloves.com)
- ✅ Le cadenas vert doit apparaître dans la barre d'adresse
- ✅ Aucun avertissement de sécurité

### 8.3 Tester les fonctionnalités

1. **Authentification** : Créer un compte, se connecter
2. **Questionnaires** : Compléter un questionnaire
3. **Chat Astra** : Envoyer un message
4. **Stripe** : Tester le flux d'abonnement (en mode test d'abord)
5. **Mobile** : Tester sur un appareil mobile

### 8.4 Vérifier les performances

1. Allez sur https://pagespeed.web.dev
2. Testez votre site : `https://astraloves.com`
3. Vérifiez les scores (objectif : 90+)

---

## ÉTAPE 9 : Configuration du Déploiement Continu

### 9.1 Activer le déploiement automatique

Par défaut, Netlify déploie automatiquement à chaque push sur `main` :

1. Allez dans **"Site settings"** → **"Build & deploy"**
2. Vérifiez que **"Continuous Deployment"** est activé
3. La branche de production est `main`

### 9.2 Tester le déploiement automatique

```powershell
# Faire une petite modification
# Par exemple, modifier un commentaire dans un fichier

# Commiter et pousser
git add .
git commit -m "Test deployment"
git push origin main
```

Netlify devrait automatiquement détecter le push et redéployer !

---

## 🔧 Dépannage

### Le build échoue sur Netlify

**Erreur : "Missing environment variables"**
- Vérifiez que toutes les variables sont configurées dans Netlify
- Les variables doivent commencer par `VITE_` pour être accessibles côté client

**Erreur : "Build command failed"**
- Vérifiez les logs de build dans Netlify
- Testez le build localement : `npm run build`
- Vérifiez que Node.js version est compatible (18+)

### Le domaine ne fonctionne pas

**Erreur : "DNS not configured"**
- Vérifiez que les DNS sont correctement configurés dans Name.com
- Attendez la propagation DNS (peut prendre jusqu'à 48h)
- Utilisez https://www.whatsmydns.net pour vérifier

**Erreur : "SSL certificate pending"**
- Attendez quelques minutes après la configuration DNS
- Netlify génère automatiquement le certificat SSL
- Vérifiez dans "Domain management" → "HTTPS"

### L'application ne fonctionne pas en production

**Erreur : "Cannot connect to Supabase"**
- Vérifiez que `VITE_SUPABASE_URL` est correct
- Vérifiez que `VITE_SUPABASE_ANON_KEY` est correct
- Vérifiez les logs de la console du navigateur

**Erreur : "Stripe not working"**
- Vérifiez que `VITE_STRIPE_PUBLIC_KEY` est configuré
- Assurez-vous d'utiliser la clé **publique** (commence par `pk_live_`)
- Vérifiez que vous êtes en mode production dans Stripe

---

## 📝 Checklist de Déploiement

Avant de considérer le déploiement terminé :

- [ ] Build local réussi (`npm run build`)
- [ ] Code poussé sur GitHub
- [ ] Site déployé sur Netlify
- [ ] Variables d'environnement configurées dans Netlify
- [ ] Domaine `astraloves.com` ajouté dans Netlify
- [ ] DNS configurés dans Name.com
- [ ] HTTPS activé et fonctionnel
- [ ] Site accessible sur https://astraloves.com
- [ ] Authentification fonctionnelle
- [ ] Questionnaires fonctionnels
- [ ] Chat Astra fonctionnel
- [ ] Stripe configuré (si utilisé)
- [ ] Tests mobile effectués
- [ ] Déploiement continu activé

---

## 🎉 Félicitations !

Votre application Astra est maintenant en production sur **astraloves.com** !

### Prochaines Étapes

1. **Monitoring** : Surveillez les logs Netlify pour les erreurs
2. **Analytics** : Configurez Google Analytics ou Netlify Analytics
3. **Backups** : Configurez des backups automatiques de Supabase
4. **Performance** : Optimisez selon les métriques de performance
5. **SEO** : Vérifiez le référencement avec Google Search Console

### Ressources Utiles

- **Netlify Docs** : https://docs.netlify.com
- **Netlify Status** : https://www.netlifystatus.com
- **Supabase Docs** : https://supabase.com/docs
- **Vite Docs** : https://vitejs.dev

---

**Bon déploiement ! 🚀**

*Dernière mise à jour : Décembre 2024*



