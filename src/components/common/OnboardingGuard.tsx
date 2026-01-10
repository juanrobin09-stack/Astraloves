import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { profile, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Ne pas rediriger si déjà sur onboarding ou auth
    if (location.pathname === '/onboarding' || location.pathname === '/login' || location.pathname === '/signup') {
      return;
    }

    // Attendre que profile soit chargé
    if (isLoading) return;

    // Rediriger si onboarding non complété
    if (profile && !profile.onboarding_completed) {
      navigate('/onboarding', { replace: true });
    }
  }, [profile, isLoading, navigate, location]);

  // Afficher children seulement si onboarding complété ou sur page onboarding
  if (!isLoading && profile && !profile.onboarding_completed && location.pathname !== '/onboarding') {
    return null;
  }

  return <>{children}</>;
}
