/*
  # Ajouter colonne onboarding_completed

  ## Description
  Ajoute la colonne `onboarding_completed` à la table `astra_profiles` pour suivre
  si l'utilisateur a terminé le questionnaire d'inscription.

  ## Modifications
  1. Nouvelles Colonnes
     - `onboarding_completed` (boolean, default: false) - Indique si l'onboarding est terminé
     - `onboarding_completed_at` (timestamptz, nullable) - Date de complétion de l'onboarding

  ## Notes Importantes
  - Les utilisateurs existants auront `onboarding_completed = false` par défaut
  - Cette colonne est critique pour éviter que le questionnaire ne se réaffiche en boucle
  - La date de complétion permet de suivre quand l'utilisateur a terminé l'onboarding
*/

-- Ajouter la colonne onboarding_completed si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;
END $$;

-- Ajouter la colonne onboarding_completed_at si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'onboarding_completed_at'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN onboarding_completed_at timestamptz;
  END IF;
END $$;

-- Mettre à jour les profils existants qui ont un first_name et une date de naissance
-- On considère qu'ils ont complété l'onboarding
UPDATE astra_profiles
SET 
  onboarding_completed = true,
  onboarding_completed_at = COALESCE(updated_at, created_at)
WHERE 
  first_name IS NOT NULL 
  AND first_name != ''
  AND birth_date IS NOT NULL
  AND onboarding_completed = false;

-- Créer un index pour améliorer les performances des requêtes de vérification
CREATE INDEX IF NOT EXISTS idx_astra_profiles_onboarding_completed 
ON astra_profiles(onboarding_completed) 
WHERE onboarding_completed = false;