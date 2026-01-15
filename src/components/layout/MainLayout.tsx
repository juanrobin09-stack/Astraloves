import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, MessageCircle, Star, Sun, User } from 'lucide-react';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col cosmic-gradient">
      <main className="flex-1 overflow-hidden">{children}</main>

      {/* Navigation bar - visible sur tous les écrans */}
      <nav className="flex-shrink-0 bg-cosmic-bg/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          <NavLink to="/univers" className={({ isActive }) => `flex flex-col items-center gap-1 px-3 ${isActive ? 'text-cosmic-purple' : 'text-white/60'}`}>
            <Sparkles className="w-5 h-5" />
            <span className="text-xs">Univers</span>
          </NavLink>
          <NavLink to="/messages" className={({ isActive }) => `flex flex-col items-center gap-1 px-3 ${isActive ? 'text-cosmic-purple' : 'text-white/60'}`}>
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">Messages</span>
          </NavLink>
          <NavLink to="/astra" className={({ isActive }) => `flex flex-col items-center gap-1 px-3 ${isActive ? 'text-cosmic-purple' : 'text-white/60'}`}>
            <Star className="w-5 h-5" />
            <span className="text-xs">ASTRA</span>
          </NavLink>
          <NavLink to="/astro" className={({ isActive }) => `flex flex-col items-center gap-1 px-3 ${isActive ? 'text-cosmic-purple' : 'text-white/60'}`}>
            <Sun className="w-5 h-5" />
            <span className="text-xs">Astro</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 px-3 ${isActive ? 'text-cosmic-purple' : 'text-white/60'}`}>
            <User className="w-5 h-5" />
            <span className="text-xs">Profil</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
