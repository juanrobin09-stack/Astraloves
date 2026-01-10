/*
  # Create Premium Matches Table
  
  1. New Tables
    - `premium_matches`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `matched_user_id` (uuid, references auth.users)
      - `compatibility_score` (int)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `premium_matches` table
    - Add policy for users to view their own matches
*/

CREATE TABLE IF NOT EXISTS premium_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  matched_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  compatibility_score int DEFAULT 85 CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, matched_user_id)
);

ALTER TABLE premium_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own matches"
  ON premium_matches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can create their own matches"
  ON premium_matches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_premium_matches_user_id ON premium_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_matches_matched_user_id ON premium_matches(matched_user_id);