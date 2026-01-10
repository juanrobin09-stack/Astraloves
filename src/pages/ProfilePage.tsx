import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { CosmicStar } from '@/components/profile/CosmicStar';
import { AuraRing } from '@/components/profile/AuraRing';
import { ProgressCircle } from '@/components/profile/ProgressCircle';
import { EnergySignature } from '@/components/profile/EnergySignature';
import { AstraSpeaks } from '@/components/profile/AstraSpeaks';
import { PhotoGallery } from '@/components/profile/PhotoGallery';
import { Button } from '@/components/ui/Button';
import { Edit, Eye } from 'lucide-react';

export default function ProfilePage() {
  const { profile } = useAuthStore();
  const { tier } = useSubscriptionStore();
  const [isEditing, setIsEditing] = useState(false);

  if (!profile) return null;

  const progression = calculateProgression(profile);

  return (
    <div className="h-full overflow-y-auto cosmic-gradient">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Ton Identité Cosmique</h1>
            <p className="text-white/60">Tu n'es pas un profil. Tu es une constellation.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm"><Eye className="w-4 h-4 mr-2" />Vue publique</Button>
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="w-4 h-4 mr-2" />{isEditing ? 'Sauvegarder' : 'Éditer'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left - Visual */}
          <div className="space-y-6">
            {/* Cosmic Star */}
            <div className="glass-effect p-8 rounded-large relative overflow-hidden flex items-center justify-center h-80">
              <AuraRing tier={tier} />
              <CosmicStar sunSign={profile.sun_sign} moonSign={profile.moon_sign} tier={tier} />
            </div>

            {/* Progression */}
            <div className="glass-effect p-6 rounded-large">
              <h3 className="font-bold mb-4">Progression Cosmique</h3>
              <ProgressCircle value={progression} />
              <p className="text-sm text-white/60 mt-4 text-center">{getProgressionPhase(progression)}</p>
            </div>

            {/* Energy Signature */}
            <EnergySignature
              fire={profile.energy_fire}
              earth={profile.energy_earth}
              air={profile.energy_air}
              water={profile.energy_water}
            />
          </div>

          {/* Right - Info & Photos */}
          <div className="space-y-6">
            {/* ASTRA Speaks */}
            <AstraSpeaks userId={profile.id} />

            {/* Photos */}
            <PhotoGallery photos={profile.photos} isEditing={isEditing} />

            {/* Bio */}
            <div className="glass-effect p-6 rounded-large">
              <h3 className="font-bold mb-3">Bio</h3>
              {isEditing ? (
                <textarea
                  defaultValue={profile.bio || ''}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-medium resize-none"
                  rows={4}
                  placeholder="Dis qui tu es..."
                />
              ) : (
                <p className="text-white/80">{profile.bio || 'Aucune bio pour l\'instant'}</p>
              )}
            </div>

            {/* Astro Signs */}
            <div className="glass-effect p-6 rounded-large">
              <h3 className="font-bold mb-3">Signes Astrologiques</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-white/60">Soleil</span><span>☀️ {profile.sun_sign}</span></div>
                <div className="flex justify-between"><span className="text-white/60">Lune</span><span>🌙 {profile.moon_sign}</span></div>
                <div className="flex justify-between"><span className="text-white/60">Ascendant</span><span>↗️ {profile.ascendant_sign}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateProgression(profile: any): number {
  let score = 0;
  if (profile.avatar_url) score += 25;
  if (profile.bio) score += 25;
  if (profile.photos?.length >= 3) score += 25;
  if (profile.is_profile_complete) score += 25;
  return score;
}

function getProgressionPhase(progression: number): string {
  if (progression < 25) return 'Phase 1 : Éveil';
  if (progression < 50) return 'Phase 2 : Exploration';
  if (progression < 75) return 'Phase 3 : Résonance';
  return 'Phase 4 : Alignement';
}
