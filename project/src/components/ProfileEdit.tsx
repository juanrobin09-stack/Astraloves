import { useState, useEffect } from 'react';
import { X, Save, User as UserIcon, MapPin, FileText, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { updateAstraMemory } from '../lib/astraMemory';
import { getZodiacSign, calculateAge } from '../lib/zodiacHelper';
import CitySearchInput from './CitySearchInput';
import PhotoUpload from './PhotoUpload';
import BannerUpload from './BannerUpload';

type ProfileEditProps = {
  userId: string;
  onClose: () => void;
  onSave: () => void;
};

export default function ProfileEdit({ userId, onClose, onSave }: ProfileEditProps) {
  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState<number>(18);
  const [gender, setGender] = useState('');
  const [seeking, setSeeking] = useState('');
  const [ageMin, setAgeMin] = useState<number>(18);
  const [ageMax, setAgeMax] = useState<number>(65);
  const [ville, setVille] = useState('');
  const [bio, setBio] = useState('');
  const [preference, setPreference] = useState('');
  const [goal, setGoal] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('astra_profiles')
      .select('first_name, birth_date, age, gender, seeking, age_min, age_max, ville, bio, preference, goal, avatar_url, photos, banner_url')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setFirstName(data.first_name || '');
      setBirthDate(data.birth_date || '');
      setAge(data.age || 18);
      setGender(data.gender || '');
      setSeeking(data.seeking || '');
      setAgeMin(data.age_min || 18);
      setAgeMax(data.age_max || 65);
      setVille(data.ville || '');
      setBio(data.bio || '');
      setPreference(data.preference || 'Femme');
      setAvatarUrl(data.avatar_url || null);
      setPhotoUrl(data.photos && data.photos.length > 0 ? data.photos[0] : null);
      setBannerUrl(data.banner_url || null);

      const predefinedGoals = [
        '💕 Relation sérieuse',
        '🔥 Aventure / fun',
        '❤️ Trouver l\'amour',
        '🤷 Je sais pas encore'
      ];

      if (data.goal && predefinedGoals.includes(data.goal)) {
        setGoal(data.goal);
      } else {
        setGoal(data.goal || '💕 Relation sérieuse');
      }
    }
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(data.publicUrl);

      await supabase
        .from('astra_profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userId);

    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Erreur lors de l\'upload de la photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      alert('Le prénom est requis');
      return;
    }

    if (!birthDate) {
      alert('La date de naissance est requise');
      return;
    }

    const calculatedAge = calculateAge(birthDate);
    if (calculatedAge < 18) {
      alert('Tu dois avoir 18 ans minimum pour utiliser cette application');
      return;
    }

    if (!gender) {
      alert('Merci d\'indiquer ton genre');
      return;
    }

    if (!seeking) {
      alert('Merci d\'indiquer qui tu cherches');
      return;
    }

    setSaving(true);

    try {
      const updateData: any = {
        first_name: firstName.trim(),
        birth_date: birthDate,
        age: calculatedAge,
        gender,
        seeking,
        age_min: ageMin,
        age_max: ageMax,
        ville: ville || null,
        bio: bio || null,
        preference,
        goal,
        profile_updated_at: new Date().toISOString()
      };

      if (birthDate) {
        const zodiac = getZodiacSign(birthDate);
        updateData.sun_sign = zodiac.name;
        updateData.signe_solaire = zodiac.name;
        const calculatedAge = calculateAge(birthDate);
        updateData.age = calculatedAge;
        setAge(calculatedAge);
      }

      if (photoUrl) {
        updateData.photos = [photoUrl];
        updateData.avatar_url = photoUrl;
      }

      if (bannerUrl) {
        updateData.banner_url = bannerUrl;
      }

      const { error: profileError } = await supabase
        .from('astra_profiles')
        .update(updateData)
        .eq('id', userId);

      if (profileError) throw profileError;

      await updateAstraMemory(userId, {
        profile: {
          first_name: firstName.trim(),
          age: calculatedAge,
          gender,
          seeking,
          age_min: ageMin,
          age_max: ageMax,
          preference,
          goal,
          profile_updated_at: new Date().toISOString()
        },
        action_history: [
          {
            action: 'profile_updated',
            date: new Date().toISOString(),
            details: {
              first_name: firstName.trim(),
              age: calculatedAge,
              gender,
              seeking,
              age_min: ageMin,
              age_max: ageMax,
              preference,
              goal
            }
          }
        ]
      });

      console.log('[Profile Edit] Profile and memory updated successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('[Profile Edit] Error saving:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-black border-2 border-red-600 rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-y-auto" style={{ maxHeight: 'calc(90vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))' }}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-red-600 hover:text-red-400 transition-colors z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Fermer"
        >
          <X className="w-6 h-6 sm:w-6 sm:h-6" />
        </button>

        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <UserIcon className="w-8 h-8 sm:w-12 sm:h-12 text-red-600" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 sm:mb-8">
          Modifier mon profil
        </h2>

        {/* SECTION 1 : PHOTO DE PROFIL */}
        <div className="mb-8 pb-8 border-b border-red-600/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Photo de profil</h3>
              <p className="text-gray-400 text-sm">
                Visible sur ta page profil complète et dans les détails
              </p>
            </div>
          </div>

          <div className="bg-black/40 rounded-xl p-4 border border-red-600/20">
            <PhotoUpload
              userId={userId}
              currentPhoto={photoUrl || undefined}
              onPhotoChange={(url) => setPhotoUrl(url)}
            />
            <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm text-center">
                📸 <strong>Format recommandé :</strong> Photo carrée ou portrait
              </p>
              <p className="text-gray-400 text-xs text-center mt-1">
                Cette photo apparaît sur ton profil détaillé
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2 : BANNIÈRE */}
        <div className="mb-8 pb-8 border-b border-red-600/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Bannière de carte</h3>
              <p className="text-gray-400 text-sm">
                S'affiche en haut de ta carte lors du swipe
              </p>
            </div>
          </div>

          <div className="bg-black/40 rounded-xl p-4 border border-red-600/20">
            <BannerUpload
              userId={userId}
              currentBanner={bannerUrl || undefined}
              onBannerChange={(url) => setBannerUrl(url)}
            />
            <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm text-center">
                🖼️ <strong>Format recommandé :</strong> Image horizontale (16:9)
              </p>
              <p className="text-gray-400 text-xs text-center mt-1">
                Cette bannière apparaît uniquement sur les cartes de swipe
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-2 text-base">
              Prénom *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-white/10 border border-red-600/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-red-600"
              placeholder="Alex"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2 flex items-center gap-2 text-base">
              📅 Date de naissance *
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                if (e.target.value) {
                  setAge(calculateAge(e.target.value));
                }
              }}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
              className="w-full bg-white/10 border border-red-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600"
              style={{ colorScheme: 'dark' }}
            />
            {birthDate && (
              <div className="mt-2 text-sm text-red-400">
                {getZodiacSign(birthDate).emoji} {getZodiacSign(birthDate).name} • {age} ans
              </div>
            )}
          </div>

          <div>
            <label className="block text-white font-semibold mb-2 flex items-center gap-2 text-base">
              <MapPin className="w-4 h-4" />
              Ville *
            </label>
            <CitySearchInput
              value={ville}
              onChange={setVille}
              placeholder="Paris, Lyon, Marseille..."
              showGeolocation={false}
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2 flex items-center gap-2 text-base">
              <FileText className="w-4 h-4" />
              Bio (optionnel)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              placeholder="Parle un peu de toi..."
              className="w-full bg-white/10 border border-red-600/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-red-600 min-h-[100px] resize-none"
            />
            <div className="text-xs text-white/60 mt-1 text-right">
              {bio.length}/500 caractères
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-3 text-base">
              Je suis *
            </label>
            <div className="space-y-2">
              {['Un homme', 'Une femme'].map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 p-3 bg-white/5 border border-red-600/20 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    checked={gender === option}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-5 h-5 text-red-600"
                  />
                  <span className="text-white">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-3 text-base">
              Je cherche *
            </label>
            <div className="space-y-2">
              {['Une femme', 'Un homme', 'Les deux'].map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 p-3 bg-white/5 border border-red-600/20 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
                >
                  <input
                    type="radio"
                    name="seeking"
                    value={option}
                    checked={seeking === option}
                    onChange={(e) => setSeeking(e.target.value)}
                    className="w-5 h-5 text-red-600"
                  />
                  <span className="text-white">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-3 text-base">
              Tranche d'âge préférée
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Âge minimum : {ageMin} ans
                </label>
                <input
                  type="range"
                  min="18"
                  max="65"
                  value={ageMin}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setAgeMin(val);
                    if (val > ageMax) setAgeMax(val);
                  }}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Âge maximum : {ageMax} ans
                </label>
                <input
                  type="range"
                  min="18"
                  max="65"
                  value={ageMax}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setAgeMax(val);
                    if (val < ageMin) setAgeMin(val);
                  }}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-3 text-base">
              Mon objectif *
            </label>
            <div className="space-y-2">
              {[
                '💕 Relation sérieuse',
                '🔥 Aventure / fun',
                '❤️ Trouver l\'amour',
                '🤷 Je sais pas encore'
              ].map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 p-3 bg-white/5 border border-red-600/20 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
                >
                  <input
                    type="radio"
                    name="goal"
                    value={option}
                    checked={goal === option}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-5 h-5 text-red-600"
                  />
                  <span className="text-white">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-8 w-full bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-3 px-8 rounded-full hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
}
