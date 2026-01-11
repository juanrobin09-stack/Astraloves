// ═══════════════════════════════════════════════════════════════════════
// ASTRO PAGE V2 - Page principale révolutionnaire
// ═══════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { supabase } from '../../lib/supabase';
import {
  generateDailyHoroscope,
  calculateDailyEnergies,
  getCompatibility,
  generateDailyChallenge,
  completeChallenge,
  getCurrentCycle,
  getLongCycles,
  getAstralMemory,
  getEnergyHistory,
  getNatalChart,
  getGuardianAlerts,
  getDetectedPatterns,
  getStrategicGuidance,
  SIGN_EMOJIS,
  SIGN_NAMES,
} from '../../lib/astroV2Service';
import {
  Tier,
  ZodiacSign,
  Horoscope,
  DailyEnergies,
  Compatibility,
  Challenge,
  CurrentCycle,
  LongCycle,
  AstralMemory,
  HistoryData,
  NatalChart,
  GuardianAlert,
  DetectedPattern,
  Guidance,
} from '../../types/astro-v2';

// Components
import HoroscopeCard from './HoroscopeCard';
import EnergiesCard from './EnergiesCard';
import CompatibilityCard from './CompatibilityCard';
import ChallengeCard from './ChallengeCard';
import CyclesCard from './CyclesCard';
import MemoryCard from './MemoryCard';
import HistoryCard from './HistoryCard';
import NatalChartCard from './NatalChartCard';
import GuardianCard from './GuardianCard';
import GuidanceCard from './GuidanceCard';

interface AstroPageV2Props {
  onNavigate?: (page: string) => void;
}

function getZodiacSignFromDate(birthDate: string): ZodiacSign {
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
  return 'pisces';
}

export default function AstroPageV2({ onNavigate }: AstroPageV2Props) {
  const { user } = useAuth();
  const { isPremium, premiumTier } = usePremiumStatus();
  
  const [loading, setLoading] = useState(true);
  const [userSign, setUserSign] = useState<ZodiacSign>('gemini');
  const [userName, setUserName] = useState('vous');
  const [tier, setTier] = useState<Tier>('free');
  
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [energies, setEnergies] = useState<DailyEnergies | null>(null);
  const [compatibilities, setCompatibilities] = useState<Compatibility[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  
  // Phase 2: Premium/Elite data
  const [currentCycle, setCurrentCycle] = useState<CurrentCycle | null>(null);
  const [longCycles, setLongCycles] = useState<LongCycle[]>([]);
  const [astralMemory, setAstralMemory] = useState<AstralMemory[]>([]);
  const [history, setHistory] = useState<HistoryData | null>(null);
  
  // Phase 3: Elite only data
  const [natalChart, setNatalChart] = useState<NatalChart | null>(null);
  const [guardianAlerts, setGuardianAlerts] = useState<GuardianAlert[]>([]);
  const [detectedPatterns, setDetectedPatterns] = useState<DetectedPattern[]>([]);
  const [guidance, setGuidance] = useState<Guidance | null>(null);

  // Déterminer tier
  useEffect(() => {
    const determinedTier: Tier =
      premiumTier === 'premium+elite' || premiumTier === 'elite' ? 'elite'
      : premiumTier === 'premium' ? 'premium'
      : 'free';
    setTier(determinedTier);
  }, [premiumTier]);

  // Load all data
  useEffect(() => {
    if (user) {
      loadAstroData();
    } else {
      setLoading(false);
    }
  }, [user?.id, tier]);

  const loadAstroData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('astra_profiles')
        .select('first_name, birth_date, sun_sign')
        .eq('id', user.id)
        .maybeSingle();

      let sign: ZodiacSign = 'gemini';
      let name = 'vous';

      if (profile) {
        name = profile.first_name || 'vous';
        if (profile.birth_date) {
          sign = getZodiacSignFromDate(profile.birth_date);
        } else if (profile.sun_sign) {
          sign = profile.sun_sign.toLowerCase() as ZodiacSign;
        }
      }

      setUserName(name);
      setUserSign(sign);

      // Load horoscope
      const horoscopeData = await generateDailyHoroscope({
        userId: user.id,
        sunSign: sign,
        userName: name,
        tier: tier,
      });
      setHoroscope(horoscopeData);

      // Load energies
      const energiesData = await calculateDailyEnergies({
        sunSign: sign,
        date: new Date(),
      });
      setEnergies(energiesData);

      // Load compatibilities
      const compatData = await getCompatibility(sign, tier);
      setCompatibilities(compatData);

      // Load challenge
      const challengeData = await generateDailyChallenge(user.id);
      setChallenge(challengeData);

      // Phase 2: Load Premium/Elite data
      if (tier !== 'free') {
        // Current cycle (Premium+)
        const cycleData = await getCurrentCycle(user.id);
        setCurrentCycle(cycleData);

        // Astral memory (Premium+)
        const memoryData = await getAstralMemory(user.id);
        setAstralMemory(memoryData);

        // History (Premium+)
        const historyData = await getEnergyHistory(user.id, '7d');
        setHistory(historyData);

        // Long cycles (Elite only)
        if (tier === 'elite') {
          const longCyclesData = await getLongCycles(user.id);
          setLongCycles(longCyclesData);
          
          // Phase 3: Elite only data
          const natalChartData = await getNatalChart(user.id);
          setNatalChart(natalChartData);
          
          const alertsData = await getGuardianAlerts(user.id);
          setGuardianAlerts(alertsData);
          
          const patternsData = await getDetectedPatterns(user.id);
          setDetectedPatterns(patternsData);
          
          const guidanceData = await getStrategicGuidance(user.id);
          setGuidance(guidanceData);
        }
      }

    } catch (error) {
      console.error('Erreur chargement Astro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    onNavigate?.('premium');
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      await completeChallenge(challengeId);
      // Reload challenge to show completed state
      if (user) {
        const updatedChallenge = await generateDailyChallenge(user.id);
        setChallenge(updatedChallenge);
      }
    } catch (error) {
      console.error('Erreur complétion challenge:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <>
        <style>{`
          @keyframes cosmicPulse {
            0%, 100% {
              box-shadow: 0 0 20px rgba(239, 68, 68, 0.3),
                          0 0 40px rgba(239, 68, 68, 0.2);
            }
            50% {
              box-shadow: 0 0 30px rgba(239, 68, 68, 0.5),
                          0 0 60px rgba(239, 68, 68, 0.3);
            }
          }

          @keyframes floatStar {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
        `}</style>

        <div className="min-h-screen bg-black relative pb-20 flex items-center justify-center overflow-hidden">
          {/* Background stars */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-red-500 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: Math.random() * 0.5 + 0.3,
                }}
              />
            ))}
          </div>

          {/* Loader */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div
              className="w-20 h-20 rounded-full border-4 border-red-900 border-t-red-500 flex items-center justify-center"
              style={{ animation: 'spin 1s linear infinite, cosmicPulse 2s ease-in-out infinite' }}
            >
              <div className="text-3xl" style={{ animation: 'floatStar 2s ease-in-out infinite' }}>
                {SIGN_EMOJIS[userSign]}
              </div>
            </div>
            <p className="text-white text-lg font-semibold">
              Consultation des astres...
            </p>
          </div>

        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes glowPulse {
          0%, 100% {
            text-shadow: 0 0 10px rgba(239, 68, 68, 0.5),
                         0 0 20px rgba(239, 68, 68, 0.3);
          }
          50% {
            text-shadow: 0 0 20px rgba(239, 68, 68, 0.8),
                         0 0 40px rgba(239, 68, 68, 0.5);
          }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>

      <div className="min-h-screen bg-black relative flex flex-col">
        {/* Background stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: Math.random() * 0.4 + 0.2,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <header
          className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-red-900/30"
          style={{ paddingTop: 'calc(16px + env(safe-area-inset-top))' }}
        >
          <div className="px-4 py-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-4xl" style={{ animation: 'glowPulse 3s ease-in-out infinite' }}>
                {SIGN_EMOJIS[userSign]}
              </span>
              <h1 className="text-3xl font-bold text-white">
                {SIGN_NAMES[userSign]}
              </h1>
            </div>
            <p className="text-sm text-zinc-400 text-center">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
        </header>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden relative z-10"
          style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}
        >
          <div className="w-full max-w-4xl mx-auto py-5 px-4 space-y-4">
            {/* Horoscope */}
            {horoscope && (
              <HoroscopeCard
                horoscope={horoscope}
                tier={tier}
                onUpgrade={handleUpgrade}
              />
            )}

            {/* Énergies */}
            {energies && <EnergiesCard energies={energies} />}

            {/* Compatibilités */}
            {compatibilities.length > 0 && (
              <CompatibilityCard
                compatibilities={compatibilities}
                tier={tier}
                onUpgrade={handleUpgrade}
              />
            )}

            {/* Challenge */}
            {challenge && (
              <ChallengeCard
                challenge={challenge}
                onComplete={handleCompleteChallenge}
              />
            )}

            {/* Phase 2: Premium/Elite Cards */}
            
            {/* Cycles */}
            <CyclesCard
              currentCycle={currentCycle || undefined}
              longCycles={longCycles}
              tier={tier}
              onUpgrade={handleUpgrade}
            />

            {/* Mémoire Astrale */}
            <MemoryCard
              memories={astralMemory}
              tier={tier}
              onUpgrade={handleUpgrade}
            />

            {/* Historique */}
            {history && (
              <HistoryCard
                history={history}
                tier={tier}
                onUpgrade={handleUpgrade}
              />
            )}

            {/* Phase 3: Elite Only Cards */}
            
            {/* Thème Astral Vivant */}
            <NatalChartCard
              natalChart={natalChart || undefined}
              tier={tier}
              onUpgrade={handleUpgrade}
            />

            {/* Guardian Astrologique */}
            <GuardianCard
              alerts={guardianAlerts}
              patterns={detectedPatterns}
              tier={tier}
              onUpgrade={handleUpgrade}
            />

            {/* Guidance Stratégique */}
            <GuidanceCard
              guidance={guidance || undefined}
              tier={tier}
              onUpgrade={handleUpgrade}
            />

            {/* Premium badge (si pas free) */}
            {tier !== 'free' && (
              <div className="mx-0 p-4 bg-red-950/30 border border-red-900/40 rounded-xl text-center">
                <p className="text-sm text-red-400 font-medium">
                  {tier === 'elite'
                    ? '🌟 Analyse Elite avec positions planétaires réelles'
                    : '✨ Analyse Premium avec données astrologiques réelles'}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
