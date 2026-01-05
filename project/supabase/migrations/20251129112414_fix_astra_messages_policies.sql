/*
  # Fix Astra Messages RLS Policies
  
  ## Changes
  
  1. Add missing UPDATE policy for astra_messages table
     - Allows users to update messages in their own conversations
     - Required for Astra chat functionality
  
  ## Security
  
  - Users can only update messages in conversations they own
  - Maintains data integrity and privacy
*/

-- Drop policy if exists (cleanup)
DROP POLICY IF EXISTS "Users can update messages in own conversations" ON astra_messages;

-- Add UPDATE policy for astra_messages
CREATE POLICY "Users can update messages in own conversations"
  ON astra_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM astra_conversations
      WHERE astra_conversations.id = astra_messages.conversation_id
      AND astra_conversations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM astra_conversations
      WHERE astra_conversations.id = astra_messages.conversation_id
      AND astra_conversations.user_id = auth.uid()
    )
  );
