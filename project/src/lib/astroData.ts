export const horoscopes: Record<string, { mood: string; text: string; love: string }> = {
  "Bélier": {
    mood: "🔥 Énergique",
    text: "Les astres te donnent une énergie de feu aujourd'hui. C'est le moment de prendre des initiatives en amour. Quelqu'un a attiré ton attention ? Fonce !",
    love: "Ta confiance est magnétique. Un message audacieux pourrait tout changer."
  },
  "Taureau": {
    mood: "💚 Serein",
    text: "Vénus te sourit. Tu dégages une aura de calme et de sensualité qui attire naturellement. Laisse les choses venir à toi.",
    love: "La patience paie. Un match récent pourrait se révéler plus intéressant que prévu."
  },
  "Gémeaux": {
    mood: "💬 Communicatif",
    text: "Mercure booste ta tchatche ! Tes mots ont du pouvoir aujourd'hui. C'est le moment parfait pour briser la glace.",
    love: "Ta répartie fait mouche. Une conversation légère pourrait devenir profonde."
  },
  "Cancer": {
    mood: "🌙 Intuitif",
    text: "Ta sensibilité est ton super-pouvoir aujourd'hui. Tu captes les non-dits et les vraies intentions.",
    love: "Fais confiance à ton instinct sur ce match. Tu ressens quelque chose ? C'est probablement vrai."
  },
  "Lion": {
    mood: "👑 Rayonnant",
    text: "Le Soleil te met en lumière ! Tu brilles naturellement et on ne voit que toi. Profite de cette aura.",
    love: "Tu attires les regards. Quelqu'un t'admire en secret... peut-être dans tes likes ?"
  },
  "Vierge": {
    mood: "🎯 Analytique",
    text: "Ton sens du détail est affûté. Tu vois au-delà des apparences et des profils trop parfaits.",
    love: "Ne suranalyse pas. Parfois un simple 'salut' vaut mieux qu'un message parfait jamais envoyé."
  },
  "Balance": {
    mood: "💕 Charmeur",
    text: "Vénus te rend irrésistible. Ton charme naturel opère sans effort. Les connexions se font facilement.",
    love: "L'harmonie est ta force. Cherche quelqu'un qui t'équilibre, pas qui te déstabilise."
  },
  "Scorpion": {
    mood: "🔮 Magnétique",
    text: "Ton intensité attire comme un aimant. Les regards se tournent vers toi, intrigués par ton mystère.",
    love: "Quelqu'un veut percer ta carapace. Laisse-le/la entrer... un peu."
  },
  "Sagittaire": {
    mood: "🏹 Aventurier",
    text: "Jupiter t'appelle vers de nouveaux horizons. Ose sortir de ta zone de confort, même en swipant.",
    love: "L'amour peut venir d'où tu ne l'attends pas. Élargis tes critères aujourd'hui."
  },
  "Capricorne": {
    mood: "🏔️ Déterminé",
    text: "Saturne te donne de la structure. Tu sais ce que tu veux et tu ne perds pas de temps.",
    love: "Ta maturité attire. Cherche quelqu'un qui a aussi des objectifs clairs."
  },
  "Verseau": {
    mood: "⚡ Original",
    text: "Uranus te rend unique et imprévisible. C'est ta différence qui fait craquer aujourd'hui.",
    love: "Assume ton côté décalé. Les profils 'normaux' s'ennuieront, les bons resteront."
  },
  "Poissons": {
    mood: "🌊 Rêveur",
    text: "Neptune aiguise ton intuition et ta sensibilité. Tu ressens les énergies des autres.",
    love: "Attention aux illusions. Vérifie que cette connexion est réelle, pas fantasmée."
  }
};

export const compatibilityData: Record<string, { best: string[]; good: string[]; challenge: string[] }> = {
  "Bélier": { best: ["Lion", "Sagittaire"], good: ["Gémeaux", "Verseau"], challenge: ["Cancer", "Capricorne"] },
  "Taureau": { best: ["Vierge", "Capricorne"], good: ["Cancer", "Poissons"], challenge: ["Lion", "Verseau"] },
  "Gémeaux": { best: ["Balance", "Verseau"], good: ["Bélier", "Lion"], challenge: ["Vierge", "Poissons"] },
  "Cancer": { best: ["Scorpion", "Poissons"], good: ["Taureau", "Vierge"], challenge: ["Bélier", "Balance"] },
  "Lion": { best: ["Bélier", "Sagittaire"], good: ["Gémeaux", "Balance"], challenge: ["Taureau", "Scorpion"] },
  "Vierge": { best: ["Taureau", "Capricorne"], good: ["Cancer", "Scorpion"], challenge: ["Gémeaux", "Sagittaire"] },
  "Balance": { best: ["Gémeaux", "Verseau"], good: ["Lion", "Sagittaire"], challenge: ["Cancer", "Capricorne"] },
  "Scorpion": { best: ["Cancer", "Poissons"], good: ["Vierge", "Capricorne"], challenge: ["Lion", "Verseau"] },
  "Sagittaire": { best: ["Bélier", "Lion"], good: ["Balance", "Verseau"], challenge: ["Vierge", "Poissons"] },
  "Capricorne": { best: ["Taureau", "Vierge"], good: ["Scorpion", "Poissons"], challenge: ["Bélier", "Balance"] },
  "Verseau": { best: ["Gémeaux", "Balance"], good: ["Bélier", "Sagittaire"], challenge: ["Taureau", "Scorpion"] },
  "Poissons": { best: ["Cancer", "Scorpion"], good: ["Taureau", "Capricorne"], challenge: ["Gémeaux", "Sagittaire"] }
};

export const dailyTips: Record<string, string> = {
  "Bélier": "Ton énergie est contagieuse mais attention à ne pas écraser l'autre. Laisse-lui de l'espace pour briller aussi.",
  "Taureau": "La patience est ta force. Mais parfois, il faut savoir faire le premier pas. Aujourd'hui, ose !",
  "Gémeaux": "Ta curiosité est un aimant. Pose des questions, écoute vraiment. C'est là que la magie opère.",
  "Cancer": "Protège ton cœur mais ne le cache pas. Ta vulnérabilité est ta plus belle force en amour.",
  "Lion": "Tu mérites d'être admiré(e), mais cherche quelqu'un qui voit aussi tes failles et les aime.",
  "Vierge": "Arrête de chercher la perfection. La bonne personne sera parfaitement imparfaite pour toi.",
  "Balance": "Tu veux plaire à tout le monde mais c'est impossible. Reste toi-même, les bons resteront.",
  "Scorpion": "Ton intensité peut effrayer. Dévoile-toi progressivement, comme un bon suspense.",
  "Sagittaire": "L'aventure t'appelle mais l'amour demande parfois de rester. Trouve quelqu'un qui voyage avec toi.",
  "Capricorne": "Tu construis pour durer. Mais n'oublie pas de profiter du présent, pas que du futur.",
  "Verseau": "Ton originalité est ta marque. N'essaie pas de rentrer dans le moule pour plaire.",
  "Poissons": "Tes rêves sont beaux mais vérifie qu'ils correspondent à la réalité. Ouvre les yeux, avec le cœur."
};

export const getSignEnergies = (sign: string): { love: number; energy: number; luck: number; communication: number } => {
  const seed = new Date().getDate() + getSignIndex(sign);
  return {
    love: seededRandom(seed, 60, 100),
    energy: seededRandom(seed + 1, 50, 100),
    luck: seededRandom(seed + 2, 40, 95),
    communication: seededRandom(seed + 3, 55, 100)
  };
};

const seededRandom = (seed: number, min: number, max: number): number => {
  const x = Math.sin(seed) * 10000;
  const rand = x - Math.floor(x);
  return Math.floor(rand * (max - min + 1)) + min;
};

const getSignIndex = (sign: string): number => {
  const signs = ["Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge", "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons"];
  return signs.indexOf(sign);
};

export const getAstroAlerts = () => {
  const today = new Date();
  const alerts: Array<{ title: string; message: string }> = [];

  if (isMercuryRetrograde(today)) {
    alerts.push({
      title: "☿️ Mercure Rétrograde",
      message: "Communication délicate. Évite les discussions importantes et relis tes messages avant d'envoyer !"
    });
  }

  if (isFullMoon(today)) {
    alerts.push({
      title: "🌕 Pleine Lune",
      message: "Émotions intenses ! Parfait pour les déclarations, moins pour les disputes."
    });
  }

  if (isNewMoon(today)) {
    alerts.push({
      title: "🌑 Nouvelle Lune",
      message: "Idéal pour les nouveaux départs. Lance-toi, envoie ce premier message !"
    });
  }

  return alerts;
};

const isMercuryRetrograde = (date: Date): boolean => {
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

const isFullMoon = (date: Date): boolean => {
  const lunarCycle = 29.53059;
  const knownNewMoon = new Date('2024-01-11');
  const diff = date.getTime() - knownNewMoon.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  const phase = (days % lunarCycle) / lunarCycle;
  return phase >= 0.47 && phase < 0.53;
};

const isNewMoon = (date: Date): boolean => {
  const lunarCycle = 29.53059;
  const knownNewMoon = new Date('2024-01-11');
  const diff = date.getTime() - knownNewMoon.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  const phase = (days % lunarCycle) / lunarCycle;
  return phase < 0.03 || phase > 0.97;
};
