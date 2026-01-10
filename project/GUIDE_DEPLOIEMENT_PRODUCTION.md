# Guide de Déploiement en Production

## Vue d'ensemble

Ce guide vous accompagne pas à pas pour déployer votre application Astra en production avec tous les questionnaires réinitialisés et prêts à l'emploi.

## Contenu Créé

### Scripts de Déploiement

Tous les scripts sont disponibles dans le dossier `scripts/` :

1. **`reset-quiz-data.sql`** - Réinitialise toutes les données de questionnaires
2. **`pre-production-checks.ts`** - Vérifie que l'application est prête pour la production
3. **`backup-database.sh`** - Instructions pour créer un backup de la base de données
4. **`deploy-production.sh`** - Script automatique de déploiement complet
5. **`production-config.ts`** - Configuration officielle des questionnaires
6. **`README.md`** - Documentation complète des scripts

### Configuration des Questionnaires

L'application est configurée avec **6 questionnaires** :

#### Gratuits (2)
- **Première Impression** 👋 - 10 questions - 5 min
- **Test de Séduction** 💋 - 12 questions - 7 min

#### Premium (3)
- **Style d'attachement** 💕 - 14 questions - 10 min
- **Archétype amoureux** 🌟 - 14 questions - 15 min
- **Test de compatibilité** ❤️ - 8 questions - 8 min

#### Elite (1)
- **Thème astral complet** ✨ - 15 questions - 12 min

## Déploiement Rapide

### Option 1 : Script Automatique (Recommandé)

```bash
# Rendre le script exécutable
chmod +x scripts/deploy-production.sh

# Lancer le déploiement complet
./scripts/deploy-production.sh
```

Le script va :
1. Créer un backup de la base de données
2. Réinitialiser les données de quiz (optionnel)
3. Effectuer les vérifications pré-production
4. Builder l'application
5. Vérifier le build
6. Déployer en production

### Option 2 : Étape par Étape

#### 1. Backup de la base de données

**CRUCIAL : Ne jamais sauter cette étape !**

Via l'interface Supabase :
1. Aller sur https://app.supabase.com
2. Sélectionner votre projet
3. Database > Backups
4. Cliquer sur "Start a backup"
5. Attendre la fin du backup

#### 2. Réinitialisation des données (Optionnel)

Si vous voulez repartir sur une base propre sans données de test :

1. Ouvrir le SQL Editor de Supabase
2. Copier le contenu de `scripts/reset-quiz-data.sql`
3. Exécuter le script
4. Vérifier les messages de confirmation

⚠️ **ATTENTION** : Cette opération supprime TOUTES les données de questionnaires !

#### 3. Vérifications pré-production

```bash
# Installer les dépendances
npm install

# Exécuter les vérifications
npx tsx scripts/pre-production-checks.ts
```

Le script vérifie :
- Base de données (tables vides ou non)
- Configuration des 6 questionnaires
- Variables d'environnement
- Système Premium
- Sécurité

#### 4. Build de production

```bash
npm run build
```

Le build doit se terminer sans erreur.

#### 5. Déploiement

Selon votre plateforme :

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# Firebase
firebase deploy
```

## Après le Déploiement

### Vérifications Essentielles

1. **Tester tous les questionnaires**
   - Vérifier que les 6 questionnaires sont accessibles
   - Compléter chaque questionnaire pour tester le parcours complet
   - Vérifier que l'analyse Astra fonctionne

2. **Vérifier le système Premium**
   - Tester l'accès aux questionnaires Premium
   - Vérifier les limitations pour les comptes gratuits
   - Tester un abonnement de test

3. **Tester sur mobile**
   - Vérifier l'affichage responsive
   - Tester les interactions tactiles
   - Vérifier la navigation

4. **Surveiller les logs**
   - Vérifier les erreurs dans les logs
   - Surveiller les performances
   - Vérifier les métriques d'utilisation

### État Initial Attendu

#### Page Questionnaires

Tous les utilisateurs verront :
- 2 questionnaires gratuits (débloqués)
- 4 questionnaires Premium/Elite (verrouillés avec badge)
- Bouton "Commencer" pour les gratuits
- Bouton "Débloquer avec Premium" pour les autres

#### Page "Mes Résultats"

État vide avec message :
```
📊 Mes Résultats

Aucun résultat pour le moment

Complète ton premier questionnaire
pour découvrir ton profil !

[🚀 Découvrir les questionnaires]
```

## Structure des Données

### Tables de Base de Données

Après le reset, les tables suivantes seront vides :
- `quiz_results` - Résultats des questionnaires
- `questionnaire_results` - Résultats détaillés

Les tables suivantes sont préservées :
- `astra_profiles` - Profils utilisateurs
- `subscription_tiers` - Tiers d'abonnement
- `astra_conversations` - Conversations avec Astra
- `matches` - Matches entre utilisateurs
- `swipes` - Historique de swipes

## Limites par Abonnement

### Gratuit
- 2 questionnaires accessibles
- 10 messages Astra/jour
- Profil basique

### Premium
- 5 questionnaires accessibles
- 50 messages Astra/jour
- Analyses détaillées
- Boost de profil
- Mode incognito

### Elite
- 6 questionnaires (tous)
- Messages Astra illimités
- Analyses illimitées
- Badge Elite
- Support prioritaire

## Dépannage

### Le build échoue

```bash
# Nettoyer et réinstaller
rm -rf node_modules dist
npm install
npm run build
```

### Les vérifications échouent

Vérifier :
1. Variables d'environnement (.env)
2. Connexion à Supabase
3. Migrations de base de données appliquées

### Erreurs Supabase

1. Vérifier le statut : https://status.supabase.com
2. Vérifier les permissions RLS
3. Vérifier les logs dans le dashboard Supabase

## Checklist Finale

Avant de déclarer le déploiement terminé :

- [ ] Backup de la base de données créé
- [ ] Données de test nettoyées (si nécessaire)
- [ ] Application accessible en production
- [ ] Les 6 questionnaires fonctionnent
- [ ] Analyses Astra opérationnelles
- [ ] Système Premium vérifié
- [ ] Tests mobile effectués
- [ ] Logs d'erreur propres
- [ ] Variables d'environnement configurées
- [ ] Stripe configuré (si utilisé)
- [ ] Monitoring en place

## Support et Ressources

### Documentation
- Supabase : https://supabase.com/docs
- React : https://react.dev
- Vite : https://vitejs.dev

### Commandes Utiles

```bash
# Vérifier les variables d'environnement
cat .env

# Vérifier la version de Node
node --version

# Vérifier les dépendances
npm list

# Nettoyer le cache
npm cache clean --force

# Vérifier les logs (selon la plateforme)
vercel logs
netlify logs
```

## Prochaines Étapes

Une fois le déploiement terminé :

1. **Monitoring** - Mettre en place des alertes pour les erreurs
2. **Analytics** - Suivre l'utilisation des questionnaires
3. **Feedback** - Collecter les retours utilisateurs
4. **Optimisation** - Améliorer les performances selon les métriques
5. **Itération** - Ajouter de nouveaux questionnaires si nécessaire

## Conclusion

Votre application Astra est maintenant prête pour la production avec :
- 6 questionnaires complets et fonctionnels
- Système Premium opérationnel
- Base de données propre et sécurisée
- Scripts de maintenance et déploiement

Bonne chance avec votre lancement ! 🚀

---

**Date de création** : 7 décembre 2025
**Version** : 1.0.0
**Dernière mise à jour** : 7 décembre 2025
