import { supabase } from './supabase';

export interface BoostStatus {
  isActive: boolean;
  endsAt: string | null;
  remainingMinutes: number;
}

export async function getBoostStatus(userId: string): Promise<BoostStatus> {
  try {
    const { data, error } = await supabase
      .from('astra_profiles')
      .select('boost_active_until')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    const now = new Date();
    const boostUntil = data?.boost_active_until ? new Date(data.boost_active_until) : null;

    if (!boostUntil || boostUntil <= now) {
      return {
        isActive: false,
        endsAt: null,
        remainingMinutes: 0
      };
    }

    const remainingMs = boostUntil.getTime() - now.getTime();
    const remainingMinutes = Math.floor(remainingMs / 60000);

    return {
      isActive: true,
      endsAt: data.boost_active_until,
      remainingMinutes
    };
  } catch (error) {
    console.error('Error getting boost status:', error);
    return {
      isActive: false,
      endsAt: null,
      remainingMinutes: 0
    };
  }
}

export async function activateBoost(userId: string, durationMinutes: number = 30): Promise<boolean> {
  try {
    const boostUntil = new Date();
    boostUntil.setMinutes(boostUntil.getMinutes() + durationMinutes);

    const { error } = await supabase
      .from('astra_profiles')
      .update({
        boost_active_until: boostUntil.toISOString(),
        last_boost_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error activating boost:', error);
    return false;
  }
}

export async function canUseBoost(userId: string): Promise<{ canUse: boolean; reason?: string }> {
  try {
    const { data: profile } = await supabase
      .from('astra_profiles')
      .select('is_premium, boost_active_until, last_boost_at')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      return { canUse: false, reason: 'Profil introuvable' };
    }

    if (!profile.is_premium) {
      return { canUse: false, reason: 'Fonctionnalité réservée aux membres Premium' };
    }

    const now = new Date();
    const boostUntil = profile.boost_active_until ? new Date(profile.boost_active_until) : null;

    if (boostUntil && boostUntil > now) {
      return { canUse: false, reason: 'Un boost est déjà actif' };
    }

    const lastBoost = profile.last_boost_at ? new Date(profile.last_boost_at) : null;
    if (lastBoost) {
      const hoursSinceLastBoost = (now.getTime() - lastBoost.getTime()) / 3600000;
      if (hoursSinceLastBoost < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastBoost);
        return {
          canUse: false,
          reason: `Prochain boost disponible dans ${hoursRemaining}h`
        };
      }
    }

    return { canUse: true };
  } catch (error) {
    console.error('Error checking boost availability:', error);
    return { canUse: false, reason: 'Erreur lors de la vérification' };
  }
}
