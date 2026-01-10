# 🚀 ASTRALOVES - PRÊT POUR NETLIFY !

## ✅ FICHIERS NETLIFY AJOUTÉS

**1. netlify.toml** (2.9K)
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirects configurés
- Headers sécurité
- Cache optimisé

**2. .env.example** (1.2K)
- Template variables Supabase
- Template OpenAI API key
- Instructions claires

**3. .gitignore** (427 bytes)
- node_modules/ ignoré
- .env ignoré (sécurité)
- dist/ ignoré

**4. package.json**
- react-hot-toast ajouté ✅
- Toutes dépendances complètes

---

## 🎯 DÉPLOIEMENT EN 7 ÉTAPES

### 1️⃣ EXTRAIRE LE ZIP
```bash
unzip ASTRALOVES-FRONT-COMPLET.zip
cd astraloves-final
```

### 2️⃣ CRÉER .ENV.LOCAL (dev local)
```bash
cp .env.example .env.local
# Éditer .env.local avec tes vraies clés
```

### 3️⃣ PUSH SUR GIT
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ton-user/astraloves.git
git push -u origin main
```

### 4️⃣ CONNECTER NETLIFY
1. https://app.netlify.com
2. "Add new site" → "Import existing project"
3. Connecter GitHub → Sélectionner repo
4. Build settings auto-détectés ✅

### 5️⃣ VARIABLES D'ENVIRONNEMENT
**Site settings → Environment variables → Add variable**

Ajouter ces 4 variables:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_OPENAI_API_KEY=sk-...
VITE_APP_URL=https://astraloves.netlify.app
```

### 6️⃣ DÉPLOYER
- Netlify build automatiquement
- Ou: "Trigger deploy" → "Deploy site"

### 7️⃣ TESTER
✅ Site accessible  
✅ Signup fonctionne  
✅ Onboarding s'affiche  
✅ Pas d'erreur console  

---

## 📖 DOCUMENTATION COMPLÈTE

Voir: **DEPLOIEMENT-NETLIFY.md** dans le ZIP

**Contenu:**
- Guide étape par étape détaillé
- Troubleshooting erreurs courantes
- Configuration custom domain
- Commandes CLI Netlify
- Checklist finale

---

## 🔑 OÙ TROUVER LES CLÉS

### Supabase
1. https://app.supabase.com
2. Sélectionner projet
3. Settings → API
4. Copier:
   - Project URL → `VITE_SUPABASE_URL`
   - anon public → `VITE_SUPABASE_ANON_KEY`

### OpenAI
1. https://platform.openai.com
2. API Keys
3. Create new secret key
4. Copier → `VITE_OPENAI_API_KEY`

---

## ⚡ BUILD LOCAL (TEST AVANT DEPLOY)

```bash
# Installer dépendances
npm install

# Test build
npm run build

# Vérifier dist/
ls -la dist/

# Preview build
npm run preview
```

Si `npm run build` réussit en local → Deploy Netlify réussira ✅

---

## 🚨 ERREURS COURANTES

### "Build failed: Module not found"
**Solution:** Vérifier package.json a toutes les deps  
→ react-hot-toast ajouté dans le ZIP ✅

### "Page not found" après refresh
**Solution:** netlify.toml avec redirects  
→ Déjà configuré dans le ZIP ✅

### "Supabase connection error"
**Solution:** Variables d'env manquantes  
→ Vérifier les 4 variables ajoutées dans Netlify

### "Deploy log shows errors"
**Screenshot** l'erreur complète et partage-la  
Je t'aide à corriger ! 🔧

---

## 📦 CONTENU DU ZIP

```
astraloves-final/
├── netlify.toml          ← Config Netlify
├── .env.example          ← Template variables
├── .gitignore            ← Sécurité Git
├── package.json          ← Deps complètes
├── src/                  ← Code source
├── public/               ← Assets
├── DEPLOIEMENT-NETLIFY.md ← Guide détaillé
├── AUDIT-TECHNIQUE-RAPPORT.md
└── ...
```

---

## 🎯 RÉSULTAT ATTENDU

**URL:** https://astraloves.netlify.app  
**Build time:** ~3 minutes  
**SSL:** ✅ HTTPS automatique  
**Status:** ✅ Published  

---

## 💡 TIPS

**Automatic deploys:**
Push sur `main` → Deploy auto Netlify

**Deploy previews:**
Pull requests → Preview URL unique

**Rollback:**
Deploys tab → Previous deploy → "Publish deploy"

**Logs:**
Realtime dans Deploy log (troubleshooting)

---

## ✅ CHECKLIST PRÉ-DEPLOY

- [ ] ZIP extrait
- [ ] .env.local créé (local dev)
- [ ] Git init + push
- [ ] Netlify site créé
- [ ] 4 variables d'env ajoutées
- [ ] Build lancé
- [ ] Site accessible
- [ ] Tests fonctionnels OK

---

## 🎉 C'EST PRÊT !

**Ton ASTRALOVES est 100% compatible Netlify.**

Suis les 7 étapes ci-dessus et tu seras live en **15 minutes** ! 🚀

**Besoin d'aide ?** Partage l'erreur Netlify (screenshot + log).
