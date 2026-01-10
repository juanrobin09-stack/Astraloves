-- ═══════════════════════════════════════════════════════════════════════
-- ASTRA - MIGRATIONS SQL COMPLÈTES
-- Date: 2026-01-10
-- Description: Système complet d'abonnements et résultats
-- ═══════════════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────────────┐
-- │ 1. TABLE: daily_usage                                               │
-- │    Tracking des actions quotidiennes limitées                       │
-- └─────────────────────────────────────────────────────────────────────┘

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
  
  -- Contrainte: un seul enregistrement par utilisateur
  UNIQUE(user_id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_id ON daily_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_usage_last_reset ON daily_usage(last_reset);

-- RLS Policies
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own daily usage" ON daily_usage;
CREATE POLICY "Users can view own daily usage"
ON daily_usage FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own daily usage" ON daily_usage;
CREATE POLICY "Users can insert own daily usage"
ON daily_usage FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own daily usage" ON daily_usage;
CREATE POLICY "Users can update own daily usage"
ON daily_usage FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON daily_usage TO authenticated;

-- ┌─────────────────────────────────────────────────────────────────────┐
-- │ 2. TABLE: quiz_results                                              │
-- │    Historique des questionnaires et analyses                        │
-- └─────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  quiz_name TEXT NOT NULL,
  
  -- Résultats
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score JSONB DEFAULT '{}'::jsonb,
  archetype TEXT,
  summary TEXT,
  
  -- Analyses IA par tier
  ai_analysis TEXT, -- Analyse basique (Free)
  ai_analysis_advanced TEXT, -- Analyse Premium
  ai_analysis_elite TEXT, -- Analyse Elite complète
  
  -- Métadonnées
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tier_at_completion TEXT DEFAULT 'free',
  
  -- Progression
  insight_level INTEGER DEFAULT 1, -- 1=Free, 2=Premium, 3=Elite
  unlocked_features JSONB DEFAULT '[]'::jsonb,
  
  UNIQUE(user_id, quiz_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON quiz_results(completed_at);

-- RLS Policies
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quiz results" ON quiz_results;
CREATE POLICY "Users can view own quiz results"
ON quiz_results FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz results" ON quiz_results;
CREATE POLICY "Users can insert own quiz results"
ON quiz_results FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own quiz results" ON quiz_results;
CREATE POLICY "Users can update own quiz results"
ON quiz_results FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON quiz_results TO authenticated;

-- ┌─────────────────────────────────────────────────────────────────────┐
-- │ 3. TABLE: astral_themes (Elite uniquement)                          │
-- │    Thème astral complet                                             │
-- └─────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS astral_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Données de naissance
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_location TEXT,
  
  -- Éléments principaux
  sun_sign TEXT NOT NULL, -- Soleil
  moon_sign TEXT, -- Lune
  rising_sign TEXT, -- Ascendant
  
  -- Planètes
  mercury_sign TEXT,
  venus_sign TEXT,
  mars_sign TEXT,
  jupiter_sign TEXT,
  saturn_sign TEXT,
  uranus_sign TEXT,
  neptune_sign TEXT,
  pluto_sign TEXT,
  
  -- Maisons (si heure connue)
  houses JSONB DEFAULT '{}'::jsonb,
  
  -- Analyses
  dominant_element TEXT, -- Feu/Terre/Air/Eau
  dominant_modality TEXT, -- Cardinal/Fixe/Mutable
  personality_synthesis TEXT, -- Synthèse IA
  relationship_patterns TEXT, -- Patterns relationnels
  strengths TEXT, -- Forces
  challenges TEXT, -- Défis
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_astral_themes_user_id ON astral_themes(user_id);

-- RLS Policies
ALTER TABLE astral_themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own astral theme" ON astral_themes;
CREATE POLICY "Users can view own astral theme"
ON astral_themes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own astral theme" ON astral_themes;
CREATE POLICY "Users can insert own astral theme"
ON astral_themes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own astral theme" ON astral_themes;
CREATE POLICY "Users can update own astral theme"
ON astral_themes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON astral_themes TO authenticated;

-- ┌─────────────────────────────────────────────────────────────────────┐
-- │ 4. TABLE: insights_history                                          │
-- │    Journal des insights et découvertes                              │
-- └─────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS insights_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Type d'insight
  type TEXT NOT NULL, -- 'quiz', 'compatibility', 'horoscope', 'profile_tip', 'astral'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Contexte
  tier TEXT DEFAULT 'free',
  source_id UUID, -- ID du quiz ou autre
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Index
CREATE INDEX IF NOT EXISTS idx_insights_history_user_id ON insights_history(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_history_type ON insights_history(type);
CREATE INDEX IF NOT EXISTS idx_insights_history_created_at ON insights_history(created_at);

-- RLS Policies
ALTER TABLE insights_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own insights" ON insights_history;
CREATE POLICY "Users can view own insights"
ON insights_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own insights" ON insights_history;
CREATE POLICY "Users can insert own insights"
ON insights_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own insights" ON insights_history;
CREATE POLICY "Users can update own insights"
ON insights_history FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own insights" ON insights_history;
CREATE POLICY "Users can delete own insights"
ON insights_history FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON insights_history TO authenticated;

-- ┌─────────────────────────────────────────────────────────────────────┐
-- │ 5. FONCTIONS UTILITAIRES                                            │
-- └─────────────────────────────────────────────────────────────────────┘

-- Fonction pour reset daily_usage quotidien
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-reset avant UPDATE
DROP TRIGGER IF EXISTS trigger_reset_daily_usage ON daily_usage;
CREATE TRIGGER trigger_reset_daily_usage
  BEFORE UPDATE ON daily_usage
  FOR EACH ROW
  EXECUTE FUNCTION reset_daily_usage_if_needed();

-- Fonction pour initialiser daily_usage pour nouveaux users
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
DROP TRIGGER IF EXISTS trigger_initialize_daily_usage ON profiles;
CREATE TRIGGER trigger_initialize_daily_usage
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_daily_usage();

-- Fonction pour reset manuel de tous les utilisateurs (CRON job)
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
    last_reset = CURRENT_DATE
  WHERE last_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour update updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour astral_themes
DROP TRIGGER IF EXISTS update_astral_themes_updated_at ON astral_themes;
CREATE TRIGGER update_astral_themes_updated_at
  BEFORE UPDATE ON astral_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ┌─────────────────────────────────────────────────────────────────────┐
-- │ 6. COMMENTAIRES POUR DOCUMENTATION                                  │
-- └─────────────────────────────────────────────────────────────────────┘

COMMENT ON TABLE daily_usage IS 'Tracking des actions quotidiennes limitées par plan';
COMMENT ON COLUMN daily_usage.cosmic_signals IS 'Nombre de signaux cosmiques envoyés aujourd''hui';
COMMENT ON COLUMN daily_usage.super_nova IS 'Nombre de Super Nova utilisés aujourd''hui';
COMMENT ON COLUMN daily_usage.astra_messages IS 'Nombre de messages Astra envoyés aujourd''hui';
COMMENT ON COLUMN daily_usage.match_messages IS 'Nombre de messages matchs envoyés aujourd''hui';
COMMENT ON COLUMN daily_usage.super_likes IS 'Nombre de super likes envoyés aujourd''hui';
COMMENT ON COLUMN daily_usage.last_reset IS 'Date du dernier reset (permet le reset automatique)';

COMMENT ON TABLE quiz_results IS 'Historique des questionnaires complétés avec analyses IA';
COMMENT ON COLUMN quiz_results.tier_at_completion IS 'Plan de l''utilisateur au moment de compléter le quiz';
COMMENT ON COLUMN quiz_results.insight_level IS '1=Free, 2=Premium, 3=Elite';

COMMENT ON TABLE astral_themes IS 'Thème astral complet (Elite uniquement)';
COMMENT ON COLUMN astral_themes.sun_sign IS 'Signe solaire (personnalité consciente)';
COMMENT ON COLUMN astral_themes.moon_sign IS 'Signe lunaire (émotions, besoins)';
COMMENT ON COLUMN astral_themes.rising_sign IS 'Ascendant (masque social, première impression)';

COMMENT ON TABLE insights_history IS 'Journal des insights et découvertes cosmiques';

-- ┌─────────────────────────────────────────────────────────────────────┐
-- │ 7. VÉRIFICATION FINALE                                              │
-- └─────────────────────────────────────────────────────────────────────┘

-- Vérifier que toutes les tables existent
DO $$
BEGIN
  -- Vérifier daily_usage
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_usage') THEN
    RAISE EXCEPTION 'Table daily_usage non créée';
  END IF;
  
  -- Vérifier quiz_results
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quiz_results') THEN
    RAISE EXCEPTION 'Table quiz_results non créée';
  END IF;
  
  -- Vérifier astral_themes
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'astral_themes') THEN
    RAISE EXCEPTION 'Table astral_themes non créée';
  END IF;
  
  -- Vérifier insights_history
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'insights_history') THEN
    RAISE EXCEPTION 'Table insights_history non créée';
  END IF;
  
  RAISE NOTICE '✅ Toutes les tables sont créées avec succès !';
END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- FIN DES MIGRATIONS
-- ═══════════════════════════════════════════════════════════════════════
