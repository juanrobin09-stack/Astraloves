// ═══════════════════════════════════════════════════════════════════════
// PHOTO SERVICE - Upload photos Supabase Storage
// ═══════════════════════════════════════════════════════════════════════

import { supabase, handleSupabaseError } from '@/config/supabase';
import type { Photo } from '@/types';

const BUCKET_NAME = 'profile-photos';

export const photoService = {
  async uploadPhoto(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file);

    if (error) handleSupabaseError(error);

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  async deletePhoto(url: string) {
    const path = url.split(`/${BUCKET_NAME}/`)[1];
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) handleSupabaseError(error);
  },

  async updateProfilePhotos(userId: string, photos: Photo[]) {
    const avatarUrl = photos.find(p => p.isPrimary)?.url || photos[0]?.url;

    const { error } = await supabase
      .from('profiles')
      .update({
        photos,
        avatar_url: avatarUrl,
      })
      .eq('id', userId);

    if (error) handleSupabaseError(error);
  },
};
