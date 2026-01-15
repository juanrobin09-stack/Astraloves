import { motion } from 'framer-motion';
import { User, Check, X, Bell } from 'lucide-react';
import { friendsService } from '@/services/friends/friendsService';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FriendRequest } from '@/types';

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

export function FriendRequests() {
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();

  // Get pending friend requests
  const { data: pendingRequests, isLoading } = useQuery({
    queryKey: ['pendingFriendRequests', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      return friendsService.getPendingRequests(profile.id);
    },
    enabled: !!profile,
  });

  // Accept friend request mutation
  const acceptMutation = useMutation({
    mutationFn: async (requestId: string) => {
      if (!profile) throw new Error('Not authenticated');
      return friendsService.acceptFriendRequest(requestId, profile.id);
    },
    onSuccess: () => {
      toast.success('Demande acceptée !');
      queryClient.invalidateQueries({ queryKey: ['pendingFriendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: () => {
      toast.error('Erreur lors de l\'acceptation');
    },
  });

  // Reject friend request mutation
  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      if (!profile) throw new Error('Not authenticated');
      return friendsService.rejectFriendRequest(requestId, profile.id);
    },
    onSuccess: () => {
      toast.success('Demande refusée');
      queryClient.invalidateQueries({ queryKey: ['pendingFriendRequests'] });
    },
    onError: () => {
      toast.error('Erreur lors du refus');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-cosmic-pulse text-xl">✨</div>
      </div>
    );
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return null;
  }

  return (
    <div className="p-4 border-b border-white/10 bg-cosmic-purple/10">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-cosmic-gold" />
        <span className="text-sm font-medium text-cosmic-gold">
          {pendingRequests.length} demande{pendingRequests.length > 1 ? 's' : ''} en attente
        </span>
      </div>

      <div className="space-y-2">
        {pendingRequests.map((request: FriendRequest) => {
          const requester = request.requester_profile;

          return (
            <motion.div
              key={request.id}
              className="p-3 flex items-center gap-3 bg-white/5 rounded-xl"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-purple to-pink-500 flex items-center justify-center overflow-hidden">
                {requester?.avatar_url ? (
                  <img src={requester.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-semibold truncate">
                    {requester?.first_name || 'Utilisateur'}
                  </span>
                  <span className="text-xs opacity-60">
                    {getSignSymbol(requester?.sun_sign || '')}
                  </span>
                </div>
                <p className="text-xs text-white/60">veut être ton ami</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => acceptMutation.mutate(request.id)}
                  disabled={acceptMutation.isPending}
                  className="p-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg transition-colors disabled:opacity-50"
                  title="Accepter"
                >
                  <Check className="w-4 h-4 text-green-400" />
                </button>
                <button
                  onClick={() => rejectMutation.mutate(request.id)}
                  disabled={rejectMutation.isPending}
                  className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors disabled:opacity-50"
                  title="Refuser"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
