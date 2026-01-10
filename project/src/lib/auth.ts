import { supabase } from './supabase';

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    return {
      success: false,
      error: error.message || 'Erreur de connexion avec Google'
    };
  }
}

export async function signInWithApple() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Apple OAuth error:', error);
    return {
      success: false,
      error: error.message || 'Erreur de connexion avec Apple'
    };
  }
}

export async function signInWithFacebook() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Facebook OAuth error:', error);
    return {
      success: false,
      error: error.message || 'Erreur de connexion avec Facebook'
    };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la déconnexion'
    };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}
