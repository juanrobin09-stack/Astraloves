/*
  # Astra Memory System - L'IA qui se souvient de TOUT

  1. Nouvelle Table
    - `astra_memory`
      - `user_id` (uuid, primary key, foreign key vers auth.users)
      - `memory_data` (jsonb) - Toute la mémoire utilisateur
        Structure complète :
        {
          "profile": {
            "first_name": "Camille",
            "pseudo": "cam92",
            "preferences": {...}
          },
          "questionnaires": {
            "attachment": { "completed": true, "date": "...", "results": {...} },
            "archetype": { "completed": true, "date": "...", "results": {...} },
            "needs": { "completed": false },
            "astral": { "completed": true, "date": "...", "results": {...} }
          },
          "compatibilities_viewed": [
            { "user_id": "xxx", "pseudo": "Lucas", "score": 92, "date": "...", "feelings": "intéressée" }
          ],
          "messages_exchanged": [
            { "with_user": "xxx", "pseudo": "Théo", "last_message": "...", "conversation_status": "active" }
          ],
          "discoveries": [
            { "user_id": "xxx", "viewed_date": "...", "interested": true }
          ],
          "preferences_expressed": {
            "dislikes": ["mecs trop collants", "infidélité"],
            "likes": ["indépendance", "communication"],
            "dealbreakers": ["mensonge"]
          },
          "emotional_state": {
            "fears": ["abandon", "trahison"],
            "dreams": ["relation stable", "famille"],
            "current_mood": "optimiste",
            "relationship_goals": "sérieux"
          },
          "astra_interactions": {
            "total_messages": 47,
            "favorite_topics": ["compatibilité", "conseils"],
            "last_greeting": "2024-01-15T10:30:00Z",
            "personalization_level": "high"
          },
          "insights": [
            "Peur de l'abandon depuis ex en 2023",
            "Cherche quelqu'un de rassurant et stable",
            "Attirée par les profils sécurisés"
          ],
          "action_history": [
            { "action": "completed_questionnaire", "type": "astral", "date": "..." },
            { "action": "viewed_compatibility", "with": "Lucas", "date": "..." },
            { "action": "sent_message", "to": "Sarah", "date": "..." }
          ]
        }
      - `last_updated` (timestamptz) - Dernière mise à jour
      - `insights_generated` (text[]) - Insights générés par Astra
      - `next_suggestions` (jsonb) - Prochaines suggestions d'Astra
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `astra_memory` table
    - Users can only read/write their own memory
    - Astra edge function has service role access

  3. Indexes
    - Index on user_id pour performance
    - Index GIN sur memory_data pour recherche JSON

  4. Important Notes
    - Cette table est le CŒUR d'Astra
    - Mise à jour en temps réel à chaque action
    - Permet personnalisation totale et continue
    - Astra devient vraiment intelligente et mémorisante
*/

-- Créer la table astra_memory
CREATE TABLE IF NOT EXISTS astra_memory (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_data jsonb NOT NULL DEFAULT '{
    "profile": {},
    "questionnaires": {},
    "compatibilities_viewed": [],
    "messages_exchanged": [],
    "discoveries": [],
    "preferences_expressed": {
      "dislikes": [],
      "likes": [],
      "dealbreakers": []
    },
    "emotional_state": {
      "fears": [],
      "dreams": [],
      "current_mood": "neutral",
      "relationship_goals": ""
    },
    "astra_interactions": {
      "total_messages": 0,
      "favorite_topics": [],
      "last_greeting": null,
      "personalization_level": "low"
    },
    "insights": [],
    "action_history": []
  }'::jsonb,
  last_updated timestamptz DEFAULT now(),
  insights_generated text[] DEFAULT '{}',
  next_suggestions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE astra_memory ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own memory
CREATE POLICY "Users can read own memory"
  ON astra_memory
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own memory
CREATE POLICY "Users can insert own memory"
  ON astra_memory
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own memory
CREATE POLICY "Users can update own memory"
  ON astra_memory
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_astra_memory_user_id ON astra_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_astra_memory_data ON astra_memory USING gin(memory_data);
CREATE INDEX IF NOT EXISTS idx_astra_memory_last_updated ON astra_memory(last_updated DESC);

-- Function to auto-update last_updated timestamp
CREATE OR REPLACE FUNCTION update_astra_memory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on memory changes
DROP TRIGGER IF EXISTS trigger_update_astra_memory_timestamp ON astra_memory;
CREATE TRIGGER trigger_update_astra_memory_timestamp
  BEFORE UPDATE ON astra_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_astra_memory_timestamp();

-- Function to initialize memory for new users
CREATE OR REPLACE FUNCTION initialize_astra_memory()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO astra_memory (user_id, memory_data)
  VALUES (
    NEW.id,
    jsonb_build_object(
      'profile', jsonb_build_object(
        'first_name', COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        'created_at', now()
      ),
      'questionnaires', '{}'::jsonb,
      'compatibilities_viewed', '[]'::jsonb,
      'messages_exchanged', '[]'::jsonb,
      'discoveries', '[]'::jsonb,
      'preferences_expressed', jsonb_build_object(
        'dislikes', '[]'::jsonb,
        'likes', '[]'::jsonb,
        'dealbreakers', '[]'::jsonb
      ),
      'emotional_state', jsonb_build_object(
        'fears', '[]'::jsonb,
        'dreams', '[]'::jsonb,
        'current_mood', 'neutral',
        'relationship_goals', ''
      ),
      'astra_interactions', jsonb_build_object(
        'total_messages', 0,
        'favorite_topics', '[]'::jsonb,
        'last_greeting', null,
        'personalization_level', 'low'
      ),
      'insights', '[]'::jsonb,
      'action_history', '[]'::jsonb
    )
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create memory for new users
DROP TRIGGER IF EXISTS trigger_initialize_astra_memory ON auth.users;
CREATE TRIGGER trigger_initialize_astra_memory
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_astra_memory();