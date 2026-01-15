// ═══════════════════════════════════════════════════════════════════════
// USE AUTH HOOK
// ═══════════════════════════════════════════════════════════════════════

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth/authService';

export const useAuth = () => {
  const { user, profile, subscription, setUser, setProfile, setSubscription, isLoading, setIsLoading } = useAuthStore();

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          const [profileData, subscriptionData] = await Promise.all([
            authService.getProfile(currentUser.id),
            authService.getSubscription(currentUser.id),
          ]);

          // If profile doesn't exist, create a minimal one
          if (!profileData) {
            setProfile({ id: currentUser.id, first_name: 'User' } as any);
          } else {
            setProfile(profileData);
          }
          setSubscription(subscriptionData);
        }
      } catch (error: any) {
        console.warn('Auth load:', error?.message || 'No session');
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();

    // Fix: renamed variable to avoid conflict with state
    const { data: { subscription: authSubscription } } = authService.onAuthStateChange((authUser) => {
      setUser(authUser);
      if (authUser) {
        authService.getProfile(authUser.id).then((p) => {
          if (!p) {
            setProfile({ id: authUser.id, first_name: 'User' } as any);
          } else {
            setProfile(p);
          }
        });
        authService.getSubscription(authUser.id).then(setSubscription);
      } else {
        setProfile(null);
        setSubscription(null);
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  return { user, profile, subscription, isLoading };
};
