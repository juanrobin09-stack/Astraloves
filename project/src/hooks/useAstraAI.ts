import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AIInsight {
  id: string;
  insight_type: string;
  message: string;
  data: any;
  priority: number;
  displayed: boolean;
  created_at: string;
}

interface UserPreferences {
  learned_preferences: {
    preferred_age_range?: [number, number];
    preferred_interests?: string[];
    preferred_traits?: string[];
  };
  attractiveness_score: number;
  fatigue_score: number;
}

export function useAstraAI() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  // Charger les insights non affichés
  const loadInsights = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('astra_ai_insights')
      .select('*')
      .eq('user_id', user.id)
      .eq('displayed', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setInsights(data);
    }
  }, [user]);

  // Charger les préférences
  const loadPreferences = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('astra_user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setPreferences(data);
    } else {
      // Créer entrée par défaut
      const { data: newPref } = await supabase
        .from('astra_user_preferences')
        .insert({
          user_id: user.id,
          learned_preferences: {},
          attractiveness_score: 50,
          fatigue_score: 0
        })
        .select()
        .maybeSingle();

      if (newPref) {
        setPreferences(newPref);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadInsights();
      loadPreferences();
    }
  }, [user, loadInsights, loadPreferences]);

  // Enregistrer un swipe avec analytics
  const recordSwipe = async (
    swipedUserId: string,
    direction: 'left' | 'right' | 'super',
    timeSpentMs: number,
    hesitationCount: number,
    swipeVelocity: number,
    profileTraits: any
  ) => {
    if (!user) return;

    setLoading(true);

    try {
      // Calculer score d'intérêt
      const { data: scoreData } = await supabase.rpc('calculate_interest_score', {
        p_direction: direction,
        p_time_spent_ms: timeSpentMs,
        p_hesitation_count: hesitationCount,
        p_swipe_velocity: swipeVelocity
      });

      const interestScore = scoreData || 50;

      // Enregistrer swipe analytics
      await supabase.from('astra_swipe_analytics').insert({
        user_id: user.id,
        swiped_user_id: swipedUserId,
        direction,
        interest_score: interestScore,
        time_spent_ms: timeSpentMs,
        hesitation_count: hesitationCount,
        swipe_velocity: swipeVelocity,
        profile_traits: profileTraits
      });

      // Détecter fatigue
      const { data: fatigueDetected } = await supabase.rpc('detect_swipe_fatigue', {
        p_user_id: user.id
      });

      if (fatigueDetected) {
        await supabase.rpc('generate_ai_insight', {
          p_user_id: user.id,
          p_insight_type: 'fatigue',
          p_message: '🧠 Astra détecte une fatigue. Pause stratégique ?\n💡 Conseil : optimise ton profil (photo/bio) → +47% matchs',
          p_data: { fatigue_score: 80 },
          p_priority: 9
        });
      }

      // Analyser patterns après 10 swipes
      const { data: swipeCount } = await supabase
        .from('astra_swipe_analytics')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (swipeCount && swipeCount.length >= 10 && swipeCount.length % 10 === 0) {
        await analyzeSwipePatterns();
      }

      await loadInsights();
      await loadPreferences();
    } catch (error) {
      console.error('Error recording swipe:', error);
    } finally {
      setLoading(false);
    }
  };

  // Analyser les patterns de swipe
  const analyzeSwipePatterns = async () => {
    if (!user) return;

    try {
      const { data: recentSwipes } = await supabase
        .from('astra_swipe_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!recentSwipes || recentSwipes.length < 10) return;

      // Analyser préférences d'âge
      const rightSwipes = recentSwipes.filter(s => s.direction === 'right' || s.direction === 'super');
      const ages = rightSwipes.map(s => s.profile_traits?.age).filter(Boolean);

      if (ages.length > 0) {
        const avgAge = ages.reduce((a, b) => a + b, 0) / ages.length;
        const message = `🎯 Astra analyse : tu préfères les profils autour de ${Math.round(avgAge)} ans`;

        await supabase.rpc('generate_ai_insight', {
          p_user_id: user.id,
          p_insight_type: 'preference',
          p_message: message,
          p_data: { preferred_age: Math.round(avgAge) },
          p_priority: 7
        });
      }

      // Analyser intérêts communs
      const interests: Record<string, number> = {};
      rightSwipes.forEach(swipe => {
        const profileInterests = swipe.profile_traits?.interests || [];
        profileInterests.forEach((interest: string) => {
          interests[interest] = (interests[interest] || 0) + 1;
        });
      });

      const topInterests = Object.entries(interests)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([interest]) => interest);

      if (topInterests.length > 0) {
        const message = `✨ Pattern détecté : tu likes souvent ${topInterests.join(', ')}`;

        await supabase.rpc('generate_ai_insight', {
          p_user_id: user.id,
          p_insight_type: 'preference',
          p_message: message,
          p_data: { top_interests: topInterests },
          p_priority: 6
        });
      }

      // Calculer score attractivité
      const avgInterestScore = recentSwipes
        .filter(s => s.direction === 'right' || s.direction === 'super')
        .reduce((sum, s) => sum + s.interest_score, 0) / rightSwipes.length || 50;

      await supabase
        .from('astra_user_preferences')
        .update({
          attractiveness_score: Math.round(avgInterestScore),
          learned_preferences: {
            preferred_interests: topInterests,
            preferred_age_range: ages.length > 0 ? [Math.min(...ages), Math.max(...ages)] : undefined
          }
        })
        .eq('user_id', user.id);

    } catch (error) {
      console.error('Error analyzing patterns:', error);
    }
  };

  // Marquer insight comme affiché
  const markInsightDisplayed = async (insightId: string) => {
    await supabase
      .from('astra_ai_insights')
      .update({ displayed: true })
      .eq('id', insightId);

    setInsights(prev => prev.filter(i => i.id !== insightId));
  };

  // Obtenir suggestions de profils
  const getAISuggestions = async (count: number = 3) => {
    if (!user || !preferences) return [];

    try {
      // Récupérer profils avec score de vérification élevé
      const { data: profiles } = await supabase
        .from('astra_profiles')
        .select(`
          *,
          verification:astra_profile_verification(verification_score, verified_badge)
        `)
        .neq('id', user.id)
        .limit(count * 3);

      if (!profiles) return [];

      // Scorer chaque profil basé sur préférences apprises
      const scoredProfiles = profiles.map(profile => {
        let score = 50; // Base score

        // Bonus si âge dans la fourchette préférée
        const preferredAgeRange = preferences.learned_preferences?.preferred_age_range;
        if (preferredAgeRange && profile.age >= preferredAgeRange[0] && profile.age <= preferredAgeRange[1]) {
          score += 20;
        }

        // Bonus intérêts communs
        const preferredInterests = preferences.learned_preferences?.preferred_interests || [];
        const profileInterests = profile.interests || [];
        const commonInterests = preferredInterests.filter(i => profileInterests.includes(i));
        score += commonInterests.length * 10;

        // Bonus vérification
        if (profile.verification?.[0]?.verification_score > 70) {
          score += 15;
        }

        return { ...profile, ai_compatibility_score: Math.min(score, 100) };
      });

      // Trier et retourner top N
      return scoredProfiles
        .sort((a, b) => b.ai_compatibility_score - a.ai_compatibility_score)
        .slice(0, count);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return [];
    }
  };

  return {
    insights,
    preferences,
    loading,
    recordSwipe,
    markInsightDisplayed,
    getAISuggestions,
    loadInsights,
    loadPreferences
  };
}
