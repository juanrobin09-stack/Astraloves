/*
  # Système de limites quotidiennes et compteurs

  1. Nouvelles colonnes dans profiles
    - Compteurs quotidiens (swipes, messages, super likes)
    - Boost de visibilité
    - Mode incognito (Elite)

  2. Table profile_visitors
    - Track qui visite les profils (Elite feature)

  3. Fonctions pour gestion des limites
*/

-- Ajouter colonnes si elles n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'swipes_today') THEN
    ALTER TABLE profiles ADD COLUMN swipes_today integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'messages_matchs_today') THEN
    ALTER TABLE profiles ADD COLUMN messages_matchs_today integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'super_likes_today') THEN
    ALTER TABLE profiles ADD COLUMN super_likes_today integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_reset_date') THEN
    ALTER TABLE profiles ADD COLUMN last_reset_date date DEFAULT CURRENT_DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'boost_active') THEN
    ALTER TABLE profiles ADD COLUMN boost_active boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'boost_expiry') THEN
    ALTER TABLE profiles ADD COLUMN boost_expiry timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'incognito_mode') THEN
    ALTER TABLE profiles ADD COLUMN incognito_mode boolean DEFAULT false;
  END IF;
END $$;

-- Table des visiteurs de profil (Elite feature)
CREATE TABLE IF NOT EXISTS profile_visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  visitor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  visited_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profile_visitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile visitors" ON profile_visitors;
CREATE POLICY "Users can view their own profile visitors"
  ON profile_visitors FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can record profile visits" ON profile_visitors;
CREATE POLICY "Users can record profile visits"
  ON profile_visitors FOR INSERT
  TO authenticated
  WITH CHECK (visitor_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_profile_visitors_profile ON profile_visitors(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_visitors_date ON profile_visitors(visited_at);

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
  FROM profiles
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

  UPDATE profiles
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
    messages_matchs_today
  INTO user_plan, current_count
  FROM profiles
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

  UPDATE profiles
  SET messages_matchs_today = messages_matchs_today + 1
  WHERE id = user_id;

  RETURN jsonb_build_object(
    'success', true,
    'current', current_count + 1,
    'max', max_limit
  );
END;
$$;

-- Fonction pour activer le boost
CREATE OR REPLACE FUNCTION activate_user_boost(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_plan text;
  boost_duration interval;
  boost_multiplier integer;
BEGIN
  SELECT COALESCE(premium_tier, 'free')
  INTO user_plan
  FROM profiles
  WHERE id = user_id;

  CASE user_plan
    WHEN 'free' THEN
      boost_duration := interval '30 minutes';
      boost_multiplier := 1;
    WHEN 'premium' THEN
      boost_duration := interval '1 hour';
      boost_multiplier := 3;
    WHEN 'premium_elite' THEN
      boost_duration := interval '3 hours';
      boost_multiplier := 10;
    ELSE
      boost_duration := interval '30 minutes';
      boost_multiplier := 1;
  END CASE;

  UPDATE profiles
  SET 
    boost_active = true,
    boost_expiry = now() + boost_duration
  WHERE id = user_id;

  RETURN jsonb_build_object(
    'success', true,
    'multiplier', boost_multiplier,
    'expiry', now() + boost_duration,
    'plan', user_plan
  );
END;
$$;

-- Trigger pour désactiver automatiquement les boosts expirés
CREATE OR REPLACE FUNCTION check_expired_boosts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.boost_active AND NEW.boost_expiry < now() THEN
    NEW.boost_active := false;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_deactivate_boosts ON profiles;
CREATE TRIGGER auto_deactivate_boosts
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_expired_boosts();
