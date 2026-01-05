/*
  # Update search_profiles function with age filter

  1. Changes
    - Adds intelligent age filtering to search_profiles function
    - Retrieves user's age and preferences
    - Applies age range based on user's age or custom preferences
    - Ensures no matches with incompatible age ranges

  2. Age Range Logic
    - 18-25: age 18-28
    - 26-35: ±5 years
    - 36-45: ±7 years
    - 46-55: ±8 years
    - 56+: ±10 years
    - Always respects minimum age of 18

  3. Notes
    - If user has custom age preferences (preferred_min_age, preferred_max_age), those are used
    - Otherwise, automatic calculation based on user's age
*/

-- Drop existing function
DROP FUNCTION IF EXISTS search_profiles(text, uuid, integer);

-- Recreate search_profiles function with age filter
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
  v_user_age integer;
  v_min_age integer;
  v_max_age integer;
  v_preferred_min integer;
  v_preferred_max integer;
BEGIN
  -- Get user's age and preferences
  SELECT 
    ap.age, 
    ap.preferred_min_age, 
    ap.preferred_max_age
  INTO 
    v_user_age, 
    v_preferred_min, 
    v_preferred_max
  FROM astra_profiles ap
  WHERE ap.id = p_user_id;

  -- Use custom preferences if set, otherwise calculate based on age
  IF v_preferred_min IS NOT NULL AND v_preferred_max IS NOT NULL THEN
    v_min_age := GREATEST(18, v_preferred_min);
    v_max_age := v_preferred_max;
  ELSE
    -- Calculate age range based on user's age
    v_user_age := COALESCE(v_user_age, 25);
    
    IF v_user_age BETWEEN 18 AND 25 THEN
      v_min_age := 18;
      v_max_age := 28;
    ELSIF v_user_age BETWEEN 26 AND 35 THEN
      v_min_age := v_user_age - 5;
      v_max_age := v_user_age + 5;
    ELSIF v_user_age BETWEEN 36 AND 45 THEN
      v_min_age := v_user_age - 7;
      v_max_age := v_user_age + 7;
    ELSIF v_user_age BETWEEN 46 AND 55 THEN
      v_min_age := v_user_age - 8;
      v_max_age := v_user_age + 8;
    ELSE
      v_min_age := v_user_age - 10;
      v_max_age := v_user_age + 10;
    END IF;
    
    v_min_age := GREATEST(18, v_min_age);
  END IF;

  -- Normaliser query
  v_search_lower := LOWER(TRIM(p_query));
  v_is_username := v_search_lower LIKE '@%';

  -- Enlever @ si présent
  IF v_is_username THEN
    v_search_lower := SUBSTRING(v_search_lower FROM 2);
  END IF;

  -- Recherche avec filtre d'âge
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
      WHEN LOWER(p.username) = v_search_lower THEN 100
      WHEN LOWER(p.username) LIKE v_search_lower || '%' THEN 90
      WHEN LOWER(p.first_name) = v_search_lower THEN 80
      WHEN LOWER(p.first_name) LIKE v_search_lower || '%' THEN 70
      WHEN LOWER(p.ville) LIKE '%' || v_search_lower || '%' THEN 65
      WHEN LOWER(p.sun_sign) LIKE '%' || v_search_lower || '%' THEN 65
      WHEN LOWER(p.username) LIKE '%' || v_search_lower || '%' THEN 60
      WHEN LOWER(p.first_name) LIKE '%' || v_search_lower || '%' THEN 50
      ELSE 0
    END as match_score
  FROM astra_profiles p
  WHERE
    p.id != p_user_id
    AND p.age >= v_min_age
    AND p.age <= v_max_age
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
