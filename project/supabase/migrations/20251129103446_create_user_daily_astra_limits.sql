/*
  # Create User Daily Astra Limits System

  1. New Tables
    - `user_daily_limits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date, default current date)
      - `astra_messages_used` (integer, default 0)
      - Unique constraint on (user_id, date)

  2. Triggers
    - Auto-reset daily limits for old dates

  3. Security
    - Enable RLS on `user_daily_limits` table
    - Add policies for users to manage their own limits
*/

CREATE TABLE IF NOT EXISTS user_daily_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  astra_messages_used INTEGER DEFAULT 0 CHECK (astra_messages_used >= 0),
  UNIQUE(user_id, date)
);

ALTER TABLE user_daily_limits ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own daily limits
CREATE POLICY "Users can read own daily limits"
  ON user_daily_limits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own daily limits
CREATE POLICY "Users can insert own daily limits"
  ON user_daily_limits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own daily limits
CREATE POLICY "Users can update own daily limits"
  ON user_daily_limits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger function to reset old daily limits
CREATE OR REPLACE FUNCTION reset_daily_limits()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM user_daily_limits WHERE date < CURRENT_DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-reset daily limits
DROP TRIGGER IF EXISTS daily_reset ON user_daily_limits;
CREATE TRIGGER daily_reset 
  BEFORE INSERT ON user_daily_limits
  FOR EACH ROW 
  EXECUTE FUNCTION reset_daily_limits();