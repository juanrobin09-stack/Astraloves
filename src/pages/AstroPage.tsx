import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import {
  Sun, Moon, Sunrise, Flame, Mountain, Wind, Droplets,
  Sparkles, Crown, Lock, ChevronRight, Star, Heart, Zap
} from 'lucide-react';

// Zodiac data
const ZODIAC_DATA: Record<string, { symbol: string; element: string; ruling: string; trait: string; color: string }> = {
  aries: { symbol: '♈', element: 'Feu', ruling: 'Mars', trait: 'Audacieux', color: '#E63946' },
  taurus: { symbol: '♉', element: 'Terre', ruling: 'Vénus', trait: 'Déterminé', color: '#10B981' },
  gemini: { symbol: '♊', element: 'Air', ruling: 'Mercure', trait: 'Curieux', color: '#60A5FA' },
  cancer: { symbol: '♋', element: 'Eau', ruling: 'Lune', trait: 'Protecteur', color: '#8B5CF6' },
  leo: { symbol: '♌', element: 'Feu', ruling: 'Soleil', trait: 'Charismatique', color: '#FFD700' },
  virgo: { symbol: '♍', element: 'Terre', ruling: 'Mercure', trait: 'Analytique', color: '#10B981' },
  libra: { symbol: '♎', element: 'Air', ruling: 'Vénus', trait: 'Harmonieux', color: '#F472B6' },
  scorpio: { symbol: '♏', element: 'Eau', ruling: 'Pluton', trait: 'Intense', color: '#E63946' },
  sagittarius: { symbol: '♐', element: 'Feu', ruling: 'Jupiter', trait: 'Aventurier', color: '#F97316' },
  capricorn: { symbol: '♑', element: 'Terre', ruling: 'Saturne', trait: 'Ambitieux', color: '#6B7280' },
  aquarius: { symbol: '♒', element: 'Air', ruling: 'Uranus', trait: 'Visionnaire', color: '#06B6D4' },
  pisces: { symbol: '♓', element: 'Eau', ruling: 'Neptune', trait: 'Intuitif', color: '#A78BFA' },
};

const ELEMENT_ICONS = {
  Feu: Flame,
  Terre: Mountain,
  Air: Wind,
  Eau: Droplets,
};

const DAILY_MESSAGES = [
  "Les étoiles s'alignent en ta faveur aujourd'hui. Ose exprimer tes désirs.",
  "Une rencontre inattendue pourrait changer ta perspective. Reste ouvert.",
  "L'énergie cosmique amplifie ton magnétisme. C'est le moment de briller.",
  "Écoute ton intuition, elle te guide vers ta destinée amoureuse.",
  "Les astres favorisent les connexions profondes. Sois authentique.",
];

export default function AstroPage() {
  const { profile } = useAuthStore();
  const { tier, isPremium, isElite } = useSubscriptionStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'horoscope' | 'compatibility'>('profile');

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-cosmic-pulse text-4xl">✨</div>
      </div>
    );
  }

  const sunData = ZODIAC_DATA[profile.sun_sign?.toLowerCase()] || ZODIAC_DATA.aries;
  const moonData = ZODIAC_DATA[profile.moon_sign?.toLowerCase()] || ZODIAC_DATA.cancer;
  const ascData = ZODIAC_DATA[profile.ascendant_sign?.toLowerCase()] || ZODIAC_DATA.leo;
  const ElementIcon = ELEMENT_ICONS[sunData.element as keyof typeof ELEMENT_ICONS] || Flame;

  const dailyMessage = DAILY_MESSAGES[new Date().getDate() % DAILY_MESSAGES.length];

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-black via-[#0a0000] to-black">
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden">
        {/* Animated Stars Background */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Red Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial from-cosmic-red/20 via-cosmic-red/5 to-transparent blur-3xl" />

        {/* Content */}
        <div className="relative z-10 px-6 pt-8 pb-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cosmic-red/10 border border-cosmic-red/30 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-cosmic-red" />
              <span className="text-sm text-cosmic-red font-medium">Ton Univers Astral</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
              <span className="bg-gradient-to-r from-white via-cosmic-red-light to-white bg-clip-text text-transparent">
                {profile.first_name}
              </span>
            </h1>
            <p className="text-white/60 text-lg">
              {sunData.symbol} {profile.sun_sign} • {sunData.trait}
            </p>
          </motion.div>

          {/* Big Three Cards */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {[
              { label: 'Soleil', sign: profile.sun_sign, data: sunData, icon: Sun, desc: 'Ton essence' },
              { label: 'Lune', sign: profile.moon_sign, data: moonData, icon: Moon, desc: 'Tes émotions' },
              { label: 'Ascendant', sign: profile.ascendant_sign, data: ascData, icon: Sunrise, desc: 'Ton image' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center hover:border-cosmic-red/50 transition-colors"
              >
                <div
                  className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${item.data.color}20`, border: `1px solid ${item.data.color}40` }}
                >
                  <item.icon className="w-6 h-6" style={{ color: item.data.color }} />
                </div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-2xl mb-1">{item.data.symbol}</p>
                <p className="text-sm font-medium">{item.sign}</p>
                <p className="text-xs text-white/40 mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-y border-white/10 px-6 py-3">
        <div className="flex gap-2 max-w-lg mx-auto">
          {[
            { id: 'profile', label: 'Profil Astral', icon: Star },
            { id: 'horoscope', label: 'Horoscope', icon: Sparkles },
            { id: 'compatibility', label: 'Compatibilité', icon: Heart },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-cosmic-red text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Element & Energy */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ElementIcon className="w-5 h-5 text-cosmic-red" />
                  Ton Élément Dominant
                </h3>
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${sunData.color}20`, border: `2px solid ${sunData.color}` }}
                  >
                    <ElementIcon className="w-10 h-10" style={{ color: sunData.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{sunData.element}</p>
                    <p className="text-white/60">
                      {sunData.element === 'Feu' && 'Passion, énergie, action'}
                      {sunData.element === 'Terre' && 'Stabilité, sensualité, loyauté'}
                      {sunData.element === 'Air' && 'Communication, intellect, liberté'}
                      {sunData.element === 'Eau' && 'Émotions, intuition, profondeur'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Energy Gauges */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Répartition Énergétique</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Feu', value: profile.energy_fire || 25, color: '#E63946', icon: Flame },
                    { name: 'Terre', value: profile.energy_earth || 25, color: '#10B981', icon: Mountain },
                    { name: 'Air', value: profile.energy_air || 25, color: '#60A5FA', icon: Wind },
                    { name: 'Eau', value: profile.energy_water || 25, color: '#8B5CF6', icon: Droplets },
                  ].map((energy) => (
                    <div key={energy.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <energy.icon className="w-4 h-4" style={{ color: energy.color }} />
                          <span className="text-sm font-medium">{energy.name}</span>
                        </div>
                        <span className="text-sm text-white/60">{energy.value}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${energy.value}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: energy.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ruling Planet */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Planète Dominante</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cosmic-red to-cosmic-red-dark flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{sunData.ruling}</p>
                    <p className="text-white/60 text-sm">
                      Influence ta personnalité et tes motivations profondes
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'horoscope' && (
            <motion.div
              key="horoscope"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Daily Horoscope */}
              <div className="bg-gradient-to-br from-cosmic-red/20 to-transparent border border-cosmic-red/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cosmic-red/20 flex items-center justify-center">
                    <Sun className="w-6 h-6 text-cosmic-red" />
                  </div>
                  <div>
                    <p className="text-sm text-cosmic-red font-medium">Horoscope du Jour</p>
                    <p className="text-xs text-white/50">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
                <p className="text-lg leading-relaxed">{dailyMessage}</p>
              </div>

              {/* Love Forecast */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    Prévision Amoureuse
                  </h3>
                  {!isPremium && <Lock className="w-4 h-4 text-white/40" />}
                </div>
                {isPremium ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Énergie romantique</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'text-cosmic-gold fill-cosmic-gold' : 'text-white/20'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-white/80">
                      Vénus transite dans ton secteur relationnel. Les connexions profondes sont favorisées cette semaine.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Lock className="w-8 h-8 mx-auto mb-3 text-white/30" />
                    <p className="text-white/50 mb-4">Réservé aux membres Premium</p>
                    <button className="px-6 py-2 bg-cosmic-red hover:bg-cosmic-red-light rounded-xl text-sm font-medium transition-colors">
                      Débloquer
                    </button>
                  </div>
                )}
              </div>

              {/* Weekly Preview */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Aperçu de la Semaine</h3>
                  {!isPremium && <Lock className="w-4 h-4 text-white/40" />}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => {
                    const isToday = i === (new Date().getDay() + 6) % 7;
                    const energy = isPremium ? [70, 85, 60, 90, 75, 95, 80][i] : 0;
                    return (
                      <div key={i} className="text-center">
                        <p className={`text-xs mb-2 ${isToday ? 'text-cosmic-red font-bold' : 'text-white/40'}`}>{day}</p>
                        <div className="h-16 bg-white/5 rounded-lg overflow-hidden relative">
                          {isPremium ? (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${energy}%` }}
                              transition={{ duration: 0.5, delay: i * 0.1 }}
                              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cosmic-red to-cosmic-red-light"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Lock className="w-3 h-3 text-white/20" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'compatibility' && (
            <motion.div
              key="compatibility"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Most Compatible */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-cosmic-red" />
                  Meilleure Compatibilité
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {(() => {
                    const compatibleSigns = {
                      Feu: ['aries', 'leo', 'sagittarius'],
                      Terre: ['taurus', 'virgo', 'capricorn'],
                      Air: ['gemini', 'libra', 'aquarius'],
                      Eau: ['cancer', 'scorpio', 'pisces'],
                    };
                    const myElement = sunData.element;
                    const bestMatches = myElement === 'Feu' ? [...compatibleSigns.Feu, ...compatibleSigns.Air] :
                      myElement === 'Terre' ? [...compatibleSigns.Terre, ...compatibleSigns.Eau] :
                      myElement === 'Air' ? [...compatibleSigns.Air, ...compatibleSigns.Feu] :
                      [...compatibleSigns.Eau, ...compatibleSigns.Terre];

                    return bestMatches.slice(0, 4).map((sign) => {
                      const data = ZODIAC_DATA[sign];
                      return (
                        <div key={sign} className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${data.color}20` }}
                          >
                            {data.symbol}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{sign}</p>
                            <p className="text-xs text-white/50">{data.element}</p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Synastry (Elite Only) */}
              <div className="bg-gradient-to-br from-cosmic-gold/10 to-transparent border border-cosmic-gold/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-6 h-6 text-cosmic-gold" />
                  <div>
                    <h3 className="text-lg font-bold text-cosmic-gold">Synastrie Complète</h3>
                    <p className="text-xs text-white/50">Analyse détaillée avec tes matchs</p>
                  </div>
                </div>
                {isElite ? (
                  <div className="space-y-4">
                    <p className="text-white/80">
                      Compare ton thème natal complet avec celui de tes matchs pour découvrir vos dynamiques relationnelles.
                    </p>
                    <button className="w-full py-3 bg-cosmic-gold/20 border border-cosmic-gold/50 text-cosmic-gold rounded-xl font-medium hover:bg-cosmic-gold/30 transition-colors">
                      Voir les Synastries
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Lock className="w-8 h-8 mx-auto mb-3 text-cosmic-gold/50" />
                    <p className="text-white/50 mb-4">Exclusif aux membres Elite</p>
                    <button className="px-6 py-2 bg-cosmic-gold text-black rounded-xl text-sm font-bold hover:bg-cosmic-gold/90 transition-colors">
                      Devenir Elite
                    </button>
                  </div>
                )}
              </div>

              {/* Compatibility Tips */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Conseils de Compatibilité</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cosmic-red/20 flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-cosmic-red" />
                    </div>
                    <p className="text-white/80 text-sm">
                      En tant que signe de {sunData.element}, tu es naturellement attiré par les énergies {sunData.element === 'Feu' || sunData.element === 'Air' ? 'dynamiques et stimulantes' : 'profondes et stables'}.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cosmic-red/20 flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-cosmic-red" />
                    </div>
                    <p className="text-white/80 text-sm">
                      Ta Lune en {profile.moon_sign} recherche {moonData.element === 'Eau' ? 'la sécurité émotionnelle' : moonData.element === 'Feu' ? 'l\'aventure' : moonData.element === 'Terre' ? 'la stabilité' : 'la stimulation intellectuelle'}.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
