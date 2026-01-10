# ⚡ Configuration OpenAI dans Supabase - ÉTAPE CRITIQUE

## 🎯 Objectif
Configurer ta clé OpenAI dans Supabase pour que l'edge function `astra-chat` puisse appeler l'API OpenAI.

## 🔧 Configuration Supabase Dashboard (OBLIGATOIRE)

### Étape 1 : Accéder aux Secrets
1. Va sur [Supabase Dashboard](https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia)
2. Clique sur **Settings** (roue crantée) dans le menu de gauche
3. Clique sur **Edge Functions** dans le sous-menu
4. Clique sur l'onglet **Secrets**

### Étape 2 : Ajouter le Secret
1. Clique sur **Add secret**
2. Remplis :
   - **Name** : `OPENAI_API_KEY`
   - **Value** : `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`
3. Clique sur **Create secret**

### Étape 3 : Vérifier
Tu devrais voir :
```
✅ OPENAI_API_KEY
   Value: sk-proj-ah_9M... (masqué)
   Created: aujourd'hui
```

## 🧪 Test immédiat

Une fois le secret configuré :

```bash
# 1. Lance l'app locale
npm run dev

# 2. Va sur le Chat Astra
# 3. Envoie un message comme "Bonjour Astra !"
# 4. Astra doit répondre en quelques secondes
```

## 📊 Vérification du fonctionnement

### Dans la console browser (F12)
Tu dois voir :
```
[Astra] Sending message to conversation: xxx
[Astra] User message saved
[Astra Edge] Received chat request with 1 messages
[Astra Edge] Calling OpenAI API...
[Astra Edge] Successfully generated response
[Astra] AI response received, length: 150
[Astra] AI message saved
💬 Chat Astra : 1/10 messages aujourd'hui
```

### Si erreur "OpenAI API key not configured"
→ Le secret n'est pas encore configuré dans Supabase
→ Retourne à l'Étape 2

### Si erreur "401 Unauthorized"
→ La clé OpenAI est invalide
→ Vérifie que tu as copié la clé complète

## 🔒 Sécurité

✅ **BON** : La clé est stockée dans Supabase Edge Functions Secrets
- Jamais exposée côté client
- Chiffrée au repos
- Accessible uniquement par l'edge function

❌ **MAUVAIS** : Ne jamais mettre la clé dans :
- Code source frontend
- Variables d'environnement Vite (VITE_*)
- Repository Git public

## 🚀 Production Ready

Une fois le secret configuré :
- ✅ Tous les utilisateurs FREE peuvent envoyer 10 messages/jour
- ✅ Tous les utilisateurs PREMIUM ont des messages illimités
- ✅ L'API OpenAI est appelée de façon sécurisée
- ✅ Les réponses Astra sont générées en temps réel

**Le Chat Astra est maintenant 100% opérationnel ! 🎉**

## 📞 Support
Si le chat ne répond toujours pas après configuration :
1. Vérifie les logs Supabase : Dashboard → Edge Functions → Logs
2. Cherche "astra-chat" dans les logs
3. Vérifie qu'il n'y a pas d'erreur OpenAI API
