# 🚀 GUIDE RAPIDE - INSTALLATION SQL

## 📋 ÉTAPE PAR ÉTAPE

### 1. Ouvrir Supabase SQL Editor
1. Va sur [supabase.com](https://supabase.com)
2. Sélectionne ton projet **AstraLoves**
3. Dans le menu de gauche, clique sur **SQL Editor**

### 2. Créer une nouvelle query
1. Clique sur **"New query"** en haut à droite
2. Donne un nom: `ASTRA Complete Migrations`

### 3. Copier/Coller le SQL complet
1. Ouvre le fichier : `supabase/migrations/COMPLETE_MIGRATIONS.sql`
2. **Copie TOUT le contenu** (Ctrl+A, Ctrl+C)
3. **Colle dans l'éditeur SQL** de Supabase (Ctrl+V)

### 4. Exécuter
1. Clique sur **"Run"** (ou appuie sur Ctrl+Enter)
2. Attends quelques secondes
3. Tu devrais voir : ✅ `Toutes les tables sont créées avec succès !`

---

## ✅ VÉRIFICATION

Après l'exécution, tu peux vérifier que tout est bien créé :

```sql
-- Vérifier les tables créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('daily_usage', 'quiz_results', 'astral_themes', 'insights_history');
```

Tu devrais voir **4 tables** :
- ✅ daily_usage
- ✅ quiz_results
- ✅ astral_themes
- ✅ insights_history

---

## 📊 CE QUI A ÉTÉ CRÉÉ

### 1. **daily_usage** - Compteurs journaliers
- Signaux cosmiques
- Super Nova
- Messages Astra
- Messages matchs
- Super Likes
- Reset automatique à minuit

### 2. **quiz_results** - Historique questionnaires
- Toutes les réponses
- Analyses IA (basique, premium, elite)
- Archétypes
- Progression

### 3. **astral_themes** - Thème astral (Elite)
- Soleil, Lune, Ascendant
- Toutes les planètes
- Maisons
- Analyses complètes

### 4. **insights_history** - Journal d'insights
- Timeline des découvertes
- Tags et favoris
- Types variés

### 5. **Fonctions automatiques**
- ✅ Reset quotidien des compteurs
- ✅ Initialisation auto pour nouveaux users
- ✅ Triggers pour tout automatiser

### 6. **Sécurité (RLS)**
- ✅ Chaque user ne voit que ses données
- ✅ Policies strictes
- ✅ Pas d'accès croisé

---

## 🐛 EN CAS D'ERREUR

### Erreur : "relation already exists"
**Cause** : Les tables existent déjà
**Solution** : C'est OK ! Ça veut dire que c'est déjà installé

### Erreur : "column already exists"
**Cause** : Les colonnes existent déjà
**Solution** : C'est OK ! Le script utilise `IF NOT EXISTS`

### Erreur : "permission denied"
**Cause** : Pas les droits admin
**Solution** : Utilise le compte propriétaire du projet Supabase

---

## 🧪 TESTER

Après installation, teste avec cette query :

```sql
-- Insérer un test dans daily_usage
INSERT INTO daily_usage (user_id, cosmic_signals, last_reset)
VALUES (auth.uid(), 5, CURRENT_DATE)
ON CONFLICT (user_id) 
DO UPDATE SET cosmic_signals = 5;

-- Vérifier
SELECT * FROM daily_usage WHERE user_id = auth.uid();
```

Si ça fonctionne, **tout est OK !** ✅

---

## 📞 PROCHAINE ÉTAPE

Après avoir exécuté le SQL :

1. ✅ Les tables sont créées
2. ✅ Le hook `useFeatureAccess` fonctionnera
3. ✅ Les compteurs seront trackés
4. ✅ Le reset quotidien est automatique

**Tu peux maintenant intégrer le code React !** 🚀

---

## 💡 NOTES IMPORTANTES

- Les compteurs se reset **automatiquement à minuit**
- Les nouveaux users ont **automatiquement** une entrée dans `daily_usage`
- Tout est **sécurisé** avec RLS
- **Aucune action manuelle** requise après installation

**C'est tout ! Le système est prêt. 🌟**
