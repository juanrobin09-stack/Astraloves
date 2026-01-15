// ═══════════════════════════════════════════════════════════════════════
// FRIENDS SERVICE
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '@/config/supabase';
import type { Friend, FriendRequest } from '@/types';

export const friendsService = {
  /**
   * Get all accepted friends for a user
   */
  async getFriends(userId: string): Promise<Friend[]> {
    try {
      // Get friends where user is either the requester or the receiver
      const { data: friendsAsRequester, error: error1 } = await supabase
        .from('friends')
        .select(`
          *,
          friend_profile:profiles!friends_friend_id_fkey(id, first_name, avatar_url, sun_sign, moon_sign)
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      const { data: friendsAsReceiver, error: error2 } = await supabase
        .from('friends')
        .select(`
          *,
          friend_profile:profiles!friends_user_id_fkey(id, first_name, avatar_url, sun_sign, moon_sign)
        `)
        .eq('friend_id', userId)
        .eq('status', 'accepted');

      if (error1) console.warn('Friends fetch error (requester):', error1.message);
      if (error2) console.warn('Friends fetch error (receiver):', error2.message);

      // Combine both lists
      const allFriends = [
        ...(friendsAsRequester || []),
        ...(friendsAsReceiver || []).map((f: any) => ({
          ...f,
          // Swap IDs so friend_profile is always the other user
          friend_profile: f.friend_profile,
        })),
      ];

      return allFriends as Friend[];
    } catch (err) {
      console.warn('Friends fetch failed');
      return [];
    }
  },

  /**
   * Get pending friend requests received by user
   */
  async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          requester_profile:profiles!friends_user_id_fkey(id, first_name, avatar_url, sun_sign, moon_sign)
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) {
        console.warn('Pending requests fetch error:', error.message);
        return [];
      }

      return (data || []) as FriendRequest[];
    } catch (err) {
      console.warn('Pending requests fetch failed');
      return [];
    }
  },

  /**
   * Get sent friend requests that are still pending
   */
  async getSentRequests(userId: string): Promise<Friend[]> {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          friend_profile:profiles!friends_friend_id_fkey(id, first_name, avatar_url, sun_sign, moon_sign)
        `)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) {
        console.warn('Sent requests fetch error:', error.message);
        return [];
      }

      return (data || []) as Friend[];
    } catch (err) {
      console.warn('Sent requests fetch failed');
      return [];
    }
  },

  /**
   * Send a friend request
   */
  async sendFriendRequest(userId: string, friendId: string): Promise<Friend | null> {
    try {
      // Check if a relationship already exists in either direction
      const { data: existing } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
        .single();

      if (existing) {
        console.warn('Friend relationship already exists');
        return null;
      }

      const { data, error } = await supabase
        .from('friends')
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: 'pending',
          requested_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Send friend request error:', error.message);
        return null;
      }

      return data as Friend;
    } catch (err) {
      console.error('Send friend request failed');
      return null;
    }
  },

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(requestId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friends')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('friend_id', userId); // Only the receiver can accept

      if (error) {
        console.error('Accept friend request error:', error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Accept friend request failed');
      return false;
    }
  },

  /**
   * Reject a friend request
   */
  async rejectFriendRequest(requestId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friends')
        .update({
          status: 'rejected',
        })
        .eq('id', requestId)
        .eq('friend_id', userId); // Only the receiver can reject

      if (error) {
        console.error('Reject friend request error:', error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Reject friend request failed');
      return false;
    }
  },

  /**
   * Remove a friend (delete the relationship)
   */
  async removeFriend(friendshipId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

      if (error) {
        console.error('Remove friend error:', error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Remove friend failed');
      return false;
    }
  },

  /**
   * Search users by name to add as friends
   */
  async searchUsers(query: string, currentUserId: string): Promise<any[]> {
    try {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, avatar_url, sun_sign, moon_sign')
        .ilike('first_name', `%${query}%`)
        .neq('id', currentUserId)
        .limit(10);

      if (error) {
        console.warn('Search users error:', error.message);
        return [];
      }

      return data || [];
    } catch (err) {
      console.warn('Search users failed');
      return [];
    }
  },

  /**
   * Check if two users are friends
   */
  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('id')
        .or(`and(user_id.eq.${userId1},friend_id.eq.${userId2}),and(user_id.eq.${userId2},friend_id.eq.${userId1})`)
        .eq('status', 'accepted')
        .single();

      if (error || !data) return false;
      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Get friendship status between two users
   */
  async getFriendshipStatus(
    userId: string,
    otherUserId: string
  ): Promise<'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected'> {
    try {
      // Check if current user sent a request
      const { data: sentRequest } = await supabase
        .from('friends')
        .select('status')
        .eq('user_id', userId)
        .eq('friend_id', otherUserId)
        .single();

      if (sentRequest) {
        if (sentRequest.status === 'pending') return 'pending_sent';
        if (sentRequest.status === 'accepted') return 'accepted';
        if (sentRequest.status === 'rejected') return 'rejected';
      }

      // Check if current user received a request
      const { data: receivedRequest } = await supabase
        .from('friends')
        .select('status')
        .eq('user_id', otherUserId)
        .eq('friend_id', userId)
        .single();

      if (receivedRequest) {
        if (receivedRequest.status === 'pending') return 'pending_received';
        if (receivedRequest.status === 'accepted') return 'accepted';
        if (receivedRequest.status === 'rejected') return 'rejected';
      }

      return 'none';
    } catch (err) {
      return 'none';
    }
  },
};
