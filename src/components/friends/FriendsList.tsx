import { motion } from 'framer-motion';
import { User, MessageCircle, UserMinus, Users } from 'lucide-react';
import { friendsService } from '@/services/friends/friendsService';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Friend } from '@/types';

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

interface FriendsListProps {
  onStartChat?: (friendId: string) => void;
}

export function FriendsList({ onStartChat }: FriendsListProps) {
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();

  // Get friends list
  const { data: friends, isLoading } = useQuery({
    queryKey: ['friends', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      return friendsService.getFriends(profile.id);
    },
    enabled: !!profile,
  });

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      if (!profile) throw new Error('Not authenticated');
      return friendsService.removeFriend(friendshipId, profile.id);
    },
    onSuccess: () => {
      toast.success('Ami supprimé');
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const getFriendProfile = (friend: Friend) => {
    // The friend_profile should be the other user
    return friend.friend_profile;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-cosmic-pulse text-2xl">✨</div>
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Users className="w-12 h-12 text-cosmic-purple/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucun ami pour le moment</h3>
        <p className="text-white/60 text-sm">
          Ajoutez des amis pour discuter et partager votre voyage cosmique !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {friends.map((friend) => {
        const friendProfile = getFriendProfile(friend);

        return (
          <motion.div
            key={friend.id}
            className="p-3 flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cosmic-purple to-pink-500 flex items-center justify-center overflow-hidden">
              {friendProfile?.avatar_url ? (
                <img src={friendProfile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {friendProfile?.first_name || 'Ami'}
                </span>
                <span className="text-sm opacity-60">
                  {getSignSymbol(friendProfile?.sun_sign || '')}
                </span>
              </div>
              <p className="text-xs text-white/60">
                {friendProfile?.sun_sign} • {friendProfile?.moon_sign}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {onStartChat && (
                <button
                  onClick={() => onStartChat(friendProfile?.id || friend.friend_id)}
                  className="p-2 bg-cosmic-purple/20 hover:bg-cosmic-purple/40 rounded-lg transition-colors"
                  title="Envoyer un message"
                >
                  <MessageCircle className="w-4 h-4 text-cosmic-purple" />
                </button>
              )}
              <button
                onClick={() => removeFriendMutation.mutate(friend.id)}
                className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors"
                title="Supprimer l'ami"
              >
                <UserMinus className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
