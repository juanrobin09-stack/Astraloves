/*
  # Ajout de la colonne premium_tier

  1. Modifications
    - Ajoute la colonne `premium_tier` à la table `astra_profiles`
    - Type: text avec valeurs possibles: 'free', 'premium', 'premium_elite'
    - Valeur par défaut: NULL (calculé automatiquement basé sur is_premium)

  2. Logique
    - Si is_premium = false → tier = 'free'
    - Si is_premium = true et premium_tier = NULL → tier = 'premium'
    - Si is_premium = true et premium_tier = 'premium_elite' → tier = 'premium_elite'

  3. Notes
    - Permet de différencier Premium standard et Premium+ Elite
    - Rétrocompatible: les profils existants auront NULL et seront traités comme 'premium' s'ils sont premium
*/

-- Ajouter la colonne premium_tier
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'premium_tier'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN premium_tier TEXT;
    
    -- Ajouter un commentaire pour documenter les valeurs possibles
    COMMENT ON COLUMN astra_profiles.premium_tier IS 'Type d''abonnement premium: free, premium, premium_elite';
    
    -- Créer un index pour optimiser les requêtes
    CREATE INDEX IF NOT EXISTS idx_astra_profiles_premium_tier ON astra_profiles(premium_tier);
  END IF;
END $$;
