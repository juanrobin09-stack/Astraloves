import { supabase } from './supabase';

export class StatsTracker {
  private static async increment(userId: string, statName: string, incrementBy: number = 1) {
    try {
      const { error } = await supabase.rpc('increment_user_stat', {
        user_id: userId,
        stat_name: statName,
        increment_by: incrementBy
      });

      if (error) {
        console.error(`[StatsTracker] Erreur incrémentation ${statName}:`, error);
        return false;
      }

      return true;
    } catch (err) {
      console.error(`[StatsTracker] Erreur:`, err);
      return false;
    }
  }

  static async trackProfileView(viewedUserId: string, viewerUserId: string) {
    if (viewedUserId === viewerUserId) return;
    await this.increment(viewedUserId, 'profile_views');
  }

  static async trackLike(likedUserId: string) {
    await this.increment(likedUserId, 'likes_received');
  }

  static async trackMatch(userId1: string, userId2: string) {
    await Promise.all([
      this.increment(userId1, 'matches_count'),
      this.increment(userId2, 'matches_count')
    ]);
  }

  static async trackMessage(senderId: string) {
    await this.increment(senderId, 'messages_sent');
  }

  static async trackSwipe(userId: string) {
    await this.increment(userId, 'swipes_count');
  }

  static async recalculateScore(userId: string) {
    try {
      const { data, error } = await supabase.rpc('calculate_profile_score', {
        user_id: userId
      });

      if (error) {
        console.error('[StatsTracker] Erreur calcul score:', error);
        return null;
      }

      return data as number;
    } catch (err) {
      console.error('[StatsTracker] Erreur:', err);
      return null;
    }
  }
}
