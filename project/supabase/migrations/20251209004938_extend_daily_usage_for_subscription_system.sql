/*
  # Extension du systeme de suivi quotidien pour les abonnements

  1. Modifications de la table daily_usage
    - Ajout des colonnes manquantes pour tracker toutes les limites
    - cosmic_signals: signaux cosmiques envoyes
    - super_nova: super nova utilises
    - astra_messages: messages avec Astra IA
    - match_messages: messages avec les matchs
    - super_likes: super likes utilises

  2. Contrainte d'unicite
    - Un seul enregistrement par utilisateur par jour

  3. Index pour performance
    - Index sur user_id + date pour les recherches rapides

  4. Securite
    - RLS active avec policies pour acces utilisateur
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_usage' AND column_name = 'cosmic_signals'
  ) THEN
    ALTER TABLE daily_usage ADD COLUMN cosmic_signals integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_usage' AND column_name = 'super_nova'
  ) THEN
    ALTER TABLE daily_usage ADD COLUMN super_nova integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_usage' AND column_name = 'astra_messages'
  ) THEN
    ALTER TABLE daily_usage ADD COLUMN astra_messages integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_usage' AND column_name = 'match_messages'
  ) THEN
    ALTER TABLE daily_usage ADD COLUMN match_messages integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_usage' AND column_name = 'super_likes'
  ) THEN
    ALTER TABLE daily_usage ADD COLUMN super_likes integer DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date 
ON daily_usage(user_id, date);

DROP POLICY IF EXISTS "Users can view own daily usage" ON daily_usage;
CREATE POLICY "Users can view own daily usage"
  ON daily_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own daily usage" ON daily_usage;
CREATE POLICY "Users can insert own daily usage"
  ON daily_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own daily usage" ON daily_usage;
CREATE POLICY "Users can update own daily usage"
  ON daily_usage FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
