import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

type BannerUploadProps = {
  userId: string;
  currentBanner?: string;
  onBannerChange: (url: string | null) => void;
};

export default function BannerUpload({ userId, currentBanner, onBannerChange }: BannerUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create blob'));
              }
            },
            'image/jpeg',
            0.85
          );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image trop grande (max 10 MB)');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const resizedImage = await resizeImage(file, 1200, 600);

      const fileName = `banners/${Date.now()}.jpg`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, resizedImage, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await supabase
        .from('astra_profiles')
        .update({
          banner_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      onBannerChange(publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Erreur lors de l\'upload de la bannière');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentBanner) return;

    try {
      setUploading(true);

      const urlParts = currentBanner.split('/avatars/');
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        await supabase.storage
          .from('avatars')
          .remove([filePath]);
      }

      await supabase
        .from('astra_profiles')
        .update({
          banner_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      onBannerChange(null);
    } catch (err) {
      console.error('Remove error:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {currentBanner ? (
        <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-red-500/50 group">
          <img
            src={currentBanner}
            alt="Bannière"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Changer
            </button>
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 border-2 border-dashed border-red-500/50 rounded-lg hover:border-red-500 hover:bg-red-500/5 transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50"
        >
          {uploading ? (
            <div className="animate-spin">
              <Upload className="w-8 h-8 text-red-500" />
            </div>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-red-500" />
              <span className="text-white font-medium">Ajouter une bannière</span>
              <span className="text-gray-400 text-xs">Format horizontal recommandé (16:9)</span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="mt-2 text-red-400 text-sm text-center">{error}</p>
      )}

      {uploading && (
        <p className="mt-2 text-red-400 text-sm text-center">Upload en cours...</p>
      )}
    </div>
  );
}
