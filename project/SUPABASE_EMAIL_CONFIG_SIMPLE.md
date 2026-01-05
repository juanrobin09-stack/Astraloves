# 📧 CONFIGURATION EMAILS SUPABASE - GUIDE ULTRA-SIMPLE

## ⚠️ IMPORTANT : TU DOIS LE FAIRE TOI-MÊME

Je (l'IA) ne peux pas accéder à ton Dashboard Supabase.
**TOI SEUL** peux faire cette configuration.

---

## 🎯 CE QUI EST DÉJÀ FAIT (Code 100% prêt)

✅ `supabase.auth.signUp()` - Inscription avec email
✅ `supabase.auth.resend()` - Renvoyer email de vérification
✅ `EmailVerificationBanner.tsx` - Banner orange "Vérifie ton email"
✅ `EmailVerificationModal.tsx` - Modal de blocage swipe/messages
✅ `emailVerification.ts` - Toutes les fonctions de vérification
✅ `ResetPasswordPage.tsx` - Page réinitialisation mot de passe
✅ Bouton "Renvoyer l'email" fonctionnel

**Le code fonctionne. Il manque juste la config Supabase.**

---

## 🚀 CONFIG SUPABASE EN 3 MINUTES

### **ÉTAPE 1 : Activer Email Provider**

1. **Ouvre** : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/providers

2. **Clique sur "Email"**

3. **Active ces options** :
   ```
   ✅ Enable Email provider : ON
   ✅ Confirm email : ON (pour vérification email obligatoire)
   ✅ Secure email change : ON (recommandé)
   ```

4. **Clique "Save"**

---

### **ÉTAPE 2 : Configurer les URLs de Redirection**

1. **Ouvre** : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/url-configuration

2. **Site URL** (change selon ton domaine) :
   ```
   http://localhost:5173
   ```
   OU en production :
   ```
   https://tondomaine.com
   ```

3. **Redirect URLs** (ajoute toutes ces lignes) :
   ```
   http://localhost:5173/*
   http://localhost:5173/#type=recovery
   https://tondomaine.com/*
   https://tondomaine.com/#type=recovery
   ```

4. **Clique "Save"**

---

### **ÉTAPE 3 : Choisir ton SMTP**

#### **OPTION A : SMTP Supabase (GRATUIT - RECOMMANDÉ)**

1. **Ouvre** : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/settings/auth

2. **SMTP Settings** :
   ```
   ✅ Enable Custom SMTP : OFF (utilise Supabase SMTP gratuit)
   ```

3. **C'est tout !** Supabase envoie les emails gratuitement (2/sec max).

**Limites gratuit Supabase** :
- ✅ 2 emails/seconde
- ✅ Parfait pour startup/dev
- ✅ Fonctionne immédiatement

---

#### **OPTION B : Gmail Personnalisé (OPTIONNEL)**

Si tu veux utiliser ton propre Gmail :

1. **Créer App Password Gmail** :
   - Va sur https://myaccount.google.com/security
   - Active "2-Step Verification"
   - Va dans "App Passwords"
   - Génère un mot de passe (16 caractères)
   - **COPIE-LE** (tu ne le reverras plus)

2. **Configure dans Supabase** :
   - Ouvre : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/settings/auth
   - **SMTP Settings** :
     ```
     ✅ Enable Custom SMTP : ON

     Host: smtp.gmail.com
     Port: 587
     Username: tonemail@gmail.com
     Password: [APP_PASSWORD_16_CARACTERES]
     Sender email: tonemail@gmail.com
     Sender name: ASTRA
     ```

3. **Clique "Save"**

---

## 📧 PERSONNALISER LES EMAILS (OPTIONNEL)

### **Email de Confirmation d'Inscription**

1. **Ouvre** : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/templates

2. **Clique "Confirm signup"**

3. **Personnalise** :

**Sujet :**
```
Bienvenue sur ASTRA ! Vérifie ton email ⭐
```

**Corps (HTML) :**
```html
<h2>Bienvenue sur ASTRA ! ⭐</h2>
<p>Bonjour,</p>
<p>Merci de t'être inscrit sur ASTRA, ton guide astrologique personnalisé pour l'amour.</p>
<p>Pour activer ton compte et commencer à swiper, clique sur le bouton ci-dessous :</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}"
     style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: bold;
            display: inline-block;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);">
    ⭐ Activer mon compte ASTRA
  </a>
</p>

<p>Ou copie ce lien dans ton navigateur :</p>
<p style="word-break: break-all; color: #666; font-size: 12px;">{{ .ConfirmationURL }}</p>

<p style="color: #999; font-size: 12px; margin-top: 30px;">
  Ce lien expire dans 24 heures.<br>
  Si tu n'as pas créé de compte, ignore cet email.
</p>

<p>À bientôt sur ASTRA ! 🌟</p>
```

4. **Clique "Save"**

---

### **Email de Réinitialisation Mot de Passe**

1. **Clique "Reset Password"**

2. **Personnalise** :

**Sujet :**
```
Réinitialise ton mot de passe ASTRA 🔒
```

**Corps (HTML) :**
```html
<h2>Réinitialisation de mot de passe 🔒</h2>
<p>Bonjour,</p>
<p>Tu as demandé à réinitialiser ton mot de passe ASTRA.</p>
<p>Pour créer un nouveau mot de passe, clique sur le bouton ci-dessous :</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}"
     style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: bold;
            display: inline-block;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);">
    🔐 Réinitialiser mon mot de passe
  </a>
</p>

<p>Ou copie ce lien dans ton navigateur :</p>
<p style="word-break: break-all; color: #666; font-size: 12px;">{{ .ConfirmationURL }}</p>

<p style="color: #999; font-size: 12px; margin-top: 30px;">
  Ce lien expire dans 1 heure.<br>
  Si tu n'as pas demandé cette réinitialisation, ignore cet email.
</p>

<p>À bientôt sur ASTRA ! 🌟</p>
```

3. **Clique "Save"**

---

## ✅ TESTER LE SYSTÈME

### **Test Complet - Inscription** :

1. **Va sur ton app** : http://localhost:5173

2. **Clique "Créer un compte"**

3. **Entre** :
   - Email : ton-email@gmail.com
   - Mot de passe : test123456

4. **Clique "S'inscrire"**

5. **Tu devrais voir** :
   - ⚠️ Banner orange "Vérifie ton email"
   - Bouton "Renvoyer"

6. **Vérifie ton email** :
   - Si dev + pas de SMTP : Regarde Inbucket (Dashboard > Auth > Inbucket)
   - Si SMTP configuré : Regarde ta boîte mail (+ spams)

7. **Clique sur le lien dans l'email**

8. **Résultat** :
   - ✅ Redirection vers l'app
   - ✅ Banner orange disparaît
   - ✅ Swipe débloqué
   - ✅ Messages débloqués

---

### **Test Complet - Mot de Passe Oublié** :

1. **Va sur "Se connecter"**

2. **Clique "Mot de passe oublié ?"**

3. **Entre ton email**

4. **Clique "Envoyer le lien"**

5. **Vérifie ton email**

6. **Clique sur le lien**

7. **Tu arrives sur ResetPasswordPage** :
   - 🔐 "Nouveau mot de passe"
   - Formulaire de réinitialisation

8. **Entre nouveau mot de passe**

9. **Clique "Réinitialiser"**

10. **Résultat** :
    - ✅ "Mot de passe réinitialisé !"
    - ✅ Redirection automatique

---

## 🔍 VÉRIFIER SI ÇA MARCHE

### **Dans Supabase Dashboard** :

1. **Ouvre** : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/users

2. **Trouve ton utilisateur**

3. **Regarde la colonne "Email Confirmed At"** :
   - ❌ `null` = Email NON vérifié
   - ✅ Date/heure = Email vérifié

---

### **Dans l'App** :

**Utilisateur NON vérifié voit** :
- ⚠️ Banner orange en haut
- 🚫 Modal sur swipe : "Vérifie ton email pour swiper"
- 🚫 Modal sur message : "Vérifie ton email pour envoyer des messages"
- Bouton "Renvoyer l'email" fonctionnel

**Utilisateur vérifié voit** :
- ✅ Pas de banner
- ✅ Swipe fonctionne
- ✅ Messages fonctionnent
- ✅ Toutes fonctionnalités débloquées

---

## 🐛 DÉPANNAGE

### **Problème : Aucun email reçu**

**Solutions** :
1. Vérifie que "Enable Email provider" est **ON**
2. Vérifie tes **spams/courrier indésirable**
3. Attends **2-3 minutes** (délai serveur)
4. Utilise le bouton **"Renvoyer"** dans le banner
5. Vérifie les **logs** : Dashboard > Logs > Auth Logs

---

### **Problème : Erreur 404 après clic sur lien**

**Solutions** :
1. Vérifie que tes **Redirect URLs** sont bien configurées
2. Format correct : `http://localhost:5173/*` (avec `/*`)
3. Ajoute aussi : `http://localhost:5173/#type=recovery`

---

### **Problème : "Email already registered"**

**Solutions** :
1. L'email existe déjà en base
2. Utilise **"Mot de passe oublié"** pour réinitialiser
3. OU utilise un autre email pour tester

---

### **Problème : Banner ne disparaît pas après vérification**

**Solutions** :
1. **Rafraîchis la page** (F5 ou Cmd+R)
2. **Déconnecte/reconnecte**
3. Vide le cache : Console > `localStorage.clear(); location.reload(true);`

---

### **Problème : En dev, pas d'email dans ma boîte**

**C'est normal !** En mode dev local sans SMTP configuré, Supabase utilise **Inbucket** :

1. **Ouvre** : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/inbucket
2. **Trouve ton email**
3. **Clique sur le message**
4. **Clique sur le lien de confirmation**

---

## 📋 CHECKLIST FINALE

Avant de tester, vérifie :

- [ ] **Enable Email provider** = ON
- [ ] **Confirm email** = ON (si tu veux vérification obligatoire)
- [ ] **Site URL** configurée
- [ ] **Redirect URLs** ajoutées (avec `/*`)
- [ ] **SMTP** configuré (Supabase gratuit OU Gmail)
- [ ] **Templates** personnalisés (optionnel)
- [ ] **Testé avec un nouvel email**
- [ ] **Vérifié les logs** si problème

---

## 🎯 RÉSUMÉ ULTRA-RAPIDE

```
1. Dashboard Supabase > Auth > Providers > Email = ON
2. URL Configuration > Redirect URLs = http://localhost:5173/*
3. (Optionnel) SMTP Settings > Configure Gmail
4. (Optionnel) Email Templates > Personnaliser
5. Tester : Inscription → Email → Clic lien → Vérifié !
```

---

## 💡 NOTES IMPORTANTES

### **SMTP Gratuit Supabase** :
- ✅ Limite : 2 emails/seconde
- ✅ Parfait pour dev/startup
- ✅ Pas de config nécessaire
- ❌ Peut aller dans spam
- ❌ Pas de customisation expéditeur

### **Gmail Personnalisé** :
- ✅ Ton propre domaine
- ✅ Meilleure délivrabilité
- ✅ Customisation complète
- ❌ Nécessite App Password
- ❌ Config manuelle

### **Email Confirmation** :
- ✅ Si ON : User doit vérifier email avant d'utiliser l'app
- ❌ Si OFF : User peut utiliser l'app immédiatement (mais banner reste visible)

---

## 🚀 LIENS RAPIDES

**Dashboard Principal** :
https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia

**Email Provider** :
https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/providers

**URL Configuration** :
https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/url-configuration

**SMTP Settings** :
https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/settings/auth

**Email Templates** :
https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/templates

**Users List** :
https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/users

**Auth Logs** :
https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/logs/auth-logs

**Inbucket (Dev)** :
https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/inbucket

---

## ✅ CONFIRMATION

Une fois que tu as tout configuré, dis-moi :
- "J'ai activé Email Provider"
- "J'ai configuré les Redirect URLs"
- "J'ai testé et ça marche !" (ou "J'ai testé et j'ai ce problème : ...")

Et je pourrai t'aider à débugger si nécessaire !

---

**📧 LE CODE EST PRÊT. À TOI DE CONFIGURER SUPABASE ! 🚀**
