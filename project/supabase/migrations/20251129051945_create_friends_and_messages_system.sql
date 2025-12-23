/*
  # Create Friends and Messages System

  1. New Tables
    - `friend_requests`
      - `id` (uuid, primary key)
      - `from_user_id` (uuid, foreign key to auth.users)
      - `to_user_id` (uuid, foreign key to auth.users)
      - `status` (text) - pending, accepted, rejected
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `friendships`
      - `id` (uuid, primary key)
      - `user_id_1` (uuid, foreign key to auth.users)
      - `user_id_2` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)

    - `user_messages`
      - `id` (uuid, primary key)
      - `from_user_id` (uuid, foreign key to auth.users)
      - `to_user_id` (uuid, foreign key to auth.users)
      - `content` (text)
      - `read` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Notes
    - Friend requests track pending/accepted/rejected status
    - Friendships are bidirectional (stored once)
    - Messages support read/unread status
*/

-- Friend Requests Table
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  to_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT no_self_request CHECK (from_user_id != to_user_id),
  CONSTRAINT unique_request UNIQUE (from_user_id, to_user_id)
);

-- Friendships Table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_id_2 uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT no_self_friendship CHECK (user_id_1 != user_id_2),
  CONSTRAINT unique_friendship UNIQUE (user_id_1, user_id_2)
);

-- User Messages Table
CREATE TABLE IF NOT EXISTS user_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  to_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;

-- Friend Requests Policies
CREATE POLICY "Users can view own friend requests"
  ON friend_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create friend requests"
  ON friend_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update received requests"
  ON friend_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = to_user_id);

-- Friendships Policies
CREATE POLICY "Users can view own friendships"
  ON friendships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can create friendships"
  ON friendships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can delete own friendships"
  ON friendships
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Messages Policies
CREATE POLICY "Users can view own messages"
  ON user_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send messages"
  ON user_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update received messages"
  ON user_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = to_user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_friend_requests_to_user ON friend_requests(to_user_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_from_user ON friend_requests(from_user_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_user_1 ON friendships(user_id_1);
CREATE INDEX IF NOT EXISTS idx_friendships_user_2 ON friendships(user_id_2);
CREATE INDEX IF NOT EXISTS idx_messages_to_user ON user_messages(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_from_user ON user_messages(from_user_id, created_at DESC);