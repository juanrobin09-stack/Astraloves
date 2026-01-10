import { useState, useEffect } from 'react';
import { Sparkles, Heart, Star, Users, Zap } from 'lucide-react';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onNavigateLegal?: (page: 'politique-confidentialite' | 'conditions-generales-de-vente') => void;
  onNavigate?: (page: string) => void;
}

export default function LandingPage({ onGetStarted, onLogin, onNavigateLegal, onNavigate }: LandingPageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="animated-background-red relative">
      {/* Twinkling Stars */}
      <div className="stars-container">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star-particle"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="px-4 pt-12 pb-32 relative z-10">
        <div className="max-w-6xl w-full mx-auto">
          <div className="text-center">
            <div className="inline-block mb-4 sm:mb-6" style={{ opacity: 1 }}>
              <div className="relative star-logo-container">
                {/* Étoile rouge vive avec effet lumineux intense */}
                <Star className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 star-rotate filter drop-shadow-[0_0_15px_#dc2626] drop-shadow-[0_0_30px_#dc2626] drop-shadow-[0_0_45px_#dc2626]" fill="#dc2626" strokeWidth={0} style={{ filter: 'brightness(1.3) saturate(1.5)' }} />
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 text-white px-4" style={{ opacity: 1 }}>
              ASTRA
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-2 sm:mb-4 font-light px-4" style={{ opacity: 1 }}>
              Trouvez votre âme sœur
            </p>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-red-400 mb-8 sm:mb-12 px-4" style={{ opacity: 1 }}>
              grâce aux étoiles ✨
            </p>

            <div className="flex justify-center items-center mb-8 sm:mb-12">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-64 lg:h-64 mx-auto">
                <svg viewBox="0 0 200 200" className="w-full h-full block mx-auto">
                  <defs>
                    <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>

                  {[
                    { cx: 100, cy: 50, r: 3 },
                    { cx: 60, cy: 80, r: 2 },
                    { cx: 140, cy: 80, r: 2 },
                    { cx: 50, cy: 120, r: 2 },
                    { cx: 150, cy: 120, r: 2 },
                    { cx: 100, cy: 160, r: 3 },
                    { cx: 75, cy: 100, r: 2 },
                    { cx: 125, cy: 100, r: 2 },
                  ].map((star, i) => (
                    <g key={i}>
                      <circle
                        cx={star.cx}
                        cy={star.cy}
                        r={star.r}
                        fill="url(#heartGradient)"
                        className="animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                      <circle
                        cx={star.cx}
                        cy={star.cy}
                        r={star.r * 2}
                        fill="url(#heartGradient)"
                        opacity="0.2"
                        className="animate-ping"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    </g>
                  ))}

                  <path
                    d="M 100,50 L 60,80 L 50,120 L 100,160 L 150,120 L 140,80 Z"
                    stroke="url(#heartGradient)"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.5"
                    className="animate-pulse"
                  />
                </svg>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8 max-w-4xl mx-auto">
              {[
                {
                  icon: Heart,
                  title: 'Matching astrologique intelligent',
                  desc: 'Compatibilité basée sur votre thème astral',
                },
                {
                  icon: Zap,
                  title: 'Analyses IA personnalisées',
                  desc: 'Conseils sur-mesure par intelligence artificielle',
                },
                {
                  icon: Users,
                  title: 'Communauté bienveillante',
                  desc: 'Des milliers d\'âmes connectées',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`feature-card ${
                    hoveredFeature === i ? 'feature-card-hover' : ''
                  }`}
                  style={{ opacity: 1 }}
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <feature.icon className="w-12 h-12 text-red-500 mx-auto mb-4 feature-icon" />
                  <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="cta-buttons mb-12">
              <button
                onClick={() => setShowSignupForm(true)}
                className="btn-primary-astra btn-pulse"
              >
                <span className="btn-icon">⭐</span>
                Créer mon compte
              </button>

              <button
                onClick={() => setShowLoginForm(true)}
                className="btn-secondary-astra"
              >
                J'ai déjà un compte
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 text-center text-gray-600 text-sm">
          <div className="flex flex-wrap justify-center items-center gap-4 mb-2">
            <button
              className="hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer text-gray-600 text-sm"
              onClick={() => onNavigateLegal?.('politique-confidentialite')}
            >
              Politique de confidentialité
            </button>
            <span className="text-gray-700">•</span>
            <button
              className="hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer text-gray-600 text-sm"
              onClick={() => onNavigateLegal?.('conditions-generales-de-vente')}
            >
              CGV
            </button>
          </div>
          <p>© 2025 Astra • Tous droits réservés</p>
          <p className="text-gray-700 text-xs mt-2">Service de divertissement • 18+ • Pas de conseil médical</p>
        </footer>
      </div>

      {showLoginForm && (
        <LoginForm
          onClose={() => setShowLoginForm(false)}
          onSwitchToSignup={() => {
            setShowLoginForm(false);
            setShowSignupForm(true);
          }}
        />
      )}

      {showSignupForm && (
        <SignupForm
          onClose={() => setShowSignupForm(false)}
          onSwitchToLogin={() => {
            setShowSignupForm(false);
            setShowLoginForm(true);
          }}
        />
      )}
    </div>
  );
}
