import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MapPin, Lock, Star, Sparkles } from 'lucide-react';
import { UniverseUser } from '../lib/universeService';

interface ProfileBottomSheetProps {
  user: UniverseUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSendSignal: (userId: string, type: 'signal' | 'super_nova') => void;
  userTier: 'gratuit' | 'premium' | 'premium_plus';
  canSendSignal: boolean;
  canViewDistance: boolean;
}

export default function ProfileBottomSheet({
  user,
  isOpen,
  onClose,
  onSendSignal,
  userTier,
  canSendSignal,
  canViewDistance
}: ProfileBottomSheetProps) {
  if (!user) return null;

  const photo = user.photo_principale || user.photos[0] || '';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-zinc-900 to-black rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
            style={{
              boxShadow: '0 -20px 60px rgba(220, 38, 38, 0.3)',
              borderTop: '1px solid rgba(220, 38, 38, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-xl z-10 px-6 pt-4 pb-3 border-b border-white/5">
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="px-6 pb-8">
              <div className="flex flex-col items-center mb-6">
                <div
                  className="relative rounded-2xl overflow-hidden mb-4"
                  style={{
                    width: '280px',
                    height: '360px',
                    border: '3px solid #DC2626',
                    boxShadow: '0 0 40px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt={user.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-white text-6xl font-medium">
                      {user.first_name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  {user.premium_tier !== 'gratuit' && (
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                      {user.premium_tier === 'premium_plus' ? (
                        <>
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-white font-medium">Elite</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-red-500" />
                          <span className="text-xs text-white font-medium">Premium</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <h2 className="text-3xl font-semibold text-white mb-2">
                  {user.first_name}, {user.age}
                </h2>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{user.signe_solaire}</span>
                  <span className="text-gray-600">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-500 text-sm font-medium">Compatibilité cosmique</span>
                    <span className="text-white font-bold text-lg">{user.compatibilite}%</span>
                  </div>
                </div>

                {canViewDistance && user.distance_km !== undefined ? (
                  <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                      {user.ville} • {user.distance_km < 1 ? "À moins d'1 km" : `À ${user.distance_km} km`}
                    </span>
                  </div>
                ) : userTier === 'gratuit' ? (
                  <div className="flex items-center gap-2 text-gray-600 mb-4 px-3 py-1.5 rounded-full bg-white/5">
                    <Lock className="w-3 h-3" />
                    <span className="text-xs">Distance visible en Premium</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{user.ville}</span>
                  </div>
                )}

                {user.bio && (
                  <p className="text-gray-300 text-center text-sm leading-relaxed mb-6 max-w-md">
                    {user.bio}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={() => onSendSignal(user.id, 'signal')}
                  disabled={!canSendSignal}
                  className="py-3 px-4 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  whileHover={canSendSignal ? { scale: 1.02 } : {}}
                  whileTap={canSendSignal ? { scale: 0.98 } : {}}
                >
                  <Send className="w-4 h-4" />
                  <span>Signal</span>
                </motion.button>

                <motion.button
                  onClick={() => onSendSignal(user.id, 'super_nova')}
                  disabled={userTier === 'gratuit'}
                  className="py-3 px-4 rounded-full border-2 border-yellow-500 text-yellow-500 font-medium flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
                  whileHover={userTier !== 'gratuit' ? { scale: 1.02 } : {}}
                  whileTap={userTier !== 'gratuit' ? { scale: 0.98 } : {}}
                >
                  {userTier !== 'gratuit' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  )}
                  <Star className="w-4 h-4 fill-current" />
                  <span>Super Nova</span>
                  {userTier === 'gratuit' && (
                    <Lock className="w-3 h-3 ml-1" />
                  )}
                </motion.button>
              </div>

              {userTier === 'gratuit' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-red-600/10 to-red-700/10 border border-red-600/20"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium mb-1">
                        Débloque toutes les fonctionnalités
                      </p>
                      <p className="text-gray-400 text-xs">
                        Voir la distance, envoyer des Super Nova illimités et plus encore
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
