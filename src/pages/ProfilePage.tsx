import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/config/supabase';
import { toast } from 'react-hot-toast';
import {
  User, Settings, Crown, Edit3, Camera, MapPin, Calendar,
  Sun, Moon, Sunrise, Sparkles, Heart, Shield, LogOut,
  ChevronRight, Star, Check, X, Plus, Image as ImageIcon
} from 'lucide-react';

const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
  leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
  sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

export default function ProfilePage() {
  const { profile, signOut, fetchProfile } = useAuthStore();
  const { tier, isPremium, isElite } = useSubscriptionStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(profile?.bio || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'settings'>('profile');

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-cosmic-pulse text-4xl">✨</div>
      </div>
    );
  }

  const zodiacSymbol = ZODIAC_SYMBOLS[profile.sun_sign?.toLowerCase()] || '✨';

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

  const profileCompletion = calculateCompletion(profile);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-black via-[#0a0000] to-black">
      {/* Hero Header */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-cosmic-red/20 via-cosmic-red/5 to-transparent" />

        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cosmic-red/50 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 px-6 pt-8 pb-6">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-display font-bold">Mon Profil</h1>
            <button
              onClick={() => setActiveSection(activeSection === 'settings' ? 'profile' : 'settings')}
              className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Card */}
          <div className="relative">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              {/* Avatar with Tier Ring */}
              <div className="relative mb-4">
                <motion.div
                  className={`w-32 h-32 rounded-full p-1 ${
                    isElite ? 'bg-gradient-to-r from-cosmic-gold via-yellow-400 to-cosmic-gold' :
                    isPremium ? 'bg-gradient-to-r from-cosmic-red via-pink-500 to-cosmic-red' :
                    'bg-white/20'
                  }`}
                  animate={isPremium ? { rotate: 360 } : {}}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="w-full h-full rounded-full bg-cosmic-black p-1">
                    <div className="w-full h-full rounded-full overflow-hidden bg-cosmic-surface flex items-center justify-center">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.first_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-white/40" />
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Edit Photo Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-cosmic-red rounded-full flex items-center justify-center shadow-lg hover:bg-cosmic-red-light transition-colors"
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {/* Tier Badge */}
                {isPremium && (
                  <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                    isElite ? 'bg-cosmic-gold' : 'bg-cosmic-red'
                  }`}>
                    <Crown className={`w-4 h-4 ${isElite ? 'text-black' : 'text-white'}`} />
                  </div>
                )}
              </div>

              {/* Name & Sign */}
              <h2 className="text-2xl font-display font-bold mb-1">
                {profile.first_name}
              </h2>
              <p className="text-white/60 flex items-center gap-2 mb-4">
                <span className="text-xl">{zodiacSymbol}</span>
                <span>{profile.sun_sign}</span>
                {isPremium && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isElite ? 'bg-cosmic-gold/20 text-cosmic-gold' : 'bg-cosmic-red/20 text-cosmic-red'
                  }`}>
                    {isElite ? 'ELITE' : 'PREMIUM'}
                  </span>
                )}
              </p>

              {/* Quick Stats */}
              <div className="flex gap-6 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-cosmic-red">0</p>
                  <p className="text-xs text-white/50">Matchs</p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-cosmic-red">0</p>
                  <p className="text-xs text-white/50">Likes</p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-cosmic-red">{profileCompletion}%</p>
                  <p className="text-xs text-white/50">Complet</p>
                </div>
              </div>

              {/* Completion Bar */}
              {profileCompletion < 100 && (
                <div className="w-full max-w-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-white/50">Profil incomplet</span>
                    <span className="text-xs text-cosmic-red font-medium">{profileCompletion}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${profileCompletion}%` }}
                      className="h-full bg-gradient-to-r from-cosmic-red to-cosmic-red-light rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-24">
        <AnimatePresence mode="wait">
          {activeSection === 'profile' ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Bio Section */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cosmic-red" />
                    Bio
                  </h3>
                  <button
                    onClick={() => isEditing ? handleSaveBio() : setIsEditing(true)}
                    className="text-cosmic-red text-sm font-medium flex items-center gap-1"
                  >
                    {isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    {isEditing ? 'Sauvegarder' : 'Modifier'}
                  </button>
                </div>
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      placeholder="Décris-toi en quelques mots..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl resize-none focus:border-cosmic-red focus:outline-none transition-colors"
                      rows={4}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/40">{editedBio.length}/500</span>
                      <button
                        onClick={() => { setIsEditing(false); setEditedBio(profile.bio || ''); }}
                        className="text-white/50 text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/70 leading-relaxed">
                    {profile.bio || 'Ajoute une bio pour te présenter...'}
                  </p>
                )}
              </div>

              {/* Astrology Section */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-cosmic-red" />
                  Profil Astral
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Soleil', value: profile.sun_sign, icon: Sun, color: '#FFD700' },
                    { label: 'Lune', value: profile.moon_sign, icon: Moon, color: '#C4B5FD' },
                    { label: 'Ascendant', value: profile.ascendant_sign, icon: Sunrise, color: '#F97316' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-white/5 rounded-xl p-3 text-center"
                    >
                      <item.icon className="w-5 h-5 mx-auto mb-2" style={{ color: item.color }} />
                      <p className="text-xs text-white/50 mb-1">{item.label}</p>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/astro')}
                  className="w-full mt-4 py-3 bg-cosmic-red/10 border border-cosmic-red/30 text-cosmic-red rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-cosmic-red/20 transition-colors"
                >
                  Voir mon thème complet
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Photos Section */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cosmic-red" />
                    Photos
                  </h3>
                  <span className="text-xs text-white/40">
                    {profile.photos?.length || 0}/{isPremium ? (isElite ? 20 : 10) : 5} photos
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(6)].map((_, i) => {
                    const photo = profile.photos?.[i];
                    return (
                      <div
                        key={i}
                        className="aspect-square rounded-xl overflow-hidden bg-white/5 flex items-center justify-center border border-white/10"
                      >
                        {photo ? (
                          <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Plus className="w-6 h-6 text-white/20" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subscription CTA */}
              {!isPremium && (
                <motion.div
                  className="bg-gradient-to-r from-cosmic-red/20 to-pink-500/20 border border-cosmic-red/30 rounded-2xl p-5"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-cosmic-red rounded-2xl flex items-center justify-center">
                      <Crown className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">Passe Premium</h3>
                      <p className="text-sm text-white/60">Débloque toutes les fonctionnalités</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/40" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Account Settings */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <h3 className="font-bold px-5 py-4 border-b border-white/10">Compte</h3>

                <button
                  onClick={() => navigate('/subscription')}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cosmic-red/20 rounded-xl flex items-center justify-center">
                      <Crown className="w-5 h-5 text-cosmic-red" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Mon Abonnement</p>
                      <p className="text-xs text-white/50">
                        {isElite ? 'Elite' : isPremium ? 'Premium' : 'Gratuit'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </button>

                <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Confidentialité</p>
                      <p className="text-xs text-white/50">Gérer tes données</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </button>
              </div>

              {/* Preferences */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <h3 className="font-bold px-5 py-4 border-b border-white/10">Préférences</h3>

                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-pink-500" />
                    </div>
                    <div>
                      <p className="font-medium">Je recherche</p>
                      <p className="text-xs text-white/50">{profile.looking_for?.join(', ') || 'Non défini'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>

                <div className="px-5 py-4 flex items-center justify-between border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Localisation</p>
                      <p className="text-xs text-white/50">{profile.current_city || 'Non définie'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-4 flex items-center justify-center gap-2 font-medium hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>

              {/* Version */}
              <p className="text-center text-xs text-white/30 pt-4">
                Astraloves v2.0 • Made with ❤️
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
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
