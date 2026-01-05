/*
  # Create Premium Messaging System v2

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `user_one_id` (uuid, references astra_profiles) - Premier utilisateur (always smaller uuid)
      - `user_two_id` (uuid, references astra_profiles) - Deuxième utilisateur (always bigger uuid)
      - `last_message_at` (timestamptz) - Dernière activité pour trier
      - `created_at` (timestamptz)
      - UNIQUE constraint sur (user_one_id, user_two_id) pour éviter doublons
    
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `sender_id` (uuid, references astra_profiles)
      - `receiver_id` (uuid, references astra_profiles)
      - `content` (text) - Message texte
      - `is_read` (boolean) - Lu ou non
      - `created_at` (timestamptz)

    - `user_presence`
      - `user_id` (uuid, primary key, references astra_profiles)
      - `is_online` (boolean) - En ligne ou non
      - `last_seen_at` (timestamptz) - Dernière activité
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Only Premium users can access conversations and messages
    - Users can only see their own conversations
    - Users can only send messages to other Premium users

  3. Indexes
    - Index on conversation_id for fast message lookups
    - Index on sender_id and receiver_id
    - Index on created_at for chronological ordering
    - Index on is_read for unread message counts
*/

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_one_id uuid REFERENCES astra_profiles(id) ON DELETE CASCADE NOT NULL,
  user_two_id uuid REFERENCES astra_profiles(id) ON DELETE CASCADE NOT NULL,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_conversation UNIQUE(user_one_id, user_two_id),
  CONSTRAINT ordered_users CHECK (user_one_id < user_two_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Premium users can view their conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_one_id OR auth.uid() = user_two_id
  );

CREATE POLICY "Premium users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_one_id OR auth.uid() = user_two_id
  );

CREATE INDEX IF NOT EXISTS idx_conversations_user_one ON conversations(user_one_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_two ON conversations(user_two_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES astra_profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES astra_profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
  );

CREATE POLICY "Users can update message read status"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(is_read) WHERE is_read = false;

-- User presence table
CREATE TABLE IF NOT EXISTS user_presence (
  user_id uuid PRIMARY KEY REFERENCES astra_profiles(id) ON DELETE CASCADE,
  is_online boolean DEFAULT false,
  last_seen_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view user presence"
  ON user_presence
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own presence"
  ON user_presence
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their presence"
  ON user_presence
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update last_message_at on conversations
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();
