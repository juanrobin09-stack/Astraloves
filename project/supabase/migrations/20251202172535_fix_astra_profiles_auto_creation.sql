/*
  # Fix automatic profile creation for astra_profiles

  1. Changes
    - Create trigger function to automatically create astra_profiles entry on user signup
    - Trigger fires after INSERT on auth.users
    - Creates minimal profile with user's email and id

  2. Security
    - Function runs with SECURITY DEFINER (elevated privileges)
    - Only creates profiles, doesn't modify existing data
    - Uses ON CONFLICT DO NOTHING to avoid duplicate key errors
*/

-- Function to handle new user creation in astra_profiles
CREATE OR REPLACE FUNCTION handle_new_astra_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.astra_profiles (
    id, 
    email, 
    created_at, 
    updated_at,
    daily_chat_count,
    last_chat_reset,
    is_premium,
    stars_balance,
    total_earnings,
    total_commission_paid,
    withdrawable_balance,
    is_creator,
    daily_swipes,
    daily_astra_messages,
    daily_match_messages,
    daily_super_likes,
    weekly_lives,
    live_reactions
  )
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW(),
    0,
    CURRENT_DATE,
    false,
    0,
    0,
    0,
    0,
    false,
    0,
    0,
    0,
    0,
    0,
    0
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_astra ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created_astra
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_astra_user();
