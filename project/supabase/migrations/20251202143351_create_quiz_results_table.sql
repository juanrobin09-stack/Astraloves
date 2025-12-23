/*
  # Table pour sauvegarder les résultats de quiz

  1. Nouvelle Table
    - `quiz_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key vers auth.users)
      - `quiz_id` (text) - ID du quiz ('astral', 'attachment', etc.)
      - `quiz_name` (text) - Nom du quiz
      - `result_title` (text) - Titre du résultat
      - `result_subtitle` (text) - Sous-titre
      - `result_data` (jsonb) - Toutes les données du résultat
      - `answers` (jsonb) - Les réponses données
      - `percentage` (integer) - Score en pourcentage
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Index
    - Index sur user_id pour récupération rapide

  3. Sécurité
    - RLS activé
    - Policies pour SELECT, INSERT, UPDATE par user_id
*/

-- Créer la table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_id TEXT NOT NULL,
  quiz_name TEXT NOT NULL,
  result_title TEXT,
  result_subtitle TEXT,
  result_data JSONB NOT NULL,
  answers JSONB,
  percentage INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour récupération rapide
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);

-- RLS
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own quiz results"
  ON quiz_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results"
  ON quiz_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz results"
  ON quiz_results
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quiz results"
  ON quiz_results
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
