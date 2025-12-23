import { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  showHandle?: boolean;
  maxHeight?: string;
}

export default function MobileModal({
  isOpen,
  onClose,
  children,
  title,
  showHandle = true,
  maxHeight = '90vh'
}: MobileModalProps) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const diff = currentY - startY;
    if (diff > 100) {
      onClose();
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  const translateY = isDragging ? Math.max(0, currentY - startY) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full bg-gray-900 rounded-t-3xl overflow-hidden transition-transform"
        style={{
          maxHeight,
          transform: `translateY(${translateY}px)`,
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle pour drag */}
        {showHandle && (
          <div
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-12 h-1.5 bg-gray-700 rounded-full"></div>
          </div>
        )}

        {/* Header avec titre optionnel */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-800 active:scale-95 transition-transform"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Contenu scrollable */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
