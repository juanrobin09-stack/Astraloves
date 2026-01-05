/*
  # Add Message Counter System with Rolling Reset

  ## Overview
  Adds message tracking system with rolling 24h reset for free and premium users.

  ## New Columns Added to `astra_profiles`
  
  ### Message Counter Fields
  - `messages_count` (integer) - Current message count in rolling window (default 0)
  - `messages_reset_at` (timestamptz) - Timestamp of when counter was last reset
  
  ## Logic
  - Free users: 10 messages per 24h rolling window
  - Premium users: 30 messages per 24h rolling window
  - Reset is rolling: if last reset > 24h ago, counter resets to 0
  - Counter increments after each message sent
  
  ## Security
  - No changes to existing RLS policies
  - All new fields respect existing security model
*/

-- Add message counter fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'messages_count'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN messages_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'messages_reset_at'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN messages_reset_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Function to check if user can send message
CREATE OR REPLACE FUNCTION can_send_message(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_profile record;
  v_limit integer;
  v_reset_window interval := '24 hours';
  v_time_left interval;
BEGIN
  -- Get user profile
  SELECT * INTO v_profile
  FROM astra_profiles
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'can_send', false,
      'error', 'Profile not found'
    );
  END IF;
  
  -- Determine message limit based on premium status
  v_limit := CASE 
    WHEN v_profile.is_premium THEN 30
    ELSE 10
  END;
  
  -- Check if reset window has passed (rolling reset)
  IF (now() - v_profile.messages_reset_at) > v_reset_window THEN
    -- Reset counter
    UPDATE astra_profiles
    SET 
      messages_count = 0,
      messages_reset_at = now()
    WHERE id = p_user_id;
    
    RETURN jsonb_build_object(
      'can_send', true,
      'remaining', v_limit,
      'limit', v_limit,
      'is_premium', v_profile.is_premium
    );
  END IF;
  
  -- Check if under limit
  IF v_profile.messages_count >= v_limit THEN
    v_time_left := v_reset_window - (now() - v_profile.messages_reset_at);
    
    RETURN jsonb_build_object(
      'can_send', false,
      'remaining', 0,
      'limit', v_limit,
      'is_premium', v_profile.is_premium,
      'reset_in_hours', EXTRACT(EPOCH FROM v_time_left) / 3600,
      'error', 'Message limit reached'
    );
  END IF;
  
  -- Can send message
  RETURN jsonb_build_object(
    'can_send', true,
    'remaining', v_limit - v_profile.messages_count,
    'limit', v_limit,
    'is_premium', v_profile.is_premium
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment message count after sending
CREATE OR REPLACE FUNCTION increment_message_count(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE astra_profiles
  SET messages_count = messages_count + 1
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get message counter status
CREATE OR REPLACE FUNCTION get_message_counter_status(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_profile record;
  v_limit integer;
  v_reset_window interval := '24 hours';
  v_time_left interval;
BEGIN
  SELECT * INTO v_profile
  FROM astra_profiles
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;
  
  v_limit := CASE 
    WHEN v_profile.is_premium THEN 30
    ELSE 10
  END;
  
  -- Check if reset window has passed
  IF (now() - v_profile.messages_reset_at) > v_reset_window THEN
    RETURN jsonb_build_object(
      'current', 0,
      'limit', v_limit,
      'remaining', v_limit,
      'is_premium', v_profile.is_premium
    );
  END IF;
  
  v_time_left := v_reset_window - (now() - v_profile.messages_reset_at);
  
  RETURN jsonb_build_object(
    'current', v_profile.messages_count,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_profile.messages_count),
    'is_premium', v_profile.is_premium,
    'reset_in_hours', EXTRACT(EPOCH FROM v_time_left) / 3600
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;