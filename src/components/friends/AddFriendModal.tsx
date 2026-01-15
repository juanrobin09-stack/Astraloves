import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, Check, Clock, User } from 'lucide-react';
import { friendsService } from '@/services/friends/friendsService';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const SIGN_SYMBOLS: Record<string, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
  leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
  sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
  bélier: '♈', taureau: '♉', gémeaux: '♊', lion: '♌',
  vierge: '♍', balance: '♎', scorpion: '♏', sagittaire: '♐',
  capricorne: '♑', verseau: '♒', poissons: '♓'
};

function getSignSymbol(sign: string): string {
  return SIGN_SYMBOLS[sign?.toLowerCase()] || '✨';
}

interface AddFriendModalProps {
  onClose: () => void;
}

export function AddFriendModal({ onClose }: AddFriendModalProps) {
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  // Search users
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['searchUsers', searchQuery],
    queryFn: async () => {
      if (!profile || searchQuery.length < 2) return [];
      return friendsService.searchUsers(searchQuery, profile.id);
    },
    enabled: !!profile && searchQuery.length >= 2,
  });

  // Get pending sent requests to show status
  const { data: sentRequests } = useQuery({
    queryKey: ['sentFriendRequests', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      return friendsService.getSentRequests(profile.id);
    },
    enabled: !!profile,
  });

  // Get existing friends
  const { data: friends } = useQuery({
    queryKey: ['friends', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      return friendsService.getFriends(profile.id);
    },
    enabled: !!profile,
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (friendId: string) => {
      if (!profile) throw new Error('Not authenticated');
      return friendsService.sendFriendRequest(profile.id, friendId);
    },
    onSuccess: (data, friendId) => {
      if (data) {
        toast.success('Demande envoyée !');
        queryClient.invalidateQueries({ queryKey: ['sentFriendRequests'] });
      } else {
        toast.error('Demande déjà envoyée ou erreur');
      }
      setSendingTo(null);
    },
    onError: () => {
      toast.error('Erreur lors de l\'envoi');
      setSendingTo(null);
    },
  });

  const handleSendRequest = async (friendId: string) => {
    setSendingTo(friendId);
    sendRequestMutation.mutate(friendId);
  };

  const isFriend = (userId: string) => {
    return friends?.some(
      (f) => f.user_id === userId || f.friend_id === userId || f.friend_profile?.id === userId
    );
  };

  const hasPendingRequest = (userId: string) => {
    return sentRequests?.some((r) => r.friend_id === userId || r.friend_profile?.id === userId);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-cosmic-black border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-cosmic-purple" />
            Ajouter un ami
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par prénom..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-cosmic-purple focus:outline-none transition-colors"
              autoFocus
            />
          </div>
          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <p className="text-xs text-white/40 mt-2">Tapez au moins 2 caractères</p>
          )}
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[50vh]">
          {isSearching ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-cosmic-pulse text-2xl">✨</div>
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="p-2">
              {searchResults.map((user) => {
                const alreadyFriend = isFriend(user.id);
                const pending = hasPendingRequest(user.id);
                const isSending = sendingTo === user.id;

                return (
                  <motion.div
                    key={user.id}
                    className="p-3 flex items-center gap-3 hover:bg-white/5 rounded-xl transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cosmic-purple to-pink-500 flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{user.first_name}</span>
                        <span className="text-sm opacity-60">
                          {getSignSymbol(user.sun_sign)}
                        </span>
                      </div>
                      <p className="text-xs text-white/60">
                        {user.sun_sign} • {user.moon_sign}
                      </p>
                    </div>

                    {/* Action button */}
                    {alreadyFriend ? (
                      <div className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Ami
                      </div>
                    ) : pending ? (
                      <div className="px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        En attente
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(user.id)}
                        disabled={isSending}
                        className="px-3 py-2 bg-cosmic-purple hover:bg-cosmic-purple/80 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {isSending ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Ajouter
                          </>
                        )}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Search className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/60">Aucun utilisateur trouvé</p>
              <p className="text-xs text-white/40 mt-1">Essayez un autre prénom</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <UserPlus className="w-12 h-12 text-cosmic-purple/50 mb-4" />
              <p className="text-white/60">Recherchez des amis</p>
              <p className="text-xs text-white/40 mt-1">Tapez un prénom pour commencer</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
