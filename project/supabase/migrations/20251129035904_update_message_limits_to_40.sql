/*
  # Update Premium Message Limit to 40

  ## Changes
  - Update `can_send_message` function to use 40 messages for premium users (was 30)
  - Update `get_message_counter_status` function to use 40 messages for premium users (was 30)

  ## Logic
  - Free users: 10 messages per 24h rolling window
  - Premium users: **40 messages per 24h rolling window** (updated from 30)
  - Reset is rolling: if last reset > 24h ago, counter resets to 0
*/

-- Update function to check if user can send message (40 for premium)
CREATE OR REPLACE FUNCTION can_send_message(p_user_id uuid)
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
    RETURN jsonb_build_object(
      'can_send', false,
      'error', 'Profile not found'
    );
  END IF;
  
  -- Determine message limit: 40 for premium, 10 for free
  v_limit := CASE 
    WHEN v_profile.is_premium THEN 40
    ELSE 10
  END;
  
  -- Check if reset window has passed (rolling reset)
  IF (now() - v_profile.messages_reset_at) > v_reset_window THEN
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

-- Update function to get message counter status (40 for premium)
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
  
  -- Determine message limit: 40 for premium, 10 for free
  v_limit := CASE 
    WHEN v_profile.is_premium THEN 40
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
