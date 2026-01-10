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
          setProfile(profileData);
          setSubscription(subscriptionData);
        }
      } catch (error: any) {
        // Ne log que si ce n'est pas juste une absence de session
        if (!error?.message?.includes('session')) {
          console.error('Auth load error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();

    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      if (user) {
        authService.getProfile(user.id).then(setProfile);
        authService.getSubscription(user.id).then(setSubscription);
      } else {
        setProfile(null);
        setSubscription(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, subscription, isLoading };
};
