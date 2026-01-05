/*
  # Fix handle_new_user trigger to handle errors gracefully

  1. Changes
    - Add error handling with EXCEPTION block
    - Add RAISE WARNING for debugging
    - Ensure trigger doesn't block user creation

  2. Security
    - Function runs with SECURITY DEFINER
    - Only inserts profiles, doesn't modify existing
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
  END;

  RETURN NEW;
END;
$$;
