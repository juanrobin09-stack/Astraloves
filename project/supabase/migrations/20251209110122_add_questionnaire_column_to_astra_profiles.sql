/*
  # Add questionnaire column to astra_profiles

  1. New Columns
    - `questionnaire` (jsonb) - Stores onboarding questionnaire answers
    - `ville_data` (jsonb) - Stores city data with coordinates

  2. Changes
    - Adding missing columns for questionnaire data storage
    - Default empty JSON object for questionnaire

  3. Notes
    - This fixes the error: "Could not find the questionnaire column"
*/

ALTER TABLE astra_profiles 
ADD COLUMN IF NOT EXISTS questionnaire JSONB DEFAULT '{}';

ALTER TABLE astra_profiles 
ADD COLUMN IF NOT EXISTS ville_data JSONB DEFAULT NULL;

COMMENT ON COLUMN astra_profiles.questionnaire IS 'Stores onboarding questionnaire answers (objectif, weekend, lifestyle, valeurs)';
COMMENT ON COLUMN astra_profiles.ville_data IS 'Stores city data with name, postal code and coordinates';