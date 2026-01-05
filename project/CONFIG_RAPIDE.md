# ⚡ CONFIGURATION RAPIDE - CLIQUE SUR LES LIENS

## 🎯 TON PROJET SUPABASE

**Projet ID** : `vlpyjblasmkugfyfxoia`

---

## ✅ ÉTAPE 1 : ACTIVER EMAIL (2 MIN)

**👉 CLIQUE ICI** : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/providers

**À faire** :
1. Clique sur "Email"
2. Active "Enable Email provider" = **ON**
3. Active "Confirm email" = **ON**
4. Clique "Save"

---

## ✅ ÉTAPE 2 : CONFIGURER URLs (1 MIN)

**👉 CLIQUE ICI** : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/url-configuration

**À faire** :
1. Site URL = `http://localhost:5173`
2. Redirect URLs = Ajoute ces lignes :
   ```
   http://localhost:5173/*
   http://localhost:5173/#type=recovery
   ```
3. Clique "Save"

---

## ✅ ÉTAPE 3 : VÉRIFIER SMTP (1 MIN)

**👉 CLIQUE ICI** : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/settings/auth

**À faire** :
1. Vérifie que "Enable Custom SMTP" = **OFF** (pour utiliser SMTP gratuit Supabase)
2. OU configure ton Gmail si tu veux

---

## 🎨 OPTIONNEL : PERSONNALISER EMAILS

**👉 CLIQUE ICI** : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/templates

**À faire** :
1. Clique "Confirm signup"
2. Change le sujet : `Bienvenue sur ASTRA ! ⭐`
3. Personnalise le HTML (voir guide complet)
4. Clique "Save"
5. Répète pour "Reset Password"

---

## ✅ TESTER

1. Va sur ton app : http://localhost:5173
2. Clique "Créer un compte"
3. Entre ton email
4. Vérifie ta boîte email (ou Inbucket en dev)
5. Clique sur le lien
6. Banner orange disparaît = ✅ Ça marche !

---

## 🔍 VÉRIFIER LES USERS

**👉 CLIQUE ICI** : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/users

Tu verras tous tes utilisateurs et si leur email est vérifié.

---

## 📧 VOIR LES EMAILS EN DEV

**👉 CLIQUE ICI** : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/inbucket

En mode dev local, les emails vont dans Inbucket (boîte fictive).

---

## 🐛 PROBLÈME ?

**👉 CLIQUE ICI** : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/logs/auth-logs

Tu verras tous les logs d'authentification (emails envoyés, erreurs, etc.).

---

## 📚 GUIDES COMPLETS

Si tu veux plus de détails, lis :
- `SUPABASE_EMAIL_CONFIG_SIMPLE.md` - Guide complet
- `EMAIL_VERIFICATION_SETUP.md` - Vérification email
- `PASSWORD_RESET_SETUP.md` - Mot de passe oublié
- `RECAP_EMAILS_SYSTEME.md` - Vue d'ensemble

---

## ⚡ TL;DR (ULTRA RAPIDE)

```
1. https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/providers
   → Email = ON

2. https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/url-configuration
   → Ajoute : http://localhost:5173/*

3. Teste : Inscription → Email → Clic lien → ✅
```

---

**🚀 C'EST TOUT ! TON SYSTÈME D'EMAILS EST PRÊT EN 5 MINUTES !**
