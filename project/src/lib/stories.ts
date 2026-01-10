import { supabase } from './supabase';
import { SubscriptionTier } from './subscriptionLimits';

export interface Story {
  id: string;
  user_id: string;
  type: 'photo' | 'video';
  media_url: string;
  thumbnail_url?: string;
  duration: number;
  text_content?: string;
  text_color: string;
  text_position: { x: number; y: number };
  stickers: Sticker[];
  filters?: string;
  visibility: 'all' | 'friends' | 'compatible';
  views_count: number;
  replies_count: number;
  created_at: string;
  expires_at: string;
  viewed?: boolean;
  user_profile?: {
    username: string;
    photos: string[];
    is_premium: boolean;
  };
}

export interface Sticker {
  type: 'zodiac' | 'moon' | 'constellation' | 'message';
  value?: string;
  position: { x: number; y: number };
  scale: number;
  rotation?: number;
}

export interface StoryView {
  id: string;
  story_id: string;
  viewer_id: string;
  reaction?: 'heart' | 'star' | 'fire';
  viewed_at: string;
  viewer_profile?: {
    username: string;
    photos: string[];
    zodiac_sign?: string;
    is_premium: boolean;
  };
}

export interface StoryReply {
  id: string;
  story_id: string;
  from_user_id: string;
  to_user_id: string;
  message: string;
  created_at: string;
}

export async function checkUserPremium(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('astra_profiles')
      .select('is_premium')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.is_premium || false;
  } catch (error) {
    console.error('Check premium error:', error);
    return false;
  }
}

export async function createStory(
  userId: string,
  file: File,
  options: {
    type: 'photo' | 'video';
    text?: string;
    textColor?: string;
    textPosition?: { x: number; y: number };
    stickers?: Sticker[];
    filters?: string;
    visibility?: 'all' | 'friends' | 'compatible';
  }
): Promise<{ success: boolean; storyId?: string; error?: string }> {
  try {
    const isPremium = await checkUserPremium(userId);
    if (!isPremium) {
      return { success: false, error: 'Premium requis pour créer des stories' };
    }

    const fileName = `${userId}-${Date.now()}.${options.type === 'video' ? 'mp4' : 'jpg'}`;
    const filePath = `stories/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('stories')
      .upload(filePath, file, {
        contentType: options.type === 'video' ? 'video/mp4' : 'image/jpeg',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('stories')
      .getPublicUrl(filePath);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: userId,
        type: options.type,
        media_url: publicUrl,
        thumbnail_url: publicUrl,
        duration: options.type === 'video' ? 15 : 5,
        text_content: options.text,
        text_color: options.textColor || '#ffffff',
        text_position: options.textPosition || { x: 0.5, y: 0.5 },
        stickers: options.stickers || [],
        filters: options.filters,
        visibility: options.visibility || 'all',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, storyId: data.id };
  } catch (error: any) {
    console.error('Create story error:', error);
    return { success: false, error: error.message || 'Erreur lors de la création de la story' };
  }
}

export async function getActiveStories(currentUserId: string): Promise<{ [userId: string]: Story[] }> {
  try {
    const isPremium = await checkUserPremium(currentUserId);
    if (!isPremium) {
      return {};
    }

    const { data: stories, error } = await supabase
      .from('stories')
      .select(`
        *,
        user_profile:astra_profiles!stories_user_id_fkey(username, photos, is_premium)
      `)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!stories) return {};

    const { data: myViews } = await supabase
      .from('story_views')
      .select('story_id')
      .eq('viewer_id', currentUserId);

    const viewedStoryIds = new Set(myViews?.map(v => v.story_id) || []);

    const storiesWithViewed = stories.map(story => ({
      ...story,
      viewed: viewedStoryIds.has(story.id),
    }));

    const grouped: { [userId: string]: Story[] } = {};
    for (const story of storiesWithViewed) {
      if (!grouped[story.user_id]) {
        grouped[story.user_id] = [];
      }
      grouped[story.user_id].push(story);
    }

    return grouped;
  } catch (error) {
    console.error('Get stories error:', error);
    return {};
  }
}

export async function viewStory(storyId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('story_views')
      .insert({
        story_id: storyId,
        viewer_id: userId,
      });

    if (error && !error.message.includes('duplicate')) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('View story error:', error);
    return false;
  }
}

export async function reactToStory(
  storyId: string,
  userId: string,
  reaction: 'heart' | 'star' | 'fire'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('story_views')
      .update({ reaction })
      .eq('story_id', storyId)
      .eq('viewer_id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('React to story error:', error);
    return false;
  }
}

export async function replyToStory(
  storyId: string,
  fromUserId: string,
  toUserId: string,
  message: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('story_replies')
      .insert({
        story_id: storyId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        message,
      });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Reply to story error:', error);
    return false;
  }
}

export async function getStoryViews(storyId: string): Promise<StoryView[]> {
  try {
    const { data, error } = await supabase
      .from('story_views')
      .select(`
        *,
        viewer_profile:astra_profiles!story_views_viewer_id_fkey(username, photos, zodiac_sign, is_premium)
      `)
      .eq('story_id', storyId)
      .order('viewed_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Get story views error:', error);
    return [];
  }
}

export async function getStoryReplies(storyId: string): Promise<StoryReply[]> {
  try {
    const { data, error } = await supabase
      .from('story_replies')
      .select('*')
      .eq('story_id', storyId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Get story replies error:', error);
    return [];
  }
}

export async function deleteStory(storyId: string, userId: string): Promise<boolean> {
  try {
    const { data: story } = await supabase
      .from('stories')
      .select('media_url, user_id')
      .eq('id', storyId)
      .single();

    if (!story || story.user_id !== userId) {
      return false;
    }

    const fileName = story.media_url.split('/').pop();
    if (fileName) {
      await supabase.storage
        .from('stories')
        .remove([`stories/${fileName}`]);
    }

    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Delete story error:', error);
    return false;
  }
}

export function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays}j`;
}

export function getExpiresInHours(expiresAt: string): number {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();
  return Math.floor(diffMs / 3600000);
}


// Elite Features for Stories

export const COSMIC_STICKERS_ELITE = ['⭐', '🌙', '🚀', '🌌', '✨', '👑', '🔥', '❤️‍🔥', '💫', '🌠', '⚡', '💎'];

export const getStoryDuration = (subscriptionTier?: SubscriptionTier | null): number => {
  if (subscriptionTier === 'premium_elite') {
    return 72 * 60 * 60 * 1000; // 72h for Elite
  }
  return 24 * 60 * 60 * 1000; // 24h for others
};

export const canUseCosmicStickers = (subscriptionTier?: SubscriptionTier | null): boolean => {
  return subscriptionTier === 'premium_elite';
};

export const getStoryFeatures = (subscriptionTier?: SubscriptionTier | null) => {
  const isElite = subscriptionTier === 'premium_elite';
  
  return {
    duration: isElite ? '72h' : '24h',
    durationMs: getStoryDuration(subscriptionTier),
    cosmicStickers: isElite,
    advancedFilters: isElite,
    stickersList: isElite ? COSMIC_STICKERS_ELITE : ['⭐', '🌙', '❤️'],
    maxStickers: isElite ? 10 : 3,
  };
};
