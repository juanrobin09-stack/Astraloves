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
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  analysisPrompt: string;
  premium?: boolean;
  featured?: boolean;
}

export const questionnaires: Record<string, Questionnaire> = {
  'first_impression': {
    id: 'first_impression',
    title: '👋 Première Impression',
    description: 'Découvrez l\'image que vous projetez lors des premières rencontres',
    premium: false,
    featured: false,
    questions: [
      {
        id: 'q1',
        text: 'Lors d\'une soirée, vous avez tendance à :',
        type: 'single',
        category: 'social_approach',
        options: [
          'Rester dans votre coin et observer',
          'Discuter avec quelques personnes que vous connaissez',
          'Aller vers de nouvelles personnes spontanément',
          'Être au centre de l\'attention'
        ]
      },
      {
        id: 'q2',
        text: 'Quand vous rencontrez quelqu\'un pour la première fois, vous :',
        type: 'single',
        category: 'first_contact',
        options: [
          'Attendez qu\'on vienne vers vous',
          'Souriez poliment et attendez',
          'Engagez la conversation naturellement',
          'Faites une blague pour briser la glace'
        ]
      },
      {
        id: 'q3',
        text: 'Votre langage corporel est généralement :',
        type: 'single',
        category: 'body_language',
        options: [
          'Réservé, bras croisés',
          'Neutre et discret',
          'Ouvert et accueillant',
          'Expressif et dynamique'
        ]
      },
      {
        id: 'q4',
        text: 'Comment décririez-vous votre style vestimentaire ?',
        type: 'single',
        category: 'style',
        options: [
          'Classique et sobre',
          'Décontracté et confortable',
          'Tendance et soigné',
          'Original et remarquable'
        ]
      },
      {
        id: 'q5',
        text: 'Lors d\'une première rencontre, vous parlez plutôt de :',
        type: 'single',
        category: 'conversation',
        options: [
          'Sujets généraux (météo, actualités)',
          'Vos passions et centres d\'intérêt',
          'Questions sur l\'autre personne',
          'Histoires drôles ou anecdotes'
        ]
      },
      {
        id: 'q6',
        text: 'Votre regard lors d\'une conversation :',
        type: 'single',
        category: 'eye_contact',
        options: [
          'Vous évitez souvent le contact visuel',
          'Contact visuel bref et occasionnel',
          'Contact visuel régulier et naturel',
          'Contact visuel intense et soutenu'
        ]
      },
      {
        id: 'q7',
        text: 'Comment gérez-vous les silences dans une conversation ?',
        type: 'single',
        category: 'silence_management',
        options: [
          'Vous êtes mal à l\'aise et cherchez à partir',
          'Vous attendez que l\'autre relance',
          'Vous relancez naturellement la conversation',
          'Vous êtes à l\'aise avec le silence'
        ]
      },
      {
        id: 'q8',
        text: 'Quelle impression pensez-vous laisser généralement ?',
        type: 'single',
        category: 'self_perception',
        options: [
          'Mystérieux/se et réservé/e',
          'Sympathique et accessible',
          'Confiant/e et charismatique',
          'Énergique et mémorable'
        ]
      },
      {
        id: 'q9',
        text: 'Après une première rencontre, vous :',
        type: 'single',
        category: 'follow_up',
        options: [
          'Attendez que l\'autre vous recontacte',
          'Envoyez un message poli quelques jours après',
          'Recontactez rapidement si affinité',
          'Proposez directement de se revoir'
        ]
      },
      {
        id: 'q10',
        text: 'Votre plus grande force en première impression :',
        type: 'single',
        category: 'strength',
        options: [
          'Votre écoute attentive',
          'Votre authenticité',
          'Votre aisance sociale',
          'Votre charisme naturel'
        ]
      }
    ],
    analysisPrompt: `Tu es Astra, une IA experte en psychologie relationnelle et développement personnel.
Analyse les réponses au questionnaire "Première Impression" et fournis une analyse COMPLÈTE en FRANÇAIS.

RÈGLES IMPORTANTES :
- Réponds UNIQUEMENT en français
- Remplis TOUTES les sections sans exception
- Sois bienveillant/e mais honnête
- Personnalise l'analyse selon les réponses données
- Donne des conseils concrets et actionnables

SECTIONS OBLIGATOIRES :
1. Profil identifié (nom + pourcentage de correspondance)
2. Analyse générale (4-5 phrases)
3. Vos Forces (minimum 3 points)
4. Vos Défis (minimum 3 points)
5. Recommandations (minimum 3 conseils)
6. Compatibilités (profils avec lesquels cette personne s'entend le mieux)

PROFILS POSSIBLES :
- Introverti Réservé (majorité de réponses A)
- Sociable Mesuré (majorité de réponses B)
- Charismatique Naturel (majorité de réponses C)
- Extraverti Magnétique (majorité de réponses D)

Format JSON de réponse :
{
  "profil_principal": "Nom du profil",
  "score": "XX",
  "analyse_generale": "Paragraphe de 4-5 phrases",
  "forces": ["Force 1", "Force 2", "Force 3"],
  "defis": ["Défi 1", "Défi 2", "Défi 3"],
  "recommandations": ["Conseil 1", "Conseil 2", "Conseil 3"],
  "compatibilites": {
    "tres_compatible": ["Profil A", "Profil B"],
    "compatible": ["Profil C"],
    "a_travailler": ["Profil D"]
  }
}`
  },

  'seduction': {
    id: 'seduction',
    title: '💋 Test de Séduction',
    description: 'Identifiez vos atouts de séduction et votre style unique',
    premium: false,
    featured: false,
    questions: [
      {
        id: 'q1',
        text: 'Pour séduire, vous misez avant tout sur :',
        type: 'single',
        category: 'main_asset',
        options: [
          'Votre intelligence et vos conversations',
          'Votre humour et votre légèreté',
          'Votre charme physique et votre regard',
          'Votre mystère et votre inaccessibilité'
        ]
      },
      {
        id: 'q2',
        text: 'Lors d\'un flirt, vous êtes plutôt :',
        type: 'single',
        category: 'flirt_style',
        options: [
          'Subtil/e et patient/e',
          'Direct/e et assumé/e',
          'Joueur/se et taquin/e',
          'Passionné/e et intense'
        ]
      },
      {
        id: 'q3',
        text: 'Votre arme de séduction secrète :',
        type: 'single',
        category: 'secret_weapon',
        options: [
          'Votre écoute et votre empathie',
          'Votre confiance en vous',
          'Votre sens de l\'humour',
          'Votre regard et votre sourire'
        ]
      },
      {
        id: 'q4',
        text: 'Face à quelqu\'un qui vous plaît :',
        type: 'single',
        category: 'approach',
        options: [
          'Vous attendez des signes avant d\'agir',
          'Vous montrez subtilement votre intérêt',
          'Vous faites le premier pas',
          'Vous créez une tension et du mystère'
        ]
      },
      {
        id: 'q5',
        text: 'En séduction, vous préférez :',
        type: 'single',
        category: 'preference',
        options: [
          'Les longues discussions profondes',
          'Les moments de complicité et de rire',
          'Le jeu du chat et de la souris',
          'Les moments d\'intensité et de passion'
        ]
      },
      {
        id: 'q6',
        text: 'Votre façon de montrer votre intérêt :',
        type: 'single',
        category: 'showing_interest',
        options: [
          'Compliments sincères et attention',
          'Taquineries et humour',
          'Regards appuyés et rapprochement physique',
          'Messages et petites attentions'
        ]
      },
      {
        id: 'q7',
        text: 'Ce qui vous rend irrésistible selon vous :',
        type: 'single',
        category: 'irresistible',
        options: [
          'Votre authenticité',
          'Votre assurance',
          'Votre sensualité',
          'Votre originalité'
        ]
      },
      {
        id: 'q8',
        text: 'Votre réaction si on vous résiste :',
        type: 'single',
        category: 'resistance',
        options: [
          'Vous respectez et prenez du recul',
          'Vous persévérez avec patience',
          'Vous intensifiez le jeu',
          'Vous passez à autre chose'
        ]
      },
      {
        id: 'q9',
        text: 'Le compliment qui vous touche le plus :',
        type: 'single',
        category: 'compliment',
        options: [
          '"Tu es passionnant/e à écouter"',
          '"Tu me fais tellement rire"',
          '"Tu as un charme fou"',
          '"Tu es différent/e des autres"'
        ]
      },
      {
        id: 'q10',
        text: 'Votre style de séduction en un mot :',
        type: 'single',
        category: 'style_word',
        options: [
          'Intellectuel',
          'Complice',
          'Sensuel',
          'Mystérieux'
        ]
      },
      {
        id: 'q11',
        text: 'Le premier rendez-vous idéal pour vous :',
        type: 'single',
        category: 'ideal_date',
        options: [
          'Un dîner avec longue conversation',
          'Une activité fun ensemble',
          'Un verre dans un lieu intimiste',
          'Une surprise ou quelque chose d\'original'
        ]
      },
      {
        id: 'q12',
        text: 'Ce qui tue l\'attraction pour vous :',
        type: 'single',
        category: 'dealbreaker',
        options: [
          'Le manque de conversation',
          'Le manque d\'humour',
          'Le manque de tension/chimie',
          'La prévisibilité'
        ]
      }
    ],
    analysisPrompt: `Tu es Astra, une IA experte en psychologie relationnelle et développement personnel.
Analyse les réponses au questionnaire "Test de Séduction" et fournis une analyse COMPLÈTE en FRANÇAIS.

RÈGLES IMPORTANTES :
- Réponds UNIQUEMENT en français
- Remplis TOUTES les sections sans exception
- Sois bienveillant/e mais honnête
- Personnalise l'analyse selon les réponses données
- Donne des conseils concrets et actionnables

SECTIONS OBLIGATOIRES :
1. Profil identifié (nom + pourcentage de correspondance)
2. Analyse générale (4-5 phrases)
3. Vos Forces (minimum 3 points)
4. Vos Défis (minimum 3 points)
5. Recommandations (minimum 3 conseils)
6. Compatibilités (profils avec lesquels cette personne a la meilleure alchimie)

PROFILS POSSIBLES :
- Séducteur/trice Intellectuel/le (connexion mentale)
- Séducteur/trice Complice (humour et légèreté)
- Séducteur/trice Sensuel/le (attraction physique)
- Séducteur/trice Mystérieux/se (intrigue et défi)

Format JSON de réponse :
{
  "profil_principal": "Nom du profil",
  "score": "XX",
  "analyse_generale": "Paragraphe de 4-5 phrases",
  "forces": ["Force 1", "Force 2", "Force 3"],
  "defis": ["Défi 1", "Défi 2", "Défi 3"],
  "recommandations": ["Conseil 1", "Conseil 2", "Conseil 3"],
  "compatibilites": {
    "tres_compatible": ["Profil A", "Profil B"],
    "compatible": ["Profil C"],
    "a_travailler": ["Profil D"]
  }
}`
  },

  'attachment': {
    id: 'attachment',
    title: '💕 Style d\'Attachement',
    description: 'Découvrez votre style d\'attachement en amour et relations',
    premium: true,
    featured: false,
    questions: [
      {
        id: 'q1',
        text: 'Dans une relation, vous avez besoin :',
        type: 'single',
        category: 'needs',
        options: [
          'De beaucoup de réassurance et de proximité',
          'D\'un équilibre entre intimité et indépendance',
          'De garder une certaine distance émotionnelle',
          'Ça dépend, vous êtes souvent partagé/e'
        ]
      },
      {
        id: 'q2',
        text: 'Quand votre partenaire ne répond pas rapidement :',
        type: 'single',
        category: 'response_anxiety',
        options: [
          'Vous vous inquiétez et imaginez le pire',
          'Vous attendez patiemment sans stress',
          'Vous appréciez ce moment de tranquillité',
          'Vous oscillez entre inquiétude et détachement'
        ]
      },
      {
        id: 'q3',
        text: 'Exprimer vos émotions dans un couple :',
        type: 'single',
        category: 'emotion_expression',
        options: [
          'Vous en avez besoin mais avez peur du rejet',
          'Vous le faites naturellement et sereinement',
          'Vous trouvez ça difficile et inconfortable',
          'Vous voulez mais vous vous bloquez souvent'
        ]
      },
      {
        id: 'q4',
        text: 'Face aux conflits dans le couple :',
        type: 'single',
        category: 'conflict',
        options: [
          'Vous avez peur que ça mène à la rupture',
          'Vous les gérez calmement par le dialogue',
          'Vous préférez prendre de la distance',
          'Vous réagissez de façon imprévisible'
        ]
      },
      {
        id: 'q5',
        text: 'Votre vision de la dépendance affective :',
        type: 'single',
        category: 'dependency',
        options: [
          'Vous avez tendance à être dépendant/e',
          'Vous trouvez un équilibre sain',
          'Vous évitez toute forme de dépendance',
          'Vous alternez entre les deux extrêmes'
        ]
      },
      {
        id: 'q6',
        text: 'Quand une relation devient sérieuse :',
        type: 'single',
        category: 'commitment',
        options: [
          'Vous êtes rassuré/e mais craignez l\'abandon',
          'Vous vous sentez épanoui/e et confiant/e',
          'Vous ressentez le besoin de freiner',
          'Vous êtes attiré/e et effrayé/e à la fois'
        ]
      },
      {
        id: 'q7',
        text: 'Votre réaction si on vous demande plus d\'engagement :',
        type: 'single',
        category: 'engagement_request',
        options: [
          'Vous êtes content/e mais angoissé/e',
          'Vous acceptez si c\'est réciproque',
          'Vous vous sentez piégé/e',
          'Vous ne savez pas comment réagir'
        ]
      },
      {
        id: 'q8',
        text: 'Enfant, votre relation avec vos parents était :',
        type: 'single',
        category: 'childhood',
        options: [
          'Fusionnelle ou anxieuse',
          'Stable et sécurisante',
          'Distante ou froide',
          'Imprévisible ou chaotique'
        ]
      },
      {
        id: 'q9',
        text: 'Vous pensez que l\'amour :',
        type: 'single',
        category: 'love_vision',
        options: [
          'Est source de bonheur mais aussi de souffrance',
          'Est une belle aventure à construire ensemble',
          'Fait perdre son indépendance',
          'Est compliqué et vous déstabilise'
        ]
      },
      {
        id: 'q10',
        text: 'Après une rupture, vous :',
        type: 'single',
        category: 'breakup',
        options: [
          'Êtes dévasté/e et avez du mal à vous en remettre',
          'Êtes triste mais vous reconstruisez',
          'Passez à autre chose assez vite',
          'Oscillez entre désespoir et détachement'
        ]
      },
      {
        id: 'q11',
        text: 'Ce que vous recherchez chez un partenaire :',
        type: 'single',
        category: 'partner_search',
        options: [
          'Quelqu\'un de très présent et rassurant',
          'Quelqu\'un d\'équilibré et stable',
          'Quelqu\'un qui respecte votre espace',
          'Vous ne savez pas vraiment'
        ]
      },
      {
        id: 'q12',
        text: 'Votre plus grande peur en amour :',
        type: 'single',
        category: 'fear',
        options: [
          'L\'abandon',
          'Aucune peur particulière',
          'Perdre votre liberté',
          'L\'intimité elle-même'
        ]
      },
      {
        id: 'q13',
        text: 'Quand tout va bien dans votre couple :',
        type: 'single',
        category: 'when_good',
        options: [
          'Vous attendez que quelque chose tourne mal',
          'Vous profitez sereinement',
          'Vous vous demandez si c\'est vraiment ce que vous voulez',
          'Vous sabotez parfois inconsciemment'
        ]
      },
      {
        id: 'q14',
        text: 'Votre façon de montrer votre amour :',
        type: 'single',
        category: 'love_expression',
        options: [
          'Demander de la réassurance et être très présent/e',
          'Gestes d\'affection équilibrés et communication',
          'Actes plutôt que mots, en gardant une distance',
          'De façon imprévisible et intense'
        ]
      }
    ],
    analysisPrompt: `Tu es Astra, une IA experte en psychologie relationnelle et développement personnel.
Analyse les réponses au questionnaire "Style d'Attachement" et fournis une analyse COMPLÈTE en FRANÇAIS.

RÈGLES IMPORTANTES :
- Réponds UNIQUEMENT en français
- Remplis TOUTES les sections sans exception
- Sois bienveillant/e mais honnête
- Personnalise l'analyse selon les réponses données
- Donne des conseils concrets et actionnables

SECTIONS OBLIGATOIRES :
1. Profil identifié (nom + pourcentage de correspondance)
2. Analyse générale (4-5 phrases)
3. Vos Forces (minimum 3 points)
4. Vos Défis (minimum 3 points)
5. Recommandations (minimum 3 conseils)
6. Compatibilités (styles d'attachement les plus compatibles)

PROFILS POSSIBLES :
- Attachement Anxieux (peur de l'abandon, besoin de réassurance)
- Attachement Sécure (confiance, équilibre, sérénité)
- Attachement Évitant (indépendance, distance émotionnelle)
- Attachement Désorganisé (ambivalence, peur de l'intimité)

Format JSON de réponse :
{
  "profil_principal": "Nom du profil",
  "score": "XX",
  "analyse_generale": "Paragraphe de 4-5 phrases",
  "forces": ["Force 1", "Force 2", "Force 3"],
  "defis": ["Défi 1", "Défi 2", "Défi 3"],
  "recommandations": ["Conseil 1", "Conseil 2", "Conseil 3"],
  "compatibilites": {
    "tres_compatible": ["Profil A", "Profil B"],
    "compatible": ["Profil C"],
    "a_travailler": ["Profil D"]
  }
}`
  },

  'archetype': {
    id: 'archetype',
    title: '🌟 Archétype Amoureux',
    description: 'Découvrez votre archétype amoureux parmi 12 profils uniques',
    premium: true,
    featured: false,
    questions: [
      {
        id: 'q1',
        text: 'En amour, vous êtes guidé/e par :',
        type: 'single',
        category: 'guidance',
        options: [
          'La passion et l\'intensité',
          'La raison et la compatibilité',
          'L\'aventure et la nouveauté',
          'La sécurité et la stabilité'
        ]
      },
      {
        id: 'q2',
        text: 'Votre façon d\'aimer :',
        type: 'single',
        category: 'love_style',
        options: [
          'Totale et fusionnelle',
          'Réfléchie et progressive',
          'Libre et sans attaches',
          'Protectrice et dévouée'
        ]
      },
      {
        id: 'q3',
        text: 'Ce qui vous fait craquer :',
        type: 'single',
        category: 'attraction',
        options: [
          'L\'intensité du regard et la connexion',
          'L\'intelligence et les valeurs communes',
          'L\'imprévu et le mystère',
          'La gentillesse et la fiabilité'
        ]
      },
      {
        id: 'q4',
        text: 'Votre défaut en amour :',
        type: 'single',
        category: 'flaw',
        options: [
          'La jalousie ou la possessivité',
          'La froideur ou le calcul',
          'L\'inconstance ou la fuite',
          'La dépendance ou l\'oubli de soi'
        ]
      },
      {
        id: 'q5',
        text: 'Votre relation idéale :',
        type: 'single',
        category: 'ideal_relation',
        options: [
          'Passionnée comme dans les films',
          'Construite sur des bases solides',
          'Libre et sans routine',
          'Douce et réconfortante'
        ]
      },
      {
        id: 'q6',
        text: 'Face à un/e prétendant/e :',
        type: 'single',
        category: 'suitor',
        options: [
          'Vous foncez si l\'attirance est là',
          'Vous analysez la compatibilité',
          'Vous gardez vos options ouvertes',
          'Vous prenez votre temps'
        ]
      },
      {
        id: 'q7',
        text: 'L\'amour pour vous c\'est :',
        type: 'single',
        category: 'love_meaning',
        options: [
          'Un feu dévorant',
          'Un partenariat équilibré',
          'Une liberté partagée',
          'Un refuge sûr'
        ]
      },
      {
        id: 'q8',
        text: 'Votre plus belle qualité amoureuse :',
        type: 'single',
        category: 'quality',
        options: [
          'Votre passion',
          'Votre loyauté',
          'Votre indépendance',
          'Votre dévouement'
        ]
      },
      {
        id: 'q9',
        text: 'Ce qui vous fait fuir :',
        type: 'single',
        category: 'dealbreaker',
        options: [
          'La tiédeur et l\'ennui',
          'L\'irrationalité et l\'instabilité',
          'La routine et les contraintes',
          'L\'égoïsme et l\'indifférence'
        ]
      },
      {
        id: 'q10',
        text: 'Vous exprimez votre amour par :',
        type: 'single',
        category: 'expression',
        options: [
          'Des déclarations intenses et des gestes romantiques',
          'Des preuves concrètes et la fidélité',
          'Des expériences partagées et la complicité',
          'Le soutien au quotidien et la présence'
        ]
      },
      {
        id: 'q11',
        text: 'Votre vision du couple :',
        type: 'single',
        category: 'couple_vision',
        options: [
          'Deux âmes sœurs fusionnées',
          'Deux partenaires complémentaires',
          'Deux individus libres ensemble',
          'Deux personnes qui prennent soin l\'une de l\'autre'
        ]
      },
      {
        id: 'q12',
        text: 'En cas de crise dans le couple :',
        type: 'single',
        category: 'crisis',
        options: [
          'Vous vivez tout intensément (disputes passionnées)',
          'Vous cherchez des solutions rationnelles',
          'Vous prenez du recul ou de la distance',
          'Vous faites tout pour arranger les choses'
        ]
      },
      {
        id: 'q13',
        text: 'Le geste romantique qui vous représente :',
        type: 'single',
        category: 'romantic_gesture',
        options: [
          'Une déclaration passionnée sous la pluie',
          'Un projet de vie construit ensemble',
          'Un voyage surprise improvisé',
          'Un petit déjeuner au lit un dimanche matin'
        ]
      },
      {
        id: 'q14',
        text: 'Votre motto en amour :',
        type: 'single',
        category: 'motto',
        options: [
          '"Aimer à en perdre la raison"',
          '"Construire pour durer"',
          '"Vivre l\'instant présent"',
          '"Aimer c\'est prendre soin"'
        ]
      }
    ],
    analysisPrompt: `Tu es Astra, une IA experte en psychologie relationnelle et développement personnel.
Analyse les réponses au questionnaire "Archétype Amoureux" et fournis une analyse COMPLÈTE en FRANÇAIS.

RÈGLES IMPORTANTES :
- Réponds UNIQUEMENT en français
- Remplis TOUTES les sections sans exception
- Sois bienveillant/e mais honnête
- Personnalise l'analyse selon les réponses données
- Donne des conseils concrets et actionnables

SECTIONS OBLIGATOIRES :
1. Profil identifié (nom + pourcentage de correspondance)
2. Analyse générale (4-5 phrases)
3. Vos Forces (minimum 3 points)
4. Vos Défis (minimum 3 points)
5. Recommandations (minimum 3 conseils)
6. Compatibilités (archétypes les plus compatibles)

ARCHÉTYPES POSSIBLES (12) :
- Le Passionné/La Passionnée (Amour intense et dévorant)
- Le Romantique (Idéaliste et fleur bleue)
- Le Partenaire (Équilibré et fiable)
- L'Analyste (Réfléchi et stratégique)
- L'Aventurier/L'Aventurière (Libre et spontané/e)
- Le Papillon (Volage et charmeur/se)
- Le Protecteur/La Protectrice (Dévoué/e et attentionné/e)
- Le Nourricier/La Nourricière (Généreux/se et maternant/e)
- L'Indépendant/e (Autonome et détaché/e)
- Le Mystérieux/La Mystérieuse (Insaisissable et intrigant/e)
- Le Loyal/La Loyale (Fidèle et engagé/e)
- L'Idéaliste (Rêveur/se et en quête d'absolu)

Format JSON de réponse :
{
  "profil_principal": "Nom de l'archétype",
  "score": "XX",
  "analyse_generale": "Paragraphe de 4-5 phrases",
  "forces": ["Force 1", "Force 2", "Force 3"],
  "defis": ["Défi 1", "Défi 2", "Défi 3"],
  "recommandations": ["Conseil 1", "Conseil 2", "Conseil 3"],
  "compatibilites": {
    "tres_compatible": ["Profil A", "Profil B"],
    "compatible": ["Profil C"],
    "a_travailler": ["Profil D"]
  }
}`
  },

  'compatibility': {
    id: 'compatibility',
    title: '❤️ Test de Compatibilité',
    description: 'Découvrez votre profil relationnel et vos besoins en couple',
    premium: true,
    featured: false,
    questions: [
      {
        id: 'q1',
        text: 'Dans un couple, la communication c\'est :',
        type: 'single',
        category: 'communication',
        options: [
          'Essentiel, vous parlez de tout',
          'Important mais vous gardez une part de mystère',
          'Vous préférez les actes aux mots',
          'Difficile pour vous'
        ]
      },
      {
        id: 'q2',
        text: 'Votre façon de gérer les désaccords :',
        type: 'single',
        category: 'conflict_management',
        options: [
          'Discussion immédiate pour résoudre',
          'Vous laissez retomber avant d\'en parler',
          'Vous évitez les conflits',
          'Vous avez du mal à ne pas vous emporter'
        ]
      },
      {
        id: 'q3',
        text: 'Le temps passé ensemble idéalement :',
        type: 'single',
        category: 'time_together',
        options: [
          'Maximum, vous adorez être ensemble',
          'Équilibré avec des moments solo',
          'Vous avez besoin de beaucoup d\'espace',
          'Ça dépend de votre humeur'
        ]
      },
      {
        id: 'q4',
        text: 'Les petites attentions au quotidien :',
        type: 'single',
        category: 'daily_attention',
        options: [
          'Vous en donnez et en attendez beaucoup',
          'Vous les appréciez avec modération',
          'Ce n\'est pas votre priorité',
          'Vous préférez les grands gestes'
        ]
      },
      {
        id: 'q5',
        text: 'Votre vision de la fidélité :',
        type: 'single',
        category: 'fidelity',
        options: [
          'Absolue et non négociable',
          'Importante mais vous pouvez discuter des limites',
          'Vous croyez en la liberté dans le couple',
          'Vous avez du mal avec les engagements'
        ]
      },
      {
        id: 'q6',
        text: 'Face aux amis/famille du partenaire :',
        type: 'single',
        category: 'social_integration',
        options: [
          'Vous vous intégrez facilement',
          'Vous faites des efforts mesurés',
          'Vous préférez garder une distance',
          'Vous êtes mal à l\'aise'
        ]
      },
      {
        id: 'q7',
        text: 'Les projets d\'avenir ensemble :',
        type: 'single',
        category: 'future_projects',
        options: [
          'Vous en parlez très tôt',
          'Vous laissez venir naturellement',
          'Vous évitez ce sujet',
          'Ça vous fait peur'
        ]
      },
      {
        id: 'q8',
        text: 'Ce qui est non négociable pour vous :',
        type: 'single',
        category: 'non_negotiable',
        options: [
          'Le respect et la communication',
          'L\'indépendance et la confiance',
          'La passion et l\'attraction',
          'La stabilité et la sécurité'
        ]
      }
    ],
    analysisPrompt: `Tu es Astra, une IA experte en psychologie relationnelle et développement personnel.
Analyse les réponses au questionnaire "Test de Compatibilité" et fournis une analyse COMPLÈTE en FRANÇAIS.

RÈGLES IMPORTANTES :
- Réponds UNIQUEMENT en français
- Remplis TOUTES les sections sans exception
- Sois bienveillant/e mais honnête
- Personnalise l'analyse selon les réponses données
- Donne des conseils concrets et actionnables

SECTIONS OBLIGATOIRES :
1. Profil identifié (nom + pourcentage de correspondance)
2. Analyse générale (4-5 phrases)
3. Vos Forces (minimum 3 points)
4. Vos Défis (minimum 3 points)
5. Recommandations (minimum 3 conseils)
6. Compatibilités (profils relationnels les plus compatibles)

PROFILS RELATIONNELS POSSIBLES :
- Le Communicant (connexion par le dialogue)
- L'Indépendant (besoin d'espace)
- Le Fusionnel (besoin de proximité)
- L'Équilibré (juste milieu)

Format JSON de réponse :
{
  "profil_principal": "Nom du profil",
  "score": "XX",
  "analyse_generale": "Paragraphe de 4-5 phrases",
  "forces": ["Force 1", "Force 2", "Force 3"],
  "defis": ["Défi 1", "Défi 2", "Défi 3"],
  "recommandations": ["Conseil 1", "Conseil 2", "Conseil 3"],
  "compatibilites": {
    "tres_compatible": ["Profil A", "Profil B"],
    "compatible": ["Profil C"],
    "a_travailler": ["Profil D"]
  }
}`
  },

  'astral': {
    id: 'astral',
    title: '🌟 Thème Astral Complet',
    description: 'Analyse astrologique complète de votre personnalité amoureuse',
    premium: true,
    featured: true,
    questions: [
      {
        id: 'q1',
        text: 'Quel élément vous représente le mieux ?',
        type: 'single',
        category: 'element',
        options: [
          '🔥 Feu - Passionné, impulsif, énergique',
          '🌍 Terre - Stable, concret, sensuel',
          '💨 Air - Intellectuel, communicatif, léger',
          '💧 Eau - Émotif, intuitif, profond'
        ]
      },
      {
        id: 'q2',
        text: 'En amour, vous êtes plutôt guidé/e par :',
        type: 'single',
        category: 'guidance',
        options: [
          'Votre cœur (émotions)',
          'Votre tête (raison)',
          'Votre instinct (ressenti)',
          'Un mélange des trois'
        ]
      },
      {
        id: 'q3',
        text: 'Ce que vous recherchez chez un partenaire (signe compatible) :',
        type: 'single',
        category: 'partner_search',
        options: [
          'Quelqu\'un qui vous stimule et vous challenge',
          'Quelqu\'un de stable et fiable',
          'Quelqu\'un d\'intellectuel et drôle',
          'Quelqu\'un de profond et émotionnel'
        ]
      },
      {
        id: 'q4',
        text: 'Votre plus grand défi en amour selon vous :',
        type: 'single',
        category: 'challenge',
        options: [
          'Canaliser votre impulsivité',
          'Sortir de votre zone de confort',
          'Vous engager émotionnellement',
          'Gérer vos émotions intenses'
        ]
      },
      {
        id: 'q5',
        text: 'La Lune influence vos émotions. Vous vous sentez :',
        type: 'single',
        category: 'moon',
        options: [
          'Stable émotionnellement',
          'Changeant/e selon les périodes',
          'Très sensible aux ambiances',
          'Déconnecté/e de vos émotions'
        ]
      },
      {
        id: 'q6',
        text: 'Vénus représente l\'amour. Vous aimez :',
        type: 'single',
        category: 'venus',
        options: [
          'Avec passion et intensité',
          'Avec constance et fidélité',
          'Avec légèreté et liberté',
          'Avec profondeur et fusion'
        ]
      },
      {
        id: 'q7',
        text: 'Mars représente le désir. Votre énergie sexuelle est :',
        type: 'single',
        category: 'mars',
        options: [
          'Intense et passionnée',
          'Régulière et sensuelle',
          'Variable et cérébrale',
          'Profonde et émotionnelle'
        ]
      },
      {
        id: 'q8',
        text: 'Votre compatibilité idéale :',
        type: 'single',
        category: 'compatibility',
        options: [
          'Signes de Feu (Bélier, Lion, Sagittaire)',
          'Signes de Terre (Taureau, Vierge, Capricorne)',
          'Signes d\'Air (Gémeaux, Balance, Verseau)',
          'Signes d\'Eau (Cancer, Scorpion, Poissons)'
        ]
      },
      {
        id: 'q9',
        text: 'Ce qui vous décrit le mieux :',
        type: 'single',
        category: 'self_description',
        options: [
          'Leader naturel, besoin d\'admiration',
          'Travailleur/se, besoin de sécurité',
          'Social/e, besoin de stimulation intellectuelle',
          'Empathique, besoin de connexion émotionnelle'
        ]
      },
      {
        id: 'q10',
        text: 'Votre façon de gérer les ruptures :',
        type: 'single',
        category: 'breakup',
        options: [
          'Vous passez vite à autre chose',
          'Vous prenez le temps de digérer',
          'Vous rationalisez et analysez',
          'Vous vivez un deuil émotionnel profond'
        ]
      },
      {
        id: 'q11',
        text: 'Votre plus belle qualité amoureuse selon l\'astrologie :',
        type: 'single',
        category: 'quality',
        options: [
          'Votre courage et votre passion',
          'Votre loyauté et votre sensualité',
          'Votre charme et votre communication',
          'Votre intuition et votre empathie'
        ]
      },
      {
        id: 'q12',
        text: 'À quel moment te sens-tu le plus énergique ?',
        type: 'single',
        category: 'energy_time',
        options: [
          '🌅 Lever du soleil',
          '☀️ Plein midi',
          '🌆 Coucher du soleil',
          '🌙 Nuit étoilée'
        ]
      },
      {
        id: 'q13',
        text: 'Quelle phase de la lune te parle le plus ?',
        type: 'single',
        category: 'moon_phase',
        options: [
          '🌑 Nouvelle lune - Nouveaux départs',
          '🌓 Premier quartier - Action',
          '🌕 Pleine lune - Émotions',
          '�� Dernier quartier - Lâcher prise'
        ]
      },
      {
        id: 'q14',
        text: 'Ton rêve de vie idéale ?',
        type: 'single',
        category: 'life_dream',
        options: [
          'Aventure et découverte',
          'Famille et stabilité',
          'Liberté et créativité',
          'Impact et sens'
        ]
      },
      {
        id: 'q15',
        text: 'Comment voudrais-tu qu\'on se souvienne de toi ?',
        type: 'single',
        category: 'legacy',
        options: [
          'Quelqu\'un d\'inspirant',
          'Quelqu\'un de fiable',
          'Quelqu\'un de libre',
          'Quelqu\'un de profond'
        ]
      }
    ],
    analysisPrompt: `Tu es Astra, une IA experte en astrologie et psychologie relationnelle.
Analyse les réponses au questionnaire "Thème Astral Complet" et fournis une analyse COMPLÈTE en FRANÇAIS.

RÈGLES IMPORTANTES :
- Réponds UNIQUEMENT en français
- Remplis TOUTES les sections sans exception
- Sois bienveillant/e mais honnête
- Personnalise l'analyse selon les réponses données
- Donne des conseils concrets et actionnables
- Analyse basée sur les éléments astrologiques : Soleil, Lune, Vénus, Mars

SECTIONS OBLIGATOIRES :
1. Profil identifié (élément dominant + pourcentage)
2. Analyse générale (4-5 phrases)
3. Vos Forces (minimum 3 points)
4. Vos Défis (minimum 3 points)
5. Recommandations (minimum 3 conseils)
6. Compatibilités (signes/éléments les plus compatibles)

ÉLÉMENTS DOMINANTS :
- Feu (Bélier, Lion, Sagittaire) - Passion, action, spontanéité
- Terre (Taureau, Vierge, Capricorne) - Stabilité, sensualité, pragmatisme
- Air (Gémeaux, Balance, Verseau) - Intellect, communication, liberté
- Eau (Cancer, Scorpion, Poissons) - Émotion, intuition, profondeur

Format JSON de réponse :
{
  "profil_principal": "Élément dominant",
  "score": "XX",
  "analyse_generale": "Paragraphe de 4-5 phrases",
  "forces": ["Force 1", "Force 2", "Force 3"],
  "defis": ["Défi 1", "Défi 2", "Défi 3"],
  "recommandations": ["Conseil 1", "Conseil 2", "Conseil 3"],
  "compatibilites": {
    "tres_compatible": ["Élément A", "Élément B"],
    "compatible": ["Élément C"],
    "a_travailler": ["Élément D"]
  }
}`
  }
};
