import { useState, useEffect } from 'react';
import { Sparkles, Star, FileText, Clock, Heart, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import PremiumQuestionnaireFlow from '../PremiumQuestionnaireFlow';
import QuestionnaireResultDetail from '../QuestionnaireResultDetail';
import { analyzeAttachment, analyzeArchetype, generateAstralTheme } from '../../lib/questionnaireAnalysis';

interface QuestionnairesViewProps {
  onNavigate?: (page: string) => void;
  onBack?: () => void;
}

export default function QuestionnairesView({ onNavigate, onBack }: QuestionnairesViewProps) {
  const { user } = useAuth();
  const [activeQuestionnaireId, setActiveQuestionnaireId] = useState<string | null>(null);
  const [viewingResult, setViewingResult] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);

    const { data: profileData } = await supabase
      .from('astra_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
    }

    const { data: resultsData } = await supabase
      .from('astra_questionnaire_results')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (resultsData) {
      setResults(resultsData);
    }

    setLoading(false);
  };

  if (viewingResult) {
    const questionnaireType = viewingResult.questionnaire_id === 'attachement' ? 'attachment' :
                              viewingResult.questionnaire_id === 'archetype' ? 'archetype' : 'astral';

    let analysis;
    if (questionnaireType === 'attachment') {
      analysis = analyzeAttachment(viewingResult.answers || {});
    } else if (questionnaireType === 'archetype') {
      analysis = analyzeArchetype(viewingResult.answers || {});
    } else {
      analysis = generateAstralTheme({ date: '', time: '', city: '' });
    }

    return (
      <QuestionnaireResultDetail
        type={questionnaireType}
        analysis={analysis}
        onBack={() => setViewingResult(null)}
      />
    );
  }

  if (activeQuestionnaireId) {
    return (
      <PremiumQuestionnaireFlow
        questionnaireId={activeQuestionnaireId}
        onBack={() => {
          setActiveQuestionnaireId(null);
          loadData();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  const questionnaires = [
    { id: 'attachment', title: 'Style d\'attachement', icon: '💕', description: 'Comment tu fonctionnes en relation', color: 'from-pink-600 to-red-600' },
    { id: 'archetype', title: 'Archétype', icon: '👑', description: 'Ta personnalité profonde', color: 'from-purple-600 to-pink-600' },
    { id: 'astral', title: 'Thème astral', icon: '🔮', description: 'Ta carte natale complète', color: 'from-blue-600 to-purple-600' },
  ];

  const hasResult = (qId: string) => results.some(r => r.questionnaire_id === qId);

  return (
    <div className="flex-1 flex flex-col bg-black h-full">
      {/* Header fixe */}
      <div className="p-4 border-b border-red-900/30 bg-gradient-to-br from-black via-gray-900/50 to-black backdrop-blur-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 hover:bg-gray-800 rounded-full transition"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
          )}
          <Sparkles className="text-yellow-500" size={24} />
          <h2 className="text-white font-bold text-xl">Questionnaires Astra</h2>
        </div>
        <p className="text-gray-400 text-sm">
          Découvre-toi à travers l'astrologie et la psychologie
        </p>
      </div>

      {/* Zone scrollable avec scrollbar personnalisée */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#ef4444 #1a1a1a'
      }}>
        {/* Résultats complétés */}
        {results.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <Star className="text-yellow-500" size={20} />
              Mes Analyses
            </h3>
            <div className="space-y-4">
              {results.map((result) => {
                const qInfo = questionnaires.find(q => q.id === result.questionnaire_id);
                if (!qInfo) return null;

                return (
                  <div
                    key={result.id}
                    className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/40 rounded-xl p-5 hover:border-yellow-500/60 transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-4xl">{qInfo.icon}</div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg">{qInfo.title}</h4>
                        <p className="text-gray-400 text-sm">{qInfo.description}</p>
                      </div>
                    </div>

                    {result.results?.primary_result && (
                      <div className="bg-black/40 border border-white/10 rounded-lg p-4 mb-3">
                        <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-red-400 rounded-full font-semibold text-sm mb-2">
                          {result.results.primary_result}
                        </div>
                        {result.results?.description && (
                          <p className="text-gray-300 text-sm mt-2">
                            {result.results.description.slice(0, 150)}...
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => setViewingResult(result)}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <FileText size={16} />
                      Voir analyse complète
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Questionnaires disponibles */}
        <div>
          <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <Sparkles className="text-yellow-500" size={20} />
            Questionnaires Disponibles
          </h3>
          <div className="space-y-4">
            {questionnaires.map((q) => {
              const completed = hasResult(q.id);
              return (
                <div
                  key={q.id}
                  className={`bg-gray-900 border rounded-xl p-5 transition ${
                    completed
                      ? 'border-green-600/30'
                      : 'border-red-900/30 hover:border-red-900/50'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">{q.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-lg">{q.title}</h4>
                      <p className="text-gray-400 text-sm">{q.description}</p>
                    </div>
                  </div>

                  {completed ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const result = results.find(r => r.questionnaire_id === q.id);
                          if (result) setViewingResult(result);
                        }}
                        className="flex-1 px-4 py-2.5 bg-green-600/20 border border-green-600/30 text-green-400 rounded-lg font-semibold hover:bg-green-600/30 transition flex items-center justify-center gap-2"
                      >
                        <FileText size={16} />
                        Voir résultat
                      </button>
                      <button
                        onClick={() => setActiveQuestionnaireId(q.id)}
                        className="px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 transition"
                      >
                        Refaire
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveQuestionnaireId(q.id)}
                      className={`w-full px-4 py-3 bg-gradient-to-r ${q.color} text-white rounded-lg font-bold hover:opacity-90 transition flex items-center justify-center gap-2`}
                    >
                      <Heart size={18} />
                      Commencer le questionnaire
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!profile?.is_premium && (
          <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-600/30 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">💎</div>
            <h3 className="text-white font-bold text-lg mb-2">
              Accède à plus d'analyses
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Deviens Premium pour débloquer des questionnaires exclusifs
            </p>
            <button
              onClick={() => onNavigate?.('premium')}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black rounded-lg font-bold transition"
            >
              Découvrir Premium
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
