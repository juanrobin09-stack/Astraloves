# 🚀 Configuration du Déploiement Continu (Comme Bolt.new)

Guide pour configurer le déploiement automatique : chaque modification dans Cursor → déploiement instantané sur Netlify.

---

## 📋 Vue d'ensemble

Avec cette configuration :
- ✅ Vous modifiez votre code dans Cursor
- ✅ Vous faites `git commit` et `git push`
- ✅ Netlify déploie automatiquement en 2-3 minutes
- ✅ Votre site est mis à jour sur astraloves.com

---

## ÉTAPE 1 : Initialiser Git dans votre projet

```powershell
# Naviguer vers le dossier project
cd "C:\Users\juanr\Downloads\project-astra-sb1-syq8q77g (3)\project-bolt-sb1-syq8q77g (1)\project"

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - Ready for continuous deployment"
```

---

## ÉTAPE 2 : Créer un Repository sur GitHub

1. Allez sur https://github.com/new
2. Créez un nouveau repository :
   - **Nom** : `astraloves-app` (ou un autre nom)
   - **Visibilité** : Private (recommandé) ou Public
   - **Ne cochez PAS** "Initialize with README"
3. Cliquez sur "Create repository"
4. Copiez l'URL du repository (ex: `https://github.com/votre-username/astraloves-app.git`)

---

## ÉTAPE 3 : Connecter votre projet à GitHub

```powershell
# Ajouter le remote GitHub (remplacez par votre URL)
git remote add origin https://github.com/votre-username/astraloves-app.git

# Vérifier le remote
git remote -v

# Renommer la branche en main
git branch -M main

# Pousser vers GitHub
git push -u origin main
```

---

## ÉTAPE 4 : Connecter Netlify à GitHub

### 4.1 Dans Netlify

1. Allez sur https://app.netlify.com
2. Cliquez sur votre site `wondrous-hotteok-91e3c4`
3. Allez dans **Site settings** → **Build & deploy**
4. Dans la section **"Continuous Deployment"**, cliquez sur **"Link to Git provider"**
5. Choisissez **GitHub**
6. Autorisez Netlify à accéder à votre compte GitHub
7. Sélectionnez votre repository `astraloves-app`
8. Netlify détectera automatiquement `netlify.toml`

### 4.2 Configurer les paramètres de build

Netlify devrait détecter automatiquement depuis `netlify.toml`, mais vérifiez :

- **Base directory** : `project` (si votre code est dans un sous-dossier) OU laissez vide si vous êtes déjà dans le dossier project
- **Build command** : `npm run build`
- **Publish directory** : `dist`

### 4.3 Configurer les variables d'environnement

Dans **Site settings** → **Environment variables**, ajoutez :

```
VITE_SUPABASE_URL = https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY = votre_cle_anon_supabase
VITE_STRIPE_PUBLIC_KEY = pk_live_votre_cle_publique_stripe
VITE_APP_URL = https://astraloves.com
NODE_ENV = production
```

---

## ÉTAPE 5 : Tester le déploiement automatique

### 5.1 Faire une modification

1. Modifiez un fichier dans Cursor (ex: ajoutez un commentaire dans `src/App.tsx`)
2. Sauvegardez le fichier

### 5.2 Commiter et pousser

```powershell
# Voir les modifications
git status

# Ajouter les modifications
git add .

# Créer un commit
git commit -m "Test: modification pour vérifier le déploiement automatique"

# Pousser vers GitHub
git push origin main
```

### 5.3 Vérifier le déploiement

1. Allez sur votre dashboard Netlify
2. Vous verrez un nouveau déploiement en cours
3. Attendez 2-3 minutes
4. Votre site sera mis à jour automatiquement !

---

## 🎯 Workflow quotidien (comme Bolt.new)

Maintenant, chaque fois que vous voulez mettre à jour votre site :

```powershell
# 1. Modifier votre code dans Cursor
# 2. Sauvegarder les fichiers

# 3. Commiter les modifications
git add .
git commit -m "Description de vos modifications"

# 4. Pousser vers GitHub
git push origin main

# 5. Netlify déploie automatiquement !
```

C'est tout ! Pas besoin de build manuel ou de déploiement manuel.

---

## 🔧 Configuration avancée

### Déploiement uniquement sur la branche main

Par défaut, Netlify déploie uniquement la branche `main`. C'est parfait pour la production.

### Déploiements de preview pour les autres branches

Si vous créez une branche de développement :

```powershell
# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Faire des modifications
# ... modifier votre code ...

# Commiter et pousser
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite
```

Netlify créera automatiquement un déploiement de preview avec une URL unique !

---

## 📝 Commandes Git utiles

```powershell
# Voir l'état des modifications
git status

# Voir les différences
git diff

# Voir l'historique des commits
git log --oneline

# Annuler des modifications non commitées
git checkout -- fichier.tsx

# Annuler le dernier commit (garder les modifications)
git reset --soft HEAD~1
```

---

## ✅ Checklist

- [ ] Git initialisé dans le projet
- [ ] Repository GitHub créé
- [ ] Projet connecté à GitHub
- [ ] Netlify connecté à GitHub
- [ ] Variables d'environnement configurées dans Netlify
- [ ] Premier déploiement automatique réussi
- [ ] Test de modification → déploiement automatique fonctionne

---

## 🎉 Félicitations !

Votre workflow est maintenant configuré comme Bolt.new :
- Modifiez dans Cursor
- Commitez et poussez
- Netlify déploie automatiquement
- Votre site est mis à jour en 2-3 minutes !

---

**Prochaine étape** : Configurez le domaine astraloves.com dans Netlify pour que votre site soit accessible sur https://astraloves.com






