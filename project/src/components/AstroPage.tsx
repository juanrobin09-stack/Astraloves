import { useState, useEffect } from 'react';
import BottomNav from './BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import Starfield from './Starfield';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { hybridHoroscopeService, HybridHoroscopeResponse, HoroscopeTier } from '../lib/hybridHoroscope';
import HybridHoroscopeDisplay from './HybridHoroscopeDisplay';

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

export default function AstroPage({ onBack, onNavigate }: AstroPageProps) {
  const { user } = useAuth();
  const { isPremium, premiumTier } = usePremiumStatus();
  const [loading, setLoading] = useState(true);
  const [horoscope, setHoroscope] = useState<HybridHoroscopeResponse | null>(null);
  const [userSign, setUserSign] = useState<string>('gemini');
  const [userName, setUserName] = useState<string>('');

  // Déterminer le tier correct basé sur premiumTier
  const tier: HoroscopeTier =
    premiumTier === 'premium+elite' || premiumTier === 'elite' ? 'elite'
    : premiumTier === 'premium' ? 'premium'
    : 'free';

  useEffect(() => {
    if (user) {
      loadHoroscope();
    } else {
      setLoading(false);
    }
  }, [user?.id, tier]);

  const loadHoroscope = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('=== LOADING HOROSCOPE ===');
      console.log('User ID:', user.id);
      console.log('Tier:', tier);
      console.log('isPremium:', isPremium);
      console.log('premiumTier:', premiumTier);

      const { data: profile } = await supabase
        .from('astra_profiles')
        .select('first_name, birth_date, sun_sign')
        .eq('id', user.id)
        .maybeSingle();

      let sign = 'gemini';
      let name = 'vous';

      if (profile) {
        name = profile.first_name || 'vous';
        if (profile.birth_date) {
          sign = getZodiacSignFromDate(profile.birth_date);
        } else if (profile.sun_sign) {
          sign = profile.sun_sign.toLowerCase();
        }
      }

      setUserName(name);
      setUserSign(sign);

      console.log('Fetching horoscope with:', { sign, tier, name });

      const horoscopeData = await hybridHoroscopeService.fetchHoroscope({
        zodiacSign: sign,
        tier: tier,
        userName: name,
        birthDate: profile?.birth_date,
      });

      console.log('Horoscope data received:', horoscopeData);
      setHoroscope(horoscopeData);
    } catch (error) {
      console.error('Error loading horoscope:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    onNavigate?.('premium');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #000014, #1a0033, #000014)',
        position: 'relative',
        paddingBottom: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Starfield />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <Loader2
            size={60}
            color="#FF1CF7"
            className="animate-spin"
          />
          <p style={{
            color: '#FFF',
            fontSize: '18px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            margin: 0
          }}>
            Consultation des astres...
          </p>
        </div>
        <BottomNav currentPage="astro" onNavigate={onNavigate || (() => {})} />
      </div>
    );
  }

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #000014, #1a0033, #000014)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Starfield />

      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px',
        paddingTop: 'calc(16px + env(safe-area-inset-top))',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '32px' }}>{getSignEmoji(userSign)}</span>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#FFF',
            margin: 0,
          }}>
            {getSignName(userSign)}
          </h1>
        </div>
        <p style={{
          fontSize: '14px',
          color: '#9CA3AF',
          textAlign: 'center',
          margin: 0,
        }}>
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </p>
      </header>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 10,
        paddingBottom: 'calc(100px + env(safe-area-inset-bottom))',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
          padding: '20px 0',
        }}>
          {horoscope ? (
            <HybridHoroscopeDisplay
              horoscope={horoscope}
              onUpgrade={handleUpgrade}
            />
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#9CA3AF',
            }}>
              <p>Impossible de charger votre horoscope pour le moment.</p>
              <button
                onClick={loadHoroscope}
                style={{
                  marginTop: '20px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {tier !== 'free' && (
            <div style={{
              margin: '20px 16px',
              padding: '16px',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '14px',
                color: '#E5E5E5',
                margin: 0,
              }}>
                {tier === 'elite'
                  ? '🌟 Vous bénéficiez de l\'analyse Elite avec positions planétaires réelles'
                  : '✨ Vous bénéficiez de l\'analyse Premium avec données astrologiques réelles'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav currentPage="astro" onNavigate={onNavigate || (() => {})} />
    </div>
  );
}
