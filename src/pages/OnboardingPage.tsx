import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/config/supabase';
import { toast } from 'react-hot-toast';
import { Step1Identity } from '@/components/onboarding/Step1Identity';
import { Step2Revelation } from '@/components/onboarding/Step2Revelation';
import { Step3Universe } from '@/components/onboarding/Step3Universe';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingPage() {
  const { profile, refreshProfile } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate('/univers', { replace: true });
    } else if (profile?.onboarding_step) {
      setStep(profile.onboarding_step);
    }
  }, [profile, navigate]);

  const handleNextStep = async () => {
    if (!profile?.id) {
      console.error('Profile ID missing');
      return;
    }

    const nextStep = step + 1;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_step: nextStep })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      setStep(nextStep);
      await refreshProfile();
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleComplete = async () => {
    if (!profile?.id) {
      console.error('Profile ID missing');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true, 
          onboarding_step: 3 
        })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      await refreshProfile();
      navigate('/univers', { replace: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Erreur lors de la finalisation');
    }
  };

  if (!profile) return <div className="h-screen flex items-center justify-center cosmic-gradient"><div className="animate-cosmic-pulse text-2xl">⭐</div></div>;

  return (
    <div className="h-screen cosmic-gradient overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <motion.div className="h-full bg-gradient-to-r from-cosmic-purple via-cosmic-blue to-cosmic-gold" initial={{ width: '0%' }} animate={{ width: `${(step / 3) * 100}%` }} transition={{ duration: 0.5 }} />
      </div>
      <AnimatePresence mode="wait">
        {step === 1 && <motion.div key="step1" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }} className="h-full"><Step1Identity onNext={handleNextStep} /></motion.div>}
        {step === 2 && <motion.div key="step2" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }} className="h-full"><Step2Revelation onNext={handleNextStep} /></motion.div>}
        {step === 3 && <motion.div key="step3" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }} className="h-full"><Step3Universe onComplete={handleComplete} /></motion.div>}
      </AnimatePresence>
    </div>
  );
}
