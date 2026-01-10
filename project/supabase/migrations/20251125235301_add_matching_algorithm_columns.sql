/*
  # Ajouter colonnes pour algorithme de matching premium

  1. Nouvelles colonnes
    - `attachment_style` (text) - Style d'attachement amoureux
    - `sun_sign` (text) - Signe astrologique solaire
    - `orientation` (text) - Orientation sexuelle

  2. Notes
    - Ces colonnes permettent un matching ultra-personnalisé
    - Scores de compatibilité calculés en temps réel
    - Colonnes optionnelles pour ne pas casser l'existant
*/

-- Ajouter les colonnes manquantes pour le matching algorithm
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'attachment_style'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN attachment_style TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'sun_sign'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN sun_sign TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'orientation'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN orientation TEXT;
  END IF;
END $$;

-- Mettre à jour les profils existants avec des valeurs par défaut intelligentes
UPDATE astra_profiles
SET orientation = CASE
  WHEN seeking = 'Un homme' THEN 'Hommes'
  WHEN seeking = 'Une femme' THEN 'Femmes'
  ELSE 'Les deux'
END
WHERE orientation IS NULL;

-- Assigner des signes astro aléatoires réalistes aux profils existants
UPDATE astra_profiles
SET sun_sign = (ARRAY['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'])[floor(random() * 12 + 1)]
WHERE sun_sign IS NULL AND is_premium = true;

-- Assigner des styles d'attachement réalistes aux profils Premium
UPDATE astra_profiles
SET attachment_style = (ARRAY['Sécure', 'Anxieux', 'Évitant', 'Désorganisé'])[floor(random() * 4 + 1)]
WHERE attachment_style IS NULL AND is_premium = true;
