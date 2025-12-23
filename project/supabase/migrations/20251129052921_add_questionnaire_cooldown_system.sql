/*
  # Add Cooldown System for Questionnaires

  1. New Columns
    - `title` (text) - Title of the questionnaire
    - `icon` (text) - Emoji icon for the questionnaire
    - `can_retake_at` (timestamptz) - When user can retake (7 days after completion)
    
  2. Changes
    - Add columns to track retake eligibility
    - Allow users to retake questionnaires once per week
    
  3. Notes
    - Default can_retake_at is 7 days after completed_at
    - Users can view old results anytime
*/

DO $$
BEGIN
  -- Add title column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_questionnaire_results' AND column_name = 'title'
  ) THEN
    ALTER TABLE astra_questionnaire_results ADD COLUMN title text DEFAULT '';
  END IF;

  -- Add icon column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_questionnaire_results' AND column_name = 'icon'
  ) THEN
    ALTER TABLE astra_questionnaire_results ADD COLUMN icon text DEFAULT '✨';
  END IF;

  -- Add can_retake_at column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_questionnaire_results' AND column_name = 'can_retake_at'
  ) THEN
    ALTER TABLE astra_questionnaire_results ADD COLUMN can_retake_at timestamptz DEFAULT (now() + interval '7 days');
  END IF;
END $$;