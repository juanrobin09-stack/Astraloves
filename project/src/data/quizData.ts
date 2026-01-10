// ═══════════════════════════════════════════════════════════════════════════════
// SYSTÈME DE QUESTIONNAIRES PREMIUM — ASTRALOVES
// Questionnaires introspectifs avec analyses IA approfondies
// ═══════════════════════════════════════════════════════════════════════════════

export interface QuizQuestion {
  id: string;
  text: string;
  subtext?: string; // Indication subtile pour guider la réflexion
  type: 'choice' | 'scale' | 'dilemma' | 'introspection';
  options: {
    value: string;
    label: string;
    score?: number;
    dimension?: string; // Pour l'analyse multidimensionnelle
  }[];
}

export interface AnalysisTemplate {
  sections: {
    title: string;
    key: string;
    description: string;
  }[];
  archetypes?: {
    id: string;
    name: string;
    description: string;
    traits: string[];
  }[];
}

export interface Quiz {
  id: string;
  name: string;
  title: string;
  description: string;
  introduction: string; // Phrase d'accroche introspective
  icon: string;
  isPremium: boolean;
  isAIAnalysis: boolean; // Analyse IA approfondie
  requiredTier: 'free' | 'premium' | 'premium_elite';
  questionCount: number;
  questions: QuizQuestion[];
  category: string;
  analysisTemplate: AnalysisTemplate;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. PREMIÈRE IMPRESSION — Fondation
// Ce que les autres perçoivent de toi avant même que tu ne parles.
// ═══════════════════════════════════════════════════════════════════════════════

const firstImpressionQuiz: Quiz = {
  id: 'first-impression',
  name: 'Première Impression',
  title: 'Première Impression',
  description: 'Ce que les autres perçoivent de toi avant même que tu ne parles.',
  introduction: 'Avant les mots, il y a ton énergie. Explore ce que tu dégages en silence.',
  icon: 'Eye',
  isPremium: false,
  isAIAnalysis: false,
  requiredTier: 'free',
  questionCount: 10,
  category: 'Fondation',
  analysisTemplate: {
    sections: [
      { title: 'Portrait de ton aura sociale', key: 'aura', description: 'L\'énergie que tu projettes dans l\'espace' },
      { title: 'Ce que tu dégages sans le vouloir', key: 'unconscious', description: 'Les signaux invisibles que tu émets' },
      { title: 'Décalage intention-perception', key: 'gap', description: 'L\'écart entre ce que tu veux montrer et ce qui est perçu' },
      { title: 'Ton archétype de première impression', key: 'archetype', description: 'Le profil dominant que tu incarnes' }
    ],
    archetypes: [
      { id: 'magnetic', name: 'Le Magnétique', description: 'Tu attires naturellement les regards sans effort apparent. Ta présence est une force silencieuse.', traits: ['charisme naturel', 'assurance calme', 'regard captivant'] },
      { id: 'reserved', name: 'Le Réservé', description: 'Tu cultives une distance qui intrigue. Les autres doivent venir vers toi pour te découvrir.', traits: ['mystère calculé', 'profondeur perçue', 'économie de gestes'] },
      { id: 'mysterious', name: 'Le Mystérieux', description: 'Tu éveilles la curiosité. On ne sait jamais vraiment ce que tu penses.', traits: ['aura énigmatique', 'silence éloquent', 'présence intrigante'] },
      { id: 'radiant', name: 'Le Rayonnant', description: 'Tu illumines l\'espace autour de toi. Ton énergie est contagieuse et réchauffante.', traits: ['chaleur naturelle', 'sourire fréquent', 'ouverture visible'] },
      { id: 'grounded', name: 'L\'Ancré', description: 'Tu dégages une stabilité rassurante. Les autres se sentent en sécurité près de toi.', traits: ['calme apparent', 'solidité perçue', 'présence apaisante'] }
    ]
  },
  questions: [
    {
      id: 'fi-1',
      text: 'Quand tu entres dans une pièce remplie d\'inconnus, que ressens-tu physiquement ?',
      subtext: 'Observe ta première réaction corporelle.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Une contraction, l\'envie de me faire petit', score: 1, dimension: 'withdrawal' },
        { value: 'b', label: 'Une neutralité, je scanne l\'environnement', score: 2, dimension: 'observation' },
        { value: 'c', label: 'Une ouverture, j\'occupe naturellement l\'espace', score: 3, dimension: 'presence' },
        { value: 'd', label: 'Une expansion, l\'énergie monte en moi', score: 4, dimension: 'magnetism' }
      ]
    },
    {
      id: 'fi-2',
      text: 'Ton regard, en situation sociale, est plutôt...',
      subtext: 'Pense à comment tu poses tes yeux sur les autres.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Fuyant, je regarde ailleurs ou vers le bas', score: 1, dimension: 'avoidance' },
        { value: 'b', label: 'Bref, je croise les yeux puis détourne', score: 2, dimension: 'caution' },
        { value: 'c', label: 'Soutenu, je maintiens le contact avec aisance', score: 3, dimension: 'confidence' },
        { value: 'd', label: 'Pénétrant, les gens disent que mon regard "traverse"', score: 4, dimension: 'intensity' }
      ]
    },
    {
      id: 'fi-3',
      text: 'Ta posture au repos, sans y penser, c\'est...',
      subtext: 'Visualise-toi assis dans un café.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Recroquevillé, bras croisés ou jambes serrées', score: 1, dimension: 'closed' },
        { value: 'b', label: 'Neutre, ni ouvert ni fermé', score: 2, dimension: 'neutral' },
        { value: 'c', label: 'Détendu, occupant confortablement l\'espace', score: 3, dimension: 'relaxed' },
        { value: 'd', label: 'Expansif, mes gestes sont amples', score: 4, dimension: 'expansive' }
      ]
    },
    {
      id: 'fi-4',
      text: 'Les silences dans une conversation te font...',
      subtext: 'Ces moments où personne ne parle.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Paniquer intérieurement, je dois les combler', score: 1, dimension: 'anxiety' },
        { value: 'b', label: 'Légèrement inconfortable, mais je gère', score: 2, dimension: 'discomfort' },
        { value: 'c', label: 'À l\'aise, le silence peut être riche', score: 3, dimension: 'comfort' },
        { value: 'd', label: 'Puissant, je sais utiliser le silence', score: 4, dimension: 'mastery' }
      ]
    },
    {
      id: 'fi-5',
      text: 'Si quelqu\'un t\'observe de loin sans que tu le saches, il verrait...',
      subtext: 'Imagine un observateur neutre.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Quelqu\'un qui semble vouloir disparaître', score: 1, dimension: 'invisible' },
        { value: 'b', label: 'Une personne normale, rien de particulier', score: 2, dimension: 'ordinary' },
        { value: 'c', label: 'Quelqu\'un de posé, avec une certaine assurance', score: 3, dimension: 'poised' },
        { value: 'd', label: 'Une présence qui se remarque, même immobile', score: 4, dimension: 'striking' }
      ]
    },
    {
      id: 'fi-6',
      text: 'Ton rythme naturel de parole est...',
      subtext: 'Quand tu es toi-même, sans forcer.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Rapide et nerveux, je parle vite', score: 1, dimension: 'rushed' },
        { value: 'b', label: 'Modéré, je m\'adapte à l\'interlocuteur', score: 2, dimension: 'adaptive' },
        { value: 'c', label: 'Posé, je prends mon temps', score: 3, dimension: 'measured' },
        { value: 'd', label: 'Lent et délibéré, chaque mot compte', score: 4, dimension: 'deliberate' }
      ]
    },
    {
      id: 'fi-7',
      text: 'Quand on te rencontre pour la première fois, les gens pensent souvent que tu es...',
      subtext: 'Ce qu\'on t\'a dit ou que tu as deviné.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Timide ou distant', score: 1, dimension: 'perceived_shy' },
        { value: 'b', label: 'Sympathique mais ordinaire', score: 2, dimension: 'perceived_normal' },
        { value: 'c', label: 'Confiant et accessible', score: 3, dimension: 'perceived_confident' },
        { value: 'd', label: 'Impressionnant ou intimidant', score: 4, dimension: 'perceived_powerful' }
      ]
    },
    {
      id: 'fi-8',
      text: 'Ton énergie fluctue en fonction de l\'environnement...',
      subtext: 'Selon les lieux et les personnes.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Énormément, je suis une éponge', score: 1, dimension: 'reactive' },
        { value: 'b', label: 'Modérément, certains lieux me drainent', score: 2, dimension: 'sensitive' },
        { value: 'c', label: 'Peu, je maintiens mon niveau', score: 3, dimension: 'stable' },
        { value: 'd', label: 'C\'est moi qui influence l\'atmosphère', score: 4, dimension: 'influencer' }
      ]
    },
    {
      id: 'fi-9',
      text: 'Ta façon de serrer la main ou de saluer...',
      subtext: 'Ce premier contact physique.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Hésitante, parfois maladroite', score: 1, dimension: 'awkward' },
        { value: 'b', label: 'Correcte, polie mais sans plus', score: 2, dimension: 'polite' },
        { value: 'c', label: 'Chaleureuse et engagée', score: 3, dimension: 'warm' },
        { value: 'd', label: 'Mémorable, les gens s\'en souviennent', score: 4, dimension: 'memorable' }
      ]
    },
    {
      id: 'fi-10',
      text: 'Ce que tu aimerais que les gens perçoivent vs ce qu\'ils perçoivent réellement...',
      subtext: 'Sois honnête avec toi-même.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Grand décalage, ils me voient très différemment', score: 1, dimension: 'disconnect' },
        { value: 'b', label: 'Quelques différences, normal', score: 2, dimension: 'minor_gap' },
        { value: 'c', label: 'Assez aligné, ils me voient comme je suis', score: 3, dimension: 'aligned' },
        { value: 'd', label: 'Parfaitement aligné, je contrôle mon image', score: 4, dimension: 'mastered' }
      ]
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. TEST DE SÉDUCTION — Fondation
// Ton langage silencieux. Ce qui attire sans que tu le saches.
// ═══════════════════════════════════════════════════════════════════════════════

const seductionQuiz: Quiz = {
  id: 'seduction-test',
  name: 'Test de Séduction',
  title: 'Test de Séduction',
  description: 'Ton langage silencieux. Ce qui attire sans que tu le saches.',
  introduction: 'La séduction n\'est pas ce que tu fais. C\'est ce que tu es quand tu ne fais rien.',
  icon: 'Flame',
  isPremium: false,
  isAIAnalysis: false,
  requiredTier: 'free',
  questionCount: 12,
  category: 'Fondation',
  analysisTemplate: {
    sections: [
      { title: 'Style de séduction inconscient', key: 'style', description: 'Ta signature attractive naturelle' },
      { title: 'Forces d\'attraction naturelles', key: 'strengths', description: 'Ce qui magnétise vers toi' },
      { title: 'Zones de friction ou de malentendu', key: 'friction', description: 'Là où ton message peut être mal compris' },
      { title: 'Ton énergie dans l\'intimité émotionnelle', key: 'intimacy', description: 'Comment tu es ressenti en proximité' }
    ],
    archetypes: [
      { id: 'passionate', name: 'Le Passionné', description: 'Tu séduis par l\'intensité. Ton feu intérieur est palpable.', traits: ['ardeur visible', 'engagement total', 'énergie brûlante'] },
      { id: 'intellectual', name: 'Le Cérébral', description: 'Tu séduis par l\'esprit. La connexion mentale précède tout.', traits: ['conversations profondes', 'humour fin', 'curiosité stimulante'] },
      { id: 'tender', name: 'Le Tendre', description: 'Tu séduis par la douceur. Ta bienveillance désarme.', traits: ['attention sincère', 'gestes doux', 'écoute profonde'] },
      { id: 'enigmatic', name: 'L\'Énigmatique', description: 'Tu séduis par le mystère. On veut te découvrir.', traits: ['réserve calculée', 'silences éloquents', 'révélations dosées'] },
      { id: 'playful', name: 'Le Joueur', description: 'Tu séduis par la légèreté. L\'interaction est un jeu.', traits: ['taquineries', 'imprévisibilité', 'énergie ludique'] }
    ]
  },
  questions: [
    {
      id: 'sed-1',
      text: 'Quand tu sens une attirance naissante, ton corps...',
      subtext: 'La réaction physique avant la pensée.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Se tend, se rapproche imperceptiblement', score: 4, dimension: 'physical' },
        { value: 'b', label: 'S\'anime, mes gestes deviennent plus expressifs', score: 3, dimension: 'expressive' },
        { value: 'c', label: 'Se calme, je deviens plus attentif', score: 2, dimension: 'attentive' },
        { value: 'd', label: 'Se ferme, je cache mon intérêt', score: 1, dimension: 'hidden' }
      ]
    },
    {
      id: 'sed-2',
      text: 'Ta façon naturelle d\'entrer dans l\'espace intime de quelqu\'un...',
      subtext: 'Comment tu réduis la distance.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Progressive, par touches subtiles', score: 3, dimension: 'gradual' },
        { value: 'b', label: 'Directe, quand l\'énergie le permet', score: 4, dimension: 'direct' },
        { value: 'c', label: 'Verbale d\'abord, l\'intimité émotionnelle avant physique', score: 2, dimension: 'emotional_first' },
        { value: 'd', label: 'J\'attends qu\'on vienne vers moi', score: 1, dimension: 'passive' }
      ]
    },
    {
      id: 'sed-3',
      text: 'Le silence entre vous deux, quand il y a tension...',
      subtext: 'Ces moments chargés d\'électricité.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Je le maintiens, je le fais durer', score: 4, dimension: 'tension_builder' },
        { value: 'b', label: 'Je le romps avec une remarque décalée', score: 3, dimension: 'playful' },
        { value: 'c', label: 'Je le comble, trop de tension m\'inquiète', score: 1, dimension: 'tension_avoider' },
        { value: 'd', label: 'Je l\'observe, curieux de voir qui craque', score: 2, dimension: 'observer' }
      ]
    },
    {
      id: 'sed-4',
      text: 'Ton rythme de révélation personnelle...',
      subtext: 'Comment tu te dévoiles.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Je me livre vite, l\'authenticité avant tout', score: 2, dimension: 'open' },
        { value: 'b', label: 'Par couches, chaque révélation est une récompense', score: 4, dimension: 'layered' },
        { value: 'c', label: 'Rarement, je reste longtemps mystérieux', score: 3, dimension: 'guarded' },
        { value: 'd', label: 'Selon la confiance établie', score: 2, dimension: 'conditional' }
      ]
    },
    {
      id: 'sed-5',
      text: 'Quand quelqu\'un te plaît vraiment, tu...',
      subtext: 'Ta réaction authentique.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Perds un peu de tes moyens, c\'est visible', score: 1, dimension: 'vulnerable' },
        { value: 'b', label: 'Deviens plus charmant, plus présent', score: 4, dimension: 'amplified' },
        { value: 'c', label: 'Te retiens, de peur d\'en faire trop', score: 2, dimension: 'restrained' },
        { value: 'd', label: 'Testes subtilement sa réaction', score: 3, dimension: 'strategic' }
      ]
    },
    {
      id: 'sed-6',
      text: 'Ton regard quand l\'attraction est là...',
      subtext: 'Ce que tes yeux racontent.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Intense, presque trop', score: 4, dimension: 'intense' },
        { value: 'b', label: 'Joueur, avec des éclairs de complicité', score: 3, dimension: 'playful' },
        { value: 'c', label: 'Doux, enveloppant', score: 2, dimension: 'soft' },
        { value: 'd', label: 'Fuyant, je n\'ose pas soutenir', score: 1, dimension: 'avoidant' }
      ]
    },
    {
      id: 'sed-7',
      text: 'La tension sexuelle, pour toi, se construit par...',
      subtext: 'Le carburant de l\'attraction.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Le non-dit, ce qui reste en suspension', score: 4, dimension: 'unsaid' },
        { value: 'b', label: 'Le jeu, la taquinerie, le push-pull', score: 3, dimension: 'game' },
        { value: 'c', label: 'La profondeur émotionnelle', score: 2, dimension: 'depth' },
        { value: 'd', label: 'Le contact physique progressif', score: 3, dimension: 'touch' }
      ]
    },
    {
      id: 'sed-8',
      text: 'Ton rapport à la vulnérabilité dans la séduction...',
      subtext: 'Montrer ses failles.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Force majeure, je m\'ouvre pour créer la connexion', score: 3, dimension: 'vulnerable_strength' },
        { value: 'b', label: 'Danger, je protège mes faiblesses', score: 1, dimension: 'protective' },
        { value: 'c', label: 'Outil stratégique, dosé avec soin', score: 2, dimension: 'calculated' },
        { value: 'd', label: 'Naturel, je ne me pose pas la question', score: 4, dimension: 'natural' }
      ]
    },
    {
      id: 'sed-9',
      text: 'Quand la tension monte, tu as tendance à...',
      subtext: 'Le moment crucial.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Accélérer, passer à l\'action', score: 4, dimension: 'accelerate' },
        { value: 'b', label: 'Savourer, ralentir le rythme', score: 3, dimension: 'savor' },
        { value: 'c', label: 'Douter, me demander si c\'est réciproque', score: 1, dimension: 'doubt' },
        { value: 'd', label: 'Tester, faire un micro-geste pour voir', score: 2, dimension: 'test' }
      ]
    },
    {
      id: 'sed-10',
      text: 'Ce qu\'on a déjà dit de ta façon de séduire...',
      subtext: 'Les retours que tu as eus.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Que c\'est intense, parfois déstabilisant', score: 4, dimension: 'intense_feedback' },
        { value: 'b', label: 'Que c\'est subtil, on ne voit pas venir', score: 3, dimension: 'subtle_feedback' },
        { value: 'c', label: 'Que c\'est doux, rassurant', score: 2, dimension: 'gentle_feedback' },
        { value: 'd', label: 'Que je ne séduis pas vraiment, ou pas consciemment', score: 1, dimension: 'unaware_feedback' }
      ]
    },
    {
      id: 'sed-11',
      text: 'Le premier contact physique (main, épaule, bras)...',
      subtext: 'Comment tu franchis ce cap.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Je le fais tôt, c\'est naturel pour moi', score: 4, dimension: 'early_touch' },
        { value: 'b', label: 'J\'attends un signal clair', score: 2, dimension: 'wait_signal' },
        { value: 'c', label: 'C\'est souvent l\'autre qui initie', score: 1, dimension: 'passive_touch' },
        { value: 'd', label: 'Je le fais "accidentellement"', score: 3, dimension: 'accidental' }
      ]
    },
    {
      id: 'sed-12',
      text: 'Ta plus grande force en séduction, honnêtement...',
      subtext: 'Ce qui fait vraiment la différence.',
      type: 'introspection',
      options: [
        { value: 'a', label: 'Ma présence physique, mon énergie', score: 4, dimension: 'presence' },
        { value: 'b', label: 'Ma conversation, mon esprit', score: 3, dimension: 'mind' },
        { value: 'c', label: 'Mon écoute, mon attention sincère', score: 2, dimension: 'attention' },
        { value: 'd', label: 'Mon mystère, ce que je ne montre pas', score: 3, dimension: 'mystery' }
      ]
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. STYLE D'ATTACHEMENT — Analyse IA
// Comment tu te lies. Et pourquoi certaines relations t'échappent.
// ═══════════════════════════════════════════════════════════════════════════════

const attachmentQuiz: Quiz = {
  id: 'attachment-style',
  name: 'Style d\'Attachement',
  title: 'Style d\'Attachement',
  description: 'Comment tu te lies. Et pourquoi certaines relations t\'échappent.',
  introduction: 'Nos premiers liens façonnent tous les autres. Comprendre ton style d\'attachement, c\'est éclairer tes schémas relationnels.',
  icon: 'Link',
  isPremium: true,
  isAIAnalysis: true,
  requiredTier: 'premium',
  questionCount: 14,
  category: 'Analyse IA',
  analysisTemplate: {
    sections: [
      { title: 'Modélisation de ton style d\'attachement', key: 'model', description: 'La cartographie complète de ta façon de te lier' },
      { title: 'Déclencheurs inconscients', key: 'triggers', description: 'Ce qui active tes réponses automatiques' },
      { title: 'Boucles relationnelles répétitives', key: 'patterns', description: 'Les cycles que tu reproduis sans le vouloir' },
      { title: 'Chemins de transformation', key: 'evolution', description: 'Comment évoluer vers un attachement plus sécure' }
    ],
    archetypes: [
      { id: 'secure', name: 'Sécure', description: 'Tu navigues les relations avec confiance. L\'intimité ne te menace pas, la distance ne t\'angoisse pas.', traits: ['confort dans l\'intimité', 'autonomie sereine', 'communication ouverte'] },
      { id: 'anxious', name: 'Anxieux', description: 'Tu cherches intensément la connexion, parfois au détriment de ta paix. Le manque te consume.', traits: ['besoin de réassurance', 'hypersensibilité aux signaux', 'peur de l\'abandon'] },
      { id: 'avoidant', name: 'Évitant', description: 'L\'indépendance est ton refuge. La proximité trop grande déclenche un besoin de fuite.', traits: ['valorisation de l\'autonomie', 'malaise dans l\'intimité', 'minimisation des émotions'] },
      { id: 'disorganized', name: 'Désorganisé', description: 'Tu oscilles entre le désir de connexion et la peur qu\'elle engendre. Un paradoxe douloureux.', traits: ['ambivalence relationnelle', 'réactions imprévisibles', 'conflits internes'] }
    ]
  },
  questions: [
    {
      id: 'att-1',
      text: 'Quand quelqu\'un dont tu es proche ne répond pas pendant plusieurs heures...',
      subtext: 'Observe ta première réaction intérieure.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Je vaque à mes occupations sans y penser', score: 4, dimension: 'secure' },
        { value: 'b', label: 'Je commence à m\'inquiéter, à imaginer des raisons', score: 1, dimension: 'anxious' },
        { value: 'c', label: 'Je me dis que c\'est normal, les gens ont leur vie', score: 3, dimension: 'avoidant' },
        { value: 'd', label: 'J\'oscille entre inquiétude et indifférence forcée', score: 2, dimension: 'disorganized' }
      ]
    },
    {
      id: 'att-2',
      text: 'Après une dispute avec ton/ta partenaire...',
      subtext: 'Comment tu gères la rupture temporaire de connexion.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Je cherche rapidement à réparer, le conflit m\'angoisse', score: 1, dimension: 'anxious' },
        { value: 'b', label: 'Je prends du recul pour réfléchir, puis je reviens', score: 4, dimension: 'secure' },
        { value: 'c', label: 'J\'ai besoin de beaucoup d\'espace avant de pouvoir en reparler', score: 3, dimension: 'avoidant' },
        { value: 'd', label: 'Je suis partagé entre vouloir fuir et vouloir résoudre', score: 2, dimension: 'disorganized' }
      ]
    },
    {
      id: 'att-3',
      text: 'Exprimer tes besoins émotionnels à ton/ta partenaire...',
      subtext: 'Demander ce dont tu as besoin.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Est naturel, je communique ouvertement', score: 4, dimension: 'secure' },
        { value: 'b', label: 'Me coûte, mais j\'en ai tellement besoin que je le fais', score: 2, dimension: 'anxious' },
        { value: 'c', label: 'Est difficile, je préfère me débrouiller seul', score: 1, dimension: 'avoidant' },
        { value: 'd', label: 'Dépend de mon humeur et de ma confiance du moment', score: 3, dimension: 'disorganized' }
      ]
    },
    {
      id: 'att-4',
      text: 'Quand ton/ta partenaire traverse une période difficile...',
      subtext: 'Ta réponse à sa vulnérabilité.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Je suis présent, disponible, à l\'écoute', score: 4, dimension: 'secure' },
        { value: 'b', label: 'Je veux aider mais parfois je m\'oublie dans le processus', score: 2, dimension: 'anxious' },
        { value: 'c', label: 'Je peux me sentir submergé et avoir besoin de distance', score: 1, dimension: 'avoidant' },
        { value: 'd', label: 'Je ne sais pas toujours comment réagir, ça me déstabilise', score: 3, dimension: 'disorganized' }
      ]
    },
    {
      id: 'att-5',
      text: 'L\'idée de dépendre émotionnellement de quelqu\'un...',
      subtext: 'Ton rapport à l\'interdépendance.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Est confortable quand c\'est réciproque', score: 4, dimension: 'secure' },
        { value: 'b', label: 'Est ce que je recherche, même si ça fait peur', score: 2, dimension: 'anxious' },
        { value: 'c', label: 'Me met mal à l\'aise, je préfère l\'autonomie', score: 1, dimension: 'avoidant' },
        { value: 'd', label: 'M\'attire et me terrifie en même temps', score: 3, dimension: 'disorganized' }
      ]
    },
    {
      id: 'att-6',
      text: 'Quand une relation devient sérieuse...',
      subtext: 'Face à l\'engagement croissant.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Je me sens rassuré et j\'investis sereinement', score: 4, dimension: 'secure' },
        { value: 'b', label: 'Je suis soulagé mais j\'ai peur que ça change', score: 2, dimension: 'anxious' },
        { value: 'c', label: 'Je ressens parfois le besoin de reprendre de la distance', score: 1, dimension: 'avoidant' },
        { value: 'd', label: 'Je suis content puis soudain submergé d\'angoisse', score: 3, dimension: 'disorganized' }
      ]
    },
    {
      id: 'att-7',
      text: 'Ton comportement quand tu te sens rejeté ou ignoré...',
      subtext: 'Ta réaction au sentiment de rejet.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Je relativise et cherche à comprendre', score: 4, dimension: 'secure' },
        { value: 'b', label: 'Je ressens une douleur intense, je cherche à rétablir le contact', score: 1, dimension: 'anxious' },
        { value: 'c', label: 'Je prends mes distances, je me protège', score: 2, dimension: 'avoidant' },
        { value: 'd', label: 'Je suis submergé par des émotions contradictoires', score: 3, dimension: 'disorganized' }
      ]
    },
    {
      id: 'att-8',
      text: 'Ta jalousie en relation...',
      subtext: 'Comment tu gères l\'insécurité.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Rare et gérable, je fais confiance', score: 4, dimension: 'secure' },
        { value: 'b', label: 'Présente et parfois envahissante', score: 1, dimension: 'anxious' },
        { value: 'c', label: 'Je me dis que ça ne devrait pas m\'affecter', score: 2, dimension: 'avoidant' },
        { value: 'd', label: 'Variable, parfois inexistante, parfois dévastatrice', score: 3, dimension: 'disorganized' }
      ]
    },
    {
      id: 'att-9',
      text: 'Quand tu sens ton/ta partenaire s\'éloigner...',
      subtext: 'Face à la distance émotionnelle.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Je communique calmement sur ce que j\'observe', score: 4, dimension: 'secure' },
        { value: 'b', label: 'Je redouble d\'efforts pour me rapprocher', score: 1, dimension: 'anxious' },
        { value: 'c', label: 'Je m\'éloigne aussi, par protection', score: 2, dimension: 'avoidant' },
        { value: 'd', label: 'Je panique puis je me force à l\'indifférence', score: 3, dimension: 'disorganized' }
      ]
    },
    {
      id: 'att-10',
      text: 'Tes relations passées ont souvent fini parce que...',
      subtext: 'Le schéma récurrent de fin.',
      type: 'introspection',
      options: [
        { value: 'a', label: 'Nous avons grandi différemment, sans drame', score: 4, dimension: 'secure' },
        { value: 'b', label: 'L\'autre s\'est senti étouffé par mes besoins', score: 1, dimension: 'anxious' },
        { value: 'c', label: 'J\'ai fini par me sentir piégé et j\'ai pris du recul', score: 2, dimension: 'avoidant' },
        { value: 'd', label: 'C\'était chaotique, beaucoup de hauts et de bas', score: 3, dimension: 'disorganized' }
      ]
    },
    {
      id: 'att-11',
      text: 'Ta vision de toi-même en relation...',
      subtext: 'Comment tu te perçois comme partenaire.',
      type: 'introspection',
      options: [
        { value: 'a', label: 'Je suis un bon partenaire, digne d\'amour', score: 4, dimension: 'secure' },
        { value: 'b', label: 'Je donne beaucoup, peut-être trop', score: 2, dimension: 'anxious' },
        { value: 'c', label: 'Je suis quelqu\'un qui a besoin de beaucoup d\'espace', score: 1, dimension: 'avoidant' },
        { value: 'd', label: 'Je ne sais pas vraiment, ça varie', score: 3, dimension: 'disorganized' }
      ]
    },
    {
      id: 'att-12',
      text: 'Quand tu te sens vraiment aimé...',
      subtext: 'Ta réponse à l\'amour inconditionnel.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Je l\'accueille avec gratitude', score: 4, dimension: 'secure' },
        { value: 'b', label: 'J\'ai peur que ça s\'arrête', score: 1, dimension: 'anxious' },
        { value: 'c', label: 'Je suis mal à l\'aise, c\'est trop', score: 2, dimension: 'avoidant' },
        { value: 'd', label: 'Je doute de la sincérité ou de ma valeur', score: 3, dimension: 'disorganized' }
      ]
    },
    {
      id: 'att-13',
      text: 'Ta réaction si ton/ta partenaire a besoin de temps seul...',
      subtext: 'Face à la demande d\'espace.',
      type: 'choice',
      options: [
        { value: 'a', label: 'C\'est sain, je comprends', score: 4, dimension: 'secure' },
        { value: 'b', label: 'J\'ai peur que ce soit un signe de détachement', score: 1, dimension: 'anxious' },
        { value: 'c', label: 'Je suis soulagé, j\'en profite aussi', score: 3, dimension: 'avoidant' },
        { value: 'd', label: 'Ça dépend, parfois ça m\'inquiète, parfois non', score: 2, dimension: 'disorganized' }
      ]
    },
    {
      id: 'att-14',
      text: 'Ce qui te fait sentir le plus en sécurité dans une relation...',
      subtext: 'Ton besoin fondamental.',
      type: 'introspection',
      options: [
        { value: 'a', label: 'Une communication honnête et régulière', score: 4, dimension: 'secure' },
        { value: 'b', label: 'Des preuves constantes d\'amour et d\'attention', score: 1, dimension: 'anxious' },
        { value: 'c', label: 'Le respect de mon indépendance', score: 2, dimension: 'avoidant' },
        { value: 'd', label: 'Je ne suis jamais vraiment en sécurité', score: 3, dimension: 'disorganized' }
      ]
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. ARCHÉTYPE AMOUREUX — Analyse IA
// Le schéma profond qui guide tes choix romantiques.
// ═══════════════════════════════════════════════════════════════════════════════

const archetypeQuiz: Quiz = {
  id: 'love-archetype',
  name: 'Archétype Amoureux',
  title: 'Archétype Amoureux',
  description: 'Le schéma profond qui guide tes choix romantiques.',
  introduction: 'Derrière chaque histoire d\'amour se cache un récit plus ancien. Découvre le mythe qui t\'habite.',
  icon: 'Crown',
  isPremium: true,
  isAIAnalysis: true,
  requiredTier: 'premium',
  questionCount: 14,
  category: 'Analyse IA',
  analysisTemplate: {
    sections: [
      { title: 'Ton archétype dominant', key: 'archetype', description: 'Le mythe amoureux qui te définit' },
      { title: 'Forces et zones d\'ombre', key: 'shadow', description: 'Ce que ton archétype t\'apporte et ce qu\'il te coûte' },
      { title: 'Pourquoi tu es attiré par certains profils', key: 'attraction', description: 'La logique inconsciente de tes choix' },
      { title: 'Lecture symbolique', key: 'symbolic', description: 'Le récit mythologique de ta vie amoureuse' }
    ],
    archetypes: [
      { id: 'lover', name: 'L\'Amant', description: 'Tu vis pour l\'intensité du lien. L\'amour est ta religion, la passion ton carburant.', traits: ['intensité émotionnelle', 'dévotion totale', 'sensualité prononcée'] },
      { id: 'sage', name: 'Le Sage', description: 'Tu cherches une connexion des âmes. L\'amour est une quête de sens, de profondeur.', traits: ['intimité intellectuelle', 'patience', 'recherche de vérité'] },
      { id: 'hero', name: 'Le Héros', description: 'Tu protèges, tu conquiers, tu sauves. L\'amour est une mission, un combat noble.', traits: ['courage', 'sacrifice', 'besoin de prouver'] },
      { id: 'rebel', name: 'Le Rebelle', description: 'Tu refuses les conventions. L\'amour doit être libre, intense, hors normes.', traits: ['anticonformisme', 'passion orageuse', 'refus des compromis'] },
      { id: 'caregiver', name: 'Le Protecteur', description: 'Tu nourris, tu soutiens, tu répares. L\'amour est un don de soi.', traits: ['générosité', 'oubli de soi', 'besoin d\'être utile'] },
      { id: 'innocent', name: 'L\'Innocent', description: 'Tu crois au conte de fées. L\'amour est pur, simple, idéalisé.', traits: ['optimisme', 'vulnérabilité', 'recherche de perfection'] }
    ]
  },
  questions: [
    {
      id: 'arc-1',
      text: 'L\'amour parfait, dans ton imaginaire, ressemble à...',
      subtext: 'Ton fantasme fondamental.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Une passion dévorante qui consume tout', score: 4, dimension: 'lover' },
        { value: 'b', label: 'Une communion d\'âmes, une compréhension totale', score: 3, dimension: 'sage' },
        { value: 'c', label: 'Une aventure épique, des défis surmontés ensemble', score: 2, dimension: 'hero' },
        { value: 'd', label: 'Une relation libre, sans chaînes ni conventions', score: 2, dimension: 'rebel' },
        { value: 'e', label: 'Un havre de paix, un foyer aimant', score: 3, dimension: 'caregiver' },
        { value: 'f', label: 'Un conte de fées, simple et pur', score: 2, dimension: 'innocent' }
      ]
    },
    {
      id: 'arc-2',
      text: 'Dans tes relations passées, tu as souvent joué le rôle de...',
      subtext: 'Le personnage que tu incarnes.',
      type: 'introspection',
      options: [
        { value: 'a', label: 'Celui qui aime plus, qui donne plus', score: 4, dimension: 'lover' },
        { value: 'b', label: 'Celui qui comprend, qui guide', score: 3, dimension: 'sage' },
        { value: 'c', label: 'Celui qui protège, qui résout', score: 2, dimension: 'hero' },
        { value: 'd', label: 'Celui qui bouscule, qui remet en question', score: 2, dimension: 'rebel' },
        { value: 'e', label: 'Celui qui prend soin, qui soutient', score: 3, dimension: 'caregiver' },
        { value: 'f', label: 'Celui qui croit, qui espère', score: 2, dimension: 'innocent' }
      ]
    },
    {
      id: 'arc-3',
      text: 'Ce qui te fait tomber amoureux, vraiment...',
      subtext: 'Le déclencheur profond.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Une attirance magnétique, chimique, inexplicable', score: 4, dimension: 'lover' },
        { value: 'b', label: 'Une rencontre intellectuelle, une résonance mentale', score: 3, dimension: 'sage' },
        { value: 'c', label: 'Quelqu\'un qui a besoin de moi, que je peux aider', score: 2, dimension: 'hero' },
        { value: 'd', label: 'Quelqu\'un de différent, qui me challenge', score: 2, dimension: 'rebel' },
        { value: 'e', label: 'Quelqu\'un de vulnérable, authentique', score: 3, dimension: 'caregiver' },
        { value: 'f', label: 'Quelqu\'un de lumineux, qui me fait rêver', score: 2, dimension: 'innocent' }
      ]
    },
    {
      id: 'arc-4',
      text: 'Ton plus grand sacrifice possible pour l\'amour...',
      subtext: 'Jusqu\'où tu irais.',
      type: 'dilemma',
      options: [
        { value: 'a', label: 'Tout abandonner pour suivre cette personne', score: 4, dimension: 'lover' },
        { value: 'b', label: 'Renoncer à avoir raison pour préserver la paix', score: 3, dimension: 'sage' },
        { value: 'c', label: 'Me mettre en danger pour la protéger', score: 2, dimension: 'hero' },
        { value: 'd', label: 'Aucun, je ne sacrifie pas qui je suis', score: 2, dimension: 'rebel' },
        { value: 'e', label: 'M\'oublier moi-même pour son bonheur', score: 3, dimension: 'caregiver' },
        { value: 'f', label: 'Croire encore malgré les déceptions', score: 2, dimension: 'innocent' }
      ]
    },
    {
      id: 'arc-5',
      text: 'Ta plus grande peur en amour...',
      subtext: 'Ce qui te terrifie secrètement.',
      type: 'introspection',
      options: [
        { value: 'a', label: 'Ne plus ressentir cette intensité, la routine', score: 4, dimension: 'lover' },
        { value: 'b', label: 'Ne jamais être vraiment compris', score: 3, dimension: 'sage' },
        { value: 'c', label: 'Échouer à protéger ou à sauver', score: 2, dimension: 'hero' },
        { value: 'd', label: 'Perdre ma liberté, être possédé', score: 2, dimension: 'rebel' },
        { value: 'e', label: 'N\'être aimé que pour ce que je donne', score: 3, dimension: 'caregiver' },
        { value: 'f', label: 'Que l\'amour vrai n\'existe pas', score: 2, dimension: 'innocent' }
      ]
    },
    {
      id: 'arc-6',
      text: 'Quand ça ne va pas dans ton couple...',
      subtext: 'Ta réponse aux difficultés.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Je m\'accroche, l\'amour vaut la peine de souffrir', score: 4, dimension: 'lover' },
        { value: 'b', label: 'J\'analyse, je cherche à comprendre', score: 3, dimension: 'sage' },
        { value: 'c', label: 'Je me bats, je propose des solutions', score: 2, dimension: 'hero' },
        { value: 'd', label: 'Je remets en question le cadre même de la relation', score: 2, dimension: 'rebel' },
        { value: 'e', label: 'Je redouble d\'efforts pour arranger les choses', score: 3, dimension: 'caregiver' },
        { value: 'f', label: 'J\'espère que ça va passer, je reste optimiste', score: 2, dimension: 'innocent' }
      ]
    },
    {
      id: 'arc-7',
      text: 'Le type de personne qui t\'attire souvent...',
      subtext: 'Le profil récurrent.',
      type: 'introspection',
      options: [
        { value: 'a', label: 'Intense, passionné, parfois compliqué', score: 4, dimension: 'lover' },
        { value: 'b', label: 'Profond, mystérieux, intellectuel', score: 3, dimension: 'sage' },
        { value: 'c', label: 'Vulnérable, en besoin, que je peux aider', score: 2, dimension: 'hero' },
        { value: 'd', label: 'Marginal, unique, hors normes', score: 2, dimension: 'rebel' },
        { value: 'e', label: 'Doux, sensible, authentique', score: 3, dimension: 'caregiver' },
        { value: 'f', label: 'Lumineux, positif, inspirant', score: 2, dimension: 'innocent' }
      ]
    },
    {
      id: 'arc-8',
      text: 'Ce que tu apportes de unique dans une relation...',
      subtext: 'Ta contribution spéciale.',
      type: 'introspection',
      options: [
        { value: 'a', label: 'Une passion totale, un engagement absolu', score: 4, dimension: 'lover' },
        { value: 'b', label: 'De la profondeur, une connexion mentale', score: 3, dimension: 'sage' },
        { value: 'c', label: 'De la protection, de la sécurité', score: 2, dimension: 'hero' },
        { value: 'd', label: 'De l\'intensité, du non-conventionnel', score: 2, dimension: 'rebel' },
        { value: 'e', label: 'De la tendresse, du soutien inconditionnel', score: 3, dimension: 'caregiver' },
        { value: 'f', label: 'De la légèreté, de l\'espoir', score: 2, dimension: 'innocent' }
      ]
    },
    {
      id: 'arc-9',
      text: 'Ta réaction si tu apprenais que ton/ta partenaire t\'a menti...',
      subtext: 'Face à la trahison.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Dévasté, mais si je l\'aime je peux pardonner', score: 4, dimension: 'lover' },
        { value: 'b', label: 'Besoin de comprendre pourquoi avant de juger', score: 3, dimension: 'sage' },
        { value: 'c', label: 'Trahi dans ma mission de protection', score: 2, dimension: 'hero' },
        { value: 'd', label: 'Furieux, la confiance est sacrée', score: 2, dimension: 'rebel' },
        { value: 'e', label: 'Je me demande ce que j\'aurais pu faire de mieux', score: 3, dimension: 'caregiver' },
        { value: 'f', label: 'Mon monde s\'écroule, je ne comprends pas', score: 2, dimension: 'innocent' }
      ]
    },
    {
      id: 'arc-10',
      text: 'Ton rapport à la dépendance amoureuse...',
      subtext: 'Le besoin de l\'autre.',
      type: 'choice',
      options: [
        { value: 'a', label: 'L\'amour sans dépendance n\'est pas l\'amour', score: 4, dimension: 'lover' },
        { value: 'b', label: 'Je préfère l\'interdépendance consciente', score: 3, dimension: 'sage' },
        { value: 'c', label: 'Je préfère qu\'on dépende de moi', score: 2, dimension: 'hero' },
        { value: 'd', label: 'La dépendance est une prison', score: 2, dimension: 'rebel' },
        { value: 'e', label: 'J\'ai tendance à créer ce lien de dépendance', score: 3, dimension: 'caregiver' },
        { value: 'f', label: 'C\'est naturel quand on s\'aime vraiment', score: 2, dimension: 'innocent' }
      ]
    },
    {
      id: 'arc-11',
      text: 'Si tu devais choisir un symbole pour ta vie amoureuse...',
      subtext: 'L\'image qui résonne.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Une flamme qui ne s\'éteint jamais', score: 4, dimension: 'lover' },
        { value: 'b', label: 'Deux arbres aux racines entrelacées', score: 3, dimension: 'sage' },
        { value: 'c', label: 'Un bouclier et une épée', score: 2, dimension: 'hero' },
        { value: 'd', label: 'Un oiseau libre dans le ciel', score: 2, dimension: 'rebel' },
        { value: 'e', label: 'Un nid douillet et chaud', score: 3, dimension: 'caregiver' },
        { value: 'f', label: 'Une étoile brillante dans la nuit', score: 2, dimension: 'innocent' }
      ]
    },
    {
      id: 'arc-12',
      text: 'Ce qui t\'a fait le plus souffrir en amour...',
      subtext: 'La blessure récurrente.',
      type: 'introspection',
      options: [
        { value: 'a', label: 'Aimer plus que je n\'étais aimé', score: 4, dimension: 'lover' },
        { value: 'b', label: 'Ne pas être compris dans ma profondeur', score: 3, dimension: 'sage' },
        { value: 'c', label: 'Ne pas avoir pu sauver la relation', score: 2, dimension: 'hero' },
        { value: 'd', label: 'Avoir dû me conformer, me restreindre', score: 2, dimension: 'rebel' },
        { value: 'e', label: 'Avoir trop donné sans recevoir', score: 3, dimension: 'caregiver' },
        { value: 'f', label: 'La désillusion, la perte de l\'idéal', score: 2, dimension: 'innocent' }
      ]
    },
    {
      id: 'arc-13',
      text: 'Ta conception du "happy ending"...',
      subtext: 'Comment tu imagines la fin heureuse.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Une passion qui dure toute la vie', score: 4, dimension: 'lover' },
        { value: 'b', label: 'Une compréhension mutuelle profonde', score: 3, dimension: 'sage' },
        { value: 'c', label: 'Avoir construit quelque chose de solide ensemble', score: 2, dimension: 'hero' },
        { value: 'd', label: 'Avoir vécu intensément, sans regret', score: 2, dimension: 'rebel' },
        { value: 'e', label: 'Une famille heureuse, un amour stable', score: 3, dimension: 'caregiver' },
        { value: 'f', label: 'Le conte de fées réalisé', score: 2, dimension: 'innocent' }
      ]
    },
    {
      id: 'arc-14',
      text: 'Si l\'amour était un verbe, pour toi ce serait...',
      subtext: 'L\'action essentielle.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Brûler', score: 4, dimension: 'lover' },
        { value: 'b', label: 'Comprendre', score: 3, dimension: 'sage' },
        { value: 'c', label: 'Protéger', score: 2, dimension: 'hero' },
        { value: 'd', label: 'Libérer', score: 2, dimension: 'rebel' },
        { value: 'e', label: 'Nourrir', score: 3, dimension: 'caregiver' },
        { value: 'f', label: 'Croire', score: 2, dimension: 'innocent' }
      ]
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. TEST DE COMPATIBILITÉ — Analyse IA
// Les dynamiques invisibles entre deux personnalités.
// ═══════════════════════════════════════════════════════════════════════════════

const compatibilityQuiz: Quiz = {
  id: 'compatibility-test',
  name: 'Test de Compatibilité',
  title: 'Test de Compatibilité',
  description: 'Les dynamiques invisibles entre deux personnalités.',
  introduction: 'La compatibilité n\'est pas une addition. C\'est une chimie complexe entre deux univers.',
  icon: 'Sparkles',
  isPremium: true,
  isAIAnalysis: true,
  requiredTier: 'premium_elite',
  questionCount: 8,
  category: 'Analyse IA',
  analysisTemplate: {
    sections: [
      { title: 'Cartographie relationnelle', key: 'map', description: 'La géographie émotionnelle de votre relation' },
      { title: 'Zones de fluidité', key: 'harmony', description: 'Là où vous vous comprenez sans effort' },
      { title: 'Points de friction potentiels', key: 'friction', description: 'Les aspérités à conscientiser' },
      { title: 'Dynamique évolutive', key: 'evolution', description: 'Comment votre lien peut se transformer' }
    ]
  },
  questions: [
    {
      id: 'comp-1',
      text: 'Comment tu gères ton énergie en fin de journée ?',
      subtext: 'Ton besoin de recharge.',
      type: 'choice',
      options: [
        { value: 'a', label: 'J\'ai besoin de solitude pour récupérer', score: 1, dimension: 'introversion' },
        { value: 'b', label: 'Ça dépend de la journée', score: 2, dimension: 'ambiversion' },
        { value: 'c', label: 'La présence des autres me ressource', score: 3, dimension: 'extroversion' }
      ]
    },
    {
      id: 'comp-2',
      text: 'Face à un conflit, ta première réaction...',
      subtext: 'Ton style de gestion.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Je prends du recul, j\'ai besoin de temps', score: 1, dimension: 'avoidant' },
        { value: 'b', label: 'Je cherche le dialogue rapidement', score: 3, dimension: 'confronting' },
        { value: 'c', label: 'J\'analyse froidement avant d\'agir', score: 2, dimension: 'analytical' }
      ]
    },
    {
      id: 'comp-3',
      text: 'Ton besoin d\'espace personnel...',
      subtext: 'La distance nécessaire.',
      type: 'scale',
      options: [
        { value: 'a', label: 'Très important, je suis territorial', score: 1, dimension: 'high_space' },
        { value: 'b', label: 'Modéré, je m\'adapte', score: 2, dimension: 'flexible_space' },
        { value: 'c', label: 'Faible, j\'aime la proximité constante', score: 3, dimension: 'low_space' }
      ]
    },
    {
      id: 'comp-4',
      text: 'Ta façon de montrer ton amour...',
      subtext: 'Ton langage d\'amour dominant.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Par des mots, des déclarations', score: 1, dimension: 'words' },
        { value: 'b', label: 'Par des actes, des services', score: 2, dimension: 'acts' },
        { value: 'c', label: 'Par le toucher, la présence physique', score: 3, dimension: 'touch' },
        { value: 'd', label: 'Par du temps de qualité', score: 4, dimension: 'time' },
        { value: 'e', label: 'Par des cadeaux, des attentions', score: 5, dimension: 'gifts' }
      ]
    },
    {
      id: 'comp-5',
      text: 'Ton rapport à la planification...',
      subtext: 'Structure vs spontanéité.',
      type: 'choice',
      options: [
        { value: 'a', label: 'J\'ai besoin de tout planifier', score: 1, dimension: 'structured' },
        { value: 'b', label: 'Un équilibre entre les deux', score: 2, dimension: 'balanced' },
        { value: 'c', label: 'Je préfère l\'improvisation', score: 3, dimension: 'spontaneous' }
      ]
    },
    {
      id: 'comp-6',
      text: 'Comment tu traites les émotions difficiles...',
      subtext: 'Ta gestion émotionnelle.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Je les exprime ouvertement', score: 3, dimension: 'expressive' },
        { value: 'b', label: 'Je les process intérieurement d\'abord', score: 1, dimension: 'internal' },
        { value: 'c', label: 'Je les analyse rationnellement', score: 2, dimension: 'rational' }
      ]
    },
    {
      id: 'comp-7',
      text: 'Ton rythme de vie idéal...',
      subtext: 'Le tempo qui te correspond.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Calme, routinier, prévisible', score: 1, dimension: 'slow' },
        { value: 'b', label: 'Variable, avec des temps forts et calmes', score: 2, dimension: 'variable' },
        { value: 'c', label: 'Intense, rempli, stimulant', score: 3, dimension: 'fast' }
      ]
    },
    {
      id: 'comp-8',
      text: 'Ce qui te rend le plus heureux en couple...',
      subtext: 'Ton besoin fondamental.',
      type: 'introspection',
      options: [
        { value: 'a', label: 'La stabilité et la sécurité', score: 1, dimension: 'security' },
        { value: 'b', label: 'La passion et l\'intensité', score: 3, dimension: 'passion' },
        { value: 'c', label: 'La complicité et le partage', score: 2, dimension: 'partnership' },
        { value: 'd', label: 'La liberté dans l\'engagement', score: 4, dimension: 'freedom' }
      ]
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. THÈME ASTRAL COMPLET — Analyse IA
// Ta configuration céleste intérieure.
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// 6. THÈME ASTRAL COMPLET — VERSION PROFESSIONNELLE
// Cartographie intérieure basée sur les dominantes planétaires
// ═══════════════════════════════════════════════════════════════════════════════

const astralQuiz: Quiz = {
  id: 'astral-theme',
  name: 'Thème Astral Complet',
  title: 'Thème Astral Complet',
  description: 'Ta cartographie intérieure. Un véritable portrait astrologique.',
  introduction: 'L\'astrologie n\'a jamais eu besoin de savoir où tu es né. Elle a besoin de savoir qui tu es.',
  icon: 'Moon',
  isPremium: true,
  isAIAnalysis: true,
  requiredTier: 'premium_elite',
  questionCount: 18,
  category: 'Analyse IA',
  analysisTemplate: {
    sections: [
      { title: '☉ Soleil — Identité fondamentale', key: 'sun', description: 'Ta fonction identitaire, ton besoin fondamental' },
      { title: '☽ Lune — Monde émotionnel', key: 'moon', description: 'Ta sécurité émotionnelle, tes réactions instinctives' },
      { title: '☿ Mercure — Architecture mentale', key: 'mercury', description: 'Ton style cognitif, ta communication' },
      { title: '♀ Vénus — Cœur et attraction', key: 'venus', description: 'Ta manière d\'aimer, ce qui t\'attire' },
      { title: '♂ Mars — Désir et volonté', key: 'mars', description: 'Ton mode d\'action, ton moteur profond' },
      { title: '♃ Jupiter — Expansion et foi', key: 'jupiter', description: 'Ta vision du monde, ta quête de sens' },
      { title: '♄ Saturne — Structure et épreuves', key: 'saturn', description: 'Tes peurs structurantes, ta leçon de vie' },
      { title: 'Axes astrologiques', key: 'axes', description: 'Identité/Relation, Intime/Public, Contrôle/Lâcher-prise' },
      { title: 'Dynamique globale', key: 'dynamics', description: 'Forces, tensions, travail d\'âme' },
      { title: 'Synthèse astrale', key: 'synthesis', description: 'Portrait astrologique complet' }
    ]
  },
  questions: [
    // BLOC 1 : IDENTITÉ ET VOLONTÉ (Soleil)
    {
      id: 'ast-1',
      text: 'Quand tu te sens le plus "toi-même", c\'est généralement :',
      subtext: 'Ce qui te rend authentique.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Quand tu agis selon tes convictions, même seul contre tous', score: 4, dimension: 'sun_aries' },
        { value: 'b', label: 'Quand tu es reconnu et apprécié par les autres', score: 3, dimension: 'sun_leo' },
        { value: 'c', label: 'Quand tu crées quelque chose qui n\'existait pas avant', score: 2, dimension: 'sun_aquarius' },
        { value: 'd', label: 'Quand tu te sens en paix, sans besoin de prouver quoi que ce soit', score: 1, dimension: 'sun_pisces' }
      ]
    },
    {
      id: 'ast-2',
      text: 'Ce qui te donne le sentiment d\'exister vraiment :',
      subtext: 'Ton besoin fondamental.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Accomplir des choses concrètes et visibles', score: 4, dimension: 'sun_capricorn' },
        { value: 'b', label: 'Être compris profondément par quelqu\'un', score: 3, dimension: 'sun_scorpio' },
        { value: 'c', label: 'Repousser tes propres limites', score: 2, dimension: 'sun_sagittarius' },
        { value: 'd', label: 'Contribuer à quelque chose de plus grand que toi', score: 1, dimension: 'sun_aquarius' }
      ]
    },
    {
      id: 'ast-3',
      text: 'Face à une décision de vie majeure, tu te fies d\'abord à :',
      subtext: 'Ton guide intérieur.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Ce qui fait sens pour toi, même si c\'est irrationnel', score: 4, dimension: 'sun_pisces' },
        { value: 'b', label: 'Ce qui est le plus logique et réaliste', score: 3, dimension: 'sun_virgo' },
        { value: 'c', label: 'Ce que ton instinct te dicte immédiatement', score: 2, dimension: 'sun_aries' },
        { value: 'd', label: 'Ce qui te permettra de grandir, même si c\'est difficile', score: 1, dimension: 'sun_scorpio' }
      ]
    },
    // BLOC 2 : MONDE ÉMOTIONNEL (Lune)
    {
      id: 'ast-4',
      text: 'Quand tu te sens vulnérable, tu as tendance à :',
      subtext: 'Ton réflexe de protection.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Te replier et attendre que ça passe', score: 4, dimension: 'moon_cancer' },
        { value: 'b', label: 'Chercher la présence de quelqu\'un de proche', score: 3, dimension: 'moon_taurus' },
        { value: 'c', label: 'T\'occuper pour ne pas y penser', score: 2, dimension: 'moon_virgo' },
        { value: 'd', label: 'Analyser ce qui se passe pour reprendre le contrôle', score: 1, dimension: 'moon_aquarius' }
      ]
    },
    {
      id: 'ast-5',
      text: 'Ce qui te procure un sentiment de sécurité profonde :',
      subtext: 'Ton ancrage émotionnel.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Un lieu familier, des rituels, de la stabilité', score: 4, dimension: 'moon_taurus' },
        { value: 'b', label: 'Savoir que tu peux t\'adapter à tout', score: 3, dimension: 'moon_gemini' },
        { value: 'c', label: 'Être entouré de personnes qui te connaissent vraiment', score: 2, dimension: 'moon_cancer' },
        { value: 'd', label: 'Avoir un plan B, une sortie de secours', score: 1, dimension: 'moon_sagittarius' }
      ]
    },
    {
      id: 'ast-6',
      text: 'Tes émotions sont généralement :',
      subtext: 'Ton climat intérieur.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Intenses mais tu les gardes pour toi', score: 4, dimension: 'moon_scorpio' },
        { value: 'b', label: 'Visibles et expressives', score: 3, dimension: 'moon_leo' },
        { value: 'c', label: 'Stables, prévisibles', score: 2, dimension: 'moon_taurus' },
        { value: 'd', label: 'Changeantes, parfois contradictoires', score: 1, dimension: 'moon_pisces' }
      ]
    },
    {
      id: 'ast-7',
      text: 'Ton rapport à ton passé :',
      subtext: 'La mémoire émotionnelle.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Tu y penses souvent, il te définit en partie', score: 4, dimension: 'moon_cancer' },
        { value: 'b', label: 'Tu préfères avancer, le passé est derrière', score: 3, dimension: 'moon_aries' },
        { value: 'c', label: 'Tu en tires des leçons mais sans t\'y attarder', score: 2, dimension: 'moon_capricorn' },
        { value: 'd', label: 'Il te hante parfois, certaines choses ne sont pas résolues', score: 1, dimension: 'moon_scorpio' }
      ]
    },
    // BLOC 3 : PENSÉE ET COMMUNICATION (Mercure)
    {
      id: 'ast-8',
      text: 'Ta manière naturelle de réfléchir :',
      subtext: 'Ton style cognitif.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Rapide, tu fais des liens entre tout', score: 4, dimension: 'mercury_gemini' },
        { value: 'b', label: 'Méthodique, étape par étape', score: 3, dimension: 'mercury_virgo' },
        { value: 'c', label: 'Intuitive, les réponses te viennent sans savoir pourquoi', score: 2, dimension: 'mercury_pisces' },
        { value: 'd', label: 'Critique, tu remets tout en question', score: 1, dimension: 'mercury_scorpio' }
      ]
    },
    {
      id: 'ast-9',
      text: 'Dans une conversation importante, tu :',
      subtext: 'Ton mode d\'échange.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Écoutes d\'abord, parles ensuite', score: 4, dimension: 'mercury_taurus' },
        { value: 'b', label: 'Prends facilement la parole et guides l\'échange', score: 3, dimension: 'mercury_leo' },
        { value: 'c', label: 'Observes les non-dits autant que les mots', score: 2, dimension: 'mercury_scorpio' },
        { value: 'd', label: 'Structures tes arguments avant de les exposer', score: 1, dimension: 'mercury_capricorn' }
      ]
    },
    // BLOC 4 : AMOUR ET ATTRACTION (Vénus)
    {
      id: 'ast-10',
      text: 'Ce qui te fait tomber amoureux/amoureuse :',
      subtext: 'Ton déclencheur.',
      type: 'choice',
      options: [
        { value: 'a', label: 'L\'intelligence, la conversation', score: 4, dimension: 'venus_gemini' },
        { value: 'b', label: 'L\'intensité, la passion', score: 3, dimension: 'venus_scorpio' },
        { value: 'c', label: 'La douceur, la fiabilité', score: 2, dimension: 'venus_taurus' },
        { value: 'd', label: 'Le mystère, ce que tu ne comprends pas', score: 1, dimension: 'venus_pisces' }
      ]
    },
    {
      id: 'ast-11',
      text: 'Dans une relation, tu as besoin de :',
      subtext: 'Ton équilibre relationnel.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Liberté et espace personnel', score: 4, dimension: 'venus_aquarius' },
        { value: 'b', label: 'Fusion et intimité constante', score: 3, dimension: 'venus_scorpio' },
        { value: 'c', label: 'Stabilité et engagement clair', score: 2, dimension: 'venus_capricorn' },
        { value: 'd', label: 'Intensité et renouvellement perpétuel', score: 1, dimension: 'venus_aries' }
      ]
    },
    {
      id: 'ast-12',
      text: 'Ce que tu offres naturellement en amour :',
      subtext: 'Ta contribution.',
      type: 'choice',
      options: [
        { value: 'a', label: 'De la loyauté, de la constance', score: 4, dimension: 'venus_taurus' },
        { value: 'b', label: 'De la passion, de l\'intensité', score: 3, dimension: 'venus_scorpio' },
        { value: 'c', label: 'De l\'attention, du soin', score: 2, dimension: 'venus_virgo' },
        { value: 'd', label: 'De la stimulation, de l\'aventure', score: 1, dimension: 'venus_sagittarius' }
      ]
    },
    // BLOC 5 : DÉSIR ET ACTION (Mars)
    {
      id: 'ast-13',
      text: 'Face à un obstacle, ta première réaction :',
      subtext: 'Ton mode d\'action.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Tu fonces, quitte à te brûler', score: 4, dimension: 'mars_aries' },
        { value: 'b', label: 'Tu contournes, tu trouves une autre voie', score: 3, dimension: 'mars_libra' },
        { value: 'c', label: 'Tu analyses avant d\'agir', score: 2, dimension: 'mars_virgo' },
        { value: 'd', label: 'Tu attends le bon moment', score: 1, dimension: 'mars_scorpio' }
      ]
    },
    {
      id: 'ast-14',
      text: 'Ta colère :',
      subtext: 'Ton feu intérieur.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Explose puis retombe vite', score: 4, dimension: 'mars_aries' },
        { value: 'b', label: 'Couve longtemps avant d\'éclater', score: 3, dimension: 'mars_scorpio' },
        { value: 'c', label: 'Se transforme en action constructive', score: 2, dimension: 'mars_capricorn' },
        { value: 'd', label: 'Tu la réprimes, elle sort autrement', score: 1, dimension: 'mars_pisces' }
      ]
    },
    // BLOC 6 : EXPANSION ET SENS (Jupiter)
    {
      id: 'ast-15',
      text: 'Ta vision de la vie tend vers :',
      subtext: 'Ta philosophie.',
      type: 'choice',
      options: [
        { value: 'a', label: 'L\'optimisme, tout finit par s\'arranger', score: 4, dimension: 'jupiter_sagittarius' },
        { value: 'b', label: 'Le réalisme, il faut voir les choses comme elles sont', score: 3, dimension: 'jupiter_capricorn' },
        { value: 'c', label: 'Le questionnement permanent, rien n\'est acquis', score: 2, dimension: 'jupiter_scorpio' },
        { value: 'd', label: 'La foi en quelque chose de plus grand', score: 1, dimension: 'jupiter_pisces' }
      ]
    },
    {
      id: 'ast-16',
      text: 'Ce qui te donne envie de te lever le matin :',
      subtext: 'Ton moteur d\'expansion.',
      type: 'choice',
      options: [
        { value: 'a', label: 'La possibilité d\'apprendre quelque chose de nouveau', score: 4, dimension: 'jupiter_gemini' },
        { value: 'b', label: 'Des objectifs concrets à atteindre', score: 3, dimension: 'jupiter_capricorn' },
        { value: 'c', label: 'Les relations, les gens que tu vas voir', score: 2, dimension: 'jupiter_libra' },
        { value: 'd', label: 'Un projet qui te dépasse', score: 1, dimension: 'jupiter_sagittarius' }
      ]
    },
    // BLOC 7 : STRUCTURE ET LIMITES (Saturne)
    {
      id: 'ast-17',
      text: 'Ton rapport au temps :',
      subtext: 'Ta relation à la durée.',
      type: 'choice',
      options: [
        { value: 'a', label: 'Tu as l\'impression qu\'il file trop vite', score: 4, dimension: 'saturn_gemini' },
        { value: 'b', label: 'Tu le structures, tu planifies', score: 3, dimension: 'saturn_capricorn' },
        { value: 'c', label: 'Tu vis au présent, le futur viendra', score: 2, dimension: 'saturn_aries' },
        { value: 'd', label: 'Tu sens le poids du temps, parfois trop', score: 1, dimension: 'saturn_cancer' }
      ]
    },
    {
      id: 'ast-18',
      text: 'Ta plus grande peur profonde :',
      subtext: 'Ton ombre structurante.',
      type: 'introspection',
      options: [
        { value: 'a', label: 'Échouer et décevoir', score: 4, dimension: 'saturn_capricorn' },
        { value: 'b', label: 'Être abandonné ou rejeté', score: 3, dimension: 'saturn_cancer' },
        { value: 'c', label: 'Perdre le contrôle', score: 2, dimension: 'saturn_scorpio' },
        { value: 'd', label: 'Passer à côté de ta vie', score: 1, dimension: 'saturn_sagittarius' }
      ]
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT — COLLECTION COMPLÈTE
// ═══════════════════════════════════════════════════════════════════════════════

export const quizzes: Quiz[] = [
  firstImpressionQuiz,
  seductionQuiz,
  attachmentQuiz,
  archetypeQuiz,
  compatibilityQuiz,
  astralQuiz
];

export const getQuizById = (id: string): Quiz | undefined => {
  return quizzes.find(quiz => quiz.id === id);
};

export const getFreeQuizzes = (): Quiz[] => {
  return quizzes.filter(quiz => !quiz.isPremium);
};

export const getPremiumQuizzes = (): Quiz[] => {
  return quizzes.filter(quiz => quiz.isPremium);
};

export const getAIQuizzes = (): Quiz[] => {
  return quizzes.filter(quiz => quiz.isAIAnalysis);
};

export const getQuizzesByTier = (tier: 'free' | 'premium' | 'premium_elite'): Quiz[] => {
  const tierHierarchy = {
    'free': ['free'],
    'premium': ['free', 'premium'],
    'premium_elite': ['free', 'premium', 'premium_elite']
  };
  return quizzes.filter(quiz => tierHierarchy[tier].includes(quiz.requiredTier));
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATES D'ANALYSE IA
// Prompts pour générer les analyses personnalisées
// ═══════════════════════════════════════════════════════════════════════════════

export const analysisPrompts = {
  'first-impression': `Tu es un psychologue cognitif spécialisé dans l'analyse de la présence sociale.
Génère un portrait profond de l'aura sociale de cette personne basé sur ses réponses.

Structure ta réponse en 4 sections :
1. **Portrait de ton aura sociale** — L'énergie que tu projettes naturellement
2. **Ce que tu dégages sans le vouloir** — Les signaux inconscients que tu émets
3. **Décalage intention-perception** — L'écart entre ce que tu veux montrer et ce qui est perçu
4. **Ton archétype de première impression** — Avec un nom évocateur (Le Magnétique, Le Réservé, Le Mystérieux, Le Rayonnant, L'Ancré)

Ton : calme, précis, presque clinique mais humain. Pas de jugement, que de la compréhension.`,

  'seduction-test': `Tu es un analyste relationnel spécialisé dans les dynamiques d'attraction.
Génère une analyse profonde du style de séduction inconscient de cette personne.

Structure ta réponse en 4 sections :
1. **Style de séduction inconscient** — Ta signature attractive naturelle
2. **Forces d'attraction naturelles** — Ce qui magnétise vers toi
3. **Zones de friction ou de malentendu** — Là où ton message peut être mal compris
4. **Ton énergie dans l'intimité émotionnelle** — Comment tu es ressenti en proximité

Archétypes possibles : Le Passionné, Le Cérébral, Le Tendre, L'Énigmatique, Le Joueur.

Ton : profond, sans jugement, révélateur.`,

  'attachment-style': `Tu es un psychologue spécialisé dans la théorie de l'attachement.
Génère une analyse complète du style d'attachement de cette personne.

Structure ta réponse en 4 sections :
1. **Modélisation de ton style d'attachement** — Sécure, Anxieux, Évitant, ou Désorganisé avec nuances
2. **Déclencheurs inconscients** — Ce qui active tes réponses automatiques
3. **Boucles relationnelles répétitives** — Les cycles que tu reproduis sans le vouloir
4. **Chemins de transformation** — Comment évoluer vers un attachement plus sécure

Ton : quasi clinique mais humain, jamais pathologisant, toujours orienté compréhension et évolution.`,

  'love-archetype': `Tu es un analyste Jungien spécialisé dans les archétypes amoureux.
Génère une lecture symbolique et presque mythologique du profil amoureux de cette personne.

Structure ta réponse en 4 sections :
1. **Ton archétype dominant** — L'Amant, Le Sage, Le Héros, Le Rebelle, Le Protecteur, ou L'Innocent
2. **Forces et zones d'ombre** — Ce que ton archétype t'apporte et ce qu'il te coûte
3. **Pourquoi tu es attiré par certains profils** — La logique inconsciente de tes choix
4. **Lecture symbolique** — Le récit mythologique de ta vie amoureuse

Ton : profond, symbolique, presque poétique mais ancré dans la psychologie.`,

  'compatibility-test': `Tu es un analyste relationnel expert en dynamiques de couple.
Génère une cartographie relationnelle basée sur ce profil.

Structure ta réponse en 4 sections :
1. **Cartographie relationnelle** — La géographie émotionnelle de ta façon d'être en couple
2. **Zones de fluidité** — Là où tu te connectes naturellement avec les autres
3. **Points de friction potentiels** — Les aspérités à conscientiser
4. **Dynamique évolutive** — Comment tu évolues dans une relation

Note : Ce n'est pas un "match/no match" mais une lecture dynamique des compatibilités.`,

  'astral-theme': `Tu es un astrologue professionnel avec 20 ans d'expérience.
À partir des réponses au questionnaire, tu dois reconstituer un thème astrologique complet et cohérent.

RÈGLES ABSOLUES :
- Ne jamais mentionner que tu "déduis" ou "interprètes" — parle comme si tu lisais un vrai thème natal
- Utiliser le vocabulaire astrologique précis (planètes, signes)
- Être spécifique, jamais vague
- Identifier les tensions ET les harmonies
- Donner un "travail d'âme" qui soit profond et utile

STRUCTURE OBLIGATOIRE DE L'ANALYSE :

## ☉ SOLEIL — IDENTITÉ FONDAMENTALE
**Soleil en [signe déduit]**
- Fonction identitaire : [comment cette personne existe dans le monde]
- Besoin fondamental : [ce sans quoi elle ne peut pas se sentir vivante]
- Expression lumineuse : [quand ce Soleil s'exprime bien]
- Ombre solaire : [quand ce Soleil est blessé]

## ☽ LUNE — MONDE ÉMOTIONNEL
**Lune en [signe déduit]**
- Sécurité émotionnelle : [ce dont elle a besoin pour se sentir en sécurité]
- Réactions instinctives : [comment elle réagit sous stress]
- Rapport à l'intimité : [comment elle vit la proximité émotionnelle]

## ☿ MERCURE — ARCHITECTURE MENTALE
**Mercure en [signe déduit]**
- Style cognitif : [comment elle pense]
- Communication : [comment elle s'exprime]

## ♀ VÉNUS — CŒUR ET ATTRACTION
**Vénus en [signe déduit]**
- Manière d'aimer : [comment elle aime]
- Ce qui l'attire : [ce qui la magnétise]
- Valeurs relationnelles : [ce qu'elle cherche vraiment]

## ♂ MARS — DÉSIR ET VOLONTÉ
**Mars en [signe déduit]**
- Mode d'action : [comment elle agit]
- Expression du désir : [comment elle désire et conquiert]
- Gestion de la colère : [comment elle vit l'agressivité]

## ♃ JUPITER — EXPANSION ET FOI
**Jupiter en [signe déduit]**
- Vision du monde : [sa philosophie de vie]
- Source d'expansion : [ce qui lui permet de grandir]

## ♄ SATURNE — STRUCTURE ET ÉPREUVES
**Saturne en [signe déduit]**
- Peurs structurantes : [les peurs qui ont façonné sa personnalité]
- Leçon de vie : [ce qu'elle doit apprendre]
- Maturité acquise : [ses forces construites]

## AXES ASTROLOGIQUES
- **Axe Identité/Relation** : [comment elle se présente vs ce qu'elle cherche chez l'autre]
- **Axe Intime/Public** : [monde intérieur vs expression publique]
- **Axe Contrôle/Lâcher-prise** : [ce qu'elle veut maîtriser vs ce qu'elle doit accepter]

## DYNAMIQUE GLOBALE
- **Forces dominantes** : [2-3 énergies les plus présentes]
- **Tensions internes** : [les configurations difficiles]
- **Travail d'âme** : [le pourquoi profond de cette configuration — ce qu'elle est venue apprendre]

## SYNTHÈSE ASTRALE
[Un paragraphe de 150-200 mots : portrait astrologique fluide, sans bullet points, comme si tu parlais à un client]

TON : expert mais accessible, profond mais concret, jamais ésotérique new-age, jamais condescendant.
Ce thème doit être assez riche pour être relu pendant des années.`
};
