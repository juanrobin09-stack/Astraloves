/*
  # Système de Swipes Quotidiens Type Tinder

  1. Nouvelle Table `daily_swipes`
    - `id` (uuid, primary key)
    - `user_id` (uuid) → auth.users
    - `swipe_date` (date) - Date du swipe
    - `swipes_count` (integer) - Nombre de swipes ce jour
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. Table `swipes` (déjà existe)
    - Tracking de chaque swipe individuel
    - Direction (left/right)
    - Match si mutual

  3. Security
    - Enable RLS sur `daily_swipes`
    - Policies pour lecture/écriture propres données

  4. Fonctions
    - get_daily_swipes_count(user_id) - Retourne nombre de swipes aujourd'hui
    - can_swipe(user_id) - Vérifie si user peut swiper
    - increment_swipe_count(user_id) - Incrémente le compteur
*/

-- Créer la table daily_swipes si elle n'existe pas
CREATE TABLE IF NOT EXISTS daily_swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  swipe_date date NOT NULL DEFAULT CURRENT_DATE,
  swipes_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, swipe_date)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_daily_swipes_user_date ON daily_swipes(user_id, swipe_date);

-- Enable RLS
ALTER TABLE daily_swipes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own daily swipes"
  ON daily_swipes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily swipes"
  ON daily_swipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily swipes"
  ON daily_swipes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fonction pour obtenir le nombre de swipes aujourd'hui
CREATE OR REPLACE FUNCTION get_daily_swipes_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COALESCE(swipes_count, 0)
  INTO v_count
  FROM daily_swipes
  WHERE user_id = p_user_id
    AND swipe_date = CURRENT_DATE;
  
  RETURN COALESCE(v_count, 0);
END;
$$;

-- Fonction pour vérifier si un user peut swiper
CREATE OR REPLACE FUNCTION can_swipe(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_premium boolean;
  v_swipes_today integer;
BEGIN
  -- Vérifier si premium
  SELECT is_premium INTO v_is_premium
  FROM astra_profiles
  WHERE id = p_user_id;
  
  -- Premium = swipes illimités
  IF v_is_premium THEN
    RETURN true;
  END IF;
  
  -- Gratuit = max 5 swipes/jour
  v_swipes_today := get_daily_swipes_count(p_user_id);
  
  RETURN v_swipes_today < 5;
END;
$$;

-- Fonction pour incrémenter le compteur de swipes
CREATE OR REPLACE FUNCTION increment_swipe_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_count integer;
BEGIN
  -- Insert or update le compteur du jour
  INSERT INTO daily_swipes (user_id, swipe_date, swipes_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, swipe_date)
  DO UPDATE SET 
    swipes_count = daily_swipes.swipes_count + 1,
    updated_at = now()
  RETURNING swipes_count INTO v_new_count;
  
  RETURN v_new_count;
END;
$$;

-- Trigger pour auto-update updated_at
CREATE OR REPLACE FUNCTION update_daily_swipes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_daily_swipes_updated_at ON daily_swipes;
CREATE TRIGGER trigger_daily_swipes_updated_at
  BEFORE UPDATE ON daily_swipes
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_swipes_updated_at();
