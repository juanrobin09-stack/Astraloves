# 🔧 Debug Chat Astra - "Désolé, une erreur est survenue"

## ❌ Erreur rencontrée
```
Désolé, une erreur est survenue. Réessayez plus tard.
```

## 🔍 Causes possibles

### 1. ⚠️ OPENAI_API_KEY non configurée dans Supabase (PLUS PROBABLE)

**Symptôme :** L'erreur apparaît immédiatement après avoir envoyé un message.

**Solution :**
1. Va sur [Supabase Dashboard](https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/settings/functions)
2. Clique sur **Secrets** (dans le menu Edge Functions)
3. Vérifie si `OPENAI_API_KEY` existe
4. Si NON → Ajoute-le :
   - Name: `OPENAI_API_KEY`
   - Value: `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`
5. Clique **Create secret**

### 2. 🔑 Clé OpenAI invalide ou expirée

**Symptôme :** Erreur 401 Unauthorized dans les logs.

**Solution :**
1. Va sur [OpenAI Platform](https://platform.openai.com/api-keys)
2. Vérifie que la clé existe et est active
3. Si expirée → Génère une nouvelle clé
4. Mets à jour le secret dans Supabase

### 3. 💳 Compte OpenAI sans crédit

**Symptôme :** Erreur 429 ou "insufficient_quota" dans les logs.

**Solution :**
1. Va sur [OpenAI Billing](https://platform.openai.com/account/billing)
2. Ajoute une méthode de paiement
3. Recharge ton compte (minimum 5$)

### 4. 🚫 Edge Function non déployée

**Symptôme :** Erreur "Function not found".

**Solution :**
```bash
# Vérifie que l'edge function existe
ls supabase/functions/astra-chat/index.ts

# Si le fichier existe, la fonction est bien là
```

## 🧪 Tests de diagnostic

### Test 1 : Console Browser (F12)

Ouvre la console browser et regarde les erreurs quand tu envoies un message :

```javascript
// Cherche ces logs :
[useAstraChatLimit] Edge function error: ...
[Astra] Error in sendMessage: ...

// Note l'erreur exacte affichée
```

### Test 2 : Logs Supabase

1. Va sur [Supabase Logs](https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/logs/edge-functions)
2. Filtre par fonction : `astra-chat`
3. Cherche les erreurs récentes :
   - `OpenAI API key not configured` → Retour à Solution 1
   - `401 Unauthorized` → Retour à Solution 2
   - `429 Too Many Requests` → Retour à Solution 3

### Test 3 : Vérification locale

```bash
# Lance l'app en local
npm run dev

# Ouvre la console browser (F12)
# Envoie un message à Astra
# Copie l'erreur complète ici
```

## 🔧 Solution Express (90% des cas)

**Si le chat ne marche pas, c'est presque toujours la clé OpenAI manquante dans Supabase.**

### Configuration rapide (2 minutes)

1. **Dashboard Supabase** : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/settings/functions

2. **Onglet Secrets** → **Add secret**

3. **Remplis** :
   ```
   Name: OPENAI_API_KEY
   Value: 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
   ```

4. **Create secret**

5. **Teste immédiatement** :
   - Rafraîchis l'app
   - Envoie un message à Astra
   - Elle doit répondre en 2-3 secondes ✅

## 📊 Vérification finale

Une fois la clé configurée, dans la console browser tu dois voir :

```
[Astra] Sending message to conversation: xxx
[Astra] User message saved
[useAstraChatLimit] Calling edge function...
[Astra Edge] Received chat request
[Astra Edge] Calling OpenAI API...
[Astra Edge] Successfully generated response
[Astra] AI response received, length: 150
[Astra] AI message saved
✅ Message flow completed successfully
```

## 🆘 Si ça ne marche toujours pas

**Vérifie dans cet ordre :**

1. ✅ Secret `OPENAI_API_KEY` existe dans Supabase
2. ✅ Clé OpenAI valide (teste sur https://platform.openai.com/playground)
3. ✅ Compte OpenAI avec crédit (minimum 5$)
4. ✅ Pas d'erreur dans les logs Supabase
5. ✅ Console browser montre l'erreur exacte

**Si tout est OK mais ça ne marche toujours pas :**
- Copie l'erreur complète de la console browser
- Copie les logs Supabase de l'edge function
- On debuggera ensemble

## 🚀 Checklist Rapide

- [ ] Clé OPENAI_API_KEY dans Supabase Secrets
- [ ] Clé OpenAI valide et active
- [ ] Compte OpenAI avec crédit
- [ ] Logs Supabase sans erreur
- [ ] Console browser sans erreur
- [ ] Message envoyé → Réponse Astra reçue ✅

---

**💡 Astuce :** 95% du temps, le problème vient de la clé OpenAI manquante dans Supabase. Configure-la en premier !
