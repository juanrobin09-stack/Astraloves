/*
  # Create Compatibility Matches Schema

  1. New Tables
    - `compatibility_matches`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references astra_profiles) - L'utilisateur qui a demandé la compatibilité
      - `match_user_id` (uuid, references astra_profiles) - L'utilisateur avec qui on calcule la compatibilité
      - `overall_percentage` (integer) - Score global de compatibilité (0-100)
      - `attachment_percentage` (integer) - Score style d'attachement
      - `archetype_percentage` (integer) - Score archétype amoureux
      - `needs_percentage` (integer) - Score besoins amoureux
      - `astral_percentage` (integer) - Score thème astral
      - `astra_analysis` (text) - Analyse détaillée d'Astra (600-800 mots)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `compatibility_matches` table
    - Policy: Users can read their own compatibility matches
    - Policy: Users can insert their own compatibility matches
    - Policy: Users can update their own compatibility matches

  3. Indexes
    - Index on user_id for fast lookups
    - Index on match_user_id for fast lookups
    - Unique constraint on (user_id, match_user_id) to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS compatibility_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES astra_profiles(id) ON DELETE CASCADE NOT NULL,
  match_user_id uuid REFERENCES astra_profiles(id) ON DELETE CASCADE NOT NULL,
  overall_percentage integer NOT NULL DEFAULT 0,
  attachment_percentage integer NOT NULL DEFAULT 0,
  archetype_percentage integer NOT NULL DEFAULT 0,
  needs_percentage integer NOT NULL DEFAULT 0,
  astral_percentage integer NOT NULL DEFAULT 0,
  astra_analysis text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, match_user_id)
);

ALTER TABLE compatibility_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own compatibility matches"
  ON compatibility_matches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = match_user_id);

CREATE POLICY "Users can insert own compatibility matches"
  ON compatibility_matches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own compatibility matches"
  ON compatibility_matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_compatibility_matches_user_id ON compatibility_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_matches_match_user_id ON compatibility_matches(match_user_id);
