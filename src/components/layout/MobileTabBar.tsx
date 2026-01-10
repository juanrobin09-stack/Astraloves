import { useLocation, useNavigate } from 'react-router-dom';

export default function MobileTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/univers', icon: '🌌', label: 'Univers' },
    { path: '/messages', icon: '💬', label: 'Messages' },
    { path: '/astra', icon: '⭐', label: 'ASTRA' },
    { path: '/profile', icon: '👤', label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cosmic-black/95 backdrop-blur-xl
      border-t border-white/10 flex justify-around py-2 z-50">
      {tabs.map((tab) => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors
            ${location.pathname === tab.path ? 'text-cosmic-purple' : 'text-white/60'}`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="text-xs font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
