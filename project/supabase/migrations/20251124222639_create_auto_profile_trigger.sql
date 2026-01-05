/*
  # Create automatic profile creation trigger

  1. Function
    - `handle_new_user()` - Automatically creates a profile entry when a new user signs up

  2. Trigger
    - Fires on INSERT to auth.users
    - Creates corresponding entry in profiles table with user's email

  3. Security
    - Function runs with SECURITY DEFINER (elevated privileges)
    - Only creates profiles, doesn't modify existing data
*/

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at, consent_accepted, consent_accepted_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW(),
    false,
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
