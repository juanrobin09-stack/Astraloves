/*
  # Système Constellation Magique

  1. Nouvelles Tables
    - `cosmic_signals`
      - Stocke les signaux cosmiques envoyés entre utilisateurs
      - Type: signal normal ou super nova
      - Mode incognito supporté
    - `cosmic_matches`
      - Stocke les connexions stellaires (matchs mutuels)
      - Avec score de compatibilité
    - `daily_cosmic_limits`
      - Track les limites quotidiennes par utilisateur
      - Signaux et super novas utilisés

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Policies restrictives par utilisateur
*/

-- Table des signaux cosmiques
CREATE TABLE IF NOT EXISTS cosmic_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type text NOT NULL DEFAULT 'signal' CHECK (signal_type IN ('signal', 'super_nova')),
  is_incognito boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(from_user, to_user)
);

ALTER TABLE cosmic_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view signals they sent"
  ON cosmic_signals FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user);

CREATE POLICY "Users can view signals they received"
  ON cosmic_signals FOR SELECT
  TO authenticated
  USING (auth.uid() = to_user);

CREATE POLICY "Users can send signals"
  ON cosmic_signals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user);

CREATE POLICY "Users can delete their sent signals"
  ON cosmic_signals FOR DELETE
  TO authenticated
  USING (auth.uid() = from_user);

-- Table des connexions stellaires (matchs)
CREATE TABLE IF NOT EXISTS cosmic_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compatibility_score integer NOT NULL DEFAULT 0,
  matched_at timestamptz DEFAULT now(),
  last_message_at timestamptz,
  CHECK (user1_id < user2_id)
);

ALTER TABLE cosmic_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their matches"
  ON cosmic_matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create matches"
  ON cosmic_matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_cosmic_signals_from_user ON cosmic_signals(from_user);
CREATE INDEX IF NOT EXISTS idx_cosmic_signals_to_user ON cosmic_signals(to_user);
CREATE INDEX IF NOT EXISTS idx_cosmic_signals_created_at ON cosmic_signals(created_at);
CREATE INDEX IF NOT EXISTS idx_cosmic_matches_user1 ON cosmic_matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_cosmic_matches_user2 ON cosmic_matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_cosmic_matches_matched_at ON cosmic_matches(matched_at);

-- Table des limites quotidiennes
CREATE TABLE IF NOT EXISTS daily_cosmic_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  signals_used integer DEFAULT 0,
  super_novas_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_cosmic_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own limits"
  ON daily_cosmic_limits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their limits"
  ON daily_cosmic_limits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their limits"
  ON daily_cosmic_limits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_daily_cosmic_limits_user_date ON daily_cosmic_limits(user_id, date);

-- Fonction pour incrémenter les signaux utilisés
CREATE OR REPLACE FUNCTION increment_cosmic_signal_usage(
  p_user_id uuid,
  p_is_super_nova boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO daily_cosmic_limits (user_id, date, signals_used, super_novas_used)
  VALUES (
    p_user_id,
    CURRENT_DATE,
    CASE WHEN p_is_super_nova THEN 0 ELSE 1 END,
    CASE WHEN p_is_super_nova THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    signals_used = daily_cosmic_limits.signals_used + CASE WHEN p_is_super_nova THEN 0 ELSE 1 END,
    super_novas_used = daily_cosmic_limits.super_novas_used + CASE WHEN p_is_super_nova THEN 1 ELSE 0 END,
    updated_at = now();
END;
$$;

-- Fonction pour obtenir les signaux restants
CREATE OR REPLACE FUNCTION get_remaining_cosmic_signals(p_user_id uuid)
RETURNS TABLE(
  signals_remaining integer,
  super_novas_remaining integer,
  tier text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tier text;
  v_signals_used integer;
  v_super_novas_used integer;
  v_max_signals integer;
  v_max_super_novas integer;
BEGIN
  -- Obtenir le tier de l'utilisateur
  SELECT COALESCE(subscription_tier, 'free')
  INTO v_tier
  FROM profiles
  WHERE id = p_user_id;

  -- Définir les limites selon le tier
  CASE v_tier
    WHEN 'elite' THEN
      v_max_signals := 999999;
      v_max_super_novas := 5;
    WHEN 'premium' THEN
      v_max_signals := 20;
      v_max_super_novas := 1;
    ELSE
      v_max_signals := 3;
      v_max_super_novas := 0;
  END CASE;

  -- Obtenir l'utilisation du jour
  SELECT 
    COALESCE(signals_used, 0),
    COALESCE(super_novas_used, 0)
  INTO v_signals_used, v_super_novas_used
  FROM daily_cosmic_limits
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

  -- Si pas d'entrée, c'est 0
  v_signals_used := COALESCE(v_signals_used, 0);
  v_super_novas_used := COALESCE(v_super_novas_used, 0);

  RETURN QUERY SELECT
    GREATEST(0, v_max_signals - v_signals_used),
    GREATEST(0, v_max_super_novas - v_super_novas_used),
    v_tier;
END;
$$;

-- Fonction pour vérifier si un match existe
CREATE OR REPLACE FUNCTION check_cosmic_match(
  p_user1_id uuid,
  p_user2_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_signal_exists boolean;
  v_reverse_signal_exists boolean;
BEGIN
  -- Vérifier si user1 a envoyé un signal à user2
  SELECT EXISTS(
    SELECT 1 FROM cosmic_signals
    WHERE from_user = p_user1_id AND to_user = p_user2_id
  ) INTO v_signal_exists;

  -- Vérifier si user2 a envoyé un signal à user1
  SELECT EXISTS(
    SELECT 1 FROM cosmic_signals
    WHERE from_user = p_user2_id AND to_user = p_user1_id
  ) INTO v_reverse_signal_exists;

  RETURN v_signal_exists AND v_reverse_signal_exists;
END;
$$;