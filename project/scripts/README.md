# Scripts de Déploiement et Maintenance

Ce dossier contient tous les scripts nécessaires pour déployer et maintenir l'application en production.

## 📁 Contenu

### Scripts de Déploiement

- **`deploy-production.sh`** - Script principal de déploiement en production
- **`pre-production-checks.ts`** - Vérifications automatiques avant déploiement
- **`backup-database.sh`** - Création de backups de la base de données

### Scripts de Maintenance

- **`reset-quiz-data.sql`** - Réinitialisation complète des données de questionnaires
- **`production-config.ts`** - Configuration officielle des questionnaires pour la production

## 🚀 Déploiement en Production

### Étape 1 : Préparation

Avant de déployer, assurez-vous que :

1. Toutes les variables d'environnement sont configurées
2. Vous avez accès à la base de données Supabase
3. Vous avez les droits de déploiement

### Étape 2 : Backup

**TOUJOURS faire un backup avant toute opération critique !**

```bash
# Via l'interface Supabase (RECOMMANDÉ)
# 1. Aller sur https://app.supabase.com
# 2. Sélectionner votre projet
# 3. Database > Backups > Start a backup

# Ou via le script
chmod +x scripts/backup-database.sh
./scripts/backup-database.sh
```

### Étape 3 : Réinitialisation (OPTIONNEL)

Si vous voulez repartir sur une base propre sans données de test :

```bash
# 1. Ouvrir le SQL Editor de Supabase
# 2. Copier le contenu de scripts/reset-quiz-data.sql
# 3. Exécuter le script
# 4. Vérifier que les tables sont vides
```

⚠️ **ATTENTION** : Cette opération est IRRÉVERSIBLE et supprime TOUTES les données de questionnaires !

### Étape 4 : Vérifications Pré-Production

Exécutez les vérifications automatiques :

```bash
# Installer les dépendances si nécessaire
npm install

# Exécuter les vérifications
npx tsx scripts/pre-production-checks.ts
```

Le script vérifie :
- ✅ État de la base de données
- ✅ Configuration des questionnaires
- ✅ Variables d'environnement
- ✅ Système Premium
- ✅ Sécurité

### Étape 5 : Build

```bash
npm run build
```

Vérifiez que le build se termine sans erreur.

### Étape 6 : Déploiement Complet

Le script automatique orchestre toutes les étapes :

```bash
# Déploiement complet (recommandé)
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh

# Ou avec options
./scripts/deploy-production.sh --skip-backup  # Ignore le backup (NON RECOMMANDÉ)
./scripts/deploy-production.sh --skip-reset   # Ignore le reset des données
./scripts/deploy-production.sh --skip-checks  # Ignore les vérifications
```

## 📊 Configuration des Questionnaires

La configuration officielle se trouve dans `production-config.ts`.

### Questionnaires Disponibles

#### Gratuits (2)
1. **Première Impression** 👋 - 10 questions - 5 min
2. **Test de Séduction** 💋 - 12 questions - 7 min

#### Premium (3)
3. **Style d'attachement** 💕 - 14 questions - 10 min
4. **Archétype amoureux** 🌟 - 14 questions - 15 min
5. **Test de compatibilité** ❤️ - 8 questions - 8 min

#### Elite (1)
6. **Thème astral complet** ✨ - 15 questions - 12 min

### Limites par Abonnement

```typescript
free: {
  max_quizzes_per_day: 2,
  max_astra_messages_per_day: 10,
  available_quizzes: ['first_impression', 'seduction']
}

premium: {
  max_quizzes_per_day: 999,
  max_astra_messages_per_day: 50,
  available_quizzes: ['first_impression', 'seduction', 'attachment', 'archetype', 'compatibility']
}

elite: {
  max_quizzes_per_day: 999,
  max_astra_messages_per_day: 999,
  available_quizzes: ['all']
}
```

## 🔧 Utilisation des Scripts

### Vérifications Pré-Production

```bash
npx tsx scripts/pre-production-checks.ts
```

Sortie attendue :
```
════════════════════════════════════════════════════════════
  VÉRIFICATION BASE DE DONNÉES
════════════════════════════════════════════════════════════

✅ Database - quiz_results: Table vide (prête pour production)
✅ Database - questionnaire_results: Table vide (prête pour production)
✅ Database - astra_profiles: 0 profils dans la base

════════════════════════════════════════════════════════════
  VÉRIFICATION QUESTIONNAIRES
════════════════════════════════════════════════════════════

✅ Questionnaires configurés: 6/6 questionnaires configurés

[...]

🚀 EXCELLENT ! L'application est prête pour la production.
```

### Backup de la Base de Données

```bash
chmod +x scripts/backup-database.sh
./scripts/backup-database.sh
```

Le script fournit des instructions pour créer un backup via :
1. Interface Supabase (recommandé)
2. CLI Supabase
3. pg_dump

### Reset des Données

**À exécuter UNIQUEMENT via le SQL Editor de Supabase**

1. Ouvrir https://app.supabase.com
2. Sélectionner votre projet
3. Aller dans SQL Editor
4. Copier le contenu de `scripts/reset-quiz-data.sql`
5. Exécuter le script
6. Vérifier les messages de confirmation

## 📋 Checklist de Déploiement

Avant le déploiement :

- [ ] Backup de la base de données créé
- [ ] Variables d'environnement configurées
- [ ] Tests locaux passés
- [ ] Build réussi sans erreurs
- [ ] Vérifications pré-production passées

Après le déploiement :

- [ ] Application accessible en production
- [ ] Tous les questionnaires fonctionnels
- [ ] Intégration Astra opérationnelle
- [ ] Système Premium vérifié
- [ ] Tests sur mobile effectués
- [ ] Logs d'erreur surveillés

## 🔐 Sécurité

### Variables d'Environnement en Production

Assurez-vous que ces variables sont configurées :

```env
NODE_ENV=production
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### Recommandations de Sécurité

1. **Ne jamais** commiter les fichiers `.env`
2. **Toujours** créer un backup avant toute opération critique
3. **Vérifier** les permissions de la base de données
4. **Tester** en environnement de staging d'abord
5. **Surveiller** les logs après déploiement

## 🆘 Dépannage

### Le build échoue

```bash
# Nettoyer le cache
rm -rf node_modules dist
npm install
npm run build
```

### Les vérifications échouent

Vérifiez :
1. Les variables d'environnement
2. La connexion à Supabase
3. Les migrations de base de données

### Erreurs de déploiement

Consultez les logs spécifiques à votre plateforme :
- Vercel : `vercel logs`
- Netlify : Voir le dashboard
- Firebase : `firebase functions:log`

## 📞 Support

En cas de problème :

1. Vérifier les logs de l'application
2. Consulter la documentation Supabase
3. Vérifier le statut de Supabase : https://status.supabase.com
4. Contacter le support si nécessaire

## 📝 Notes Importantes

- **Les scripts sont conçus pour être idempotents** : ils peuvent être exécutés plusieurs fois sans problème
- **Le reset des données est IRRÉVERSIBLE** : toujours faire un backup avant
- **Les vérifications pré-production sont optionnelles mais recommandées**
- **Le déploiement automatique dépend de votre plateforme d'hébergement**

## 🎉 Succès !

Si tous les scripts s'exécutent sans erreur, votre application est prête pour la production !

N'oubliez pas de :
- Surveiller les métriques de performance
- Tester tous les parcours utilisateur
- Vérifier les paiements Stripe
- Monitorer les erreurs

Bon déploiement ! 🚀
