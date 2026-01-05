import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Sparkles, MessageCircle, Crown, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type CompatibilityPageProps = {
  matchUserId: string;
  onBack: () => void;
};

type CompatibilityData = {
  overall_percentage: number;
  attachment_percentage: number;
  archetype_percentage: number;
  needs_percentage: number;
  astral_percentage: number;
  astra_analysis: string;
};

export default function CompatibilityPage({ matchUserId, onBack }: CompatibilityPageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [matchProfile, setMatchProfile] = useState<any>(null);
  const [compatibility, setCompatibility] = useState<CompatibilityData | null>(null);
  const [animateBar, setAnimateBar] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: profile } = await supabase
      .from('astra_profiles')
      .select('*')
      .eq('id', matchUserId)
      .maybeSingle();

    setMatchProfile(profile);

    const { data: existing } = await supabase
      .from('compatibility_matches')
      .select('*')
      .eq('user_id', user!.id)
      .eq('match_user_id', matchUserId)
      .maybeSingle();

    if (existing) {
      setCompatibility(existing);
      setLoading(false);
      setTimeout(() => setAnimateBar(true), 300);
      setTimeout(() => setShowAnalysis(true), 1500);
    } else {
      await calculateCompatibility();
    }
  };

  const calculateCompatibility = async () => {
    setCalculating(true);

    const { data: myResults } = await supabase
      .from('questionnaire_results')
      .select('*')
      .eq('user_id', user!.id);

    const { data: theirResults } = await supabase
      .from('questionnaire_results')
      .select('*')
      .eq('user_id', matchUserId);

    const attachmentScore = calculateCriteriaScore(myResults, theirResults, 'attachment');
    const archetypeScore = calculateCriteriaScore(myResults, theirResults, 'archetype');
    const needsScore = calculateCriteriaScore(myResults, theirResults, 'needs');
    const astralScore = calculateCriteriaScore(myResults, theirResults, 'astral');

    const overallScore = Math.round((attachmentScore + archetypeScore + needsScore + astralScore) / 4);

    const analysis = await generateAstraAnalysis(
      matchProfile,
      overallScore,
      attachmentScore,
      archetypeScore,
      needsScore,
      astralScore,
      myResults,
      theirResults
    );

    const compatibilityData: CompatibilityData = {
      overall_percentage: overallScore,
      attachment_percentage: attachmentScore,
      archetype_percentage: archetypeScore,
      needs_percentage: needsScore,
      astral_percentage: astralScore,
      astra_analysis: analysis
    };

    await supabase
      .from('compatibility_matches')
      .insert({
        user_id: user!.id,
        match_user_id: matchUserId,
        ...compatibilityData
      });

    setCompatibility(compatibilityData);
    setCalculating(false);
    setLoading(false);
    setTimeout(() => setAnimateBar(true), 300);
    setTimeout(() => setShowAnalysis(true), 1500);
  };

  const calculateCriteriaScore = (myResults: any[], theirResults: any[], type: string): number => {
    const myResult = myResults?.find(r => r.questionnaire_type === type);
    const theirResult = theirResults?.find(r => r.questionnaire_type === type);

    if (!myResult || !theirResult) return 50;

    const myAnswers = myResult.answers || {};
    const theirAnswers = theirResult.answers || {};

    const commonKeys = Object.keys(myAnswers).filter(key => key in theirAnswers);
    if (commonKeys.length === 0) return 50;

    let matchCount = 0;
    commonKeys.forEach(key => {
      const myAnswer = myAnswers[key];
      const theirAnswer = theirAnswers[key];

      if (typeof myAnswer === 'number' && typeof theirAnswer === 'number') {
        const diff = Math.abs(myAnswer - theirAnswer);
        const maxDiff = 5;
        matchCount += (1 - diff / maxDiff);
      } else if (myAnswer === theirAnswer) {
        matchCount += 1;
      } else {
        matchCount += 0.3;
      }
    });

    const score = Math.round((matchCount / commonKeys.length) * 100);
    return Math.min(Math.max(score, 30), 98);
  };

  const generateAstraAnalysis = async (
    profile: any,
    overall: number,
    attachment: number,
    archetype: number,
    needs: number,
    astral: number,
    myResults: any[],
    theirResults: any[]
  ): Promise<string> => {
    const compatibilityLevel = overall >= 80 ? 'exceptionnelle' : overall >= 65 ? 'très forte' : overall >= 50 ? 'prometteuse' : 'intéressante';

    const prompt = `Tu es Astra, coach en amour experte. Analyse la compatibilité amoureuse entre moi et ${profile.pseudo}.

Score global: ${overall}%
- Style d'attachement: ${attachment}%
- Archétype amoureux: ${archetype}%
- Besoins amoureux: ${needs}%
- Thème astral: ${astral}%

Rédige une analyse détaillée de 600-800 mots qui couvre:

1. Vision d'ensemble de votre compatibilité (2-3 paragraphes)
2. Analyse détaillée de chaque critère avec exemples concrets
3. Forces de votre relation potentielle
4. Points d'attention et comment les gérer
5. Conseils pratiques pour construire une relation harmonieuse
6. Conclusion inspirante et encourageante

Ton ton est chaleureux, professionnel, et encourageant. Utilise "tu" et "vous" pour créer une connexion. Sois précise et donne des conseils actionnables.`;

    try {
      const { data, error } = await supabase.functions.invoke('astra-chat', {
        body: {
          message: prompt,
          conversationHistory: []
        }
      });

      if (error) throw error;
      return data.response || 'Analyse en cours de génération...';
    } catch (error) {
      console.error('Error generating analysis:', error);
      return `Votre compatibilité avec ${profile.pseudo} est ${compatibilityLevel} avec un score de ${overall}%.

**Analyse de votre compatibilité**

Vous partagez une connexion intéressante qui mérite d'être explorée. Votre score global de ${overall}% indique une base solide pour construire une relation significative.

**Style d'attachement (${attachment}%)**
Votre façon de créer des liens émotionnels montre ${attachment >= 70 ? 'une excellente harmonie' : 'des différences qui peuvent être complémentaires'}. ${attachment >= 70 ? 'Vous comprenez intuitivement les besoins affectifs de l\'autre, ce qui facilite la création d\'un lien sécurisant.' : 'Ces différences offrent l\'opportunité de grandir ensemble en apprenant de vos approches respectives de l\'intimité.'}

**Archétype amoureux (${archetype}%)**
Vos personnalités amoureuses ${archetype >= 70 ? 's\'alignent naturellement' : 'présentent des contrastes enrichissants'}. ${archetype >= 70 ? 'Cette synergie crée une dynamique fluide où chacun se sent compris et valorisé.' : 'Ces contrastes peuvent apporter équilibre et nouveauté dans la relation, à condition de respecter les différences de chacun.'}

**Besoins amoureux (${needs}%)**
Vos attentes en amour ${needs >= 70 ? 'convergent admirablement' : 'montrent des priorités différentes'}. ${needs >= 70 ? 'Cette compatibilité facilite la satisfaction mutuelle et réduit les malentendus potentiels.' : 'Comprendre et honorer les besoins spécifiques de l\'autre sera clé pour construire une relation épanouissante.'}

**Thème astral (${astral}%)**
Vos énergies cosmiques ${astral >= 70 ? 'vibrent en harmonie' : 'créent une dynamique unique'}. ${astral >= 70 ? 'Cette connexion astrologique soutient naturellement votre relation et favorise une compréhension profonde.' : 'Ces différences astrologiques peuvent enrichir votre relation par la complémentarité des énergies.'}

**Forces de votre connexion**

${overall >= 75 ?
  'Vous avez tous les ingrédients pour une relation profonde et durable. Votre compatibilité élevée suggère une compréhension mutuelle naturelle, des valeurs alignées, et une capacité à naviguer ensemble les défis de la vie. Vous vous comprenez intuitivement et partagez une vision similaire de l\'amour.' :
  'Votre connexion repose sur une base intéressante qui mérite d\'être explorée. Vous avez l\'opportunité de créer quelque chose de spécial en investissant dans la communication et la compréhension mutuelle. Vos différences peuvent devenir vos plus grandes forces si vous les abordez avec ouverture et curiosité.'}

**Points d'attention**

${overall >= 75 ?
  'Même avec une forte compatibilité, toute relation demande de l\'attention. Continuez à communiquer ouvertement, à célébrer vos différences, et à cultiver intentionnellement votre connexion. Ne prenez pas votre harmonie naturelle pour acquise, mais nourrissez-la activement.' :
  'Les différences dans vos scores suggèrent des domaines qui nécessiteront plus de communication et de compréhension mutuelle. Soyez patients l\'un envers l\'autre, exprimez clairement vos besoins, et restez curieux de comprendre la perspective de l\'autre. Ces efforts porteront leurs fruits.'}

**Conseils pratiques**

1. **Communication authentique**: Partagez régulièrement vos sentiments, besoins et rêves. La transparence renforce la confiance.

2. **Respect des différences**: Célébrez ce qui vous rend uniques. Les différences enrichissent une relation quand elles sont honorées.

3. **Moments de qualité**: Créez intentionnellement des espaces pour vous connecter profondément, sans distractions.

4. **Croissance commune**: Grandissez ensemble en vous soutenant mutuellement dans vos aspirations personnelles.

5. **Patience et empathie**: Donnez-vous le temps de vraiment vous connaître. Les meilleures connexions se construisent progressivement.

**Conclusion**

Votre compatibilité avec ${profile.pseudo} offre ${overall >= 75 ? 'un potentiel exceptionnel' : 'des perspectives prometteuses'} pour une relation authentique et épanouissante. ${overall >= 75 ? 'Vous avez trouvé quelqu\'un avec qui vous vibrez naturellement, ce qui est rare et précieux.' : 'Chaque relation est une aventure unique, et la vôtre a ses propres forces à découvrir.'}

L\'important est d\'aborder cette connexion avec authenticité, ouverture et intention. Que vous construisiez une amitié profonde ou une romance passionnée, vous avez l\'opportunité de créer quelque chose de significatif ensemble.

N\'ayez pas peur de faire le premier pas. Les plus belles histoires commencent souvent par un simple "Bonjour, j\'aimerais mieux te connaître". Bonne chance dans cette aventure ! 💫`;
    }
  };

  const handleSendMessage = async () => {
    const userId1 = user!.id < matchUserId ? user!.id : matchUserId;
    const userId2 = user!.id < matchUserId ? matchUserId : user!.id;

    const { data: existingConvo } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_one_id', userId1)
      .eq('user_two_id', userId2)
      .maybeSingle();

    let conversationId = existingConvo?.id;

    if (!conversationId) {
      const { data: newConvo } = await supabase
        .from('conversations')
        .insert({
          user_one_id: userId1,
          user_two_id: userId2
        })
        .select('id')
        .single();

      conversationId = newConvo?.id;
    }

    if (conversationId) {
      const message = `Salut ${matchProfile?.pseudo} ! J'ai découvert qu'on a une compatibilité de ${compatibility?.overall_percentage}% sur Astra. J'ai été vraiment intrigué(e) par ton profil et j'aimerais beaucoup échanger avec toi. Qu'en penses-tu ? 😊`;

      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user!.id,
          receiver_id: matchUserId,
          content: message
        });

      window.location.hash = '#messages';
      window.location.reload();
    }
  };

  if (loading || calculating) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6">
          <Loader className="w-20 h-20 text-white animate-spin" />
          <p className="text-2xl text-white font-semibold">
            {calculating ? 'Astra calcule votre compatibilité...' : 'Chargement...'}
          </p>
          <p className="text-white/70 text-center max-w-md">
            Analyse de vos questionnaires en cours...
          </p>
        </div>
      </div>
    );
  }

  if (!compatibility) return null;

  const criteria = [
    { label: 'Style d\'attachement', percentage: compatibility.attachment_percentage, icon: Heart },
    { label: 'Archétype amoureux', percentage: compatibility.archetype_percentage, icon: Crown },
    { label: 'Besoins amoureux', percentage: compatibility.needs_percentage, icon: Sparkles },
    { label: 'Thème astral', percentage: compatibility.astral_percentage, icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#0A0A0A] p-3 sm:p-6 pb-20">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 sm:mb-6 flex items-center gap-2 text-white hover:text-pink-200 transition-colors touch-target"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          Retour
        </button>

        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-base sm:text-xl font-bold text-white">
                {matchProfile?.pseudo?.charAt(0).toUpperCase()}
              </span>
            </div>
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-pink-300 flex-shrink-0" />
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-800 to-black rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-base sm:text-xl font-bold text-white">Toi</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 tracking-wide px-4">
            Compatibilité avec {matchProfile?.pseudo}
          </h1>

          <div className="max-w-md mx-auto px-4">
            <div className="relative h-24 sm:h-32 bg-white/10 rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
              <div
                className={`absolute inset-0 bg-gradient-to-r from-red-600 via-red-700 to-red-900 transition-all duration-2000 ease-out ${
                  animateBar ? '' : 'w-0'
                }`}
                style={{ width: animateBar ? `${compatibility.overall_percentage}%` : '0%' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-5xl sm:text-7xl md:text-8xl font-black text-white drop-shadow-2xl transition-all duration-700 ${
                  animateBar ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}>
                  {compatibility.overall_percentage}%
                </span>
              </div>
            </div>

            <p className={`text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-6 sm:mt-8 tracking-wider transition-all duration-700 delay-300 ${
              animateBar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {compatibility.overall_percentage >= 80 ? 'Exceptionnelle' :
               compatibility.overall_percentage >= 65 ? 'Très forte' :
               compatibility.overall_percentage >= 50 ? 'Prometteuse' : 'Intéressante'}
            </p>
            <p className={`text-lg text-white/80 mt-4 transition-all duration-700 delay-500 ${
              animateBar ? 'opacity-100' : 'opacity-0'
            }`}>
              Votre compatibilité amoureuse
            </p>
          </div>
        </div>

        <div className={`grid grid-cols-2 gap-4 mb-12 transition-all duration-700 delay-700 ${
          animateBar ? 'opacity-100' : 'opacity-0'
        }`}>
          {criteria.map((criterion, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center"
            >
              <criterion.icon className="w-8 h-8 text-pink-300 mx-auto mb-3" />
              <p className="text-white/70 text-sm mb-2">{criterion.label}</p>
              <p className="text-3xl font-bold text-white">{criterion.percentage}%</p>
            </div>
          ))}
        </div>

        <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 transition-all duration-700 delay-1000 ${
          showAnalysis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-pink-300" />
            <h2 className="text-2xl font-bold text-white">Analyse d'Astra</h2>
          </div>
          <div className="text-white/90 leading-relaxed space-y-4 whitespace-pre-line">
            {compatibility.astra_analysis}
          </div>
        </div>

        <button
          onClick={handleSendMessage}
          className={`w-full bg-gradient-to-r from-[#E0115F] to-[#FF0033] text-white font-bold py-6 px-8 rounded-3xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 text-lg ${
            showAnalysis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <MessageCircle className="w-6 h-6" />
          Envoyer un message à {matchProfile?.pseudo}
        </button>
      </div>
    </div>
  );
}
