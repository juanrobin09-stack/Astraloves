-- =====================================================
-- AUDIT DE SÉCURITÉ - 10 Janvier 2026
-- Tables et fonctions pour compteurs côté serveur
-- =====================================================

-- Table daily_usage pour compteurs
CREATE TABLE IF NOT EXISTS daily_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  cosmic_signals integer DEFAULT 0,
  astra_messages integer DEFAULT 0,
  match_messages integer DEFAULT 0,
  super_nova integer DEFAULT 0,
  super_likes integer DEFAULT 0,
  stars_viewed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage(user_id, date);

ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own usage" ON daily_usage;
CREATE POLICY "Users can view own usage" ON daily_usage FOR SELECT USING (auth.uid() = user_id);

-- Table audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  details jsonb,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own logs" ON audit_logs;
CREATE POLICY "Users can view own logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);

-- Fonction check_astra_limit
CREATE OR REPLACE FUNCTION check_astra_limit(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan text;
  v_limit int;
  v_used int;
BEGIN
  SELECT COALESCE(premium_tier, 'free') INTO v_plan
  FROM astra_profiles WHERE id = p_user_id;
  
  v_plan := COALESCE(v_plan, 'free');
  
  v_limit := CASE v_plan
    WHEN 'premium_elite' THEN 65
    WHEN 'premium' THEN 40
    ELSE 10
  END;

  SELECT COALESCE(astra_messages, 0) INTO v_used
  FROM daily_usage
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  v_used := COALESCE(v_used, 0);

  RETURN jsonb_build_object(
    'allowed', v_used < v_limit,
    'used', v_used,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_used),
    'plan', v_plan
  );
END;
$$;

-- Fonction increment_astra_messages
DROP FUNCTION IF EXISTS increment_astra_messages(uuid);
CREATE OR REPLACE FUNCTION increment_astra_messages(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_plan text;
  v_limit int;
  v_used int;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'AUTH_REQUIRED');
  END IF;

  SELECT COALESCE(premium_tier, 'free') INTO v_plan
  FROM astra_profiles WHERE id = v_user_id;
  
  v_plan := COALESCE(v_plan, 'free');
  
  v_limit := CASE v_plan
    WHEN 'premium_elite' THEN 65
    WHEN 'premium' THEN 40
    ELSE 10
  END;

  INSERT INTO daily_usage (user_id, date, astra_messages)
  VALUES (v_user_id, CURRENT_DATE, 0)
  ON CONFLICT (user_id, date) DO NOTHING;
  
  SELECT astra_messages INTO v_used
  FROM daily_usage
  WHERE user_id = v_user_id AND date = CURRENT_DATE;
  
  v_used := COALESCE(v_used, 0);

  IF v_used >= v_limit THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'LIMIT_REACHED',
      'remaining', 0,
      'limitReached', true
    );
  END IF;

  UPDATE daily_usage
  SET astra_messages = astra_messages + 1
  WHERE user_id = v_user_id AND date = CURRENT_DATE;

  RETURN jsonb_build_object(
    'success', true, 
    'remaining', v_limit - v_used - 1,
    'used', v_used + 1,
    'limit', v_limit
  );
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION check_astra_limit(uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION increment_astra_messages(uuid) TO authenticated, anon, service_role;
