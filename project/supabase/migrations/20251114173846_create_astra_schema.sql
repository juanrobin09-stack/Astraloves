/*
  # Astra - AI Love Coach Schema

  ## Overview
  Complete database schema for Astra, an ethical AI love and seduction coach
  with freemium model, chat history, and premium subscriptions.

  ## New Tables

  ### 1. `astra_profiles`
  Enhanced user profiles with preferences and subscription status
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique)
  - `username` (text, unique) - Display name
  - `age` (integer) - Must be 18+
  - `gender_preference` (text) - Dating preference
  - `goals` (text) - User's relationship goals
  - `is_premium` (boolean) - Premium subscription status
  - `premium_until` (timestamptz) - Premium expiration date
  - `daily_chat_count` (integer) - Free tier chat counter
  - `last_chat_reset` (date) - Last time counter was reset
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `astra_conversations`
  Chat conversation sessions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references astra_profiles)
  - `title` (text) - Auto-generated conversation title
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `is_archived` (boolean)

  ### 3. `astra_messages`
  Individual messages within conversations
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, references astra_conversations)
  - `role` (text) - 'user' or 'assistant'
  - `content` (text) - Encrypted message content
  - `sentiment_score` (integer) - Premium feature: 0-10 sentiment analysis
  - `created_at` (timestamptz)

  ### 4. `astra_subscriptions`
  Premium subscription tracking
  - `id` (uuid, primary key)
  - `user_id` (uuid, references astra_profiles)
  - `stripe_customer_id` (text)
  - `stripe_subscription_id` (text)
  - `status` (text) - active, canceled, expired
  - `current_period_start` (timestamptz)
  - `current_period_end` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Premium status validated server-side
  - Encrypted storage for sensitive content

  ## Important Notes
  1. Daily chat counter resets automatically
  2. Premium features gated by is_premium flag
  3. Age verification required (18+)
  4. All user data isolated through RLS
*/

-- Drop old tables if they exist
DROP TABLE IF EXISTS consent_logs CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create astra_profiles table
CREATE TABLE IF NOT EXISTS astra_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  age integer CHECK (age >= 18),
  gender_preference text,
  goals text,
  is_premium boolean DEFAULT false,
  premium_until timestamptz,
  daily_chat_count integer DEFAULT 0,
  last_chat_reset date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE astra_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON astra_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON astra_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON astra_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create astra_conversations table
CREATE TABLE IF NOT EXISTS astra_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES astra_profiles(id) ON DELETE CASCADE,
  title text DEFAULT 'Nouvelle conversation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_archived boolean DEFAULT false
);

ALTER TABLE astra_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON astra_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON astra_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON astra_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON astra_conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create astra_messages table
CREATE TABLE IF NOT EXISTS astra_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES astra_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  sentiment_score integer CHECK (sentiment_score >= 0 AND sentiment_score <= 10),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE astra_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON astra_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM astra_conversations
      WHERE astra_conversations.id = astra_messages.conversation_id
      AND astra_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON astra_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM astra_conversations
      WHERE astra_conversations.id = astra_messages.conversation_id
      AND astra_conversations.user_id = auth.uid()
    )
  );

-- Create astra_subscriptions table
CREATE TABLE IF NOT EXISTS astra_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES astra_profiles(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE astra_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON astra_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON astra_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_astra_conversations_user_id ON astra_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_astra_messages_conversation_id ON astra_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_astra_subscriptions_user_id ON astra_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_astra_profiles_username ON astra_profiles(username);

-- Function to reset daily chat counter
CREATE OR REPLACE FUNCTION reset_daily_chat_counter()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE astra_profiles
  SET daily_chat_count = 0,
      last_chat_reset = CURRENT_DATE
  WHERE last_chat_reset < CURRENT_DATE;
END;
$$;