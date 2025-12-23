/*
  # Ajout du mode incognito

  1. Modifications
    - Ajouter la colonne `incognito_mode` pour le mode navigation privée
    - Mode disponible uniquement pour les utilisateurs premium

  2. Notes
    - En mode incognito, l'utilisateur n'apparaît pas dans la découverte
    - Seuls les matchs existants peuvent voir le profil
    - Fonctionnalité premium exclusive
*/

-- Ajouter la colonne incognito_mode si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'incognito_mode'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN incognito_mode boolean DEFAULT false;
  END IF;
END $$;

-- Index pour optimiser les requêtes de profils visibles
CREATE INDEX IF NOT EXISTS idx_astra_profiles_incognito ON astra_profiles(incognito_mode) WHERE incognito_mode = false;

-- Commentaire
COMMENT ON COLUMN astra_profiles.incognito_mode IS 'Mode navigation privée (premium uniquement)';
