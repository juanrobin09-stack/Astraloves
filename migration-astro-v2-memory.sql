-- ═══════════════════════════════════════════════════════════════════════
-- ASTRO V2 - MIGRATION SQL MÉMOIRE ASTRALE (PHASE 2 PREMIUM)
-- ═══════════════════════════════════════════════════════════════════════

-- Table mémoire astrale
CREATE TABLE IF NOT EXISTS astral_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  transit TEXT NOT NULL,
  pattern TEXT NOT NULL,
  advice TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_astral_memory_user_id ON astral_memory(user_id);
CREATE INDEX idx_astral_memory_date ON astral_memory(date);
CREATE INDEX idx_astral_memory_created_at ON astral_memory(created_at);

-- Enable RLS
ALTER TABLE astral_memory ENABLE ROW LEVEL SECURITY;

-- Policies RLS
CREATE POLICY "Users can view their own memories"
  ON astral_memory
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memories"
  ON astral_memory
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
  ON astral_memory
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON astral_memory
  FOR DELETE
  USING (auth.uid() = user_id);

-- Commentaires
COMMENT ON TABLE astral_memory IS 'Mémoire astrale: ASTRA se souvient de comment les transits affectent chaque utilisateur';
COMMENT ON COLUMN astral_memory.date IS 'Date du transit observé';
COMMENT ON COLUMN astral_memory.transit IS 'Nom du transit (ex: "Mercure rétrograde", "Pleine Lune en Cancer")';
COMMENT ON COLUMN astral_memory.pattern IS 'Pattern détecté par ASTRA';
COMMENT ON COLUMN astral_memory.advice IS 'Conseil pour prochaine occurrence du transit';
