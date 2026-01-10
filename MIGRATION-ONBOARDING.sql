-- ===================================================================
-- MIGRATION ONBOARDING - À exécuter dans Supabase SQL Editor
-- ===================================================================

-- Ajouter champs onboarding dans profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1 CHECK (onboarding_step >= 1 AND onboarding_step <= 3),
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Update trigger pour onboarding_completed_at
CREATE OR REPLACE FUNCTION handle_onboarding_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.onboarding_completed = TRUE AND OLD.onboarding_completed = FALSE THEN
    NEW.onboarding_completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_onboarding_completed_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_onboarding_completed();

-- Commentaires
COMMENT ON COLUMN profiles.onboarding_step IS 'Étape actuelle onboarding (1-3)';
COMMENT ON COLUMN profiles.onboarding_completed IS 'Si onboarding terminé';
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'Date complétion onboarding';
