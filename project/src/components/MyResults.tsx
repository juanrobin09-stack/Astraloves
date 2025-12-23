import { useState, useEffect, useCallback } from 'react';
import { FileText, Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { questionnaires } from '../data/questionnaires';

type MyResultsProps = {
  onViewResult: (resultId: string) => void;
};

type QuestionnaireResult = {
  id: string;
  questionnaire_id: string;
  answers: any[];
  analysis: {
    raw?: string;
    generatedAt?: string;
    [key: string]: any;
  } | any;
  completed_at: string;
};

export default function MyResults({ onViewResult }: MyResultsProps) {
  console.log('[MyResults] Component mounting/rendering...');

  const { user } = useAuth();
  console.log('[MyResults] User from context:', user?.id);

  const [results, setResults] = useState<QuestionnaireResult[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('[MyResults] State initialized, loading:', loading, 'results:', results.length);

  const loadResults = useCallback(async () => {
    if (!user) {
      console.error('[MyResults] No user found!');
      setLoading(false);
      return;
    }

    try {
      console.log('[MyResults] ======================');
      console.log('[MyResults] Loading results for user:', user.id);
      console.log('[MyResults] User email:', user.email);

      // Test 1: Check if table exists and has ANY data
      const { data: allData, error: allError } = await supabase
        .from('astra_questionnaire_results')
        .select('*')
        .limit(10);

      console.log('[MyResults] Test - All data in table (first 10):', allData);
      console.log('[MyResults] Test - All data error:', allError);

      // Test 2: Get our user's data
      const { data, error, status, statusText } = await supabase
        .from('astra_questionnaire_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      console.log('[MyResults] Query status:', status, statusText);
      console.log('[MyResults] Query error:', error);
      console.log('[MyResults] Query data:', data);
      console.log('[MyResults] Number of results:', data?.length || 0);

      if (error) {
        console.error('[MyResults] Error loading results:', error);
        console.error('[MyResults] Error code:', error.code);
        console.error('[MyResults] Error details:', error.details);
        console.error('[MyResults] Error hint:', error.hint);
        alert(`Erreur de chargement : ${error.message}\nCode: ${error.code}`);
      } else {
        console.log('[MyResults] Results loaded successfully:', data);
        setResults(data || []);
      }
    } catch (error) {
      console.error('[MyResults] Exception:', error);
      alert(`Exception : ${error}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadResults();
    } else {
      setLoading(false);
    }
  }, [user, loadResults]);

  const extractMainResult = (analysisText: string | undefined) => {
    if (!analysisText) {
      console.warn('[MyResults] No analysis text provided');
      return 'Analyse complète disponible';
    }

    try {
      const lines = analysisText.split('\n');
      for (const line of lines) {
        if (line.includes('%') || line.includes('Score') || line.includes('Résultat')) {
          return line.trim();
        }
      }
    } catch (error) {
      console.error('[MyResults] Error extracting main result:', error);
    }

    return 'Analyse complète disponible';
  };

  console.log('[MyResults] Rendering, loading:', loading, 'results:', results.length);

  if (loading) {
    console.log('[MyResults] Showing loading state');
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Chargement de tes résultats...</div>
      </div>
    );
  }

  if (results.length === 0) {
    console.log('[MyResults] Showing empty state');
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Aucun résultat pour le moment</h3>
        <p className="text-gray-400">
          Commence par faire un questionnaire pour voir tes résultats ici !
        </p>
      </div>
    );
  }

  console.log('[MyResults] Rendering results list with', results.length, 'items');

  try {
    return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Mes résultats</h2>
        <p className="text-gray-400">
          Retrouve tous les questionnaires que tu as complétés et leurs analyses détaillées
        </p>
        <button
          onClick={() => { setLoading(true); loadResults(); }}
          className="mt-2 px-4 py-2 bg-[#E91E63] text-white rounded-lg hover:bg-[#C2185B] transition-all text-sm"
        >
          🔄 Recharger
        </button>
      </div>

      <div className="grid gap-4">
        {results.map((result) => {
          console.log('[MyResults] Rendering result:', result.id, 'questionnaire_id:', result.questionnaire_id);
          console.log('[MyResults] Result analysis:', result.analysis);

          const questionnaire = questionnaires[result.questionnaire_id];
          if (!questionnaire) {
            console.warn('[MyResults] Questionnaire not found for id:', result.questionnaire_id);
            return null;
          }

          const completedDate = new Date(result.completed_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          const mainResult = extractMainResult(result.analysis?.raw);

          return (
            <button
              key={result.id}
              onClick={() => onViewResult(result.id)}
              className="glass-card p-6 rounded-2xl text-left hover:bg-white/10 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E91E63] to-[#FF4081] flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#E91E63] transition-colors">
                        {questionnaire.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{completedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-[#E91E63] font-semibold">
                    <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{mainResult}</span>
                  </div>
                </div>

                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#E91E63] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
    );
  } catch (error) {
    console.error('[MyResults] Error rendering component:', error);
    return (
      <div className="text-center py-12 text-red-500">
        <h3 className="text-xl font-semibold mb-2">Erreur d'affichage</h3>
        <p className="text-sm">{String(error)}</p>
      </div>
    );
  }
}
