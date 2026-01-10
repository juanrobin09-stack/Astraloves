-- ═══════════════════════════════════════════════════════════════════════
-- ASTRALOVES - SUPABASE SCHEMA COMPLET - VERSION CORRIGÉE
-- ═══════════════════════════════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: profiles
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Infos de base
  first_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_place JSONB NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('man', 'woman', 'non-binary')),
  looking_for TEXT[] NOT NULL,
  bio TEXT,
  
  -- Localisation
  current_city TEXT,
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  search_radius_km INTEGER DEFAULT 50,
  
  -- Photos
  photos JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT,
  
  -- Astro
  sun_sign TEXT NOT NULL,
  moon_sign TEXT NOT NULL,
  ascendant_sign TEXT NOT NULL,
  natal_chart_data JSONB,
  
  -- Énergies
  energy_fire DECIMAL(5,2) DEFAULT 0,
  energy_earth DECIMAL(5,2) DEFAULT 0,
  energy_air DECIMAL(5,2) DEFAULT 0,
  energy_water DECIMAL(5,2) DEFAULT 0,
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  onboarding_completed_at TIMESTAMPTZ,
  
  -- Métadonnées
  is_profile_complete BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Modération
  is_verified BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT
);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: subscriptions
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium', 'elite')) DEFAULT 'free',
  
  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Période
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Prix
  amount_cents INTEGER,
  currency TEXT DEFAULT 'EUR',
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly')),
  
  -- Trial
  is_trial BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, stripe_subscription_id)
);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: quotas
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Limites ASTRA
  astra_messages_used INTEGER DEFAULT 0,
  astra_messages_limit INTEGER DEFAULT 10,
  
  -- Limites Univers
  univers_clicks_used INTEGER DEFAULT 0,
  univers_clicks_limit INTEGER DEFAULT 5,
  
  -- Reset
  resets_at TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: matches
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Compatibilité
  compatibility_score INTEGER NOT NULL CHECK (compatibility_score BETWEEN 0 AND 100),
  compatibility_details JSONB,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('potential', 'mutual', 'rejected')) DEFAULT 'potential',
  
  -- Clicks
  clicked_by_1 BOOLEAN DEFAULT false,
  clicked_by_2 BOOLEAN DEFAULT false,
  clicked_at_1 TIMESTAMPTZ,
  clicked_at_2 TIMESTAMPTZ,
  
  -- Guardian
  guardian_active_1 BOOLEAN DEFAULT false,
  guardian_active_2 BOOLEAN DEFAULT false,
  guardian_reason_1 TEXT,
  guardian_reason_2 TEXT,
  guardian_until_1 TIMESTAMPTZ,
  guardian_until_2 TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 < user_id_2)
);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: conversations
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL CHECK (status IN ('active', 'archived', 'blocked')) DEFAULT 'active',
  
  -- Dernier message
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  
  -- Silence recommandé
  silence_recommended_for UUID REFERENCES public.profiles(id),
  silence_until TIMESTAMPTZ,
  silence_reason TEXT,
  
  -- Non lus
  unread_count_1 INTEGER DEFAULT 0,
  unread_count_2 INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id_1, user_id_2)
);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: messages
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: astra_conversations
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.astra_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  title TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  
  last_message_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: astra_messages
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.astra_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.astra_conversations(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- TABLE: astra_memory
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.astra_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  memory_type TEXT NOT NULL CHECK (memory_type IN ('personal', 'relational', 'preference')),
  content TEXT NOT NULL,
  
  importance INTEGER DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════

-- Profiles
CREATE INDEX idx_profiles_location_lat ON profiles(current_lat) WHERE current_lat IS NOT NULL;
CREATE INDEX idx_profiles_location_lng ON profiles(current_lng) WHERE current_lng IS NOT NULL;
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_onboarding ON profiles(onboarding_completed);

-- Matches
CREATE INDEX idx_matches_user1 ON matches(user_id_1);
CREATE INDEX idx_matches_user2 ON matches(user_id_2);
CREATE INDEX idx_matches_status ON matches(status);

-- Conversations
CREATE INDEX idx_conversations_user1 ON conversations(user_id_1);
CREATE INDEX idx_conversations_user2 ON conversations(user_id_2);
CREATE INDEX idx_conversations_status ON conversations(status);

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- ASTRA
CREATE INDEX idx_astra_conv_user ON astra_conversations(user_id);
CREATE INDEX idx_astra_msg_conv ON astra_messages(conversation_id);
CREATE INDEX idx_astra_memory_user ON astra_memory(user_id);

-- ═══════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE astra_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE astra_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE astra_memory ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Quotas
CREATE POLICY "Users can view own quotas" ON quotas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own quotas" ON quotas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quotas" ON quotas FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Matches
CREATE POLICY "Users can view own matches" ON matches FOR SELECT USING (auth.uid() IN (user_id_1, user_id_2));
CREATE POLICY "Users can update own matches" ON matches FOR UPDATE USING (auth.uid() IN (user_id_1, user_id_2));

-- Conversations
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() IN (user_id_1, user_id_2));
CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE USING (auth.uid() IN (user_id_1, user_id_2));

-- Messages
CREATE POLICY "Users can view conversation messages" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND auth.uid() IN (conversations.user_id_1, conversations.user_id_2)
  )
);
CREATE POLICY "Users can insert messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (auth.uid() = sender_id);

-- ASTRA
CREATE POLICY "Users can view own astra conversations" ON astra_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own astra conversations" ON astra_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own astra conversations" ON astra_conversations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own astra messages" ON astra_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM astra_conversations WHERE astra_conversations.id = astra_messages.conversation_id AND astra_conversations.user_id = auth.uid())
);
CREATE POLICY "Users can insert astra messages" ON astra_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM astra_conversations WHERE astra_conversations.id = astra_messages.conversation_id AND astra_conversations.user_id = auth.uid())
);

CREATE POLICY "Users can view own memory" ON astra_memory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memory" ON astra_memory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memory" ON astra_memory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memory" ON astra_memory FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_quotas_updated_at BEFORE UPDATE ON quotas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════

-- Function: Auto-create quota on profile creation
CREATE OR REPLACE FUNCTION create_quota_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.quotas (user_id, resets_at)
  VALUES (NEW.id, now() + interval '30 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_quota_for_new_user();

-- Function: Auto-create subscription on profile creation
CREATE OR REPLACE FUNCTION create_subscription_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, tier, starts_at)
  VALUES (NEW.id, 'free', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_subscription
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_subscription_for_new_user();

-- ═══════════════════════════════════════════════════════════════════════
-- READY TO USE
-- ═══════════════════════════════════════════════════════════════════════
