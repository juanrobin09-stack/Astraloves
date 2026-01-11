-- ═══════════════════════════════════════════════════════════════════════
-- ASTRO V2 - MIGRATION SQL CHALLENGES COSMIQUES
-- ═══════════════════════════════════════════════════════════════════════

-- Table challenges cosmiques
CREATE TABLE IF NOT EXISTS astro_challenges (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 50,
  category TEXT NOT NULL CHECK (category IN ('communication', 'boundaries', 'introspection', 'action')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Index pour queries rapides
  CONSTRAINT astro_challenges_user_date UNIQUE (user_id, created_at::date)
);

-- Indexes
CREATE INDEX idx_astro_challenges_user_id ON astro_challenges(user_id);
CREATE INDEX idx_astro_challenges_created_at ON astro_challenges(created_at);
CREATE INDEX idx_astro_challenges_completed_at ON astro_challenges(completed_at);

-- Enable RLS
ALTER TABLE astro_challenges ENABLE ROW LEVEL SECURITY;

-- Policies RLS
CREATE POLICY "Users can view their own challenges"
  ON astro_challenges
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges"
  ON astro_challenges
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
  ON astro_challenges
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Commentaires
COMMENT ON TABLE astro_challenges IS 'Challenges cosmiques quotidiens générés pour chaque utilisateur';
COMMENT ON COLUMN astro_challenges.xp IS 'Points XP gagnés à la complétion (toujours 50 pour MVP)';
COMMENT ON COLUMN astro_challenges.category IS 'Catégorie du challenge: communication, boundaries, introspection, action';
COMMENT ON COLUMN astro_challenges.completed_at IS 'Timestamp de complétion, NULL si pas encore accompli';
