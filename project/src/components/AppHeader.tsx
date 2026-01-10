import { Heart } from 'lucide-react';

interface AppHeaderProps {
  onMatchesClick: () => void;
  showMatchesButton?: boolean;
}

export default function AppHeader({ onMatchesClick, showMatchesButton = true }: AppHeaderProps) {
  if (!showMatchesButton) return null;

  return (
    <button
      onClick={onMatchesClick}
      className="fixed flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
      style={{
        top: '16px',
        right: '16px',
        zIndex: 9999,
        background: 'rgba(139, 0, 0, 0.2)',
        border: '1px solid rgba(255, 107, 74, 0.3)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 0 20px rgba(255, 0, 0, 0.3)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(139, 0, 0, 0.4)';
        e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 0, 0, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(139, 0, 0, 0.2)';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.3)';
      }}
    >
      <Heart className="w-5 h-5 text-white" />
      <span className="text-white text-sm font-medium">Matchs</span>
    </button>
  );
}
