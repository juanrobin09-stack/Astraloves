import { useState, useEffect } from 'react';
import BottomNav from './BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import Starfield from './Starfield';
import {
  Sparkles,
  Heart,
  Zap,
  TrendingUp,
  Star,
  Crown,
  Lock,
  Gift,
  Calendar,
  MessageCircle,
  Target,
  Moon,
  Sun,
  Activity,
  Coffee,
  Lightbulb,
  Music,
  Dumbbell,
  Users,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateAIHoroscope, clearAIHoroscopeCache, type AIHoroscope } from '../lib/aiHoroscopeService';

type AstroPageProps = {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
};

function getZodiacSignFromDate(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'pisces';

  return 'gemini';
}

type UserTier = 'free' | 'premium' | 'elite';

export default function AstroPageRestructured({ onBack, onNavigate }: AstroPageProps) {
  const { user } = useAuth();
  const { isPremium, premiumTier } = usePremiumStatus();
  const [userSign, setUserSign] = useState<string>('gemini');
  const [userName, setUserName] = useState<string>('vous');
  const [aiHoroscope, setAiHoroscope] = useState<AIHoroscope | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const userTier: UserTier =
    premiumTier === 'premium+elite' || premiumTier === 'elite' ? 'elite'
    : premiumTier === 'premium' ? 'premium'
    : 'free';

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user?.id]);

  useEffect(() => {
    if (userSign && userTier) {
      loadAIHoroscope();
    }
  }, [userSign, userTier]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('astra_profiles')
        .select('first_name, birth_date, sun_sign')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserName(profile.first_name || 'vous');
        if (profile.birth_date) {
          setUserSign(getZodiacSignFromDate(profile.birth_date));
        } else if (profile.sun_sign) {
          setUserSign(profile.sun_sign.toLowerCase());
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadAIHoroscope = async () => {
    try {
      setLoading(true);
      console.log(`[Astro Page] Chargement horoscope IA pour ${userSign} (${userTier})...`);

      const tierMapping: Record<UserTier, 'free' | 'premium' | 'premium_elite'> = {
        free: 'free',
        premium: 'premium',
        elite: 'premium_elite'
      };

      const subscriptionTier = tierMapping[userTier];
      const horoscope = await generateAIHoroscope(userSign, subscriptionTier);

      setAiHoroscope(horoscope);
      setLastUpdate(new Date());
      console.log('[Astro Page] Horoscope IA chargé avec succès');
    } catch (error) {
      console.error('[Astro Page] Erreur chargement horoscope:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshHoroscope = () => {
    const tierMapping: Record<UserTier, 'free' | 'premium' | 'premium_elite'> = {
      free: 'free',
      premium: 'premium',
      elite: 'premium_elite'
    };
    clearAIHoroscopeCache(userSign, tierMapping[userTier]);
    loadAIHoroscope();
  };

  const getSignEmoji = (sign: string): string => {
    const emojis: Record<string, string> = {
      aries: '♈',
      taurus: '♉',
      gemini: '♊',
      cancer: '♋',
      leo: '♌',
      virgo: '♍',
      libra: '♎',
      scorpio: '♏',
      sagittarius: '♐',
      capricorn: '♑',
      aquarius: '♒',
      pisces: '♓',
    };
    return emojis[sign.toLowerCase()] || '⭐';
  };

  const getSignName = (sign: string): string => {
    const names: Record<string, string> = {
      aries: 'Bélier',
      taurus: 'Taureau',
      gemini: 'Gémeaux',
      cancer: 'Cancer',
      leo: 'Lion',
      virgo: 'Vierge',
      libra: 'Balance',
      scorpio: 'Scorpion',
      sagittarius: 'Sagittaire',
      capricorn: 'Capricorne',
      aquarius: 'Verseau',
      pisces: 'Poissons',
    };
    return names[sign.toLowerCase()] || 'Gémeaux';
  };

  return (
    <div className="min-h-screen text-white relative bg-transparent">
      <Starfield />

      <div className="sticky top-0 z-40 bg-black/60 backdrop-blur-md border-b border-purple-500/20 p-4">
        <div className="flex items-center justify-center gap-3">
          <div className="text-4xl">{getSignEmoji(userSign)}</div>
          <div className="text-center">
            <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {getSignName(userSign)}
            </h1>
            <p className="text-sm text-gray-400">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-64">

        <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/40 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-slate-700/30 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-xl md:text-2xl font-black text-white flex items-center gap-1.5">
                  ✨ Horoscope
                </h3>
                {aiHoroscope?.generatedBy === 'AI' && (
                  <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-400 text-xs sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold border border-purple-500/30 mt-0.5">
                    IA
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 text-xs px-4 py-2 rounded-full font-bold border border-green-500/30">
                GRATUIT
              </span>
              <button
                onClick={refreshHoroscope}
                disabled={loading}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all disabled:opacity-50"
                title="Actualiser"
              >
                <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-6">
              <div className="inline-block w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-white text-sm sm:text-base">Chargement...</p>
            </div>
          ) : aiHoroscope ? (
            <>
              <div className="flex items-start justify-between mb-4 overflow-hidden">
                <p className="text-gray-200 text-sm leading-relaxed flex-1 break-words overflow-wrap-anywhere">
                  {aiHoroscope.description}
                </p>
                {lastUpdate && (
                  <span className="text-xs text-gray-400 ml-4 flex-shrink-0">
                    {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {aiHoroscope.mood && (
                  <MoodCard icon={<Heart />} label="Humeur" value={aiHoroscope.mood} color="pink" />
                )}
                {aiHoroscope.color && (
                  <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl p-3 border border-white/10 text-center">
                    <div className="text-gray-400 mb-1">
                      <div
                        className="w-6 h-6 rounded-full mx-auto border-2 border-white/30"
                        style={{ backgroundColor: aiHoroscope.color }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mb-1">Couleur</div>
                    <div className="font-bold text-white text-sm">Porte-bonheur</div>
                  </div>
                )}
                {aiHoroscope.luckyNumber && (
                  <MoodCard icon={<Star />} label="Chiffre" value={aiHoroscope.luckyNumber.toString()} color="yellow" />
                )}
                {aiHoroscope.luckyTime && (
                  <MoodCard icon={<Zap />} label="Moment" value={aiHoroscope.luckyTime} color="blue" />
                )}
              </div>

              {aiHoroscope.compatibility && typeof aiHoroscope.compatibility === 'string' && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400 mb-1">💫 Compatibilité du jour</p>
                  <p className="text-gray-200 break-words">{aiHoroscope.compatibility}</p>
                </div>
              )}

              {(aiHoroscope.advice || aiHoroscope.astraAdvice) && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-900/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <h4 className="font-semibold text-blue-300">Conseil d'Astra</h4>
                    </div>
                    <p className="text-sm text-gray-300 break-words">
                      {aiHoroscope.astraAdvice || aiHoroscope.advice}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-200 leading-relaxed mb-4">
              {getSignName(userSign)}, les étoiles s'alignent pour soutenir vos ambitions aujourd'hui. Prenez des mesures confiantes vers vos objectifs.
            </p>
          )}
        </div>

        <FreeSection
          icon={<Lightbulb className="w-6 h-6" />}
          title="Conseil du Jour"
          emoji="💡"
          userTier={userTier}
        >
          <div className="bg-blue-950/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-900/30 overflow-hidden">
            <p className="text-gray-200 text-xs sm:text-sm leading-relaxed break-words overflow-wrap-anywhere">
              {aiHoroscope?.dailyAdvice || "Parfait jour pour t'exprimer et partager tes idées. Fais confiance à ton intuition."}
            </p>
          </div>
        </FreeSection>

        <FreeSection
          icon={<Activity className="w-6 h-6" />}
          title="Énergies du Jour"
          emoji="⚡"
          userTier={userTier}
        >
          <div className="space-y-3">
            <EnergyBar label="Vitalité" value={aiHoroscope?.energies?.vitality || 85} color="from-green-500 to-emerald-500" emoji="💚" />
            <EnergyBar label="Créativité" value={aiHoroscope?.energies?.creativity || 92} color="from-orange-500 to-amber-500" emoji="🎨" />
            <EnergyBar label="Amour" value={aiHoroscope?.energies?.love || 78} color="from-pink-500 to-rose-500" emoji="❤️" />
            <EnergyBar label="Chance" value={aiHoroscope?.energies?.luck || 88} color="from-purple-500 to-violet-500" emoji="🍀" />
          </div>
        </FreeSection>

        <FreeSection
          icon={<Sun className="w-6 h-6" />}
          title="Moments Favorables"
          emoji="⏰"
          userTier={userTier}
        >
          <div className="grid grid-cols-3 gap-3">
            <TimeSlot
              emoji="🌅"
              label="Matin"
              mood={aiHoroscope?.timeSlots?.morning === 'excellent' ? 'Excellent' : aiHoroscope?.timeSlots?.morning === 'good' ? 'Bon' : aiHoroscope?.timeSlots?.morning === 'low' ? 'Faible' : 'Moyen'}
              color={aiHoroscope?.timeSlots?.morning === 'excellent' ? 'green' : aiHoroscope?.timeSlots?.morning === 'good' ? 'blue' : 'yellow'}
              active={aiHoroscope?.timeSlots?.morning === 'excellent'}
            />
            <TimeSlot
              emoji="☀️"
              label="Midi"
              mood={aiHoroscope?.timeSlots?.afternoon === 'excellent' ? 'Excellent' : aiHoroscope?.timeSlots?.afternoon === 'good' ? 'Bon' : aiHoroscope?.timeSlots?.afternoon === 'low' ? 'Faible' : 'Moyen'}
              color={aiHoroscope?.timeSlots?.afternoon === 'excellent' ? 'green' : aiHoroscope?.timeSlots?.afternoon === 'good' ? 'blue' : 'yellow'}
              active={aiHoroscope?.timeSlots?.afternoon === 'excellent'}
            />
            <TimeSlot
              emoji="🌙"
              label="Soir"
              mood={aiHoroscope?.timeSlots?.evening === 'excellent' ? 'Excellent' : aiHoroscope?.timeSlots?.evening === 'good' ? 'Bon' : aiHoroscope?.timeSlots?.evening === 'low' ? 'Faible' : 'Moyen'}
              color={aiHoroscope?.timeSlots?.evening === 'excellent' ? 'green' : aiHoroscope?.timeSlots?.evening === 'good' ? 'blue' : 'yellow'}
              active={aiHoroscope?.timeSlots?.evening === 'excellent'}
            />
          </div>
        </FreeSection>

        <FreeSection
          icon={<MessageCircle className="w-6 h-6" />}
          title="Citation du Jour"
          emoji="💬"
          userTier={userTier}
        >
          <div className="bg-gradient-to-r from-purple-950/40 to-pink-950/40 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-purple-900/30 overflow-hidden">
            <p className="text-sm sm:text-base md:text-lg text-gray-200 italic text-center mb-2 sm:mb-3 break-words overflow-wrap-anywhere leading-relaxed">
              "{aiHoroscope?.inspirationalQuote || "Les étoiles te guident, tu traces ton chemin."}"
            </p>
            <p className="text-xs sm:text-xs text-purple-400 text-center font-semibold">— Sagesse Cosmique</p>
          </div>
        </FreeSection>

        <PremiumSection
          icon={<Heart className="w-6 h-6" />}
          title="Amour & Relations"
          emoji="💕"
          userTier={userTier}
          requiredTier="premium"
          onNavigate={onNavigate}
        >
          <div className="space-y-4 max-h-[500px] overflow-y-auto overscroll-contain pr-1 overflow-x-hidden">
            <p className="text-gray-200 text-xs sm:text-sm leading-relaxed break-words overflow-wrap-anywhere">
              {aiHoroscope?.loveAdvice || "Vénus favorise les échanges passionnés. Belle complicité pour les couples. Célibataires : rencontre marquante possible."}
            </p>

            {aiHoroscope?.planets && typeof aiHoroscope.planets === 'string' && (
              <div className="bg-purple-950/30 rounded-xl p-4 border border-purple-900/30 overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <h4 className="font-semibold text-purple-300">Transits Planétaires</h4>
                </div>
                <p className="text-sm text-gray-300 break-words overflow-wrap-anywhere">{aiHoroscope.planets}</p>
              </div>
            )}

            {aiHoroscope?.planets && typeof aiHoroscope.planets === 'object' && (
              <div className="bg-purple-950/30 rounded-xl p-4 border border-purple-900/30">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <h4 className="font-semibold text-purple-300">Influences Planétaires</h4>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  {aiHoroscope.planets.venus && (
                    <div className="break-words">
                      <strong className="text-pink-400">♀ Vénus:</strong> {aiHoroscope.planets.venus}
                    </div>
                  )}
                  {aiHoroscope.planets.mars && (
                    <div className="break-words">
                      <strong className="text-red-400">♂ Mars:</strong> {aiHoroscope.planets.mars}
                    </div>
                  )}
                  {aiHoroscope.planets.mercury && (
                    <div className="break-words">
                      <strong className="text-blue-400">☿ Mercure:</strong> {aiHoroscope.planets.mercury}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-pink-950/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-pink-900/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400 flex-shrink-0" />
                <h4 className="font-semibold text-pink-300 text-xs sm:text-sm">Conseil Amour</h4>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 break-words leading-relaxed">
                {aiHoroscope?.astraAdvice || "Ose exprimer tes sentiments. Authenticité = meilleur atout. Charme maximum entre 18h-21h."}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2 font-semibold">💫 Compatibilité du jour :</p>
              <div className="flex flex-wrap gap-2">
                {aiHoroscope?.compatibility && typeof aiHoroscope.compatibility === 'object' && aiHoroscope.compatibility.percentages ? (
                  Object.entries(aiHoroscope.compatibility.percentages).map(([sign, percentage]) => (
                    <CompatTag key={sign} sign={sign} percentage={percentage as number} />
                  ))
                ) : aiHoroscope?.compatibility && typeof aiHoroscope.compatibility === 'string' ? (
                  <p className="text-gray-200 text-sm">{aiHoroscope.compatibility}</p>
                ) : (
                  <>
                    <CompatTag sign="Balance" percentage={92} />
                    <CompatTag sign="Lion" percentage={88} />
                    <CompatTag sign="Verseau" percentage={85} />
                  </>
                )}
              </div>
              {aiHoroscope?.compatibility && typeof aiHoroscope.compatibility === 'object' && aiHoroscope.compatibility.analysis && (
                <p className="text-gray-300 text-xs mt-2 break-words">{aiHoroscope.compatibility.analysis}</p>
              )}
            </div>
          </div>
        </PremiumSection>

        <PremiumSection
          icon={<Target className="w-6 h-6" />}
          title="Carrière & Finances"
          emoji="💼"
          userTier={userTier}
          requiredTier="premium"
          onNavigate={onNavigate}
        >
          <div className="space-y-4 max-h-[400px] overflow-y-auto overscroll-contain pr-1">
            {aiHoroscope?.career && (
              <div className="bg-purple-950/30 rounded-xl p-4 border border-purple-900/30 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <h4 className="font-semibold text-purple-300">Carrière</h4>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed break-words">{aiHoroscope.career}</p>
              </div>
            )}

            {!aiHoroscope?.career && (
              <p className="text-gray-200 text-xs sm:text-sm leading-relaxed break-words">
                Jupiter apporte opportunités pro inattendues. Créativité remarquée. Propose tes idées !
              </p>
            )}

            {aiHoroscope?.finances && (
              <div className="bg-green-950/30 rounded-xl p-4 border border-green-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl flex-shrink-0">💰</span>
                  <h4 className="font-semibold text-green-300">Finances</h4>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed break-words">{aiHoroscope.finances}</p>
              </div>
            )}

            {!aiHoroscope?.finances && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-950/30 rounded-xl p-4 border border-green-900/30">
                  <p className="text-xs text-gray-400 mb-1">💰 Finances</p>
                  <p className="text-xl font-black text-green-400">Positives</p>
                </div>
                <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-900/30">
                  <p className="text-xs text-gray-400 mb-1">📈 Opportunités</p>
                  <p className="text-xl font-black text-amber-400">Excellentes</p>
                </div>
              </div>
            )}
          </div>
        </PremiumSection>

        <PremiumSection
          icon={<Dumbbell className="w-6 h-6" />}
          title="Santé & Bien-être"
          emoji="🏃"
          userTier={userTier}
          requiredTier="premium"
          onNavigate={onNavigate}
        >
          <div className="space-y-4 max-h-[400px] overflow-y-auto overscroll-contain pr-1">
            {aiHoroscope?.health && (
              <div className="bg-red-950/30 rounded-xl p-4 border border-red-900/30 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <h4 className="font-semibold text-red-300">Santé</h4>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed break-words">{aiHoroscope.health}</p>
              </div>
            )}

            {aiHoroscope?.wellbeing && (
              <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <h4 className="font-semibold text-blue-300">Bien-être</h4>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed break-words">{aiHoroscope.wellbeing}</p>
              </div>
            )}

            {!aiHoroscope?.health && !aiHoroscope?.wellbeing && (
              <>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed break-words">
                  Énergie au max ! Moment idéal pour sport ou nouvelle routine.
                </p>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <HealthTip icon={<Coffee />} title="Hydratation" desc="2L d'eau" />
                  <HealthTip icon={<Moon />} title="Sommeil" desc="8h" />
                  <HealthTip icon={<Dumbbell />} title="Sport" desc="30min" />
                  <HealthTip icon={<Music />} title="Relax" desc="10min" />
                </div>
              </>
            )}
          </div>
        </PremiumSection>

        {aiHoroscope?.timeline && (
          <EliteSection
            icon={<Sun className="w-6 h-6" />}
            title="Timeline Énergétique VIP"
            emoji="⏰"
            userTier={userTier}
            onNavigate={onNavigate}
          >
            <div className="space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto overscroll-contain pr-1">
              <p className="text-gray-200 text-xs sm:text-sm mb-3 sm:mb-4 break-words leading-relaxed">
                Optimise ta journée avec les énergies cosmiques
              </p>

              {aiHoroscope.timeline.morning && (
                <div className="bg-gradient-to-r from-yellow-950/40 to-transparent rounded-2xl p-4 border border-yellow-900/30">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl flex-shrink-0">🌅</div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-yellow-300 mb-2">Matin (6h-12h)</h4>
                      <p className="text-gray-200 text-sm break-words">{aiHoroscope.timeline.morning}</p>
                    </div>
                  </div>
                </div>
              )}

              {aiHoroscope.timeline.afternoon && (
                <div className="bg-gradient-to-r from-orange-950/40 to-transparent rounded-2xl p-4 border border-orange-900/30">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl flex-shrink-0">☀️</div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-orange-300 mb-2">Après-midi (12h-18h)</h4>
                      <p className="text-gray-200 text-sm break-words">{aiHoroscope.timeline.afternoon}</p>
                    </div>
                  </div>
                </div>
              )}

              {aiHoroscope.timeline.evening && (
                <div className="bg-gradient-to-r from-purple-950/40 to-transparent rounded-2xl p-4 border border-purple-900/30">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl flex-shrink-0">🌙</div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-purple-300 mb-2">Soir (18h-minuit)</h4>
                      <p className="text-gray-200 text-sm break-words">{aiHoroscope.timeline.evening}</p>
                    </div>
                  </div>
                </div>
              )}

              {aiHoroscope.astraStrategy && (
                <div className="bg-gradient-to-br from-red-950/40 to-pink-950/40 rounded-2xl p-5 border-2 border-red-900/30 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-6 h-6 text-red-400 flex-shrink-0" />
                    <h4 className="font-bold text-red-300">Stratégie Astra VIP</h4>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed break-words">{aiHoroscope.astraStrategy}</p>
                </div>
              )}

              {aiHoroscope.cosmic_warning && (
                <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl flex-shrink-0">⚠️</span>
                    <h4 className="font-semibold text-amber-300">Point d'attention cosmique</h4>
                  </div>
                  <p className="text-sm text-gray-300 break-words">{aiHoroscope.cosmic_warning}</p>
                </div>
              )}
            </div>
          </EliteSection>
        )}

        {aiHoroscope?.energy && (
          <EliteSection
            icon={<Zap className="w-6 h-6" />}
            title="Analyse Énergétique Complète"
            emoji="⚡"
            userTier={userTier}
            onNavigate={onNavigate}
          >
            <div className="space-y-4 max-h-[400px] overflow-y-auto overscroll-contain pr-1">
              <div className="bg-gradient-to-br from-purple-950/30 to-pink-950/30 rounded-2xl p-5 border border-purple-900/30">
                <p className="text-gray-200 leading-relaxed break-words">{aiHoroscope.energy}</p>
              </div>

              {aiHoroscope.houses && (
                <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <h4 className="font-semibold text-blue-300">Maisons Astrologiques</h4>
                  </div>
                  <p className="text-sm text-gray-300 break-words">{aiHoroscope.houses}</p>
                </div>
              )}
            </div>
          </EliteSection>
        )}

        <EliteSection
          icon={<Calendar className="w-6 h-6" />}
          title="Prévisions Hebdomadaires VIP"
          emoji="📅"
          userTier={userTier}
          onNavigate={onNavigate}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              <DayPreview day="LUN" emoji="💚" mood="excellent" />
              <DayPreview day="MAR" emoji="✨" mood="bon" />
              <DayPreview day="MER" emoji="😐" mood="moyen" />
              <DayPreview day="JEU" emoji="🔥" mood="excellent" />
              <DayPreview day="VEN" emoji="💪" mood="bon" />
              <DayPreview day="SAM" emoji="⚠️" mood="attention" />
              <DayPreview day="DIM" emoji="🌙" mood="calme" />
            </div>

            <div className="bg-amber-950/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-900/30">
              <h4 className="font-bold text-amber-300 mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm">
                <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                Moments Clés
              </h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span className="break-words"><strong>Mardi 10h-12h :</strong> Opportunité pro majeure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 flex-shrink-0">❤</span>
                  <span className="break-words"><strong>Jeudi soir :</strong> Rencontres amoureuses idéales</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 flex-shrink-0">⚠</span>
                  <span className="break-words"><strong>Samedi :</strong> Éviter décisions importantes</span>
                </li>
              </ul>
            </div>
          </div>
        </EliteSection>

        <EliteSection
          icon={<Sparkles className="w-6 h-6" />}
          title="Message d'Astra"
          emoji="✨"
          userTier={userTier}
          onNavigate={onNavigate}
        >
          <div className="bg-gradient-to-r from-purple-950/40 to-pink-950/40 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-purple-900/30">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl flex-shrink-0">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-100 text-xs sm:text-sm leading-relaxed italic mb-2 sm:mb-3 break-words">
                  "{userName}, semaine clé pour tes projets ! Vénus amplifie ta capacité à convaincre. Jeudi soir : fais ce premier pas. Les astres sont alignés. 💫"
                </p>
                <div className="flex items-center gap-2 justify-end">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-500"></div>
                  <p className="text-xs sm:text-xs text-purple-400 font-bold whitespace-nowrap">— Astra 💜</p>
                </div>
              </div>
            </div>
          </div>
        </EliteSection>

        <EliteSection
          icon={<TrendingUp className="w-6 h-6" />}
          title="Thème Astral Détaillé"
          emoji="🌌"
          userTier={userTier}
          onNavigate={onNavigate}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <PlanetCard symbol="☉" name="Soleil" sign={getSignName(userSign)} house="3" />
              <PlanetCard symbol="☽" name="Lune" sign="Cancer" house="4" />
              <PlanetCard symbol="↑" name="Ascendant" sign="Vierge" />
            </div>

            <div className="bg-indigo-950/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-indigo-900/30">
              <h4 className="font-bold text-indigo-300 mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                Transits Actuels
              </h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 flex-shrink-0">•</span>
                  <span className="break-words"><strong>Vénus :</strong> Favorable amour/relations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 flex-shrink-0">•</span>
                  <span className="break-words"><strong>Mars :</strong> Énergie relationnelle, prends initiatives</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 flex-shrink-0">•</span>
                  <span className="break-words"><strong>Jupiter :</strong> Optimisme, ouverture opportunités</span>
                </li>
              </ul>
            </div>
          </div>
        </EliteSection>

        <FreeSection
          icon={<Target className="w-6 h-6" />}
          title="Challenge Cosmique du Jour"
          emoji="🎯"
          userTier={userTier}
        >
          <div className="bg-gradient-to-r from-orange-950/30 to-red-950/30 rounded-lg sm:rounded-xl p-2.5 sm:p-4 md:p-5 border border-orange-900/30 overflow-hidden">
            <div className="flex items-start gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-3 md:mb-4">
              <div className="text-xl sm:text-2xl md:text-3xl flex-shrink-0 leading-none">🏆</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-orange-300 mb-1 sm:mb-1.5 md:mb-2 text-xs sm:text-sm md:text-base break-words leading-tight">Connexion Authentique</h4>
                <p className="text-xs leading-snug sm:text-xs md:text-sm text-gray-300 break-words">
                  Aie une vraie conversation profonde aujourd'hui. Partage et écoute vraiment.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-xs md:text-xs text-gray-400">
              <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
              <span className="leading-tight">+50 XP ✨</span>
            </div>
          </div>
        </FreeSection>

        <FreeSection
          icon={<Users className="w-6 h-6" />}
          title="Affinités Sociales"
          emoji="👥"
          userTier={userTier}
        >
          <div className="space-y-3">
            <AffinityCard
              sign="Balance"
              emoji="♎"
              compatibility="Très Compatible"
              color="from-pink-500 to-purple-500"
              percentage={92}
            />
            <AffinityCard
              sign="Verseau"
              emoji="♒"
              compatibility="Excellente Alchimie"
              color="from-blue-500 to-cyan-500"
              percentage={88}
            />
            <AffinityCard
              sign="Lion"
              emoji="♌"
              compatibility="Dynamique Positive"
              color="from-orange-500 to-yellow-500"
              percentage={85}
            />
          </div>
        </FreeSection>

      </div>

      <BottomNav currentPage="astro" onNavigate={onNavigate || (() => {})} />
    </div>
  );
}

function FreeSection({ icon, title, emoji, userTier, children }: {
  icon: React.ReactNode;
  title: string;
  emoji: string;
  userTier: UserTier;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/40 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 border-2 border-slate-700/30 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-white flex items-center gap-1.5 sm:gap-2 break-words leading-tight">
              <span className="text-sm sm:text-base md:text-lg">{emoji}</span> {title}
            </h3>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-2 bg-green-500/20 text-green-400 text-xs sm:text-xs px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full font-bold border border-green-500/30 flex-shrink-0 ml-2">
          ✓ GRATUIT
        </span>
      </div>
      {children}
    </div>
  );
}

function PremiumSection({ icon, title, emoji, userTier, requiredTier, onNavigate, children }: {
  icon: React.ReactNode;
  title: string;
  emoji: string;
  userTier: UserTier;
  requiredTier: string;
  onNavigate?: (page: string) => void;
  children: React.ReactNode;
}) {
  const isLocked = userTier === 'free';

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
      <div className={`${isLocked ? 'blur-md opacity-50 pointer-events-none select-none' : ''} transition-all duration-300`}>
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 border-2 border-purple-500/30 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                {icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-white flex items-center gap-1.5 sm:gap-2 break-words leading-tight">
                  <span className="text-sm sm:text-base md:text-lg">{emoji}</span> {title}
                </h3>
              </div>
            </div>
            {!isLocked && (
              <span className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs sm:text-xs px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full font-bold shadow-lg border border-white/20 flex-shrink-0 ml-2">
                💎 PREMIUM
              </span>
            )}
          </div>
          {children}
        </div>
      </div>

      {isLocked && <LockOverlay tier="premium" price="9,99€" onNavigate={onNavigate} />}
    </div>
  );
}

function EliteSection({ icon, title, emoji, userTier, onNavigate, children }: {
  icon: React.ReactNode;
  title: string;
  emoji: string;
  userTier: UserTier;
  onNavigate?: (page: string) => void;
  children: React.ReactNode;
}) {
  const isLocked = userTier !== 'elite';

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
      <div className={`${isLocked ? 'blur-md opacity-50 pointer-events-none select-none' : ''} transition-all duration-300`}>
        <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 border-2 border-amber-500/30 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                {icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2 break-words leading-tight">
                  <span className="text-sm sm:text-base md:text-lg">{emoji}</span> {title}
                </h3>
              </div>
            </div>
            {!isLocked && (
              <span className="hidden sm:inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-xs px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full font-bold shadow-lg border border-white/20 flex-shrink-0 ml-2">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                ÉLITE
              </span>
            )}
          </div>
          {children}
        </div>
      </div>

      {isLocked && <LockOverlay tier="elite" price="14,99€" onNavigate={onNavigate} />}
    </div>
  );
}

function MoodCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    pink: 'from-pink-500 to-rose-500',
    red: 'from-red-500 to-rose-500',
    yellow: 'from-yellow-500 to-amber-500',
    blue: 'from-blue-500 to-cyan-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]}/20 rounded-xl p-3 border border-white/10 text-center overflow-hidden`}>
      <div className="text-gray-400 mb-1 flex justify-center items-center h-6">{icon}</div>
      <div className="text-xs text-gray-400 mb-1 truncate px-1">{label}</div>
      <div className="font-bold text-white text-sm truncate px-1">{value}</div>
    </div>
  );
}

function EnergyBar({ label, value, color, emoji }: { label: string; value: number; color: string; emoji: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base">{emoji}</span>
          <span className="text-sm font-semibold text-gray-300">{label}</span>
        </div>
        <span className="text-sm font-bold text-white">{value}%</span>
      </div>
      <div className="bg-slate-800/50 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

function TimeSlot({ emoji, label, mood, color, active = false }: { emoji: string; label: string; mood: string; color: string; active?: boolean }) {
  const colors: Record<string, string> = {
    yellow: 'from-yellow-500/30 to-amber-500/30 border-yellow-500/50',
    green: 'from-green-500/30 to-emerald-500/30 border-green-500/50',
    blue: 'from-blue-500/30 to-cyan-500/30 border-blue-500/50'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-3 border-2 text-center overflow-hidden ${active ? 'ring-2 ring-white/50' : ''}`}>
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-xs text-gray-300 font-semibold mb-1 truncate px-0.5">{label}</div>
      <div className="text-xs text-gray-400 truncate px-0.5">{mood}</div>
    </div>
  );
}

function CompatTag({ sign, percentage }: { sign: string; percentage: number }) {
  return (
    <div className="bg-pink-900/30 px-3 py-1.5 rounded-full text-sm border border-pink-800/30 text-pink-200 flex items-center gap-2 overflow-hidden">
      <span className="truncate">{sign}</span>
      <span className="font-bold whitespace-nowrap flex-shrink-0">{percentage}%</span>
    </div>
  );
}

function HealthTip({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-green-950/20 rounded-xl p-3 border border-green-900/30 overflow-hidden">
      <div className="flex items-center gap-2 mb-2 text-green-400 min-w-0">
        <div className="flex-shrink-0">{icon}</div>
        <span className="text-xs font-bold truncate">{title}</span>
      </div>
      <p className="text-xs text-gray-400 break-words">{desc}</p>
    </div>
  );
}

function DayPreview({ day, emoji, mood }: { day: string; emoji: string; mood: string }) {
  const moodColors: Record<string, string> = {
    excellent: 'from-green-500/30 to-emerald-500/30 border-green-500/50',
    bon: 'from-blue-500/30 to-cyan-500/30 border-blue-500/50',
    moyen: 'from-yellow-500/30 to-amber-500/30 border-yellow-500/50',
    attention: 'from-orange-500/30 to-red-500/30 border-orange-500/50',
    calme: 'from-purple-500/30 to-indigo-500/30 border-purple-500/50'
  };

  return (
    <div className={`bg-gradient-to-br ${moodColors[mood]} backdrop-blur-sm rounded-xl p-2 border-2 text-center overflow-hidden`}>
      <div className="text-xs text-gray-300 mb-1 font-bold truncate">{day}</div>
      <div className="text-xl">{emoji}</div>
    </div>
  );
}

function PlanetCard({ symbol, name, sign, house }: { symbol: string; name: string; sign: string; house?: string }) {
  return (
    <div className="bg-indigo-950/50 backdrop-blur-sm rounded-xl p-3 border border-indigo-900/30 text-center overflow-hidden">
      <div className="text-3xl mb-1">{symbol}</div>
      <div className="text-xs text-gray-400 mb-1 truncate px-0.5">{name}</div>
      <div className="font-bold text-white text-sm truncate px-0.5">{sign}</div>
      {house && <div className="text-xs text-gray-500 mt-1 truncate px-0.5">Maison {house}</div>}
    </div>
  );
}

function AffinityCard({ sign, emoji, compatibility, color, percentage }: { sign: string; emoji: string; compatibility: string; color: string; percentage: number }) {
  const getColorClass = (color: string) => {
    if (color.includes('pink')) return 'text-pink-400';
    if (color.includes('blue')) return 'text-blue-400';
    if (color.includes('orange') || color.includes('yellow')) return 'text-orange-400';
    return 'text-white';
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-sm rounded-2xl p-5 border border-slate-600/60 flex items-center gap-4 overflow-hidden shadow-lg">
      <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}>
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-white text-xl truncate">{sign}</h4>
        <p className="text-sm text-gray-300 truncate">{compatibility}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`text-4xl font-black ${getColorClass(color)} whitespace-nowrap drop-shadow-lg`}>
          {percentage}%
        </div>
      </div>
    </div>
  );
}

function LockOverlay({ tier, price, onNavigate }: { tier: string; price: string; onNavigate?: (page: string) => void }) {
  const tierColors: Record<string, { bg: string; icon: string; button: string; title: string }> = {
    premium: {
      bg: 'from-purple-900/95 to-pink-900/95',
      icon: 'from-purple-500 to-pink-500',
      button: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
      title: '💎 Contenu Premium'
    },
    elite: {
      bg: 'from-amber-900/95 to-orange-900/95',
      icon: 'from-amber-500 to-orange-500',
      button: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
      title: '👑 Contenu Élite'
    }
  };

  const colors = tierColors[tier];

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 overflow-hidden">
      <div className={`bg-gradient-to-br ${colors.bg} backdrop-blur-xl rounded-2xl p-5 md:p-6 border-2 border-white/10 shadow-2xl w-[85%] max-w-[300px] md:max-w-[320px] text-center`}>
        <div className={`w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 bg-gradient-to-br ${colors.icon} rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl`}>
          {tier === 'elite' ? (
            <Crown className="w-7 h-7 md:w-8 md:h-8 text-white" />
          ) : (
            <Lock className="w-7 h-7 md:w-8 md:h-8 text-white" />
          )}
        </div>
        <h3 className="text-lg md:text-xl font-black text-white mb-2 break-words leading-tight px-2">{colors.title}</h3>
        <p className="text-gray-200 text-xs md:text-sm mb-3 break-words leading-relaxed px-2">
          {tier === 'elite'
            ? 'Prévisions hebdo + thème astral + coach IA'
            : 'Amour, carrière, santé détaillés'
          }
        </p>
        <p className="text-white font-bold text-lg md:text-xl mb-3 md:mb-4">{price}/mois</p>
        <button
          onClick={() => onNavigate?.('premium')}
          className={`w-full bg-gradient-to-r ${colors.button} text-white py-3 md:py-3.5 px-4 md:px-6 rounded-lg md:rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl text-xs md:text-sm min-h-[44px]`}
        >
          Débloquer Maintenant
        </button>
      </div>
    </div>
  );
}
