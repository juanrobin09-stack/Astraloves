/*
  # Système d'Apprentissage IA Astra

  1. Table `astra_swipe_analytics`
    - `id` (uuid, primary key)
    - `user_id` (uuid) → auth.users
    - `swiped_user_id` (uuid) → astra_profiles
    - `direction` (text) - 'left', 'right', 'super'
    - `interest_score` (integer) - Score 0-100 calculé par IA
    - `time_spent_ms` (integer) - Temps passé sur la carte
    - `hesitation_count` (integer) - Nombre d'hésitations
    - `swipe_velocity` (integer) - Vitesse du swipe (lent/rapide)
    - `profile_traits` (jsonb) - Traits du profil swipé (age, intérêts, etc.)
    - `created_at` (timestamptz)

  2. Table `astra_user_preferences`
    - `id` (uuid, primary key)
    - `user_id` (uuid) → auth.users (UNIQUE)
    - `learned_preferences` (jsonb) - Préférences apprises par IA
    - `attractiveness_score` (integer) - Score 0-100
    - `swipe_patterns` (jsonb) - Patterns détectés
    - `fatigue_score` (integer) - Score fatigue 0-100
    - `last_fatigue_alert` (timestamptz)
    - `updated_at` (timestamptz)

  3. Table `astra_profile_verification`
    - `id` (uuid, primary key)
    - `profile_id` (uuid) → astra_profiles (UNIQUE)
    - `verification_score` (integer) - Score 0-100 (confiance)
    - `is_bot_suspected` (boolean)
    - `photo_authenticity_score` (integer) - 0-100
    - `activity_pattern_score` (integer) - 0-100
    - `verified_badge` (boolean)
    - `last_check` (timestamptz)
    - `updated_at` (timestamptz)

  4. Table `astra_ai_insights`
    - `id` (uuid, primary key)
    - `user_id` (uuid) → auth.users
    - `insight_type` (text) - 'preference', 'fatigue', 'optimization', 'match_prediction'
    - `message` (text) - Message insight affiché à l'user
    - `data` (jsonb) - Données associées
    - `priority` (integer) - 1-10
    - `displayed` (boolean)
    - `created_at` (timestamptz)

  5. Security
    - Enable RLS sur toutes les tables
    - Policies strictes
*/

-- Table swipe analytics
CREATE TABLE IF NOT EXISTS astra_swipe_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  swiped_user_id uuid REFERENCES astra_profiles(id) ON DELETE CASCADE NOT NULL,
  direction text NOT NULL CHECK (direction IN ('left', 'right', 'super')),
  interest_score integer NOT NULL CHECK (interest_score >= 0 AND interest_score <= 100),
  time_spent_ms integer DEFAULT 0,
  hesitation_count integer DEFAULT 0,
  swipe_velocity integer DEFAULT 50,
  profile_traits jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_swipe_analytics_user ON astra_swipe_analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swipe_analytics_direction ON astra_swipe_analytics(user_id, direction);

-- Table préférences apprises
CREATE TABLE IF NOT EXISTS astra_user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  learned_preferences jsonb DEFAULT '{}'::jsonb,
  attractiveness_score integer DEFAULT 50 CHECK (attractiveness_score >= 0 AND attractiveness_score <= 100),
  swipe_patterns jsonb DEFAULT '{}'::jsonb,
  fatigue_score integer DEFAULT 0 CHECK (fatigue_score >= 0 AND fatigue_score <= 100),
  last_fatigue_alert timestamptz,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON astra_user_preferences(user_id);

-- Table vérification profils
CREATE TABLE IF NOT EXISTS astra_profile_verification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES astra_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  verification_score integer DEFAULT 50 CHECK (verification_score >= 0 AND verification_score <= 100),
  is_bot_suspected boolean DEFAULT false,
  photo_authenticity_score integer DEFAULT 50 CHECK (photo_authenticity_score >= 0 AND photo_authenticity_score <= 100),
  activity_pattern_score integer DEFAULT 50 CHECK (activity_pattern_score >= 0 AND activity_pattern_score <= 100),
  verified_badge boolean DEFAULT false,
  last_check timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_verification_profile ON astra_profile_verification(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_verification_score ON astra_profile_verification(verification_score DESC);

-- Table insights IA
CREATE TABLE IF NOT EXISTS astra_ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_type text NOT NULL CHECK (insight_type IN ('preference', 'fatigue', 'optimization', 'match_prediction', 'profile_boost')),
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  priority integer DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  displayed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_user ON astra_ai_insights(user_id, displayed, priority DESC);

-- Enable RLS
ALTER TABLE astra_swipe_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE astra_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE astra_profile_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE astra_ai_insights ENABLE ROW LEVEL SECURITY;

-- Policies swipe analytics
CREATE POLICY "Users can view own swipe analytics"
  ON astra_swipe_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own swipe analytics"
  ON astra_swipe_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies user preferences
CREATE POLICY "Users can view own preferences"
  ON astra_user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON astra_user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON astra_user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies profile verification (lecture publique)
CREATE POLICY "Anyone can view profile verification"
  ON astra_profile_verification FOR SELECT
  TO authenticated
  USING (true);

-- Policies AI insights
CREATE POLICY "Users can view own insights"
  ON astra_ai_insights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON astra_ai_insights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fonction : Calculer score d'intérêt basé sur comportement
CREATE OR REPLACE FUNCTION calculate_interest_score(
  p_direction text,
  p_time_spent_ms integer,
  p_hesitation_count integer,
  p_swipe_velocity integer
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_base_score integer;
  v_time_bonus integer;
  v_hesitation_penalty integer;
  v_velocity_modifier integer;
  v_final_score integer;
BEGIN
  -- Score de base selon direction
  IF p_direction = 'super' THEN
    v_base_score := 95;
  ELSIF p_direction = 'right' THEN
    v_base_score := 70;
  ELSE
    v_base_score := 20;
  END IF;
  
  -- Bonus temps passé (plus de temps = plus d'intérêt)
  v_time_bonus := LEAST(GREATEST((p_time_spent_ms - 2000) / 200, 0), 15);
  
  -- Pénalité hésitation (hésitation = indécision = moins d'intérêt)
  v_hesitation_penalty := p_hesitation_count * 3;
  
  -- Modificateur vélocité (swipe rapide sans regarder = moins d'intérêt)
  IF p_swipe_velocity > 80 AND p_time_spent_ms < 2000 THEN
    v_velocity_modifier := -10;
  ELSE
    v_velocity_modifier := 0;
  END IF;
  
  -- Calcul final
  v_final_score := v_base_score + v_time_bonus - v_hesitation_penalty + v_velocity_modifier;
  
  -- Clamp entre 0 et 100
  RETURN LEAST(GREATEST(v_final_score, 0), 100);
END;
$$;

-- Fonction : Détecter fatigue swipe
CREATE OR REPLACE FUNCTION detect_swipe_fatigue(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recent_swipes_count integer;
  v_left_swipe_ratio numeric;
  v_avg_time_spent integer;
  v_fatigue_detected boolean := false;
BEGIN
  -- Compter swipes des dernières 10 minutes
  SELECT COUNT(*) INTO v_recent_swipes_count
  FROM astra_swipe_analytics
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '10 minutes';
  
  -- Ratio swipes gauche sur les 20 derniers
  SELECT 
    COUNT(CASE WHEN direction = 'left' THEN 1 END)::numeric / NULLIF(COUNT(*), 0)
  INTO v_left_swipe_ratio
  FROM (
    SELECT direction
    FROM astra_swipe_analytics
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 20
  ) recent;
  
  -- Temps moyen passé
  SELECT AVG(time_spent_ms) INTO v_avg_time_spent
  FROM astra_swipe_analytics
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '10 minutes';
  
  -- Détection fatigue
  IF v_recent_swipes_count > 30 OR 
     v_left_swipe_ratio > 0.80 OR 
     v_avg_time_spent < 1500 THEN
    v_fatigue_detected := true;
    
    -- Mettre à jour score fatigue
    UPDATE astra_user_preferences
    SET 
      fatigue_score = LEAST(fatigue_score + 20, 100),
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN v_fatigue_detected;
END;
$$;

-- Fonction : Générer insight IA
CREATE OR REPLACE FUNCTION generate_ai_insight(
  p_user_id uuid,
  p_insight_type text,
  p_message text,
  p_data jsonb DEFAULT '{}'::jsonb,
  p_priority integer DEFAULT 5
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_insight_id uuid;
BEGIN
  INSERT INTO astra_ai_insights (
    user_id,
    insight_type,
    message,
    data,
    priority
  ) VALUES (
    p_user_id,
    p_insight_type,
    p_message,
    p_data,
    p_priority
  )
  RETURNING id INTO v_insight_id;
  
  RETURN v_insight_id;
END;
$$;

-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION update_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_preferences_updated_at ON astra_user_preferences;
CREATE TRIGGER trigger_preferences_updated_at
  BEFORE UPDATE ON astra_user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_preferences_updated_at();

DROP TRIGGER IF EXISTS trigger_verification_updated_at ON astra_profile_verification;
CREATE TRIGGER trigger_verification_updated_at
  BEFORE UPDATE ON astra_profile_verification
  FOR EACH ROW
  EXECUTE FUNCTION update_preferences_updated_at();
