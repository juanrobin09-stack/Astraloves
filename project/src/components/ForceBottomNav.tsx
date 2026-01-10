import { createPortal } from 'react-dom';
import { Heart, MessageCircle, User, Video, Sparkles } from 'lucide-react';

interface ForceBottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function ForceBottomNav({ currentPage, onNavigate }: ForceBottomNavProps) {
  const navItems = [
    { id: 'swipe', icon: Sparkles, label: 'Découvrir', emoji: '✨' },
    { id: 'discovery', icon: Heart, label: 'Matchs', emoji: '💕' },
    { id: 'live-feed', icon: Video, label: 'Live', emoji: '🎥' },
    { id: 'messages', icon: MessageCircle, label: 'Messages', emoji: '💬' },
    { id: 'dashboard', icon: User, label: 'Profil', emoji: '👤' },
  ];

  const navContent = (
    <div
      data-bottom-nav="true"
      id="bottom-navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70px',
        background: 'rgba(26, 26, 26, 0.98)',
        borderTop: '1px solid #2a2a2a',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 999999,
        padding: '8px 0',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: isActive ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 12px',
              color: isActive ? '#ef4444' : '#6b6b6b',
              cursor: 'pointer',
              flex: 1,
              maxWidth: '80px',
              transition: 'all 0.2s'
            }}
          >
            <Icon style={{ width: '24px', height: '24px' }} />
            <span style={{ fontSize: '10px', fontWeight: '600' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );

  // Render directement dans body avec portal
  return createPortal(navContent, document.body);
}
