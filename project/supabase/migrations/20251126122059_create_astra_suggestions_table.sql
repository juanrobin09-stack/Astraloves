/*
  # Create Astra Suggestions System

  1. New Tables
    - `astra_suggestions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - who gets the suggestion
      - `suggested_user_id` (uuid, references auth.users) - who is suggested
      - `score` (integer) - compatibility score
      - `status` (text) - pending/accepted/declined
      - `suggested_at` (timestamp) - when suggestion was made
      - `responded_at` (timestamp) - when user responded

  2. Security
    - Enable RLS on `astra_suggestions` table
    - Add policies for users to view their own suggestions
    - Add policy for system to create suggestions

  3. Notes
    - This creates a queue system where Astra can suggest matches proactively
    - Users can accept or decline suggestions
    - Accepted suggestions create private conversations
*/

CREATE TABLE IF NOT EXISTS astra_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  suggested_user_id uuid REFERENCES auth.users NOT NULL,
  score integer DEFAULT 85 CHECK (score >= 0 AND score <= 100),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  suggested_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE astra_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own suggestions"
  ON astra_suggestions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions"
  ON astra_suggestions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create suggestions"
  ON astra_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_astra_suggestions_user_status 
  ON astra_suggestions(user_id, status, score DESC);

CREATE INDEX IF NOT EXISTS idx_astra_suggestions_suggested_at 
  ON astra_suggestions(suggested_at DESC);
