// ═══════════════════════════════════════════════════════════════════════
// SUPABASE STORAGE HELPER
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '../config/supabase';

const BUCKETS = {
  AVATARS: 'avatars',
  PHOTOS: 'photos',
  PROFILES: 'profiles',
} as const;

/**
 * Obtenir URL publique d'une image
 */
export const getPublicUrl = (bucket: string, path: string): string | null => {
  try {
    if (!path) return null;
    
    // Si déjà une URL complète, retourner telle quelle
    if (path.startsWith('http')) {
      return path;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  } catch (error) {
    console.error('Error getting public URL:', error);
    return null;
  }
};

/**
 * Obtenir URL avatar utilisateur
 */
export const getAvatarUrl = (userId: string, photoIndex: number = 1): string | null => {
  const path = `${userId}/photo${photoIndex}.jpg`;
  return getPublicUrl(BUCKETS.AVATARS, path);
};

/**
 * Upload image avec redimensionnement
 */
export const uploadImage = async (
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    // Upload fichier
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true, // Remplace si existe déjà
      });

    if (uploadError) {
      throw uploadError;
    }

    // Obtenir URL publique
    const url = getPublicUrl(bucket, path);

    return { url, error: null };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { url: null, error: error as Error };
  }
};

/**
 * Supprimer image
 */
export const deleteImage = async (
  bucket: string,
  path: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { error: error as Error };
  }
};

/**
 * Component Image avec fallback
 */
export const SafeImage = ({ 
  src, 
  alt, 
  fallback = '/placeholder-avatar.png',
  className = '',
  ...props 
}: {
  src: string | null;
  alt: string;
  fallback?: string;
  className?: string;
  [key: string]: any;
}) => {
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  const imageSrc = error || !src ? fallback : src;

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-zinc-800 animate-pulse rounded-lg" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        {...props}
      />
    </div>
  );
};

export { BUCKETS };
