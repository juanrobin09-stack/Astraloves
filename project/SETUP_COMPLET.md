# 🚀 Configuration Complète - Déploiement Continu

Guide étape par étape pour configurer le déploiement automatique comme Bolt.new.

---

## ✅ État Actuel

- ✅ Git initialisé
- ✅ Premier commit créé
- ✅ netlify.toml configuré
- ✅ Build de production testé
- ✅ Site déployé sur Netlify (wondrous-hotteok-91e3c4.netlify.app)

---

## 📋 Étapes Restantes

### ÉTAPE 1 : Créer le Repository GitHub

1. Allez sur **https://github.com/new**
2. Créez un nouveau repository :
   - **Repository name** : `astraloves-app`
   - **Description** : "Application Astra - Rencontres Astrologiques"
   - **Visibilité** : Private (recommandé) ou Public
   - **Ne cochez PAS** "Initialize with README"
   - **Ne cochez PAS** "Add .gitignore"
   - **Ne cochez PAS** "Choose a license"
3. Cliquez sur **"Create repository"**
4. **Copiez l'URL** du repository (ex: `https://github.com/votre-username/astraloves-app.git`)

---

### ÉTAPE 2 : Connecter le Projet à GitHub

Exécutez ces commandes dans PowerShell (dans le dossier `project`) :

```powershell
# Naviguer vers le dossier project
cd "C:\Users\juanr\Downloads\project-astra-sb1-syq8q77g (3)\project-bolt-sb1-syq8q77g (1)\project"

# Ajouter le remote GitHub (REMPLACEZ par votre URL GitHub)
git remote add origin https://github.com/VOTRE-USERNAME/astraloves-app.git

# Vérifier le remote
git remote -v

# Renommer la branche en main
git branch -M main

# Pousser vers GitHub
git push -u origin main
```

**Note** : Remplacez `VOTRE-USERNAME` par votre nom d'utilisateur GitHub et `astraloves-app` par le nom de votre repository.

---

### ÉTAPE 3 : Connecter Netlify à GitHub

1. Allez sur **https://app.netlify.com**
2. Cliquez sur votre site **wondrous-hotteok-91e3c4**
3. Allez dans **Site settings** → **Build & deploy**
4. Dans la section **"Continuous Deployment"**, cliquez sur **"Link to Git provider"**
5. Choisissez **GitHub**
6. Autorisez Netlify à accéder à votre compte GitHub
7. Sélectionnez votre repository **astraloves-app**
8. Netlify détectera automatiquement la configuration depuis `netlify.toml`

**Vérifiez les paramètres de build** :
- **Base directory** : (laissez vide, car vous êtes déjà dans le dossier project)
- **Build command** : `npm run build`
- **Publish directory** : `dist`

---

### ÉTAPE 4 : Configurer les Variables d'Environnement

Dans Netlify → **Site settings** → **Environment variables**, ajoutez :

```
VITE_SUPABASE_URL = https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY = votre_cle_anon_supabase
VITE_STRIPE_PUBLIC_KEY = pk_live_votre_cle_publique_stripe
VITE_APP_URL = https://astraloves.com
NODE_ENV = production
```

⚠️ **IMPORTANT** : Utilisez les clés de **production** (pas de test) !

---

### ÉTAPE 5 : Configurer le Domaine astraloves.com

#### Dans Bolt.new (DNS) :

1. Allez dans les paramètres DNS de `astraloves.com`
2. Ajoutez/modifiez :

**Pour astraloves.com :**
```
Type: A
Host: @
Value: 75.2.60.5
TTL: 3600
```

**Pour www.astraloves.com :**
```
Type: CNAME
Host: www
Value: wondrous-hotteok-91e3c4.netlify.app
TTL: 3600
```

#### Dans Netlify :

1. Allez dans **Site settings** → **Domain management**
2. Cliquez sur **"Add custom domain"**
3. Entrez `astraloves.com`
4. Choisissez **"External DNS"** ou **"I'll add DNS records myself"**
5. Attendez la propagation DNS (15 min - 2h)
6. Cliquez sur **"Verify DNS configuration"**
7. Activez **"Force HTTPS"**

---

## 🎯 Workflow Quotidien (Comme Bolt.new)

Une fois tout configuré, voici comment mettre à jour votre site :

```powershell
# 1. Modifier votre code dans Cursor
# 2. Sauvegarder les fichiers

# 3. Voir les modifications
git status

# 4. Ajouter les modifications
git add .

# 5. Créer un commit
git commit -m "Description de vos modifications"

# 6. Pousser vers GitHub
git push origin main

# 7. Netlify déploie automatiquement en 2-3 minutes !
```

---

## ✅ Checklist Finale

- [ ] Repository GitHub créé
- [ ] Projet connecté à GitHub (`git remote add origin`)
- [ ] Code poussé vers GitHub (`git push`)
- [ ] Netlify connecté à GitHub
- [ ] Variables d'environnement configurées dans Netlify
- [ ] DNS configurés dans Bolt.new
- [ ] Domaine ajouté dans Netlify
- [ ] HTTPS activé
- [ ] Test de déploiement automatique réussi

---

## 🆘 Commandes Utiles

### Vérifier l'état Git
```powershell
git status
git log --oneline -5
```

### Voir les remotes
```powershell
git remote -v
```

### Annuler des modifications non commitées
```powershell
git checkout -- fichier.tsx
```

### Voir les différences
```powershell
git diff
```

---

## 🎉 Félicitations !

Une fois toutes ces étapes terminées, vous aurez :
- ✅ Déploiement automatique à chaque `git push`
- ✅ Site accessible sur https://astraloves.com
- ✅ Workflow comme Bolt.new
- ✅ Modifications instantanées en production

---

**Besoin d'aide ?** Consultez `SETUP_DEPLOIEMENT_CONTINU.md` pour plus de détails.



