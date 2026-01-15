import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/config/supabase';
import { toast } from 'react-hot-toast';
import {
  User, Settings, Crown, Edit3, Camera, MapPin,
  Sun, Moon, Sunrise, Sparkles, Heart, Shield, LogOut,
  ChevronRight, Star, Check, Plus, Image as ImageIcon,
  Zap, Eye, Bell, HelpCircle
} from 'lucide-react';

const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
  leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
  sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

const ZODIAC_NAMES_FR: Record<string, string> = {
  aries: 'Bélier', taurus: 'Taureau', gemini: 'Gémeaux', cancer: 'Cancer',
  leo: 'Lion', virgo: 'Vierge', libra: 'Balance', scorpio: 'Scorpion',
  sagittarius: 'Sagittaire', capricorn: 'Capricorne', aquarius: 'Verseau', pisces: 'Poissons',
};

const getZodiacFr = (sign: string) => ZODIAC_NAMES_FR[sign?.toLowerCase()] || sign;

export default function ProfilePage() {
  const { profile, signOut, fetchProfile } = useAuthStore();
  const { tier, isPremium, isElite } = useSubscriptionStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(profile?.bio || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="animate-pulse text-3xl">✨</div>
      </div>
    );
  }

  const zodiacSymbol = ZODIAC_SYMBOLS[profile.sun_sign?.toLowerCase()] || '✨';
  const profileCompletion = calculateCompletion(profile);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await fetchProfile();
      toast.success('Photo mise à jour !');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveBio = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: editedBio })
        .eq('id', profile.id);

      if (error) throw error;

      await fetchProfile();
      setIsEditing(false);
      toast.success('Bio mise à jour !');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="h-full overflow-y-auto bg-black">
      {/* Compact Header */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">Profil</h1>
          <button
            onClick={() => navigate('/subscription')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
              isElite
                ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30'
                : isPremium
                  ? 'bg-cosmic-red/20 text-cosmic-red border border-cosmic-red/30'
                  : 'bg-white/10 text-white/70 border border-white/10'
            }`}
          >
            <Crown className="w-3 h-3" />
            {isElite ? 'Elite' : isPremium ? 'Premium' : 'Gratuit'}
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Profile Card - Compact */}
        <div className="bg-[#1c1c1e] rounded-2xl p-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-20 h-20 rounded-full p-0.5 ${
                isElite ? 'bg-gradient-to-br from-amber-400 to-yellow-500' :
                isPremium ? 'bg-gradient-to-br from-cosmic-red to-pink-500' :
                'bg-white/20'
              }`}>
                <div className="w-full h-full rounded-full bg-[#1c1c1e] p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#2c2c2e] flex items-center justify-center">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.first_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white/30" />
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-cosmic-red rounded-full flex items-center justify-center shadow-lg"
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold truncate">{profile.first_name}</h2>
                <span className="text-lg">{zodiacSymbol}</span>
              </div>
              <p className="text-sm text-white/50 mb-2">
                {getZodiacFr(profile.sun_sign)} • {profile.current_city || 'Localisation non définie'}
              </p>
              {/* Mini Stats */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-pink-500" />
                  <span className="text-xs text-white/60">0 matchs</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-cosmic-red" />
                  <span className="text-xs text-white/60">{profileCompletion}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Completion bar */}
          {profileCompletion < 100 && (
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-white/40">Profil incomplet</span>
                <span className="text-xs text-cosmic-red">{profileCompletion}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompletion}%` }}
                  className="h-full bg-cosmic-red rounded-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Astro Signs - Inline */}
        <div className="bg-[#1c1c1e] rounded-2xl p-3">
          <div className="flex items-center justify-between">
            {[
              { icon: '☀️', label: 'Soleil', value: profile.sun_sign },
              { icon: '🌙', label: 'Lune', value: profile.moon_sign },
              { icon: '↗️', label: 'Ascendant', value: profile.ascendant_sign },
            ].map((item, i) => (
              <div key={item.label} className="flex-1 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-[11px] text-white/40 uppercase tracking-wide">{item.label}</span>
                </div>
                <p className="text-sm font-medium">{getZodiacFr(item.value)}</p>
                {i < 2 && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-6 bg-white/10" />}
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/astro')}
            className="w-full mt-3 py-2 bg-white/5 rounded-xl text-xs text-white/60 hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
          >
            <Star className="w-3 h-3" />
            Voir thème astral complet
          </button>
        </div>

        {/* Bio - Compact */}
        <div className="bg-[#1c1c1e] rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-white/40 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Bio
            </span>
            <button
              onClick={() => isEditing ? handleSaveBio() : setIsEditing(true)}
              className="text-cosmic-red text-xs font-medium flex items-center gap-1"
            >
              {isEditing ? <Check className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
              {isEditing ? 'Sauvegarder' : 'Modifier'}
            </button>
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                placeholder="Décris-toi..."
                className="w-full px-3 py-2 bg-[#2c2c2e] border border-white/10 rounded-xl resize-none text-sm focus:border-cosmic-red focus:outline-none"
                rows={3}
                maxLength={300}
              />
              <div className="flex justify-between">
                <span className="text-[10px] text-white/30">{editedBio.length}/300</span>
                <button
                  onClick={() => { setIsEditing(false); setEditedBio(profile.bio || ''); }}
                  className="text-white/40 text-xs"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/70 leading-relaxed">
              {profile.bio || 'Ajoute une bio pour te présenter...'}
            </p>
          )}
        </div>

        {/* Photos Grid - Compact */}
        <div className="bg-[#1c1c1e] rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-white/40 uppercase tracking-wide flex items-center gap-1.5">
              <ImageIcon className="w-3 h-3" />
              Photos
            </span>
            <span className="text-[10px] text-white/30">
              {profile.photos?.length || 0}/{isPremium ? (isElite ? 20 : 10) : 5}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[...Array(4)].map((_, i) => {
              const photo = profile.photos?.[i];
              return (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-[#2c2c2e] flex items-center justify-center"
                >
                  {photo ? (
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Plus className="w-4 h-4 text-white/20" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Premium CTA */}
        {!isPremium && (
          <motion.button
            onClick={() => navigate('/subscription')}
            className="w-full bg-gradient-to-r from-cosmic-red/20 to-pink-500/20 border border-cosmic-red/30 rounded-2xl p-3 flex items-center gap-3"
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 bg-cosmic-red rounded-xl flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Passe Premium</p>
              <p className="text-xs text-white/50">Débloque toutes les fonctionnalités</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </motion.button>
        )}

        {/* Settings List - iOS Style */}
        <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden divide-y divide-white/5">
          <SettingsRow
            icon={<Crown className="w-4 h-4" />}
            iconBg={isPremium ? 'bg-cosmic-red' : 'bg-amber-500'}
            label="Abonnement"
            value={isElite ? 'Elite' : isPremium ? 'Premium' : 'Gratuit'}
            onClick={() => navigate('/subscription')}
          />
          <SettingsRow
            icon={<Heart className="w-4 h-4" />}
            iconBg="bg-pink-500"
            label="Je recherche"
            value={profile.looking_for?.join(', ') || 'Non défini'}
          />
          <SettingsRow
            icon={<MapPin className="w-4 h-4" />}
            iconBg="bg-blue-500"
            label="Localisation"
            value={profile.current_city || 'Non définie'}
          />
          <SettingsRow
            icon={<Bell className="w-4 h-4" />}
            iconBg="bg-purple-500"
            label="Notifications"
            value="Activées"
          />
        </div>

        {/* More Options */}
        <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden divide-y divide-white/5">
          <SettingsRow
            icon={<Shield className="w-4 h-4" />}
            iconBg="bg-green-500"
            label="Confidentialité"
          />
          <SettingsRow
            icon={<HelpCircle className="w-4 h-4" />}
            iconBg="bg-gray-500"
            label="Aide & Support"
          />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-[#1c1c1e] rounded-2xl p-3 text-red-500 text-sm font-medium flex items-center justify-center gap-2 active:bg-[#2c2c2e]"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>

        {/* Version */}
        <p className="text-center text-[10px] text-white/20 pb-4">
          Astraloves v2.0
        </p>
      </div>
    </div>
  );
}

// Compact Settings Row Component
function SettingsRow({
  icon,
  iconBg,
  label,
  value,
  onClick
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-2.5 flex items-center gap-3 active:bg-white/5 transition-colors"
    >
      <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
        {icon}
      </div>
      <span className="flex-1 text-left text-sm">{label}</span>
      {value && <span className="text-xs text-white/40 mr-1">{value}</span>}
      <ChevronRight className="w-4 h-4 text-white/20" />
    </button>
  );
}

function calculateCompletion(profile: any): number {
  let score = 0;
  if (profile.avatar_url) score += 30;
  if (profile.bio && profile.bio.length > 20) score += 25;
  if (profile.photos?.length >= 3) score += 25;
  if (profile.current_city) score += 10;
  if (profile.looking_for?.length > 0) score += 10;
  return Math.min(score, 100);
}
