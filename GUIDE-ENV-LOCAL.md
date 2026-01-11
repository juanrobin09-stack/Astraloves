# 🔑 COMMENT OBTENIR TES CLÉS SUPABASE

## 🎯 ÉTAPES RAPIDES (2 MINUTES)

### 1️⃣ Va sur Supabase Dashboard

Ouvre: https://supabase.com/dashboard

### 2️⃣ Sélectionne ton projet

Clique sur **"dgcryodwrwqdzxgehcjpp"** (ton projet AstraLoves)

### 3️⃣ Va dans Settings → API

Menu gauche → **⚙️ Settings** → **API**

### 4️⃣ Copie les 2 clés importantes

Tu vas voir 2 sections:

#### 📍 **Project URL**
```
https://dgcryodwrwqdzxgehcjpp.supabase.co
```
➜ Copie cette URL

#### 🔑 **Project API keys**

Tu verras 2 clés:

**1. anon / public** (clé publique)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3J5b2R3cndxZHp4Z2VoY2pwcCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzMzNTAwMTc1LCJleHAiOjIwNDkwNzYxNzV9.XXXXX
```
➜ Copie cette clé (commence par `eyJ...`)

**2. service_role** (clé privée)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3J5b2R3cndxZHp4Z2VoY2pwcCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MzM1MDAxNzUsImV4cCI6MjA0OTA3NjE3NX0.YYYYY
```
➜ ⚠️ **NE PAS utiliser dans .env.local** (seulement pour backend)

---

## 📝 CRÉER TON .env.local

### Étape 1: Crée le fichier

Dans la **racine de ton projet**, crée un fichier:
```
.env.local
```

### Étape 2: Copie ce template

```bash
# SUPABASE
VITE_SUPABASE_URL=https://dgcryodwrwqdzxgehcjpp.supabase.co
VITE_SUPABASE_ANON_KEY=COLLE_TA_CLE_ANON_ICI

# OPENAI
VITE_OPENAI_API_KEY=sk-proj-COLLE_TA_CLE_OPENAI_ICI
```

### Étape 3: Remplace les valeurs

1. **VITE_SUPABASE_URL**: Colle ton Project URL
2. **VITE_SUPABASE_ANON_KEY**: Colle ta clé **anon** (publique)
3. **VITE_OPENAI_API_KEY**: Colle ta clé OpenAI

### Étape 4: Vérifie le format

**✅ CORRECT:**
```bash
VITE_SUPABASE_URL=https://dgcryodwrwqdzxgehcjpp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3J5b2R3cndxZHp4Z2VoY2pwcCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzMzNTAwMTc1LCJleHAiOjIwNDkwNzYxNzV9.XXXXX
VITE_OPENAI_API_KEY=sk-proj-YYYYY
```

**❌ INCORRECT:**
```bash
# Avec guillemets (NON!)
VITE_SUPABASE_URL="https://..."

# Avec espaces (NON!)
VITE_SUPABASE_URL = https://...

# Sans VITE_ prefix (NON!)
SUPABASE_URL=https://...
```

---

## 🔒 SÉCURITÉ

### ⚠️ À FAIRE:

✅ Ajouter `.env.local` dans `.gitignore`
✅ Ne JAMAIS commiter ce fichier
✅ Utiliser la clé **anon** (pas service_role)
✅ Différentes clés pour dev/prod

### ❌ À NE JAMAIS FAIRE:

❌ Commiter .env.local sur Git/GitHub
❌ Mettre la service_role key dans .env.local
❌ Partager tes clés publiquement
❌ Utiliser les mêmes clés en prod qu'en dev

---

## 🚀 APRÈS CONFIGURATION

### 1. Restart le serveur

```bash
# Arrête le serveur (CTRL + C)
# Relance
npm run dev
```

### 2. Vérifie que ça marche

Ouvre ton app et regarde la console (F12).

**✅ Si ça marche:**
- Pas d'erreur "No API key"
- Login/signup fonctionnent
- Images chargent

**❌ Si erreur persiste:**
- Vérifie que le fichier s'appelle `.env.local` (pas `.env`)
- Vérifie qu'il est à la racine du projet
- Vérifie qu'il n'y a pas d'espaces
- Restart le serveur

---

## 📦 POUR NETLIFY (PRODUCTION)

### Variables à configurer:

1. Va sur **Netlify Dashboard**
2. Ton site → **Site settings** → **Environment variables**
3. Ajoute:

```
VITE_SUPABASE_URL = https://dgcryodwrwqdzxgehcjpp.supabase.co
VITE_SUPABASE_ANON_KEY = [ta clé anon]
VITE_OPENAI_API_KEY = [ta clé OpenAI]
```

4. **Redéploie** ton site

---

## 🔍 VÉRIFICATION RAPIDE

**Ton .env.local doit ressembler à ça:**

```bash
# .env.local
VITE_SUPABASE_URL=https://dgcryodwrwqdzxgehcjpp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3J5b2R3cndxZHp4Z2VoY2pwcCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzMzNTAwMTc1LCJleHAiOjIwNDkwNzYxNzV9.VotreVraieCle
VITE_OPENAI_API_KEY=sk-proj-VotreVraieCleOpenAI
```

**Checklist:**
- [ ] Fichier nommé `.env.local` (avec le point devant)
- [ ] À la racine du projet (même niveau que package.json)
- [ ] Pas de guillemets autour des valeurs
- [ ] Pas d'espaces avant/après le =
- [ ] Clé anon utilisée (pas service_role)
- [ ] Prefix VITE_ présent
- [ ] Serveur redémarré après création

---

## 🎯 RÉSUMÉ 30 SECONDES

1. **Supabase Dashboard** → Settings → API
2. **Copie** Project URL + anon key
3. **Crée** `.env.local` à la racine
4. **Colle** les 2 clés
5. **Restart** `npm run dev`
6. **PROFIT!** Plus d'erreur! ✅

---

**Date:** 2026-01-11  
**Status:** ✅ GUIDE COMPLET  
**Temps:** 2 minutes
