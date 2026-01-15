-- ===================================================================
-- ASTRALOVES - FRIENDS TABLE MIGRATION
-- ===================================================================
-- Run this in Supabase SQL Editor to add friends functionality
-- ===================================================================

-- ===================================================================
-- TABLE: friends (Friend relationships)
-- ===================================================================

CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User who sent the friend request
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- User who receives the friend request
  friend_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Status: pending (request sent), accepted (friends), rejected, blocked
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),

  -- Timestamps
  requested_at timestamptz DEFAULT now(),
  accepted_at timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Prevent duplicate friend requests
  UNIQUE(user_id, friend_id),

  -- Prevent self-friending
  CHECK (user_id != friend_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
CREATE INDEX IF NOT EXISTS idx_friends_accepted ON friends(user_id, friend_id) WHERE status = 'accepted';

-- Enable RLS
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Users can see their own friend requests (sent or received)
CREATE POLICY "Users can view own friends" ON friends FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can insert friend requests
CREATE POLICY "Users can send friend requests" ON friends FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own requests or requests sent to them
CREATE POLICY "Users can update friend status" ON friends FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can delete their own friend requests
CREATE POLICY "Users can delete friends" ON friends FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- ===================================================================
-- Function to update updated_at timestamp
-- ===================================================================

CREATE OR REPLACE FUNCTION update_friends_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER friends_updated_at
  BEFORE UPDATE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION update_friends_updated_at();
