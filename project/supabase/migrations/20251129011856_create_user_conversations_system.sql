/*
  # Create User-to-User Conversations and Messages System

  ## Overview
  Creates tables for direct messaging between users (not chatbot).

  ## New Tables

  ### `conversations`
  Stores 1-on-1 conversations between users
  - `id` (uuid, primary key)
  - `user1_id` (uuid, foreign key) - First participant (lower uuid)
  - `user2_id` (uuid, foreign key) - Second participant (higher uuid)
  - `last_message_text` (text) - Preview of last message
  - `last_message_sender_id` (uuid) - Who sent last message
  - `last_message_at` (timestamptz) - When last message was sent
  - `user1_unread_count` (integer) - Unread count for user1
  - `user2_unread_count` (integer) - Unread count for user2
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `messages`
  Stores messages between users
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, foreign key)
  - `sender_id` (uuid, foreign key)
  - `receiver_id` (uuid, foreign key)
  - `content` (text) - Message text
  - `image_url` (text, nullable) - Optional image
  - `is_read` (boolean) - Read status
  - `read_at` (timestamptz, nullable) - When read
  - `created_at` (timestamptz)

  ## Indexes
  - Conversation indexes for fast lookups
  - Message indexes for conversation and read status
  
  ## Security
  - Full RLS enabled
  - Users can only see their own conversations/messages
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES astra_profiles(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES astra_profiles(id) ON DELETE CASCADE,
  last_message_text text,
  last_message_sender_id uuid REFERENCES astra_profiles(id) ON DELETE SET NULL,
  last_message_at timestamptz DEFAULT now(),
  user1_unread_count integer DEFAULT 0,
  user2_unread_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT conversations_different_users CHECK (user1_id != user2_id),
  CONSTRAINT conversations_ordered_pair CHECK (user1_id < user2_id)
);

-- Create unique index to prevent duplicate conversations
CREATE UNIQUE INDEX IF NOT EXISTS conversations_unique_pair 
ON conversations(user1_id, user2_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS conversations_user1_idx ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS conversations_user2_idx ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS conversations_last_message_idx ON conversations(last_message_at DESC);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users can view conversations they're part of
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Users can create conversations
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Users can update conversations (for read status)
CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  )
  WITH CHECK (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES astra_profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES astra_profiles(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  image_url text,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for messages
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_idx ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_unread_idx ON messages(receiver_id, is_read) WHERE is_read = false;

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in their conversations
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Users can send messages
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
  );

-- Users can update message read status
CREATE POLICY "Users can update message read status"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = receiver_id
  )
  WITH CHECK (
    auth.uid() = receiver_id
  );

-- Function to get or create conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(p_user1_id uuid, p_user2_id uuid)
RETURNS uuid AS $$
DECLARE
  v_conversation_id uuid;
  v_lower_id uuid;
  v_higher_id uuid;
BEGIN
  -- Order IDs to maintain constraint
  IF p_user1_id < p_user2_id THEN
    v_lower_id := p_user1_id;
    v_higher_id := p_user2_id;
  ELSE
    v_lower_id := p_user2_id;
    v_higher_id := p_user1_id;
  END IF;
  
  -- Try to get existing conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE user1_id = v_lower_id AND user2_id = v_higher_id;
  
  -- Create if doesn't exist
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (user1_id, user2_id)
    VALUES (v_lower_id, v_higher_id)
    RETURNING id INTO v_conversation_id;
  END IF;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update conversation after new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_text = NEW.content,
    last_message_sender_id = NEW.sender_id,
    last_message_at = NEW.created_at,
    updated_at = NEW.created_at,
    -- Increment unread count for receiver
    user1_unread_count = CASE 
      WHEN user1_id = NEW.receiver_id THEN user1_unread_count + 1
      ELSE user1_unread_count
    END,
    user2_unread_count = CASE 
      WHEN user2_id = NEW.receiver_id THEN user2_unread_count + 1
      ELSE user2_unread_count
    END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for conversation updates
DROP TRIGGER IF EXISTS update_conversation_on_message_trigger ON messages;
CREATE TRIGGER update_conversation_on_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_conversation_id uuid, p_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Mark all unread messages as read
  UPDATE messages
  SET 
    is_read = true,
    read_at = now()
  WHERE 
    conversation_id = p_conversation_id 
    AND receiver_id = p_user_id 
    AND is_read = false;
  
  -- Reset unread count in conversation
  UPDATE conversations
  SET
    user1_unread_count = CASE 
      WHEN user1_id = p_user_id THEN 0
      ELSE user1_unread_count
    END,
    user2_unread_count = CASE 
      WHEN user2_id = p_user_id THEN 0
      ELSE user2_unread_count
    END
  WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;