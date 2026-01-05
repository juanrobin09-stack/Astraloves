/*
  # Fix Missing Columns and Tables

  1. Modifications
    - Add alias for ville → city in queries
    - Create message_counters table
    - Create user_conversations table as alias for conversations
    
  2. Tables
    - `message_counters` for tracking daily message limits
    - Views for backwards compatibility
*/

-- Create message_counters table
CREATE TABLE IF NOT EXISTS message_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  private_messages_count integer DEFAULT 0,
  astra_messages_count integer DEFAULT 0,
  swipes_count integer DEFAULT 0,
  last_reset timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE message_counters ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own message counters"
  ON message_counters FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own message counters"
  ON message_counters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own message counters"
  ON message_counters FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create view for user_conversations (alias for conversations)
CREATE OR REPLACE VIEW user_conversations AS
SELECT 
  id,
  user1_id,
  user2_id,
  last_message_text,
  last_message_at,
  created_at,
  updated_at
FROM conversations;

-- Grant access to view
GRANT SELECT ON user_conversations TO authenticated;

-- Function to get city from profile (ville column)
CREATE OR REPLACE FUNCTION get_profile_city(profile_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  city_name text;
BEGIN
  SELECT ville INTO city_name
  FROM astra_profiles
  WHERE id = profile_id;
  
  RETURN city_name;
END;
$$;
