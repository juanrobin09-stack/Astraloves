/*
  # Système de Recherche par Pseudo/Prénom

  1. Modifications
    - Ajouter colonne `username` aux profils (pseudo unique)
    - Table `search_history` pour tracking recherches
    - Fonction recherche optimisée
    - Index pour performance

  2. Fonctionnalités
    - Recherche par pseudo (@username) ou prénom
    - Limite recherches (5/jour gratuit, illimité premium)
    - Historique recherches
    - Anti-spam

  3. Security
    - RLS sur toutes les tables
    - Validation username unique
*/

-- Ajouter username aux profils
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN username text UNIQUE;
  END IF;
END $$;

-- Index pour recherche optimisée
CREATE INDEX IF NOT EXISTS idx_profiles_username ON astra_profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON astra_profiles(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_profiles_firstname_lower ON astra_profiles(LOWER(first_name));
CREATE INDEX IF NOT EXISTS idx_profiles_ville_lower ON astra_profiles(LOWER(ville));
CREATE INDEX IF NOT EXISTS idx_profiles_sun_sign_lower ON astra_profiles(LOWER(sun_sign));

-- Table historique recherches
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query text NOT NULL,
  results_count integer DEFAULT 0,
  search_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_date ON search_history(user_id, search_date);

-- Table compteur recherches
CREATE TABLE IF NOT EXISTS daily_searches (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  search_count integer DEFAULT 0,
  search_date date DEFAULT CURRENT_DATE,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_searches ENABLE ROW LEVEL SECURITY;

-- Policies search_history
CREATE POLICY "Users can view own search history"
  ON search_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history"
  ON search_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies daily_searches
CREATE POLICY "Users can view own search count"
  ON daily_searches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search count"
  ON daily_searches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own search count"
  ON daily_searches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fonction recherche profils
CREATE OR REPLACE FUNCTION search_profiles(
  p_query text,
  p_user_id uuid,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  username text,
  first_name text,
  age integer,
  city text,
  sun_sign text,
  avatar_url text,
  photos text[],
  bio text,
  match_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_search_lower text;
  v_is_username boolean;
BEGIN
  -- Normaliser query
  v_search_lower := LOWER(TRIM(p_query));
  v_is_username := v_search_lower LIKE '@%';

  -- Enlever @ si présent
  IF v_is_username THEN
    v_search_lower := SUBSTRING(v_search_lower FROM 2);
  END IF;

  -- Recherche
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.first_name,
    p.age,
    p.ville as city,
    p.sun_sign,
    p.avatar_url,
    p.photos,
    p.bio,
    CASE
      -- Score parfait si username exact
      WHEN LOWER(p.username) = v_search_lower THEN 100
      -- Score élevé si username commence par query
      WHEN LOWER(p.username) LIKE v_search_lower || '%' THEN 90
      -- Score moyen si prénom exact
      WHEN LOWER(p.first_name) = v_search_lower THEN 80
      -- Score moyen si prénom commence par query
      WHEN LOWER(p.first_name) LIKE v_search_lower || '%' THEN 70
      -- Score si ville correspond
      WHEN LOWER(p.ville) LIKE '%' || v_search_lower || '%' THEN 65
      -- Score si signe correspond
      WHEN LOWER(p.sun_sign) LIKE '%' || v_search_lower || '%' THEN 65
      -- Score bas si username contient query
      WHEN LOWER(p.username) LIKE '%' || v_search_lower || '%' THEN 60
      -- Score bas si prénom contient query
      WHEN LOWER(p.first_name) LIKE '%' || v_search_lower || '%' THEN 50
      ELSE 0
    END as match_score
  FROM astra_profiles p
  WHERE
    p.id != p_user_id
    AND (
      LOWER(p.username) LIKE '%' || v_search_lower || '%'
      OR LOWER(p.first_name) LIKE '%' || v_search_lower || '%'
      OR LOWER(p.ville) LIKE '%' || v_search_lower || '%'
      OR LOWER(p.sun_sign) LIKE '%' || v_search_lower || '%'
    )
  ORDER BY match_score DESC, p.first_name ASC
  LIMIT p_limit;
END;
$$;

-- Fonction incrémenter compteur recherches
CREATE OR REPLACE FUNCTION increment_search_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
  v_today date := CURRENT_DATE;
BEGIN
  -- Insérer ou mettre à jour
  INSERT INTO daily_searches (user_id, search_count, search_date)
  VALUES (p_user_id, 1, v_today)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    search_count = CASE
      WHEN daily_searches.search_date = v_today THEN daily_searches.search_count + 1
      ELSE 1
    END,
    search_date = v_today,
    updated_at = NOW()
  RETURNING search_count INTO v_count;
  
  RETURN v_count;
END;
$$;

-- Fonction obtenir compteur recherches
CREATE OR REPLACE FUNCTION get_search_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
  v_today date := CURRENT_DATE;
BEGIN
  SELECT search_count INTO v_count
  FROM daily_searches
  WHERE user_id = p_user_id AND search_date = v_today;
  
  RETURN COALESCE(v_count, 0);
END;
$$;

-- Trigger reset compteur recherches quotidien
CREATE OR REPLACE FUNCTION reset_daily_searches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE daily_searches
  SET search_count = 0, search_date = CURRENT_DATE
  WHERE search_date < CURRENT_DATE;
END;
$$;

-- Générer username par défaut pour profils existants
DO $$
DECLARE
  profile_record RECORD;
  new_username text;
  counter integer;
BEGIN
  FOR profile_record IN 
    SELECT id, first_name 
    FROM astra_profiles 
    WHERE username IS NULL
  LOOP
    -- Créer username basé sur prénom
    new_username := LOWER(REGEXP_REPLACE(profile_record.first_name, '[^a-zA-Z0-9]', '', 'g'));
    counter := 0;
    
    -- Assurer unicité
    WHILE EXISTS (SELECT 1 FROM astra_profiles WHERE username = new_username) LOOP
      counter := counter + 1;
      new_username := LOWER(REGEXP_REPLACE(profile_record.first_name, '[^a-zA-Z0-9]', '', 'g')) || counter::text;
    END LOOP;
    
    UPDATE astra_profiles
    SET username = new_username
    WHERE id = profile_record.id;
  END LOOP;
END $$;
