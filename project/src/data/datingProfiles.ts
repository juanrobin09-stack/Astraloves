export interface DatingProfile {
  id: number | string;
  name: string;
  first_name?: string;
  age: number;
  location: string;
  photo: string;
  photos?: string[];
  banner?: string | null;
  compatibility: number;
  zodiac: string;
  bio: string;
  verified: boolean;
  interests?: string[];
  isPremium?: boolean;
  isVerified?: boolean;
  isOnline?: boolean;
}

export const datingProfiles: DatingProfile[] = [];

export const getZodiacEmoji = (sign: string): string => {
  const zodiacs: Record<string, string> = {
    'Bélier': '♈',
    'Taureau': '♉',
    'Gémeaux': '♊',
    'Cancer': '♋',
    'Lion': '♌',
    'Vierge': '♍',
    'Balance': '♎',
    'Scorpion': '♏',
    'Sagittaire': '♐',
    'Capricorne': '♑',
    'Verseau': '♒',
    'Poissons': '♓'
  };
  return zodiacs[sign] || '⭐';
};

export const getBioIcon = (id: number): string => {
  const icons = ['❤️‍🔥', '✨', '🌟', '💫', '🔥', '⭐', '💖', '🌙'];
  return icons[id % icons.length];
};
