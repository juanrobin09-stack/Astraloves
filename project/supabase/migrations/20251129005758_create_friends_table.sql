/*
  # Create Friends Table

  ## Overview
  Creates the friends table to manage friend requests and friendships between users.

  ## Table: `friends`
  
  ### Columns
  - `id` (uuid, primary key) - Unique friendship identifier
  - `sender_id` (uuid, foreign key) - User who sent the friend request
  - `receiver_id` (uuid, foreign key) - User who received the friend request
  - `statut` (text) - Friendship status: 'pending', 'accepted', 'rejected', 'blocked'
  - `created_at` (timestamptz) - When request was sent
  - `updated_at` (timestamptz) - When status was last changed
  - `message` (text) - Optional message with friend request
  
  ## Constraints
  - Unique constraint on (sender_id, receiver_id) to prevent duplicate requests
  - Check constraint: sender_id != receiver_id
  - Check constraint: statut must be valid value
  
  ## Indexes
  - Index on sender_id for finding sent requests
  - Index on receiver_id for finding received requests
  - Index on statut for filtering
  - Composite index on (receiver_id, statut) for pending requests
  
  ## Security
  - Enable RLS
  - Users can view friend requests where they are sender or receiver
  - Users can create friend requests (as sender)
  - Users can update requests where they are receiver (accept/reject)
  - Users can update their own sent requests (cancel)
  - Users can delete their own friendships
*/

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES astra_profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES astra_profiles(id) ON DELETE CASCADE,
  statut text NOT NULL DEFAULT 'pending',
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT friends_different_users CHECK (sender_id != receiver_id),
  CONSTRAINT friends_statut_check CHECK (statut IN ('pending', 'accepted', 'rejected', 'blocked'))
);

-- Create unique index to prevent duplicate friend requests
CREATE UNIQUE INDEX IF NOT EXISTS friends_unique_pair 
ON friends(sender_id, receiver_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS friends_sender_idx ON friends(sender_id);
CREATE INDEX IF NOT EXISTS friends_receiver_idx ON friends(receiver_id);
CREATE INDEX IF NOT EXISTS friends_statut_idx ON friends(statut);
CREATE INDEX IF NOT EXISTS friends_receiver_pending_idx ON friends(receiver_id, statut) 
WHERE statut = 'pending';

-- Enable RLS
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Users can view friend relationships where they are involved
CREATE POLICY "Users can view their friendships"
  ON friends FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Users can send friend requests
CREATE POLICY "Users can send friend requests"
  ON friends FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
  );

-- Receivers can accept/reject requests, senders can cancel
CREATE POLICY "Users can update friend requests"
  ON friends FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  )
  WITH CHECK (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Users can delete friendships they're involved in
CREATE POLICY "Users can delete friendships"
  ON friends FOR DELETE
  TO authenticated
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_friends_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS friends_updated_at_trigger ON friends;
CREATE TRIGGER friends_updated_at_trigger
  BEFORE UPDATE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION update_friends_updated_at();

-- Function to get friend status between two users
CREATE OR REPLACE FUNCTION get_friend_status(user1_id uuid, user2_id uuid)
RETURNS text AS $$
DECLARE
  friendship_status text;
BEGIN
  SELECT statut INTO friendship_status
  FROM friends
  WHERE (sender_id = user1_id AND receiver_id = user2_id)
     OR (sender_id = user2_id AND receiver_id = user1_id)
  LIMIT 1;
  
  RETURN COALESCE(friendship_status, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;