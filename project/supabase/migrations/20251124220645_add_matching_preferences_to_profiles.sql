/*
  # Add Matching Preferences to Astra Profiles

  ## Overview
  Add essential fields for intelligent match filtering based on orientation, age preferences, and gender.

  ## Changes to `astra_profiles`
  
  ### New Columns
  - `gender` (text) - User's gender identity ("Homme" / "Femme" / "Autre")
  - `seeking` (text) - Who they're looking for ("Une femme" / "Un homme" / "Les deux")
  - `age_min` (integer) - Minimum preferred age for matches (18-65, default 18)
  - `age_max` (integer) - Maximum preferred age for matches (18-65, default 65)

  ## Important Notes
  1. These fields enable orientation and age-based filtering
  2. Default age range is 18-65 (wide range)
  3. All fields nullable to support gradual migration
  4. No breaking changes to existing data
*/

-- Add gender column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'gender'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN gender text;
  END IF;
END $$;

-- Add seeking column (who they're looking for)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'seeking'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN seeking text;
  END IF;
END $$;

-- Add age_min column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'age_min'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN age_min integer DEFAULT 18 CHECK (age_min >= 18 AND age_min <= 65);
  END IF;
END $$;

-- Add age_max column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'age_max'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN age_max integer DEFAULT 65 CHECK (age_max >= 18 AND age_max <= 65);
  END IF;
END $$;

-- Set default values for existing users (wide range)
UPDATE astra_profiles
SET age_min = 18
WHERE age_min IS NULL;

UPDATE astra_profiles
SET age_max = 65
WHERE age_max IS NULL;