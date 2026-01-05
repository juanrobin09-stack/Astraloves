/*
  # Système de parrainage

  1. Nouvelles Tables
    - `referrals` - Gestion des parrainages
    - `referral_rewards` - Récompenses obtenues

  2. Sécurité
    - Enable RLS sur les deux tables
    - Policies pour lecture et mise à jour

  3. Notes
    - Le parrain reçoit des récompenses quand le filleul s'inscrit et devient premium
    - Le filleul reçoit également des bonus à l'inscription
*/

-- Table des parrainages
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text UNIQUE NOT NULL,
  email text,
  status text DEFAULT 'pending',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can insert own referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "System can update referrals"
  ON referrals FOR UPDATE
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id)
  WITH CHECK (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Table des récompenses de parrainage
CREATE TABLE IF NOT EXISTS referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_id uuid REFERENCES referrals(id) ON DELETE CASCADE NOT NULL,
  reward_type text NOT NULL,
  reward_value integer NOT NULL,
  claimed boolean DEFAULT false,
  claimed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards"
  ON referral_rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own rewards"
  ON referral_rewards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ajouter colonne code parrainage aux profils
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN referral_code text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'referred_by'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN referred_by uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'referral_count'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN referral_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'referral_points'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN referral_points integer DEFAULT 0;
  END IF;
END $$;

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user ON referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_astra_profiles_referral_code ON astra_profiles(referral_code);

-- Fonction pour générer un code de parrainage unique
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  characters text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(characters, floor(random() * length(characters) + 1)::integer, 1);
  END LOOP;
  
  WHILE EXISTS (SELECT 1 FROM astra_profiles WHERE referral_code = code) OR
        EXISTS (SELECT 1 FROM referrals WHERE referral_code = code) LOOP
    code := '';
    FOR i IN 1..8 LOOP
      code := code || substr(characters, floor(random() * length(characters) + 1)::integer, 1);
    END LOOP;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer un code de parrainage à la création du profil
CREATE OR REPLACE FUNCTION create_referral_code_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_create_referral_code
  BEFORE INSERT ON astra_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_referral_code_on_signup();

-- Fonction pour traiter un parrainage complété
CREATE OR REPLACE FUNCTION process_referral_completion(
  p_referral_id uuid
)
RETURNS void AS $$
DECLARE
  v_referrer_id uuid;
  v_referred_id uuid;
BEGIN
  SELECT referrer_id, referred_id INTO v_referrer_id, v_referred_id
  FROM referrals WHERE id = p_referral_id;
  
  UPDATE referrals
  SET status = 'completed', completed_at = now()
  WHERE id = p_referral_id;
  
  INSERT INTO referral_rewards (user_id, referral_id, reward_type, reward_value)
  VALUES (v_referrer_id, p_referral_id, 'super_likes', 5);
  
  INSERT INTO referral_rewards (user_id, referral_id, reward_type, reward_value)
  VALUES (v_referred_id, p_referral_id, 'super_likes', 3);
  
  UPDATE astra_profiles
  SET referral_count = referral_count + 1,
      referral_points = referral_points + 100
  WHERE id = v_referrer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires
COMMENT ON TABLE referrals IS 'Système de parrainage entre utilisateurs';
COMMENT ON TABLE referral_rewards IS 'Récompenses obtenues via le parrainage';
COMMENT ON COLUMN astra_profiles.referral_code IS 'Code de parrainage unique de l''utilisateur';
COMMENT ON COLUMN astra_profiles.referred_by IS 'ID de l''utilisateur qui a parrainé';
COMMENT ON COLUMN astra_profiles.referral_count IS 'Nombre de parrainages réussis';
COMMENT ON COLUMN astra_profiles.referral_points IS 'Points de parrainage accumulés';
