-- ===================================================================
-- ASTRALOVES - SCHEMA DATABASE SUPABASE COMPLET
-- ===================================================================
-- Instructions: Copier/coller dans SQL Editor Supabase
-- Exécuter dans l'ordre (ou tout d'un coup)
-- ===================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "earthdistance" CASCADE;

-- ===================================================================
-- TABLE 1: profiles
-- ===================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  first_name text NOT NULL,
  birth_date date NOT NULL,
  birth_time time NOT NULL,
  birth_place jsonb NOT NULL,
  gender text NOT NULL CHECK (gender IN ('man', 'woman', 'non-binary')),
  looking_for text[] NOT NULL,
  bio text,
  
  -- Current location
  current_city text,
  current_lat float,
  current_lng float,
  search_radius_km int DEFAULT 50,
  
  -- Photos
  photos jsonb DEFAULT '[]'::jsonb,
  avatar_url text,
  
  -- Astro (calculated at signup)
  sun_sign text NOT NULL,
  moon_sign text NOT NULL,
  ascendant_sign text NOT NULL,
  natal_chart_data jsonb NOT NULL,
  
  -- Energies (calculated)
  energy_fire int DEFAULT 0 CHECK (energy_fire >= 0 AND energy_fire <= 100),
  energy_earth int DEFAULT 0 CHECK (energy_earth >= 0 AND energy_earth <= 100),
  energy_air int DEFAULT 0 CHECK (energy_air >= 0 AND energy_air <= 100),
  energy_water int DEFAULT 0 CHECK (energy_water >= 0 AND energy_water <= 100),
  
  -- Meta
  is_profile_complete boolean DEFAULT false,
  onboarding_completed boolean DEFAULT false,
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Moderation
  is_verified boolean DEFAULT false,
  is_banned boolean DEFAULT false,
  ban_reason text
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_sun_sign ON profiles(sun_sign);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING gist(ll_to_earth(current_lat, current_lng))
  WHERE current_lat IS NOT NULL AND current_lng IS NOT NULL;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ===================================================================
-- TABLE 2: subscriptions
-- ===================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  tier text NOT NULL CHECK (tier IN ('free', 'premium', 'elite')),
  
  stripe_customer_id text,
  stripe_subscription_id text,
  
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  cancelled_at timestamptz,
  
  amount_cents int,
  currency text DEFAULT 'eur',
  billing_period text CHECK (billing_period IN ('monthly', 'yearly')),
  
  is_trial boolean DEFAULT false,
  trial_ends_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_subscription ON subscriptions(user_id) 
  WHERE ends_at IS NULL OR ends_at > now();

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ===================================================================
-- TABLE 3: quotas
-- ===================================================================

CREATE TABLE IF NOT EXISTS quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  astra_messages_used int DEFAULT 0,
  astra_messages_limit int NOT NULL,
  
  univers_clicks_used int DEFAULT 0,
  univers_clicks_limit int NOT NULL,
  
  resets_at timestamptz NOT NULL,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_quotas_user_date ON quotas(user_id, date_trunc('day', resets_at));

ALTER TABLE quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quotas" ON quotas FOR SELECT
  USING (auth.uid() = user_id);

-- ===================================================================
-- TABLE 4: matches
-- ===================================================================

CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id_1 uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id_2 uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  compatibility_score int NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  compatibility_details jsonb,
  
  status text NOT NULL DEFAULT 'potential' CHECK (status IN ('potential', 'mutual', 'rejected')),
  
  clicked_by_1 boolean DEFAULT false,
  clicked_by_2 boolean DEFAULT false,
  clicked_at_1 timestamptz,
  clicked_at_2 timestamptz,
  
  guardian_active_1 boolean DEFAULT false,
  guardian_active_2 boolean DEFAULT false,
  guardian_reason_1 text,
  guardian_reason_2 text,
  guardian_until_1 timestamptz,
  guardian_until_2 timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 < user_id_2)
);

CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user_id_1);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user_id_2);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_compatibility ON matches(compatibility_score DESC);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches" ON matches FOR SELECT
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- ===================================================================
-- TABLE 5: conversations
-- ===================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id_1 uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id_2 uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  
  last_message_at timestamptz,
  last_message_preview text,
  
  silence_recommended_for uuid REFERENCES profiles(id),
  silence_until timestamptz,
  silence_reason text,
  
  unread_count_1 int DEFAULT 0,
  unread_count_2 int DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 < user_id_2)
);

CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user_id_1);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user_id_2);
CREATE INDEX IF NOT EXISTS idx_conversations_match ON conversations(match_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC NULLS LAST);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- ===================================================================
-- TABLE 6: messages
-- ===================================================================

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  content text NOT NULL,
  
  is_read boolean DEFAULT false,
  read_at timestamptz,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = false;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations" ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id_1 = auth.uid() OR user_id_2 = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own conversations" ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id_1 = auth.uid() OR user_id_2 = auth.uid()
    )
  );

-- ===================================================================
-- TABLE 7: astra_conversations
-- ===================================================================

CREATE TABLE IF NOT EXISTS astra_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  session_type text NOT NULL DEFAULT 'question' 
    CHECK (session_type IN ('question', 'guidance', 'pattern', 'guardian', 'silence')),
  
  tone text NOT NULL DEFAULT 'observation'
    CHECK (tone IN ('observation', 'clarity', 'alert', 'protection')),
  
  started_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_astra_conversations_user ON astra_conversations(user_id);

ALTER TABLE astra_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own astra conversation" ON astra_conversations FOR SELECT
  USING (auth.uid() = user_id);

-- ===================================================================
-- TABLE 8: astra_messages
-- ===================================================================

CREATE TABLE IF NOT EXISTS astra_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES astra_conversations(id) ON DELETE CASCADE,
  
  message_type text NOT NULL CHECK (message_type IN (
    'user', 'astra', 'insight', 'consciousness', 'silence', 'memory'
  )),
  
  content text NOT NULL,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_astra_messages_conversation ON astra_messages(conversation_id, created_at DESC);

ALTER TABLE astra_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own astra messages" ON astra_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM astra_conversations WHERE user_id = auth.uid()
    )
  );

-- ===================================================================
-- TABLE 9: astra_memory
-- ===================================================================

CREATE TABLE IF NOT EXISTS astra_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  memory_type text NOT NULL CHECK (memory_type IN (
    'insight', 'pattern', 'preference', 'trauma', 'goal', 'relationship'
  )),
  
  content text NOT NULL,
  
  importance int NOT NULL DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
  
  created_at timestamptz DEFAULT now(),
  last_referenced timestamptz DEFAULT now(),
  reference_count int DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_astra_memory_user ON astra_memory(user_id, importance DESC);
CREATE INDEX IF NOT EXISTS idx_astra_memory_type ON astra_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_astra_memory_recent ON astra_memory(last_referenced DESC);

ALTER TABLE astra_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own astra memory" ON astra_memory FOR SELECT
  USING (auth.uid() = user_id);

-- ===================================================================
-- TABLE 10: guardian_events
-- ===================================================================

CREATE TABLE IF NOT EXISTS guardian_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  
  pattern_type text NOT NULL CHECK (pattern_type IN (
    'over_investment', 'anxious_attachment', 'avoidant', 'toxic_repeat', 'self_sabotage'
  )),
  
  detected_at timestamptz DEFAULT now(),
  confidence_score int NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  action_taken text CHECK (action_taken IN ('warning', 'silence_recommended', 'block_temporary')),
  action_duration interval,
  
  context_data jsonb,
  
  was_helpful boolean,
  user_feedback text
);

CREATE INDEX IF NOT EXISTS idx_guardian_events_user ON guardian_events(user_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_guardian_events_pattern ON guardian_events(pattern_type);

ALTER TABLE guardian_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own guardian events" ON guardian_events FOR SELECT
  USING (auth.uid() = user_id);

-- ===================================================================
-- TABLE 11: horoscopes
-- ===================================================================

CREATE TABLE IF NOT EXISTS horoscopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  horoscope_type text NOT NULL CHECK (horoscope_type IN ('daily', 'weekly', 'monthly')),
  
  period_start date NOT NULL,
  period_end date NOT NULL,
  
  content text NOT NULL,
  
  generated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, horoscope_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_horoscopes_user_type ON horoscopes(user_id, horoscope_type);
CREATE INDEX IF NOT EXISTS idx_horoscopes_period ON horoscopes(period_start DESC);

ALTER TABLE horoscopes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own horoscopes" ON horoscopes FOR SELECT
  USING (auth.uid() = user_id);

-- ===================================================================
-- TABLE 12: profile_views
-- ===================================================================

CREATE TABLE IF NOT EXISTS profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  viewed_at timestamptz DEFAULT now(),
  
  CHECK (viewer_id != viewed_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views(viewer_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON profile_views(viewed_id, viewed_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_views_unique_day ON profile_views(
  viewer_id, viewed_id, date_trunc('day', viewed_at)
);

ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile views" ON profile_views FOR SELECT
  USING (auth.uid() = viewer_id OR auth.uid() = viewed_id);

-- ===================================================================
-- TABLE 13: notifications
-- ===================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  notification_type text NOT NULL CHECK (notification_type IN (
    'new_match', 'new_message', 'profile_view', 'guardian_alert', 
    'horoscope_ready', 'subscription_ending', 'astra_insight'
  )),
  
  title text NOT NULL,
  body text NOT NULL,
  
  action_url text,
  action_label text,
  
  is_read boolean DEFAULT false,
  read_at timestamptz,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ===================================================================
-- FUNCTIONS & TRIGGERS
-- ===================================================================

-- Function: Create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User')
  );
  
  INSERT INTO public.subscriptions (user_id, tier)
  VALUES (NEW.id, 'free');
  
  INSERT INTO public.quotas (user_id, astra_messages_limit, univers_clicks_limit, resets_at)
  VALUES (NEW.id, 5, 1, (CURRENT_DATE + INTERVAL '1 day'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER quotas_updated_at BEFORE UPDATE ON quotas
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ===================================================================
-- STORAGE BUCKETS
-- ===================================================================

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for avatars bucket
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ===================================================================
-- DONE!
-- ===================================================================

-- Vérifier que tout est OK
SELECT 'Database setup complete!' as status;
-- ============================================
-- ASTRALOVES - ONBOARDING COLUMNS
-- Ajout colonnes onboarding au schema profiles
-- ============================================

-- Ajouter colonnes onboarding à profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Créer index pour performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
ON profiles(onboarding_completed);

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_step 
ON profiles(onboarding_step);

-- Commentaires
COMMENT ON COLUMN profiles.onboarding_step IS 'Current onboarding step (0=not started, 1=identity, 2=revelation, 3=universe)';
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether user completed onboarding';
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'Timestamp when onboarding was completed';

-- Fonction pour marquer onboarding comme complété
CREATE OR REPLACE FUNCTION complete_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.onboarding_completed = TRUE AND OLD.onboarding_completed = FALSE THEN
    NEW.onboarding_completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-set timestamp
DROP TRIGGER IF EXISTS trigger_complete_onboarding ON profiles;
CREATE TRIGGER trigger_complete_onboarding
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.onboarding_completed IS DISTINCT FROM OLD.onboarding_completed)
  EXECUTE FUNCTION complete_onboarding();

-- ============================================
-- READY TO USE
-- Execute ce SQL dans Supabase SQL Editor
-- ============================================
