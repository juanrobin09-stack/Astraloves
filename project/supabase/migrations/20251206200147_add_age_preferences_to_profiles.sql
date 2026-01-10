/*
  # Add Age Preferences to Profiles

  1. New Columns
    - `preferred_min_age` (integer) - Minimum age preference for matching (default: calculated automatically)
    - `preferred_max_age` (integer) - Maximum age preference for matching (default: calculated automatically)

  2. Changes
    - Adds user-configurable age range preferences for matching
    - Allows users to override automatic age range calculations
    - Ensures minimum age is never below 18 (legal requirement)

  3. Notes
    - These preferences are optional
    - If not set, the system will calculate age range automatically based on user's age
    - Values must respect legal age constraints
*/

-- Add age preference columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferred_min_age'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_min_age integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferred_max_age'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_max_age integer;
  END IF;
END $$;

-- Add check constraints to ensure valid age preferences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'preferred_min_age_check'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT preferred_min_age_check 
    CHECK (preferred_min_age IS NULL OR preferred_min_age >= 18);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'preferred_max_age_check'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT preferred_max_age_check 
    CHECK (preferred_max_age IS NULL OR preferred_max_age >= 18);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'age_range_logical_check'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT age_range_logical_check 
    CHECK (
      (preferred_min_age IS NULL AND preferred_max_age IS NULL) OR
      (preferred_min_age IS NOT NULL AND preferred_max_age IS NOT NULL AND preferred_min_age <= preferred_max_age)
    );
  END IF;
END $$;
