import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Profile {
  id: number;
  name: string;
  age: number;
  location: string;
  sign: string;
  compatibility: number;
  verified: boolean;
  plan: 'free' | 'premium' | 'premium-plus';
  photo: string;
  photos: string[];
  bio: string;
  interests: string[];
}

interface DiscoverSwipeProps {
  onNavigate?: (page: string) => void;
}

export default function DiscoverSwipe({ onNavigate }: DiscoverSwipeProps) {
  const [profiles] = useState<Profile[]>(generateTestProfiles());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  const currentProfile = profiles[currentIndex];

  const handleSwipe = (direction: 'left' | 'right' | 'super') => {
    setDragDirection(direction === 'super' ? 'right' : direction);

    if (direction === 'right' || direction === 'super') {
      console.log('❤️ MATCH avec', currentProfile.name);
    } else if (direction === 'left') {
      console.log('👋 Pass', currentProfile.name);
    }

    setTimeout(() => {
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(-1);
      }
      setDragDirection(null);
    }, 300);
  };

  const handleDragEnd = (_event: any, info: any) => {
    const threshold = 150;

    if (info.offset.x > threshold) {
      handleSwipe('right');
    } else if (info.offset.x < -threshold) {
      handleSwipe('left');
    }
  };

  if (currentIndex === -1 || !currentProfile) {
    return <NoMoreProfiles onReload={() => setCurrentIndex(0)} />;
  }

  return (
    <div className="min-h-screen bg-black px-4 pb-24">
      <div className="flex justify-between items-center mb-5 pt-4">
        <h1 className="text-3xl font-bold text-white">💫 Découvrir</h1>
        <div className="bg-red-500/20 text-red-500 px-4 py-2 rounded-full text-sm font-bold">
          {profiles.length - currentIndex} profils
        </div>
      </div>

      <div className="relative w-full max-w-lg mx-auto h-[600px]" style={{ perspective: '1000px' }}>
        <AnimatePresence>
          {profiles[currentIndex + 1] && (
            <div
              className="absolute w-full h-full rounded-3xl overflow-hidden opacity-50"
              style={{
                transform: 'scale(0.95)',
                zIndex: 1,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)'
              }}
            >
              <img
                src={profiles[currentIndex + 1].photo}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <motion.div
            key={currentProfile.id}
            className="absolute w-full h-full bg-neutral-900 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing"
            style={{
              zIndex: 2,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 0 2px rgba(239, 68, 68, 0.2)'
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              x: dragDirection === 'left' ? -500 : 500,
              opacity: 0,
              rotate: dragDirection === 'left' ? -20 : 20,
              transition: { duration: 0.3 }
            }}
          >
            <div className="relative w-full h-full">
              <img
                src={currentProfile.photo}
                alt={currentProfile.name}
                className="w-full h-full object-cover"
              />

              <div className="absolute top-3 left-3 right-3 flex gap-1.5 z-10">
                {currentProfile.photos.map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded ${i === 0 ? 'bg-white' : 'bg-white/30'}`}
                  />
                ))}
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-3/5"
                style={{
                  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.6) 50%, transparent 100%)'
                }}
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <div className="mb-4">
                <h2 className="text-3xl font-bold text-white flex items-center gap-2 mb-1">
                  {currentProfile.name}
                  {currentProfile.verified && (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-sm">
                      ✓
                    </span>
                  )}
                  {currentProfile.plan === 'premium' && <span className="text-xl">💎</span>}
                  {currentProfile.plan === 'premium-plus' && <span className="text-xl">👑</span>}
                </h2>
                <p className="text-neutral-400 text-base">
                  {currentProfile.age} ans • {currentProfile.location}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-full mb-4">
                <span className="text-xl">{getSignEmoji(currentProfile.sign)}</span>
                <span className="text-sm text-red-500 font-bold">{currentProfile.sign}</span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-2 text-xs text-neutral-400">
                  <span>Compatibilité</span>
                  <span className="text-green-500 font-bold text-base">{currentProfile.compatibility}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${currentProfile.compatibility}%`,
                      background: 'linear-gradient(90deg, #ef4444, #10b981)'
                    }}
                  />
                </div>
              </div>

              <p className="text-white text-sm leading-relaxed mb-3">
                {currentProfile.bio}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {currentProfile.interests.slice(0, 3).map(interest => (
                  <span
                    key={interest}
                    className="bg-white/10 text-white px-3 py-1.5 rounded-full text-xs font-semibold"
                  >
                    {interest}
                  </span>
                ))}
              </div>

              <button
                className="w-full py-3.5 bg-transparent border-2 border-white/30 rounded-xl text-white text-sm font-bold hover:bg-white/10 hover:border-red-500 transition-all"
                onClick={() => console.log('Voir profil:', currentProfile.name)}
              >
                Voir le profil complet
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex gap-5 z-50">
        <button
          className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-3xl hover:scale-95 transition-transform active:scale-90"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)' }}
          onClick={() => handleSwipe('left')}
        >
          <span className="text-red-500">✕</span>
        </button>

        <button
          className="w-14 h-14 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-2xl hover:scale-95 transition-transform active:scale-90"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)' }}
          onClick={() => handleSwipe('super')}
        >
          <span className="text-blue-500">⭐</span>
        </button>

        <button
          className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-3xl hover:scale-95 transition-transform active:scale-90"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)' }}
          onClick={() => handleSwipe('right')}
        >
          <span className="text-green-500">❤️</span>
        </button>
      </div>

      {currentIndex === 0 && (
        <div className="fixed bottom-40 left-0 right-0 text-center z-10 animate-pulse">
          <p className="inline-block bg-neutral-900/90 text-neutral-400 px-6 py-3 rounded-full text-xs">
            ← Glisse pour passer • Glisse pour liker →
          </p>
        </div>
      )}
    </div>
  );
}

function NoMoreProfiles({ onReload }: { onReload: () => void }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-10">
      <div className="text-center max-w-md">
        <div className="relative h-24 mb-8">
          <span className="absolute left-[10%] text-5xl animate-bounce">⭐</span>
          <span className="absolute left-1/2 -translate-x-1/2 text-5xl animate-bounce" style={{ animationDelay: '1s' }}>✨</span>
          <span className="absolute right-[10%] text-5xl animate-bounce" style={{ animationDelay: '2s' }}>💫</span>
        </div>

        <h2 className="text-3xl font-bold text-white mb-3">Tu as tout vu ! 🌌</h2>
        <p className="text-neutral-400 text-base mb-8">
          Reviens plus tard pour découvrir de nouvelles âmes cosmiques
        </p>

        <button
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl text-white font-bold text-base mb-12 hover:from-red-600 hover:to-red-700 transition-all"
          style={{ boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)' }}
          onClick={onReload}
        >
          <span className="text-xl">🔄</span>
          Recharger les profils
        </button>

        <div>
          <h3 className="text-lg text-neutral-400 mb-5">En attendant...</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-center">
              <span className="text-4xl block mb-2">💬</span>
              <p className="text-xs text-neutral-400">Va parler à tes matchs</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-center">
              <span className="text-4xl block mb-2">⭐</span>
              <p className="text-xs text-neutral-400">Améliore ton profil</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-center">
              <span className="text-4xl block mb-2">🎥</span>
              <p className="text-xs text-neutral-400">Lance un Live</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateTestProfiles(): Profile[] {
  return [];
}

function getSignEmoji(sign: string): string {
  const emojis: Record<string, string> = {
    'Bélier': '♈',
    'Taureau': '♉',
    'Gémeaux': '♊',
    'Cancer': '♋',
    'Lion': '♌',
    'Vierge': '♍',
    'Balance': '♎',
    'Scorpion': '♏',
    'Sagittaire': '♐',
    'Capricorne': '♑',
    'Verseau': '♒',
    'Poissons': '♓'
  };
  return emojis[sign] || '⭐';
}
