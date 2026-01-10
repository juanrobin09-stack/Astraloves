-- Migration: Système de limites d'usage journalier
-- Date: 2026-01-10
-- Description: Tracking des actions quotidiennes des utilisateurs

-- Créer la table daily_usage
CREATE TABLE IF NOT EXISTS daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Compteurs journaliers
  cosmic_signals INTEGER DEFAULT 0,
  super_nova INTEGER DEFAULT 0,
  astra_messages INTEGER DEFAULT 0,
  match_messages INTEGER DEFAULT 0,
  super_likes INTEGER DEFAULT 0,
  
  -- Date de reset
  last_reset DATE DEFAULT CURRENT_DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte: un seul enregistrement par utilisateur
  UNIQUE(user_id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_id ON daily_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_usage_last_reset ON daily_usage(last_reset);

-- RLS Policies
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

-- Politique de lecture: l'utilisateur ne voit que ses propres données
CREATE POLICY "Users can view own daily usage"
ON daily_usage FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Politique d'insertion: l'utilisateur peut créer ses propres données
CREATE POLICY "Users can insert own daily usage"
ON daily_usage FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Politique de mise à jour: l'utilisateur peut mettre à jour ses propres données
CREATE POLICY "Users can update own daily usage"
ON daily_usage FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Fonction pour auto-reset quotidien
CREATE OR REPLACE FUNCTION reset_daily_usage_if_needed()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est un nouveau jour, reset les compteurs
  IF NEW.last_reset < CURRENT_DATE THEN
    NEW.cosmic_signals := 0;
    NEW.super_nova := 0;
    NEW.astra_messages := 0;
    NEW.match_messages := 0;
    NEW.super_likes := 0;
    NEW.last_reset := CURRENT_DATE;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-reset
CREATE TRIGGER trigger_reset_daily_usage
  BEFORE UPDATE ON daily_usage
  FOR EACH ROW
  EXECUTE FUNCTION reset_daily_usage_if_needed();

-- Fonction pour initialiser l'usage d'un nouvel utilisateur
CREATE OR REPLACE FUNCTION initialize_daily_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_usage (user_id, last_reset)
  VALUES (NEW.id, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer automatiquement l'entrée daily_usage
CREATE TRIGGER trigger_initialize_daily_usage
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_daily_usage();

-- Fonction pour reset manuel de tous les utilisateurs (cron job)
CREATE OR REPLACE FUNCTION reset_all_daily_usage()
RETURNS void AS $$
BEGIN
  UPDATE daily_usage
  SET 
    cosmic_signals = 0,
    super_nova = 0,
    astra_messages = 0,
    match_messages = 0,
    super_likes = 0,
    last_reset = CURRENT_DATE,
    updated_at = NOW()
  WHERE last_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON daily_usage TO authenticated;
GRANT USAGE ON SEQUENCE daily_usage_id_seq TO authenticated;

-- Commentaires pour documentation
COMMENT ON TABLE daily_usage IS 'Tracking des actions quotidiennes limitées par plan';
COMMENT ON COLUMN daily_usage.cosmic_signals IS 'Nombre de signaux cosmiques envoyés aujourd''hui';
COMMENT ON COLUMN daily_usage.super_nova IS 'Nombre de Super Nova utilisés aujourd''hui';
COMMENT ON COLUMN daily_usage.astra_messages IS 'Nombre de messages Astra envoyés aujourd''hui';
COMMENT ON COLUMN daily_usage.match_messages IS 'Nombre de messages matchs envoyés aujourd''hui';
COMMENT ON COLUMN daily_usage.super_likes IS 'Nombre de super likes envoyés aujourd''hui';
COMMENT ON COLUMN daily_usage.last_reset IS 'Date du dernier reset (permet le reset automatique)';
