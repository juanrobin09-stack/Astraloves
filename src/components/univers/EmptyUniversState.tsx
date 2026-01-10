import { Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function EmptyUniversState() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue flex items-center justify-center">
          <Sparkles className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-display font-bold mb-3">
          Votre univers se prépare
        </h2>

        <p className="text-white/60 mb-6">
          Les astres alignent les âmes compatibles. Revenez bientôt pour découvrir votre constellation cosmique.
        </p>

        <div className="space-y-3">
          <Button onClick={() => navigate('/profile')} variant="primary" className="w-full">
            Compléter mon profil
          </Button>
          <Button onClick={() => navigate('/astro')} variant="secondary" className="w-full">
            Explorer mon thème astral
          </Button>
        </div>

        <p className="text-xs text-white/40 mt-6">
          💡 Astuce : Un profil complet attire plus d'âmes cosmiques
        </p>
      </div>
    </div>
  );
}
