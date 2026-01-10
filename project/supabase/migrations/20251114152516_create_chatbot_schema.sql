/*
  # Chatbot IA Éthique - Database Schema

  ## Overview
  This migration creates the complete database structure for an ethical AI chatbot
  focused on relationship advice with privacy and security as core principles.

  ## New Tables

  ### 1. `profiles`
  User profile information linked to auth.users
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `consent_accepted` (boolean) - GDPR consent status
  - `consent_accepted_at` (timestamptz) - When consent was given

  ### 2. `conversations`
  Chat conversation sessions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text) - Conversation title/summary
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `is_archived` (boolean)

  ### 3. `messages`
  Individual messages within conversations
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, references conversations)
  - `role` (text) - 'user' or 'assistant'
  - `content` (text) - Encrypted message content
  - `created_at` (timestamptz)
  - `is_flagged` (boolean) - For sensitive topic detection

  ### 4. `consent_logs`
  Audit trail of consent acceptances
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `consent_version` (text) - Version of terms accepted
  - `ip_address` (text) - For security audit
  - `accepted_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Strict authentication requirements
  - Audit trail for consent tracking

  ## Important Notes
  1. All user data is isolated through RLS policies
  2. Consent must be given before chatbot access
  3. Messages are stored with encryption capability
  4. Sensitive topics flagged for professional referral
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  consent_accepted boolean DEFAULT false,
  consent_accepted_at timestamptz
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text DEFAULT 'Nouvelle conversation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_archived boolean DEFAULT false
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_flagged boolean DEFAULT false
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Create consent_logs table
CREATE TABLE IF NOT EXISTS consent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_version text NOT NULL DEFAULT 'v1.0',
  ip_address text,
  accepted_at timestamptz DEFAULT now()
);

ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consent logs"
  ON consent_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own consent logs"
  ON consent_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_user_id ON consent_logs(user_id);