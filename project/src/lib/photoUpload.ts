import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  photoURL?: string;
  error?: string;
}

export async function uploadProfilePhoto(userId: string, file: File): Promise<UploadResult> {
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Le fichier doit être une image' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'Image trop grande (max 5 MB)' };
  }

  try {
    const resizedImage = await resizeImage(file, 800, 800);

    const fileName = `profile-photos/${Date.now()}.jpg`;
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
        photos: [publicUrl],
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    return { success: true, photoURL: publicUrl };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { success: false, error: 'Erreur lors de l\'upload de la photo' };
  }
}

export function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
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
          0.9
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function deleteProfilePhoto(userId: string, photoURL: string): Promise<boolean> {
  try {
    const urlParts = photoURL.split('/avatars/');
    if (urlParts.length < 2) return false;

    const filePath = urlParts[1];

    await supabase.storage
      .from('avatars')
      .remove([filePath]);

    await supabase
      .from('astra_profiles')
      .update({
        photos: [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    return true;
  } catch (error) {
    console.error('Delete photo error:', error);
    return false;
  }
}
