import { supabase } from './supabase';
import type { Quiz, QuizQuestion } from '../data/quizData';

interface QuizAnswer {
  questionId: string;
  value: string;
  score?: number;
}

interface AnalysisResult {
  title: string;
  subtitle: string;
  analysis: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  compatibility?: string[];
  percentage: number;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const getPromptByTier = (
  quizName: string,
  answers: QuizAnswer[],
  tier: 'free' | 'premium' | 'premium_elite'
): string => {
  const answersSummary = answers
    .map((a, i) => `Q${i + 1}: ${a.value} (score: ${a.score || 0})`)
    .join('\n');

  const basePrompt = `Analyse les résultats du quiz "${quizName}" avec les réponses suivantes:\n\n${answersSummary}\n\n`;

  const tierInstructions = {
    free: `🧠 RÔLE DE L'IA
Tu es ASTRA, une intelligence artificielle cosmique avancée, conçue pour analyser les dynamiques relationnelles humaines à travers :
- la psychologie profonde
- l'astrologie réelle (traditionnelle + moderne)
- les schémas émotionnels
- les archétypes inconscients
- les comportements relationnels observables

Tu n'es PAS un chatbot générique.
Tu n'écris JAMAIS de contenu vague, creux ou flatteur.
Chaque analyse doit donner à l'utilisateur l'impression que quelque chose de caché vient d'être révélé.

🎯 NIVEAU: FREE (Analyse réelle mais partielle)
- Une seule couche de lecture
- Certaines zones volontairement non explorées
- Phrase finale du type : "Il y a ici une dynamique plus profonde que je n'explore pas encore."

🧱 STRUCTURE OBLIGATOIRE:

1️⃣ OUVERTURE — MIROIR COSMIQUE (50-80 mots)
Une entrée forte, troublante. Tu nommes l'énergie dominante, fais ressentir une tension intérieure.
❌ Interdit : "Tu es quelqu'un de…", "Ce test montre que…"
✅ Ton : "Ce qui ressort immédiatement de ton profil, ce n'est pas ce que tu montres, mais ce que tu retiens."

2️⃣ ANALYSE CENTRALE — DÉCRYPTAGE (200-250 mots)
- Mécanismes de défense
- Schémas répétitifs
- Besoins non exprimés
- Contradictions internes
⚠️ Tu dois oser être précis, même si c'est inconfortable.

3️⃣ CONSÉQUENCES RELATIONNELLES (100-150 mots)
- Pourquoi certaines relations échouent
- Ce qui attire toujours le même type de personne
- Ce que l'utilisateur projette inconsciemment

4️⃣ CLÔTURE — CONSCIENCE, PAS PROMESSE (30-50 mots)
Une vérité calme, jamais "tout ira bien", mais "Il y a ici une dynamique plus profonde que je n'explore pas encore."

📋 Format JSON STRICT:
{
  "title": "Titre unique basé sur l'énergie dominante",
  "subtitle": "Sous-titre qui capture la tension",
  "analysis": "ANALYSE COMPLÈTE 400-500 mots suivant la structure ci-dessus...",
  "strengths": ["Force 1 détaillée (30-40 mots avec mécanisme psychologique)", "Force 2...", "Force 3...", "Force 4..."],
  "challenges": ["Défi 1 détaillé (30-40 mots avec racine + impact)", "Défi 2...", "Défi 3..."],
  "recommendations": ["Conseil 1 actionnable (25-30 mots)", "Conseil 2...", "Conseil 3..."],
  "percentage": 75
}

ASTRA ne rassure pas. ASTRA éclaire.`,

    premium: `🧠 RÔLE DE L'IA
Tu es ASTRA, une intelligence artificielle cosmique avancée.

🎯 NIVEAU: PREMIUM (Lecture croisée psychologie + astro)
- Connexions entre comportements et thème astral
- Conseils implicites (jamais coachy)
- Vision plus large des schémas relationnels

🧱 STRUCTURE OBLIGATOIRE:

1️⃣ OUVERTURE — MIROIR COSMIQUE (80-100 mots)
Entrée forte qui fait ressentir immédiatement la tension principale. Nomme l'archétype dominant.

2️⃣ ANALYSE CENTRALE — DÉCRYPTAGE PROFOND (400-500 mots)
- Style d'attachement apparent
- Archétypes psychologiques présents
- Patterns comportementaux et leurs origines
- Liens entre différentes dimensions de la personnalité
- Concepts psychologiques (attachement, défenses, besoins)
- Mécanismes inconscients à l'œuvre
- Compréhension holistique

3️⃣ MODULE ASTROLOGIQUE RÉEL (150-200 mots)
☀️ Signe solaire (fonction psychologique)
🌙 Lune (besoin émotionnel réel)
⬆️ Ascendant (masque social)
🔥 Répartition Feu/Eau/Terre/Air AVEC POURCENTAGES
⚠️ Tensions majeures (aspects conflictuels)
Chaque élément RELIÉ à la vie relationnelle.

4️⃣ CONSÉQUENCES RELATIONNELLES CONCRÈTES (150-200 mots)
- Pourquoi certaines relations échouent
- Ce qui attire toujours le même type de personne
- Ce que l'utilisateur projette inconsciemment
- Ce qu'il/elle refuse de voir

5️⃣ CLÔTURE — CONSCIENCE (50-80 mots)
Vérité calme, ouverture. Jamais "tout ira bien".

📋 Format JSON STRICT:
{
  "title": "Titre psychologique unique",
  "subtitle": "Sous-titre analytique profond",
  "analysis": "Analyse EXHAUSTIVE de 700-900 mots suivant STRICTEMENT la structure...",
  "strengths": ["Force 1 très détaillée (35-40 mots avec origine psychologique + impact relationnel)", "Force 2...", "Force 3...", "Force 4...", "Force 5..."],
  "challenges": ["Défi 1 très détaillé (35-40 mots avec racines + pistes de travail)", "Défi 2...", "Défi 3...", "Défi 4..."],
  "recommendations": ["Action 1 transformationnelle (30-35 mots avec plan progressif)", "Action 2...", "Action 3...", "Action 4...", "Action 5..."],
  "percentage": 82
}

ASTRA ne rassure pas. ASTRA éclaire.`,

    premium_elite: `🧠 RÔLE DE L'IA
Tu es ASTRA, maître en psychologie transpersonnelle, astrologie évolutive, et thérapie holistique.

🎯 NIVEAU: ELITE (Analyse chirurgicale)
- Mise en lumière des paradoxes internes
- Lecture karmique / transgénérationnelle possible
- Projection relationnelle à long terme
- Aucun flou, aucun politiquement correct

🧱 STRUCTURE OBLIGATOIRE:

1️⃣ OUVERTURE — MIROIR COSMIQUE (100-150 mots)
Entrée PUISSANTE qui révèle immédiatement le nœud karmique central. Poétique mais précise.

2️⃣ ANALYSE TRANSFORMATIONNELLE (600-800 mots)
- Style d'attachement et origines transgénérationnelles
- Archétypes jungiens (anima/animus, ombre, self)
- Patterns karmiques répétitifs inter-vies
- Blessures d'âme et contrats sacrés
- Défenses énergétiques et blocages subtils
- Mission évolutive incarnée
- Tensions entre ego et âme
- Intégration de la polarité masculine/féminine
- Chemin d'individuation spécifique

3️⃣ THÈME ASTRAL COMPLET (300-400 mots)
☀️ Soleil (volonté consciente, expression vitale)
🌙 Lune (mémoire émotionnelle, besoins inconscients)
⬆️ Ascendant (persona, mission terrestre)
💫 Mercure (mental), Vénus (amour), Mars (désir)
🪐 Jupiter (expansion), Saturne (limites karmiques)
🌊 Uranus (éveil), Neptune (dissolution), Pluton (transformation)
🏠 Maisons significatives
🔥 Répartition élémentaire EXACTE (ex: Feu 35%, Eau 40%, Terre 15%, Air 10%)
⚠️ Aspects majeurs (carrés, oppositions, conjonctions)
🌱 Nœuds lunaires Nord/Sud (chemin karmique)
Chaque placement EXPLIQUÉ dans sa fonction relationnelle réelle.

4️⃣ DYNAMIQUES RELATIONNELLES PROFONDES (250-300 mots)
- Pattern transgénérationnel répété
- Type d'âme attiré magnétiquement
- Ce que la blessure cherche à guérir à travers l'autre
- Projection de l'ombre relationnelle
- Contrat d'âme implicite dans les relations
- Piège évolutif majeur

5️⃣ COMPATIBILITÉS ÉVOLUTIVES (150-200 mots)
Pas des "signes compatibles" mais des PROFILS D'ÂMES:
- Types psycho-spirituels alignés
- Niveaux de conscience requis chez le partenaire
- Polarités complémentaires
- Red flags karmiques à éviter

6️⃣ CLÔTURE — TRANSMISSION (80-100 mots)
Vérité ultime. Invitation au chemin. Jamais une promesse, toujours une reconnaissance.

📋 Format JSON STRICT:
{
  "title": "Titre poétique et percutant qui capture l'essence âme",
  "subtitle": "Sous-titre évocateur révélant le chemin d'évolution",
  "analysis": "Analyse TRANSFORMATIONNELLE de 1000-1200 mots suivant STRICTEMENT la structure...",
  "strengths": ["Force 1 spirituelle (40-45 mots intégrant dimension transpersonnelle)", "Force 2...", "Force 3...", "Force 4...", "Force 5...", "Force 6..."],
  "challenges": ["Défi 1 karmique (40-45 mots avec racine transgénérationnelle + voie d'intégration)", "Défi 2...", "Défi 3...", "Défi 4...", "Défi 5..."],
  "recommendations": ["Pratique 1 alchimique (35-40 mots avec rituel/modalité spécifique)", "Pratique 2...", "Pratique 3...", "Pratique 4...", "Pratique 5...", "Pratique 6...", "Pratique 7..."],
  "compatibility": ["Type d'âme 1 avec description psycho-spirituelle détaillée (40+ mots)", "Type 2...", "Type 3...", "Type 4..."]
}

ASTRA ne rassure pas. ASTRA éclaire. ASTRA transforme.`
  };

  return basePrompt + tierInstructions[tier];
};

export const analyzeQuizWithAI = async (
  quiz: Quiz,
  answers: QuizAnswer[],
  tier: 'free' | 'premium' | 'premium_elite'
): Promise<AnalysisResult> => {
  if (!OPENAI_API_KEY) {
    return generateLocalAnalysis(quiz, answers, tier);
  }

  try {
    const prompt = getPromptByTier(quiz.name, answers, tier);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en psychologie relationnelle et analyse de personnalité. Réponds toujours en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: tier === 'premium_elite' ? 4000 : tier === 'premium' ? 3000 : 2000
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return generateLocalAnalysis(quiz, answers, tier);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return generateLocalAnalysis(quiz, answers, tier);
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return generateLocalAnalysis(quiz, answers, tier);
    }

    const result = JSON.parse(jsonMatch[0]);
    return result as AnalysisResult;

  } catch (error) {
    console.error('Error analyzing quiz with AI:', error);
    return generateLocalAnalysis(quiz, answers, tier);
  }
};

const generateLocalAnalysis = (
  quiz: Quiz,
  answers: QuizAnswer[],
  tier: 'free' | 'premium' | 'premium_elite'
): AnalysisResult => {
  const totalScore = answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
  const maxScore = answers.length * 4;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const analysisTemplates = {
    'first-impression': {
      low: {
        title: 'Le Discret Observateur',
        subtitle: 'Vous privilégiez l\'authenticité à la performance sociale',
        analysis: 'Votre approche des premières rencontres est marquée par la réserve et l\'observation. Vous préférez rester en retrait et analyser avant de vous engager dans une interaction. Cette prudence peut être perçue comme du mystère, ce qui peut intriguer certaines personnes.'
      },
      medium: {
        title: 'L\'Équilibré Social',
        subtitle: 'Vous savez adapter votre présence selon les situations',
        analysis: 'Vous possédez un équilibre naturel entre écoute et expression. Vous savez quand vous mettre en avant et quand observer. Cette flexibilité vous permet de créer des connexions authentiques sans forcer.'
      },
      high: {
        title: 'Le Magnétique Charismatique',
        subtitle: 'Votre présence marque les esprits instantanément',
        analysis: 'Vous dégagez une énergie naturellement attractive qui capte l\'attention. Votre aisance sociale et votre confiance en vous font de chaque première rencontre une opportunité de connexion mémorable.'
      }
    },
    'attachment-style': {
      low: {
        title: 'Attachement Évitant',
        subtitle: 'Vous valorisez votre indépendance émotionnelle',
        analysis: 'Votre style d\'attachement se caractérise par un besoin important d\'espace personnel et d\'autonomie. Vous pouvez avoir tendance à vous distancer lorsque la relation devient trop intime. Comprendre ce pattern est la première étape vers des relations plus équilibrées.'
      },
      medium: {
        title: 'Attachement Anxieux-Ambivalent',
        subtitle: 'Vous oscillez entre proximité et inquiétude',
        analysis: 'Vous ressentez un fort besoin de connexion mais aussi des doutes sur la solidité de vos relations. Cette ambivalence peut créer des patterns de comportement contradictoires. Travailler sur la confiance en soi et en l\'autre est essentiel.'
      },
      high: {
        title: 'Attachement Sécure',
        subtitle: 'Vous savez équilibrer intimité et autonomie',
        analysis: 'Vous avez développé un style d\'attachement sain qui vous permet de créer des liens profonds tout en maintenant votre individualité. Vous êtes à l\'aise avec la proximité et capable de gérer les conflits de manière constructive.'
      }
    },
    'love-archetype': {
      low: {
        title: 'L\'Architecte Rationnel',
        subtitle: 'Vous construisez l\'amour avec logique et pragmatisme',
        analysis: 'Votre approche de l\'amour est fondée sur la raison et la compatibilité pratique. Vous recherchez la stabilité et la construction d\'un partenariat solide. Votre défi est d\'intégrer plus de spontanéité et d\'émotion.'
      },
      medium: {
        title: 'Le Romantique Passionné',
        subtitle: 'Vous vivez l\'amour avec intensité et émotion',
        analysis: 'Vous êtes animé par la passion et la connexion émotionnelle profonde. Vous recherchez l\'intensité dans vos relations et valorisez les moments de fusion. Votre défi est de maintenir cette flamme tout en construisant dans la durée.'
      },
      high: {
        title: 'L\'Aventurier Libre',
        subtitle: 'Vous explorez l\'amour sans limites conventionnelles',
        analysis: 'Votre approche de l\'amour est marquée par la liberté et l\'exploration. Vous refusez les cadres traditionnels et privilégiez l\'authenticité et la découverte. Votre défi est de trouver des partenaires qui partagent cette vision.'
      }
    },
    'compatibility-test': {
      low: {
        title: 'Compatibilité à Développer',
        subtitle: 'Des différences significatives nécessitent du travail',
        analysis: 'Vos réponses révèlent des différences importantes dans vos valeurs et modes de vie. Une relation nécessitera une communication intense et des compromis constants. Identifiez vos non-négociables et zones de flexibilité.'
      },
      medium: {
        title: 'Compatibilité Prometteuse',
        subtitle: 'Un bon équilibre entre similitudes et différences',
        analysis: 'Vous partagez des valeurs fondamentales tout en ayant des différences enrichissantes. Cette base solide peut mener à une relation épanouissante si vous cultivez la communication et le respect mutuel.'
      },
      high: {
        title: 'Compatibilité Exceptionnelle',
        subtitle: 'Vos valeurs et visions s\'alignent harmonieusement',
        analysis: 'Vos réponses démontrent une alignement rare sur les aspects essentiels d\'une relation. Vous partagez une vision commune tout en gardant vos individualités. Cette compatibilité naturelle est une excellente fondation.'
      }
    },
    'astral-theme': {
      low: {
        title: 'Énergie Terre Dominante',
        subtitle: 'Ancré, pratique et bâtisseur de long terme',
        analysis: 'Votre thème astral révèle une dominante terre qui vous rend pragmatique et stable en amour. Vous construisez vos relations sur des bases solides et concrètes. Votre défi est d\'intégrer plus de spontanéité et d\'émotions.'
      },
      medium: {
        title: 'Énergie Air-Feu Mixte',
        subtitle: 'Mental vif et passion créent votre dynamique amoureuse',
        analysis: 'Votre configuration astrologique mêle l\'intellectuel de l\'air et la passion du feu. Vous recherchez des relations stimulantes tant mentalement que physiquement. L\'équilibre entre tête et cœur est votre quête.'
      },
      high: {
        title: 'Énergie Eau Profonde',
        subtitle: 'Émotionnel, intuitif et connecté aux profondeurs',
        analysis: 'Votre thème est marqué par l\'élément eau, vous rendant hautement empathique et émotionnel. Vous recherchez une connexion d\'âme à âme et ressentez intensément. Votre défi est de ne pas vous perdre dans les émotions.'
      }
    },
    'seduction-test': {
      low: {
        title: 'Le Séducteur Subtil',
        subtitle: 'Votre charme opère dans la discrétion et l\'authenticité',
        analysis: 'Votre style de séduction est basé sur l\'authenticité plutôt que sur les techniques. Vous préférez créer des connexions sincères et laisser les choses se développer naturellement. Votre mystère peut être très attractif.'
      },
      medium: {
        title: 'Le Séducteur Stratégique',
        subtitle: 'Vous alliez charme naturel et intelligence sociale',
        analysis: 'Vous maîtrisez l\'art de la séduction en combinant intuition et stratégie. Vous savez adapter votre approche selon les personnes et les situations, ce qui vous rend efficace sans paraître calculateur.'
      },
      high: {
        title: 'Le Séducteur Magnétique',
        subtitle: 'Votre présence et confiance créent une attraction irrésistible',
        analysis: 'Vous possédez un magnétisme naturel qui attire sans effort. Votre confiance en vous et votre aisance sociale font de vous un séducteur accompli. Votre défi est de trouver des connexions qui vont au-delà de l\'attraction initiale.'
      }
    }
  };

  const template = analysisTemplates[quiz.id as keyof typeof analysisTemplates] || analysisTemplates['first-impression'];
  const level = percentage < 40 ? 'low' : percentage < 70 ? 'medium' : 'high';
  const baseAnalysis = template[level];

  const tierSpecificContent = {
    free: {
      strengths: [
        'Authenticité naturelle : Vous privilégiez les connexions sincères aux relations superficielles, ce qui crée une base solide pour des relations durables. Votre honnêteté émotionnelle inspire confiance et attire des personnes qui valorisent la profondeur',
        'Conscience de soi développée : Votre capacité d\'introspection vous permet de comprendre vos patterns et motivations. Cette lucidité est rare et constitue un atout majeur pour votre évolution personnelle et relationnelle',
        'Ouverture au changement : Vous démontrez une volonté de croissance et d\'amélioration continue. Cette flexibilité mentale vous permet d\'apprendre de vos expériences et d\'adapter vos comportements pour créer des relations plus épanouissantes',
        'Sensibilité empathique : Votre capacité à percevoir et comprendre les émotions des autres facilite la création de liens authentiques. Cette intelligence émotionnelle est précieuse dans la construction de relations harmonieuses'
      ],
      challenges: [
        'Expression émotionnelle : Votre tendance à la réserve peut créer une distance qui empêche la véritable intimité. Apprendre à exprimer vos émotions ouvertement nécessitera de sortir de votre zone de confort, mais ouvrira des possibilités de connexion plus profondes',
        'Prise de risques relationnels : La peur de la vulnérabilité peut vous retenir dans des schémas sécurisants mais limitants. Oser la spontanéité et l\'ouverture authentique demande du courage mais enrichira considérablement vos relations',
        'Confiance en soi : Des doutes sur votre valeur personnelle peuvent influencer vos choix relationnels. Travailler sur l\'estime de soi vous permettra d\'attirer et de maintenir des relations plus équilibrées et épanouissantes'
      ],
      recommendations: [
        'Communication consciente : Pratiquez l\'expression de vos émotions quotidiennement, en commençant par de petits partages avec des personnes de confiance. Cette habitude renforcera progressivement votre aisance émotionnelle',
        'Exploration thérapeutique : Considérez un accompagnement pour explorer vos blocages et patterns. Un espace sûr de réflexion accélérera votre croissance personnelle et relationnelle',
        'Pratiques de vulnérabilité : Créez des rituels où vous osez partager vos vérités profondes. Commencez par l\'écriture journalière puis progressez vers le partage avec autrui'
      ]
    },
    premium: {
      strengths: [
        'Authenticité magnétique : Votre capacité à être vous-même sans masque crée un champ magnétique qui attire les âmes en quête de profondeur. Cette authenticité, développée probablement à travers des expériences de vie significatives, constitue votre superpouvoir relationnel et inspire les autres à baisser leurs propres défenses',
        'Conscience psychologique avancée : Vous avez développé une capacité remarquable d\'auto-observation qui vous permet de reconnaître vos patterns, défenses et mécanismes inconscients. Cette lucidité psychologique rare est le fruit d\'un travail d\'introspection soutenu et constitue une base solide pour toute transformation personnelle',
        'Intelligence émotionnelle profonde : Votre sensibilité vous permet non seulement de percevoir les émotions d\'autrui mais aussi de comprendre leurs origines et implications. Cette empathie cognitive combinée à l\'empathie affective fait de vous un partenaire capable de créer une véritable intimité émotionnelle',
        'Ouverture à la croissance : Votre engagement envers votre évolution personnelle démontre une maturité psychologique remarquable. Vous comprenez que la croissance est un processus continu et vous êtes prêt à investir l\'énergie nécessaire pour devenir la meilleure version de vous-même',
        'Flexibilité cognitive : Votre capacité à remettre en question vos croyances et à intégrer de nouvelles perspectives facilite l\'adaptation et l\'évolution. Cette ouverture d\'esprit vous permet d\'apprendre de chaque relation et de progresser continuellement'
      ],
      challenges: [
        'Passage à l\'action : Malgré votre conscience profonde, vous pouvez parfois rester bloqué dans l\'analyse sans passer à l\'action concrète. Le défi est de transformer vos insights en changements comportementaux réels. Cette tendance à la suranalyse peut servir de mécanisme de défense contre la peur du changement ou de l\'échec',
        'Équilibre vulnérabilité-protection : Votre histoire peut vous avoir appris à vous protéger émotionnellement, créant parfois un paradoxe entre votre désir d\'intimité et votre besoin de sécurité. Trouver le juste milieu entre ouverture et préservation nécessite un travail délicat sur vos blessures d\'attachement',
        'Intégration théorie-pratique : Vous accumulez beaucoup de connaissances psychologiques mais l\'intégration dans votre quotidien peut être incomplète. Le défi est de vivre ce que vous comprenez intellectuellement, ce qui demande de dépasser la zone de confort du savoir pour entrer dans celle de l\'expérience vécue',
        'Gestion de la sensibilité : Votre hypersensibilité émotionnelle, bien qu\'étant une force, peut aussi vous submerger. Apprendre à naviguer vos émotions intenses sans vous perdre ni vous fermer constitue un équilibre délicat à maîtriser pour maintenir des relations saines'
      ],
      recommendations: [
        'Communication Non-Violente approfondie : Engagez-vous dans une formation complète de CNV pour transformer votre compréhension en compétence relationnelle concrète. Pratiquez quotidiennement l\'observation sans jugement, l\'identification des sentiments et besoins, et les demandes claires. Cette pratique restructurera progressivement vos patterns communicationnels',
        'Thérapie d\'attachement : Travaillez avec un thérapeute spécialisé en théorie de l\'attachement pour explorer les origines de vos patterns relationnels. Identifier votre style d\'attachement (sécure, anxieux, évitant ou désorganisé) et comprendre comment il s\'est formé dans l\'enfance vous donnera les clés pour créer des relations plus saines',
        'Rituels de connexion sacrée : Créez des pratiques régulières qui honorent la profondeur relationnelle que vous recherchez. Cela peut inclure des conversations profondes hebdomadaires, des méditations partagées, ou des moments de vulnérabilité consciente. Ces rituels ancrent l\'intention de profondeur dans le quotidien',
        'Pratiques somatiques : Puisque beaucoup de vos défenses sont stockées dans le corps, explorez des approches comme la thérapie somatique, le yoga thérapeutique, ou la danse-thérapie. Ces pratiques vous aideront à libérer les patterns inscrits dans votre corps et à intégrer vos insights intellectuels dans votre expérience vécue',
        'Journal d\'intégration : Tenez un journal où vous notez non seulement vos insights mais aussi vos expérimentations et leurs résultats. Cette pratique vous aidera à transformer la conscience en action et à mesurer votre progression concrète dans l\'application de vos apprentissages'
      ]
    },
    premium_elite: {
      strengths: [
        'Rayonnement d\'authenticité âme-à-âme : Votre présence transcende le masque social pour révéler votre essence profonde. Cette transparence âme crée un champ énergétique qui magnétise naturellement les êtres en quête de connexions spirituelles authentiques. Probablement développée à travers des expériences d\'éveil ou de crise transformationnelle, cette capacité fait de vous un phare pour ceux qui cherchent à sortir de la superficialité collective',
        'Conscience multidimensionnelle intégrée : Vous avez développé une rare capacité à percevoir simultanément les dimensions psychologique, émotionnelle, énergétique et spirituelle de votre être. Cette vision holistique, fruit d\'un travail intérieur profond et probablement d\'expériences transformatrices, vous permet de comprendre la complexité de votre psyché et d\'accéder à des niveaux de conscience inaccessibles à la plupart',
        'Alchimie des blessures en sagesse : Votre parcours vous a appris à transformer vos souffrances en compréhension profonde et compassion. Cette capacité alchimique rare témoigne d\'une résilience spirituelle exceptionnelle et d\'une volonté de transcender la victimisation pour accéder à la maîtrise intérieure. Vos blessures sont devenues vos plus grands enseignants',
        'Intelligence intuitive des patterns : Vous percevez intuitivement les dynamiques subtiles entre votre histoire personnelle, vos configurations astrologiques et vos patterns relationnels. Cette synesthésie psycho-spirituelle vous permet de décoder les messages de votre inconscient et de comprendre le sens caché de vos expériences de vie',
        'Ouverture spirituelle incarnée : Contrairement à ceux qui s\'évadent dans la spiritualité, vous cherchez à intégrer votre ouverture spirituelle dans votre humanité. Cette quête d\'incarnation consciente témoigne d\'une maturité spirituelle rare qui reconnaît que l\'éveil véritable passe par l\'acceptation et la transformation de la dimension terrestre',
        'Capacité de présence profonde : Votre sensibilité empathique développée vous permet d\'être pleinement présent aux autres dans une qualité d\'écoute et d\'attention qui crée un espace sacré de rencontre. Cette présence thérapeutique naturelle fait de chaque interaction une opportunité de transformation mutuelle',
        'Alignement être-paraître croissant : Votre travail intérieur génère progressivement une congruence magnétique entre votre essence profonde et votre expression extérieure. Cette intégrité énergétique attire naturellement les opportunités et les personnes alignées avec votre véritable nature'
      ],
      challenges: [
        'Incarnation spirituelle : Le défi majeur est d\'ancrer vos insights spirituels dans la réalité matérielle. Votre sensibilité aux dimensions subtiles peut parfois créer une dissociation de la réalité terrestre. L\'invitation karmique est d\'apprendre que la vraie spiritualité n\'est pas l\'échappée du monde mais sa sanctification. Cela demande d\'honorer le corps, les besoins humains et les limites terre-à-terre sans les juger comme "moins spirituels"',
        'Protection de l\'hypersensibilité empathique : Votre perméabilité énergétique exceptionnelle peut vous amener à absorber les états émotionnels d\'autrui au point de perdre contact avec vos propres frontières. Ce pattern, possiblement développé dans l\'enfance pour survivre émotionnellement dans un environnement dysfonctionnel, nécessite maintenant d\'apprendre la compassion avec limites. Le défi est de rester ouvert sans vous dissoudre',
        'Intégration de l\'ombre pour la puissance complète : Votre quête de lumière spirituelle peut avoir créé une ombre considérable de parts refoulées considérées comme "non-spirituelles" - colère, agressivité, désirs égoïques, pouvoir. L\'invitation jungienne est de reconnaître que votre pleine puissance nécessite l\'intégration de ces énergies rejetées. Ce qui résiste persiste; ce qui est accepté peut être transformé',
        'Navigation du paradoxe profondeur-isolation : Votre besoin de profondeur authentique dans un monde dominé par la superficialité peut créer un sentiment douloureux d\'isolation et d\'inadéquation. Le défi spirituel est d\'honorer votre unicité sans tomber dans la supériorité spirituelle, et de trouver votre tribu âme sans rejeter le reste de l\'humanité. La leçon est que même dans l\'incompréhension, vous n\'êtes jamais vraiment seul',
        'Équilibre attachement sacré et détachement libérateur : Votre chemin spirituel vous demande de maîtriser le paradoxe entre l\'engagement profond dans les relations et la liberté intérieure du non-attachement. Trop d\'attachement crée la souffrance; trop de détachement empêche l\'intimité. La voie du milieu taoïste est d\'aimer pleinement tout en restant libre, de s\'engager totalement tout en acceptant l\'impermanence'
      ],
      recommendations: [
        'Exploration astrologique approfondie : Investissez dans une lecture complète de votre thème natal avec un astrologue évolutif spécialisé en relations. Étudiez particulièrement votre Vénus (style amoureux), Mars (désir et assertion), Lune (besoins émotionnels), et les nœuds lunaires (chemin karmique). Comprenez vos aspects Pluton (transformation) et Chiron (blessure guérisseuse). Cette carte cosmique vous donnera des clés précieuses sur vos dynamiques relationnelles inconscientes',
        'Thérapie transpersonnelle intégrative : Travaillez avec un thérapeute formé en psychologie des profondeurs qui intègre approches conventionnelles et spirituelles. Explorez vos patterns d\'attachement non seulement dans cette vie mais aussi les dynamiques transgénérationnelles transmises inconsciemment par votre lignée. Considérez des modalités comme la Gestalt, l\'EMDR pour les traumas, ou la psychologie jungienne pour l\'intégration de l\'ombre',
        'Pratiques de compassion envers soi : Développez une pratique quotidienne de méditation metta (bienveillance aimante) dirigée vers vos différentes versions temporelles - l\'enfant blessé, l\'adolescent perdu, les versions passées qui ont fait du mieux qu\'elles pouvaient. Cette pratique guérit les fractures intérieures et cultive l\'auto-parentage spirituel essentiel à des relations matures',
        'Rituels de connexion sacrée : Créez des pratiques relationnelles qui honorent la dimension spirituelle de la rencontre. Cela peut inclure des méditations partagées, des cercles de parole sacrée, des rituels saisonniers, ou simplement des moments intentionnels de présence profonde. Ces pratiques ancrent votre besoin de sacré dans le quotidien relationnel',
        'Étude de l\'alchimie relationnelle : Plongez dans les enseignements sur les relations conscientes - archétypes jungiens (anima/animus), tantra (union des polarités), dynamiques créateur-créature des Kabbalistes, ou travail des parts de Schwartz (IFS). Ces cartographies psycho-spirituelles vous fourniront un langage pour nommer et naviguer la complexité relationnelle',
        'Développement de l\'intuition somatique : Puisque votre sensibilité est principalement énergétique/psychique, apprenez à lire aussi les signaux de votre corps physique. Des pratiques comme le yoga sensible, la danse authentique, ou la thérapie somatique vous aideront à ancrer votre conscience dans votre corps, créant une intuition incarnée plutôt que dissociée',
        'Pratiques de protection énergétique : Développez des rituels quotidiens de nettoyage et protection énergétique - visualisations de bulles de lumière, bains aux sels, fumigation de sauge, travail avec les cristaux. Ces pratiques, bien que "ésotériques", sont essentielles pour maintenir votre clarté énergétique dans un monde émotionnellement chargé'
      ],
      compatibility: [
        'Âmes avec attachement sécure et travail thérapeutique approfondi : Vous avez besoin de partenaires qui ont fait leur propre travail d\'ombre et développé un attachement sécure à travers la thérapie. Ces personnes peuvent tenir l\'espace pour votre profondeur sans être déstabilisées, et offrir la stabilité émotionnelle qui équilibre votre sensibilité',
        'Chercheurs spirituels conscients et incarnés : Des êtres sur un chemin spirituel actif mais qui évitent le by-pass spirituel - ceux qui méditent ET vont en thérapie, qui lisent des textes sacrés ET font leur déclaration d\'impôts. Cette combinaison de conscience spirituelle et responsabilité terrestre résonne avec votre propre quête d\'incarnation',
        'Artistes, thérapeutes et visionnaires sensibles : Des personnes dont la vocation implique la sensibilité, la créativité et le service. Leur compréhension naturelle de la dimension subtile de l\'existence facilite la communication au-delà des mots et honore votre besoin de connexions qui touchent l\'âme',
        'Êtres valorisant authenticité, vulnérabilité et croissance continue : Des partenaires qui voient les relations comme un chemin de croissance mutuelle plutôt que comme un refuge confortable. Ceux qui sont prêts à faire le travail difficile de confronter leurs patterns, communiquer authentiquement même quand c\'est inconfortable, et évoluer ensemble dans le respect des chemins individuels'
      ]
    }
  };

  const content = tierSpecificContent[tier];

  return {
    title: baseAnalysis.title,
    subtitle: baseAnalysis.subtitle,
    analysis: baseAnalysis.analysis,
    strengths: content.strengths,
    challenges: content.challenges,
    recommendations: content.recommendations,
    compatibility: tier === 'premium_elite' ? content.compatibility : undefined,
    percentage
  };
};

export const saveQuizResult = async (
  userId: string,
  quizIdOrQuiz: string | Quiz,
  answersOrResult?: QuizAnswer[] | any,
  analysisOrNothing?: AnalysisResult
): Promise<boolean> => {
  try {
    // Déterminer quel format on a reçu
    let quizId: string;
    let quizName: string;
    let resultData: any;

    if (typeof quizIdOrQuiz === 'string') {
      // Format: saveQuizResult(userId, quizId, resultData)
      quizId = quizIdOrQuiz;
      quizName = answersOrResult?.quiz_name || quizIdOrQuiz;
      resultData = answersOrResult;
    } else {
      // Format: saveQuizResult(userId, quiz, answers, analysis)
      quizId = quizIdOrQuiz.id;
      quizName = quizIdOrQuiz.name || quizIdOrQuiz.title || quizIdOrQuiz.id;
      
      const answers = answersOrResult;
      const analysis = analysisOrNothing;
      
      resultData = {
        quiz_name: quizName,
        result_title: analysis?.title,
        result_subtitle: analysis?.subtitle,
        result_data: {
          analysis: analysis?.analysis,
          strengths: analysis?.strengths,
          challenges: analysis?.challenges,
          recommendations: analysis?.recommendations,
          compatibility: analysis?.compatibility
        },
        answers: answers,
        percentage: analysis?.percentage
      };
    }

    // Préparer l'objet pour insertion
    const insertData: any = {
      user_id: userId,
      quiz_id: quizId,
      quiz_name: resultData.quiz_name || quizName,
      result_title: resultData.result_title || resultData.title || 'Résultat',
      result_subtitle: resultData.result_subtitle || resultData.subtitle || '',
      percentage: resultData.percentage || 0
    };

    // Gérer result_data
    if (resultData.result_data) {
      insertData.result_data = resultData.result_data;
    } else if (resultData.analysis) {
      insertData.result_data = {
        analysis: resultData.analysis,
        strengths: resultData.strengths,
        challenges: resultData.challenges,
        recommendations: resultData.recommendations,
        compatibility: resultData.compatibility
      };
    }

    // Gérer answers
    if (resultData.answers) {
      insertData.answers = resultData.answers;
    }

    // AI analyses
    if (resultData.ai_analysis) {
      insertData.ai_analysis = resultData.ai_analysis;
    }
    if (resultData.ai_analysis_advanced) {
      insertData.ai_analysis_advanced = resultData.ai_analysis_advanced;
    }
    if (resultData.ai_analysis_elite) {
      insertData.ai_analysis_elite = resultData.ai_analysis_elite;
    }

    console.log('[saveQuizResult] Insertion:', { quizId, userId, insertData });

    const { error } = await supabase.from('quiz_results').insert(insertData);

    if (error) {
      console.error('[saveQuizResult] Error saving quiz result:', error);
      return false;
    }

    console.log('[saveQuizResult] ✅ Résultat sauvegardé !');
    return true;
  } catch (error) {
    console.error('[saveQuizResult] Error in saveQuizResult:', error);
    return false;
  }
};

export const getUserQuizResults = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quiz results:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserQuizResults:', error);
    return [];
  }
};

export const getQuizResult = async (userId: string, quizId: string) => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching quiz result:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getQuizResult:', error);
    return null;
  }
};
