/*
  # Create Horoscope Cache System

  1. New Tables
    - `horoscope_cache`
      - `id` (uuid, primary key)
      - `zodiac_sign` (text) - The zodiac sign
      - `date` (date) - The date for this horoscope
      - `daily_data` (jsonb) - Daily horoscope data from real API
      - `planetary_positions` (jsonb) - Real planetary positions
      - `transits` (jsonb) - Current transits for the sign
      - `weekly_forecast` (jsonb) - Weekly predictions
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz) - Cache expiration (end of day)
    
    - `user_horoscope_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `zodiac_sign` (text)
      - `date` (date)
      - `tier` (text) - free, premium, or elite
      - `personalized_message` (text) - AI-generated message
      - `birth_chart_analysis` (jsonb) - For elite users only
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public read access to horoscope_cache (it's general data)
    - Users can only read their own personalized messages
    - Only authenticated users can access personalized messages

  3. Indexes
    - Index on zodiac_sign and date for fast cache lookups
    - Index on user_id and date for user message retrieval
*/

-- Create horoscope_cache table
CREATE TABLE IF NOT EXISTS horoscope_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zodiac_sign text NOT NULL,
  date date NOT NULL,
  daily_data jsonb DEFAULT '{}'::jsonb,
  planetary_positions jsonb DEFAULT '{}'::jsonb,
  transits jsonb DEFAULT '{}'::jsonb,
  weekly_forecast jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  UNIQUE(zodiac_sign, date)
);

-- Create user_horoscope_messages table
CREATE TABLE IF NOT EXISTS user_horoscope_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  zodiac_sign text NOT NULL,
  date date NOT NULL,
  tier text NOT NULL CHECK (tier IN ('free', 'premium', 'elite')),
  personalized_message text,
  birth_chart_analysis jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE horoscope_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_horoscope_messages ENABLE ROW LEVEL SECURITY;

-- Policies for horoscope_cache (public read for non-expired data)
CREATE POLICY "Anyone can read non-expired horoscope cache"
  ON horoscope_cache FOR SELECT
  USING (expires_at > now());

-- Policies for user_horoscope_messages
CREATE POLICY "Users can read own horoscope messages"
  ON user_horoscope_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own horoscope messages"
  ON user_horoscope_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_horoscope_cache_sign_date 
  ON horoscope_cache(zodiac_sign, date);

CREATE INDEX IF NOT EXISTS idx_horoscope_cache_expires 
  ON horoscope_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_messages_user_date 
  ON user_horoscope_messages(user_id, date);

-- Function to clean expired cache (to be called by cron)
CREATE OR REPLACE FUNCTION clean_expired_horoscope_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM horoscope_cache
  WHERE expires_at < now() - interval '7 days';
END;
$$;