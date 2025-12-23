/*
  # Système d'expiration des messages Astra (24h pour gratuit)

  ## Modifications
  
  1. Messages
    - Ajoute colonne `expires_at` à `astra_messages`
    - Index pour optimiser les requêtes de nettoyage
  
  2. Conversations
    - La colonne `expires_at` existe déjà dans `astra_conversations`
    - Ajoute trigger pour définir automatiquement l'expiration
  
  3. Fonctions
    - `set_astra_expiration()` : Définit l'expiration selon le tier
    - Trigger automatique sur INSERT dans astra_conversations
  
  ## Logique d'expiration
  - **Gratuit (free)** : Messages et conversations expirent après 24h
  - **Premium/Elite** : Jamais d'expiration (expires_at = NULL)
*/

-- 1. Ajouter expires_at à astra_messages
ALTER TABLE astra_messages 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Index pour optimiser le nettoyage
CREATE INDEX IF NOT EXISTS idx_astra_messages_expires 
ON astra_messages(expires_at) 
WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_astra_conversations_expires 
ON astra_conversations(expires_at) 
WHERE expires_at IS NOT NULL;

-- 3. Fonction pour définir l'expiration automatiquement
CREATE OR REPLACE FUNCTION set_astra_expiration()
RETURNS TRIGGER AS $$
DECLARE
  user_tier TEXT;
BEGIN
  -- Récupérer le tier de l'utilisateur
  SELECT premium_tier INTO user_tier
  FROM astra_profiles
  WHERE id = NEW.user_id;

  -- Si gratuit, expiration dans 24h, sinon jamais
  IF user_tier IS NULL OR user_tier = 'free' THEN
    NEW.expires_at := NOW() + INTERVAL '24 hours';
  ELSE
    NEW.expires_at := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger sur astra_conversations
DROP TRIGGER IF EXISTS trigger_set_astra_conversation_expiration ON astra_conversations;
CREATE TRIGGER trigger_set_astra_conversation_expiration
  BEFORE INSERT ON astra_conversations
  FOR EACH ROW
  EXECUTE FUNCTION set_astra_expiration();

-- 5. Fonction pour définir l'expiration des messages
CREATE OR REPLACE FUNCTION set_astra_message_expiration()
RETURNS TRIGGER AS $$
DECLARE
  conversation_expires TIMESTAMPTZ;
BEGIN
  -- Récupérer l'expiration de la conversation parente
  SELECT expires_at INTO conversation_expires
  FROM astra_conversations
  WHERE id = NEW.conversation_id;

  -- Copier l'expiration de la conversation
  NEW.expires_at := conversation_expires;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger sur astra_messages
DROP TRIGGER IF EXISTS trigger_set_astra_message_expiration ON astra_messages;
CREATE TRIGGER trigger_set_astra_message_expiration
  BEFORE INSERT ON astra_messages
  FOR EACH ROW
  EXECUTE FUNCTION set_astra_message_expiration();

-- 7. Fonction de nettoyage des messages expirés
CREATE OR REPLACE FUNCTION clean_expired_astra_data()
RETURNS TABLE(deleted_messages BIGINT, deleted_conversations BIGINT) AS $$
DECLARE
  msg_count BIGINT;
  conv_count BIGINT;
BEGIN
  -- Supprimer les messages expirés
  DELETE FROM astra_messages
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
  
  GET DIAGNOSTICS msg_count = ROW_COUNT;

  -- Supprimer les conversations expirées
  DELETE FROM astra_conversations
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
  
  GET DIAGNOSTICS conv_count = ROW_COUNT;

  RETURN QUERY SELECT msg_count, conv_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Mettre à jour les conversations existantes
UPDATE astra_conversations
SET expires_at = CASE 
  WHEN (SELECT premium_tier FROM astra_profiles WHERE id = astra_conversations.user_id) IN ('premium', 'elite') 
    THEN NULL
  ELSE created_at + INTERVAL '24 hours'
END
WHERE expires_at IS NULL;

COMMENT ON FUNCTION set_astra_expiration() IS 'Définit automatiquement l''expiration des conversations Astra selon le tier utilisateur';
COMMENT ON FUNCTION set_astra_message_expiration() IS 'Copie l''expiration de la conversation parente vers les messages';
COMMENT ON FUNCTION clean_expired_astra_data() IS 'Nettoie les conversations et messages Astra expirés (à appeler via cron)';
