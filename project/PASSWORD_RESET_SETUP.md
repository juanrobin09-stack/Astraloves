# 🔒 Configuration de la Réinitialisation du Mot de Passe - ASTRA

## ⚠️ Problème : Les emails de réinitialisation ne sont pas envoyés

Supabase doit être configuré pour envoyer des emails de réinitialisation du mot de passe.

---

## 🔧 Solution : Configuration Supabase Dashboard

### Étape 1 : Vérifier Email Provider

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet : **vlpyjblasmkugfyfxoia**
3. Dans le menu de gauche, clique sur **Authentication**
4. Clique sur **Providers**
5. Clique sur **Email**

#### Configuration requise :

✅ **Enable Email provider** : OUI (activé)
✅ **Confirm email** : Selon ta préférence
✅ **Secure email change** : OUI (recommandé)

6. Clique sur **Save**

---

### Étape 2 : Configurer le Template "Reset Password"

1. Dans le menu Authentication, clique sur **Email Templates**
2. Sélectionne **"Reset Password"** dans la liste
3. Personnalise le template :

#### Sujet :
```
Réinitialise ton mot de passe ASTRA 🔒
```

#### Corps (HTML) :
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

4. Clique sur **Save**

---

### Étape 3 : Configurer les Redirect URLs

1. Va dans **Authentication > URL Configuration**
2. Ajoute ces URLs dans **Redirect URLs** :

```
http://localhost:5173/*
http://localhost:5173/#type=recovery
https://ton-domaine.com/*
https://ton-domaine.com/#type=recovery
https://ton-domaine.vercel.app/*
https://ton-domaine.vercel.app/#type=recovery
```

**IMPORTANT** : L'URL `/#type=recovery` est utilisée pour détecter automatiquement que l'utilisateur vient d'un lien de réinitialisation et afficher la page de changement de mot de passe.

3. Vérifie que **Site URL** est correct :
```
https://ton-domaine.com
```
(ou `http://localhost:5173` pour dev)

4. Clique sur **Save**

---

## ✅ Ce qui est déjà configuré dans le code

Le code frontend gère déjà :

- ✅ Bouton "Mot de passe oublié ?" dans LoginForm
- ✅ Modal de réinitialisation avec formulaire email
- ✅ Appel à `supabase.auth.resetPasswordForEmail(email)`
- ✅ Confirmation visuelle "Email envoyé !"
- ✅ Redirection vers `/onboarding` après clic sur lien

### Code de réinitialisation :

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/#type=recovery`,
});
```

### Détection du token de réinitialisation :

```typescript
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const type = hashParams.get('type');

if (type === 'recovery') {
  // Afficher la page ResetPasswordPage
  setPage('reset-password');
}
```

### Mise à jour du mot de passe :

```typescript
const { error } = await supabase.auth.updateUser({
  password: newPassword,
});
```

---

## 🧪 Tester le système

### Test complet :

1. **Demander la réinitialisation** :
   - Va sur l'app
   - Clique sur "Se connecter"
   - Clique sur "Mot de passe oublié ?"
   - Entre ton email
   - Clique sur "Envoyer le lien"

2. **Vérifier l'email** :
   - Tu devrais voir : ✓ "Email envoyé !"
   - Vérifie ta boîte email
   - Tu devrais recevoir : **"Réinitialise ton mot de passe ASTRA 🔒"**
   - Clique sur le bouton **"🔐 Réinitialiser mon mot de passe"**

3. **Créer nouveau mot de passe** :
   - Tu es redirigé vers la page de réinitialisation
   - Une session est automatiquement créée
   - Tu vois un formulaire avec :
     - 🔐 "Nouveau mot de passe"
     - Champ "Nouveau mot de passe"
     - Champ "Confirmer le mot de passe"
     - Validation en temps réel
     - Bouton "Réinitialiser le mot de passe"

4. **Si pas d'email reçu** :
   - Vérifie tes **spams/courrier indésirable**
   - Attends 2-3 minutes (délai serveur)
   - Réessaye avec le bouton "Envoyer le lien"

---

## 🔍 Vérifier si ça marche

### Dans Supabase Dashboard :

1. Va dans **Authentication > Users**
2. Sélectionne ton utilisateur
3. Vérifie la colonne **"Last Sign In"** :
   - Après réinitialisation, elle devrait être mise à jour

### Dans l'app :

1. Clique sur "Mot de passe oublié ?"
2. Entre ton email
3. Tu devrais voir :
   - ✅ Message "Email envoyé !"
   - ✅ Ton email affiché
   - ✅ Instructions claires

---

## 🐛 Dépannage

### L'email n'arrive pas

**Solutions :**
- ✅ Vérifie que **"Enable Email provider"** est activé dans Authentication > Providers > Email
- ✅ Vérifie tes **spams**
- ✅ Attends **5 minutes** (délai serveur)
- ✅ Teste avec un **email différent**
- ✅ Vérifie les **logs** dans Dashboard > Logs > Auth Logs

### L'email contient une erreur 404

**Solutions :**
- ✅ Ajoute `/onboarding` dans **Authentication > URL Configuration > Redirect URLs**
- ✅ Format : `https://ton-domaine.com/onboarding` (sans étoile pour cette route spécifique)
- ✅ Ajoute aussi `https://ton-domaine.com/*` (avec étoile pour les autres routes)

### Le lien expire tout de suite

**Solutions :**
- ✅ Vérifie la durée d'expiration dans **Authentication > Settings**
- ✅ Par défaut, les liens de réinitialisation expirent après **1 heure**
- ✅ Ne clique qu'**une seule fois** sur le lien (ils sont à usage unique)

### Après clic sur le lien, je suis redirigé vers une page blanche

**Solutions :**
- ✅ Assure-toi que `/onboarding` existe dans ton app
- ✅ Vérifie que `App.tsx` gère la route `onboarding`
- ✅ Vide le cache : `localStorage.clear(); location.reload(true);`

---

## 📋 Checklist finale

Avant de tester, vérifie que tu as bien :

- [ ] Activé **"Enable Email provider"** dans Authentication > Providers > Email
- [ ] Configuré le template **"Reset Password"**
- [ ] Ajouté `/onboarding` dans **Redirect URLs**
- [ ] Ajouté `/*` (wildcard) dans **Redirect URLs**
- [ ] Sauvegardé toutes les modifications
- [ ] Vidé le cache navigateur
- [ ] Testé avec un **email existant** dans ta base

---

## 💡 Fonctionnement technique

1. User clique sur "Mot de passe oublié ?"
2. User entre son email
3. `supabase.auth.resetPasswordForEmail(email, { redirectTo })` est appelé
4. **Supabase génère un token de réinitialisation**
5. **Supabase envoie l'email** avec le lien contenant le token
6. User clique sur le lien dans l'email
7. **Supabase vérifie le token**
8. **Supabase crée une session temporaire**
9. User est redirigé vers `/onboarding`
10. User peut créer un nouveau mot de passe via `supabase.auth.updateUser({ password })`

---

## 🎯 Résultat attendu

Après configuration correcte :

1. ✅ Clic sur "Mot de passe oublié ?" ouvre le modal
2. ✅ Email pré-rempli si déjà saisi dans login
3. ✅ Clic sur "Envoyer le lien" envoie l'email
4. ✅ Message de confirmation "Email envoyé !" s'affiche
5. ✅ Email reçu avec bouton rouge stylisé
6. ✅ Clic sur le bouton redirige vers `/onboarding`
7. ✅ Session créée automatiquement
8. ✅ User peut créer nouveau mot de passe

---

## 🔐 Sécurité

Les liens de réinitialisation sont :

- ✅ **À usage unique** : Un lien ne peut être utilisé qu'une fois
- ✅ **Limités dans le temps** : Expirent après 1 heure par défaut
- ✅ **Sécurisés** : Token cryptographique généré aléatoirement
- ✅ **Invalidés** : Après utilisation ou création d'un nouveau mot de passe

---

## 📧 Template Email de Test

Si tu veux tester sans configurer le template, Supabase utilise ce template par défaut :

**Sujet :** Reset Your Password
**Corps :** Click this link to reset your password: {{ .ConfirmationURL }}

Mais c'est beaucoup mieux avec le template personnalisé ASTRA ! 🌟

---

**Si après tout ça, ça ne marche toujours pas, vérifie :**
1. Les logs dans **Dashboard > Logs > Auth Logs**
2. Que ton projet Supabase est bien en mode production (pas en pause)
3. Contacte le support Supabase si problème persistant
