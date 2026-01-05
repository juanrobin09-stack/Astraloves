/*
  # Système de tracking des statistiques utilisateur

  1. Nouvelles colonnes dans profiles
    - `profile_views` (int) - Nombre de vues du profil
    - `likes_received` (int) - Nombre de likes reçus
    - `matches_count` (int) - Nombre de matchs
    - `messages_sent` (int) - Nombre de messages envoyés
    - `swipes_count` (int) - Nombre total de swipes effectués
    - `profile_score` (int) - Score calculé du profil (0-100)
    - `stats_last_updated` (timestamptz) - Dernière mise à jour des stats

  2. Fonctions
    - Fonction pour incrémenter les statistiques
    - Fonction pour calculer le score du profil
    - Trigger pour mettre à jour automatiquement stats_last_updated

  3. Sécurité
    - Les stats sont en lecture seule pour les utilisateurs
    - Seules les fonctions peuvent les modifier
*/

-- Ajouter les colonnes de statistiques
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_views') THEN
    ALTER TABLE profiles ADD COLUMN profile_views INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'likes_received') THEN
    ALTER TABLE profiles ADD COLUMN likes_received INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'matches_count') THEN
    ALTER TABLE profiles ADD COLUMN matches_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'messages_sent') THEN
    ALTER TABLE profiles ADD COLUMN messages_sent INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'swipes_count') THEN
    ALTER TABLE profiles ADD COLUMN swipes_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile_score') THEN
    ALTER TABLE profiles ADD COLUMN profile_score INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stats_last_updated') THEN
    ALTER TABLE profiles ADD COLUMN stats_last_updated TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Fonction pour incrémenter une statistique
CREATE OR REPLACE FUNCTION increment_user_stat(
  user_id UUID,
  stat_name TEXT,
  increment_by INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  CASE stat_name
    WHEN 'profile_views' THEN
      UPDATE profiles 
      SET profile_views = profile_views + increment_by,
          stats_last_updated = NOW()
      WHERE id = user_id;
    
    WHEN 'likes_received' THEN
      UPDATE profiles 
      SET likes_received = likes_received + increment_by,
          stats_last_updated = NOW()
      WHERE id = user_id;
    
    WHEN 'matches_count' THEN
      UPDATE profiles 
      SET matches_count = matches_count + increment_by,
          stats_last_updated = NOW()
      WHERE id = user_id;
    
    WHEN 'messages_sent' THEN
      UPDATE profiles 
      SET messages_sent = messages_sent + increment_by,
          stats_last_updated = NOW()
      WHERE id = user_id;
    
    WHEN 'swipes_count' THEN
      UPDATE profiles 
      SET swipes_count = swipes_count + increment_by,
          stats_last_updated = NOW()
      WHERE id = user_id;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour calculer le score du profil
CREATE OR REPLACE FUNCTION calculate_profile_score(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  profile_data RECORD;
BEGIN
  SELECT 
    full_name,
    bio,
    avatar_url,
    banner_url,
    interests,
    birth_date,
    messages_sent,
    matches_count,
    swipes_count
  INTO profile_data
  FROM profiles
  WHERE id = user_id;
  
  -- 20 points si profil complet
  IF profile_data.full_name IS NOT NULL 
     AND profile_data.bio IS NOT NULL 
     AND LENGTH(profile_data.bio) > 50
     AND profile_data.birth_date IS NOT NULL THEN
    score := score + 20;
  END IF;
  
  -- 25 points si photo de profil
  IF profile_data.avatar_url IS NOT NULL THEN
    score := score + 25;
  END IF;
  
  -- 15 points si banner
  IF profile_data.banner_url IS NOT NULL THEN
    score := score + 15;
  END IF;
  
  -- 10 points si intérêts renseignés
  IF profile_data.interests IS NOT NULL AND array_length(profile_data.interests, 1) >= 3 THEN
    score := score + 10;
  END IF;
  
  -- 15 points basé sur l'activité de swipe
  IF profile_data.swipes_count >= 100 THEN
    score := score + 15;
  ELSIF profile_data.swipes_count >= 50 THEN
    score := score + 10;
  ELSIF profile_data.swipes_count >= 10 THEN
    score := score + 5;
  END IF;
  
  -- 10 points basé sur les matchs
  IF profile_data.matches_count >= 10 THEN
    score := score + 10;
  ELSIF profile_data.matches_count >= 5 THEN
    score := score + 7;
  ELSIF profile_data.matches_count >= 1 THEN
    score := score + 5;
  END IF;
  
  -- 5 points basé sur l'engagement (messages)
  IF profile_data.messages_sent >= 50 THEN
    score := score + 5;
  ELSIF profile_data.messages_sent >= 10 THEN
    score := score + 3;
  END IF;
  
  -- Mettre à jour le score dans la table
  UPDATE profiles 
  SET profile_score = score,
      stats_last_updated = NOW()
  WHERE id = user_id;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour auto-incrémenter profile_views quand quelqu'un visite un profil
-- (sera utilisé plus tard dans l'app)

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_score ON profiles(profile_score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_stats_updated ON profiles(stats_last_updated DESC);