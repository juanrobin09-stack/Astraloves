import { useState, useRef, useEffect } from 'react';
import { Camera, X, Loader } from 'lucide-react';
import { uploadProfilePhoto, deleteProfilePhoto } from '../lib/photoUpload';
import { getMaxPhotos } from '../lib/premiumRestrictions';
import { supabase } from '../lib/supabase';
import PremiumUpgradeModal from './PremiumUpgradeModal';

interface PhotoUploadProps {
  userId: string;
  currentPhoto?: string;
  onPhotoChange: (photoURL: string | null) => void;
  aspectRatio?: 'profile' | 'banner';
}

export default function PhotoUpload({ userId, currentPhoto, onPhotoChange, aspectRatio = 'profile' }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [premiumTier, setPremiumTier] = useState<'free' | 'premium' | 'premium_elite'>('free');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const maxPhotos = getMaxPhotos(premiumTier);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    const { data } = await supabase
      .from('astra_profiles')
      .select('photos, premium_tier')
      .eq('id', userId)
      .single();

    if (data) {
      setPhotos(data.photos || []);
      setPremiumTier(data.premium_tier || 'free');
    }
  };

  const handleFileSelect = async (file: File, index: number) => {
    if (!file) return;

    if (aspectRatio === 'banner') {
      setError('');
      setUploading(true);

      const result = await uploadProfilePhoto(userId, file);
      setUploading(false);

      if (result.success && result.photoURL) {
        await supabase
          .from('astra_profiles')
          .update({
            banner_url: result.photoURL
          })
          .eq('id', userId);

        onPhotoChange(result.photoURL);
      } else {
        setError(result.error || 'Erreur lors de l\'upload');
      }
      return;
    }

    if (photos.length >= maxPhotos && index >= photos.length) {
      setShowUpgradeModal(true);
      return;
    }

    setError('');
    setUploading(true);

    const result = await uploadProfilePhoto(userId, file);
    setUploading(false);

    if (result.success && result.photoURL) {
      const newPhotos = [...photos];
      if (index < newPhotos.length) {
        newPhotos[index] = result.photoURL;
      } else {
        newPhotos.push(result.photoURL);
      }

      await supabase
        .from('astra_profiles')
        .update({
          photos: newPhotos,
          avatar_url: newPhotos[0]
        })
        .eq('id', userId);

      setPhotos(newPhotos);
      if (index === 0) {
        onPhotoChange(result.photoURL);
      }
    } else {
      setError(result.error || 'Erreur lors de l\'upload');
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Supprimer cette photo ?')) return;

    setUploading(true);
    const photoToDelete = photos[index];
    const success = await deleteProfilePhoto(userId, photoToDelete);
    setUploading(false);

    if (success) {
      const newPhotos = photos.filter((_, i) => i !== index);

      await supabase
        .from('astra_profiles')
        .update({
          photos: newPhotos,
          avatar_url: newPhotos[0] || null
        })
        .eq('id', userId);

      setPhotos(newPhotos);
      if (index === 0) {
        onPhotoChange(newPhotos[0] || null);
      }
    } else {
      setError('Erreur lors de la suppression');
    }
  };

  if (aspectRatio === 'banner') {
    return (
      <div className="w-full">
        <div className="relative w-full max-w-sm mx-auto h-32 rounded-xl overflow-hidden bg-gradient-to-br from-red-600 to-pink-600 shadow-lg">
          {currentPhoto ? (
            <>
              <img
                src={currentPhoto}
                alt="Bannière"
                className="w-full h-full object-cover"
              />
              {!uploading && (
                <button
                  onClick={() => fileInputRefs.current[0]?.click()}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full text-sm font-medium transition backdrop-blur-sm"
                >
                  Modifier
                </button>
              )}
            </>
          ) : (
            <div
              onClick={() => fileInputRefs.current[0]?.click()}
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gradient-to-br hover:from-red-700 hover:to-pink-700 transition"
            >
              <Camera className="w-10 h-10 text-white/70 mb-2" />
              <span className="text-white/80 font-medium text-sm">Ajouter une bannière</span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
              <Loader className="w-8 h-8 animate-spin text-white" />
            </div>
          )}

          <input
            ref={(el) => fileInputRefs.current[0] = el}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 0)}
            className="hidden"
          />
        </div>

        {error && (
          <div className="mt-3 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-5">
      {/* Photo principale */}
      <div className="relative w-52 h-64 mx-auto mb-6 rounded-3xl overflow-hidden bg-gradient-to-br from-red-600 to-pink-600 shadow-2xl">
        {photos[0] ? (
          <>
            <img
              src={photos[0]}
              alt="Photo principale"
              className="w-full h-full object-cover"
            />
            {!uploading && (
              <button
                onClick={() => fileInputRefs.current[0]?.click()}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 hover:bg-black/90 text-white px-5 py-2 rounded-full text-sm font-medium transition backdrop-blur-sm"
              >
                Modifier
              </button>
            )}
          </>
        ) : (
          <div
            onClick={() => fileInputRefs.current[0]?.click()}
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gradient-to-br hover:from-red-700 hover:to-pink-700 transition"
          >
            <Camera className="w-16 h-16 text-white/70 mb-3" />
            <span className="text-white/80 font-medium">Photo principale</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <Loader className="w-8 h-8 animate-spin text-white" />
          </div>
        )}

        <input
          ref={(el) => fileInputRefs.current[0] = el}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 0)}
          className="hidden"
        />
      </div>

      {/* Grille des autres photos */}
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-4">
        {Array.from({ length: maxPhotos - 1 }).map((_, i) => {
          const photoIndex = i + 1;
          const hasPhoto = photos[photoIndex];

          return (
            <div
              key={photoIndex}
              className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border-2 border-dashed border-white/20 hover:border-red-600/50 transition"
            >
              {hasPhoto ? (
                <>
                  <img
                    src={photos[photoIndex]}
                    alt={`Photo ${photoIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleDelete(photoIndex)}
                    disabled={uploading}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div
                  onClick={() => fileInputRefs.current[photoIndex]?.click()}
                  className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/5 transition"
                >
                  <span className="text-4xl text-white/40">+</span>
                </div>
              )}

              <input
                ref={(el) => fileInputRefs.current[photoIndex] = el}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], photoIndex)}
                className="hidden"
              />
            </div>
          );
        })}
      </div>

      {/* Limite selon abonnement */}
      <p className="text-center text-sm text-gray-400">
        {photos.length}/{maxPhotos} photos
        {premiumTier === 'free' && (
          <span className="text-red-400 ml-2">
            • Passe Premium pour 10 photos 💎
          </span>
        )}
        {premiumTier === 'premium' && (
          <span className="text-yellow-400 ml-2">
            • Elite : 20 photos 👑
          </span>
        )}
      </p>

      {error && (
        <div className="mt-3 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Limite de photos atteinte"
        message={`Tu as atteint la limite de ${maxPhotos} photos. Passe Premium pour ajouter plus de photos !`}
        feature={`Premium : 10 photos • Elite : 20 photos`}
        onUpgrade={() => {
          window.location.href = '/subscription';
        }}
      />
    </div>
  );
}
