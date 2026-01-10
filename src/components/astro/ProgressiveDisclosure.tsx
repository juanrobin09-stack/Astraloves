import { useState } from 'react';
import type { NatalChartData, SubscriptionTier } from '@/types';
import { Button } from '@/components/ui/Button';

export function ProgressiveDisclosure({ chart, tier }: { chart: NatalChartData; tier: SubscriptionTier }) {
  const [level, setLevel] = useState(1);
  const maxLevel = tier === 'free' ? 1 : tier === 'premium' ? 3 : 4;

  return (
    <div className="glass-effect p-6 rounded-large space-y-4">
      <h3 className="text-xl font-display font-bold mb-4">Ton Thème Décodé</h3>
      
      <div className="space-y-3">
        {level >= 1 && (
          <div className="p-4 bg-white/5 rounded-medium">
            <h4 className="font-semibold mb-2">Ton Essence (Soleil/Lune/Asc)</h4>
            <p className="text-sm text-white/80">☀️ {chart.sun.sign} : {getSignDescription(chart.sun.sign)}</p>
            <p className="text-sm text-white/80">🌙 {chart.moon.sign} : {getSignDescription(chart.moon.sign)}</p>
            <p className="text-sm text-white/80">↗️ {chart.ascendant.sign} : {getSignDescription(chart.ascendant.sign)}</p>
          </div>
        )}

        {level >= 2 && (
          <div className="p-4 bg-white/5 rounded-medium">
            <h4 className="font-semibold mb-2">Planètes Personnelles</h4>
            <p className="text-sm text-white/80">Mercure {chart.mercury.sign} : Communication</p>
            <p className="text-sm text-white/80">Vénus {chart.venus.sign} : Amour</p>
            <p className="text-sm text-white/80">Mars {chart.mars.sign} : Action</p>
          </div>
        )}

        {level >= 3 && (
          <div className="p-4 bg-white/5 rounded-medium">
            <h4 className="font-semibold mb-2">Planètes Sociales</h4>
            <p className="text-sm text-white/80">Jupiter {chart.jupiter.sign} : Expansion</p>
            <p className="text-sm text-white/80">Saturne {chart.saturn.sign} : Structure</p>
          </div>
        )}

        {level >= 4 && (
          <div className="p-4 bg-white/5 rounded-medium">
            <h4 className="font-semibold mb-2">Planètes Transcendantes</h4>
            <p className="text-sm text-white/80">Uranus, Neptune, Pluton : Transformations</p>
          </div>
        )}
      </div>

      {level < maxLevel && (
        <Button variant="secondary" onClick={() => setLevel(level + 1)} className="w-full">
          Voir plus
        </Button>
      )}
    </div>
  );
}

function getSignDescription(sign: string) {
  const desc: Record<string, string> = {
    Aries: 'Pionnier', Taurus: 'Ancré', Gemini: 'Curieux', Cancer: 'Protecteur',
    Leo: 'Rayonnant', Virgo: 'Précis', Libra: 'Harmonieux', Scorpio: 'Intense',
    Sagittarius: 'Explorateur', Capricorn: 'Ambitieux', Aquarius: 'Visionnaire', Pisces: 'Empathique'
  };
  return desc[sign] || sign;
}
