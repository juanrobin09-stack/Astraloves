import { supabase } from './supabase';

export interface ValidationErrors {
  [key: string]: string;
}

export interface ProfileData {
  username?: string;
  pseudo?: string;
  birth_date?: string;
  bio?: string;
  ville?: string;
  gender?: string;
  looking_for?: string;
}

export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function validateProfile(data: ProfileData): ValidationErrors | null {
  const errors: ValidationErrors = {};

  if (data.username !== undefined) {
    if (!data.username || data.username.length < 2) {
      errors.username = 'Prénom trop court (minimum 2 caractères)';
    }
    if (data.username && data.username.length > 50) {
      errors.username = 'Prénom trop long (maximum 50 caractères)';
    }
  }

  if (data.pseudo !== undefined) {
    if (!data.pseudo || data.pseudo.length < 3) {
      errors.pseudo = 'Pseudo minimum 3 caractères';
    }
    if (data.pseudo && data.pseudo.length > 20) {
      errors.pseudo = 'Pseudo maximum 20 caractères';
    }
    if (data.pseudo && !/^[a-z0-9_]+$/.test(data.pseudo)) {
      errors.pseudo = 'Pseudo : lettres minuscules, chiffres et _ uniquement';
    }
  }

  if (data.birth_date !== undefined) {
    if (!data.birth_date) {
      errors.birth_date = 'Date de naissance requise';
    } else {
      const age = calculateAge(data.birth_date);
      if (age < 18) {
        errors.birth_date = 'Vous devez avoir 18 ans minimum';
      }
      if (age > 120) {
        errors.birth_date = 'Date de naissance invalide';
      }
    }
  }

  if (data.bio !== undefined && data.bio) {
    if (data.bio.length > 300) {
      errors.bio = 'Bio maximum 300 caractères';
    }
  }

  if (data.ville !== undefined && data.ville) {
    if (data.ville.length > 100) {
      errors.ville = 'Ville maximum 100 caractères';
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export async function checkPseudoAvailable(
  pseudo: string,
  currentUserId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('astra_profiles')
      .select('id')
      .eq('pseudo', pseudo.toLowerCase())
      .maybeSingle();

    if (error) throw error;

    if (data && data.id !== currentUserId) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Check pseudo error:', error);
    return false;
  }
}

export async function updateProfile(
  userId: string,
  data: ProfileData
): Promise<{ success: boolean; errors?: ValidationErrors; error?: string }> {
  try {
    const errors = validateProfile(data);
    if (errors) {
      return { success: false, errors };
    }

    if (data.pseudo) {
      const available = await checkPseudoAvailable(data.pseudo, userId);
      if (!available) {
        return {
          success: false,
          errors: { pseudo: 'Ce pseudo est déjà pris' },
        };
      }
    }

    const updateData: any = { ...data };
    updateData.updated_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('astra_profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Erreur lors de la sauvegarde du profil' };
  }
}
