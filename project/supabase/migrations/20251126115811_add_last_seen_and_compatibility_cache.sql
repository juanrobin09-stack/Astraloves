/*
  # Add last_seen_at and compatibility_cache to astra_profiles

  1. Changes
    - Add `last_seen_at` timestamp column to track user activity
    - Add `compatibility_cache` jsonb column for caching compatibility data

  2. Notes
    - last_seen_at updates when user logs in or is active
    - compatibility_cache stores pre-calculated match scores for performance
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'last_seen_at'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN last_seen_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'compatibility_cache'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN compatibility_cache jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;
