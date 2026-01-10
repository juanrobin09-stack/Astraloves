/*
  # Mise à jour de la limite de swipes quotidiens

  1. Modifications
    - Augmenter la limite de swipes gratuits de 5 à 10 par jour
    - Modifier la fonction `can_swipe()` pour refléter cette nouvelle limite

  2. Justification
    - Améliorer l'expérience utilisateur gratuit
    - Aligner avec les standards du marché (Tinder, Bumble, etc.)
*/

-- Mettre à jour la fonction can_swipe avec nouvelle limite de 10 swipes
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
  
  -- Gratuit = max 10 swipes/jour
  v_swipes_today := get_daily_swipes_count(p_user_id);
  
  RETURN v_swipes_today < 10;
END;
$$;
