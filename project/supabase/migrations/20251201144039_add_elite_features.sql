/*
  # Add Elite Features

  1. New Columns for astra_profiles
    - `incognito_mode` (boolean) - Elite incognito mode
    - `profile_visibility_boost` (integer) - Visibility boost score

  2. New Table
    - `profile_visits` - Track profile visitors (Elite feature)
      - `visitor_id` (uuid) - Who visited
      - `visited_id` (uuid) - Whose profile was visited
      - `visited_at` (timestamptz) - When visited
      - `visitor_profile` relation

  3. Security
    - RLS policies for profile_visits
*/

-- Add Elite features to astra_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'incognito_mode'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN incognito_mode BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'profile_visibility_boost'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN profile_visibility_boost INTEGER DEFAULT 1 CHECK (profile_visibility_boost >= 1 AND profile_visibility_boost <= 10);
  END IF;
END $$;

-- Create profile_visits table
CREATE TABLE IF NOT EXISTS profile_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid REFERENCES astra_profiles(id) ON DELETE CASCADE,
  visited_id uuid REFERENCES astra_profiles(id) ON DELETE CASCADE,
  visited_at timestamptz DEFAULT now(),
  UNIQUE(visitor_id, visited_id, visited_at)
);

-- Enable RLS
ALTER TABLE profile_visits ENABLE ROW LEVEL SECURITY;

-- Policies for profile_visits
CREATE POLICY "Users can view visits to their own profile"
  ON profile_visits
  FOR SELECT
  TO authenticated
  USING (
    visited_id = auth.uid() 
    AND 
    EXISTS (
      SELECT 1 FROM astra_profiles 
      WHERE id = auth.uid() 
      AND premium_tier = 'premium_elite'
    )
  );

CREATE POLICY "System can insert visit records"
  ON profile_visits
  FOR INSERT
  TO authenticated
  WITH CHECK (visitor_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profile_visits_visited_id ON profile_visits(visited_id, visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_visits_visitor_id ON profile_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_astra_profiles_incognito ON astra_profiles(incognito_mode) WHERE incognito_mode = true;

-- Comments
COMMENT ON COLUMN astra_profiles.incognito_mode IS 'Elite feature: Browse invisibly';
COMMENT ON COLUMN astra_profiles.profile_visibility_boost IS 'Visibility boost multiplier (1=free, 3=premium, 10=elite)';
COMMENT ON TABLE profile_visits IS 'Track profile visitors (Elite can see who visited)';
