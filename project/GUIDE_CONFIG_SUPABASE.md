# 🚀 Guide de configuration Supabase OTP - 5 minutes

## 📍 URL directe pour ton projet
**Ton projet Supabase :** `vlpyjblasmkugfyfxoia`

### Liens directs (copie-colle dans ton navigateur) :

1. **Email Templates :**
   ```
   https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/templates
   ```

2. **Auth Providers :**
   ```
   https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/providers
   ```

---

## ⚡ Configuration rapide (3 étapes)

### ÉTAPE 1 : Modifier le template Email (2 min)

1. Va sur : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/templates

2. Clique sur **"Magic Link"** dans la liste

3. Dans le champ **"Subject"**, écris :
   ```
   Votre code ASTRA : {{ .Token }}
   ```

4. Dans le champ **"Message (Body)"**, SUPPRIME TOUT et mets :
   ```html
   <h2>Connexion ASTRA</h2>
   <p>Voici ton code de connexion :</p>
   <h1 style="font-size: 48px; letter-spacing: 8px; color: #DC2626;">{{ .Token }}</h1>
   <p><strong>Expire dans 60 minutes</strong></p>
   <p style="color: #666;">Si tu n'as pas demandé ce code, ignore cet email.</p>
   ```

5. Clique sur **"Save"** en bas

---

### ÉTAPE 2 : Activer Email Provider (1 min)

1. Va sur : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/providers

2. Clique sur **"Email"**

3. Vérifie que c'est activé :
   - ✅ **Enable Email provider** : ON
   - ✅ **Confirm email** : OFF (désactivé)
   - ✅ **Secure email change** : OFF (désactivé)

4. Clique sur **"Save"** si modifié

---

### ÉTAPE 3 : Tester (1 min)

1. Va sur ton app
2. Clique "Se connecter"
3. Entre ton email
4. Clique "Recevoir mon code"
5. Vérifie ton email → tu dois voir UNIQUEMENT le code 6 chiffres
6. Entre le code
7. Clique "Vérifier"

✅ **Tu es connecté !**

---

## 🎯 Résultat attendu

### Email avant (MAUVAIS) :
```
Clique sur ce lien pour te connecter :
https://vlpyjblasmkugfyfxoia.supabase.co/auth/v1/verify?token=...
```

### Email après (BON) :
```
Votre code ASTRA : 483920

Connexion ASTRA
Voici ton code de connexion :

483920

Expire dans 60 minutes
```

---

## ❌ Checklist anti-erreurs

Avant de tester, vérifie :

- [ ] Le template "Magic Link" contient `{{ .Token }}` (pas `{{ .ConfirmationURL }}`)
- [ ] Email provider est activé
- [ ] "Confirm email" est DÉSACTIVÉ
- [ ] Tu as cliqué sur "Save" après chaque modification
- [ ] Le code frontend utilise `emailRedirectTo: undefined` ✅ (déjà fait)

---

## 🆘 Problème ?

### "Je reçois toujours un lien"
→ Retourne dans Email Templates, vérifie qu'il n'y a PAS `{{ .ConfirmationURL }}`

### "Code invalide"
→ Attends 2-3 minutes (propagation Supabase) puis réessaye

### "Aucun email reçu"
→ Vérifie tes spams, ou teste avec un autre email

---

## 🔥 C'est tout !

Une fois configuré, le système fonctionnera ainsi :

1. User entre son email → Reçoit code 6 chiffres
2. User entre le code → Connecté instantanément
3. Pas de lien, pas de redirection, pas de problème localhost

**Simple. Fiable. Moderne.**
