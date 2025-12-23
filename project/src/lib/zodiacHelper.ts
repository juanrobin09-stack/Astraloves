export interface ZodiacSign {
  name: string;
  emoji: string;
  dateRange: string;
}

export const zodiacSigns: ZodiacSign[] = [
  { name: 'Bélier', emoji: '♈', dateRange: '21 mars - 19 avril' },
  { name: 'Taureau', emoji: '♉', dateRange: '20 avril - 20 mai' },
  { name: 'Gémeaux', emoji: '♊', dateRange: '21 mai - 20 juin' },
  { name: 'Cancer', emoji: '♋', dateRange: '21 juin - 22 juillet' },
  { name: 'Lion', emoji: '♌', dateRange: '23 juillet - 22 août' },
  { name: 'Vierge', emoji: '♍', dateRange: '23 août - 22 septembre' },
  { name: 'Balance', emoji: '♎', dateRange: '23 septembre - 22 octobre' },
  { name: 'Scorpion', emoji: '♏', dateRange: '23 octobre - 21 novembre' },
  { name: 'Sagittaire', emoji: '♐', dateRange: '22 novembre - 21 décembre' },
  { name: 'Capricorne', emoji: '♑', dateRange: '22 décembre - 19 janvier' },
  { name: 'Verseau', emoji: '♒', dateRange: '20 janvier - 18 février' },
  { name: 'Poissons', emoji: '♓', dateRange: '19 février - 20 mars' }
];

export function getZodiacSign(dateString: string): ZodiacSign {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return zodiacSigns[0];
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return zodiacSigns[1];
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return zodiacSigns[2];
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return zodiacSigns[3];
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return zodiacSigns[4];
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return zodiacSigns[5];
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return zodiacSigns[6];
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return zodiacSigns[7];
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return zodiacSigns[8];
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return zodiacSigns[9];
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return zodiacSigns[10];
  return zodiacSigns[11];
}

export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function calculateProfileCompletion(profile: {
  first_name?: string;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
  photos?: any[];
  bio?: string;
  interets?: any[];
  ville?: string;
  gender?: string;
  seeking?: string;
}): number {
  const fields = [
    { key: 'first_name', weight: 10 },
    { key: 'birth_date', weight: 10 },
    { key: 'birth_time', weight: 10 },
    { key: 'birth_place', weight: 10 },
    { key: 'photos', weight: 20, check: (v: any) => v && v.length > 0 },
    { key: 'bio', weight: 15, check: (v: any) => v && v.length >= 50 },
    { key: 'interets', weight: 10, check: (v: any) => v && v.length >= 3 },
    { key: 'ville', weight: 10 },
    { key: 'gender', weight: 5 },
    { key: 'seeking', weight: 5 }
  ];

  let totalCompleted = 0;

  fields.forEach(field => {
    const value = (profile as any)[field.key];
    const isCompleted = field.check ? field.check(value) : value !== null && value !== undefined && value !== '';
    if (isCompleted) {
      totalCompleted += field.weight;
    }
  });

  return Math.round(totalCompleted);
}

export const getZodiacEmoji = (sign: string): string => {
  const emojis: Record<string, string> = {
    "Bélier": "♈", "Taureau": "♉", "Gémeaux": "♊", "Cancer": "♋",
    "Lion": "♌", "Vierge": "♍", "Balance": "♎", "Scorpion": "♏",
    "Sagittaire": "♐", "Capricorne": "♑", "Verseau": "♒", "Poissons": "♓"
  };
  return emojis[sign] || "⭐";
};

export const getZodiacElement = (sign: string): string => {
  const elements: Record<string, string> = {
    "Bélier": "🔥 Feu", "Lion": "🔥 Feu", "Sagittaire": "🔥 Feu",
    "Taureau": "🌍 Terre", "Vierge": "🌍 Terre", "Capricorne": "🌍 Terre",
    "Gémeaux": "💨 Air", "Balance": "💨 Air", "Verseau": "💨 Air",
    "Cancer": "💧 Eau", "Scorpion": "💧 Eau", "Poissons": "💧 Eau"
  };
  return elements[sign] || "";
};

export const getZodiacPlanet = (sign: string): string => {
  const planets: Record<string, string> = {
    "Bélier": "Mars", "Taureau": "Vénus", "Gémeaux": "Mercure",
    "Cancer": "Lune", "Lion": "Soleil", "Vierge": "Mercure",
    "Balance": "Vénus", "Scorpion": "Pluton", "Sagittaire": "Jupiter",
    "Capricorne": "Saturne", "Verseau": "Uranus", "Poissons": "Neptune"
  };
  return planets[sign] || "";
};

export const getZodiacDates = (sign: string): string => {
  const dates: Record<string, string> = {
    "Bélier": "21 mars - 19 avril", "Taureau": "20 avril - 20 mai",
    "Gémeaux": "21 mai - 20 juin", "Cancer": "21 juin - 22 juillet",
    "Lion": "23 juillet - 22 août", "Vierge": "23 août - 22 septembre",
    "Balance": "23 sept - 22 octobre", "Scorpion": "23 oct - 21 novembre",
    "Sagittaire": "22 nov - 21 décembre", "Capricorne": "22 déc - 19 janvier",
    "Verseau": "20 janvier - 18 février", "Poissons": "19 février - 20 mars"
  };
  return dates[sign] || "";
};

export const seededRandom = (seed: number, min: number, max: number): number => {
  const x = Math.sin(seed) * 10000;
  const rand = x - Math.floor(x);
  return Math.floor(rand * (max - min + 1)) + min;
};

export const signIndex = (sign: string): number => {
  const signs = ["Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge", "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons"];
  return signs.indexOf(sign);
};

export const isMercuryRetrograde = (date: Date): boolean => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  if (year === 2025) {
    if ((month === 2 && day >= 15) || (month === 3 && day <= 7)) return true;
    if ((month === 6 && day >= 18) || (month === 7 && day <= 11)) return true;
    if ((month === 9 && day >= 9) || (month === 10 && day <= 1)) return true;
  }

  return false;
};

export const getCurrentMoonPhase = () => {
  const lunarCycle = 29.53059;
  const knownNewMoon = new Date('2024-01-11');
  const now = new Date();
  const diff = now.getTime() - knownNewMoon.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  const phase = (days % lunarCycle) / lunarCycle;

  if (phase < 0.03 || phase > 0.97) {
    return {
      emoji: "🌑",
      name: "Nouvelle Lune",
      description: "Temps des nouveaux départs et des intentions.",
      loveAdvice: "Parfait pour envoyer un premier message ou matcher avec quelqu'un de nouveau."
    };
  } else if (phase < 0.22) {
    return {
      emoji: "🌒",
      name: "Premier Croissant",
      description: "L'énergie monte, les projets prennent forme.",
      loveAdvice: "Tes efforts en séduction commencent à porter leurs fruits."
    };
  } else if (phase < 0.28) {
    return {
      emoji: "🌓",
      name: "Premier Quartier",
      description: "Temps d'action et de décision.",
      loveAdvice: "C'est le moment de proposer un date ou de faire avancer les choses."
    };
  } else if (phase < 0.47) {
    return {
      emoji: "🌔",
      name: "Lune Gibbeuse",
      description: "Affinage et perfectionnement.",
      loveAdvice: "Peaufine ton profil, améliore tes conversations."
    };
  } else if (phase < 0.53) {
    return {
      emoji: "🌕",
      name: "Pleine Lune",
      description: "Émotions à leur apogée, révélations.",
      loveAdvice: "Les sentiments sont intenses. Idéal pour les déclarations... ou les fins."
    };
  } else if (phase < 0.72) {
    return {
      emoji: "🌖",
      name: "Lune Gibbeuse Décroissante",
      description: "Gratitude et partage.",
      loveAdvice: "Apprécie ce que tu as construit. Remercie ceux qui comptent."
    };
  } else if (phase < 0.78) {
    return {
      emoji: "🌗",
      name: "Dernier Quartier",
      description: "Lâcher-prise et bilan.",
      loveAdvice: "Temps de faire le tri. Cette connexion te fait-elle vraiment du bien ?"
    };
  } else {
    return {
      emoji: "🌘",
      name: "Dernier Croissant",
      description: "Repos et préparation.",
      loveAdvice: "Prends du recul, repose-toi. La prochaine nouvelle lune approche."
    };
  }
};

export const isFullMoon = (date: Date): boolean => {
  const phase = getCurrentMoonPhase();
  return phase.name === "Pleine Lune";
};

export const isNewMoon = (date: Date): boolean => {
  const phase = getCurrentMoonPhase();
  return phase.name === "Nouvelle Lune";
};
