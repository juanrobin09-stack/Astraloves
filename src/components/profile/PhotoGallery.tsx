import { Plus } from 'lucide-react';

export function PhotoGallery({ photos, isEditing }: any) {
  return (
    <div className="glass-effect p-6 rounded-large">
      <h3 className="font-bold mb-4">Photos ({photos?.length || 0}/6)</h3>
      <div className="grid grid-cols-3 gap-3">
        {(photos || []).map((photo: any, i: number) => (
          <div key={i} className="aspect-square rounded-medium overflow-hidden bg-white/5">
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
        {isEditing && (photos?.length || 0) < 6 && (
          <div className="aspect-square rounded-medium bg-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
            <Plus className="w-8 h-8 text-white/40" />
          </div>
        )}
      </div>
    </div>
  );
}
