# 🚀 Commandes Exactes pour le Déploiement Netlify

Guide rapide avec toutes les commandes à exécuter dans PowerShell pour déployer astraloves.com sur Netlify.

---

## 📍 ÉTAPE 1 : Navigation et Vérification

```powershell
# Naviguer vers le dossier project
cd project

# Vérifier que vous êtes au bon endroit
Get-Location

# Vérifier la structure
Test-Path package.json
Test-Path netlify.toml
```

---

## 📦 ÉTAPE 2 : Installation des Dépendances

```powershell
# Installer toutes les dépendances npm
npm install

# Vérifier l'installation
npm list --depth=0
```

---

## 🔐 ÉTAPE 3 : Configuration des Variables d'Environnement

```powershell
# Créer le fichier .env.local (remplacez les valeurs)
@"
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
VITE_STRIPE_PUBLIC_KEY=pk_live_votre_cle_publique_stripe
"@ | Out-File -FilePath .env.local -Encoding utf8

# Vérifier que le fichier est créé
Test-Path .env.local
```

⚠️ **IMPORTANT** : Remplacez les valeurs par vos vraies clés de production !

---

## 🔨 ÉTAPE 4 : Build de Production

```powershell
# Option 1 : Utiliser le script automatique
.\deploy-netlify.ps1

# Option 2 : Build manuel
# Nettoyer les anciens builds
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Créer le build
npm run build

# Vérifier le build
Test-Path dist
Get-ChildItem dist
```

### Tester le build localement (optionnel)

```powershell
# Prévisualiser le build
npm run preview

# Ouvrir http://localhost:4173 dans votre navigateur
```

---

## 📤 ÉTAPE 5 : Préparer Git et GitHub

### Si Git n'est pas encore initialisé

```powershell
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - Ready for Netlify deployment"
```

### Connecter à GitHub

```powershell
# Ajouter le remote (remplacez par votre URL GitHub)
git remote add origin https://github.com/votre-username/astraloves-app.git

# Vérifier le remote
git remote -v

# Pousser vers GitHub
git branch -M main
git push -u origin main
```

### Si le repository existe déjà

```powershell
# Vérifier le statut
git status

# Ajouter les modifications
git add .

# Commiter
git commit -m "Ready for Netlify deployment"

# Pousser
git push origin main
```

---

## 🌐 ÉTAPE 6 : Déploiement sur Netlify (via Interface Web)

### 6.1 Créer le site

1. Allez sur https://app.netlify.com
2. Cliquez sur **"Add new site"** → **"Import an existing project"**
3. Choisissez **"GitHub"**
4. Autorisez Netlify
5. Sélectionnez votre repository

### 6.2 Configurer les paramètres de build

Dans Netlify, configurez :

- **Base directory** : `project`
- **Build command** : `npm run build`
- **Publish directory** : `dist`

### 6.3 Ajouter les Variables d'Environnement

Dans **"Site settings"** → **"Environment variables"**, ajoutez :

```
VITE_SUPABASE_URL = https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY = votre_cle_anon_supabase
VITE_STRIPE_PUBLIC_KEY = pk_live_votre_cle_publique_stripe
```

### 6.4 Déployer

Cliquez sur **"Deploy site"** et attendez 2-5 minutes.

---

## 🔗 ÉTAPE 7 : Configuration du Domaine (via Interface Web)

### 7.1 Dans Netlify

1. Allez dans **"Site settings"** → **"Domain management"**
2. Cliquez sur **"Add custom domain"**
3. Entrez `astraloves.com`
4. Cliquez sur **"Verify"**
5. Notez les **nameservers** ou l'**adresse IP** fournie

### 7.2 Dans Name.com

#### Option A : Utiliser les Nameservers Netlify (RECOMMANDÉ)

1. Allez sur https://www.name.com/account/domain/list
2. Cliquez sur `astraloves.com`
3. Allez dans **"Nameservers"**
4. Remplacez par les nameservers Netlify (ex: `dns1.p01.nsone.net`)

#### Option B : Configurer les DNS avec NSOne

1. Dans Name.com, allez dans **"DNS Records"**
2. Ajoutez/modifiez :

**Pour astraloves.com :**
- Type : `A`
- Host : `@`
- Value : [Adresse IP fournie par Netlify]

**Pour www.astraloves.com :**
- Type : `CNAME`
- Host : `www`
- Value : `astraloves.com`

### 7.3 Activer HTTPS

1. Dans Netlify, allez dans **"Domain management"**
2. Cliquez sur **"Verify DNS configuration"**
3. Une fois vérifié, HTTPS sera activé automatiquement
4. Activez **"Force HTTPS"**

---

## ✅ ÉTAPE 8 : Vérifications Finales

```powershell
# Tester que le domaine répond (après propagation DNS)
curl -I https://astraloves.com

# Ou simplement ouvrir dans le navigateur
Start-Process "https://astraloves.com"
```

### Checklist de Vérification

- [ ] Site accessible sur https://astraloves.com
- [ ] HTTPS activé (cadenas vert)
- [ ] Authentification fonctionnelle
- [ ] Questionnaires fonctionnels
- [ ] Chat Astra fonctionnel
- [ ] Stripe configuré (si utilisé)
- [ ] Tests mobile effectués

---

## 🔄 Déploiements Futurs (Automatique)

Une fois configuré, chaque push sur `main` déclenchera automatiquement un nouveau déploiement :

```powershell
# Faire des modifications
# ... éditer vos fichiers ...

# Commiter et pousser
git add .
git commit -m "Description des modifications"
git push origin main

# Netlify déploiera automatiquement !
```

---

## 🆘 Commandes de Dépannage

### Vérifier les logs de build Netlify

```powershell
# Installer Netlify CLI (optionnel)
npm install -g netlify-cli

# Se connecter
netlify login

# Voir les logs
netlify logs
```

### Rebuild local en cas de problème

```powershell
# Nettoyer complètement
Remove-Item -Recurse -Force node_modules, dist -ErrorAction SilentlyContinue

# Réinstaller
npm install

# Rebuild
npm run build
```

### Vérifier les variables d'environnement

```powershell
# Vérifier le fichier .env.local (ne pas commiter !)
Get-Content .env.local

# Vérifier que .env.local est dans .gitignore
Select-String -Path .gitignore -Pattern "\.env"
```

---

## 📚 Ressources

- **Guide Complet** : `GUIDE_DEPLOIEMENT_NETLIFY.md`
- **Script Automatique** : `.\deploy-netlify.ps1`
- **Netlify Docs** : https://docs.netlify.com
- **Netlify Status** : https://www.netlifystatus.com

---

**Bon déploiement ! 🚀**



