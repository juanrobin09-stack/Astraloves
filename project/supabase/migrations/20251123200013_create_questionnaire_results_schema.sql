/*
  # Create Questionnaire Results Schema

  1. New Tables
    - `astra_questionnaire_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `questionnaire_id` (text) - identifier for questionnaire type
      - `answers` (jsonb) - array of question/answer pairs
      - `analysis` (jsonb) - Astra's complete analysis with percentages, explanations, advice
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)
    
  2. Security
    - Enable RLS on `astra_questionnaire_results` table
    - Add policy for authenticated users to read their own results
    - Add policy for authenticated users to insert their own results
    - Add policy for authenticated users to update their own results

  3. Notes
    - Results are stored as JSONB for flexibility
    - Each questionnaire can be retaken (history preserved)
    - Analysis includes percentages, detailed explanations, and personalized advice
*/

CREATE TABLE IF NOT EXISTS astra_questionnaire_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  questionnaire_id text NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE astra_questionnaire_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own questionnaire results"
  ON astra_questionnaire_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own questionnaire results"
  ON astra_questionnaire_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questionnaire results"
  ON astra_questionnaire_results
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_results_user_id 
  ON astra_questionnaire_results(user_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_results_questionnaire_id 
  ON astra_questionnaire_results(questionnaire_id);
