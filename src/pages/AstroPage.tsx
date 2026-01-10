import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { NatalWheel } from '@/components/astro/NatalWheel';
import { HoroscopeSection } from '@/components/astro/HoroscopeSection';
import { EnergyGauges } from '@/components/astro/EnergyGauges';
import { TransitsPanel } from '@/components/astro/TransitsPanel';
import { SynastriePreview } from '@/components/astro/SynastriePreview';
import { ProgressiveDisclosure } from '@/components/astro/ProgressiveDisclosure';
import { Sparkles, Lock } from 'lucide-react';

export default function AstroPage() {
  const { profile } = useAuthStore();
  const { tier, isPremium, isElite } = useSubscriptionStore();
  const [selectedSection, setSelectedSection] = useState('overview');

  if (!profile?.natal_chart_data) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-cosmic-purple" />
          <h2 className="text-2xl font-display font-bold mb-2">Thème natal en cours de calcul</h2>
          <p className="text-white/60">Votre carte cosmique sera prête dans quelques instants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto cosmic-gradient">
      {/* Header */}
      <div className="sticky top-0 z-20 glass-effect border-b border-white/10 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-bold mb-1">♈ Votre Thème Natal</h1>
            <p className="text-sm text-white/60">
              {profile.sun_sign} ☀️ {profile.moon_sign} 🌙 {profile.ascendant_sign} ↗️
            </p>
          </div>
          <div className="flex gap-2">
            {['overview', 'horoscope', 'energies', 'transits'].map(section => (
              <button
                key={section}
                onClick={() => setSelectedSection(section)}
                className={`px-4 py-2 rounded-medium text-sm font-medium transition-colors ${
                  selectedSection === section ? 'bg-cosmic-purple text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                {section === 'overview' && 'Vue d\'ensemble'}
                {section === 'horoscope' && 'Horoscope'}
                {section === 'energies' && 'Énergies'}
                {section === 'transits' && 'Transits'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {selectedSection === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div><NatalWheel chart={profile.natal_chart_data} /></div>
            <div><ProgressiveDisclosure chart={profile.natal_chart_data} tier={tier} /></div>
          </div>
        )}

        {selectedSection === 'horoscope' && <HoroscopeSection userId={profile.id} tier={tier} />}

        {selectedSection === 'energies' && (
          <div className="max-w-4xl mx-auto">
            <EnergyGauges 
              fire={profile.energy_fire}
              earth={profile.energy_earth}
              air={profile.energy_air}
              water={profile.energy_water}
            />
          </div>
        )}

        {selectedSection === 'transits' && (
          isPremium ? (
            <TransitsPanel chart={profile.natal_chart_data} />
          ) : (
            <div className="text-center py-16">
              <Lock className="w-16 h-16 mx-auto mb-4 text-white/40" />
              <h3 className="text-xl font-bold mb-2">Transits réservés aux Premium+</h3>
              <p className="text-white/60 mb-6">Découvrez comment les astres actuels influencent votre thème</p>
            </div>
          )
        )}

        {/* Synastrie preview (Elite only) */}
        {isElite && <SynastriePreview userId={profile.id} />}
      </div>
    </div>
  );
}
