export interface QuizQuestion {
  id: string;
  text: string;
  options: {
    value: string;
    label: string;
    score?: number;
  }[];
}

export interface Quiz {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  isPremium: boolean;
  requiredTier: 'free' | 'premium' | 'premium_elite';
  duration: string;
  questionCount: number;
  questions: QuizQuestion[];
  category: string;
}

export const quizzes: Quiz[] = [
  {
    id: 'first-impression',
    name: 'Première Impression',
    title: 'Test de Première Impression',
    description: 'Découvrez l\'image que vous projetez lors des premières rencontres',
    icon: 'Eye',
    isPremium: false,
    requiredTier: 'free',
    duration: '5 min',
    questionCount: 10,
    category: 'Personnalité',
    questions: [
      {
        id: 'q1',
        text: 'Lors d\'une soirée, vous avez tendance à :',
        options: [
          { value: 'a', label: 'Rester dans votre coin et observer', score: 1 },
          { value: 'b', label: 'Discuter avec quelques personnes que vous connaissez', score: 2 },
          { value: 'c', label: 'Aller vers de nouvelles personnes spontanément', score: 3 },
          { value: 'd', label: 'Être au centre de l\'attention', score: 4 }
        ]
      },
      {
        id: 'q2',
        text: 'Quand quelqu\'un vous complimente, vous :',
        options: [
          { value: 'a', label: 'Vous sentez mal à l\'aise et minimisez', score: 1 },
          { value: 'b', label: 'Remerciez poliment', score: 2 },
          { value: 'c', label: 'Appréciez et retournez le compliment', score: 3 },
          { value: 'd', label: 'L\'acceptez naturellement comme un fait', score: 4 }
        ]
      },
      {
        id: 'q3',
        text: 'Votre style vestimentaire est plutôt :',
        options: [
          { value: 'a', label: 'Simple et discret, je préfère passer inaperçu', score: 1 },
          { value: 'b', label: 'Classique et soigné', score: 2 },
          { value: 'c', label: 'Original avec ma touche personnelle', score: 3 },
          { value: 'd', label: 'Audacieux et qui se remarque', score: 4 }
        ]
      },
      {
        id: 'q4',
        text: 'Dans une conversation de groupe, vous :',
        options: [
          { value: 'a', label: 'Écoutez plus que vous ne parlez', score: 1 },
          { value: 'b', label: 'Participez quand le sujet vous intéresse', score: 2 },
          { value: 'c', label: 'Posez beaucoup de questions aux autres', score: 3 },
          { value: 'd', label: 'Racontez souvent des anecdotes', score: 4 }
        ]
      },
      {
        id: 'q5',
        text: 'Votre langage corporel est généralement :',
        options: [
          { value: 'a', label: 'Fermé (bras croisés, peu de gestes)', score: 1 },
          { value: 'b', label: 'Neutre et professionnel', score: 2 },
          { value: 'c', label: 'Ouvert et accueillant', score: 3 },
          { value: 'd', label: 'Expressif et théâtral', score: 4 }
        ]
      },
      {
        id: 'q6',
        text: 'Quand vous rencontrez quelqu\'un pour la première fois :',
        options: [
          { value: 'a', label: 'Vous attendez qu\'on vienne vers vous', score: 1 },
          { value: 'b', label: 'Vous saluez poliment', score: 2 },
          { value: 'c', label: 'Vous initiez la conversation', score: 3 },
          { value: 'd', label: 'Vous créez immédiatement une connexion mémorable', score: 4 }
        ]
      },
      {
        id: 'q7',
        text: 'Votre niveau d\'énergie sociale est :',
        options: [
          { value: 'a', label: 'Bas, je me fatigue vite en société', score: 1 },
          { value: 'b', label: 'Modéré, j\'ai besoin de pauses', score: 2 },
          { value: 'c', label: 'Élevé, j\'aime les interactions', score: 3 },
          { value: 'd', label: 'Très élevé, je me nourris du contact social', score: 4 }
        ]
      },
      {
        id: 'q8',
        text: 'Votre sourire est :',
        options: [
          { value: 'a', label: 'Rare et réservé', score: 1 },
          { value: 'b', label: 'Poli et convenable', score: 2 },
          { value: 'c', label: 'Fréquent et chaleureux', score: 3 },
          { value: 'd', label: 'Constant et contagieux', score: 4 }
        ]
      },
      {
        id: 'q9',
        text: 'Votre humour est plutôt :',
        options: [
          { value: 'a', label: 'Je ne plaisante pas souvent', score: 1 },
          { value: 'b', label: 'Subtil et intelligent', score: 2 },
          { value: 'c', label: 'Léger et accessible', score: 3 },
          { value: 'd', label: 'Spontané et parfois provocant', score: 4 }
        ]
      },
      {
        id: 'q10',
        text: 'Les gens diraient de vous que vous êtes :',
        options: [
          { value: 'a', label: 'Mystérieux et difficile à cerner', score: 1 },
          { value: 'b', label: 'Fiable et sérieux', score: 2 },
          { value: 'c', label: 'Sympathique et facile d\'approche', score: 3 },
          { value: 'd', label: 'Charismatique et inoubliable', score: 4 }
        ]
      }
    ]
  },
  {
    id: 'attachment-style',
    name: 'Style d\'Attachement',
    title: 'Test de Style d\'Attachement',
    description: 'Identifiez votre style d\'attachement en relation amoureuse',
    icon: 'Heart',
    isPremium: true,
    requiredTier: 'premium',
    duration: '8 min',
    questionCount: 12,
    category: 'Relations',
    questions: [
      {
        id: 'q1',
        text: 'Quand vous commencez une relation, vous avez tendance à :',
        options: [
          { value: 'a', label: 'Garder vos distances émotionnellement', score: 1 },
          { value: 'b', label: 'Vous inquiéter de l\'engagement de l\'autre', score: 2 },
          { value: 'c', label: 'Vous engager pleinement et sereinement', score: 3 },
          { value: 'd', label: 'Alterner entre proximité et distance', score: 4 }
        ]
      },
      {
        id: 'q2',
        text: 'Face à un conflit dans votre couple, vous :',
        options: [
          { value: 'a', label: 'Prenez du recul et évitez la confrontation', score: 1 },
          { value: 'b', label: 'Vous sentez menacé et réagissez émotionnellement', score: 2 },
          { value: 'c', label: 'Cherchez à communiquer calmement', score: 3 },
          { value: 'd', label: 'Oscillez entre retrait et réaction intense', score: 4 }
        ]
      },
      {
        id: 'q3',
        text: 'Votre partenaire ne répond pas à vos messages pendant plusieurs heures :',
        options: [
          { value: 'a', label: 'Ça ne vous dérange pas, vous êtes occupé aussi', score: 1 },
          { value: 'b', label: 'Vous commencez à vous inquiéter et imaginer des scénarios', score: 2 },
          { value: 'c', label: 'Vous patientez sans stress particulier', score: 3 },
          { value: 'd', label: 'Vous alternez entre indifférence et anxiété', score: 4 }
        ]
      },
      {
        id: 'q4',
        text: 'Exprimer vos sentiments profonds, c\'est :',
        options: [
          { value: 'a', label: 'Difficile, vous préférez garder ça pour vous', score: 1 },
          { value: 'b', label: 'Naturel, vous avez besoin de le faire souvent', score: 2 },
          { value: 'c', label: 'Facile quand c\'est le bon moment', score: 3 },
          { value: 'd', label: 'Impossible parfois, intense à d\'autres moments', score: 4 }
        ]
      },
      {
        id: 'q5',
        text: 'Votre besoin d\'indépendance dans une relation :',
        options: [
          { value: 'a', label: 'Est très important, vous avez besoin de beaucoup d\'espace', score: 1 },
          { value: 'b', label: 'Vous préférez la proximité à l\'indépendance', score: 2 },
          { value: 'c', label: 'Est équilibré avec votre besoin d\'intimité', score: 3 },
          { value: 'd', label: 'Varie selon les périodes', score: 4 }
        ]
      },
      {
        id: 'q6',
        text: 'Quand votre partenaire a besoin d\'espace :',
        options: [
          { value: 'a', label: 'Vous en profitez aussi, ça vous arrange', score: 1 },
          { value: 'b', label: 'Vous vous sentez rejeté et inquiet', score: 2 },
          { value: 'c', label: 'Vous respectez son besoin sans problème', score: 3 },
          { value: 'd', label: 'Ça dépend de votre humeur du moment', score: 4 }
        ]
      },
      {
        id: 'q7',
        text: 'Votre vision de l\'intimité émotionnelle :',
        options: [
          { value: 'a', label: 'Vous met mal à l\'aise, c\'est trop intense', score: 1 },
          { value: 'b', label: 'C\'est ce que vous recherchez avant tout', score: 2 },
          { value: 'c', label: 'C\'est important et vous savez comment la créer', score: 3 },
          { value: 'd', label: 'Vous attirent et vous effraient en même temps', score: 4 }
        ]
      },
      {
        id: 'q8',
        text: 'Dans vos relations passées, vous aviez tendance à :',
        options: [
          { value: 'a', label: 'Finir par vous sentir étouffé et partir', score: 1 },
          { value: 'b', label: 'Vous accrocher même quand ça n\'allait pas', score: 2 },
          { value: 'c', label: 'Savoir quand continuer ou partir', score: 3 },
          { value: 'd', label: 'Être imprévisible dans vos réactions', score: 4 }
        ]
      },
      {
        id: 'q9',
        text: 'La confiance dans une relation :',
        options: [
          { value: 'a', label: 'Est difficile, vous restez sur vos gardes', score: 1 },
          { value: 'b', label: 'Vient vite, parfois trop', score: 2 },
          { value: 'c', label: 'Se construit progressivement et sainement', score: 3 },
          { value: 'd', label: 'Est instable, vous doutez souvent', score: 4 }
        ]
      },
      {
        id: 'q10',
        text: 'Votre image de l\'amour idéal :',
        options: [
          { value: 'a', label: 'Deux personnes indépendantes qui se choisissent', score: 1 },
          { value: 'b', label: 'Une fusion totale avec l\'être aimé', score: 2 },
          { value: 'c', label: 'Un équilibre entre autonomie et connexion', score: 3 },
          { value: 'd', label: 'Change selon vos expériences', score: 4 }
        ]
      },
      {
        id: 'q11',
        text: 'Quand vous pensez à vos relations passées :',
        options: [
          { value: 'a', label: 'Vous réalisez que vous partiez dès que ça devenait sérieux', score: 1 },
          { value: 'b', label: 'Vous vous demandiez toujours si on vous aimait vraiment', score: 2 },
          { value: 'c', label: 'Vous avez appris et grandi à travers elles', score: 3 },
          { value: 'd', label: 'C\'était souvent chaotique et intense', score: 4 }
        ]
      },
      {
        id: 'q12',
        text: 'Votre réaction face à l\'engagement à long terme :',
        options: [
          { value: 'a', label: 'Vous fait peur et vous pousse à fuir', score: 1 },
          { value: 'b', label: 'C\'est ce que vous cherchez activement', score: 2 },
          { value: 'c', label: 'Vous y êtes prêt avec la bonne personne', score: 3 },
          { value: 'd', label: 'Dépend complètement de la période', score: 4 }
        ]
      }
    ]
  },
  {
    id: 'love-archetype',
    name: 'Archétype Amoureux',
    title: 'Quel est votre Archétype Amoureux ?',
    description: 'Découvrez le profil amoureux qui vous définit le mieux',
    icon: 'Sparkles',
    isPremium: true,
    requiredTier: 'premium',
    duration: '10 min',
    questionCount: 15,
    category: 'Personnalité',
    questions: [
      {
        id: 'q1',
        text: 'Dans l\'amour, ce qui vous motive le plus c\'est :',
        options: [
          { value: 'a', label: 'La passion et l\'intensité', score: 1 },
          { value: 'b', label: 'La sécurité et la stabilité', score: 2 },
          { value: 'c', label: 'L\'aventure et la découverte', score: 3 },
          { value: 'd', label: 'La connexion émotionnelle profonde', score: 4 }
        ]
      },
      {
        id: 'q2',
        text: 'Votre date idéale serait :',
        options: [
          { value: 'a', label: 'Un dîner aux chandelles suivi d\'une nuit passionnée', score: 1 },
          { value: 'b', label: 'Une soirée cocooning à la maison', score: 2 },
          { value: 'c', label: 'Une activité excitante comme du parapente', score: 3 },
          { value: 'd', label: 'Une longue promenade avec des conversations profondes', score: 4 }
        ]
      },
      {
        id: 'q3',
        text: 'Vous tombez amoureux :',
        options: [
          { value: 'a', label: 'Vite et intensément', score: 1 },
          { value: 'b', label: 'Progressivement après avoir établi la confiance', score: 2 },
          { value: 'c', label: 'Facilement et avec plusieurs personnes', score: 3 },
          { value: 'd', label: 'Rarement mais profondément', score: 4 }
        ]
      },
      {
        id: 'q4',
        text: 'En amour, votre plus grande peur est :',
        options: [
          { value: 'a', label: 'Que la flamme s\'éteigne', score: 1 },
          { value: 'b', label: 'D\'être abandonné', score: 2 },
          { value: 'c', label: 'De s\'ennuyer', score: 3 },
          { value: 'd', label: 'De ne pas être compris', score: 4 }
        ]
      },
      {
        id: 'q5',
        text: 'Votre cadeau d\'anniversaire idéal :',
        options: [
          { value: 'a', label: 'Lingerie sexy ou escapade romantique', score: 1 },
          { value: 'b', label: 'Quelque chose de pratique et utile', score: 2 },
          { value: 'c', label: 'Une expérience inédite', score: 3 },
          { value: 'd', label: 'Quelque chose de personnalisé avec un sens profond', score: 4 }
        ]
      },
      {
        id: 'q6',
        text: 'Votre film romantique préféré serait :',
        options: [
          { value: 'a', label: 'Un film passionné avec beaucoup de tension sexuelle', score: 1 },
          { value: 'b', label: 'Une histoire d\'amour qui dure toute une vie', score: 2 },
          { value: 'c', label: 'Une comédie romantique légère et amusante', score: 3 },
          { value: 'd', label: 'Un drame romantique intense et émotionnel', score: 4 }
        ]
      },
      {
        id: 'q7',
        text: 'Dans une relation, vous avez besoin :',
        options: [
          { value: 'a', label: 'De désir et d\'attraction constante', score: 1 },
          { value: 'b', label: 'De routine et de prévisibilité', score: 2 },
          { value: 'c', label: 'De liberté et d\'indépendance', score: 3 },
          { value: 'd', label: 'De communication et de compréhension mutuelle', score: 4 }
        ]
      },
      {
        id: 'q8',
        text: 'Votre idée de l\'engagement :',
        options: [
          { value: 'a', label: 'C\'est intense ou rien', score: 1 },
          { value: 'b', label: 'C\'est la base de toute relation sérieuse', score: 2 },
          { value: 'c', label: 'C\'est flexible et non-conventionnel', score: 3 },
          { value: 'd', label: 'C\'est une connexion d\'âme à âme', score: 4 }
        ]
      },
      {
        id: 'q9',
        text: 'Vous exprimez votre amour principalement par :',
        options: [
          { value: 'a', label: 'Le contact physique et l\'intimité', score: 1 },
          { value: 'b', label: 'Les actes de service et l\'attention', score: 2 },
          { value: 'c', label: 'Les cadeaux et les surprises', score: 3 },
          { value: 'd', label: 'Les mots et les conversations profondes', score: 4 }
        ]
      },
      {
        id: 'q10',
        text: 'Votre vision du couple idéal :',
        options: [
          { value: 'a', label: 'Deux amants passionnés', score: 1 },
          { value: 'b', label: 'Une équipe solide et unie', score: 2 },
          { value: 'c', label: 'Deux aventuriers complices', score: 3 },
          { value: 'd', label: 'Deux âmes sœurs connectées', score: 4 }
        ]
      },
      {
        id: 'q11',
        text: 'La jalousie dans votre relation :',
        options: [
          { value: 'a', label: 'Est preuve de passion', score: 1 },
          { value: 'b', label: 'Est naturelle et protectrice', score: 2 },
          { value: 'c', label: 'Est absente, vous faites confiance', score: 3 },
          { value: 'd', label: 'Est destructrice, vous la travaillez', score: 4 }
        ]
      },
      {
        id: 'q12',
        text: 'Après une dispute, vous :',
        options: [
          { value: 'a', label: 'Vous réconcilez avec passion', score: 1 },
          { value: 'b', label: 'Avez besoin de réassurance', score: 2 },
          { value: 'c', label: 'Passez rapidement à autre chose', score: 3 },
          { value: 'd', label: 'Devez comprendre la racine du problème', score: 4 }
        ]
      },
      {
        id: 'q13',
        text: 'Votre définition de la romance :',
        options: [
          { value: 'a', label: 'Des gestes spontanés et sensuels', score: 1 },
          { value: 'b', label: 'Des petites attentions quotidiennes', score: 2 },
          { value: 'c', label: 'Des aventures partagées', score: 3 },
          { value: 'd', label: 'Une compréhension mutuelle profonde', score: 4 }
        ]
      },
      {
        id: 'q14',
        text: 'Dans 10 ans avec votre partenaire, vous vous voyez :',
        options: [
          { value: 'a', label: 'Toujours aussi passionnés qu\'au premier jour', score: 1 },
          { value: 'b', label: 'Construire une famille stable', score: 2 },
          { value: 'c', label: 'Avoir exploré le monde ensemble', score: 3 },
          { value: 'd', label: 'Avoir évolué ensemble spirituellement', score: 4 }
        ]
      },
      {
        id: 'q15',
        text: 'Ce qui vous fait rester dans une relation :',
        options: [
          { value: 'a', label: 'Le désir et l\'alchimie', score: 1 },
          { value: 'b', label: 'La sécurité et le confort', score: 2 },
          { value: 'c', label: 'Le fun et la complicité', score: 3 },
          { value: 'd', label: 'La croissance personnelle mutuelle', score: 4 }
        ]
      }
    ]
  },
  {
    id: 'compatibility-test',
    name: 'Test de Compatibilité',
    title: 'Test de Compatibilité Amoureuse',
    description: 'Évaluez votre compatibilité avec votre partenaire actuel ou idéal',
    icon: 'Users',
    isPremium: true,
    requiredTier: 'premium_elite',
    duration: '15 min',
    questionCount: 20,
    category: 'Compatibilité',
    questions: [
      {
        id: 'q1',
        text: 'Votre vision d\'un weekend idéal :',
        options: [
          { value: 'a', label: 'Sortir et socialiser', score: 1 },
          { value: 'b', label: 'Rester à la maison au calme', score: 2 },
          { value: 'c', label: 'Activités sportives ou aventures', score: 3 },
          { value: 'd', label: 'Projets créatifs ou culturels', score: 4 }
        ]
      },
      {
        id: 'q2',
        text: 'Votre rapport à l\'argent :',
        options: [
          { value: 'a', label: 'Dépensier, je profite du moment présent', score: 1 },
          { value: 'b', label: 'Économe, je planifie pour l\'avenir', score: 2 },
          { value: 'c', label: 'Équilibré entre plaisir et épargne', score: 3 },
          { value: 'd', label: 'Investisseur, je fais fructifier', score: 4 }
        ]
      },
      {
        id: 'q3',
        text: 'Votre position sur avoir des enfants :',
        options: [
          { value: 'a', label: 'Oui, j\'en veux plusieurs', score: 1 },
          { value: 'b', label: 'Peut-être un ou deux', score: 2 },
          { value: 'c', label: 'Je ne suis pas sûr', score: 3 },
          { value: 'd', label: 'Non, je ne veux pas d\'enfants', score: 4 }
        ]
      },
      {
        id: 'q4',
        text: 'Votre niveau d\'organisation :',
        options: [
          { value: 'a', label: 'Très organisé, j\'aime la structure', score: 1 },
          { value: 'b', label: 'Plutôt organisé dans l\'ensemble', score: 2 },
          { value: 'c', label: 'Un peu désordonné mais je m\'y retrouve', score: 3 },
          { value: 'd', label: 'Chaotique, je suis spontané', score: 4 }
        ]
      },
      {
        id: 'q5',
        text: 'Votre approche des conflits :',
        options: [
          { value: 'a', label: 'Je confronte directement', score: 1 },
          { value: 'b', label: 'J\'évite et laisse passer', score: 2 },
          { value: 'c', label: 'Je cherche un compromis', score: 3 },
          { value: 'd', label: 'Je prends du recul puis discute', score: 4 }
        ]
      },
      {
        id: 'q6',
        text: 'Votre importance de la famille :',
        options: [
          { value: 'a', label: 'Très important, on se voit régulièrement', score: 1 },
          { value: 'b', label: 'Important, mais à distance raisonnable', score: 2 },
          { value: 'c', label: 'Modéré, quelques fois par an', score: 3 },
          { value: 'd', label: 'Peu important, je suis indépendant', score: 4 }
        ]
      },
      {
        id: 'q7',
        text: 'Votre vie sociale idéale :',
        options: [
          { value: 'a', label: 'Sorties fréquentes avec beaucoup d\'amis', score: 1 },
          { value: 'b', label: 'Quelques bons amis proches', score: 2 },
          { value: 'c', label: 'Principalement en couple', score: 3 },
          { value: 'd', label: 'Je préfère la solitude', score: 4 }
        ]
      },
      {
        id: 'q8',
        text: 'Votre rapport au travail :',
        options: [
          { value: 'a', label: 'Carrière prioritaire, très ambitieux', score: 1 },
          { value: 'b', label: 'Important mais équilibre vie pro/perso', score: 2 },
          { value: 'c', label: 'Juste pour vivre, pas une priorité', score: 3 },
          { value: 'd', label: 'Passion avant tout, même si instable', score: 4 }
        ]
      },
      {
        id: 'q9',
        text: 'Votre vision de la fidélité :',
        options: [
          { value: 'a', label: 'Monogamie stricte et exclusive', score: 1 },
          { value: 'b', label: 'Monogamie mais avec confiance et liberté', score: 2 },
          { value: 'c', label: 'Ouvert à d\'autres formes de relations', score: 3 },
          { value: 'd', label: 'Ça dépend de la relation', score: 4 }
        ]
      },
      {
        id: 'q10',
        text: 'Votre fréquence d\'intimité idéale :',
        options: [
          { value: 'a', label: 'Quotidienne', score: 1 },
          { value: 'b', label: '3-4 fois par semaine', score: 2 },
          { value: 'c', label: '1-2 fois par semaine', score: 3 },
          { value: 'd', label: 'Occasionnelle quand l\'envie est là', score: 4 }
        ]
      },
      {
        id: 'q11',
        text: 'Votre style de communication :',
        options: [
          { value: 'a', label: 'Direct et sans filtre', score: 1 },
          { value: 'b', label: 'Diplomatique et mesuré', score: 2 },
          { value: 'c', label: 'Expressif et émotionnel', score: 3 },
          { value: 'd', label: 'Réservé, je garde pour moi', score: 4 }
        ]
      },
      {
        id: 'q12',
        text: 'Votre lieu de vie idéal :',
        options: [
          { value: 'a', label: 'Grande ville dynamique', score: 1 },
          { value: 'b', label: 'Banlieue tranquille', score: 2 },
          { value: 'c', label: 'Campagne ou nature', score: 3 },
          { value: 'd', label: 'Ça m\'est égal ou je bouge souvent', score: 4 }
        ]
      },
      {
        id: 'q13',
        text: 'Votre gestion du temps libre :',
        options: [
          { value: 'a', label: 'Toujours ensemble', score: 1 },
          { value: 'b', label: 'Ensemble mais aussi temps perso', score: 2 },
          { value: 'c', label: 'Beaucoup de temps séparé', score: 3 },
          { value: 'd', label: 'Indépendants avant tout', score: 4 }
        ]
      },
      {
        id: 'q14',
        text: 'Votre vision de la religion/spiritualité :',
        options: [
          { value: 'a', label: 'Très important dans ma vie', score: 1 },
          { value: 'b', label: 'Moyennement important', score: 2 },
          { value: 'c', label: 'Peu important', score: 3 },
          { value: 'd', label: 'Pas du tout important', score: 4 }
        ]
      },
      {
        id: 'q15',
        text: 'Votre approche de la santé :',
        options: [
          { value: 'a', label: 'Sport intense et régulier', score: 1 },
          { value: 'b', label: 'Activité modérée et alimentation équilibrée', score: 2 },
          { value: 'c', label: 'Occasionnel, je fais ce que je peux', score: 3 },
          { value: 'd', label: 'Je ne fais pas trop attention', score: 4 }
        ]
      },
      {
        id: 'q16',
        text: 'Votre style de voyage :',
        options: [
          { value: 'a', label: 'Luxe et confort', score: 1 },
          { value: 'b', label: 'Organisé et touristique', score: 2 },
          { value: 'c', label: 'Aventurier et routard', score: 3 },
          { value: 'd', label: 'Je préfère rester chez moi', score: 4 }
        ]
      },
      {
        id: 'q17',
        text: 'Votre vision de l\'égalité dans le couple :',
        options: [
          { value: 'a', label: 'Tout partagé 50/50', score: 1 },
          { value: 'b', label: 'Chacun ses forces et faiblesses', score: 2 },
          { value: 'c', label: 'Rôles traditionnels', score: 3 },
          { value: 'd', label: 'Dépend de la situation', score: 4 }
        ]
      },
      {
        id: 'q18',
        text: 'Votre tolérance aux différences :',
        options: [
          { value: 'a', label: 'Très haute, j\'aime la diversité', score: 1 },
          { value: 'b', label: 'Haute, mais besoin de valeurs communes', score: 2 },
          { value: 'c', label: 'Modérée, préfère similitudes', score: 3 },
          { value: 'd', label: 'Faible, je cherche quelqu\'un comme moi', score: 4 }
        ]
      },
      {
        id: 'q19',
        text: 'Votre rapport aux réseaux sociaux :',
        options: [
          { value: 'a', label: 'Très actif, je partage ma vie', score: 1 },
          { value: 'b', label: 'Présent mais discret', score: 2 },
          { value: 'c', label: 'Peu actif, je consulte juste', score: 3 },
          { value: 'd', label: 'Absent ou très limité', score: 4 }
        ]
      },
      {
        id: 'q20',
        text: 'Votre vision du mariage :',
        options: [
          { value: 'a', label: 'Essentiel, c\'est un objectif', score: 1 },
          { value: 'b', label: 'Important mais pas urgent', score: 2 },
          { value: 'c', label: 'Pas nécessaire mais pourquoi pas', score: 3 },
          { value: 'd', label: 'Pas intéressé par le mariage', score: 4 }
        ]
      }
    ]
  },
  {
    id: 'astral-theme',
    name: 'Thème Astral',
    title: 'Analyse de votre Thème Astral Amoureux',
    description: 'Découvrez les influences astrologiques sur votre vie amoureuse',
    icon: 'Stars',
    isPremium: true,
    requiredTier: 'premium_elite',
    duration: '12 min',
    questionCount: 18,
    category: 'Astrologie',
    questions: [
      {
        id: 'q1',
        text: 'Votre signe solaire (principal) :',
        options: [
          { value: 'fire', label: 'Feu (Bélier, Lion, Sagittaire)', score: 1 },
          { value: 'earth', label: 'Terre (Taureau, Vierge, Capricorne)', score: 2 },
          { value: 'air', label: 'Air (Gémeaux, Balance, Verseau)', score: 3 },
          { value: 'water', label: 'Eau (Cancer, Scorpion, Poissons)', score: 4 }
        ]
      },
      {
        id: 'q2',
        text: 'Comment exprimez-vous vos émotions ?',
        options: [
          { value: 'a', label: 'Intensément et directement', score: 1 },
          { value: 'b', label: 'De manière réservée et privée', score: 2 },
          { value: 'c', label: 'Intellectuellement, j\'analyse mes émotions', score: 3 },
          { value: 'd', label: 'Profondément et intuitivement', score: 4 }
        ]
      },
      {
        id: 'q3',
        text: 'Votre approche de l\'amour est-elle :',
        options: [
          { value: 'a', label: 'Impulsive et passionnée', score: 1 },
          { value: 'b', label: 'Pratique et construite dans le temps', score: 2 },
          { value: 'c', label: 'Rationnelle et basée sur la compatibilité', score: 3 },
          { value: 'd', label: 'Émotionnelle et romantique', score: 4 }
        ]
      },
      {
        id: 'q4',
        text: 'Dans une relation, vous valorisez avant tout :',
        options: [
          { value: 'a', label: 'L\'excitation et la nouveauté', score: 1 },
          { value: 'b', label: 'La stabilité et la sécurité', score: 2 },
          { value: 'c', label: 'La communication et l\'intellect', score: 3 },
          { value: 'd', label: 'La connexion émotionnelle profonde', score: 4 }
        ]
      },
      {
        id: 'q5',
        text: 'Votre style de séduction naturel :',
        options: [
          { value: 'a', label: 'Direct et audacieux', score: 1 },
          { value: 'b', label: 'Subtil et progressif', score: 2 },
          { value: 'c', label: 'Charmeur et intellectuel', score: 3 },
          { value: 'd', label: 'Mystérieux et magnétique', score: 4 }
        ]
      },
      {
        id: 'q6',
        text: 'Face à une déception amoureuse, vous :',
        options: [
          { value: 'a', label: 'Rebondissez rapidement', score: 1 },
          { value: 'b', label: 'Prenez du temps pour guérir', score: 2 },
          { value: 'c', label: 'Rationalisez et analysez', score: 3 },
          { value: 'd', label: 'Ressentez profondément et longtemps', score: 4 }
        ]
      },
      {
        id: 'q7',
        text: 'Votre vision de l\'engagement :',
        options: [
          { value: 'a', label: 'Je m\'engage quand la passion est là', score: 1 },
          { value: 'b', label: 'L\'engagement est sacré et sérieux', score: 2 },
          { value: 'c', label: 'J\'ai besoin de liberté même engagé', score: 3 },
          { value: 'd', label: 'Je m\'engage corps et âme', score: 4 }
        ]
      },
      {
        id: 'q8',
        text: 'Votre langage d\'amour principal :',
        options: [
          { value: 'a', label: 'Contact physique et action', score: 1 },
          { value: 'b', label: 'Actes de service concrets', score: 2 },
          { value: 'c', label: 'Paroles valorisantes', score: 3 },
          { value: 'd', label: 'Moments de qualité', score: 4 }
        ]
      },
      {
        id: 'q9',
        text: 'Votre plus grande force en amour :',
        options: [
          { value: 'a', label: 'Mon énergie et mon enthousiasme', score: 1 },
          { value: 'b', label: 'Ma loyauté et ma fiabilité', score: 2 },
          { value: 'c', label: 'Ma capacité à communiquer', score: 3 },
          { value: 'd', label: 'Mon empathie et ma compréhension', score: 4 }
        ]
      },
      {
        id: 'q10',
        text: 'Votre plus grand défi relationnel :',
        options: [
          { value: 'a', label: 'L\'impatience et l\'impulsivité', score: 1 },
          { value: 'b', label: 'La résistance au changement', score: 2 },
          { value: 'c', label: 'La sur-analyse et le détachement', score: 3 },
          { value: 'd', label: 'L\'hypersensibilité et les émotions intenses', score: 4 }
        ]
      },
      {
        id: 'q11',
        text: 'Votre rythme relationnel idéal :',
        options: [
          { value: 'a', label: 'Rapide et intense', score: 1 },
          { value: 'b', label: 'Lent et stable', score: 2 },
          { value: 'c', label: 'Variable et stimulant', score: 3 },
          { value: 'd', label: 'Profond et progressif', score: 4 }
        ]
      },
      {
        id: 'q12',
        text: 'Comment gérez-vous les conflits ?',
        options: [
          { value: 'a', label: 'Je confronte directement et explosif', score: 1 },
          { value: 'b', label: 'Je reste calme mais têtu', score: 2 },
          { value: 'c', label: 'Je discute et négocie', score: 3 },
          { value: 'd', label: 'Je ressens intensément mais intériorise', score: 4 }
        ]
      },
      {
        id: 'q13',
        text: 'Votre besoin d\'indépendance :',
        options: [
          { value: 'a', label: 'Élevé, je garde mon autonomie', score: 1 },
          { value: 'b', label: 'Modéré dans un cadre sécurisé', score: 2 },
          { value: 'c', label: 'Très élevé, c\'est vital', score: 3 },
          { value: 'd', label: 'Faible, je préfère la fusion', score: 4 }
        ]
      },
      {
        id: 'q14',
        text: 'Votre intuition amoureuse :',
        options: [
          { value: 'a', label: 'Je me fie à mes instincts immédiats', score: 1 },
          { value: 'b', label: 'Je préfère les signes concrets', score: 2 },
          { value: 'c', label: 'J\'analyse plus que je ressens', score: 3 },
          { value: 'd', label: 'Très développée, presque psychique', score: 4 }
        ]
      },
      {
        id: 'q15',
        text: 'Votre idée de la romance :',
        options: [
          { value: 'a', label: 'Aventure et spontanéité', score: 1 },
          { value: 'b', label: 'Traditions et gestes classiques', score: 2 },
          { value: 'c', label: 'Conversations et connexion mentale', score: 3 },
          { value: 'd', label: 'Magie et connexion d\'âmes', score: 4 }
        ]
      },
      {
        id: 'q16',
        text: 'Votre rapport à la jalousie :',
        options: [
          { value: 'a', label: 'Explosive mais courte', score: 1 },
          { value: 'b', label: 'Possessive mais contrôlée', score: 2 },
          { value: 'c', label: 'Rationnelle, basée sur la confiance', score: 3 },
          { value: 'd', label: 'Intense et douloureuse', score: 4 }
        ]
      },
      {
        id: 'q17',
        text: 'Votre transformation en amour :',
        options: [
          { value: 'a', label: 'Je reste moi-même', score: 1 },
          { value: 'b', label: 'J\'évolue lentement', score: 2 },
          { value: 'c', label: 'Je m\'adapte facilement', score: 3 },
          { value: 'd', label: 'Je me transforme profondément', score: 4 }
        ]
      },
      {
        id: 'q18',
        text: 'Votre cycle amoureux typique :',
        options: [
          { value: 'a', label: 'Coup de foudre puis refroidissement rapide', score: 1 },
          { value: 'b', label: 'Construction lente et durable', score: 2 },
          { value: 'c', label: 'Plusieurs relations en parallèle ou successives', score: 3 },
          { value: 'd', label: 'Peu de relations mais très intenses', score: 4 }
        ]
      }
    ]
  },
  {
    id: 'seduction-test',
    name: 'Test de Séduction',
    title: 'Quel est votre Profil de Séduction ?',
    description: 'Identifiez vos atouts et votre style de séduction unique',
    icon: 'Flame',
    isPremium: false,
    requiredTier: 'free',
    duration: '7 min',
    questionCount: 12,
    category: 'Séduction',
    questions: [
      {
        id: 'q1',
        text: 'Votre première approche avec quelqu\'un qui vous plaît :',
        options: [
          { value: 'a', label: 'Contact visuel intense et sourire', score: 1 },
          { value: 'b', label: 'Une remarque intelligente ou drôle', score: 2 },
          { value: 'c', label: 'Un compliment sincère', score: 3 },
          { value: 'd', label: 'J\'attends qu\'on vienne vers moi', score: 4 }
        ]
      },
      {
        id: 'q2',
        text: 'Votre atout de séduction principal :',
        options: [
          { value: 'a', label: 'Mon physique et ma présence', score: 1 },
          { value: 'b', label: 'Mon intelligence et mon humour', score: 2 },
          { value: 'c', label: 'Ma gentillesse et mon écoute', score: 3 },
          { value: 'd', label: 'Mon mystère et mon indépendance', score: 4 }
        ]
      },
      {
        id: 'q3',
        text: 'Lors d\'un premier rendez-vous, vous misez sur :',
        options: [
          { value: 'a', label: 'Une tenue sexy qui met en valeur', score: 1 },
          { value: 'b', label: 'Des conversations stimulantes', score: 2 },
          { value: 'c', label: 'Créer une ambiance chaleureuse', score: 3 },
          { value: 'd', label: 'Rester authentique et naturel', score: 4 }
        ]
      },
      {
        id: 'q4',
        text: 'Votre technique de flirt :',
        options: [
          { value: 'a', label: 'Contact physique subtil et taquineries', score: 1 },
          { value: 'b', label: 'Joutes verbales et jeux d\'esprit', score: 2 },
          { value: 'c', label: 'Attention sincère et questions profondes', score: 3 },
          { value: 'd', label: 'Alternance entre intérêt et distance', score: 4 }
        ]
      },
      {
        id: 'q5',
        text: 'Comment créez-vous de la tension sexuelle ?',
        options: [
          { value: 'a', label: 'Par des regards appuyés et le langage corporel', score: 1 },
          { value: 'b', label: 'Par des sous-entendus et l\'ambiguïté', score: 2 },
          { value: 'c', label: 'Par l\'intimité émotionnelle croissante', score: 3 },
          { value: 'd', label: 'Ça arrive naturellement, je ne force rien', score: 4 }
        ]
      },
      {
        id: 'q6',
        text: 'Votre rythme de séduction :',
        options: [
          { value: 'a', label: 'Rapide et direct', score: 1 },
          { value: 'b', label: 'Stratégique et calculé', score: 2 },
          { value: 'c', label: 'Patient et progressif', score: 3 },
          { value: 'd', label: 'Imprévisible selon l\'humeur', score: 4 }
        ]
      },
      {
        id: 'q7',
        text: 'Votre réaction si on vous résiste :',
        options: [
          { value: 'a', label: 'Ça m\'excite, j\'intensifie mes efforts', score: 1 },
          { value: 'b', label: 'Je change de stratégie', score: 2 },
          { value: 'c', label: 'Je respecte et me retire', score: 3 },
          { value: 'd', label: 'Je me désintéresse rapidement', score: 4 }
        ]
      },
      {
        id: 'q8',
        text: 'Votre façon de montrer votre intérêt :',
        options: [
          { value: 'a', label: 'Messages fréquents et initiatives claires', score: 1 },
          { value: 'b', label: 'Propositions d\'activités originales', score: 2 },
          { value: 'c', label: 'Petites attentions et gestes tendres', score: 3 },
          { value: 'd', label: 'Je suis discret, je ne m\'expose pas trop', score: 4 }
        ]
      },
      {
        id: 'q9',
        text: 'Votre niveau de confiance en séduction :',
        options: [
          { value: 'a', label: 'Très élevé, je sais ce que je vaux', score: 1 },
          { value: 'b', label: 'Bon, j\'ai des techniques qui marchent', score: 2 },
          { value: 'c', label: 'Modéré, ça dépend de la personne', score: 3 },
          { value: 'd', label: 'Faible, je doute souvent', score: 4 }
        ]
      },
      {
        id: 'q10',
        text: 'Votre définition du charme :',
        options: [
          { value: 'a', label: 'Magnétisme et sex-appeal', score: 1 },
          { value: 'b', label: 'Esprit vif et répartie', score: 2 },
          { value: 'c', label: 'Douceur et bienveillance', score: 3 },
          { value: 'd', label: 'Authenticité et unicité', score: 4 }
        ]
      },
      {
        id: 'q11',
        text: 'Votre attitude face au rejet :',
        options: [
          { value: 'a', label: 'Je passe rapidement à autre chose', score: 1 },
          { value: 'b', label: 'J\'analyse ce qui n\'a pas fonctionné', score: 2 },
          { value: 'c', label: 'Ça m\'affecte mais j\'apprends', score: 3 },
          { value: 'd', label: 'Ça me décourage profondément', score: 4 }
        ]
      },
      {
        id: 'q12',
        text: 'Votre objectif en séduction :',
        options: [
          { value: 'a', label: 'Conquête et passion', score: 1 },
          { value: 'b', label: 'Connexion intellectuelle stimulante', score: 2 },
          { value: 'c', label: 'Relation sincère et durable', score: 3 },
          { value: 'd', label: 'Découverte et expérience', score: 4 }
        ]
      }
    ]
  }
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

export const getQuizzesByTier = (tier: 'free' | 'premium' | 'premium_elite'): Quiz[] => {
  const tierHierarchy = {
    'free': ['free'],
    'premium': ['free', 'premium'],
    'premium_elite': ['free', 'premium', 'premium_elite']
  };

  return quizzes.filter(quiz => tierHierarchy[tier].includes(quiz.requiredTier));
};
