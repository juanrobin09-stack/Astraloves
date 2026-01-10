export type QuestionType = 'single' | 'scale' | 'multiple';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  category?: string;
  element?: string; // Pour le thème astral
}

export interface Archetype {
  id: string;
  name: string;
  description: string;
  traits: string[];
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  introduction: string;
  questions: Question[];
  analysisPrompt: string;
  archetypes?: Archetype[];
  resultStructure: {
    title: string;
    sections: string[];
  };
  premium?: boolean;
  featured?: boolean;
  hasAI?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ARCHÉTYPES — PREMIÈRE IMPRESSION
// ═══════════════════════════════════════════════════════════════════════════════

const firstImpressionArchetypes: Archetype[] = [
  {
    id: 'magnetic',
    name: 'Le Magnétique',
    description: 'Une présence qui attire sans effort, une gravité naturelle. Tu captes l\'attention avant même de parler.',
    traits: ['Présence forte', 'Charisme naturel', 'Énergie captivante']
  },
  {
    id: 'reserved',
    name: 'Le Réservé',
    description: 'Une distance élégante qui intrigue et protège. Tu ne te livres pas facilement, ce qui crée du mystère.',
    traits: ['Discrétion', 'Élégance silencieuse', 'Protection naturelle']
  },
  {
    id: 'mysterious',
    name: 'Le Mystérieux',
    description: 'Une opacité séduisante, difficile à lire. Les autres projettent sur toi ce qu\'ils veulent y voir.',
    traits: ['Insondable', 'Fascinant', 'Complexe']
  },
  {
    id: 'solar',
    name: 'Le Solaire',
    description: 'Une chaleur immédiate, une ouverture naturelle. Tu mets les autres à l\'aise instantanément.',
    traits: ['Chaleureux', 'Accessible', 'Lumineux']
  },
  {
    id: 'observer',
    name: 'L\'Observateur',
    description: 'Une présence en retrait mais perçante. Tu vois ce que les autres ne voient pas.',
    traits: ['Perceptif', 'Analytique', 'Discret']
  },
  {
    id: 'intense',
    name: 'L\'Intense',
    description: 'Une énergie forte, parfois intimidante. Ta présence ne laisse jamais indifférent.',
    traits: ['Puissant', 'Marquant', 'Profond']
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// ARCHÉTYPES — SÉDUCTION
// ═══════════════════════════════════════════════════════════════════════════════

const seductionArchetypes: Archetype[] = [
  {
    id: 'silent_magnetic',
    name: 'Le Magnétique Silencieux',
    description: 'Tu attires par la présence, pas par les mots. Ton silence est plus éloquent que les discours des autres.',
    traits: ['Présence magnétique', 'Économie de mots', 'Puissance silencieuse']
  },
  {
    id: 'subtle_player',
    name: 'Le Joueur Subtil',
    description: 'Tu maîtrises l\'art du non-dit et de la tension. La séduction est pour toi un jeu d\'échecs émotionnel.',
    traits: ['Stratège', 'Maître du timing', 'Créateur de tension']
  },
  {
    id: 'solar_direct',
    name: 'Le Solaire Direct',
    description: 'Tu séduis par la chaleur et l\'ouverture. Ta sincérité désarme et attire.',
    traits: ['Authentique', 'Chaleureux', 'Direct']
  },
  {
    id: 'intense_deep',
    name: 'L\'Intense Profond',
    description: 'Tu crées des connexions fortes, parfois trop vite. L\'intensité est ta signature.',
    traits: ['Profond', 'Passionné', 'Absorbant']
  },
  {
    id: 'mysterious_fleeting',
    name: 'Le Mystérieux Fuyant',
    description: 'Tu fascines par ce que tu ne montres pas. L\'inaccessibilité est ton arme.',
    traits: ['Insaisissable', 'Fascinant', 'Distant']
  },
  {
    id: 'equilibrist',
    name: 'L\'Équilibriste',
    description: 'Tu navigues entre distance et proximité avec aisance. L\'équilibre est ton art.',
    traits: ['Adaptable', 'Équilibré', 'Fluide']
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// ARCHÉTYPES — ATTACHEMENT
// ═══════════════════════════════════════════════════════════════════════════════

const attachmentArchetypes: Archetype[] = [
  {
    id: 'secure',
    name: 'Sécure',
    description: 'Capacité à être proche sans perdre son autonomie. Confiance naturelle dans le lien, confort avec l\'intimité et l\'indépendance.',
    traits: ['Confiant', 'Équilibré', 'Stable émotionnellement']
  },
  {
    id: 'anxious',
    name: 'Anxieux-Préoccupé',
    description: 'Besoin intense de proximité et de réassurance. Hypervigilance relationnelle, peur de l\'abandon qui colore les interactions.',
    traits: ['Sensible au rejet', 'Besoin de proximité', 'Hypervigilant']
  },
  {
    id: 'avoidant',
    name: 'Évitant-Détaché',
    description: 'Valorisation de l\'indépendance, inconfort avec l\'intimité profonde. Tendance à maintenir une distance émotionnelle protectrice.',
    traits: ['Indépendant', 'Distant', 'Auto-suffisant']
  },
  {
    id: 'disorganized',
    name: 'Désorganisé-Craintif',
    description: 'Oscillation entre désir de proximité et peur de la vulnérabilité. Conflit interne entre le besoin d\'amour et la peur d\'être blessé.',
    traits: ['Ambivalent', 'Contradictoire', 'En quête']
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// ARCHÉTYPES — AMOUREUX
// ═══════════════════════════════════════════════════════════════════════════════

const loveArchetypes: Archetype[] = [
  {
    id: 'soulmate',
    name: 'L\'Âme Sœur',
    description: 'Recherche de fusion totale, l\'amour comme miroir. Tu cherches quelqu\'un qui te comprenne sans mots.',
    traits: ['Fusionnel', 'Romantique', 'En quête de miroir']
  },
  {
    id: 'protector',
    name: 'Le Protecteur',
    description: 'Besoin de prendre soin ou d\'être protégé. L\'amour passe par la sécurité et le dévouement.',
    traits: ['Dévoué', 'Protecteur', 'Sécurisant']
  },
  {
    id: 'adventurer',
    name: 'L\'Aventurier',
    description: 'L\'amour comme découverte perpétuelle. Tu as besoin de nouveauté et d\'évolution constante.',
    traits: ['Curieux', 'En mouvement', 'Épris de liberté']
  },
  {
    id: 'tragic_romantic',
    name: 'Le Romantique Tragique',
    description: 'Attirance pour l\'intensité, même douloureuse. Les amours impossibles te fascinent.',
    traits: ['Passionné', 'Mélancolique', 'Intense']
  },
  {
    id: 'builder',
    name: 'Le Bâtisseur',
    description: 'L\'amour comme construction commune. Tu veux créer quelque chose de durable avec l\'autre.',
    traits: ['Constructeur', 'Patient', 'Orienté futur']
  },
  {
    id: 'free_electron',
    name: 'L\'Électron Libre',
    description: 'Besoin de liberté au sein même de l\'amour. Tu aimes mais refuses de t\'y perdre.',
    traits: ['Indépendant', 'Libre', 'Autonome']
  },
  {
    id: 'healer',
    name: 'Le Guérisseur',
    description: 'Attirance pour les âmes blessées. Tu veux réparer, soigner, transformer l\'autre.',
    traits: ['Empathique', 'Réparateur', 'Sauveur']
  },
  {
    id: 'seeker',
    name: 'Le Chercheur',
    description: 'L\'amour comme quête de sens. Tu cherches dans l\'autre une réponse à tes questions existentielles.',
    traits: ['Philosophe', 'Profond', 'En quête de sens']
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTIONNAIRES
// ═══════════════════════════════════════════════════════════════════════════════

export const questionnaires: Record<string, Questionnaire> = {
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. PREMIÈRE IMPRESSION
  // ═══════════════════════════════════════════════════════════════════════════
  'first_impression': {
    id: 'first_impression',
    title: 'Première Impression',
    description: 'Ce que les autres perçoivent de toi avant même que tu ne parles.',
    introduction: 'Ce que les autres perçoivent de toi avant même que tu ne parles.',
    premium: false,
    featured: false,
    hasAI: false,
    archetypes: firstImpressionArchetypes,
    resultStructure: {
      title: 'Mon Aura Sociale',
      sections: ['Portrait de l\'Aura Sociale', 'Ce Que Tu Dégages Sans Le Vouloir', 'Décalage Intention/Perception', 'Archétype', 'Axes d\'Évolution']
    },
    questions: [
      {
        id: 'fi_q1',
        text: 'Quand tu entres dans une pièce remplie d\'inconnus, que ressens-tu le plus souvent ?',
        type: 'single',
        category: 'energy',
        options: [
          'Une légère tension, comme si tous les regards convergeaient vers moi',
          'Une curiosité tranquille, j\'observe avant d\'être observé',
          'Rien de particulier, je me fonds naturellement dans l\'espace',
          'Une forme d\'énergie, comme si ma présence modifiait l\'atmosphère'
        ]
      },
      {
        id: 'fi_q2',
        text: 'Comment décrirais-tu ton regard lorsque tu croises celui d\'un inconnu ?',
        type: 'single',
        category: 'gaze',
        options: [
          'Direct et soutenu, je ne détourne pas facilement les yeux',
          'Furtif, je préfère observer sans être vu',
          'Chaleureux, j\'ai tendance à sourire légèrement',
          'Neutre, je ne cherche ni contact ni évitement'
        ]
      },
      {
        id: 'fi_q3',
        text: 'Dans un silence partagé avec quelqu\'un que tu viens de rencontrer, tu te sens généralement :',
        type: 'single',
        category: 'silence',
        options: [
          'À l\'aise, le silence ne me dérange pas',
          'Légèrement nerveux, j\'ai envie de combler le vide',
          'Curieux de ce que l\'autre pense',
          'Détaché, comme si ce moment ne me concernait pas vraiment'
        ]
      },
      {
        id: 'fi_q4',
        text: 'On t\'a déjà dit que tu semblais :',
        type: 'single',
        category: 'perception',
        options: [
          'Difficile à approcher',
          'Plus doux/douce que tu ne le parais',
          'Intense ou magnétique',
          'Discret mais marquant'
        ]
      },
      {
        id: 'fi_q5',
        text: 'Quand tu ne parles pas, ton visage exprime plutôt :',
        type: 'single',
        category: 'expression',
        options: [
          'Une forme de concentration ou de sérieux',
          'Une neutralité difficile à lire',
          'Une ouverture, comme une invitation silencieuse',
          'Une légère tension, même involontaire'
        ]
      },
      {
        id: 'fi_q6',
        text: 'Dans un groupe, sans le vouloir, tu occupes souvent :',
        type: 'single',
        category: 'position',
        options: [
          'Le centre de l\'attention',
          'La périphérie, en observateur',
          'Une position fluide, selon les moments',
          'Un rôle de lien entre les autres'
        ]
      },
      {
        id: 'fi_q7',
        text: 'Lorsque quelqu\'un te rencontre pour la première fois, il te perçoit probablement comme :',
        type: 'single',
        category: 'perceived',
        options: [
          'Quelqu\'un de confiant, peut-être intimidant',
          'Quelqu\'un de réservé, difficile à cerner',
          'Quelqu\'un de chaleureux et accessible',
          'Quelqu\'un d\'intrigant, qui donne envie d\'en savoir plus'
        ]
      },
      {
        id: 'fi_q8',
        text: 'Ta posture physique au repos est plutôt :',
        type: 'single',
        category: 'posture',
        options: [
          'Droite, ancrée, occupant l\'espace',
          'Repliée, protégée, économe en gestes',
          'Détendue, ouverte, sans tension visible',
          'Variable, selon mon état intérieur'
        ]
      },
      {
        id: 'fi_q9',
        text: 'Quand tu écoutes quelqu\'un parler, ton corps :',
        type: 'single',
        category: 'listening',
        options: [
          'Se penche légèrement vers l\'autre',
          'Reste en retrait, à distance respectueuse',
          'Bouge beaucoup, tu es expressif',
          'Reste immobile, concentré'
        ]
      },
      {
        id: 'fi_q10',
        text: 'Si tu devais choisir un mot pour décrire l\'énergie que tu dégages sans le vouloir :',
        type: 'single',
        category: 'essence',
        options: [
          'Intensité',
          'Mystère',
          'Douceur',
          'Calme'
        ]
      }
    ],
    analysisPrompt: `Tu es un analyste de personnalité spécialisé dans la perception sociale et les premières impressions.

Analyse les réponses de l'utilisateur pour créer un portrait profond de son "aura sociale" - l'impression qu'il laisse avant même de parler.

Structure ton analyse ainsi :

## Portrait de l'Aura Sociale
Décris l'empreinte énergétique que cette personne laisse dans l'espace social. Comment sa présence est-elle ressentie par les autres avant toute interaction verbale ?

## Ce Que Tu Dégages Sans Le Vouloir
Analyse les signaux inconscients : micro-expressions, posture, gestion du regard, occupation de l'espace. Qu'est-ce que les autres captent intuitivement ?

## Décalage Intention / Perception
Identifie l'écart potentiel entre ce que la personne pense projeter et ce qui est réellement perçu. Où se situent les zones de malentendu identitaire ?

## Ton Archétype
Identifie l'archétype dominant parmi : Le Magnétique, Le Réservé, Le Mystérieux, Le Solaire, L'Observateur, L'Intense.
Explique pourquoi cet archétype correspond.

## Axes d'Évolution
Propose 3 pistes de conscience pour mieux habiter sa présence sociale.

Ton : calme, précis, bienveillant. Pas de jugement, pas de marketing. Une lecture profonde et utile.`
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. TEST DE SÉDUCTION
  // ═══════════════════════════════════════════════════════════════════════════
  'seduction': {
    id: 'seduction',
    title: 'Test de Séduction',
    description: 'Ton langage silencieux. Ce qui attire sans que tu le saches.',
    introduction: 'Ton langage silencieux. Ce qui attire sans que tu le saches.',
    premium: false,
    featured: false,
    hasAI: false,
    archetypes: seductionArchetypes,
    resultStructure: {
      title: 'Mon Langage de Séduction',
      sections: ['Style de Séduction Inconscient', 'Forces d\'Attraction', 'Zones de Friction', 'Profil de Séduction', 'Axes d\'Évolution']
    },
    questions: [
      {
        id: 'sed_q1',
        text: 'Dans une conversation qui t\'attire, tu as tendance à :',
        type: 'single',
        category: 'conversation',
        options: [
          'Laisser des silences, créer de la tension',
          'Poser beaucoup de questions, montrer ton intérêt',
          'Partager des choses personnelles rapidement',
          'Rester légèrement en retrait, laisser l\'autre venir'
        ]
      },
      {
        id: 'sed_q2',
        text: 'Quand tu es attiré(e) par quelqu\'un, ton corps :',
        type: 'single',
        category: 'body',
        options: [
          'Se rapproche naturellement, cherche le contact',
          'Se tend légèrement, devient plus contrôlé',
          'S\'ouvre, devient plus expressif',
          'Reste neutre, tu masques bien'
        ]
      },
      {
        id: 'sed_q3',
        text: 'Le regard que tu portes sur quelqu\'un qui te plaît est plutôt :',
        type: 'single',
        category: 'gaze',
        options: [
          'Soutenu, presque provocant',
          'Furtif, tu regardes quand l\'autre ne te voit pas',
          'Souriant, chaleureux',
          'Profond, comme si tu cherchais quelque chose'
        ]
      },
      {
        id: 'sed_q4',
        text: 'Dans la séduction, tu préfères :',
        type: 'single',
        category: 'dynamic',
        options: [
          'Être chassé(e), sentir qu\'on te désire',
          'Chasser, prendre l\'initiative',
          'Un équilibre, un jeu à deux',
          'Ne pas savoir qui mène, rester dans l\'ambiguïté'
        ]
      },
      {
        id: 'sed_q5',
        text: 'Ce qui te rend le plus attirant(e) selon toi :',
        type: 'single',
        category: 'strength',
        options: [
          'Ta présence, ton énergie',
          'Ton mystère, ce que tu ne dis pas',
          'Ton humour, ta légèreté',
          'Ton intensité, ta profondeur'
        ]
      },
      {
        id: 'sed_q6',
        text: 'Quand l\'attirance est mutuelle, tu ressens :',
        type: 'single',
        category: 'feeling',
        options: [
          'Une excitation, une forme d\'urgence',
          'Une tension agréable, un suspense',
          'Une sérénité, une évidence',
          'Une vulnérabilité, presque de la peur'
        ]
      },
      {
        id: 'sed_q7',
        text: 'Le premier contact physique avec quelqu\'un qui te plaît :',
        type: 'single',
        category: 'touch',
        options: [
          'Tu l\'initie naturellement',
          'Tu attends que l\'autre le fasse',
          'Il arrive sans que tu t\'en rendes compte',
          'Tu le repousses légèrement pour créer du désir'
        ]
      },
      {
        id: 'sed_q8',
        text: 'Dans l\'intimité émotionnelle naissante, tu :',
        type: 'single',
        category: 'intimacy',
        options: [
          'Te dévoiles progressivement, par couches',
          'Restes sur tes gardes longtemps',
          'T\'ouvres rapidement si tu te sens en confiance',
          'Oscilles entre ouverture et fermeture'
        ]
      },
      {
        id: 'sed_q9',
        text: 'Ce qui crée le plus de tension selon toi :',
        type: 'single',
        category: 'tension',
        options: [
          'Ce qui n\'est pas dit',
          'Ce qui est dit à demi-mot',
          'Le contact physique retenu',
          'Le regard prolongé'
        ]
      },
      {
        id: 'sed_q10',
        text: 'Ton rythme naturel dans la séduction :',
        type: 'single',
        category: 'rhythm',
        options: [
          'Lent, tu prends ton temps',
          'Rapide, tu sais vite ce que tu veux',
          'Variable, selon la personne',
          'Imprévisible, même pour toi'
        ]
      },
      {
        id: 'sed_q11',
        text: 'Ce qui fait fuir l\'autre, selon toi :',
        type: 'single',
        category: 'shadow',
        options: [
          'Tu peux sembler trop distant(e)',
          'Tu peux sembler trop intense',
          'Tu peux sembler trop disponible',
          'Tu ne sais pas vraiment'
        ]
      },
      {
        id: 'sed_q12',
        text: 'La séduction idéale pour toi ressemble à :',
        type: 'single',
        category: 'ideal',
        options: [
          'Un jeu subtil où personne ne gagne vraiment',
          'Une connexion évidente et rapide',
          'Une lente construction de confiance',
          'Une tension permanente, jamais totalement résolue'
        ]
      }
    ],
    analysisPrompt: `Tu es un analyste spécialisé dans les dynamiques de séduction et d'attraction interpersonnelle.

Analyse les réponses pour créer un portrait du "style de séduction inconscient" de cette personne.

Structure ton analyse ainsi :

## Style de Séduction Inconscient
Décris le mode opératoire naturel de cette personne en séduction : son approche, son tempo, sa gestion de la distance, les signaux qu'elle émet.

## Forces d'Attraction Naturelles
Qu'est-ce qui magnétise l'autre chez cette personne ? Son énergie, son mystère, sa chaleur, son intensité, son humour, sa présence ?

## Zones de Friction ou de Malentendu
Ce qui peut être mal interprété, ce qui crée de la confusion chez l'autre, les angles morts.

## Ton Profil de Séduction
Identifie le profil dominant parmi : Le Magnétique Silencieux, Le Joueur Subtil, Le Solaire Direct, L'Intense Profond, Le Mystérieux Fuyant, L'Équilibriste.
Explique ce qui caractérise ce profil.

## Comment Ton Énergie Est Ressentie
Portrait de la signature relationnelle dans les premiers stades d'une connexion.

## Axes d'Évolution
Ce qui pourrait être ajusté pour une séduction plus alignée avec tes intentions profondes.

Ton : calme, précis, sans jugement. Pas de conseils de drague, une lecture psychologique profonde.`
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. STYLE D'ATTACHEMENT — ANALYSE IA
  // ═══════════════════════════════════════════════════════════════════════════
  'attachment': {
    id: 'attachment',
    title: 'Style d\'Attachement',
    description: 'Comment tu te lies. Et pourquoi certaines relations t\'échappent.',
    introduction: 'Comment tu te lies. Et pourquoi certaines relations t\'échappent.',
    premium: true,
    featured: true,
    hasAI: true,
    archetypes: attachmentArchetypes,
    resultStructure: {
      title: 'Mon Style d\'Attachement',
      sections: ['Modélisation du Style', 'Déclencheurs Inconscients', 'Boucles Relationnelles', 'Lecture Clinique', 'Chemins vers la Sécurité']
    },
    questions: [
      {
        id: 'att_q1',
        text: 'Quand quelqu\'un que tu aimes ne répond pas à un message pendant plusieurs heures, tu ressens :',
        type: 'single',
        category: 'anxiety',
        options: [
          'Une légère inquiétude que tu chasses rapidement',
          'Une anxiété qui monte progressivement',
          'Rien de particulier, tu as confiance',
          'Un soulagement, tu avais besoin d\'espace'
        ]
      },
      {
        id: 'att_q2',
        text: 'Dans une relation, tu as besoin de réassurance :',
        type: 'single',
        category: 'reassurance',
        options: [
          'Rarement, ta sécurité vient de toi',
          'Régulièrement, les mots comptent',
          'Souvent, le doute s\'installe facilement',
          'Jamais, tu préfères l\'indépendance totale'
        ]
      },
      {
        id: 'att_q3',
        text: 'Quand une relation devient plus sérieuse, tu as tendance à :',
        type: 'single',
        category: 'commitment',
        options: [
          'T\'ouvrir davantage, te sentir en sécurité',
          'Te replier légèrement, protéger ton espace',
          'Osciller entre rapprochement et distance',
          'Fuir ou saboter inconsciemment'
        ]
      },
      {
        id: 'att_q4',
        text: 'La proximité émotionnelle te fait ressentir :',
        type: 'single',
        category: 'intimacy',
        options: [
          'Du confort et de la sérénité',
          'Une forme de vulnérabilité inconfortable',
          'Un mélange d\'attirance et de peur',
          'Le besoin de reprendre de la distance'
        ]
      },
      {
        id: 'att_q5',
        text: 'Quand tu sens l\'autre s\'éloigner, même légèrement :',
        type: 'single',
        category: 'distance',
        options: [
          'Tu restes calme, tu fais confiance au lien',
          'Tu cherches à comprendre, à réparer',
          'Tu paniques intérieurement',
          'Tu t\'éloignes aussi, par réflexe'
        ]
      },
      {
        id: 'att_q6',
        text: 'Ton rapport à l\'indépendance dans une relation :',
        type: 'single',
        category: 'independence',
        options: [
          'J\'ai besoin d\'espace mais je sais revenir',
          'J\'ai du mal à demander de l\'espace',
          'Mon indépendance est non négociable',
          'Je ne sais pas vraiment ce dont j\'ai besoin'
        ]
      },
      {
        id: 'att_q7',
        text: 'Quand tu te disputes avec quelqu\'un que tu aimes :',
        type: 'single',
        category: 'conflict',
        options: [
          'Tu cherches à résoudre rapidement',
          'Tu te fermes, tu as besoin de temps',
          'Tu ressens une peur intense de perdre l\'autre',
          'Tu minimises, tu passes à autre chose'
        ]
      },
      {
        id: 'att_q8',
        text: 'Le mot qui décrit le mieux ta manière d\'aimer :',
        type: 'single',
        category: 'style',
        options: [
          'Stable',
          'Intense',
          'Prudente',
          'Fluctuante'
        ]
      },
      {
        id: 'att_q9',
        text: 'Dans tes relations passées, tu as souvent ressenti :',
        type: 'single',
        category: 'pattern',
        options: [
          'Une sécurité durable',
          'Une peur de l\'abandon',
          'Une peur de l\'envahissement',
          'Une confusion sur ce que tu voulais vraiment'
        ]
      },
      {
        id: 'att_q10',
        text: 'Quand quelqu\'un te dit "je t\'aime" pour la première fois :',
        type: 'single',
        category: 'declaration',
        options: [
          'Tu te sens heureux/heureuse et tu réponds naturellement',
          'Tu ressens une légère panique, même si tu le penses aussi',
          'Tu doutes de la sincérité de l\'autre',
          'Tu as envie de fuir, même si tu ressens quelque chose'
        ]
      },
      {
        id: 'att_q11',
        text: 'Ton plus grand schéma répétitif en relation :',
        type: 'single',
        category: 'loop',
        options: [
          'Choisir des personnes indisponibles',
          'Donner trop, trop vite',
          'Te fermer quand ça devient sérieux',
          'Ne pas savoir ce que tu veux vraiment'
        ]
      },
      {
        id: 'att_q12',
        text: 'Ce qui te rassure le plus dans une relation :',
        type: 'single',
        category: 'security',
        options: [
          'La constance, la prévisibilité',
          'Les mots, les preuves d\'amour',
          'L\'espace, le respect de ton indépendance',
          'Rien ne me rassure vraiment longtemps'
        ]
      },
      {
        id: 'att_q13',
        text: 'Quand tu te sens en insécurité relationnelle, tu :',
        type: 'single',
        category: 'reaction',
        options: [
          'En parles directement',
          'Gardes pour toi et observes',
          'Deviens plus demandeur/demandeuse',
          'Prends de la distance'
        ]
      },
      {
        id: 'att_q14',
        text: 'Si tu devais décrire ton lien aux autres en une image :',
        type: 'single',
        category: 'metaphor',
        options: [
          'Un ancrage solide',
          'Un élastique tendu',
          'Une porte entrouverte',
          'Un mouvement perpétuel d\'aller-retour'
        ]
      }
    ],
    analysisPrompt: `Tu es un psychologue spécialisé dans la théorie de l'attachement et les dynamiques relationnelles.

Analyse les réponses pour créer un portrait approfondi du style d'attachement de cette personne.

Structure ton analyse ainsi :

## Modélisation de Ton Style d'Attachement
Identifie le style dominant (Sécure, Anxieux-Préoccupé, Évitant-Détaché, ou Désorganisé-Craintif) avec ses nuances spécifiques. Explique comment ce style se manifeste concrètement dans les relations.

## Déclencheurs Inconscients
Qu'est-ce qui active les réponses d'attachement ? Le silence, la distance, l'engagement, la vulnérabilité ? Identifie les situations qui déclenchent les réactions automatiques.

## Boucles Relationnelles Répétitives
Quels patterns se reproduisent ? Choix de partenaires, dynamiques récurrentes, points de rupture typiques.

## Lecture Quasi-Clinique Mais Humaine
Analyse profonde du fonctionnement relationnel avec empathie, sans jugement. Comprendre, pas étiqueter.

## Chemins Vers Plus de Sécurité
Pistes concrètes pour évoluer vers un attachement plus sécure, en tenant compte du profil identifié.

Ton : clinique mais chaleureux, précis mais empathique. Comme un thérapeute bienveillant qui éclaire sans juger.`
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. ARCHÉTYPE AMOUREUX — ANALYSE IA
  // ═══════════════════════════════════════════════════════════════════════════
  'archetype': {
    id: 'archetype',
    title: 'Archétype Amoureux',
    description: 'Le schéma profond qui guide tes choix romantiques.',
    introduction: 'Le schéma profond qui guide tes choix romantiques.',
    premium: true,
    featured: true,
    hasAI: true,
    archetypes: loveArchetypes,
    resultStructure: {
      title: 'Mon Archétype Amoureux',
      sections: ['Archétype Dominant', 'Forces', 'Zones d\'Ombre', 'Attirances', 'Compatibilités', 'Évolution']
    },
    questions: [
      {
        id: 'arc_q1',
        text: 'Dans une relation idéale, tu voudrais te sentir :',
        type: 'single',
        category: 'need',
        options: [
          'Protégé(e), en sécurité',
          'Libre, sans contrainte',
          'Fusionnel(le), ne faire qu\'un',
          'Admiré(e), valorisé(e)'
        ]
      },
      {
        id: 'arc_q2',
        text: 'Ce qui t\'attire instinctivement chez quelqu\'un :',
        type: 'single',
        category: 'attraction',
        options: [
          'Sa force, son assurance',
          'Son mystère, ce que je ne comprends pas',
          'Sa douceur, sa capacité à prendre soin',
          'Son intelligence, sa profondeur'
        ]
      },
      {
        id: 'arc_q3',
        text: 'Dans l\'amour, tu cherches inconsciemment à :',
        type: 'single',
        category: 'quest',
        options: [
          'Être sauvé(e) ou sauver',
          'Être compris(e) totalement',
          'Vivre une passion dévorante',
          'Construire quelque chose de stable'
        ]
      },
      {
        id: 'arc_q4',
        text: 'Le rôle que tu prends naturellement en couple :',
        type: 'single',
        category: 'role',
        options: [
          'Le protecteur / la protectrice',
          'Le guidé(e), celui/celle qui suit',
          'L\'égal(e), un partenariat équilibré',
          'L\'électron libre, difficile à cerner'
        ]
      },
      {
        id: 'arc_q5',
        text: 'Ce qui te fait tomber amoureux/amoureuse :',
        type: 'single',
        category: 'trigger',
        options: [
          'Un regard, une présence magnétique',
          'Une conversation profonde',
          'Un geste de tendresse inattendu',
          'Un défi, quelqu\'un qui me résiste'
        ]
      },
      {
        id: 'arc_q6',
        text: 'Tes relations passées avaient souvent en commun :',
        type: 'single',
        category: 'pattern',
        options: [
          'Une intensité émotionnelle forte',
          'Une distance ou une indisponibilité',
          'Une douceur, une stabilité',
          'Une complexité, des hauts et des bas'
        ]
      },
      {
        id: 'arc_q7',
        text: 'En amour, tu as tendance à idéaliser :',
        type: 'single',
        category: 'idealization',
        options: [
          'Le début, la phase de découverte',
          'La fusion, les moments d\'intimité totale',
          'La stabilité, le quotidien partagé',
          'Le conflit, la réconciliation'
        ]
      },
      {
        id: 'arc_q8',
        text: 'Ce que tu crains le plus dans l\'amour :',
        type: 'single',
        category: 'fear',
        options: [
          'L\'abandon',
          'L\'ennui',
          'La perte de soi',
          'La trahison'
        ]
      },
      {
        id: 'arc_q9',
        text: 'Si l\'amour était un mythe, tu serais plutôt :',
        type: 'single',
        category: 'myth',
        options: [
          'Orphée cherchant Eurydice — l\'amour impossible',
          'Roméo et Juliette — la passion absolue',
          'Philémon et Baucis — l\'amour qui dure',
          'Ulysse et Pénélope — l\'amour à distance'
        ]
      },
      {
        id: 'arc_q10',
        text: 'Dans une relation, tu donnes souvent :',
        type: 'single',
        category: 'giving',
        options: [
          'Plus que tu ne reçois',
          'Moins que tu ne voudrais',
          'Autant que l\'autre',
          'De manière imprévisible'
        ]
      },
      {
        id: 'arc_q11',
        text: 'L\'amour te rend :',
        type: 'single',
        category: 'effect',
        options: [
          'Plus fort(e)',
          'Plus vulnérable',
          'Les deux à la fois',
          'Confus(e)'
        ]
      },
      {
        id: 'arc_q12',
        text: 'Ce qui te manque le plus quand une relation se termine :',
        type: 'single',
        category: 'loss',
        options: [
          'La présence physique',
          'Les conversations profondes',
          'Le sentiment d\'être choisi(e)',
          'La routine partagée'
        ]
      },
      {
        id: 'arc_q13',
        text: 'Tu es attiré(e) par des personnes qui :',
        type: 'single',
        category: 'attracted_to',
        options: [
          'Te ressemblent profondément',
          'Sont ton opposé',
          'Te complètent sur certains points',
          'Te déstabilisent'
        ]
      },
      {
        id: 'arc_q14',
        text: 'Si tu devais définir l\'amour en un mot :',
        type: 'single',
        category: 'definition',
        options: [
          'Sécurité',
          'Passion',
          'Liberté',
          'Mystère'
        ]
      }
    ],
    analysisPrompt: `Tu es un analyste jungien spécialisé dans les archétypes amoureux et les schémas relationnels profonds.

Analyse les réponses pour créer un portrait archétypal de cette personne en amour.

Structure ton analyse ainsi :

## Ton Archétype Dominant
Identifie l'archétype principal parmi : L'Âme Sœur, Le Protecteur, L'Aventurier, Le Romantique Tragique, Le Bâtisseur, L'Électron Libre, Le Guérisseur, Le Chercheur.
Explique en profondeur comment cet archétype se manifeste.

## Forces de Cet Archétype
Ce que cette configuration apporte de puissant dans les relations. Les dons naturels.

## Zones d'Ombre
Ce que cet archétype peut générer comme difficultés, les pièges récurrents.

## Pourquoi Tu Es Attiré(e) Par Certains Profils
Explication des attirances récurrentes, des choix inconscients. Ce qui te magnétise et pourquoi.

## Lecture Symbolique et Mythologique
Rattache ce profil à des figures archétypales, des récits universels. Donne du sens mythologique.

## Archétypes Complémentaires
Quels archétypes sont naturellement compatibles ? Quels défis avec d'autres ?

## Vers une Expression Plus Équilibrée
Comment intégrer les ombres et développer une expression plus complète de cet archétype.

Ton : mythologique mais accessible, profond mais concret. Comme un analyste jungien qui parle avec clarté.`
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. TEST DE COMPATIBILITÉ — ANALYSE IA
  // ═══════════════════════════════════════════════════════════════════════════
  'compatibility': {
    id: 'compatibility',
    title: 'Test de Compatibilité',
    description: 'Les dynamiques invisibles entre deux personnalités.',
    introduction: 'Les dynamiques invisibles entre deux personnalités.',
    premium: true,
    featured: false,
    hasAI: true,
    archetypes: [],
    resultStructure: {
      title: 'Dynamique de Compatibilité',
      sections: ['Cartographie Relationnelle', 'Zones de Fluidité', 'Points de Friction', 'Type de Dynamique', 'Clés de la Relation']
    },
    questions: [
      {
        id: 'comp_q1',
        text: 'Dans une relation, tu as besoin en priorité de :',
        type: 'single',
        category: 'priority',
        options: [
          'Sécurité et stabilité',
          'Passion et intensité',
          'Liberté et indépendance',
          'Complicité et communication'
        ]
      },
      {
        id: 'comp_q2',
        text: 'Face au conflit, tu :',
        type: 'single',
        category: 'conflict',
        options: [
          'Cherches à résoudre immédiatement',
          'Prends du recul avant de réagir',
          'Exprimes tes émotions intensément',
          'Évites ou minimises'
        ]
      },
      {
        id: 'comp_q3',
        text: 'Ton rythme de vie idéal :',
        type: 'single',
        category: 'rhythm',
        options: [
          'Structuré, prévisible',
          'Spontané, changeant',
          'Un équilibre des deux',
          'Je ne sais pas vraiment'
        ]
      },
      {
        id: 'comp_q4',
        text: 'Ce qui te nourrit émotionnellement :',
        type: 'single',
        category: 'love_language',
        options: [
          'Le temps de qualité ensemble',
          'Les mots et les déclarations',
          'Les gestes et le contact physique',
          'Les actes concrets au quotidien'
        ]
      },
      {
        id: 'comp_q5',
        text: 'Ton rapport à l\'espace personnel :',
        type: 'single',
        category: 'space',
        options: [
          'J\'ai besoin de beaucoup d\'espace',
          'J\'ai besoin de peu d\'espace',
          'Ça dépend des moments',
          'Je m\'adapte à l\'autre'
        ]
      },
      {
        id: 'comp_q6',
        text: 'Ce qui crée de la tension pour toi :',
        type: 'single',
        category: 'tension',
        options: [
          'Le silence ou le manque de communication',
          'L\'excès de demandes ou de proximité',
          'L\'imprévisibilité ou l\'instabilité',
          'La routine ou l\'ennui'
        ]
      },
      {
        id: 'comp_q7',
        text: 'Dans un couple, tu préfères :',
        type: 'single',
        category: 'sharing',
        options: [
          'Tout partager',
          'Avoir des espaces séparés',
          'Un mélange équilibré',
          'Ça dépend de la personne'
        ]
      },
      {
        id: 'comp_q8',
        text: 'Ce que tu apportes naturellement :',
        type: 'single',
        category: 'contribution',
        options: [
          'De la stabilité',
          'De l\'intensité',
          'De la légèreté',
          'De la profondeur'
        ]
      }
    ],
    analysisPrompt: `Tu es un analyste de dynamiques relationnelles, spécialisé dans la compatibilité et les interactions de couple.

Analyse les réponses pour créer une cartographie des besoins relationnels de cette personne.

Structure ton analyse ainsi :

## Cartographie de Tes Besoins Relationnels
Visualisation des zones prioritaires : sécurité, passion, liberté, communication. Ce qui est essentiel vs optionnel.

## Ce Que Tu Apportes
Tes forces naturelles dans une relation, ce que tu offres spontanément.

## Ce Dont Tu As Besoin
Ce que tu attends de l'autre, tes besoins non négociables.

## Zones de Friction Potentielles
Les types de personnalités ou de dynamiques qui créent naturellement de la tension pour toi.

## Dynamiques Relationnelles Idéales
Le type de relation qui te correspond le mieux :
- Complémentarité — Ce qui manque à l'un est présent chez l'autre
- Miroir — Refléter les mêmes forces et les mêmes ombres
- Tension Créative — Les différences créent du mouvement
- Ancrage Mutuel — Se stabiliser l'un l'autre
- Défi — Se pousser mutuellement hors de la zone de confort

## Clés Pour Une Relation Durable
Ce qui peut faire durer une relation avec toi.

Ton : analytique mais chaleureux, précis mais nuancé. Pas de "match / no match" simpliste.`
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. THÈME ASTRAL COMPLET — ANALYSE IA
  // ═══════════════════════════════════════════════════════════════════════════
  'astral': {
    id: 'astral',
    title: 'Thème Astral Complet',
    description: 'Ta cartographie intérieure. Un véritable portrait astrologique.',
    introduction: 'L\'astrologie n\'a jamais eu besoin de savoir où tu es né. Elle a besoin de savoir qui tu es.',
    premium: true,
    featured: true,
    hasAI: true,
    archetypes: [],
    resultStructure: {
      title: 'Mon Thème Astral',
      sections: ['☉ Soleil', '☽ Lune', '☿ Mercure', '♀ Vénus', '♂ Mars', '♃ Jupiter', '♄ Saturne', 'Axes', 'Dynamique', 'Synthèse']
    },
    questions: [
      // BLOC 1 : IDENTITÉ ET VOLONTÉ (Soleil)
      {
        id: 'ast_q1',
        text: 'Quand tu te sens le plus "toi-même", c\'est généralement :',
        type: 'single',
        category: 'sun_identity',
        options: [
          'Quand tu agis selon tes convictions, même seul contre tous',
          'Quand tu es reconnu et apprécié par les autres',
          'Quand tu crées quelque chose qui n\'existait pas avant',
          'Quand tu te sens en paix, sans besoin de prouver quoi que ce soit'
        ]
      },
      {
        id: 'ast_q2',
        text: 'Ce qui te donne le sentiment d\'exister vraiment :',
        type: 'single',
        category: 'sun_need',
        options: [
          'Accomplir des choses concrètes et visibles',
          'Être compris profondément par quelqu\'un',
          'Repousser tes propres limites',
          'Contribuer à quelque chose de plus grand que toi'
        ]
      },
      {
        id: 'ast_q3',
        text: 'Face à une décision de vie majeure, tu te fies d\'abord à :',
        type: 'single',
        category: 'sun_guide',
        options: [
          'Ce qui fait sens pour toi, même si c\'est irrationnel',
          'Ce qui est le plus logique et réaliste',
          'Ce que ton instinct te dicte immédiatement',
          'Ce qui te permettra de grandir, même si c\'est difficile'
        ]
      },
      // BLOC 2 : MONDE ÉMOTIONNEL (Lune)
      {
        id: 'ast_q4',
        text: 'Quand tu te sens vulnérable, tu as tendance à :',
        type: 'single',
        category: 'moon_protection',
        options: [
          'Te replier et attendre que ça passe',
          'Chercher la présence de quelqu\'un de proche',
          'T\'occuper pour ne pas y penser',
          'Analyser ce qui se passe pour reprendre le contrôle'
        ]
      },
      {
        id: 'ast_q5',
        text: 'Ce qui te procure un sentiment de sécurité profonde :',
        type: 'single',
        category: 'moon_security',
        options: [
          'Un lieu familier, des rituels, de la stabilité',
          'Savoir que tu peux t\'adapter à tout',
          'Être entouré de personnes qui te connaissent vraiment',
          'Avoir un plan B, une sortie de secours'
        ]
      },
      {
        id: 'ast_q6',
        text: 'Tes émotions sont généralement :',
        type: 'single',
        category: 'moon_climate',
        options: [
          'Intenses mais tu les gardes pour toi',
          'Visibles et expressives',
          'Stables, prévisibles',
          'Changeantes, parfois contradictoires'
        ]
      },
      {
        id: 'ast_q7',
        text: 'Ton rapport à ton passé :',
        type: 'single',
        category: 'moon_memory',
        options: [
          'Tu y penses souvent, il te définit en partie',
          'Tu préfères avancer, le passé est derrière',
          'Tu en tires des leçons mais sans t\'y attarder',
          'Il te hante parfois, certaines choses ne sont pas résolues'
        ]
      },
      // BLOC 3 : PENSÉE ET COMMUNICATION (Mercure)
      {
        id: 'ast_q8',
        text: 'Ta manière naturelle de réfléchir :',
        type: 'single',
        category: 'mercury_style',
        options: [
          'Rapide, tu fais des liens entre tout',
          'Méthodique, étape par étape',
          'Intuitive, les réponses te viennent sans savoir pourquoi',
          'Critique, tu remets tout en question'
        ]
      },
      {
        id: 'ast_q9',
        text: 'Dans une conversation importante, tu :',
        type: 'single',
        category: 'mercury_comm',
        options: [
          'Écoutes d\'abord, parles ensuite',
          'Prends facilement la parole et guides l\'échange',
          'Observes les non-dits autant que les mots',
          'Structures tes arguments avant de les exposer'
        ]
      },
      // BLOC 4 : AMOUR ET ATTRACTION (Vénus)
      {
        id: 'ast_q10',
        text: 'Ce qui te fait tomber amoureux/amoureuse :',
        type: 'single',
        category: 'venus_trigger',
        options: [
          'L\'intelligence, la conversation',
          'L\'intensité, la passion',
          'La douceur, la fiabilité',
          'Le mystère, ce que tu ne comprends pas'
        ]
      },
      {
        id: 'ast_q11',
        text: 'Dans une relation, tu as besoin de :',
        type: 'single',
        category: 'venus_need',
        options: [
          'Liberté et espace personnel',
          'Fusion et intimité constante',
          'Stabilité et engagement clair',
          'Intensité et renouvellement perpétuel'
        ]
      },
      {
        id: 'ast_q12',
        text: 'Ce que tu offres naturellement en amour :',
        type: 'single',
        category: 'venus_gift',
        options: [
          'De la loyauté, de la constance',
          'De la passion, de l\'intensité',
          'De l\'attention, du soin',
          'De la stimulation, de l\'aventure'
        ]
      },
      // BLOC 5 : DÉSIR ET ACTION (Mars)
      {
        id: 'ast_q13',
        text: 'Face à un obstacle, ta première réaction :',
        type: 'single',
        category: 'mars_action',
        options: [
          'Tu fonces, quitte à te brûler',
          'Tu contournes, tu trouves une autre voie',
          'Tu analyses avant d\'agir',
          'Tu attends le bon moment'
        ]
      },
      {
        id: 'ast_q14',
        text: 'Ta colère :',
        type: 'single',
        category: 'mars_anger',
        options: [
          'Explose puis retombe vite',
          'Couve longtemps avant d\'éclater',
          'Se transforme en action constructive',
          'Tu la réprimes, elle sort autrement'
        ]
      },
      // BLOC 6 : EXPANSION ET SENS (Jupiter)
      {
        id: 'ast_q15',
        text: 'Ta vision de la vie tend vers :',
        type: 'single',
        category: 'jupiter_vision',
        options: [
          'L\'optimisme, tout finit par s\'arranger',
          'Le réalisme, il faut voir les choses comme elles sont',
          'Le questionnement permanent, rien n\'est acquis',
          'La foi en quelque chose de plus grand'
        ]
      },
      {
        id: 'ast_q16',
        text: 'Ce qui te donne envie de te lever le matin :',
        type: 'single',
        category: 'jupiter_drive',
        options: [
          'La possibilité d\'apprendre quelque chose de nouveau',
          'Des objectifs concrets à atteindre',
          'Les relations, les gens que tu vas voir',
          'Un projet qui te dépasse'
        ]
      },
      // BLOC 7 : STRUCTURE ET LIMITES (Saturne)
      {
        id: 'ast_q17',
        text: 'Ton rapport au temps :',
        type: 'single',
        category: 'saturn_time',
        options: [
          'Tu as l\'impression qu\'il file trop vite',
          'Tu le structures, tu planifies',
          'Tu vis au présent, le futur viendra',
          'Tu sens le poids du temps, parfois trop'
        ]
      },
      {
        id: 'ast_q18',
        text: 'Ta plus grande peur profonde :',
        type: 'single',
        category: 'saturn_fear',
        options: [
          'Échouer et décevoir',
          'Être abandonné ou rejeté',
          'Perdre le contrôle',
          'Passer à côté de ta vie'
        ]
      }
    ],
    analysisPrompt: `Tu es un astrologue professionnel avec 20 ans d'expérience.
À partir des réponses au questionnaire, tu dois reconstituer un thème astrologique complet et cohérent.

RÈGLES ABSOLUES :
- Ne jamais mentionner que tu "déduis" ou "interprètes" — parle comme si tu lisais un vrai thème natal
- Utiliser le vocabulaire astrologique précis (planètes, signes)
- Être spécifique, jamais vague
- Identifier les tensions ET les harmonies

STRUCTURE OBLIGATOIRE :

## ☉ SOLEIL — IDENTITÉ FONDAMENTALE
**Soleil en [signe déduit]**
- Fonction identitaire : [comment cette personne existe dans le monde]
- Besoin fondamental : [ce sans quoi elle ne peut pas se sentir vivante]
- Expression lumineuse vs Ombre solaire

## ☽ LUNE — MONDE ÉMOTIONNEL
**Lune en [signe déduit]**
- Sécurité émotionnelle et réactions instinctives
- Rapport à l'intimité et mémoire émotionnelle

## ☿ MERCURE — ARCHITECTURE MENTALE
**Mercure en [signe déduit]**
- Style cognitif et communication

## ♀ VÉNUS — CŒUR ET ATTRACTION
**Vénus en [signe déduit]**
- Manière d'aimer, ce qui attire, valeurs relationnelles

## ♂ MARS — DÉSIR ET VOLONTÉ
**Mars en [signe déduit]**
- Mode d'action, expression du désir, gestion de la colère

## ♃ JUPITER — EXPANSION ET FOI
**Jupiter en [signe déduit]**
- Vision du monde, source d'expansion

## ♄ SATURNE — STRUCTURE ET ÉPREUVES
**Saturne en [signe déduit]**
- Peurs structurantes, leçon de vie, maturité acquise

## AXES ASTROLOGIQUES
- Axe Identité/Relation
- Axe Intime/Public
- Axe Contrôle/Lâcher-prise

## DYNAMIQUE GLOBALE
- Forces dominantes (2-3 énergies)
- Tensions internes
- **Travail d'âme** : ce que cette personne est venue apprendre

## SYNTHÈSE ASTRALE
[Paragraphe de 150-200 mots : portrait fluide, professionnel, comme si tu parlais à un client]

TON : expert mais accessible, profond mais concret, jamais ésotérique new-age.
Ce thème doit être assez riche pour être relu pendant des années.`
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════════

export function getQuestionnaire(id: string): Questionnaire | undefined {
  return questionnaires[id];
}

export function getAllQuestionnaires(): Questionnaire[] {
  return Object.values(questionnaires);
}

export function getFreeQuestionnaires(): Questionnaire[] {
  return Object.values(questionnaires).filter(q => !q.premium);
}

export function getPremiumQuestionnaires(): Questionnaire[] {
  return Object.values(questionnaires).filter(q => q.premium);
}

export function getAIQuestionnaires(): Questionnaire[] {
  return Object.values(questionnaires).filter(q => q.hasAI);
}

export function getQuestionnaireArchetypes(id: string): Archetype[] {
  return questionnaires[id]?.archetypes || [];
}
