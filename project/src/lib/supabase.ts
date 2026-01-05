import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  username: string | null;
  first_name: string | null;
  age: number | null;
  gender: string | null;
  gender_preference: string | null;
  goals: string | null;
  goal: string | null;
  custom_goal: string | null;
  preference: string | null;
  custom_preference: string | null;
  attachment_style: string | null;
  compatibility_profile: string | null;
  is_premium: boolean;
  premium_until: string | null;
  daily_chat_count: number;
  last_chat_reset: string;
  subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  sentiment_score: number | null;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: 'active' | 'canceled' | 'expired';
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
};
