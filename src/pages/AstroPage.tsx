import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { dailyHoroscopeService, DailyHoroscope, WeeklyForecast } from '@/services/astro/dailyHoroscopeService';
import {
  Sun, Moon, Sunrise, Flame, Mountain, Wind, Droplets,
  Sparkles, Crown, Lock, Star, Heart, Zap, RefreshCw,
  TrendingUp, Shield, Eye
} from 'lucide-react';

// Zodiac data
const ZODIAC_DATA: Record<string, { symbol: string; element: string; ruling: string; trait: string; color: string; dates: string }> = {
  aries: { symbol: '♈', element: 'Feu', ruling: 'Mars', trait: 'Audacieux', color: '#E63946', dates: '21 mars - 19 avril' },
  taurus: { symbol: '♉', element: 'Terre', ruling: 'Vénus', trait: 'Déterminé', color: '#10B981', dates: '20 avril - 20 mai' },
  gemini: { symbol: '♊', element: 'Air', ruling: 'Mercure', trait: 'Curieux', color: '#60A5FA', dates: '21 mai - 20 juin' },
  cancer: { symbol: '♋', element: 'Eau', ruling: 'Lune', trait: 'Protecteur', color: '#8B5CF6', dates: '21 juin - 22 juillet' },
  leo: { symbol: '♌', element: 'Feu', ruling: 'Soleil', trait: 'Charismatique', color: '#FFD700', dates: '23 juillet - 22 août' },
  virgo: { symbol: '♍', element: 'Terre', ruling: 'Mercure', trait: 'Analytique', color: '#10B981', dates: '23 août - 22 sept' },
  libra: { symbol: '♎', element: 'Air', ruling: 'Vénus', trait: 'Harmonieux', color: '#F472B6', dates: '23 sept - 22 oct' },
  scorpio: { symbol: '♏', element: 'Eau', ruling: 'Pluton', trait: 'Intense', color: '#E63946', dates: '23 oct - 21 nov' },
  sagittarius: { symbol: '♐', element: 'Feu', ruling: 'Jupiter', trait: 'Aventurier', color: '#F97316', dates: '22 nov - 21 déc' },
  capricorn: { symbol: '♑', element: 'Terre', ruling: 'Saturne', trait: 'Ambitieux', color: '#6B7280', dates: '22 déc - 19 jan' },
  aquarius: { symbol: '♒', element: 'Air', ruling: 'Uranus', trait: 'Visionnaire', color: '#06B6D4', dates: '20 jan - 18 fév' },
  pisces: { symbol: '♓', element: 'Eau', ruling: 'Neptune', trait: 'Intuitif', color: '#A78BFA', dates: '19 fév - 20 mars' },
};

const ELEMENT_ICONS = {
  Feu: Flame,
  Terre: Mountain,
  Air: Wind,
  Eau: Droplets,
};

export default function AstroPage() {
  const { profile } = useAuthStore();
  const { tier, isPremium, isElite } = useSubscriptionStore();
  const [activeTab, setActiveTab] = useState<'horoscope' | 'profile' | 'compatibility'>('horoscope');
  const [dailyHoroscope, setDailyHoroscope] = useState<DailyHoroscope | null>(null);
  const [weeklyForecast, setWeeklyForecast] = useState<WeeklyForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sunData = ZODIAC_DATA[profile?.sun_sign?.toLowerCase() || 'aries'] || ZODIAC_DATA.aries;
  const moonData = ZODIAC_DATA[profile?.moon_sign?.toLowerCase() || 'cancer'] || ZODIAC_DATA.cancer;
  const ascData = ZODIAC_DATA[profile?.ascendant_sign?.toLowerCase() || 'leo'] || ZODIAC_DATA.leo;
  const ElementIcon = ELEMENT_ICONS[sunData.element as keyof typeof ELEMENT_ICONS] || Flame;

  // Load horoscope on mount
  useEffect(() => {
    loadHoroscope();
  }, [profile?.sun_sign]);

  const loadHoroscope = async () => {
    if (!profile?.sun_sign) return;

    setIsLoading(true);
    try {
      const [daily, weekly] = await Promise.all([
        dailyHoroscopeService.getDailyHoroscope(
          profile.sun_sign,
          profile.moon_sign || undefined,
          profile.ascendant_sign || undefined
        ),
        isPremium ? dailyHoroscopeService.getWeeklyForecast(
          profile.sun_sign,
          profile.moon_sign || undefined
        ) : Promise.resolve(null),
      ]);

      setDailyHoroscope(daily);
      setWeeklyForecast(weekly);
    } catch (error) {
      console.error('Error loading horoscope:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadHoroscope();
    setIsRefreshing(false);
  };

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <Star className="w-12 h-12 text-cosmic-red animate-pulse" />
      </div>
    );
  }

  const todayDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header with Sign Info */}
      <div className="flex-shrink-0 bg-gradient-to-b from-[#1a0000] to-black">
        <div className="px-5 pt-6 pb-4">
          {/* User Sign Card */}
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ backgroundColor: `${sunData.color}20`, border: `2px solid ${sunData.color}` }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {sunData.symbol}
            </motion.div>
            <div className="flex-1">
              <p className="text-white/50 text-sm">{todayDate}</p>
              <h1 className="text-2xl font-bold capitalize">{profile.sun_sign}</h1>
              <p className="text-white/60 text-sm">{sunData.dates}</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"
            >
              <RefreshCw className={`w-5 h-5 text-white/60 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'horoscope', label: 'Horoscope', icon: Sparkles },
              { id: 'profile', label: 'Profil', icon: Star },
              { id: 'compatibility', label: 'Amour', icon: Heart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-cosmic-red text-white'
                    : 'bg-white/5 text-white/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* HOROSCOPE TAB */}
          {activeTab === 'horoscope' && (
            <motion.div
              key="horoscope"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-5 py-6 space-y-5"
            >
              {/* Energy Level */}
              {dailyHoroscope && (
                <div className="bg-gradient-to-r from-cosmic-red/20 to-pink-500/10 border border-cosmic-red/30 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-cosmic-red" />
                      <span className="font-semibold">Énergie du jour</span>
                    </div>
                    <span className="text-2xl font-bold text-cosmic-red">{dailyHoroscope.energy}%</span>
                  </div>
                  <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cosmic-red to-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${dailyHoroscope.energy}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <p className="text-sm text-white/50 mt-2">
                    Nombre chanceux: <span className="text-cosmic-gold font-bold">{dailyHoroscope.luckyNumber}</span>
                  </p>
                </div>
              )}

              {/* Daily Message */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sun className="w-5 h-5 text-cosmic-gold" />
                  <h3 className="font-semibold">Message du jour</h3>
                </div>
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-white/10 rounded animate-pulse" />
                    <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
                  </div>
                ) : (
                  <p className="text-white/80 leading-relaxed">{dailyHoroscope?.general}</p>
                )}
              </div>

              {/* Love Forecast */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <h3 className="font-semibold">Prévision amoureuse</h3>
                  </div>
                </div>
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-white/10 rounded animate-pulse" />
                    <div className="h-4 bg-white/10 rounded animate-pulse w-2/3" />
                  </div>
                ) : (
                  <p className="text-white/80 leading-relaxed">{dailyHoroscope?.love}</p>
                )}
              </div>

              {/* Advice */}
              {dailyHoroscope?.advice && (
                <div className="bg-cosmic-gold/10 border border-cosmic-gold/30 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-cosmic-gold" />
                    <h3 className="font-semibold text-cosmic-gold">Conseil du jour</h3>
                  </div>
                  <p className="text-white/80">{dailyHoroscope.advice}</p>
                </div>
              )}

              {/* Warning (if exists) */}
              {dailyHoroscope?.warning && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-5 h-5 text-orange-400" />
                    <h3 className="font-semibold text-orange-400">Point d'attention</h3>
                  </div>
                  <p className="text-white/80">{dailyHoroscope.warning}</p>
                </div>
              )}

              {/* Weekly Forecast (Premium) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cosmic-red" />
                    <h3 className="font-semibold">Aperçu de la semaine</h3>
                  </div>
                  {!isPremium && <Lock className="w-4 h-4 text-white/30" />}
                </div>

                {isPremium && weeklyForecast ? (
                  <>
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {weeklyForecast.days.map((day, i) => {
                        const isToday = i === (new Date().getDay() + 6) % 7;
                        return (
                          <div key={i} className="text-center">
                            <p className={`text-[10px] mb-1 ${isToday ? 'text-cosmic-red font-bold' : 'text-white/40'}`}>
                              {day.day.slice(0, 2)}
                            </p>
                            <div className="h-12 bg-black/30 rounded-lg relative overflow-hidden">
                              <motion.div
                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cosmic-red to-pink-500"
                                initial={{ height: 0 }}
                                animate={{ height: `${day.energy}%` }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                              />
                            </div>
                            <p className="text-[8px] text-white/40 mt-1">{day.focus}</p>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-sm text-white/60">{weeklyForecast.summary}</p>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Lock className="w-8 h-8 mx-auto mb-3 text-white/20" />
                    <p className="text-white/40 text-sm mb-3">Disponible avec Premium</p>
                    <button className="px-4 py-2 bg-cosmic-red rounded-xl text-sm font-medium">
                      Débloquer
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-5 py-6 space-y-5"
            >
              {/* Big Three */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-semibold mb-4">Ton Trio Astral</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Soleil', sign: profile.sun_sign, data: sunData, icon: Sun, desc: 'Ton essence, ta personnalité profonde' },
                    { label: 'Lune', sign: profile.moon_sign, data: moonData, icon: Moon, desc: 'Tes émotions, ton monde intérieur' },
                    { label: 'Ascendant', sign: profile.ascendant_sign, data: ascData, icon: Sunrise, desc: 'Ton image, ta première impression' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${item.data.color}20`, border: `1px solid ${item.data.color}40` }}
                      >
                        <item.icon className="w-6 h-6" style={{ color: item.data.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.data.symbol}</span>
                          <span className="font-medium capitalize">{item.sign}</span>
                          <span className="text-xs text-white/40">({item.label})</span>
                        </div>
                        <p className="text-sm text-white/50">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Element */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-semibold mb-4">Élément Dominant</h3>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${sunData.color}20`, border: `2px solid ${sunData.color}` }}
                  >
                    <ElementIcon className="w-8 h-8" style={{ color: sunData.color }} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{sunData.element}</p>
                    <p className="text-sm text-white/60">
                      {sunData.element === 'Feu' && 'Passion, énergie, action, spontanéité'}
                      {sunData.element === 'Terre' && 'Stabilité, sensualité, loyauté, patience'}
                      {sunData.element === 'Air' && 'Communication, intellect, liberté, adaptabilité'}
                      {sunData.element === 'Eau' && 'Émotions, intuition, profondeur, empathie'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Energy Distribution */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-semibold mb-4">Répartition Énergétique</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Feu', value: profile.energy_fire || 25, color: '#E63946', icon: Flame },
                    { name: 'Terre', value: profile.energy_earth || 25, color: '#10B981', icon: Mountain },
                    { name: 'Air', value: profile.energy_air || 25, color: '#60A5FA', icon: Wind },
                    { name: 'Eau', value: profile.energy_water || 25, color: '#8B5CF6', icon: Droplets },
                  ].map((energy) => (
                    <div key={energy.name}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <energy.icon className="w-4 h-4" style={{ color: energy.color }} />
                          <span className="text-sm">{energy.name}</span>
                        </div>
                        <span className="text-sm font-medium">{energy.value}%</span>
                      </div>
                      <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${energy.value}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: energy.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ruling Planet */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-semibold mb-4">Planète Maîtresse</h3>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cosmic-red to-pink-600 flex items-center justify-center">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{sunData.ruling}</p>
                    <p className="text-sm text-white/60">Influence ta personnalité et tes motivations</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* COMPATIBILITY TAB */}
          {activeTab === 'compatibility' && (
            <motion.div
              key="compatibility"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-5 py-6 space-y-5"
            >
              {/* Best Matches */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Tes Meilleurs Matchs
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    const compatibleSigns = {
                      Feu: ['leo', 'sagittarius', 'aries', 'gemini', 'libra', 'aquarius'],
                      Terre: ['taurus', 'virgo', 'capricorn', 'cancer', 'scorpio', 'pisces'],
                      Air: ['gemini', 'libra', 'aquarius', 'aries', 'leo', 'sagittarius'],
                      Eau: ['cancer', 'scorpio', 'pisces', 'taurus', 'virgo', 'capricorn'],
                    };
                    const myElement = sunData.element;
                    const bestMatches = compatibleSigns[myElement as keyof typeof compatibleSigns] || compatibleSigns.Feu;

                    return bestMatches.slice(0, 4).map((sign) => {
                      const data = ZODIAC_DATA[sign];
                      return (
                        <div
                          key={sign}
                          className="bg-black/30 rounded-xl p-3 flex items-center gap-3"
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                            style={{ backgroundColor: `${data.color}20` }}
                          >
                            {data.symbol}
                          </div>
                          <div>
                            <p className="font-medium capitalize text-sm">{sign}</p>
                            <p className="text-xs text-white/40">{data.element}</p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Love Style */}
              <div className="bg-gradient-to-r from-pink-500/10 to-red-500/10 border border-pink-500/30 rounded-2xl p-5">
                <h3 className="font-semibold mb-3 text-pink-400">Ton Style Amoureux</h3>
                <p className="text-white/80 leading-relaxed">
                  {sunData.element === 'Feu' && "Tu aimes avec passion et intensité. Tu as besoin d'aventure et de stimulation dans tes relations. La routine t'ennuie."}
                  {sunData.element === 'Terre' && "Tu aimes de façon stable et loyale. La sécurité et le confort sont essentiels. Tu construis des relations durables."}
                  {sunData.element === 'Air' && "Tu aimes d'abord avec l'esprit. La connexion intellectuelle précède l'attraction physique. Tu as besoin de liberté."}
                  {sunData.element === 'Eau' && "Tu aimes profondément et intuitivement. L'intimité émotionnelle est ta priorité. Tu ressens tout intensément."}
                </p>
              </div>

              {/* Synastry (Elite) */}
              <div className="bg-gradient-to-br from-cosmic-gold/10 to-yellow-900/10 border border-cosmic-gold/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-5 h-5 text-cosmic-gold" />
                  <h3 className="font-semibold text-cosmic-gold">Synastrie Complète</h3>
                  {!isElite && <Lock className="w-4 h-4 text-cosmic-gold/50 ml-auto" />}
                </div>

                {isElite ? (
                  <div>
                    <p className="text-white/70 text-sm mb-4">
                      Compare ton thème natal avec celui de tes matchs pour découvrir vos dynamiques relationnelles profondes.
                    </p>
                    <button className="w-full py-3 bg-cosmic-gold/20 border border-cosmic-gold/50 text-cosmic-gold rounded-xl font-medium">
                      Analyser un Match
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Shield className="w-10 h-10 mx-auto mb-3 text-cosmic-gold/40" />
                    <p className="text-white/50 text-sm mb-4">Exclusif aux membres Elite</p>
                    <button className="px-6 py-2 bg-cosmic-gold text-black rounded-xl text-sm font-bold">
                      Devenir Elite
                    </button>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-semibold mb-4">Conseils Relationnels</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cosmic-red/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-cosmic-red text-xs">1</span>
                    </div>
                    <p className="text-sm text-white/70">
                      En tant que {sunData.element}, tu es attiré(e) par les énergies {sunData.element === 'Feu' || sunData.element === 'Air' ? 'dynamiques' : 'profondes'}.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cosmic-red/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-cosmic-red text-xs">2</span>
                    </div>
                    <p className="text-sm text-white/70">
                      Ta Lune en {profile.moon_sign} recherche {moonData.element === 'Eau' ? "la sécurité émotionnelle" : moonData.element === 'Feu' ? "l'aventure" : moonData.element === 'Terre' ? "la stabilité" : "la stimulation mentale"}.
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
