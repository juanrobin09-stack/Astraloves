import { Sparkles, MessageCircle, Star, Moon, User } from 'lucide-react';
import { vibrate } from '../utils/mobileUtils';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  unreadCount?: number;
}

export default function BottomNav({ currentPage, onNavigate, unreadCount = 0 }: BottomNavProps) {
  const navItems = [
    { id: 'univers', icon: Sparkles, label: 'Univers' },
    { id: 'messages', icon: MessageCircle, label: 'Messages', hasNotif: unreadCount > 0 },
    { id: 'chat', icon: Star, label: 'Astra' },
    { id: 'astro', icon: Moon, label: 'Astro' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];

  const handleNavClick = (pageId: string) => {
    vibrate.light();
    onNavigate(pageId);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-xl border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex justify-around items-center h-20 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all active:scale-95 relative min-w-[64px] min-h-[56px] ${
                isActive ? 'text-red-500' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <div className={`relative ${isActive ? 'drop-shadow-[0_0_10px_rgba(220,38,38,0.7)]' : ''}`}>
                <Icon className={`w-7 h-7 transition-transform ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className={`text-xs font-medium leading-tight ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>

              {item.hasNotif && unreadCount > 0 && (
                <div className="absolute top-1 right-1 min-w-[20px] h-[20px] bg-red-600 rounded-full border-2 border-[#0A0A0F] flex items-center justify-center px-1">
                  <span className="text-white text-[10px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
