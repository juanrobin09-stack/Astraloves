/*
  # Create daily messages tracking system

  1. New Tables
    - `daily_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (date, tracks which day)
      - `count` (integer, number of messages sent that day)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `daily_messages` table
    - Add policies for authenticated users to read/write their own data

  3. Indexes
    - Composite unique index on (user_id, date) for fast lookups and upsert operations
*/

CREATE TABLE IF NOT EXISTS daily_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT daily_messages_user_date_unique UNIQUE (user_id, date)
);

ALTER TABLE daily_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own daily message counts"
  ON daily_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily message counts"
  ON daily_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily message counts"
  ON daily_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_daily_messages_user_date 
  ON daily_messages(user_id, date);

CREATE INDEX IF NOT EXISTS idx_daily_messages_date 
  ON daily_messages(date);