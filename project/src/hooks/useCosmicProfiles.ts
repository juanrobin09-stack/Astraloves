import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface CosmicProfile {
  id: string;
  pseudo: string | null;
  age: number | null;
  avatar_url: string | null;
  bio: string | null;
  ville: string | null;
  interests: string[] | null;
  signe_solaire: string | null;
  premium_tier: string | null;
  is_verified: boolean;
  looking_for: string | null;
  last_seen_at: string | null;
  compatibility_score?: number;
}

interface UseCosmicProfilesReturn {
  profiles: CosmicProfile[];
  isLoading: boolean;
  error: string | null;
  refreshProfiles: () => Promise<void>;
  getProfileById: (id: string) => CosmicProfile | undefined;
}

export function useCosmicProfiles(
  currentUserId: string | null,
  maxProfiles: number = 50
): UseCosmicProfilesReturn {
  const [profiles, setProfiles] = useState<CosmicProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateCompatibility = (profile: CosmicProfile): number => {
    let score = 70;

    if (profile.bio) score += 5;
    if (profile.avatar_url) score += 10;
    if (profile.interests && profile.interests.length > 0) score += 5;
    if (profile.signe_solaire) score += 5;
    if (profile.is_verified) score += 5;

    return Math.min(score, 100);
  };

  const fetchProfiles = useCallback(async () => {
    if (!currentUserId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const { data, error: fetchError } = await supabase
        .from('astra_profiles')
        .select(`
          id,
          pseudo,
          age,
          avatar_url,
          bio,
          ville,
          interests,
          signe_solaire,
          premium_tier,
          is_verified,
          looking_for,
          last_seen_at
        `)
        .neq('id', currentUserId)
        .not('pseudo', 'is', null)
        .neq('pseudo', '')
        .not('avatar_url', 'is', null)
        .neq('avatar_url', '')
        .order('created_at', { ascending: false })
        .limit(maxProfiles);

      if (fetchError) throw fetchError;

      const validProfiles = (data || []).filter(profile =>
        profile.pseudo &&
        profile.pseudo.trim() !== '' &&
        profile.avatar_url &&
        profile.avatar_url.trim() !== '' &&
        profile.avatar_url.startsWith('http')
      );

      const profilesWithScores = validProfiles.map(profile => ({
        ...profile,
        compatibility_score: calculateCompatibility(profile)
      }));

      profilesWithScores.sort((a, b) =>
        (b.compatibility_score || 0) - (a.compatibility_score || 0)
      );

      setProfiles(profilesWithScores);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, maxProfiles]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const getProfileById = (id: string): CosmicProfile | undefined => {
    return profiles.find(p => p.id === id);
  };

  return {
    profiles,
    isLoading,
    error,
    refreshProfiles: fetchProfiles,
    getProfileById
  };
}

interface UseCurrentProfileReturn {
  profile: CosmicProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<CosmicProfile>) => Promise<boolean>;
  uploadPhoto: (file: File) => Promise<string | null>;
}

export function useCurrentProfile(userId: string | null): UseCurrentProfileReturn {
  const [profile, setProfile] = useState<CosmicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const { data, error: fetchError } = await supabase
          .from('astra_profiles')
          .select(`
            id,
            pseudo,
            age,
            avatar_url,
            bio,
            ville,
            interests,
            signe_solaire,
            premium_tier,
            is_verified,
            looking_for,
            last_seen_at
          `)
          .eq('id', userId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        setProfile(data);
      } catch (err) {
        console.error('Error fetching current profile:', err);
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (updates: Partial<CosmicProfile>): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('astra_profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return true;

    } catch (err) {
      console.error('Error updating profile:', err);
      return false;
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!userId) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });

      return publicUrl;

    } catch (err) {
      console.error('Error uploading photo:', err);
      return null;
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadPhoto
  };
}
