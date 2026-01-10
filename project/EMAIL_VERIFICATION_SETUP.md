# 📧 Configuration de la Vérification Email - ASTRA

## ⚠️ Problème : Les emails de vérification ne sont pas envoyés

Supabase doit être configuré pour envoyer des emails de confirmation lors de l'inscription.

---

## 🔧 Solution : Configuration Supabase Dashboard

### Étape 1 : Activer Email Confirmation

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet : **vlpyjblasmkugfyfxoia**
3. Dans le menu de gauche, clique sur **Authentication**
4. Clique sur **Providers**
5. Clique sur **Email**

#### Configuration requise :

✅ **Enable Email provider** : OUI (activé)
✅ **Confirm email** : **OUI (ACTIVÉ)** ← **C'EST CRITIQUE !**
✅ **Enable Email OTP** : NON (désactivé pour signup classique)
✅ **Secure email change** : OUI (recommandé)

6. Clique sur **Save**

---

### Étape 2 : Configurer le Template "Confirm signup"

1. Dans le menu Authentication, clique sur **Email Templates**
2. Sélectionne **"Confirm signup"** dans la liste
3. Personnalise le template (optionnel) :

#### Sujet :
```
Confirme ton compte ASTRA ⭐
```

#### Corps (HTML) :
```html
<h2>Bienvenue sur ASTRA ! ⭐</h2>
<p>Bonjour,</p>
<p>Merci de t'être inscrit sur ASTRA, ton assistant astrologique personnalisé.</p>
<p>Pour activer ton compte et commencer ton aventure, clique sur le bouton ci-dessous :</p>

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
    ✨ Activer mon compte
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

4. Clique sur **Save**

---

### Étape 3 : Configurer les Redirect URLs

1. Va dans **Authentication > URL Configuration**
2. Ajoute ces URLs dans **Redirect URLs** :

```
http://localhost:5173/*
https://ton-domaine.com/*
https://ton-domaine.vercel.app/*
```

3. Vérifie que **Site URL** est correct :
```
https://ton-domaine.com
```
(ou `http://localhost:5173` pour dev)

4. Clique sur **Save**

---

## ✅ Ce qui est déjà configuré dans le code

Le code frontend gère déjà :

- ✅ Email Verification Banner (affiche si email non vérifié)
- ✅ Bouton "Renvoyer l'email" fonctionnel
- ✅ Modal de vérification dans Discovery/Chat
- ✅ Blocage des actions (swipe, message) si email non vérifié
- ✅ Fonction `resendVerificationEmail()` qui appelle `supabase.auth.resend()`

---

## 🧪 Tester le système

### Test complet :

1. **Créer un nouveau compte** :
   - Va sur l'app
   - Clique sur "Créer un compte"
   - Entre email + mot de passe
   - Clique sur "S'inscrire"

2. **Vérifier l'email** :
   - ⚠️ Tu devrais voir un **banner orange** en haut : "Vérifie ton email"
   - Vérifie ta boîte email
   - Tu devrais recevoir : **"Confirme ton compte ASTRA"**
   - Clique sur le bouton **"Activer mon compte"**

3. **Confirmation** :
   - Tu es redirigé vers l'app
   - Le banner orange **disparaît automatiquement**
   - Tu peux maintenant swiper et envoyer des messages

4. **Si pas d'email reçu** :
   - Clique sur le bouton **"Renvoyer"** dans le banner
   - Vérifie tes **spams/courrier indésirable**
   - Attends 2-3 minutes (délai serveur)

---

## 🔍 Vérifier si ça marche

### Dans Supabase Dashboard :

1. Va dans **Authentication > Users**
2. Sélectionne un utilisateur récent
3. Regarde la colonne **"Email Confirmed At"** :
   - ❌ **null** = Email NON vérifié
   - ✅ **Date/heure** = Email vérifié

### Dans l'app :

1. Connecte-toi avec un compte non vérifié
2. Tu devrais voir :
   - ⚠️ Banner orange en haut
   - 🚫 Modal qui bloque le swipe
   - 🚫 Modal qui bloque l'envoi de messages

3. Après vérification email :
   - ✅ Banner disparaît
   - ✅ Swipe débloqué
   - ✅ Messages débloqués

---

## 🐛 Dépannage

### L'email n'arrive pas
→ **Vérifie que "Confirm email" est ACTIVÉ dans Authentication > Providers > Email**
→ Vérifie tes spams
→ Attends 5 minutes (délai serveur)
→ Utilise le bouton "Renvoyer" dans le banner

### L'email contient une erreur 404
→ **Ajoute ton URL dans Authentication > URL Configuration > Redirect URLs**
→ Format : `https://ton-domaine.com/*` (avec l'étoile)

### Le banner ne disparaît pas après vérification
→ Rafraîchis la page (`F5` ou `Cmd+R`)
→ Déconnecte/reconnecte
→ Vide le cache : `localStorage.clear(); location.reload(true);`

### Je peux accéder à l'app sans vérifier
→ **C'est normal !** Le système bloque seulement :
   - Les swipes (dans Discovery)
   - L'envoi de messages (dans Chat)

   Mais tu peux naviguer et voir l'interface.

---

## 📋 Checklist finale

Avant de tester, vérifie que tu as bien :

- [ ] Activé **"Confirm email"** dans Authentication > Providers > Email
- [ ] Configuré le template **"Confirm signup"**
- [ ] Ajouté tes URLs dans **Redirect URLs**
- [ ] Sauvegardé toutes les modifications
- [ ] Vidé le cache navigateur
- [ ] Testé avec un **nouvel email** (pas un compte existant)

---

## 💡 Fonctionnement technique

1. User clique sur "S'inscrire"
2. `supabase.auth.signUp({ email, password })` est appelé
3. **Supabase crée le compte avec `email_confirmed_at = null`**
4. **Supabase envoie automatiquement l'email** (si "Confirm email" activé)
5. User clique sur le lien dans l'email
6. **Supabase met `email_confirmed_at = NOW()`**
7. User est redirigé vers l'app
8. `useAuth()` détecte `email_confirmed_at` non-null
9. Banner disparaît + Actions débloquées

---

## 🎯 Résultat attendu

Après configuration correcte :

1. ✅ Email de confirmation envoyé automatiquement à l'inscription
2. ✅ Banner orange visible si email non vérifié
3. ✅ Bouton "Renvoyer" fonctionnel
4. ✅ Swipe bloqué si non vérifié
5. ✅ Messages bloqués si non vérifié
6. ✅ Banner disparaît après vérification
7. ✅ Tout est débloqué après vérification

---

**Si après tout ça, ça ne marche toujours pas, contacte le support Supabase ou vérifie les logs dans Dashboard > Logs.**
