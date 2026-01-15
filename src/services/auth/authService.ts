// ═══════════════════════════════════════════════════════════════════════
// AUTH SERVICE
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '@/config/supabase';
import type { Profile, Subscription } from '@/types';

export interface SignUpData {
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
    return authData;
  },

  async signIn(data: SignInData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
    return authData;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.warn('Sign out error:', error.message);
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        // Session errors are normal when not logged in
        return null;
      }
      return user;
    } catch (error) {
      return null;
    }
  },

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // PGRST116 = no rows returned (normal for new users)
      // 406 = Not Acceptable (RLS policy issue)
      if (error) {
        if (error.code !== 'PGRST116') {
          console.warn('Profile fetch warning:', error.code, error.message);
        }
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Profile fetch failed');
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error.message);
        throw error;
      }
      return data;
    } catch (err) {
      throw err;
    }
  },

  async getSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .or('ends_at.is.null,ends_at.gt.now()')
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.warn('Subscription fetch warning:', error.code);
        }
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Subscription fetch failed');
      return null;
    }
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  },
};
