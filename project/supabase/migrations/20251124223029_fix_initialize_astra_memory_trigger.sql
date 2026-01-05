/*
  # Fix initialize_astra_memory trigger to handle errors gracefully

  1. Changes
    - Add error handling with EXCEPTION block
    - Add RAISE NOTICE for debugging
    - Ensure trigger doesn't fail silently
    - Continue even if insert fails

  2. Security
    - Function runs with SECURITY DEFINER
    - Only inserts data, doesn't modify existing
*/

CREATE OR REPLACE FUNCTION public.initialize_astra_memory()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO astra_memory (user_id, memory_data)
    VALUES (
      NEW.id,
      jsonb_build_object(
        'profile', jsonb_build_object(
          'first_name', COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
          'created_at', now()
        ),
        'questionnaires', '{}'::jsonb,
        'compatibilities_viewed', '[]'::jsonb,
        'messages_exchanged', '[]'::jsonb,
        'discoveries', '[]'::jsonb,
        'preferences_expressed', jsonb_build_object(
          'dislikes', '[]'::jsonb,
          'likes', '[]'::jsonb,
          'dealbreakers', '[]'::jsonb
        ),
        'emotional_state', jsonb_build_object(
          'fears', '[]'::jsonb,
          'dreams', '[]'::jsonb,
          'current_mood', 'neutral',
          'relationship_goals', ''
        ),
        'astra_interactions', jsonb_build_object(
          'total_messages', 0,
          'favorite_topics', '[]'::jsonb,
          'last_greeting', null,
          'personalization_level', 'low'
        ),
        'insights', '[]'::jsonb,
        'action_history', '[]'::jsonb
      )
    )
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to initialize astra_memory for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
  END;

  RETURN NEW;
END;
$$;
