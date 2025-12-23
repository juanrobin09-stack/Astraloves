/*
  # Cleanup Matching Infrastructure

  1. Tables to Drop
    - `compatibility_matches` - Premium matching compatibility scores
    - `premium_matches` - Premium user matches
    - `astra_suggestions` - Astra match suggestions
    - `conversations` - User-to-user conversations
    - `messages` - Messages between users

  2. Notes
    - This removes all matchmaking/pairing functionality
    - Astra chat (astra_conversations, astra_messages) is preserved
    - User profiles and auth remain intact
*/

-- Drop tables with CASCADE to handle foreign key dependencies
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS astra_suggestions CASCADE;
DROP TABLE IF EXISTS premium_matches CASCADE;
DROP TABLE IF EXISTS compatibility_matches CASCADE;