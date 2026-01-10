/*
  # Système d'achievements/trophées

  1. Nouvelles Tables
    - `achievements` - Liste de tous les trophées disponibles
    - `user_achievements` - Trophées débloqués par les utilisateurs

  2. Sécurité
    - Enable RLS sur les deux tables
    - Policies pour lecture et mise à jour

  3. Notes
    - Les achievements motivent l'engagement utilisateur
    - Récompenses pour actions (swipes, matchs, messages, etc.)
*/

-- Table des achievements disponibles
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL,
  requirement_type text NOT NULL,
  requirement_count integer NOT NULL,
  points integer DEFAULT 10,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- Table des achievements débloqués par utilisateur
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  progress integer DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON user_achievements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);

-- Insérer les achievements de base
INSERT INTO achievements (code, title, description, icon, category, requirement_type, requirement_count, points, is_premium) VALUES
  ('first_swipe', 'Premier Swipe', 'Fais ton premier swipe', '👆', 'engagement', 'swipes', 1, 10, false),
  ('swiper_10', 'Swiper Novice', 'Fais 10 swipes', '🔥', 'engagement', 'swipes', 10, 20, false),
  ('swiper_50', 'Swiper Expert', 'Fais 50 swipes', '⚡', 'engagement', 'swipes', 50, 50, false),
  ('swiper_100', 'Swiper Master', 'Fais 100 swipes', '🏆', 'engagement', 'swipes', 100, 100, false),
  
  ('first_match', 'Premier Match', 'Obtiens ton premier match', '💕', 'social', 'matches', 1, 20, false),
  ('matcher_5', 'Social Butterfly', 'Obtiens 5 matchs', '🦋', 'social', 'matches', 5, 40, false),
  ('matcher_10', 'Séducteur', 'Obtiens 10 matchs', '😍', 'social', 'matches', 10, 80, false),
  ('matcher_25', 'Coeur Briseur', 'Obtiens 25 matchs', '💘', 'social', 'matches', 25, 150, false),
  
  ('first_message', 'Premier Message', 'Envoie ton premier message', '💬', 'communication', 'messages', 1, 10, false),
  ('messenger_10', 'Bavard', 'Envoie 10 messages', '📱', 'communication', 'messages', 10, 30, false),
  ('messenger_50', 'Communicateur', 'Envoie 50 messages', '💭', 'communication', 'messages', 50, 60, false),
  
  ('super_liker', 'Super Star', 'Envoie ton premier Super Like', '⭐', 'premium', 'super_likes', 1, 30, false),
  ('astro_curious', 'Curieux Astro', 'Consulte 5 horoscopes', '🔮', 'astrology', 'horoscope_views', 5, 25, false),
  ('astro_fan', 'Fan d''Astrologie', 'Consulte 20 horoscopes', '✨', 'astrology', 'horoscope_views', 20, 80, false),
  
  ('profile_complete', 'Profil Parfait', 'Complete ton profil à 100%', '✅', 'profile', 'profile_completion', 100, 50, false),
  ('photo_pro', 'Photo Pro', 'Ajoute une photo de profil', '📸', 'profile', 'photos', 1, 15, false),
  
  ('premium_member', 'Membre Premium', 'Deviens membre Premium', '👑', 'premium', 'premium', 1, 200, true),
  ('booster', 'Booster', 'Active ton premier boost', '⚡', 'premium', 'boosts', 1, 100, true),
  ('incognito_ninja', 'Ninja Incognito', 'Active le mode incognito', '🥷', 'premium', 'incognito', 1, 80, true),
  
  ('week_streak', 'Actif 7 jours', 'Connecte-toi 7 jours consécutifs', '🔥', 'engagement', 'login_streak', 7, 60, false),
  ('month_streak', 'Fidèle', 'Connecte-toi 30 jours consécutifs', '💎', 'engagement', 'login_streak', 30, 250, false)
ON CONFLICT (code) DO NOTHING;

-- Fonction pour vérifier et débloquer achievements
CREATE OR REPLACE FUNCTION check_and_unlock_achievement(
  p_user_id uuid,
  p_requirement_type text,
  p_current_count integer
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_achievements (user_id, achievement_id, progress)
  SELECT 
    p_user_id,
    a.id,
    p_current_count
  FROM achievements a
  WHERE 
    a.requirement_type = p_requirement_type
    AND a.requirement_count <= p_current_count
    AND NOT EXISTS (
      SELECT 1 FROM user_achievements ua
      WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
    )
  ON CONFLICT (user_id, achievement_id) 
  DO UPDATE SET progress = p_current_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires
COMMENT ON TABLE achievements IS 'Liste des trophées/achievements disponibles';
COMMENT ON TABLE user_achievements IS 'Trophées débloqués par les utilisateurs';
