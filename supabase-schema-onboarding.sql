-- ============================================
-- ASTRALOVES - ONBOARDING COLUMNS
-- Ajout colonnes onboarding au schema profiles
-- ============================================

-- Ajouter colonnes onboarding à profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Créer index pour performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
ON profiles(onboarding_completed);

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_step 
ON profiles(onboarding_step);

-- Commentaires
COMMENT ON COLUMN profiles.onboarding_step IS 'Current onboarding step (0=not started, 1=identity, 2=revelation, 3=universe)';
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether user completed onboarding';
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'Timestamp when onboarding was completed';

-- Fonction pour marquer onboarding comme complété
CREATE OR REPLACE FUNCTION complete_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.onboarding_completed = TRUE AND OLD.onboarding_completed = FALSE THEN
    NEW.onboarding_completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-set timestamp
DROP TRIGGER IF EXISTS trigger_complete_onboarding ON profiles;
CREATE TRIGGER trigger_complete_onboarding
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.onboarding_completed IS DISTINCT FROM OLD.onboarding_completed)
  EXECUTE FUNCTION complete_onboarding();

-- ============================================
-- READY TO USE
-- Execute ce SQL dans Supabase SQL Editor
-- ============================================
