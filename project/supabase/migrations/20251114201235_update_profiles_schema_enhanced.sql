/*
  # Enhanced Profile Schema

  ## Overview
  Update profile schema for improved 2-step onboarding process

  ## Changes to `astra_profiles`
  
  ### Modified Columns
  - Rename `username` to `first_name` (more intuitive)
  - Update `goals` to `goal` (single clear objective)
  - Add `custom_goal` (text) for "Autre" option
  - Update `gender_preference` to `preference` (cleaner naming)
  - Add `custom_preference` (text) for "Autre" option
  
  ### New Structure
  - `first_name` (text) - User's first name
  - `age` (integer) - User's age (18-60)
  - `goal` (text) - Main relationship goal
  - `custom_goal` (text, nullable) - Custom goal if "Autre"
  - `preference` (text) - Who they want to attract
  - `custom_preference` (text, nullable) - Custom preference if "Autre"

  ## Important Notes
  1. Maintains backward compatibility with existing data
  2. All existing fields preserved
  3. RLS policies remain unchanged
*/

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'goal'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN goal text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'custom_goal'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN custom_goal text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'preference'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN preference text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'custom_preference'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN custom_preference text;
  END IF;
END $$;

-- Migrate existing data if username exists but first_name doesn't
UPDATE astra_profiles
SET first_name = username
WHERE first_name IS NULL AND username IS NOT NULL;

-- Migrate existing goals to goal field
UPDATE astra_profiles
SET goal = goals
WHERE goal IS NULL AND goals IS NOT NULL;

-- Migrate existing gender_preference to preference field
UPDATE astra_profiles
SET preference = gender_preference
WHERE preference IS NULL AND gender_preference IS NOT NULL;