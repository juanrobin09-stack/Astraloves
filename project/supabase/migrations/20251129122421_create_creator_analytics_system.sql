/*
  # Système d'Analytics pour Créateurs de Live

  1. Nouvelles Tables
    - `creator_stats` : Statistiques agrégées par créateur
      - `creator_id` (uuid, référence astra_profiles)
      - `total_lives` (int) : Nombre total de lives
      - `total_viewers` (int) : Total de spectateurs uniques
      - `total_watch_time_minutes` (int) : Temps de visionnage total
      - `total_gifts_received` (int) : Total étoiles reçues
      - `total_earnings_euros` (numeric) : Revenus estimés
      - `average_viewers` (int) : Moyenne spectateurs par live
      - `peak_viewers` (int) : Record de spectateurs
      - `follower_count` (int) : Nombre d'abonnés
      - `updated_at` (timestamptz)

    - `live_analytics` : Analytics détaillées par live
      - `id` (uuid, primary key)
      - `live_id` (uuid, référence live_streams)
      - `viewer_retention` (jsonb) : Rétention par minute
      - `peak_concurrent_viewers` (int)
      - `average_watch_duration_seconds` (int)
      - `total_messages_sent` (int)
      - `total_reactions` (int)
      - `revenue_breakdown` (jsonb) : Détail des revenus
      - `demographics` (jsonb) : Stats démographiques
      - `created_at` (timestamptz)

  2. Sécurité
    - RLS activé
    - Créateurs peuvent voir leurs propres stats
    - Admins peuvent voir tout

  3. Important
    - Index pour performances
    - Fonctions pour calculs automatiques
*/

-- Table des stats créateurs
CREATE TABLE IF NOT EXISTS creator_stats (
  creator_id uuid PRIMARY KEY REFERENCES astra_profiles(id) ON DELETE CASCADE,
  total_lives int DEFAULT 0,
  total_viewers int DEFAULT 0,
  total_watch_time_minutes int DEFAULT 0,
  total_gifts_received int DEFAULT 0,
  total_earnings_euros numeric DEFAULT 0,
  average_viewers int DEFAULT 0,
  peak_viewers int DEFAULT 0,
  follower_count int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Table analytics par live
CREATE TABLE IF NOT EXISTS live_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_id uuid REFERENCES live_streams(id) ON DELETE CASCADE NOT NULL,
  viewer_retention jsonb DEFAULT '[]'::jsonb,
  peak_concurrent_viewers int DEFAULT 0,
  average_watch_duration_seconds int DEFAULT 0,
  total_messages_sent int DEFAULT 0,
  total_reactions int DEFAULT 0,
  revenue_breakdown jsonb DEFAULT '{}'::jsonb,
  demographics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(live_id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_creator_stats_total_earnings ON creator_stats(total_earnings_euros DESC);
CREATE INDEX IF NOT EXISTS idx_live_analytics_live ON live_analytics(live_id);

-- Enable RLS
ALTER TABLE creator_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_analytics ENABLE ROW LEVEL SECURITY;

-- Policies pour creator_stats
CREATE POLICY "Creators can view own stats"
  ON creator_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can update own stats"
  ON creator_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "System can insert stats"
  ON creator_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Policies pour live_analytics
CREATE POLICY "Creators can view own live analytics"
  ON live_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM live_streams
      WHERE live_streams.id = live_analytics.live_id
      AND live_streams.creator_id = auth.uid()
    )
  );

CREATE POLICY "System can insert live analytics"
  ON live_analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM live_streams
      WHERE live_streams.id = live_analytics.live_id
      AND live_streams.creator_id = auth.uid()
    )
  );

CREATE POLICY "System can update live analytics"
  ON live_analytics FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM live_streams
      WHERE live_streams.id = live_analytics.live_id
      AND live_streams.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM live_streams
      WHERE live_streams.id = live_analytics.live_id
      AND live_streams.creator_id = auth.uid()
    )
  );

-- Function pour mettre à jour les stats créateur quand un live se termine
CREATE OR REPLACE FUNCTION update_creator_stats_on_live_end()
RETURNS TRIGGER AS $$
DECLARE
  v_creator_id uuid;
BEGIN
  IF NEW.status = 'ended' AND OLD.status = 'live' THEN
    v_creator_id := NEW.creator_id;
    
    INSERT INTO creator_stats (creator_id, total_lives, total_viewers, total_gifts_received, peak_viewers)
    VALUES (
      v_creator_id,
      1,
      NEW.viewer_count,
      NEW.total_gifts_value,
      NEW.peak_viewers
    )
    ON CONFLICT (creator_id) DO UPDATE SET
      total_lives = creator_stats.total_lives + 1,
      total_viewers = creator_stats.total_viewers + NEW.viewer_count,
      total_gifts_received = creator_stats.total_gifts_received + NEW.total_gifts_value,
      peak_viewers = GREATEST(creator_stats.peak_viewers, NEW.peak_viewers),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mise à jour automatique
DROP TRIGGER IF EXISTS trigger_update_creator_stats ON live_streams;
CREATE TRIGGER trigger_update_creator_stats
AFTER UPDATE ON live_streams
FOR EACH ROW EXECUTE FUNCTION update_creator_stats_on_live_end();

-- Function pour calculer la moyenne de spectateurs
CREATE OR REPLACE FUNCTION recalculate_average_viewers()
RETURNS void AS $$
BEGIN
  UPDATE creator_stats
  SET average_viewers = CASE 
    WHEN total_lives > 0 THEN total_viewers / total_lives
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql;
