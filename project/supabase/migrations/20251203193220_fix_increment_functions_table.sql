/*
  # Fix increment functions to use astra_profiles

  1. Updates
    - Update increment_user_swipes to read from astra_profiles
    - Update increment_user_match_messages to read from astra_profiles and use correct column name
*/

-- Fonction pour incrémenter les swipes avec vérification
CREATE OR REPLACE FUNCTION increment_user_swipes(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count integer;
  max_limit integer;
  user_plan text;
BEGIN
  SELECT 
    COALESCE(premium_tier, 'free'),
    swipes_today
  INTO user_plan, current_count
  FROM astra_profiles
  WHERE id = user_id;

  max_limit := CASE
    WHEN user_plan = 'free' THEN 10
    ELSE 999999
  END;

  IF current_count >= max_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'limit_reached',
      'current', current_count,
      'max', max_limit
    );
  END IF;

  UPDATE astra_profiles
  SET swipes_today = swipes_today + 1
  WHERE id = user_id;

  RETURN jsonb_build_object(
    'success', true,
    'current', current_count + 1,
    'max', max_limit
  );
END;
$$;

-- Fonction pour incrémenter les messages matchs avec vérification
CREATE OR REPLACE FUNCTION increment_user_match_messages(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count integer;
  max_limit integer;
  user_plan text;
BEGIN
  SELECT 
    COALESCE(premium_tier, 'free'),
    daily_match_messages
  INTO user_plan, current_count
  FROM astra_profiles
  WHERE id = user_id;

  max_limit := CASE
    WHEN user_plan = 'free' THEN 20
    ELSE 999999
  END;

  IF current_count >= max_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'limit_reached',
      'current', current_count,
      'max', max_limit
    );
  END IF;

  UPDATE astra_profiles
  SET daily_match_messages = daily_match_messages + 1
  WHERE id = user_id;

  RETURN jsonb_build_object(
    'success', true,
    'current', current_count + 1,
    'max', max_limit
  );
END;
$$;