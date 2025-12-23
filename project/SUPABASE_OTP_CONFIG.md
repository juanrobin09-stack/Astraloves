# Configuration Supabase OTP - Code à 6 chiffres UNIQUEMENT

## ⚠️ IMPORTANT : Configuration requise dans Supabase Dashboard

Pour que le système envoie UNIQUEMENT un code à 6 chiffres (sans lien magique), tu DOIS configurer le template d'email dans Supabase.

---

## Étape 1 : Accéder au Dashboard Supabase

1. Va sur : https://supabase.com/dashboard
2. Sélectionne ton projet : **vlpyjblasmkugfyfxoia**
3. Dans le menu de gauche, clique sur **Authentication** (icône clé)

---

## Étape 2 : Modifier le template "Magic Link"

1. Dans le sous-menu Authentication, clique sur **Email Templates**
2. Sélectionne **"Magic Link"** dans la liste des templates
3. **SUPPRIME TOUT** le contenu actuel
4. Remplace par ce template :

### Sujet de l'email :
```
Votre code de connexion ASTRA
```

### Corps de l'email (en HTML) :
```html
<h2>Votre code de connexion</h2>
<p>Bonjour,</p>
<p>Voici votre code de connexion à 6 chiffres :</p>
<h1 style="font-size: 48px; letter-spacing: 8px; font-weight: bold; color: #DC2626;">{{ .Token }}</h1>
<p><strong>Ce code expire dans 60 minutes.</strong></p>
<p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
<p>L'équipe ASTRA</p>
```

### OU version texte simple :
```
Votre code de connexion ASTRA

Bonjour,

Voici votre code de connexion à 6 chiffres :

{{ .Token }}

Ce code expire dans 60 minutes.

Si vous n'avez pas demandé ce code, ignorez cet email.

L'équipe ASTRA
```

5. **IMPORTANT** : Assure-toi qu'il n'y a AUCUNE mention de `{{ .ConfirmationURL }}` ou autre lien
6. Clique sur **Save** en bas de page

---

## Étape 3 : Vérifier les paramètres Email Auth

1. Dans le menu Authentication, clique sur **Providers**
2. Clique sur **Email**
3. Vérifie que ces options sont configurées :
   - ✅ **Enable Email provider** : Activé
   - ✅ **Enable Email OTP** : Activé (si cette option existe)
   - **OTP Expiration** : 3600 secondes (60 minutes)
   - **OTP Length** : 6 digits (par défaut)

4. Clique sur **Save** si tu as fait des modifications

---

## Étape 4 : Tester le système

1. Va sur ton application
2. Clique sur "Se connecter" ou "Créer un compte"
3. Entre ton email
4. Clique sur "Recevoir mon code"
5. Vérifie ton email : tu devrais recevoir UNIQUEMENT un code à 6 chiffres
6. Entre le code dans l'application
7. Clique sur "Vérifier"

---

## ✅ Ce qui est déjà configuré dans le code

Le code frontend est DÉJÀ configuré correctement :

- ✅ `signInWithOtp` avec `emailRedirectTo: undefined` (force l'OTP)
- ✅ `shouldCreateUser: true` (création automatique du compte)
- ✅ 6 champs de saisie pour le code OTP
- ✅ Auto-focus et navigation automatique entre champs
- ✅ Support du copier-coller
- ✅ `verifyOtp({ email, token, type: 'email' })`
- ✅ Gestion des erreurs "Code incorrect"
- ✅ Bouton "Renvoyer le code"

---

## 🔧 Dépannage

### L'email contient toujours un lien magique
→ Retourne dans Email Templates > Magic Link et vérifie que tu as bien supprimé `{{ .ConfirmationURL }}`

### Le code expire trop vite
→ Va dans Authentication > Providers > Email et augmente "OTP Expiration" à 3600 secondes

### Le code ne fonctionne pas
→ Vérifie que tu utilises bien `type: 'email'` dans `verifyOtp()` (PAS 'magiclink')

---

## 📧 Email de test attendu

Après configuration, l'email devrait ressembler à :

```
Sujet : Votre code de connexion ASTRA

Votre code de connexion à 6 chiffres :

483920

Ce code expire dans 60 minutes.
```

**AUCUN lien cliquable !**
