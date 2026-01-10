import { supabase } from '../lib/supabase';

export async function checkAstraLimit(userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('check_astra_limit', { p_user_id: userId });

    if (error) {
      console.error('[secureService] checkAstraLimit error:', error);
      return { allowed: true, used: 0, limit: 10, remaining: 10, plan: 'free' };
    }

    return data;
  } catch (err) {
    console.error('[secureService] checkAstraLimit exception:', err);
    return { allowed: true, used: 0, limit: 10, remaining: 10, plan: 'free' };
  }
}

export async function incrementAstraMessages(userId?: string) {
  try {
    const { data, error } = await supabase
      .rpc('increment_astra_messages', userId ? { p_user_id: userId } : {});

    if (error) {
      console.error('[secureService] incrementAstraMessages error:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (err) {
    console.error('[secureService] incrementAstraMessages exception:', err);
    return { success: false, error: 'NETWORK_ERROR' };
  }
}

export async function sendCosmicSignalSecure(targetUserId: string) {
  try {
    const { data, error } = await supabase
      .rpc('send_cosmic_signal_secure', { p_target_user_id: targetUserId });

    if (error) {
      return { success: false, error: error.code, message: error.message };
    }

    return data;
  } catch (err) {
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur réseau' };
  }
}

export async function sendSuperNovaSecure(targetUserId: string) {
  try {
    const { data, error } = await supabase
      .rpc('send_super_nova_secure', { p_target_user_id: targetUserId });

    if (error) {
      return { success: false, error: error.code, message: error.message };
    }

    return data;
  } catch (err) {
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur réseau' };
  }
}

export async function sendSuperLikeSecure(targetUserId: string) {
  try {
    const { data, error } = await supabase
      .rpc('send_super_like_secure', { p_target_user_id: targetUserId });

    if (error) {
      return { success: false, error: error.code, message: error.message };
    }

    return data;
  } catch (err) {
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur réseau' };
  }
}

export async function checkFeatureAccess(feature: string) {
  try {
    const { data, error } = await supabase
      .rpc('check_feature_access', { p_feature: feature });

    if (error) {
      return { hasAccess: false, currentPlan: 'free', requiredPlan: 'premium' };
    }

    return data;
  } catch (err) {
    return { hasAccess: false, currentPlan: 'free', requiredPlan: 'premium' };
  }
}

export async function getUserLimitsAndUsage() {
  try {
    const { data, error } = await supabase.rpc('get_user_limits_and_usage');

    if (error) {
      console.error('[secureService] getUserLimitsAndUsage error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[secureService] getUserLimitsAndUsage exception:', err);
    return null;
  }
}

export default {
  checkAstraLimit,
  incrementAstraMessages,
  sendCosmicSignalSecure,
  sendSuperNovaSecure,
  sendSuperLikeSecure,
  checkFeatureAccess,
  getUserLimitsAndUsage,
};
