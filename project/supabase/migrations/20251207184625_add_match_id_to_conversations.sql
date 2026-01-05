/*
  # Ajouter match_id à conversations

  1. Modifications
    - Ajouter la colonne `match_id` à la table `conversations`
    - Foreign key vers `cosmic_matches`
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'match_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN match_id uuid REFERENCES cosmic_matches(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_conversations_match_id ON conversations(match_id);
  END IF;
END $$;
