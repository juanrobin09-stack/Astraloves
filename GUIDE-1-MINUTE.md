# ⚡ GUIDE EXPRESS — 1 MINUTE

## 🎯 TON FICHIER `.env.local` EST DÉJÀ CRÉÉ!

Il te manque juste **2 clés** à copier/coller:

---

## 1️⃣ CLÉ SUPABASE (30 secondes)

### Va ici:
https://supabase.com/dashboard/project/dgcryodwrwqdzxgehcjpp/settings/api

### Copie la clé "anon public"
C'est la clé qui commence par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

⚠️ **NE PAS copier la "service_role"!**

### Colle-la dans `.env.local`
Remplace `COLLE_TA_CLE_ANON_SUPABASE_ICI` par ta clé

---

## 2️⃣ CLÉ OPENAI (30 secondes)

### Va ici:
https://platform.openai.com/api-keys

### Crée une clé ou copie une existante
Format: `sk-proj-...`

### Colle-la dans `.env.local`
Remplace `COLLE_TA_CLE_OPENAI_ICI` par ta clé

---

## ✅ TON `.env.local` FINAL

Doit ressembler à:

```bash
VITE_SUPABASE_URL=https://dgcryodwrwqdzxgehcjpp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3J5b2R3cndxZHp4Z2VoY2pwcCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzMzNTAwMTc1LCJleHAiOjIwNDkwNzYxNzV9.TaVraieCle
VITE_OPENAI_API_KEY=sk-proj-TaVraieCleOpenAI
```

**SANS guillemets! SANS espaces!**

---

## 🚀 RESTART

```bash
# Arrête (CTRL + C)
npm run dev
```

## ✅ TERMINÉ!

Plus d'erreur "No API key"! 🎉

---

**TEMPS TOTAL: 1 MINUTE**
