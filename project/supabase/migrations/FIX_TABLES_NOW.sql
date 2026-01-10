-- ═══════════════════════════════════════════════════════════════════════
-- ASTRA - FIX TABLES MANQUANTES - EXÉCUTE ÇA MAINTENANT
-- ═══════════════════════════════════════════════════════════════════════

-- 1. DAILY_USAGE (compteurs journaliers)
DROP TABLE IF EXISTS daily_usage CASCADE;

CREATE TABLE daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cosmic_signals INTEGER DEFAULT 0,
  super_nova INTEGER DEFAULT 0,
  astra_messages INTEGER DEFAULT 0,
  match_messages INTEGER DEFAULT 0,
  super_likes INTEGER DEFAULT 0,
  last_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily usage" ON daily_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily usage" ON daily_usage FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily usage" ON daily_usage FOR UPDATE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON daily_usage TO authenticated;

-- 2. QUIZ_RESULTS (résultats questionnaires)
DROP TABLE IF EXISTS quiz_results CASCADE;

CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  quiz_name TEXT,
  result_title TEXT,
  result_subtitle TEXT,
  percentage INTEGER,
  result_data JSONB DEFAULT '{}'::jsonb,
  answers JSONB DEFAULT '{}'::jsonb,
  score JSONB DEFAULT '{}'::jsonb,
  archetype TEXT,
  summary TEXT,
  ai_analysis TEXT,
  ai_analysis_advanced TEXT,
  ai_analysis_elite TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tier_at_completion TEXT DEFAULT 'free',
  insight_level INTEGER DEFAULT 1,
  unlocked_features JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz results" ON quiz_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz results" ON quiz_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quiz results" ON quiz_results FOR UPDATE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON quiz_results TO authenticated;

-- 3. ASTRAL_THEMES (thème astral Elite)
DROP TABLE IF EXISTS astral_themes CASCADE;

CREATE TABLE astral_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_location TEXT,
  sun_sign TEXT NOT NULL,
  moon_sign TEXT,
  rising_sign TEXT,
  mercury_sign TEXT,
  venus_sign TEXT,
  mars_sign TEXT,
  jupiter_sign TEXT,
  saturn_sign TEXT,
  uranus_sign TEXT,
  neptune_sign TEXT,
  pluto_sign TEXT,
  houses JSONB DEFAULT '{}'::jsonb,
  dominant_element TEXT,
  dominant_modality TEXT,
  personality_synthesis TEXT,
  relationship_patterns TEXT,
  strengths TEXT,
  challenges TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE astral_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own astral theme" ON astral_themes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own astral theme" ON astral_themes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own astral theme" ON astral_themes FOR UPDATE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON astral_themes TO authenticated;

-- 4. INSIGHTS_HISTORY (journal d'insights)
DROP TABLE IF EXISTS insights_history CASCADE;

CREATE TABLE insights_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tier TEXT DEFAULT 'free',
  source_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

ALTER TABLE insights_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights" ON insights_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON insights_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON insights_history FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own insights" ON insights_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON insights_history TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════
-- VÉRIFICATION
-- ═══════════════════════════════════════════════════════════════════════

SELECT 
  CASE 
    WHEN COUNT(*) = 4 THEN '✅ TOUTES LES TABLES CRÉÉES !'
    ELSE '❌ ERREUR: ' || (4 - COUNT(*))::TEXT || ' table(s) manquante(s)'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('daily_usage', 'quiz_results', 'astral_themes', 'insights_history');
