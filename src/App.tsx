import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import MainLayout from './components/layout/MainLayout';
import LandingPage from './pages/LandingPage-ORIGINAL';
import OnboardingPage from './pages/OnboardingPage';
import UniversPage from './pages/UniversPage';
import MessagesPage from './pages/MessagesPage';
import AstraPage from './pages/AstraPage';
import AstroPage from './pages/AstroPage';
import ProfilePage from './pages/ProfilePage';
import SubscriptionPage from './pages/SubscriptionPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, profile, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center cosmic-gradient">
        <div className="text-2xl font-display animate-pulse">Chargement...</div>
      </div>
    );
  }

  // Pas connecté → Landing page
  if (!user) {
    return (
      <LandingPage
        onGetStarted={() => setShowAuth(true)}
        onLogin={() => setShowAuth(true)}
        onNavigateLegal={(page) => console.log('Navigate to', page)}
        onNavigate={(page) => console.log('Navigate to', page)}
      />
    );
  }

  // Connecté mais pas de profil → Aller à l'onboarding pour créer le profil
  if (!profile) {
    return <OnboardingPage />;
  }

  // Onboarding pas complété
  if (profile.onboarding_completed !== true) {
    return <OnboardingPage />;
  }

  // App principale
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/univers" replace />} />
        <Route path="/univers" element={<UniversPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/astra" element={<AstraPage />} />
        <Route path="/astro" element={<AstroPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </MainLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
