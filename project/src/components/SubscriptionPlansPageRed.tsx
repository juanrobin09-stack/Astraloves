import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface Plan {
  id: string;
  name: string;
  icon: string;
  price: number;
  priceLabel: string;
  recommended: boolean;
  borderColor: string;
  glowColor: string;
  badgeText?: string;
  features: string[];
  buttonText: string;
  buttonStyle: any;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Étoile Naissante',
    icon: '🌑',
    price: 0,
    priceLabel: '0€',
    recommended: false,
    borderColor: '#333',
    glowColor: 'transparent',
    features: [
      '💫 10 signaux cosmiques par jour',
      '🤖 10 messages Astra IA par jour',
      '💬 20 messages matchs par jour',
      '🔮 Horoscope du jour basique',
      '📷 5 photos de profil max',
      '📝 Bio 200 caractères max',
      '⭐ Compatibilité cosmique basique',
      '🌌 Vision limitée (15 étoiles)',
      '❌ Pas de boost de visibilité',
      '❌ Profils floutés',
      '❌ Pas de Super Nova',
    ],
    buttonText: 'Plan actuel',
    buttonStyle: {
      background: 'rgba(255,255,255,0.1)',
      color: '#999',
    },
  },
  {
    id: 'premium',
    name: 'Étoile Brillante',
    icon: '💎',
    price: 9.99,
    priceLabel: '9,99€',
    recommended: true,
    badgeText: '⭐ Recommandé',
    borderColor: '#EF4444',
    glowColor: '#EF4444',
    features: [
      '∞ Signaux cosmiques illimités',
      '🌟 1 Super Nova par jour',
      '🤖 40 messages Astra IA par jour',
      '💬 Messages matchs illimités',
      '👀 Voir qui t\'a envoyé un signal',
      '🌌 Vision étendue (50 étoiles)',
      '🎯 Filtres avancés (âge, ville, signe)',
      '🚀 Boost de visibilité x3',
      '💕 Matchs 92% compatibilité IA',
      '💡 Conseils de profil par IA',
      '💬 Ice-breakers générés par Astra',
      '🔮 Horoscope avancé détaillé',
      '📷 10 photos de profil max',
      '📝 Bio 500 caractères max',
      '💎 Badge Premium visible',
      '✨ Ton étoile brille 2x plus',
    ],
    buttonText: 'Choisir Premium',
    buttonStyle: {
      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
      color: '#fff',
      boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5)',
    },
  },
  {
    id: 'elite',
    name: 'Supernova',
    icon: '👑',
    price: 14.99,
    priceLabel: '14,99€',
    recommended: false,
    borderColor: '#FFD700',
    glowColor: '#FFD700',
    features: [
      '∞ Signaux cosmiques ILLIMITÉS',
      '🌟 5 Super Nova par jour',
      '🤖 65 messages Astra IA Ultra par jour',
      '👑 Coach IA Pro personnalisé',
      '💬 Messages matchs illimités',
      '👀 Voir qui + QUAND signal envoyé',
      '🌌 Vision TOTALE de l\'univers (∞)',
      '🎯 Tous les filtres + "En ligne"',
      '⏪ Rembobinage (revoir étoiles passées)',
      '👻 Mode incognito premium',
      '👑 Badge Elite exclusif + Top 1%',
      '📷 20 photos de profil max',
      '🔥 Bio illimitée',
      '🚀 Boost Elite x10 de visibilité',
      '❤️ 10 super likes par jour',
      '♈ Filtres astro avancés',
      '🌌 Thème astral complet détaillé',
      '🔮 Compatibilité cosmique + Prédictions',
      '✨ Aura dorée animée sur ton étoile',
      '💫 Effet étoile filante (priorité)',
      '🤖 Astra écrit tes premiers messages',
    ],
    buttonText: 'Choisir Premium+ Elite',
    buttonStyle: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000',
      boxShadow: '0 4px 20px rgba(255, 215, 0, 0.5)',
    },
  },
];

export default function SubscriptionPlansPageRed() {
  const [selectedPlan, setSelectedPlan] = useState('free');

  const backgroundStars = useMemo(() =>
    Array.from({ length: 150 }, (_, i) => ({
      id: `star-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      delay: Math.random() * 3,
      color: Math.random() > 0.4 ? '#fff' : '#EF4444',
    }))
  , []);

  const floatingParticles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: `particle-${i}`,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
    }))
  , []);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden py-20 px-4"
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, #1a0a0a 0%, #0d0505 50%, #0a0a0a 100%)',
      }}
    >
      {backgroundStars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            boxShadow: star.color === '#EF4444' ? '0 0 4px #EF4444' : '0 0 2px #fff',
          }}
          animate={{
            opacity: [star.opacity, star.opacity * 0.3, star.opacity],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2 + star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <motion.div
        className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
        style={{
          background: 'conic-gradient(from 0deg, #EF4444 0%, #DC2626 25%, #991B1B 50%, #DC2626 75%, #EF4444 100%)',
          filter: 'blur(100px)',
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {floatingParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full bg-red-500/50"
          style={{
            left: `${particle.x}%`,
            bottom: '-10px',
          }}
          animate={{
            y: [0, -1000],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeOut',
          }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1
            className="text-5xl md:text-6xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #EF4444, #DC2626, #991B1B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(239, 68, 68, 0.5)',
            }}
          >
            Choisis ton Destin Cosmique
          </h1>
          <p className="text-white/70 text-lg md:text-xl">
            Débloque tout le potentiel de l'univers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative"
            >
              {plan.recommended && (
                <motion.div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full text-sm font-bold z-10"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    color: '#fff',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.8)',
                  }}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(239, 68, 68, 0.8)',
                      '0 0 30px rgba(239, 68, 68, 1)',
                      '0 0 20px rgba(239, 68, 68, 0.8)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {plan.badgeText}
                </motion.div>
              )}

              <div
                className="relative rounded-2xl p-8 h-full backdrop-blur-md overflow-hidden"
                style={{
                  background: plan.id === 'elite'
                    ? 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(20,10,0,0.9))'
                    : plan.id === 'premium'
                    ? 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(20,0,0,0.8))'
                    : 'rgba(0,0,0,0.7)',
                  border: `2px solid ${plan.borderColor}`,
                  boxShadow: plan.recommended
                    ? `0 0 30px ${plan.glowColor}88, inset 0 0 30px ${plan.glowColor}22`
                    : `0 0 10px ${plan.glowColor}44`,
                }}
              >
                {plan.id === 'elite' && (
                  <>
                    {Array.from({ length: 15 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-yellow-400/70"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1.5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </>
                )}

                {plan.recommended && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${plan.glowColor}22, transparent)`,
                    }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                <div className="relative z-10">
                  <div className="text-6xl mb-4 text-center">{plan.icon}</div>
                  <h3
                    className="text-2xl font-bold mb-2 text-center"
                    style={{
                      color: plan.id === 'elite' ? '#FFD700' : plan.id === 'premium' ? '#EF4444' : '#999',
                    }}
                  >
                    {plan.name}
                  </h3>

                  <div className="text-center mb-6">
                    <span
                      className="text-5xl font-bold"
                      style={{
                        color: plan.id === 'elite' ? '#FFD700' : plan.id === 'premium' ? '#EF4444' : '#fff',
                      }}
                    >
                      {plan.priceLabel}
                    </span>
                    {plan.price > 0 && <span className="text-white/50 text-lg">/mois</span>}
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 + i * 0.03 }}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-4 rounded-xl font-bold text-lg transition-all"
                    style={plan.buttonStyle}
                  >
                    {plan.buttonText}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-white/50 text-sm"
        >
          <p>Tous les abonnements peuvent être annulés à tout moment</p>
          <p className="mt-2">Paiement sécurisé • Sans engagement</p>
        </motion.div>
      </div>

      <motion.div
        className="absolute"
        initial={{ x: -100, y: -100, opacity: 0 }}
        animate={{
          x: ['0%', '100vw'],
          y: ['0vh', '100vh'],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 7,
          ease: 'linear',
        }}
      >
        <div
          className="w-2 h-24 rounded-full"
          style={{
            background: 'linear-gradient(180deg, transparent, #EF4444, transparent)',
            boxShadow: '0 0 10px #EF4444',
          }}
        />
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 md:left-0 md:top-0 md:bottom-0 md:w-20 md:right-auto z-50">
        <div
          className="h-16 md:h-full flex md:flex-col justify-around items-center border-t md:border-t-0 md:border-r border-red-600/30 backdrop-blur-md"
          style={{ background: 'rgba(0,0,0,0.9)' }}
        >
          {[
            { icon: '🌌', label: 'Univers', active: false },
            { icon: '💬', label: 'Messages', active: false },
            { icon: '🤖', label: 'Astra', active: false },
            { icon: '🔮', label: 'Astro', active: false },
            { icon: '👤', label: 'Profil', active: false },
          ].map((item, idx) => (
            <motion.button
              key={idx}
              className="flex flex-col items-center justify-center gap-1 py-2 px-3 md:py-4 relative"
              whileTap={{ scale: 0.9 }}
            >
              <span
                className="text-2xl"
                style={{
                  filter: item.active ? 'drop-shadow(0 0 8px #EF4444)' : 'none',
                }}
              >
                {item.icon}
              </span>
              <span
                className="text-[10px] md:text-xs font-medium hidden sm:block"
                style={{ color: item.active ? '#EF4444' : '#666' }}
              >
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
