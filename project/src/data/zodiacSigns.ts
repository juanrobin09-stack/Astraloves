export interface ZodiacSign {
  name: string;
  emoji: string;
  dateRange: string;
  element: 'Feu' | 'Terre' | 'Air' | 'Eau';
  startDate: { month: number; day: number };
  endDate: { month: number; day: number };
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    name: 'Bélier',
    emoji: '♈',
    dateRange: '21 mars - 19 avril',
    element: 'Feu',
    startDate: { month: 3, day: 21 },
    endDate: { month: 4, day: 19 }
  },
  {
    name: 'Taureau',
    emoji: '♉',
    dateRange: '20 avril - 20 mai',
    element: 'Terre',
    startDate: { month: 4, day: 20 },
    endDate: { month: 5, day: 20 }
  },
  {
    name: 'Gémeaux',
    emoji: '♊',
    dateRange: '21 mai - 20 juin',
    element: 'Air',
    startDate: { month: 5, day: 21 },
    endDate: { month: 6, day: 20 }
  },
  {
    name: 'Cancer',
    emoji: '♋',
    dateRange: '21 juin - 22 juillet',
    element: 'Eau',
    startDate: { month: 6, day: 21 },
    endDate: { month: 7, day: 22 }
  },
  {
    name: 'Lion',
    emoji: '♌',
    dateRange: '23 juillet - 22 août',
    element: 'Feu',
    startDate: { month: 7, day: 23 },
    endDate: { month: 8, day: 22 }
  },
  {
    name: 'Vierge',
    emoji: '♍',
    dateRange: '23 août - 22 septembre',
    element: 'Terre',
    startDate: { month: 8, day: 23 },
    endDate: { month: 9, day: 22 }
  },
  {
    name: 'Balance',
    emoji: '♎',
    dateRange: '23 septembre - 22 octobre',
    element: 'Air',
    startDate: { month: 9, day: 23 },
    endDate: { month: 10, day: 22 }
  },
  {
    name: 'Scorpion',
    emoji: '♏',
    dateRange: '23 octobre - 21 novembre',
    element: 'Eau',
    startDate: { month: 10, day: 23 },
    endDate: { month: 11, day: 21 }
  },
  {
    name: 'Sagittaire',
    emoji: '♐',
    dateRange: '22 novembre - 21 décembre',
    element: 'Feu',
    startDate: { month: 11, day: 22 },
    endDate: { month: 12, day: 21 }
  },
  {
    name: 'Capricorne',
    emoji: '♑',
    dateRange: '22 décembre - 19 janvier',
    element: 'Terre',
    startDate: { month: 12, day: 22 },
    endDate: { month: 1, day: 19 }
  },
  {
    name: 'Verseau',
    emoji: '♒',
    dateRange: '20 janvier - 18 février',
    element: 'Air',
    startDate: { month: 1, day: 20 },
    endDate: { month: 2, day: 18 }
  },
  {
    name: 'Poissons',
    emoji: '♓',
    dateRange: '19 février - 20 mars',
    element: 'Eau',
    startDate: { month: 2, day: 19 },
    endDate: { month: 3, day: 20 }
  }
];

export const getSignDateRange = (sign: string): string => {
  return ZODIAC_SIGNS.find(s => s.name.toLowerCase() === sign.toLowerCase())?.dateRange || '';
};

export const getSignByName = (name: string): ZodiacSign | undefined => {
  return ZODIAC_SIGNS.find(s => s.name.toLowerCase() === name.toLowerCase());
};

export const getSignFromDate = (date: Date): ZodiacSign | undefined => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return ZODIAC_SIGNS.find(sign => {
    const { startDate, endDate } = sign;

    if (startDate.month === endDate.month) {
      return month === startDate.month && day >= startDate.day && day <= endDate.day;
    }

    if (startDate.month > endDate.month) {
      return (
        (month === startDate.month && day >= startDate.day) ||
        (month === endDate.month && day <= endDate.day)
      );
    }

    return (
      (month === startDate.month && day >= startDate.day) ||
      (month > startDate.month && month < endDate.month) ||
      (month === endDate.month && day <= endDate.day)
    );
  });
};

export const ELEMENT_COLORS = {
  'Feu': {
    gradient: 'from-red-900/30 to-orange-900/20',
    border: 'border-red-500/30',
    text: 'text-red-400'
  },
  'Terre': {
    gradient: 'from-green-900/30 to-emerald-900/20',
    border: 'border-green-500/30',
    text: 'text-green-400'
  },
  'Air': {
    gradient: 'from-blue-900/30 to-cyan-900/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400'
  },
  'Eau': {
    gradient: 'from-purple-900/30 to-indigo-900/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400'
  }
};
