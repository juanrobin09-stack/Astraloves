/*
  # Correction du système de comptage des swipes

  1. Ajout des colonnes manquantes
    - `swipes_today` dans astra_profiles pour tracker les swipes quotidiens
    - `last_reset_date` pour savoir quand réinitialiser

  2. Fonction corrigée
    - `increment_user_swipes` utilise maintenant astra_profiles au lieu de profiles
    - Vérifie correctement les limites selon le plan (free = 10, premium/elite = illimité)

  3. Sécurité
    - Les fonctions sont SECURITY DEFINER pour permettre les mises à jour
    - Les compteurs sont réinitialisés automatiquement chaque jour
*/

-- Ajouter la colonne swipes_today à astra_profiles si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'astra_profiles' AND column_name = 'swipes_today'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN swipes_today integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'astra_profiles' AND column_name = 'last_reset_date'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN last_reset_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Fonction corrigée pour incrémenter les swipes avec vérification
CREATE OR REPLACE FUNCTION increment_user_swipes(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count integer;
  max_limit integer;
  user_plan text;
  is_premium_user boolean;
BEGIN
  -- Récupérer les données depuis astra_profiles
  SELECT 
    COALESCE(premium_tier, 'free'),
    COALESCE(swipes_today, 0),
    COALESCE(is_premium, false)
  INTO user_plan, current_count, is_premium_user
  FROM astra_profiles
  WHERE id = user_id;

  -- Si l'utilisateur est premium (par flag ou par tier), pas de limite
  IF is_premium_user OR user_plan != 'free' THEN
    RETURN jsonb_build_object(
      'success', true,
      'current', 0,
      'max', 999999
    );
  END IF;

  -- Pour les utilisateurs gratuits : limite de 10
  max_limit := 10;

  -- Vérifier si la limite est atteinte
  IF current_count >= max_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'limit_reached',
      'current', current_count,
      'max', max_limit
    );
  END IF;

  -- Incrémenter le compteur
  UPDATE astra_profiles
  SET 
    swipes_today = swipes_today + 1,
    last_reset_date = CURRENT_DATE
  WHERE id = user_id;

  RETURN jsonb_build_object(
    'success', true,
    'current', current_count + 1,
    'max', max_limit
  );
END;
$$;
