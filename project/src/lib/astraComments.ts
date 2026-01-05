import type { AstraMemory } from './astraMemory';

export type ProfileForComment = {
  id: string;
  pseudo: string;
  age: number;
  astral_sign?: string;
  attachment_style?: string;
  archetype?: string;
  city?: string;
  has_all_questionnaires: boolean;
};

export function generateAstraComment(
  targetProfile: ProfileForComment,
  userMemory: AstraMemory | null,
  compatibilityScore?: number
): string {
  const comments: string[] = [];

  if (compatibilityScore && compatibilityScore >= 95) {
    comments.push("C'est ÉNORME ce score... je te conseille vraiment de lui parler 🔥");
  } else if (compatibilityScore && compatibilityScore >= 90) {
    comments.push("92%+ c'est rare, vous avez un vrai potentiel ensemble");
  } else if (compatibilityScore && compatibilityScore >= 85) {
    comments.push("Bon score ! Tu devrais checker sa compatibilité en détail");
  }

  if (targetProfile.astral_sign && userMemory?.profile && 'astral_sign' in userMemory.profile) {
    const userSign = (userMemory.profile as any).astral_sign;
    if (targetProfile.astral_sign === userSign) {
      comments.push(`Même signe astro que toi (${targetProfile.astral_sign}), ça peut être intense`);
    } else if (
      (targetProfile.astral_sign === 'Scorpion' && userSign === 'Poissons') ||
      (targetProfile.astral_sign === 'Poissons' && userSign === 'Scorpion') ||
      (targetProfile.astral_sign === 'Cancer' && userSign === 'Taureau')
    ) {
      comments.push(`${targetProfile.astral_sign} + ${userSign} = connexion émotionnelle forte ✨`);
    }
  }

  if (targetProfile.attachment_style) {
    if (targetProfile.attachment_style === 'secure' || targetProfile.attachment_style === 'sécurisé') {
      comments.push("Style sécurisé = stabilité émotionnelle, c'est ce qu'il te faut");
    } else if (targetProfile.attachment_style === 'anxious' || targetProfile.attachment_style === 'anxieux') {
      if (userMemory?.emotional_state?.fears?.includes('abandon')) {
        comments.push("Attention, vous avez tous les deux peur de l'abandon... à gérer ensemble");
      }
    } else if (targetProfile.attachment_style === 'avoidant' || targetProfile.attachment_style === 'évitant') {
      if (userMemory?.preferences_expressed?.dislikes?.some(d => d.includes('collant') || d.includes('distance'))) {
        comments.push("Évitant comme toi tu détestes les gens collants, ça peut matcher fort");
      }
    }
  }

  if (targetProfile.archetype) {
    if (targetProfile.archetype.includes('Romantique')) {
      comments.push("Archétype romantique... il/elle va t'écrire des poèmes 💕");
    } else if (targetProfile.archetype.includes('Joueur')) {
      if (userMemory?.preferences_expressed?.dealbreakers?.includes('infidélité')) {
        comments.push("⚠️ Archétype joueur et tu détestes l'infidélité... méfiance");
      } else {
        comments.push("Archétype joueur = charme et séduction garantis");
      }
    } else if (targetProfile.archetype.includes('Guérisseur')) {
      comments.push("Archétype guérisseur = empathie et écoute, parfait si tu as besoin de ça");
    }
  }

  if (targetProfile.city && userMemory?.profile && 'city' in userMemory.profile) {
    const userCity = (userMemory.profile as any).city;
    if (targetProfile.city === userCity) {
      comments.push(`Même ville que toi ! Vous pouvez vous voir IRL facilement`);
    }
  }

  if (!targetProfile.has_all_questionnaires) {
    comments.push("Profil incomplet... attends qu'il/elle finisse pour voir la vraie compatibilité");
  }

  if (comments.length === 0) {
    comments.push("Je sens un bon feeling avec ce profil, vas-y checke !");
  }

  return comments[Math.floor(Math.random() * Math.min(2, comments.length))];
}

export function sortProfilesByAstraLogic(
  profiles: ProfileForComment[],
  userMemory: AstraMemory | null,
  compatibilityScores: Map<string, number>
): ProfileForComment[] {
  return profiles
    .filter(p => p.has_all_questionnaires)
    .sort((a, b) => {
      const scoreA = compatibilityScores.get(a.id) || 0;
      const scoreB = compatibilityScores.get(b.id) || 0;

      let priorityA = scoreA;
      let priorityB = scoreB;

      if (a.attachment_style === 'secure' || a.attachment_style === 'sécurisé') {
        priorityA += 5;
      }
      if (b.attachment_style === 'secure' || b.attachment_style === 'sécurisé') {
        priorityB += 5;
      }

      if (userMemory?.profile && 'city' in userMemory.profile) {
        const userCity = (userMemory.profile as any).city;
        if (a.city === userCity) priorityA += 3;
        if (b.city === userCity) priorityB += 3;
      }

      return priorityB - priorityA;
    })
    .slice(0, 5);
}
