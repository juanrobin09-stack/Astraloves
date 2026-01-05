// Types d'analyses pour chaque questionnaire
export interface AttachmentAnalysis {
  type: 'secure' | 'anxious' | 'avoidant' | 'fearful-avoidant';
  percentage: number;
  title: string;
  emoji: string;
  description: string;
  strengths: string[];
  challenges: string[];
  advice: string[];
  inRelationship: string;
  compatibility: {
    best: string[];
    challenging: string[];
  };
}

export interface ArchetypeAnalysis {
  primary: string;
  secondary?: string;
  emoji: string;
  description: string;
  characteristics: string[];
  strengths: string[];
  weaknesses: string[];
  inLove: string;
  careers: string[];
  famous: string[];
}

export interface AstralAnalysis {
  sun: { sign: string; house: number; description: string };
  moon: { sign: string; house: number; description: string };
  rising: { sign: string; description: string };
  venus: { sign: string; house: number; description: string };
  mars: { sign: string; house: number; description: string };
  dominant: string[];
  elements: { fire: number; earth: number; air: number; water: number };
  qualities: { cardinal: number; fixed: number; mutable: number };
  summary: string;
}

// Analyse du style d'attachement
export function analyzeAttachment(answers: Record<string, any>): AttachmentAnalysis {
  // Calcul des scores pour chaque type
  let secureScore = 0;
  let anxiousScore = 0;
  let avoidantScore = 0;

  // Questions clés et leur impact
  const q1 = answers.q1; // "Ce qui m'attire en premier"
  const q3 = answers.q3; // "En début de relation"
  const q7 = answers.q7; // "Mon plus grand défi"

  // Analyse Q1
  if (q1?.includes('confiance') || q1?.includes('stabilité')) secureScore += 3;
  if (q1?.includes('intensité') || q1?.includes('passion')) anxiousScore += 2;
  if (q1?.includes('indépendance')) avoidantScore += 2;

  // Analyse Q3
  if (q3?.includes('progressivement')) secureScore += 3;
  if (q3?.includes('tout de suite')) anxiousScore += 3;
  if (q3?.includes('distance')) avoidantScore += 3;

  // Analyse Q7
  if (q7?.includes('indépendant')) avoidantScore += 3;
  if (q7?.includes('angoisse') || q7?.includes('abandon')) anxiousScore += 3;
  if (q7?.includes('équilibre')) secureScore += 2;

  // Normalisation des scores
  const total = secureScore + anxiousScore + avoidantScore || 1;
  const securePercent = Math.round((secureScore / total) * 100);
  const anxiousPercent = Math.round((anxiousScore / total) * 100);
  const avoidantPercent = Math.round((avoidantScore / total) * 100);

  // Déterminer le type dominant
  let type: AttachmentAnalysis['type'];
  let percentage: number;

  if (secureScore >= anxiousScore && secureScore >= avoidantScore) {
    type = 'secure';
    percentage = securePercent;
  } else if (anxiousScore > avoidantScore) {
    type = 'anxious';
    percentage = anxiousPercent;
  } else if (anxiousScore > 0 && avoidantScore > 0 && Math.abs(anxiousScore - avoidantScore) <= 1) {
    type = 'fearful-avoidant';
    percentage = Math.round(((anxiousScore + avoidantScore) / total) * 100);
  } else {
    type = 'avoidant';
    percentage = avoidantPercent;
  }

  // Retourner l'analyse selon le type
  const analyses = {
    secure: {
      type: 'secure' as const,
      percentage,
      title: 'Attachement Sécure',
      emoji: '💚',
      description: 'Tu as un style d\'attachement sain et équilibré. Tu te sens à l\'aise avec l\'intimité et l\'indépendance. Tu construis des relations stables basées sur la confiance mutuelle.',
      strengths: [
        'Confiance en toi et en les autres',
        'Capacité à communiquer tes besoins',
        'Équilibre entre autonomie et proximité',
        'Gestion saine des conflits',
        'Relations stables et durables'
      ],
      challenges: [
        'Patience avec les personnes ayant un attachement insécure',
        'Risque de minimiser les problèmes relationnels',
        'Peut parfois sembler trop rationnel(le)'
      ],
      advice: [
        'Continue à communiquer ouvertement',
        'Sois patient(e) avec les partenaires moins sécures',
        'Valorise la stabilité que tu apportes',
        'Reste attentif(ve) aux besoins émotionnels'
      ],
      inRelationship: 'Tu cherches des relations équilibrées où chacun peut être lui-même. Tu valorises l\'honnêteté et la communication.',
      compatibility: {
        best: ['Sécure', 'Anxieux (avec travail)'],
        challenging: ['Évitant distant']
      }
    },
    anxious: {
      type: 'anxious' as const,
      percentage,
      title: 'Attachement Anxieux',
      emoji: '💗',
      description: 'Tu ressens les émotions intensément et cherches beaucoup de réassurance. Tu as peur de l\'abandon et peux être très fusionnel(le) dans tes relations.',
      strengths: [
        'Grande capacité d\'empathie',
        'Sensibilité émotionnelle profonde',
        'Engagement total dans la relation',
        'Attention aux détails et aux signes',
        'Passion et intensité'
      ],
      challenges: [
        'Peur de l\'abandon',
        'Besoin constant de réassurance',
        'Tendance à la jalousie',
        'Difficulté avec la distance',
        'Réactions émotionnelles intenses'
      ],
      advice: [
        'Travaille sur ton estime de toi',
        'Apprends à t\'auto-rassurer',
        'Pratique la communication non-violente',
        'Développe tes activités personnelles',
        'Consulte un thérapeute spécialisé'
      ],
      inRelationship: 'Tu as besoin de beaucoup de proximité et de validation. Les messages rapides et les gestes d\'affection sont essentiels pour toi.',
      compatibility: {
        best: ['Sécure', 'Anxieux (avec travail commun)'],
        challenging: ['Évitant (piège anxieux-évitant)']
      }
    },
    avoidant: {
      type: 'avoidant' as const,
      percentage,
      title: 'Attachement Évitant',
      emoji: '💙',
      description: 'Tu valorises ton indépendance et ton espace personnel. Tu peux avoir du mal avec l\'intimité émotionnelle et préfères garder une certaine distance.',
      strengths: [
        'Forte indépendance',
        'Auto-suffisance',
        'Rationalité dans les décisions',
        'Respect des limites personnelles',
        'Calme face aux conflits'
      ],
      challenges: [
        'Difficulté avec l\'intimité émotionnelle',
        'Tendance à se distancer',
        'Peur de l\'engagement',
        'Difficulté à exprimer ses émotions',
        'Peut sembler froid(e) ou distant(e)'
      ],
      advice: [
        'Explore tes émotions en sécurité',
        'Pratique la vulnérabilité progressive',
        'Communique tes besoins d\'espace',
        'Reconnais tes peurs d\'intimité',
        'Thérapie pour explorer les origines'
      ],
      inRelationship: 'Tu as besoin d\'espace et d\'autonomie. Les relations trop fusionnelles te mettent mal à l\'aise.',
      compatibility: {
        best: ['Sécure patient(e)', 'Évitant avec communication'],
        challenging: ['Anxieux (piège anxieux-évitant)']
      }
    },
    'fearful-avoidant': {
      type: 'fearful-avoidant' as const,
      percentage,
      title: 'Attachement Craintif-Évitant',
      emoji: '💜',
      description: 'Tu oscilles entre le désir d\'intimité et la peur d\'être blessé(e). Tu peux être très passionné(e) puis soudainement distant(e).',
      strengths: [
        'Profondeur émotionnelle',
        'Conscience de tes conflits internes',
        'Capacité de transformation',
        'Empathie développée',
        'Intuition forte'
      ],
      challenges: [
        'Ambivalence relationnelle',
        'Peur de l\'intimité ET de l\'abandon',
        'Relations instables',
        'Difficulté à maintenir une relation',
        'Comportements contradictoires'
      ],
      advice: [
        'Thérapie spécialisée recommandée',
        'Travail sur les traumas passés',
        'Apprentissage de l\'auto-régulation',
        'Communication de tes ambivalences',
        'Patience et bienveillance envers toi'
      ],
      inRelationship: 'Tu alternes entre proximité intense et distance. Tes partenaires peuvent se sentir confus face à tes changements.',
      compatibility: {
        best: ['Sécure très patient(e)', 'Thérapeute de couple'],
        challenging: ['Tous sans travail thérapeutique']
      }
    }
  };

  return analyses[type];
}

// Analyse de l'archétype
export function analyzeArchetype(answers: Record<string, any>): ArchetypeAnalysis {
  // Analyse simplifiée basée sur les réponses
  const archetypes = {
    lover: {
      primary: 'L\'Amoureux',
      emoji: '💕',
      description: 'Tu es guidé(e) par tes émotions et ta quête de connexion profonde. L\'amour et la beauté sont au centre de ta vie.',
      characteristics: ['Romantique', 'Passionné(e)', 'Sensible', 'Artistique', 'Empathique'],
      strengths: ['Capacité d\'aimer intensément', 'Sensibilité artistique', 'Empathie naturelle', 'Ouverture émotionnelle'],
      weaknesses: ['Dépendance affective', 'Jalousie', 'Idéalisation', 'Difficulté avec solitude'],
      inLove: 'Tu cherches l\'âme sœur et la fusion totale. Les gestes romantiques et la passion sont essentiels.',
      careers: ['Art', 'Thérapie', 'Relations humaines', 'Création'],
      famous: ['Roméo & Juliette', 'Frida Kahlo', 'Pablo Neruda']
    },
    hero: {
      primary: 'Le Héros',
      emoji: '⚔️',
      description: 'Tu es motivé(e) par les défis et la réussite. Tu aimes prendre des initiatives et protéger tes proches.',
      characteristics: ['Courageux', 'Déterminé(e)', 'Protecteur', 'Ambitieux', 'Leader'],
      strengths: ['Courage face aux défis', 'Leadership naturel', 'Protection des autres', 'Résilience'],
      weaknesses: ['Arrogance', 'Difficulté à demander de l\'aide', 'Tendance au contrôle', 'Épuisement'],
      inLove: 'Tu veux être le/la protecteur(trice). Tu montres ton amour par des actions concrètes.',
      careers: ['Entrepreneuriat', 'Sport', 'Armée', 'Direction'],
      famous: ['Superman', 'Wonder Woman', 'Nelson Mandela']
    },
    sage: {
      primary: 'Le Sage',
      emoji: '🧙',
      description: 'Tu cherches la connaissance et la vérité. Ta sagesse et ton recul te caractérisent.',
      characteristics: ['Réfléchi(e)', 'Analytique', 'Sage', 'Objectif', 'Philosophe'],
      strengths: ['Sagesse', 'Recul sur situations', 'Conseils avisés', 'Intelligence émotionnelle'],
      weaknesses: ['Sur-analyse', 'Détachement émotionnel', 'Arrogance intellectuelle', 'Isolement'],
      inLove: 'Tu cherches une connexion intellectuelle profonde. Les conversations significatives sont cruciales.',
      careers: ['Recherche', 'Enseignement', 'Philosophie', 'Conseil'],
      famous: ['Socrate', 'Gandalf', 'Yoda']
    },
    explorer: {
      primary: 'L\'Explorateur',
      emoji: '🌍',
      description: 'Tu es animé(e) par la découverte et l\'aventure. Tu ne supportes pas la routine.',
      characteristics: ['Aventurier', 'Curieux', 'Libre', 'Spontané(e)', 'Indépendant(e)'],
      strengths: ['Adaptabilité', 'Ouverture d\'esprit', 'Courage d\'explorer', 'Indépendance'],
      weaknesses: ['Difficulté d\'engagement', 'Fuite des responsabilités', 'Instabilité', 'Égocentrisme'],
      inLove: 'Tu cherches un partenaire d\'aventure. La liberté et la nouveauté sont essentielles.',
      careers: ['Voyage', 'Journalisme', 'Photographie', 'Start-up'],
      famous: ['Indiana Jones', 'Cheryl Strayed', 'Jack Kerouac']
    }
  };

  // Logique simplifiée de détermination
  return archetypes.lover; // Par défaut, à améliorer avec vraie logique
}

// Génération du thème astral complet
export function generateAstralTheme(birthData: { date: string; time: string; city: string }): AstralAnalysis {
  // Simulation d'un thème astral complet
  // En production, utiliser une vraie API d'astrologie

  return {
    sun: {
      sign: 'Scorpion',
      house: 8,
      description: 'Intensité émotionnelle, transformation profonde, passion'
    },
    moon: {
      sign: 'Cancer',
      house: 4,
      description: 'Sensibilité, besoin de sécurité, attachement familial'
    },
    rising: {
      sign: 'Lion',
      description: 'Charisme naturel, besoin de reconnaissance, générosité'
    },
    venus: {
      sign: 'Vierge',
      house: 6,
      description: 'Amour pratique, dévouement, perfectionnisme affectif'
    },
    mars: {
      sign: 'Sagittaire',
      house: 9,
      description: 'Action expansive, aventure, quête de sens'
    },
    dominant: ['Eau', 'Feu', 'Maisons succédentes'],
    elements: { fire: 35, earth: 15, air: 20, water: 30 },
    qualities: { cardinal: 40, fixed: 30, mutable: 30 },
    summary: 'Thème profondément émotionnel avec une forte capacité de transformation. Balance entre passion et sensibilité.'
  };
}
