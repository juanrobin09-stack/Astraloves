# ⚡ Commandes Rapides - Déploiement Continu

Commandes essentielles pour gérer votre projet et déployer automatiquement.

---

## 🚀 Configuration Initiale (Une Seule Fois)

### 1. Créer le Repository GitHub

1. Allez sur **https://github.com/new**
2. Créez `astraloves-app` (Private ou Public)
3. **Ne cochez rien** (pas de README, .gitignore, license)
4. Copiez l'URL (ex: `https://github.com/votre-username/astraloves-app.git`)

### 2. Connecter à GitHub

```powershell
# Option A : Utiliser le script
.\connect-github.ps1 -GitHubUrl "https://github.com/VOTRE-USERNAME/astraloves-app.git"

# Option B : Commandes manuelles
git remote add origin https://github.com/VOTRE-USERNAME/astraloves-app.git
git branch -M main
git push -u origin main
```

### 3. Connecter Netlify à GitHub

1. Netlify → Site settings → Build & deploy
2. "Link to Git provider" → GitHub
3. Sélectionnez votre repository

---

## 📝 Workflow Quotidien

### Modifier et Déployer

```powershell
# 1. Modifier votre code dans Cursor
# 2. Sauvegarder

# 3. Voir les modifications
git status

# 4. Ajouter tout
git add .

# 5. Commiter
git commit -m "Description des modifications"

# 6. Pousser (Netlify déploie automatiquement !)
git push origin main
```

---

## 🔧 Commandes Utiles

### Développement Local

```powershell
# Lancer le serveur de développement
npm run dev

# Créer un build de production
npm run build

# Prévisualiser le build
npm run preview
```

### Git

```powershell
# Voir l'état
git status

# Voir l'historique
git log --oneline -10

# Voir les différences
git diff

# Annuler des modifications non commitées
git checkout -- fichier.tsx

# Annuler le dernier commit (garder les modifications)
git reset --soft HEAD~1
```

### Netlify

```powershell
# Installer Netlify CLI (une fois)
npm install -g netlify-cli

# Se connecter (une fois)
netlify login

# Voir le statut
netlify status

# Déployer manuellement (si nécessaire)
netlify deploy --prod --dir=dist
```

---

## ✅ Checklist Rapide

Avant chaque déploiement :
- [ ] Code testé localement (`npm run dev`)
- [ ] Modifications commitées (`git commit`)
- [ ] Code poussé vers GitHub (`git push`)
- [ ] Vérifier le déploiement dans Netlify Dashboard

---

## 🎯 Résumé

**Workflow quotidien en 3 commandes :**
```powershell
git add .
git commit -m "Vos modifications"
git push origin main
```

C'est tout ! Netlify déploie automatiquement. 🚀



