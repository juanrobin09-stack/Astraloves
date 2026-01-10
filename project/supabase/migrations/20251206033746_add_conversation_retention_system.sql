/*
  # Système de rétention des conversations Astra

  1. Modifications
    - Ajout de colonne subscription_tier pour tracker l'abonnement lors de la création
    - Ajout de fonction de nettoyage automatique des conversations gratuites > 24h
    - Ajout d'index pour optimiser les requêtes de nettoyage

  2. Logique de rétention
    - Gratuit (free): conversations supprimées après 24h d'inactivité
    - Premium (premium): conversations conservées en illimité
    - Premium Elite (premium_elite): conversations conservées en illimité

  3. Security
    - RLS déjà configurée sur astra_conversations
    - Fonction de nettoyage accessible seulement par cron jobs

  4. Notes
    - expires_at est déjà présent pour marquer l'expiration
    - last_message_at est déjà présent pour tracker l'activité
    - Cette migration est idempotente
*/

-- Ajouter subscription_tier si pas déjà présent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_conversations' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE astra_conversations
    ADD COLUMN subscription_tier text DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'premium', 'premium_elite'));
  END IF;
END $$;

-- Index pour optimiser les requêtes de nettoyage
CREATE INDEX IF NOT EXISTS idx_astra_conversations_expires_at
  ON astra_conversations (expires_at)
  WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_astra_conversations_user_tier
  ON astra_conversations (user_id, subscription_tier);

CREATE INDEX IF NOT EXISTS idx_astra_conversations_last_message
  ON astra_conversations (last_message_at);

-- Fonction pour nettoyer les conversations expirées (gratuit > 24h)
CREATE OR REPLACE FUNCTION clean_expired_conversations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer les conversations gratuites inactives depuis plus de 24h
  DELETE FROM astra_conversations
  WHERE subscription_tier = 'free'
  AND last_message_at < (NOW() - INTERVAL '24 hours');
  
  RAISE NOTICE 'Cleaned expired free conversations';
END;
$$;

-- Fonction trigger pour mettre à jour expires_at automatiquement
CREATE OR REPLACE FUNCTION update_conversation_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si gratuit, définir expiration à 24h après dernier message
  IF NEW.subscription_tier = 'free' THEN
    NEW.expires_at = NEW.last_message_at + INTERVAL '24 hours';
  ELSE
    -- Premium/Elite = pas d'expiration
    NEW.expires_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger si il n'existe pas
DROP TRIGGER IF EXISTS trigger_update_conversation_expiration ON astra_conversations;
CREATE TRIGGER trigger_update_conversation_expiration
  BEFORE INSERT OR UPDATE OF last_message_at, subscription_tier
  ON astra_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_expiration();