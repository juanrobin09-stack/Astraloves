/*
  # Fix sync_astra_plan trigger

  1. Problem
    - Trigger references NEW.user_id but astra_profiles uses id
    
  2. Fix
    - Change NEW.user_id to NEW.id in trigger function
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS sync_plan_on_profile_change ON astra_profiles;
DROP FUNCTION IF EXISTS sync_astra_plan();

-- Recreate function with correct column reference
CREATE OR REPLACE FUNCTION sync_astra_plan()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE astra_conversations
  SET plan = CASE 
    WHEN NEW.is_premium = true
    THEN 'premium' 
    ELSE 'free' 
  END,
  expires_at = CASE
    WHEN NEW.is_premium = true
    THEN NULL
    ELSE now() + interval '24 hours'
  END
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER sync_plan_on_profile_change
  AFTER UPDATE OF is_premium ON astra_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_astra_plan();
