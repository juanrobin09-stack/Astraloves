/*
  # Add profile_updated_at column

  1. Changes
    - Add profile_updated_at column to astra_profiles table
    - This tracks when user last updated their profile
    - Used for "Profile à jour" badge (within 7 days)
    - Used for Astra to comment on profile changes

  2. Security
    - No RLS changes needed
*/

-- Add profile_updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'profile_updated_at'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN profile_updated_at timestamptz;
  END IF;
END $$;