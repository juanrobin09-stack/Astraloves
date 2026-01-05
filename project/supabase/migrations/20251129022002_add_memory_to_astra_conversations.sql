/*
  # Add Memory System to Astra Conversations

  1. Modifications
    - Add `plan` column to track free/premium
    - Add `messages_data` jsonb for storing message history
    - Add `user_context` jsonb for Premium context
    - Add `insights_data` jsonb for Premium insights
    - Add `last_message_at` timestamp
    - Add `expires_at` for free tier expiration

  2. Create new insights table for better structure
*/

-- Add columns to existing astra_conversations table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'astra_conversations' AND column_name = 'plan') THEN
    ALTER TABLE astra_conversations ADD COLUMN plan text DEFAULT 'free' CHECK (plan IN ('free', 'premium'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'astra_conversations' AND column_name = 'messages_data') THEN
    ALTER TABLE astra_conversations ADD COLUMN messages_data jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'astra_conversations' AND column_name = 'user_context') THEN
    ALTER TABLE astra_conversations ADD COLUMN user_context jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'astra_conversations' AND column_name = 'insights_data') THEN
    ALTER TABLE astra_conversations ADD COLUMN insights_data jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'astra_conversations' AND column_name = 'last_message_at') THEN
    ALTER TABLE astra_conversations ADD COLUMN last_message_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'astra_conversations' AND column_name = 'expires_at') THEN
    ALTER TABLE astra_conversations ADD COLUMN expires_at timestamptz;
  END IF;
END $$;

-- Create astra_user_insights table
CREATE TABLE IF NOT EXISTS astra_user_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  attachment_style text,
  love_language text,
  patterns jsonb DEFAULT '[]'::jsonb,
  strengths jsonb DEFAULT '[]'::jsonb,
  areas_to_work jsonb DEFAULT '[]'::jsonb,
  communication_style text,
  relationship_patterns text,
  updated_at timestamptz DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_astra_user_insights_user_id ON astra_user_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_astra_conversations_expires_at_v2 ON astra_conversations(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE astra_user_insights ENABLE ROW LEVEL SECURITY;

-- Insights policies
CREATE POLICY "Users can view their own insights"
  ON astra_user_insights FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own insights"
  ON astra_user_insights FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own insights"
  ON astra_user_insights FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to sync plan with profile
CREATE OR REPLACE FUNCTION sync_astra_plan()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE astra_conversations
  SET plan = CASE 
    WHEN (SELECT is_premium FROM astra_profiles WHERE id = NEW.user_id) 
    THEN 'premium' 
    ELSE 'free' 
  END,
  expires_at = CASE
    WHEN (SELECT is_premium FROM astra_profiles WHERE id = NEW.user_id)
    THEN NULL
    ELSE now() + interval '24 hours'
  END
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync plan when profile premium status changes
CREATE OR REPLACE TRIGGER sync_plan_on_profile_change
  AFTER UPDATE OF is_premium ON astra_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_astra_plan();
