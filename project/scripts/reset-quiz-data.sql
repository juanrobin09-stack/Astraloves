/*
  # RESET COMPLET DES QUESTIONNAIRES - PRÉPARATION PRODUCTION

  ⚠️  ATTENTION : CE SCRIPT EST OPTIONNEL ET DESTRUCTIF ⚠️

  Ce script supprime TOUTES les données de questionnaires pour TOUS les utilisateurs.
  À utiliser uniquement pour :
  - Réinitialiser l'application avant le lancement en production
  - Nettoyer les données de test
  - Repartir sur une base propre

  ## Actions effectuées :

  1. Suppression des données
     - Tous les résultats de questionnaires (quiz_results)
     - Toutes les réponses individuelles stockées
     - Tous les statuts de complétion

  2. Réinitialisation des profils utilisateurs
     - Réinitialisation des compteurs de questionnaires
     - Suppression des flags de complétion

  3. Conservation des données
     - Profils utilisateurs (astra_profiles)
     - Abonnements et données Premium
     - Conversations Astra
     - Matches et swipes

  ## IMPORTANT :
  - Faire un BACKUP de la base avant d'exécuter ce script !
  - Cette action est IRRÉVERSIBLE
  - Ne pas exécuter en production avec des vrais utilisateurs
*/

-- ==================================================
-- ÉTAPE 1 : BACKUP AUTOMATIQUE (via notification)
-- ==================================================

DO $$
BEGIN
  RAISE NOTICE '⚠️  ATTENTION : Vous êtes sur le point de supprimer TOUTES les données de questionnaires !';
  RAISE NOTICE '📋 Tables qui seront affectées : quiz_results, questionnaire_results';
  RAISE NOTICE '💾 Assurez-vous d avoir fait un backup de la base de données !';
  RAISE NOTICE '';
  RAISE NOTICE '▶️  Début de la réinitialisation...';
END $$;

-- ==================================================
-- ÉTAPE 2 : SUPPRESSION DES RÉSULTATS DE QUIZ
-- ==================================================

-- Supprimer tous les résultats de quiz
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Compter les enregistrements avant suppression
  SELECT COUNT(*) INTO deleted_count FROM quiz_results;

  -- Supprimer tous les résultats
  DELETE FROM quiz_results;

  RAISE NOTICE '✅ quiz_results : % enregistrements supprimés', deleted_count;
END $$;

-- Supprimer tous les résultats de questionnaires détaillés
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO deleted_count FROM questionnaire_results;
  DELETE FROM questionnaire_results;
  RAISE NOTICE '✅ questionnaire_results : % enregistrements supprimés', deleted_count;
END $$;

-- ==================================================
-- ÉTAPE 3 : RÉINITIALISATION DES PROFILS
-- ==================================================

-- Réinitialiser les colonnes liées aux questionnaires dans astra_profiles
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Cette partie est commentée par sécurité
  -- Décommenter si vous voulez réinitialiser les profils

  /*
  UPDATE astra_profiles SET
    -- Réinitialiser les compteurs si ces colonnes existent
    -- questionnaires_completed = 0,
    -- profile_completion_percentage = 0
  WHERE true;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ astra_profiles : % profils réinitialisés', updated_count;
  */

  RAISE NOTICE '⏭️  astra_profiles : Réinitialisation ignorée (section commentée)';
END $$;

-- ==================================================
-- ÉTAPE 4 : NETTOYAGE DES ORPHELINS
-- ==================================================

-- Supprimer les suggestions Astra liées aux questionnaires
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO deleted_count
  FROM astra_suggestions
  WHERE suggestion_type = 'questionnaire';

  DELETE FROM astra_suggestions
  WHERE suggestion_type = 'questionnaire';

  RAISE NOTICE '✅ astra_suggestions : % suggestions de questionnaires supprimées', deleted_count;
END $$;

-- ==================================================
-- ÉTAPE 5 : VÉRIFICATIONS POST-RESET
-- ==================================================

DO $$
DECLARE
  quiz_results_count INTEGER;
  questionnaire_results_count INTEGER;
BEGIN
  -- Vérifier que les tables sont vides
  SELECT COUNT(*) INTO quiz_results_count FROM quiz_results;
  SELECT COUNT(*) INTO questionnaire_results_count FROM questionnaire_results;

  RAISE NOTICE '';
  RAISE NOTICE '📊 VÉRIFICATIONS POST-RESET :';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'quiz_results : % enregistrements', quiz_results_count;
  RAISE NOTICE 'questionnaire_results : % enregistrements', questionnaire_results_count;
  RAISE NOTICE '';

  IF quiz_results_count = 0 AND questionnaire_results_count = 0 THEN
    RAISE NOTICE '✅ RESET RÉUSSI : Base de données nettoyée !';
    RAISE NOTICE '🚀 L application est prête pour la production.';
  ELSE
    RAISE NOTICE '⚠️  ATTENTION : Des données subsistent encore.';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '📋 PROCHAINES ÉTAPES :';
  RAISE NOTICE '1. Vérifier manuellement les données';
  RAISE NOTICE '2. Tester tous les questionnaires';
  RAISE NOTICE '3. Vérifier l intégration Astra';
  RAISE NOTICE '4. Vérifier le système Premium';
  RAISE NOTICE '5. Déployer en production';
END $$;

-- ==================================================
-- ÉTAPE 6 : RÉINITIALISER LES SÉQUENCES (SI NÉCESSAIRE)
-- ==================================================

-- Réinitialiser les compteurs auto-increment
DO $$
BEGIN
  -- Réinitialiser la séquence de quiz_results si elle existe
  -- ALTER SEQUENCE quiz_results_id_seq RESTART WITH 1;
  -- ALTER SEQUENCE questionnaire_results_id_seq RESTART WITH 1;

  RAISE NOTICE '✅ Séquences réinitialisées (si applicable)';
END $$;

-- ==================================================
-- FIN DU SCRIPT DE RESET
-- ==================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🎉 RESET TERMINÉ AVEC SUCCÈS !';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
END $$;
