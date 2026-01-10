import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const links = [
    { path: '/univers', icon: '🌌', label: 'Univers' },
    { path: '/messages', icon: '💬', label: 'Messages' },
    { path: '/astra', icon: '⭐', label: 'ASTRA' },
    { path: '/astro', icon: '♈', label: 'Astro' },
    { path: '/profile', icon: '👤', label: 'Profil' },
    { path: '/settings', icon: '⚙️', label: 'Paramètres' },
  ];

  return (
    <aside className="w-64 h-screen bg-cosmic-black border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="text-2xl font-display font-bold flex items-center gap-2">
          <span className="animate-cosmic-pulse">⭐</span>
          ASTRA
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-medium
              transition-all duration-200
              ${location.pathname === link.path
                ? 'bg-cosmic-purple/20 text-cosmic-purple'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full px-4 py-3 text-sm text-white/60 hover:text-white
            hover:bg-white/5 rounded-medium transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
