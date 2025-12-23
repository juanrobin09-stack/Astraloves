/*
  # Create Swipes Table

  ## Overview
  Creates the swipes table to track user interactions in the discovery feed (like/pass actions).

  ## Table: `swipes`
  
  ### Columns
  - `id` (uuid, primary key) - Unique swipe identifier
  - `user_id` (uuid, foreign key) - User who performed the swipe
  - `target_id` (uuid, foreign key) - User who was swiped on
  - `action` (text) - Swipe action: 'like', 'pass', 'superlike'
  - `created_at` (timestamptz) - When swipe occurred
  
  ## Constraints
  - Unique constraint on (user_id, target_id) to prevent duplicate swipes
  - Check constraint: user_id != target_id
  - Check constraint: action must be valid value
  
  ## Indexes
  - Index on user_id for finding user's swipes
  - Index on target_id for finding who swiped on user
  - Index on action for filtering likes
  - Composite index on (user_id, action) for filtering user's likes
  
  ## Security
  - Enable RLS
  - Users can view their own swipes
  - Premium users can view who liked them
  - Users can create swipes
  - Swipes cannot be updated or deleted (permanent record)
  
  ## Notes
  - This table tracks all swipe history
  - Used to prevent showing same profile twice
  - Used to detect mutual likes (match creation)
  - Daily swipe limits enforced in application layer
*/

-- Create swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES astra_profiles(id) ON DELETE CASCADE,
  target_id uuid NOT NULL REFERENCES astra_profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT swipes_different_users CHECK (user_id != target_id),
  CONSTRAINT swipes_action_check CHECK (action IN ('like', 'pass', 'superlike'))
);

-- Create unique index to prevent duplicate swipes
CREATE UNIQUE INDEX IF NOT EXISTS swipes_unique_pair 
ON swipes(user_id, target_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS swipes_user_idx ON swipes(user_id);
CREATE INDEX IF NOT EXISTS swipes_target_idx ON swipes(target_id);
CREATE INDEX IF NOT EXISTS swipes_action_idx ON swipes(action);
CREATE INDEX IF NOT EXISTS swipes_user_action_idx ON swipes(user_id, action);
CREATE INDEX IF NOT EXISTS swipes_created_at_idx ON swipes(created_at DESC);

-- Enable RLS
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- Users can view their own swipes
CREATE POLICY "Users can view their own swipes"
  ON swipes FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- Premium users can see who liked them
CREATE POLICY "Premium users can see who liked them"
  ON swipes FOR SELECT
  TO authenticated
  USING (
    auth.uid() = target_id AND 
    action IN ('like', 'superlike') AND
    EXISTS (
      SELECT 1 FROM astra_profiles
      WHERE id = auth.uid() AND is_premium = true
    )
  );

-- Users can create swipes
CREATE POLICY "Users can create swipes"
  ON swipes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

-- Function to check for mutual likes and create match
CREATE OR REPLACE FUNCTION check_mutual_like()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if this is a like or superlike
  IF NEW.action IN ('like', 'superlike') THEN
    -- Check if target also liked the user
    IF EXISTS (
      SELECT 1 FROM swipes
      WHERE user_id = NEW.target_id 
        AND target_id = NEW.user_id 
        AND action IN ('like', 'superlike')
    ) THEN
      -- Create match if it doesn't exist
      -- Ensure user1_id < user2_id for the ordered pair constraint
      INSERT INTO matches (user1_id, user2_id, user1_liked, user2_liked, statut)
      VALUES (
        LEAST(NEW.user_id, NEW.target_id),
        GREATEST(NEW.user_id, NEW.target_id),
        true,
        true,
        'mutual'
      )
      ON CONFLICT (user1_id, user2_id) DO UPDATE
      SET 
        user1_liked = CASE 
          WHEN matches.user1_id = NEW.user_id THEN true 
          ELSE matches.user1_liked 
        END,
        user2_liked = CASE 
          WHEN matches.user2_id = NEW.user_id THEN true 
          ELSE matches.user2_liked 
        END,
        statut = 'mutual',
        updated_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to check for mutual likes
DROP TRIGGER IF EXISTS check_mutual_like_trigger ON swipes;
CREATE TRIGGER check_mutual_like_trigger
  AFTER INSERT ON swipes
  FOR EACH ROW
  EXECUTE FUNCTION check_mutual_like();

-- Function to count daily swipes for a user
CREATE OR REPLACE FUNCTION get_daily_swipe_count(p_user_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM swipes
    WHERE user_id = p_user_id
      AND created_at >= CURRENT_DATE
      AND action IN ('like', 'pass', 'superlike')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;