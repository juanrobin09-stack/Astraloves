/*
  # Système de compatibilité astrologique complète

  1. Ajout de colonnes astrologiques manquantes à astra_profiles
    - `moon_sign` : signe lunaire
    - `ascendant_sign` : ascendant  
    - `venus_sign` : Vénus (amour)
    - `mars_sign` : Mars (passion)

  2. Nouvelles Tables
    - `astro_compatibility_scores` : Cache des scores de compatibilité calculés
      - user_id et target_user_id (UUID)
      - score total (0-100) + détail astro/questionnaire
      - cache de 7 jours
    
    - `astro_user_preferences` : Préférences et réponses au questionnaire
      - user_id (UUID, référence auth.users)
      - langage amoureux, objectifs relationnels
      - valeurs, intérêts, dealbreakers

  3. Sécurité
    - Enable RLS sur les deux tables
    - Policies pour lecture/écriture de ses propres données
*/

-- Ajouter les colonnes astrologiques manquantes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'astra_profiles' AND column_name = 'moon_sign'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN moon_sign TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'astra_profiles' AND column_name = 'ascendant_sign'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN ascendant_sign TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'astra_profiles' AND column_name = 'venus_sign'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN venus_sign TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'astra_profiles' AND column_name = 'mars_sign'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN mars_sign TEXT;
  END IF;
END $$;

-- Table des scores de compatibilité (cache)
CREATE TABLE IF NOT EXISTS astro_compatibility_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  astro_score INTEGER CHECK (astro_score >= 0 AND astro_score <= 60),
  questionnaire_score INTEGER CHECK (questionnaire_score >= 0 AND questionnaire_score <= 40),
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, target_user_id),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (target_user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_astro_compat_user ON astro_compatibility_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_astro_compat_target ON astro_compatibility_scores(target_user_id);
CREATE INDEX IF NOT EXISTS idx_astro_compat_score ON astro_compatibility_scores(score DESC);

-- Table des préférences utilisateur (questionnaire)
CREATE TABLE IF NOT EXISTS astro_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  love_language TEXT CHECK (love_language IN ('words', 'time', 'gifts', 'touch', 'service')),
  relationship_goals TEXT CHECK (relationship_goals IN ('serious', 'casual', 'friendship', 'exploring')),
  values TEXT[] DEFAULT ARRAY[]::TEXT[],
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  personality_traits JSONB DEFAULT '{}'::JSONB,
  wants_children BOOLEAN,
  religion TEXT,
  religion_important BOOLEAN DEFAULT false,
  smokes BOOLEAN DEFAULT false,
  smoking_ok BOOLEAN DEFAULT true,
  max_distance INTEGER DEFAULT 100,
  dealbreakers TEXT[] DEFAULT ARRAY[]::TEXT[],
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index pour recherche
CREATE INDEX IF NOT EXISTS idx_astro_user_prefs_user ON astro_user_preferences(user_id);

-- Enable RLS
ALTER TABLE astro_compatibility_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE astro_user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies pour astro_compatibility_scores
DROP POLICY IF EXISTS "Users view own compat scores" ON astro_compatibility_scores;
CREATE POLICY "Users view own compat scores"
  ON astro_compatibility_scores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view compat where target" ON astro_compatibility_scores;
CREATE POLICY "Users view compat where target"
  ON astro_compatibility_scores FOR SELECT
  TO authenticated
  USING (auth.uid() = target_user_id);

DROP POLICY IF EXISTS "Users insert own compat scores" ON astro_compatibility_scores;
CREATE POLICY "Users insert own compat scores"
  ON astro_compatibility_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own compat scores" ON astro_compatibility_scores;
CREATE POLICY "Users update own compat scores"
  ON astro_compatibility_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own compat scores" ON astro_compatibility_scores;
CREATE POLICY "Users delete own compat scores"
  ON astro_compatibility_scores FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies pour astro_user_preferences
DROP POLICY IF EXISTS "Users view own prefs" ON astro_user_preferences;
CREATE POLICY "Users view own prefs"
  ON astro_user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own prefs" ON astro_user_preferences;
CREATE POLICY "Users insert own prefs"
  ON astro_user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own prefs" ON astro_user_preferences;
CREATE POLICY "Users update own prefs"
  ON astro_user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own prefs" ON astro_user_preferences;
CREATE POLICY "Users delete own prefs"
  ON astro_user_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_astro_user_prefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_astro_user_prefs_at ON astro_user_preferences;
CREATE TRIGGER trigger_update_astro_user_prefs_at
  BEFORE UPDATE ON astro_user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_astro_user_prefs_updated_at();