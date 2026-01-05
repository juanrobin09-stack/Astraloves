/*
  # Add Subscription Limits Tracking

  1. New Columns for astra_profiles table
    - `daily_swipes` (integer) - Track daily swipe count
    - `daily_astra_messages` (integer) - Track daily Astra messages
    - `daily_match_messages` (integer) - Track daily match messages
    - `daily_super_likes` (integer) - Track daily super likes
    - `weekly_lives` (integer) - Track weekly live sessions
    - `live_reactions` (integer) - Track live reactions per stream

  2. Changes
    - Add default values for all counters (0)
    - Add indexes for performance
*/

-- Add subscription tracking columns to astra_profiles
DO $$
BEGIN
  -- Daily swipes counter
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'daily_swipes'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN daily_swipes INTEGER DEFAULT 0 NOT NULL;
  END IF;

  -- Daily Astra messages counter
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'daily_astra_messages'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN daily_astra_messages INTEGER DEFAULT 0 NOT NULL;
  END IF;

  -- Daily match messages counter
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'daily_match_messages'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN daily_match_messages INTEGER DEFAULT 0 NOT NULL;
  END IF;

  -- Daily super likes counter
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'daily_super_likes'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN daily_super_likes INTEGER DEFAULT 0 NOT NULL;
  END IF;

  -- Weekly lives counter
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'weekly_lives'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN weekly_lives INTEGER DEFAULT 0 NOT NULL;
  END IF;

  -- Live reactions counter
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'live_reactions'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN live_reactions INTEGER DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_astra_profiles_premium_tier ON astra_profiles(premium_tier);
CREATE INDEX IF NOT EXISTS idx_astra_profiles_daily_limits ON astra_profiles(daily_swipes, daily_astra_messages);

-- Add helpful comments
COMMENT ON COLUMN astra_profiles.daily_swipes IS 'Number of swipes used today (resets daily)';
COMMENT ON COLUMN astra_profiles.daily_astra_messages IS 'Number of Astra messages sent today (resets daily)';
COMMENT ON COLUMN astra_profiles.daily_match_messages IS 'Number of match messages sent today (resets daily)';
COMMENT ON COLUMN astra_profiles.daily_super_likes IS 'Number of super likes used today (resets daily)';
COMMENT ON COLUMN astra_profiles.weekly_lives IS 'Number of lives started this week (resets weekly)';
COMMENT ON COLUMN astra_profiles.live_reactions IS 'Number of reactions sent in current live (resets per stream)';
