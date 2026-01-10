import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLive?: (liveId: string) => void;
}

export default function LiveModal({ isOpen, onClose, onSelectLive }: LiveModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsAnimating(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Mock data - à remplacer par de vraies données
  const mockLives = [
    { id: '1', username: 'Sarah_27', viewers: 234, thumbnail: '👩' },
    { id: '2', username: 'Marc_Dating', viewers: 156, thumbnail: '👨' },
    { id: '3', username: 'LoveCoach_Julie', viewers: 489, thumbnail: '👩' },
  ];

  return (
    <div
      className={`fixed inset-0 z-[100] transition-all duration-400 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onAnimationEnd={handleAnimationEnd}
      onClick={handleBackdropClick}
    >
      {/* Backdrop avec blur */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      {/* Modal content */}
      <div
        className={`absolute inset-x-0 top-0 bg-gradient-to-b from-[#0F1419] to-[#1A1A2E] rounded-b-3xl shadow-2xl transition-transform duration-400 ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-red-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-xl font-bold text-white">Lives en cours</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:rotate-90 transition-all duration-300"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Lives grid */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(85vh - 80px)' }}>
          {mockLives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">📹</div>
              <h3 className="text-xl font-semibold text-white mb-2">Aucun live pour le moment</h3>
              <p className="text-gray-400 text-sm">Revenez plus tard ou lancez votre propre live !</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockLives.map((live, index) => (
                <button
                  key={live.id}
                  onClick={() => {
                    onSelectLive?.(live.id);
                    onClose();
                  }}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 hover:scale-105 active:scale-95 transition-all duration-300"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Thumbnail preview */}
                  <div className="absolute inset-0 flex items-center justify-center text-7xl">
                    {live.thumbnail}
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badge LIVE */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-500 flex items-center gap-1.5 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    <span className="text-xs font-bold text-white">LIVE</span>
                  </div>

                  {/* Viewers count */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                    <span className="text-xs font-semibold text-white">{live.viewers}</span>
                  </div>

                  {/* Username */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-sm font-semibold text-white truncate">{live.username}</p>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 border-2 border-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
