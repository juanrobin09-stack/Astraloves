import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import QuestionnaireAnalysis from './QuestionnaireAnalysis';

type ResultsPageProps = {
  resultId: string;
  onBack: () => void;
};

type QuestionnaireResult = {
  id: string;
  questionnaire_id: string;
  title: string;
  icon: string;
  answers: any;
  analysis: any;
  completed_at: string;
  can_retake_at: string;
};

export default function ResultsPage({ resultId, onBack }: ResultsPageProps) {
  const { user } = useAuth();
  const [result, setResult] = useState<QuestionnaireResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResult();
  }, [resultId]);

  const loadResult = async () => {
    try {
      const { data, error } = await supabase
        .from('astra_questionnaire_results')
        .select('*')
        .eq('id', resultId)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading result:', error);
      } else {
        setResult(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen velvet-bg relative overflow-hidden flex items-center justify-center">
        <div className="stars-bg absolute inset-0 opacity-30" />
        <div className="relative z-10 text-white">Chargement...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen velvet-bg relative overflow-hidden flex items-center justify-center">
        <div className="stars-bg absolute inset-0 opacity-30" />
        <div className="relative z-10 text-center">
          <p className="text-white text-xl mb-4">Résultat introuvable</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-[#E91E63] text-white rounded-full hover:bg-[#C2185B] transition-all"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <QuestionnaireAnalysis
      result={result}
      onBack={onBack}
    />
  );
}
