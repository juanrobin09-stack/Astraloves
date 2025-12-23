import React from 'react';
import { Sparkles, Star, TrendingUp, Heart, Zap, Globe, Briefcase, Activity, Crown, Lock, Calendar } from 'lucide-react';
import { HybridHoroscopeResponse } from '../lib/hybridHoroscope';
import PremiumUpgradeBanner from './PremiumUpgradeBanner';

interface HybridHoroscopeDisplayProps {
  horoscope: HybridHoroscopeResponse;
  onUpgrade?: () => void;
}

function translateMood(mood: string): string {
  const translations: Record<string, string> = {
    'optimistic': 'Optimiste',
    'reflective': 'Réfléchi',
    'energetic': 'Énergique',
    'peaceful': 'Paisible',
    'ambitious': 'Ambitieux',
    'creative': 'Créatif',
    'balanced': 'Équilibré',
    'confident': 'Confiant',
    'romantic': 'Romantique',
    'determined': 'Déterminé',
  };
  return translations[mood.toLowerCase()] || mood;
}

function translateColor(color: string): string {
  const translations: Record<string, string> = {
    'red': 'Rouge',
    'blue': 'Bleu',
    'green': 'Vert',
    'purple': 'Violet',
    'yellow': 'Jaune',
    'orange': 'Orange',
    'pink': 'Rose',
    'gold': 'Or',
    'silver': 'Argent',
    'white': 'Blanc',
    'black': 'Noir',
    'brown': 'Marron',
    'navy': 'Bleu marine',
    'maroon': 'Bordeaux',
    'sea green': 'Vert marin',
  };
  return translations[color.toLowerCase()] || color;
}

function translateTime(time: string): string {
  const translations: Record<string, string> = {
    'morning': 'Matin',
    'noon': 'Midi',
    'afternoon': 'Après-midi',
    'evening': 'Soirée',
    'night': 'Nuit',
  };
  return translations[time.toLowerCase()] || time;
}

export default function HybridHoroscopeDisplay({ horoscope, onUpgrade }: HybridHoroscopeDisplayProps) {
  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      padding: '0 16px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))',
        border: horoscope.tier === 'free'
          ? '1px solid rgba(139, 92, 246, 0.3)'
          : horoscope.tier === 'premium'
          ? '2px solid rgba(168, 85, 247, 0.4)'
          : '2px solid rgba(251, 191, 36, 0.4)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: horoscope.tier === 'free'
          ? 'none'
          : horoscope.tier === 'premium'
          ? '0 4px 20px rgba(168, 85, 247, 0.15)'
          : '0 4px 20px rgba(251, 191, 36, 0.15)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Sparkles size={24} color="#F59E0B" />
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#FFF',
              margin: 0,
            }}>
              Votre Horoscope du Jour
            </h3>
          </div>

          {/* Badge dynamique selon le tier */}
          {horoscope.tier === 'free' ? (
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #10B981, #34D399)',
                borderRadius: '20px',
                filter: 'blur(6px)',
                opacity: 0.4,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}></div>
              <span style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #10B981, #34D399)',
                color: '#FFF',
                fontSize: '11px',
                fontWeight: '700',
                padding: '6px 12px',
                borderRadius: '20px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                ✓ GRATUIT
              </span>
            </div>
          ) : horoscope.tier === 'premium' ? (
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                borderRadius: '20px',
                filter: 'blur(8px)',
                opacity: 0.5,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}></div>
              <span style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                color: '#FFF',
                fontSize: '11px',
                fontWeight: '700',
                padding: '6px 12px',
                borderRadius: '20px',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                💎 PREMIUM
              </span>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                borderRadius: '20px',
                filter: 'blur(8px)',
                opacity: 0.5,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}></div>
              <span style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                color: '#000',
                fontSize: '11px',
                fontWeight: '700',
                padding: '6px 12px',
                borderRadius: '20px',
                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                <Crown size={14} />
                ÉLITE
              </span>
            </div>
          )}
        </div>

        <p style={{
          fontSize: '15px',
          lineHeight: '1.6',
          color: '#E5E5E5',
          marginBottom: '20px',
        }}>
          {horoscope.description}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: horoscope.tier !== 'free' ? '16px' : 0,
        }}>
          {horoscope.mood && (
            <InfoCard icon={<Heart size={18} />} label="Humeur" value={translateMood(horoscope.mood)} />
          )}
          {horoscope.color && (
            <InfoCard icon={<Sparkles size={18} />} label="Couleur" value={translateColor(horoscope.color)} />
          )}
          {horoscope.luckyNumber && (
            <InfoCard icon={<Star size={18} />} label="Chiffre" value={horoscope.luckyNumber} />
          )}
          {horoscope.luckyTime && (
            <InfoCard icon={<Zap size={18} />} label="Moment" value={translateTime(horoscope.luckyTime)} />
          )}
        </div>

        {/* Message bonus pour Premium/Elite */}
        {(horoscope.tier === 'premium' || horoscope.tier === 'elite') && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            marginTop: '16px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
              }}>
                <Sparkles size={20} color="#FFF" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '11px',
                  color: '#C084FC',
                  fontWeight: '700',
                  marginBottom: '4px',
                }}>
                  ✨ Bonus {horoscope.tier === 'elite' ? 'Elite' : 'Premium'}
                </p>
                <p style={{
                  fontSize: '13px',
                  color: '#E5E5E5',
                  margin: 0,
                  lineHeight: '1.5',
                }}>
                  Profite de tes analyses détaillées ci-dessous pour maximiser cette journée !
                </p>
              </div>
            </div>
          </div>
        )}

        {horoscope.upgradeMessage && (
          <PremiumUpgradeBanner
            message={horoscope.upgradeMessage}
            onUpgrade={onUpgrade}
          />
        )}
      </div>

      {/* SECTION GRATUITE : Conseil du Jour */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="#3B82F6" />
            <h4 style={{
              fontSize: '17px',
              fontWeight: '600',
              color: '#FFF',
              margin: 0,
            }}>
              Conseil du Jour
            </h4>
          </div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
            color: '#FFF',
            fontSize: '10px',
            fontWeight: '700',
            padding: '4px 10px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
          }}>
            ⚡ IA
          </span>
        </div>
        <p style={{
          fontSize: '15px',
          lineHeight: '1.6',
          color: '#E5E5E5',
          margin: 0,
        }}>
          Les énergies cosmiques de cette journée favorisent l'expression personnelle et la communication.
          C'est un moment idéal pour partager tes idées et te connecter avec les autres. Fais confiance à ton intuition.
        </p>
      </div>

      {/* SECTION GRATUITE : Énergies du Jour */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(192, 132, 252, 0.1))',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={20} color="#A855F7" />
            <h4 style={{
              fontSize: '17px',
              fontWeight: '600',
              color: '#FFF',
              margin: 0,
            }}>
              Énergies du Jour
            </h4>
          </div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #A855F7, #C084FC)',
            color: '#FFF',
            fontSize: '10px',
            fontWeight: '700',
            padding: '4px 10px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)',
          }}>
            ⚡ IA
          </span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}>
          <EnergyMeter label="Vitalité" value={85} color="#4ADE80" />
          <EnergyMeter label="Créativité" value={92} color="#F59E0B" />
          <EnergyMeter label="Intuition" value={78} color="#A855F7" />
          <EnergyMeter label="Chance" value={88} color="#3B82F6" />
        </div>
      </div>

      {/* SECTION GRATUITE : Moment Favorable */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.1))',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Star size={20} color="#F59E0B" />
            <h4 style={{
              fontSize: '17px',
              fontWeight: '600',
              color: '#FFF',
              margin: 0,
            }}>
              Moment le Plus Favorable
            </h4>
          </div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
            color: '#000',
            fontSize: '10px',
            fontWeight: '700',
            padding: '4px 10px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
          }}>
            ⚡ IA
          </span>
        </div>
        <div style={{
          background: 'rgba(245, 158, 11, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
          }}>
            <div style={{
              fontSize: '32px',
            }}>
              🌟
            </div>
            <div>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#FFF',
                margin: '0 0 4px 0',
              }}>
                15h - 18h
              </p>
              <p style={{
                fontSize: '13px',
                color: '#FCD34D',
                margin: 0,
              }}>
                Période optimale pour les décisions importantes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION GRATUITE : Planètes Actives */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(244, 114, 182, 0.1))',
        border: '1px solid rgba(236, 72, 153, 0.3)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={20} color="#EC4899" />
            <h4 style={{
              fontSize: '17px',
              fontWeight: '600',
              color: '#FFF',
              margin: 0,
            }}>
              Planètes Actives Aujourd'hui
            </h4>
          </div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #EC4899, #F472B6)',
            color: '#FFF',
            fontSize: '10px',
            fontWeight: '700',
            padding: '4px 10px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(236, 72, 153, 0.3)',
          }}>
            ⚡ IA
          </span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '12px',
        }}>
          {[
            { name: 'Mercure', emoji: '☿', influence: 'Communication' },
            { name: 'Vénus', emoji: '♀', influence: 'Amour' },
            { name: 'Mars', emoji: '♂', influence: 'Action' },
            { name: 'Jupiter', emoji: '♃', influence: 'Expansion' },
          ].map((planet, i) => (
            <div key={i} style={{
              background: 'rgba(236, 72, 153, 0.15)',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center',
              border: '1px solid rgba(236, 72, 153, 0.2)',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{planet.emoji}</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFF', marginBottom: '4px' }}>
                {planet.name}
              </div>
              <div style={{ fontSize: '11px', color: '#F9A8D4' }}>
                {planet.influence}
              </div>
            </div>
          ))}
        </div>
      </div>

      {horoscope.compatibility && (
        <div style={{
          background: 'rgba(236, 72, 153, 0.1)',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}>
            <Heart size={20} color="#EC4899" />
            <h4 style={{
              fontSize: '17px',
              fontWeight: '600',
              color: '#FFF',
              margin: 0,
            }}>
              Compatibilité
            </h4>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#E5E5E5',
            margin: 0,
          }}>
            {horoscope.compatibility}
          </p>
        </div>
      )}

      {horoscope.majorTransits && horoscope.majorTransits.length > 0 && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
          }}>
            <Globe size={20} color="#3B82F6" />
            <h4 style={{
              fontSize: '17px',
              fontWeight: '600',
              color: '#FFF',
              margin: 0,
            }}>
              Transits Majeurs
            </h4>
          </div>
          <ul style={{
            margin: 0,
            padding: '0 0 0 20px',
            listStyle: 'none',
          }}>
            {horoscope.majorTransits.map((transit, index) => (
              <li key={index} style={{
                fontSize: '14px',
                color: '#E5E5E5',
                marginBottom: '8px',
                position: 'relative',
                paddingLeft: '20px',
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#3B82F6',
                }}>
                  •
                </span>
                {transit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {horoscope.personalizedMessage && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.15))',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}>
            <Sparkles size={20} color="#8B5CF6" />
            <h4 style={{
              fontSize: '17px',
              fontWeight: '600',
              color: '#FFF',
              margin: 0,
            }}>
              Message Personnalisé
            </h4>
          </div>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#E5E5E5',
            margin: 0,
            fontStyle: 'italic',
          }}>
            {horoscope.personalizedMessage}
          </p>
        </div>
      )}

      {horoscope.isEliteContent && horoscope.planetaryPositions && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))',
          border: '1px solid rgba(251, 191, 36, 0.4)',
          borderRadius: '16px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
          }}>
            <TrendingUp size={20} color="#FBBF24" />
            <h4 style={{
              fontSize: '17px',
              fontWeight: '600',
              color: '#FFF',
              margin: 0,
            }}>
              Positions Planétaires
            </h4>
            <span style={{
              background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
              color: '#000',
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '6px',
              marginLeft: 'auto',
            }}>
              ELITE
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
          }}>
            {Object.entries(horoscope.planetaryPositions).map(([planet, data]: [string, any]) => (
              <div key={planet} style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#FBBF24',
                  textTransform: 'capitalize',
                  marginBottom: '4px',
                }}>
                  {planet}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#E5E5E5',
                }}>
                  {data.sign} {data.degree}°
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {horoscope.minorTransits && horoscope.minorTransits.length > 0 && (
        <div style={{
          marginTop: '20px',
          background: 'rgba(100, 116, 139, 0.1)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <h5 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#94A3B8',
            marginBottom: '10px',
          }}>
            Transits Mineurs
          </h5>
          <ul style={{
            margin: 0,
            padding: '0 0 0 20px',
            listStyle: 'none',
          }}>
            {horoscope.minorTransits.map((transit, index) => (
              <li key={index} style={{
                fontSize: '13px',
                color: '#CBD5E1',
                marginBottom: '6px',
              }}>
                {transit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* NOUVELLES SECTIONS PREMIUM - Floutées pour FREE */}

      {/* Section Amour Détaillé - PREMIUM */}
      <div style={{ position: 'relative', marginTop: '20px' }}>
        <div style={{
          filter: horoscope.tier === 'free' ? 'blur(4px)' : 'none',
          opacity: horoscope.tier === 'free' ? 0.5 : 1,
          pointerEvents: horoscope.tier === 'free' ? 'none' : 'auto',
          userSelect: horoscope.tier === 'free' ? 'none' : 'auto',
          transition: 'all 0.3s',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(244, 114, 182, 0.15))',
            border: '2px solid rgba(236, 72, 153, 0.4)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #EC4899, #F472B6)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Heart size={24} color="#FFF" />
                </div>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#FBCFE8',
                  margin: 0,
                }}>
                  Amour & Relations
                </h3>
              </div>
              {horoscope.tier !== 'free' && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                  color: '#FFF',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
                }}>
                  💎 PREMIUM
                </span>
              )}
            </div>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#E5E5E5',
              marginBottom: '16px',
            }}>
              Vénus en aspect harmonieux avec Mercure favorise les échanges passionnés. Les couples connaîtront une belle complicité. Célibataires, une rencontre marquante pourrait bouleverser votre quotidien.
            </p>

            <div style={{
              background: 'rgba(236, 72, 153, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={18} color="#F472B6" />
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#FBCFE8', margin: 0 }}>
                  Conseil Astra
                </h4>
              </div>
              <p style={{ fontSize: '14px', color: '#E5E5E5', margin: 0 }}>
                Osez exprimer vos sentiments. Votre authenticité sera votre meilleur atout aujourd'hui.
              </p>
            </div>

            <div>
              <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '8px' }}>Compatible avec :</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Balance 92%', 'Lion 88%', 'Gémeaux 85%'].map((sign, idx) => (
                  <span key={idx} style={{
                    background: 'rgba(236, 72, 153, 0.2)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    color: '#FBCFE8',
                  }}>
                    {sign}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {horoscope.tier === 'free' && (
          <LockOverlay
            tier="premium"
            title="Contenu Premium"
            description="Analyses détaillées d'amour et compatibilité pour 9,99€/mois"
            price="9,99€"
            onUpgrade={onUpgrade}
          />
        )}
      </div>

      {/* Section Carrière - PREMIUM */}
      <div style={{ position: 'relative', marginTop: '20px' }}>
        <div style={{
          filter: horoscope.tier === 'free' ? 'blur(4px)' : 'none',
          opacity: horoscope.tier === 'free' ? 0.5 : 1,
          pointerEvents: horoscope.tier === 'free' ? 'none' : 'auto',
          userSelect: horoscope.tier === 'free' ? 'none' : 'auto',
          transition: 'all 0.3s',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(249, 115, 22, 0.15))',
            border: '2px solid rgba(251, 146, 60, 0.4)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #FB923C, #F97316)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Briefcase size={24} color="#FFF" />
                </div>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#FED7AA',
                  margin: 0,
                }}>
                  Carrière & Travail
                </h3>
              </div>
              {horoscope.tier !== 'free' && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                  color: '#FFF',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
                }}>
                  💎 PREMIUM
                </span>
              )}
            </div>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#E5E5E5',
              marginBottom: '16px',
            }}>
              Jupiter apporte des opportunités professionnelles inattendues. Votre créativité sera remarquée. N'hésitez pas à proposer vos idées innovantes lors des réunions.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{
                background: 'rgba(251, 146, 60, 0.2)',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 4px 0' }}>Opportunités</p>
                <p style={{ fontSize: '20px', fontWeight: '800', color: '#4ADE80', margin: 0 }}>Excellentes</p>
              </div>
              <div style={{
                background: 'rgba(251, 146, 60, 0.2)',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 4px 0' }}>Jour favorable</p>
                <p style={{ fontSize: '20px', fontWeight: '800', color: '#FB923C', margin: 0 }}>Lundi</p>
              </div>
            </div>
          </div>
        </div>

        {horoscope.tier === 'free' && (
          <LockOverlay
            tier="premium"
            title="Contenu Premium"
            description="Conseils carrière et opportunités détaillées"
            price="9,99€"
            onUpgrade={onUpgrade}
          />
        )}
      </div>

      {/* Section Santé - PREMIUM */}
      <div style={{ position: 'relative', marginTop: '20px' }}>
        <div style={{
          filter: horoscope.tier === 'free' ? 'blur(4px)' : 'none',
          opacity: horoscope.tier === 'free' ? 0.5 : 1,
          pointerEvents: horoscope.tier === 'free' ? 'none' : 'auto',
          userSelect: horoscope.tier === 'free' ? 'none' : 'auto',
          transition: 'all 0.3s',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(16, 185, 129, 0.15))',
            border: '2px solid rgba(52, 211, 153, 0.4)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #34D399, #10B981)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Activity size={24} color="#FFF" />
                </div>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#A7F3D0',
                  margin: 0,
                }}>
                  Santé & Vitalité
                </h3>
              </div>
              {horoscope.tier !== 'free' && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                  color: '#FFF',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
                }}>
                  💎 PREMIUM
                </span>
              )}
            </div>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#E5E5E5',
              marginBottom: '16px',
            }}>
              Votre énergie est au maximum. C'est le moment idéal pour commencer une nouvelle routine sportive. Attention toutefois à ne pas en faire trop d'un coup.
            </p>

            <div style={{
              background: 'rgba(52, 211, 153, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(52, 211, 153, 0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={18} color="#34D399" />
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#A7F3D0', margin: 0 }}>
                  Conseil Bien-être
                </h4>
              </div>
              <p style={{ fontSize: '14px', color: '#E5E5E5', margin: 0 }}>
                Hydratez-vous régulièrement et privilégiez les activités en plein air.
              </p>
            </div>
          </div>
        </div>

        {horoscope.tier === 'free' && (
          <LockOverlay
            tier="premium"
            title="Contenu Premium"
            description="Conseils santé et bien-être personnalisés"
            price="9,99€"
            onUpgrade={onUpgrade}
          />
        )}
      </div>

      {/* SECTIONS ELITE - Floutées pour FREE et PREMIUM */}

      {/* Prédictions Hebdomadaires VIP - ELITE */}
      <div style={{ position: 'relative', marginTop: '20px' }}>
        <div style={{
          filter: horoscope.tier !== 'elite' ? 'blur(4px)' : 'none',
          opacity: horoscope.tier !== 'elite' ? 0.5 : 1,
          pointerEvents: horoscope.tier !== 'elite' ? 'none' : 'auto',
          userSelect: horoscope.tier !== 'elite' ? 'none' : 'auto',
          transition: 'all 0.3s',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))',
            border: '2px solid rgba(251, 191, 36, 0.4)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Calendar size={24} color="#FFF" />
                </div>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0,
                }}>
                  Prévisions Hebdo VIP
                </h3>
              </div>
              {horoscope.tier === 'elite' && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                  color: '#000',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                }}>
                  <Crown size={14} />
                  ÉLITE
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {[
                { day: 'LUN', date: '6', mood: 'excellent' },
                { day: 'MAR', date: '7', mood: 'bon' },
                { day: 'MER', date: '8', mood: 'moyen' },
                { day: 'JEU', date: '9', mood: 'excellent' },
                { day: 'VEN', date: '10', mood: 'bon' },
                { day: 'SAM', date: '11', mood: 'attention' },
                { day: 'DIM', date: '12', mood: 'bon' },
              ].map((d, i) => (
                <DayCard key={i} day={d.day} date={d.date} mood={d.mood} />
              ))}
            </div>

            <div style={{
              background: 'rgba(251, 191, 36, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(251, 191, 36, 0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Star size={18} color="#FBBF24" />
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#FEF3C7', margin: 0 }}>
                  Moments Clés de la Semaine
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { emoji: '✓', color: '#4ADE80', time: 'Mardi 10h-12h', text: 'Opportunité professionnelle majeure. Mars en harmonie favorise l\'action.' },
                  { emoji: '❤', color: '#EC4899', time: 'Jeudi 19h-22h', text: 'Période idéale pour rencontres. Vénus amplifie ton charisme.' },
                  { emoji: '⚠', color: '#FB923C', time: 'Samedi', text: 'Éviter décisions importantes. Mercure rétrograde peut créer confusion.' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px', color: '#E5E5E5' }}>
                    <span style={{ color: item.color, fontSize: '16px', flexShrink: 0 }}>{item.emoji}</span>
                    <span>
                      <strong style={{ color: '#FFF' }}>{item.time} :</strong> {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {horoscope.tier !== 'elite' && (
          <LockOverlay
            tier="elite"
            title="Contenu Élite"
            description="Prévisions hebdomadaires avec moments clés précis et coach IA personnalisé"
            price="14,99€"
            onUpgrade={onUpgrade}
          />
        )}
      </div>

      {/* Message Personnalisé Astra - ELITE */}
      <div style={{ position: 'relative', marginTop: '20px' }}>
        <div style={{
          filter: horoscope.tier !== 'elite' ? 'blur(4px)' : 'none',
          opacity: horoscope.tier !== 'elite' ? 0.5 : 1,
          pointerEvents: horoscope.tier !== 'elite' ? 'none' : 'auto',
          userSelect: horoscope.tier !== 'elite' ? 'none' : 'auto',
          transition: 'all 0.3s',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))',
            border: '2px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Sparkles size={24} color="#FFF" />
                </div>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #E9D5FF, #FBCFE8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0,
                }}>
                  Message d'Astra pour Toi
                </h3>
              </div>
              {horoscope.tier === 'elite' && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                  color: '#000',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                }}>
                  <Crown size={14} />
                  ÉLITE
                </span>
              )}
            </div>

            <div style={{
              background: 'rgba(168, 85, 247, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid rgba(168, 85, 247, 0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
                }}>
                  <Sparkles size={28} color="#FFF" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '15px',
                    lineHeight: '1.6',
                    color: '#F3E8FF',
                    fontStyle: 'italic',
                    marginBottom: '12px',
                  }}>
                    "Aujourd'hui est LE jour pour faire le premier pas. Vénus en harmonie avec ton Soleil amplifie ton charisme naturel. Entre 18h et 21h, ta confiance sera à son maximum. N'hésite pas à proposer cette sortie qui te trotte dans la tête. Les astres sont alignés en ta faveur. 💫"
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <div style={{
                      height: '1px',
                      flex: 1,
                      background: 'linear-gradient(to right, transparent, rgba(168, 85, 247, 0.5), transparent)',
                    }}></div>
                    <p style={{
                      fontSize: '12px',
                      color: '#C084FC',
                      fontWeight: '700',
                      margin: 0,
                    }}>
                      — Ton coach Astra 💜
                    </p>
                    <div style={{
                      height: '1px',
                      flex: 1,
                      background: 'linear-gradient(to right, transparent, rgba(168, 85, 247, 0.5), transparent)',
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {horoscope.tier !== 'elite' && (
          <LockOverlay
            tier="elite"
            title="Contenu Élite"
            description="Message personnalisé quotidien de ton coach IA Astra"
            price="14,99€"
            onUpgrade={onUpgrade}
          />
        )}
      </div>

      {/* Thème Astral Complet - ELITE */}
      <div style={{ position: 'relative', marginTop: '20px' }}>
        <div style={{
          filter: horoscope.tier !== 'elite' ? 'blur(4px)' : 'none',
          opacity: horoscope.tier !== 'elite' ? 0.5 : 1,
          pointerEvents: horoscope.tier !== 'elite' ? 'none' : 'auto',
          userSelect: horoscope.tier !== 'elite' ? 'none' : 'auto',
          transition: 'all 0.3s',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(59, 130, 246, 0.15))',
            border: '2px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #6366F1, #3B82F6)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <TrendingUp size={24} color="#FFF" />
                </div>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #C7D2FE, #BFDBFE)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0,
                }}>
                  Thème Astral Complet
                </h3>
              </div>
              {horoscope.tier === 'elite' && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                  color: '#000',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                }}>
                  <Crown size={14} />
                  ÉLITE
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { symbol: '☉', name: 'Soleil', sign: 'Gémeaux', house: '3' },
                { symbol: '☽', name: 'Lune', sign: 'Cancer', house: '4' },
                { symbol: '↑', name: 'Ascendant', sign: 'Vierge', house: '-' },
              ].map((p, i) => (
                <PlanetCard key={i} symbol={p.symbol} name={p.name} sign={p.sign} house={p.house} />
              ))}
            </div>

            <div style={{
              background: 'rgba(99, 102, 241, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Star size={18} color="#6366F1" />
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#C7D2FE', margin: 0 }}>
                  Transits Actuels
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { color: '#EC4899', label: 'Vénus trigone Soleil :', text: 'Période favorable pour l\'amour et les relations' },
                  { color: '#3B82F6', label: 'Mars en maison 7 :', text: 'Énergie relationnelle accrue, initiative dans les connexions' },
                  { color: '#A855F7', label: 'Jupiter sextile Lune :', text: 'Optimisme émotionnel, ouverture aux nouvelles expériences' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px', color: '#E5E5E5' }}>
                    <span style={{ color: item.color }}>•</span>
                    <span>
                      <strong style={{ color: '#FFF' }}>{item.label}</strong> {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {horoscope.tier !== 'elite' && (
          <LockOverlay
            tier="elite"
            title="Contenu Élite"
            description="Thème astral complet avec transits en temps réel et analyse approfondie"
            price="14,99€"
            onUpgrade={onUpgrade}
          />
        )}
      </div>
    </div>
  );
}

// Composants Helper

interface LockOverlayProps {
  tier: 'premium' | 'elite';
  title: string;
  description: string;
  price: string;
  onUpgrade?: () => void;
}

function LockOverlay({ tier, title, description, price, onUpgrade }: LockOverlayProps) {
  const tierColors = {
    premium: {
      bg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.95), rgba(236, 72, 153, 0.95))',
      icon: 'linear-gradient(135deg, #A855F7, #EC4899)',
      button: 'linear-gradient(135deg, #A855F7, #EC4899)',
    },
    elite: {
      bg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(245, 158, 11, 0.95))',
      icon: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
      button: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
    }
  };

  const colors = tierColors[tier];

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 20,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(2px)',
      borderRadius: '16px',
      padding: '24px',
    }}>
      <div style={{
        background: colors.bg,
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        padding: '24px 20px',
        border: '2px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        maxWidth: '320px',
        width: '85%',
        textAlign: 'center',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 12px',
          background: colors.icon,
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        }}>
          {tier === 'elite' ? (
            <Crown size={28} color="#FFF" />
          ) : (
            <Lock size={28} color="#FFF" />
          )}
        </div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '800',
          color: '#FFF',
          marginBottom: '10px',
          padding: '0 8px',
        }}>
          {title}
        </h3>
        <p style={{
          color: '#FFF',
          fontSize: '13px',
          marginBottom: '8px',
          lineHeight: '1.5',
          opacity: 0.95,
          padding: '0 8px',
        }}>
          {description}
        </p>
        <p style={{
          color: '#FFF',
          fontWeight: '700',
          fontSize: '18px',
          marginBottom: '16px',
        }}>
          {price}/mois
        </p>
        <button
          onClick={onUpgrade}
          style={{
            width: '100%',
            background: colors.button,
            color: tier === 'elite' ? '#000' : '#FFF',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          Débloquer Maintenant
        </button>
      </div>
    </div>
  );
}

interface DayCardProps {
  day: string;
  date: string;
  mood: string;
}

function DayCard({ day, date, mood }: DayCardProps) {
  const moodColors: Record<string, { bg: string; border: string; emoji: string }> = {
    excellent: { bg: 'rgba(52, 211, 153, 0.2)', border: 'rgba(52, 211, 153, 0.5)', emoji: '🔥' },
    bon: { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.5)', emoji: '✨' },
    moyen: { bg: 'rgba(251, 191, 36, 0.2)', border: 'rgba(251, 191, 36, 0.5)', emoji: '😐' },
    attention: { bg: 'rgba(251, 146, 60, 0.2)', border: 'rgba(251, 146, 60, 0.5)', emoji: '⚠️' }
  };

  const config = moodColors[mood] || moodColors.moyen;

  return (
    <div style={{
      background: config.bg,
      backdropFilter: 'blur(4px)',
      borderRadius: '12px',
      padding: '8px 4px',
      border: `2px solid ${config.border}`,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '9px', color: '#E5E5E5', marginBottom: '4px', fontWeight: '700' }}>{day}</div>
      <div style={{ fontSize: '18px', fontWeight: '800', color: '#FFF', marginBottom: '4px' }}>{date}</div>
      <div style={{ fontSize: '14px' }}>{config.emoji}</div>
    </div>
  );
}

interface PlanetCardProps {
  symbol: string;
  name: string;
  sign: string;
  house: string;
}

function PlanetCard({ symbol, name, sign, house }: PlanetCardProps) {
  return (
    <div style={{
      background: 'rgba(99, 102, 241, 0.2)',
      backdropFilter: 'blur(4px)',
      borderRadius: '12px',
      padding: '12px',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '32px', marginBottom: '6px' }}>{symbol}</div>
      <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>{name}</div>
      <div style={{ fontWeight: '700', color: '#FFF', fontSize: '13px' }}>{sign}</div>
      {house !== '-' && (
        <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>Maison {house}</div>
      )}
    </div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#A78BFA',
      }}>
        {icon}
        <span style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#9CA3AF',
        }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#FFF',
        textTransform: 'capitalize',
      }}>
        {value}
      </div>
    </div>
  );
}

interface EnergyMeterProps {
  label: string;
  value: number;
  color: string;
}

function EnergyMeter({ label, value, color }: EnergyMeterProps) {
  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '16px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
      }}>
        <span style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#E5E5E5',
        }}>
          {label}
        </span>
        <span style={{
          fontSize: '16px',
          fontWeight: '700',
          color: color,
        }}>
          {value}%
        </span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        background: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          borderRadius: '4px',
          transition: 'width 0.6s ease',
        }}></div>
      </div>
    </div>
  );
}
