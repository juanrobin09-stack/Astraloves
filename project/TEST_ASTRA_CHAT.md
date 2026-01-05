# 🧪 Test Rapide - Chat Astra

## ⚡ Action IMMÉDIATE (2 minutes)

### Étape 1 : Configure la clé dans Supabase

**👉 CLIQUE ICI : https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/settings/functions**

1. Clique sur l'onglet **"Secrets"**
2. Clique sur **"Add secret"**
3. Remplis :
   - **Name** : `OPENAI_API_KEY`
   - **Value** : `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`
4. Clique **"Create secret"**

### Étape 2 : Teste immédiatement

```bash
# Lance l'app
npm run dev
```

1. Va sur **Messages** → **Astra**
2. Envoie : `"Bonjour Astra !"`
3. **Résultat attendu** : Réponse en 2-3 secondes ✅

## 🔍 Si ça ne marche toujours pas

### Vérifie la console browser (F12)

Ouvre la console et cherche l'erreur exacte :

```javascript
// Erreurs possibles :

1. "OpenAI API key not configured"
   → La clé n'est pas dans Supabase Secrets
   → Retour à Étape 1

2. "401 Unauthorized"
   → Clé OpenAI invalide
   → Vérifie sur https://platform.openai.com/api-keys

3. "429 Too Many Requests"
   → Compte OpenAI sans crédit
   → Va sur https://platform.openai.com/account/billing

4. "Function not found"
   → Edge function non déployée (rare)
   → Vérifie que supabase/functions/astra-chat/index.ts existe
```

## 📊 Logs attendus dans la console

**✅ Succès :**
```
[Astra] Sending message to conversation: xxx
[useAstraChatLimit] Calling edge function...
[Astra Edge] Received chat request with 1 messages
[Astra Edge] Calling OpenAI API...
[Astra Edge] Successfully generated response
[Astra] AI response received, length: 150
💬 Chat Astra : 1/10 messages aujourd'hui
```

**❌ Erreur (clé manquante) :**
```
[useAstraChatLimit] Edge function error: {...}
[Astra] Error in sendMessage: OpenAI API key not configured
```

## 🎯 Checklist Ultra-Rapide

- [ ] **1 min** : Secret OPENAI_API_KEY créé dans Supabase
- [ ] **30 sec** : App lancée (`npm run dev`)
- [ ] **10 sec** : Message envoyé à Astra
- [ ] **3 sec** : Astra répond ✅

**Total : 2 minutes pour un chat fonctionnel !**

## 🆘 Besoin d'aide ?

**Copie-colle ces infos :**

1. **Erreur console browser** (F12) :
   ```
   [Colle l'erreur ici]
   ```

2. **Logs Supabase** (Dashboard → Logs → Edge Functions → astra-chat) :
   ```
   [Colle les logs ici]
   ```

3. **Secret configuré ?**
   - [ ] Oui, OPENAI_API_KEY existe dans Supabase Secrets
   - [ ] Non, pas encore fait

4. **Clé OpenAI valide ?**
   - [ ] Oui, testée sur OpenAI Playground
   - [ ] Non, pas sûr

---

**🎉 Une fois configuré, le chat fonctionne pour tous les utilisateurs (FREE + PREMIUM) avec limites automatiques !**
