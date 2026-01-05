/*
  # Add interests field to astra_profiles

  1. Changes
    - Add `interests` column to `astra_profiles` table
      - Type: text[] (array of text)
      - Default: empty array
      - Used for storing user's hobbies and interests for compatibility matching

  2. Purpose
    - Enable interest-based compatibility calculation between users
    - Support personalized matching algorithm
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'interests'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN interests text[] DEFAULT '{}';
  END IF;
END $$;

-- Create index for better query performance on interests
CREATE INDEX IF NOT EXISTS idx_astra_profiles_interests ON astra_profiles USING GIN (interests);

COMMENT ON COLUMN astra_profiles.interests IS 'User interests and hobbies for compatibility matching';
