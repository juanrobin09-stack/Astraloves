import { supabase } from './supabase';

export async function resendVerificationEmail(): Promise<{ success?: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Non connecté' };
    }

    if (user.email_confirmed_at) {
      return { error: 'Email déjà vérifié' };
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email!,
    });

    if (error) {
      if (error.message.includes('rate limit')) {
        return { error: 'Trop de tentatives. Attends quelques minutes.' };
      }
      return { error: 'Erreur lors de l\'envoi' };
    }

    return { success: true };
  } catch (error) {
    console.error('Resend verification error:', error);
    return { error: 'Erreur inattendue' };
  }
}

export async function checkEmailVerified(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user?.email_confirmed_at;
  } catch (error) {
    console.error('Check email verified error:', error);
    return false;
  }
}

export interface VerificationCheck {
  blocked: boolean;
  message?: string;
}

export async function requireEmailVerification(action: string): Promise<VerificationCheck> {
  const isVerified = await checkEmailVerified();

  if (isVerified) {
    return { blocked: false };
  }

  const blockedActions = [
    'swipe',
    'sendMessage',
    'addFriend',
    'createStory',
    'like',
    'match',
    'chat',
  ];

  if (blockedActions.includes(action)) {
    return {
      blocked: true,
      message: 'Vérifie ton email pour débloquer cette fonctionnalité',
    };
  }

  return { blocked: false };
}

export function isActionBlocked(action: string, emailVerified: boolean): boolean {
  if (emailVerified) return false;

  const blockedActions = [
    'swipe',
    'sendMessage',
    'addFriend',
    'createStory',
    'like',
    'match',
    'chat',
  ];

  return blockedActions.includes(action);
}
