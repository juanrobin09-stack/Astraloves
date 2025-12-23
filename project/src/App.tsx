/*
 * CHECKLIST RESET MOT DE PASSE - TEST DE BOUT EN BOUT
 *
 * CONTEXTE IMPORTANT:
 * Supabase envoie parfois des liens avec DEUX caractères # :
 * https://astraloves.com/#type=recovery#access_token=...&refresh_token=...
 *                                       ^           ^
 *                                  premier #   deuxième # (devrait être &)
 *
 * Le code utilise parseNormalizedHash() pour corriger automatiquement
 * ce problème en remplaçant le deuxième # par &.
 *
 * 1. Demander un reset:
 *    - Va sur https://astraloves.com
 *    - Clique "Mot de passe oublié"
 *    - Entre ton email
 *    - Vérifie que tu reçois l'email
 *
 * 2. Cliquer sur le lien:
 *    - Ouvre l'email
 *    - Clique sur le lien de reset (peut avoir 1 ou 2 caractères #)
 *    - Ouvre la console du navigateur (F12)
 *    - Vérifie les logs de normalisation:
 *      * "🔧 RAW HASH BEFORE NORMALIZATION"
 *      * "✅ NORMALIZED HASH" (si un fix était nécessaire)
 *      * "🔍 PARSED VALUES" avec type="recovery" et tokens présents
 *    - Vérifie que la page ResetPasswordPage s'affiche
 *
 * 3. Changer le mot de passe:
 *    - Entre un nouveau mot de passe (min 8 caractères)
 *    - Confirme le mot de passe
 *    - Clique "Changer mon mot de passe"
 *    - Vérifie dans la console: "✅ Password updated successfully"
 *    - Vérifie la redirection vers la page swipe
 *
 * 4. Vérifier la connexion:
 *    - Vérifie que tu es connecté
 *    - Essaie de te déconnecter
 *    - Reconnecte-toi avec le nouveau mot de passe
 *
 * LOGS À SURVEILLER DANS LA CONSOLE:
 * - 🔧 RAW HASH BEFORE NORMALIZATION (hash brut)
 * - ✅ NORMALIZED HASH (hash corrigé si nécessaire)
 * - 🔍 PARSED VALUES (valeurs extraites: type, tokens, etc.)
 * - 🔐 RECOVERY DETECTED in App.tsx
 * - 🔐 Tokens extracted from URL hash
 * - 🔐 ResetPasswordPage - Session check start
 * - ✅ Session exchanged successfully
 * - ✅ Password updated successfully
 *
 * FICHIERS MODIFIÉS:
 * - src/lib/hashUtils.ts (nouvelle fonction de normalisation)
 * - src/App.tsx (utilise parseNormalizedHash)
 * - src/contexts/AuthContext.tsx (utilise parseNormalizedHash)
 * - src/components/ResetPasswordPage.tsx (utilise parseNormalizedHash)
 */

import { useEffect, useState, lazy, Suspense, startTransition } from 'react';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { parseNormalizedHash } from './lib/hashUtils';

import LandingPage from './components/LandingPage';
import CookieBanner from './components/CookieBanner';
import AgeGate from './components/AgeGate';
import BottomNav from './components/BottomNav';
import AppHeader from './components/AppHeader';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import LoadingSpinner from './components/LoadingSpinner';
import CGV from './components/CGV';
import MentionsLegales from './components/MentionsLegales';
import PolitiqueConfidentialite from './components/PolitiqueConfidentialite';

const SignupPage = lazy(() => import('./components/SignupPage'));
const OnboardingPage = lazy(() => import('./components/OnboardingPageNew'));
const AstraChat = lazy(() => import('./components/AstraChat'));
const CGVSimple = lazy(() => import('./components/CGVSimple'));
const MentionsLegalesSimple = lazy(() => import('./components/MentionsLegalesSimple'));
const SubscriptionPage = lazy(() => import('./components/SubscriptionPageNew'));
const DashboardPage = lazy(() => import('./components/DashboardPage'));
const QuestionnairesPage = lazy(() => import('./components/QuestionnairesPage'));
const MyResultsPage = lazy(() => import('./components/MyResultsPage'));
const ProfileEdit = lazy(() => import('./components/ProfileEdit'));
const ResultsPage = lazy(() => import('./components/ResultsPage'));
const ExpiredLinkPage = lazy(() => import('./components/ExpiredLinkPage'));
const MessagesPage = lazy(() => import('./components/messages/MessagesPage'));
const SearchPage = lazy(() => import('./components/SearchPage'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const SubscriptionTab = lazy(() => import('./components/SubscriptionTab'));
const SwipePage = lazy(() => import('./components/SwipePagePure'));
const MatchesPage = lazy(() => import('./components/MatchesPage'));
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./components/VerifyEmailPage'));
const LiveStreamPage = lazy(() => import('./components/LiveStreamPage'));
const LiveFeedPage = lazy(() => import('./components/LiveFeedPage'));
const StartLivePage = lazy(() => import('./components/StartLivePage'));
const CreatorDashboard = lazy(() => import('./components/CreatorDashboard'));
const PaymentSuccessPage = lazy(() => import('./components/PaymentSuccessPage'));
const AstroPage = lazy(() => import('./components/AstroPageRestructured'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const QuizTestPage = lazy(() => import('./components/QuizTestPage'));
const QuizResultsPage = lazy(() => import('./components/QuizResultsPage'));
const AchievementsPage = lazy(() => import('./components/AchievementsPage'));
const ReferralPage = lazy(() => import('./components/ReferralPage'));
const MySubscription = lazy(() => import('./components/MySubscription'));
const SubscriptionsPlansPage = lazy(() => import('./components/SubscriptionsPlansPage'));
const ConstellationPage = lazy(() => import('./components/ConstellationPage'));
const UniverseMapPage = lazy(() => import('./components/UniverseMapPage'));
const UniversSimple = lazy(() => import('./components/UniversSimple'));
const SubscriptionPlansPageRed = lazy(() => import('./components/SubscriptionPlansPageRed'));
const UniverseTestPage = lazy(() => import('./components/UniverseTestPage'));
const UniverseApp = lazy(() => import('./components/UniverseApp'));
const UniversDating = lazy(() => import('./components/UniversDating'));

type Page = 'landing' | 'login' | 'signup' | 'onboarding' | 'chat' | 'cgv' | 'mentionsLegales' | 'politique-confidentialite' | 'conditions-generales-de-vente' | 'cgv-simple' | 'mentions-legales-simple' | 'subscription' | 'subscriptions-plans' | 'my-subscription' | 'dashboard' | 'questionnaires' | 'my-results' | 'edit-profile' | 'profile' | 'expired-link' | 'view-result' | 'messages' | 'discovery' | 'premium' | 'search' | 'swipe' | 'reset-password' | 'verify-email' | 'stars-shop' | 'live-stream' | 'live' | 'live-feed' | 'start-live' | 'creator-dashboard' | 'payment-success' | 'astro' | 'settings' | 'achievements' | 'referral' | 'quiz-test' | 'quiz-results' | 'constellation' | 'univers' | 'universe-map' | 'subscription-plans-red' | 'universe-test' | 'universe-app' | 'univers-dating';

function App() {
  const { user, loading } = useAuth();

  const getInitialPage = (): Page => {
    const path = window.location.pathname;
    const hash = window.location.hash;

    if (path === '/univers-dating' || hash === '#univers-dating') {
      return 'univers-dating';
    }
    if (path === '/universe-app' || hash === '#universe-app') {
      return 'universe-app';
    }
    if (path === '/universe-test' || hash === '#universe-test') {
      return 'universe-test';
    }
    if (path === '/politique-confidentialite') {
      return 'politique-confidentialite';
    }
    if (path === '/conditions-generales-de-vente') {
      return 'conditions-generales-de-vente';
    }
    if (path === '/onboarding') {
      return 'onboarding';
    }
    if (path === '/reset-password') {
      return 'reset-password';
    }
    if (path === '/verify-email') {
      return 'verify-email';
    }
    return 'landing';
  };

  const [page, setPage] = useState<Page>(getInitialPage());
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [viewingResultId, setViewingResultId] = useState<string | null>(null);
  const [currentLiveId, setCurrentLiveId] = useState<string | null>(null);
  const [recoveryTokens, setRecoveryTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [currentQuizResult, setCurrentQuizResult] = useState<any>(null);

  const handleNavigate = (newPage: string) => {
    startTransition(() => {
      setPage(newPage as Page);
    });
  };

  // Initialize dark mode on app load
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const isDarkMode = savedDarkMode !== null ? JSON.parse(savedDarkMode) : true;

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // CLEANUP GLOBAL: Supprimer modal-open au démarrage pour débloquer le scroll
  useEffect(() => {
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('height');
    document.body.style.overflow = 'auto';

    const root = document.getElementById('root');
    if (root) {
      root.style.removeProperty('overflow');
      root.style.removeProperty('height');
    }
  }, []);

  // Listen for custom navigation events from child components
  useEffect(() => {
    const handleCustomNavigate = (event: CustomEvent) => {
      const { page } = event.detail;
      if (page) {
        handleNavigate(page);
      }
    };

    window.addEventListener('navigate', handleCustomNavigate as EventListener);
    return () => {
      window.removeEventListener('navigate', handleCustomNavigate as EventListener);
    };
  }, []);

  // Pages qui doivent afficher la BottomNav
  const pagesWithNav = ['swipe', 'dashboard', 'profile', 'discovery', 'chat', 'live', 'messages', 'astro', 'constellation', 'univers'];
  const showBottomNav = user && pagesWithNav.includes(page);

  useEffect(() => {
    const rawHash = window.location.hash;
    const parsed = parseNormalizedHash(rawHash);

    const queryParams = new URLSearchParams(window.location.search);
    const type = parsed.type || queryParams.get('type') || '';
    const accessToken = parsed.accessToken || queryParams.get('access_token') || '';
    const refreshToken = parsed.refreshToken || queryParams.get('refresh_token') || '';
    const tokenHash = parsed.tokenHash || queryParams.get('token_hash') || '';

    if (type === 'recovery') {
      if (accessToken && refreshToken) {
        setRecoveryTokens({ accessToken, refreshToken });
      }

      setPage('reset-password');
      setCheckingProfile(false);
      return;
    }

    if (type === 'signup' && (accessToken || tokenHash)) {
      const newUrl = window.location.origin + '/verify-email' + window.location.search + window.location.hash;
      window.location.replace(newUrl);
      return;
    }

    const path = window.location.pathname;
    if (path === '/politique-confidentialite') {
      setPage('politique-confidentialite');
      setCheckingProfile(false);
      return;
    }

    if (path === '/conditions-generales-de-vente') {
      setPage('conditions-generales-de-vente');
      setCheckingProfile(false);
      return;
    }

    if (path === '/onboarding') {
      setPage('onboarding');
      setCheckingProfile(false);
      return;
    }

    if (path === '/reset-password') {
      setPage('reset-password');
      setCheckingProfile(false);
      return;
    }

    if (path === '/verify-email') {
      setPage('verify-email');
      setCheckingProfile(false);
      return;
    }

    const handleAuthCallback = async () => {
      // Parser le hash avec normalisation (correction du double #)
      const rawHash = window.location.hash;
      const parsed = parseNormalizedHash(rawHash);
      const queryParams = new URLSearchParams(window.location.search);

      const type = parsed.type || queryParams.get('type') || '';
      if (type === 'recovery') {
        return;
      }

      const success = queryParams.get('success');
      const canceled = queryParams.get('canceled');

      if (success === 'true' || canceled === 'true') {
        window.history.replaceState({}, document.title, '/');
        if (success === 'true' && user) {
          setPage('constellation');
        }
        setCheckingProfile(false);
        return;
      }

      const error = queryParams.get('error') || parsed.type === 'error' ? 'error' : '';
      const errorDescription = queryParams.get('error_description') || '';
      const accessToken = parsed.accessToken || queryParams.get('access_token') || '';

      if (error && (errorDescription?.includes('expired') || errorDescription?.includes('invalid'))) {
        setPage('expired-link');
        setCheckingProfile(false);
        return;
      }

      if (accessToken) {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
          const { data: profile } = await supabase
            .from('astra_profiles')
            .select('onboarding_completed, first_name')
            .eq('id', authUser.id)
            .maybeSingle();

          if (profile?.onboarding_completed && profile?.first_name) {
            window.history.replaceState({}, document.title, '/');
            setPage('univers');
            setCheckingProfile(false);
            return;
          }
        }

        setPage('onboarding');
        setCheckingProfile(false);
        return;
      }
    };

    handleAuthCallback();
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkOnboardingStatus = async () => {
      const path = window.location.pathname;
      const { type: hashType } = parseNormalizedHash(window.location.hash);
      const queryParams = new URLSearchParams(window.location.search);
      const type = hashType || queryParams.get('type');

      if (!mounted) return;

      if (type === 'recovery' || path === '/reset-password') {
        if (mounted && page !== 'reset-password') {
          setPage('reset-password');
        }
        if (mounted) setCheckingProfile(false);
        return;
      }

      if (type === 'signup' || path === '/verify-email') {
        if (mounted) setCheckingProfile(false);
        return;
      }

      if (path === '/politique-confidentialite' || path === '/conditions-generales-de-vente' || path === '/onboarding') {
        if (mounted) setCheckingProfile(false);
        return;
      }

      if (user) {
        try {
          console.log('🔍 [APP] Vérification du statut onboarding pour userId:', user.id);

          const { data: profile, error } = await supabase
            .from('astra_profiles')
            .select('onboarding_completed, first_name')
            .eq('id', user.id)
            .maybeSingle();

          if (error) {
            console.error('❌ [APP] Erreur lors de la vérification:', error);
          }

          console.log('📊 [APP] Profil récupéré:', profile);

          if (!mounted) return;

          if (!profile?.onboarding_completed || !profile?.first_name) {
            console.log('🎯 [APP] Onboarding non complété, redirection vers onboarding');
            if (page !== 'onboarding') {
              setPage('onboarding');
            }
          } else if (page === 'landing' || page === 'signup' || page === 'login') {
            console.log('✅ [APP] Onboarding complété, redirection vers univers');
            setPage('univers');
          }
        } catch (error) {
          console.error('❌ [APP] Error checking onboarding:', error);
        } finally {
          if (mounted) setCheckingProfile(false);
        }
      } else {
        if (mounted) {
          setCheckingProfile(false);
          if (path !== '/politique-confidentialite' && path !== '/conditions-generales-de-vente' && path !== '/onboarding') {
            if (page !== 'landing' && page !== 'signup' && page !== 'login') {
              setPage('landing');
            }
          }
        }
      }
    };

    checkOnboardingStatus();

    return () => {
      mounted = false;
    };
  }, [user]);


  if (page === 'politique-confidentialite') {
    return (
      <>
        <AgeGate />
        <CookieBanner />
        <PolitiqueConfidentialite onBack={() => setPage('landing')} />
      </>
    );
  }

  if (page === 'conditions-generales-de-vente') {
    return (
      <>
        <AgeGate />
        <CookieBanner />
        <CGV onBack={() => setPage('landing')} />
      </>
    );
  }

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen velvet-bg relative overflow-hidden flex items-center justify-center">
        <div className="stars-bg absolute inset-0 opacity-30" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white text-2xl premium-text-sm">Chargement...</div>
        </div>
      </div>
    );
  }

  if (page === 'landing') {
    return (
      <>
        <AgeGate />
        <CookieBanner />
        <LandingPage
          onGetStarted={() => setPage('signup')}
          onLogin={() => setPage('login')}
          onNavigateLegal={(legalPage) => setPage(legalPage)}
          onNavigate={handleNavigate}
        />
      </>
    );
  }

  if (page === 'signup' || page === 'login') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <SignupPage
          mode={page}
          onSignupSuccess={() => {
            setPage('onboarding');
          }}
          onSwitchToLogin={() => setPage('login')}
          onSwitchToSignup={() => setPage('signup')}
          onNavigateLegal={(legalPage) => setPage(legalPage)}
        />
      </Suspense>
    );
  }

  if (page === 'reset-password') {
    return (
      <ResetPasswordPage
        recoveryTokens={recoveryTokens}
        onSuccess={() => {
          window.history.replaceState({}, document.title, '/');
          setRecoveryTokens(null);
          setPage('univers');
        }}
        onCancel={() => {
          window.history.replaceState({}, document.title, '/');
          setPage('landing');
        }}
      />
    );
  }

  if (page === 'verify-email') {
    return (
      <VerifyEmailPage
        onSuccess={() => {
          setPage('univers');
        }}
      />
    );
  }

  if (page === 'onboarding') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <OnboardingPage
          onComplete={() => {
            console.log('✅ [APP] onComplete appelé, redirection vers univers');
            setPage('univers');
          }}
        />
      </Suspense>
    );
  }


  if (page === 'cgv') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <CGV onBack={() => setPage('landing')} />
      </Suspense>
    );
  }

  if (page === 'mentionsLegales') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <MentionsLegales onBack={() => setPage('landing')} />
      </Suspense>
    );
  }

  if (page === 'cgv-simple') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <CGVSimple onBack={() => setPage('signup')} />
      </Suspense>
    );
  }

  if (page === 'mentions-legales-simple') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <MentionsLegalesSimple onBack={() => setPage('landing')} />
      </Suspense>
    );
  }

  if (page === 'universe-map') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <UniverseMapPage />
      </Suspense>
    );
  }

  if (page === 'subscription-plans-red') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <SubscriptionPlansPageRed />
      </Suspense>
    );
  }

  if (page === 'univers-dating') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <UniversDating />
      </Suspense>
    );
  }

  if (page === 'universe-app') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <UniverseApp />
      </Suspense>
    );
  }

  if (page === 'universe-test') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <UniverseTestPage onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  if (page === 'swipe') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <EmailVerificationBanner />
        <div className="h-screen flex flex-col bg-black">
          <div className="flex-1" style={{ height: 'calc(100vh - 80px)' }}>
            <SwipePage onNavigate={handleNavigate} />
          </div>
          <BottomNav currentPage="swipe" onNavigate={handleNavigate} />
        </div>
      </Suspense>
    );
  }

  if (page === 'dashboard') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <EmailVerificationBanner />
        <div className="h-screen flex flex-col bg-black">
          <div className="flex-1 overflow-auto no-scrollbar" style={{ height: 'calc(100vh - 80px)' }}>
            <DashboardPage
              onBack={() => setPage('constellation')}
              onEditProfile={() => setPage('profile')}
              onViewResult={(resultId) => {
                setViewingResultId(resultId);
                setPage('view-result');
              }}
              onNavigate={(newPage) => setPage(newPage as Page)}
            />
          </div>
          <BottomNav currentPage="dashboard" onNavigate={handleNavigate} />
        </div>
      </Suspense>
    );
  }

  if (page === 'questionnaires') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <QuestionnairesPage
          onBack={() => setPage('astro')}
          onStartQuestionnaire={() => {
            setPage('swipe');
          }}
          onNavigate={(page: string, data?: any) => {
            if (data?.quiz) {
              setCurrentQuiz(data.quiz);
            }
            if (data?.result) {
              setCurrentQuizResult(data.result);
            }
            setPage(page as Page);
          }}
          onViewResult={(resultId) => {
            setViewingResultId(resultId);
            setPage('view-result');
          }}
        />
        <BottomNav currentPage="astro" onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  if (page === 'my-results') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <MyResultsPage />
        <BottomNav currentPage="astro" onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  if (page === 'quiz-test') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <QuizTestPage
          quiz={currentQuiz}
          onBack={() => setPage('questionnaires')}
          onComplete={(result) => {
            setCurrentQuizResult(result);
            setPage('quiz-results');
          }}
        />
      </Suspense>
    );
  }

  if (page === 'quiz-results') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <QuizResultsPage
          quiz={currentQuiz}
          result={currentQuizResult}
          onBack={() => setPage('questionnaires')}
        />
      </Suspense>
    );
  }

  if (page === 'profile') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <div className="min-h-screen bg-black pb-20">
          <ProfilePage onNavigate={(newPage) => setPage(newPage as Page)} />
          <BottomNav currentPage="profile" onNavigate={handleNavigate} />
        </div>
      </Suspense>
    );
  }

  if (page === 'subscription') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <SubscriptionPage
          onBack={() => {
            startTransition(() => setPage('profile'));
          }}
        />
        <BottomNav currentPage="profile" onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  if (page === 'subscriptions-plans') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <SubscriptionsPlansPage onNavigate={(newPage) => setPage(newPage as Page)} />
      </Suspense>
    );
  }

  if (page === 'edit-profile' && user) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <ProfileEdit
          userId={user.id}
          onClose={() => setPage('profile')}
          onSave={() => setPage('profile')}
        />
      </Suspense>
    );
  }

  if (page === 'expired-link') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <ExpiredLinkPage onRequestNewLink={() => setPage('landing')} />
      </Suspense>
    );
  }

  if (page === 'view-result' && viewingResultId) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <ResultsPage
          resultId={viewingResultId}
          onBack={() => setPage('dashboard')}
        />
      </Suspense>
    );
  }

  if (page === 'messages') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <div className="h-screen flex flex-col bg-black">
          <div className="flex-1" style={{ height: 'calc(100vh - 80px)' }}>
            <MessagesPage
              onNavigateToDiscovery={() => setPage('discovery')}
              onNavigate={(newPage) => setPage(newPage as Page)}
            />
          </div>
          <BottomNav currentPage="messages" onNavigate={handleNavigate} />
        </div>
      </Suspense>
    );
  }

  if (page === 'discovery') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <MatchesPage
          onViewProfile={(userId) => {}}
          onStartChat={(userId) => {
            setPage('messages');
          }}
          onBackToDiscover={() => setPage('swipe')}
        />
        <BottomNav currentPage="discovery" onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  if (page === 'premium') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <SubscriptionPage
          onBack={() => {
            startTransition(() => setPage('profile'));
          }}
        />
        <BottomNav currentPage="profile" onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  if (page === 'search') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <SearchPage onNavigate={(p, data) => {
          setPage(p as Page);
          if (data?.conversationId) {
            // Navigate to messages with conversation ID
          }
        }} />
        <BottomNav currentPage="discovery" onNavigate={handleNavigate} />
      </Suspense>
    );
  }



  if (page === 'live-stream' && currentLiveId) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LiveStreamPage
          liveId={currentLiveId}
          onClose={() => {
            setCurrentLiveId(null);
            setPage('live-feed');
          }}
        />
      </Suspense>
    );
  }

  if (page === 'astro') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <AstroPage onBack={() => setPage('constellation')} onNavigate={(page: string) => setPage(page as Page)} />
        <BottomNav currentPage="astro" onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  if (page === 'constellation' || page === 'univers') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <EmailVerificationBanner />
        <UniversSimple />
        <BottomNav currentPage="univers" onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  if (page === 'settings') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <SettingsPage onBack={() => setPage('profile')} onNavigate={(page: string) => setPage(page as Page)} />
        <BottomNav currentPage="profile" onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  if (page === 'my-subscription') {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (!user) {
      setPage('landing');
      return <LoadingSpinner />;
    }

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <MySubscription userId={user.id} onBack={() => setPage('profile')} onNavigate={(page: string) => setPage(page as Page)} />
        <BottomNav currentPage="profile" onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  if (page === 'achievements') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <AchievementsPage onBack={() => setPage('profile')} />
        <BottomNav currentPage="profile" onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  if (page === 'referral') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <ReferralPage onBack={() => setPage('profile')} />
        <BottomNav currentPage="profile" onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  if (page === 'live') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <AppHeader onMatchesClick={() => setPage('discovery')} />
        <div className="h-screen flex flex-col bg-black">
          <div className="flex-1 overflow-auto no-scrollbar" style={{ height: 'calc(100vh - 80px)' }}>
            <LiveFeedPage
              onNavigate={(newPage, data) => {
                if (newPage === 'live-stream' && data?.liveId) {
                  setCurrentLiveId(data.liveId);
                  setPage('live-stream');
                } else {
                  setPage(newPage as Page);
                }
              }}
            />
          </div>
          <BottomNav currentPage="live" onNavigate={handleNavigate} />
        </div>
      </Suspense>
    );
  }

  if (page === 'start-live') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <StartLivePage
          onBack={() => setPage('live-feed')}
          onLiveStarted={(liveId) => {
            setCurrentLiveId(liveId);
            setPage('live-stream');
          }}
        />
      </Suspense>
    );
  }

  if (page === 'creator-dashboard') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <CreatorDashboard onBack={() => setPage('live-feed')} />
        <BottomNav currentPage="live-feed" onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  if (page === 'payment-success') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <PaymentSuccessPage onNavigate={(p) => setPage(p as Page)} />
      </Suspense>
    );
  }

  if (page === 'chat') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AgeGate />
        <CookieBanner />
        <AstraChat onNavigate={(newPage) => setPage(newPage as Page)} />
        {showBottomNav && (
          <BottomNav currentPage="chat" onNavigate={handleNavigate} />
        )}
      </Suspense>
    );
  }

  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-white">Page non trouvée</p>
        </div>
      </Suspense>
    </>
  );
}

export default App;
