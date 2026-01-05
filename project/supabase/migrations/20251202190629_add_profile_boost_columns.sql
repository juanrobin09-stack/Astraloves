/*
  # Ajout du système de boost de profil

  1. Modifications
    - Ajouter la colonne `boost_active_until` pour suivre les boosts actifs
    - Ajouter la colonne `last_boost_at` pour limiter à 1 boost/24h
    - Ajouter la colonne `is_verified` pour les profils vérifiés

  2. Notes
    - Les boosts durent 30 minutes par défaut
    - Les utilisateurs premium peuvent booster leur profil 1 fois/24h
    - Les profils boostés apparaissent en premier dans la découverte
*/

-- Ajouter les colonnes de boost si elles n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'boost_active_until'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN boost_active_until timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'last_boost_at'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN last_boost_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN is_verified boolean DEFAULT false;
  END IF;
END $$;

-- Index pour optimiser les requêtes de profils boostés
CREATE INDEX IF NOT EXISTS idx_astra_profiles_boost ON astra_profiles(boost_active_until) WHERE boost_active_until IS NOT NULL;

-- Commentaires
COMMENT ON COLUMN astra_profiles.boost_active_until IS 'Date de fin du boost actif (NULL si pas de boost)';
COMMENT ON COLUMN astra_profiles.last_boost_at IS 'Date du dernier boost utilisé (pour limiter à 1/24h)';
COMMENT ON COLUMN astra_profiles.is_verified IS 'Profil vérifié par l''équipe Astra';
