/*
  # Add atomic increment function for Astra messages counter

  1. New Functions
    - `increment_astra_messages(user_id_param uuid)` - Increments the daily Astra messages counter atomically
      - Returns the new count after increment
      - Uses COALESCE to handle NULL values
      - SECURITY DEFINER for proper permissions

  2. Purpose
    - Prevents race conditions when multiple requests try to increment simultaneously
    - Ensures accurate counting even under high load
    - More reliable than SELECT + UPDATE pattern
*/

-- Fonction RPC pour incrémenter le compteur de messages Astra de manière atomique
CREATE OR REPLACE FUNCTION increment_astra_messages(user_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE astra_profiles
  SET daily_astra_messages = COALESCE(daily_astra_messages, 0) + 1
  WHERE id = user_id_param
  RETURNING daily_astra_messages INTO new_count;
  
  RETURN new_count;
END;
$$;
