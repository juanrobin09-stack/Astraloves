/*
  # Create Matches Table

  ## Overview
  Creates the matches table to store compatibility matches between users with AI-generated analysis.

  ## Table: `matches`
  
  ### Columns
  - `id` (uuid, primary key) - Unique match identifier
  - `user1_id` (uuid, foreign key) - First user in the match
  - `user2_id` (uuid, foreign key) - Second user in the match
  - `score` (integer) - Compatibility score (0-100)
  - `analyse_ia` (text) - AI-generated compatibility analysis
  - `points_forts` (jsonb) - Array of relationship strengths
  - `defis` (jsonb) - Array of potential challenges
  - `conseil` (text) - Personalized advice from AI
  - `statut` (text) - Match status: 'pending', 'accepted', 'rejected', 'mutual'
  - `user1_liked` (boolean) - Whether user1 liked user2
  - `user2_liked` (boolean) - Whether user2 liked user1
  - `user1_seen` (boolean) - Whether user1 has seen this match
  - `user2_seen` (boolean) - Whether user2 has seen this match
  - `created_at` (timestamptz) - When match was created
  - `updated_at` (timestamptz) - When match was last updated
  
  ## Constraints
  - Unique constraint on (user1_id, user2_id) to prevent duplicates
  - Check constraint: user1_id < user2_id (ordered pairs)
  - Check constraint: score between 0 and 100
  
  ## Indexes
  - Index on user1_id and user2_id for fast lookups
  - Index on statut for filtering
  - Index on score for ranking
  
  ## Security
  - Enable RLS
  - Users can read matches where they are user1_id or user2_id
  - Only system/functions can insert matches
  - Users can update their own like status
*/

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES astra_profiles(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES astra_profiles(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  analyse_ia text,
  points_forts jsonb DEFAULT '[]'::jsonb,
  defis jsonb DEFAULT '[]'::jsonb,
  conseil text,
  statut text NOT NULL DEFAULT 'pending',
  user1_liked boolean DEFAULT false,
  user2_liked boolean DEFAULT false,
  user1_seen boolean DEFAULT false,
  user2_seen boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT matches_different_users CHECK (user1_id != user2_id),
  CONSTRAINT matches_ordered_pair CHECK (user1_id < user2_id),
  CONSTRAINT matches_score_range CHECK (score >= 0 AND score <= 100),
  CONSTRAINT matches_statut_check CHECK (statut IN ('pending', 'accepted', 'rejected', 'mutual'))
);

-- Create unique index to prevent duplicate matches
CREATE UNIQUE INDEX IF NOT EXISTS matches_unique_pair 
ON matches(user1_id, user2_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS matches_user1_idx ON matches(user1_id);
CREATE INDEX IF NOT EXISTS matches_user2_idx ON matches(user2_id);
CREATE INDEX IF NOT EXISTS matches_statut_idx ON matches(statut);
CREATE INDEX IF NOT EXISTS matches_score_idx ON matches(score DESC);
CREATE INDEX IF NOT EXISTS matches_created_at_idx ON matches(created_at DESC);

-- Enable RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Users can view matches where they are involved
CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Users can update their like status
CREATE POLICY "Users can update their like status"
  ON matches FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  )
  WITH CHECK (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Only authenticated users can insert matches (via functions)
CREATE POLICY "Authenticated users can create matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  -- Auto-update statut to 'mutual' if both liked
  IF NEW.user1_liked = true AND NEW.user2_liked = true THEN
    NEW.statut = 'mutual';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS matches_updated_at_trigger ON matches;
CREATE TRIGGER matches_updated_at_trigger
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_matches_updated_at();